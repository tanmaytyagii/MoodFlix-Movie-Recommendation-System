// The `.js` extension is required, not optional. package.json sets
// "type": "module", so Vercel's Node runtime loads these compiled functions as
// strict ESM, where relative specifiers must carry an explicit extension.
// TypeScript resolves `./_shared.js` back to `_shared.ts`. Omitting it compiles
// and type-checks cleanly, then fails at module load in production with
// ERR_MODULE_NOT_FOUND -> FUNCTION_INVOCATION_FAILED.
import { createHandler, jsonError, ProxyResult } from './_shared.js';

/**
 * Server-side TMDB proxy.
 *
 *   Browser → /api/tmdb?path=/discover/movie&with_genres=35 → TMDB
 *
 * The TMDB read token lives only in `process.env.TMDB_TOKEN` and never reaches
 * the client bundle. The browser addresses TMDB endpoints through the `path`
 * query parameter, which is validated against an allowlist below.
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const UPSTREAM_TIMEOUT_MS = 8000;

/**
 * Endpoints the client is permitted to reach. Anchored patterns, so `path`
 * cannot be used to point the proxy at an arbitrary host or TMDB write route.
 */
const ALLOWED_PATHS: RegExp[] = [
  /^\/trending\/movie\/(day|week)$/,
  /^\/movie\/(popular|top_rated|now_playing|upcoming)$/,
  /^\/search\/movie$/,
  /^\/discover\/movie$/,
  /^\/movie\/\d+$/,
  /^\/movie\/\d+\/(recommendations|similar|keywords)$/,
  /^\/genre\/movie\/list$/,
];

/**
 * Query parameters forwarded upstream. Anything else is dropped rather than
 * passed through, so the proxy cannot be driven into unexpected TMDB behaviour.
 */
const ALLOWED_PARAMS = new Set([
  'query',
  'page',
  'with_genres',
  'sort_by',
  'vote_average.gte',
  'vote_count.gte',
  'primary_release_date.gte',
  'primary_release_date.lte',
  'language',
  'region',
]);

const isAllowedPath = (path: string): boolean => ALLOWED_PATHS.some((pattern) => pattern.test(path));

export const handleTmdbRequest = async (url: URL): Promise<ProxyResult> => {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    return jsonError(
      503,
      'TMDB is not configured on the server. Set TMDB_TOKEN in the environment.',
      'not_configured',
    );
  }

  const path = url.searchParams.get('path');
  if (!path) {
    return jsonError(400, 'Missing required "path" parameter.', 'missing_path');
  }
  if (!isAllowedPath(path)) {
    return jsonError(400, 'Requested TMDB path is not allowed.', 'path_not_allowed');
  }

  const upstream = new URL(TMDB_BASE_URL + path);
  upstream.searchParams.set('include_adult', 'false');
  upstream.searchParams.set('language', 'en-US');
  for (const [key, value] of url.searchParams) {
    if (ALLOWED_PARAMS.has(key)) upstream.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(upstream, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return aborted
      ? jsonError(504, 'TMDB did not respond in time.', 'upstream_timeout')
      : jsonError(502, 'Could not reach TMDB.', 'upstream_unreachable');
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.text();

  if (!response.ok) {
    // Pass through the meaningful status but not TMDB's body, which echoes
    // request details we would rather not expose.
    if (response.status === 404) return jsonError(404, 'Not found on TMDB.', 'not_found');
    if (response.status === 401 || response.status === 403) {
      return jsonError(502, 'TMDB rejected the server credential.', 'upstream_auth_failed');
    }
    if (response.status === 429) return jsonError(429, 'Rate limited by TMDB.', 'rate_limited');
    return jsonError(502, 'TMDB returned an error.', 'upstream_error');
  }

  return {
    status: 200,
    body,
    // TMDB catalogue data changes slowly; let the CDN absorb repeat traffic.
    cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  };
};

export default createHandler(handleTmdbRequest);
