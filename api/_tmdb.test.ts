import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleTmdbRequest } from './tmdb';

/**
 * Underscore-prefixed on purpose: Vercel exposes every non-underscore file in
 * `api/` as a Serverless Function. Without the prefix this file would deploy as
 * `/api/tmdb.test`, and since it has no default export that function's build
 * fails — taking the whole deployment with it.
 */

const request = (query: string) => new URL(`http://localhost/api/tmdb${query}`);

const okResponse = (payload: unknown) =>
  ({ ok: true, status: 200, text: async () => JSON.stringify(payload) }) as unknown as Response;

const errorResponse = (status: number) =>
  ({ ok: false, status, text: async () => '{"status_message":"internal detail"}' }) as unknown as Response;

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('TMDB_TOKEN', 'test-token');
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(okResponse({ results: [] }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

/** The URL the handler actually called upstream. */
const calledUrl = (): URL => new URL(String(fetchMock.mock.calls[0][0]));

describe('configuration', () => {
  it('reports 503 when no token is configured, without attempting a request', async () => {
    vi.stubEnv('TMDB_TOKEN', '');
    const result = await handleTmdbRequest(request('?path=/trending/movie/day'));
    expect(result.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('path validation', () => {
  it.each([
    '/trending/movie/day',
    '/search/movie',
    '/discover/movie',
    '/movie/550',
    '/movie/550/similar',
    '/movie/550/recommendations',
    '/movie/550/keywords',
  ])('allows %s', async (path) => {
    const result = await handleTmdbRequest(request(`?path=${encodeURIComponent(path)}`));
    expect(result.status).toBe(200);
  });

  /**
   * The allowlist is what stops `path` being used to steer the authenticated
   * proxy at arbitrary endpoints or hosts.
   */
  it.each([
    ['an absolute URL', 'https://evil.example.com/steal'],
    ['a protocol-relative URL', '//evil.example.com/steal'],
    ['path traversal', '/movie/550/../../account'],
    ['an account endpoint', '/account'],
    ['an unlisted endpoint', '/authentication/token/new'],
    ['a non-numeric movie id', '/movie/abc'],
    ['an unlisted subresource', '/movie/550/credits'],
    ['a trailing-segment escape', '/discover/movie/extra'],
  ])('rejects %s', async (_name, path) => {
    const result = await handleTmdbRequest(request(`?path=${encodeURIComponent(path)}`));
    expect(result.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a request with no path at all', async () => {
    expect((await handleTmdbRequest(request(''))).status).toBe(400);
  });
});

describe('parameter handling', () => {
  it('forwards allowlisted parameters', async () => {
    await handleTmdbRequest(request('?path=/discover/movie&with_genres=27%7C53&sort_by=popularity.desc'));
    expect(calledUrl().searchParams.get('with_genres')).toBe('27|53');
    expect(calledUrl().searchParams.get('sort_by')).toBe('popularity.desc');
  });

  it('drops parameters that are not on the allowlist', async () => {
    await handleTmdbRequest(request('?path=/discover/movie&api_key=leak&callback=evil'));
    expect(calledUrl().searchParams.has('api_key')).toBe(false);
    expect(calledUrl().searchParams.has('callback')).toBe(false);
  });

  it('always pins include_adult to false', async () => {
    await handleTmdbRequest(request('?path=/discover/movie&include_adult=true'));
    expect(calledUrl().searchParams.get('include_adult')).toBe('false');
  });

  it('sends the credential as a bearer header, never in the URL', async () => {
    await handleTmdbRequest(request('?path=/trending/movie/day'));
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
    expect(calledUrl().toString()).not.toContain('test-token');
  });
});

describe('upstream failures', () => {
  it.each([
    [404, 404],
    [429, 429],
    [401, 502],
    [500, 502],
  ])('maps upstream %i to %i', async (upstream, expected) => {
    fetchMock.mockResolvedValue(errorResponse(upstream));
    const result = await handleTmdbRequest(request('?path=/movie/550'));
    expect(result.status).toBe(expected);
  });

  it('does not pass TMDB error bodies through to the client', async () => {
    fetchMock.mockResolvedValue(errorResponse(500));
    const result = await handleTmdbRequest(request('?path=/movie/550'));
    expect(result.body).not.toContain('internal detail');
  });

  it('reports a timeout as 504', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    expect((await handleTmdbRequest(request('?path=/movie/550'))).status).toBe(504);
  });

  it('reports an unreachable upstream as 502', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    expect((await handleTmdbRequest(request('?path=/movie/550'))).status).toBe(502);
  });

  it('never includes the token in an error body', async () => {
    fetchMock.mockRejectedValue(new Error('connect failed for Bearer test-token'));
    const result = await handleTmdbRequest(request('?path=/movie/550'));
    expect(result.body).not.toContain('test-token');
  });
});

describe('successful responses', () => {
  it('passes the payload through and marks it cacheable', async () => {
    fetchMock.mockResolvedValue(okResponse({ results: [{ id: 1 }] }));
    const result = await handleTmdbRequest(request('?path=/trending/movie/day'));
    expect(JSON.parse(result.body)).toEqual({ results: [{ id: 1 }] });
    expect(result.cacheControl).toContain('s-maxage');
  });
});
