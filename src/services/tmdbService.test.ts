import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './apiClient';
import {
  getMovieDetails,
  getMovieRecommendationsBySentiment,
  getTrendingMovies,
  searchMovies,
} from './tmdbService';

// Stub only `axios.create`, so the real `axios.isAxiosError` still runs inside
// `toApiError` — that is the behaviour under test.
const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: { ...actual.default, create: () => ({ get: mocks.get }) } };
});

/** Shaped like a real axios rejection so `axios.isAxiosError` accepts it. */
const axiosFailure = (overrides: Record<string, unknown>) =>
  Object.assign(new Error('request failed'), { isAxiosError: true, ...overrides });

const movie = { id: 1, title: 'Heat', overview: 'A heist.', genre_ids: [80], vote_average: 8 };

beforeEach(() => {
  mocks.get.mockReset();
});

describe('successful responses', () => {
  it('returns the results array', async () => {
    mocks.get.mockResolvedValue({ data: { results: [movie] } });
    await expect(getTrendingMovies()).resolves.toEqual([movie]);
  });

  it('sends the endpoint as a "path" parameter to the proxy', async () => {
    mocks.get.mockResolvedValue({ data: { results: [] } });
    await getTrendingMovies();
    expect(mocks.get).toHaveBeenCalledWith('', { params: { path: '/trending/movie/day' } });
  });

  it('requests the mood genres joined as an OR filter', async () => {
    mocks.get.mockResolvedValue({ data: { results: [] } });
    await getMovieRecommendationsBySentiment('fearful');
    expect(mocks.get).toHaveBeenCalledWith('', {
      params: expect.objectContaining({ path: '/discover/movie', with_genres: '27|53|9648' }),
    });
  });

  it('falls back to trending for the neutral mood', async () => {
    mocks.get.mockResolvedValue({ data: { results: [] } });
    await getMovieRecommendationsBySentiment('neutral');
    expect(mocks.get).toHaveBeenCalledWith('', { params: { path: '/trending/movie/day' } });
  });

  it('discards malformed records rather than rendering blank cards', async () => {
    mocks.get.mockResolvedValue({ data: { results: [movie, { id: 2 }, { title: 'No id' }] } });
    await expect(getTrendingMovies()).resolves.toEqual([movie]);
  });
});

describe('empty responses', () => {
  it('returns an empty array when the API reports no results', async () => {
    mocks.get.mockResolvedValue({ data: { results: [] } });
    await expect(getTrendingMovies()).resolves.toEqual([]);
  });

  it('tolerates a response with no results field at all', async () => {
    mocks.get.mockResolvedValue({ data: {} });
    await expect(getTrendingMovies()).resolves.toEqual([]);
  });

  it('short-circuits a blank search without calling the API', async () => {
    await expect(searchMovies('   ')).resolves.toEqual([]);
    expect(mocks.get).not.toHaveBeenCalled();
  });
});

describe('failures', () => {
  /**
   * The central regression: these used to be swallowed and returned as `[]`,
   * so an outage was indistinguishable from "no movies matched".
   */
  it('throws instead of returning an empty array', async () => {
    mocks.get.mockRejectedValue(axiosFailure({ response: { status: 500, data: {} } }));
    await expect(getTrendingMovies()).rejects.toBeInstanceOf(ApiError);
  });

  it.each([
    ['network failure', { response: undefined }, 'network'],
    ['timeout', { code: 'ECONNABORTED' }, 'timeout'],
    ['not found', { response: { status: 404, data: {} } }, 'not_found'],
    ['rate limit', { response: { status: 429, data: {} } }, 'rate_limited'],
    ['server error', { response: { status: 500, data: {} } }, 'server'],
    ['unconfigured server', { response: { status: 503, data: {} } }, 'not_configured'],
  ])('classifies %s as "%s"', async (_name, overrides, expectedKind) => {
    mocks.get.mockRejectedValue(axiosFailure(overrides));
    await expect(getTrendingMovies()).rejects.toMatchObject({ kind: expectedKind });
  });

  it('prefers the error code the proxy reports over the raw status', async () => {
    mocks.get.mockRejectedValue(
      axiosFailure({ response: { status: 400, data: { error: { code: 'path_not_allowed' } } } }),
    );
    await expect(getTrendingMovies()).rejects.toMatchObject({ kind: 'invalid_request' });
  });

  it('surfaces a user-safe message that leaks no request detail', async () => {
    mocks.get.mockRejectedValue(axiosFailure({ response: undefined }));
    const error = await getTrendingMovies().catch((caught: ApiError) => caught);
    expect((error as ApiError).userMessage).toBe(
      'Could not reach MoodFlix. Check your connection and try again.',
    );
  });

  it('reports an unknown movie id as not found', async () => {
    mocks.get.mockRejectedValue(axiosFailure({ response: { status: 404, data: {} } }));
    await expect(getMovieDetails(999999999)).rejects.toMatchObject({ kind: 'not_found' });
  });
});
