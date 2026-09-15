import { Movie, MovieDetail, SentimentLabel } from '../types';
import { SENTIMENT_GENRE_MAP, TMDB_PROXY_BASE_URL } from '../utils/constants';
import { ApiError, createApiClient, toApiError } from './apiClient';

/**
 * TMDB access layer.
 *
 * Every call goes through our own `/api/tmdb` proxy, which holds the read token
 * server-side — there is no TMDB credential in this bundle. Failures throw a
 * typed `ApiError` rather than returning `[]`, so callers can tell an empty
 * result set apart from an outage.
 */

const client = createApiClient(TMDB_PROXY_BASE_URL);

interface PagedResponse<T> {
  results?: T[];
  page?: number;
  total_pages?: number;
}

/** TMDB occasionally returns partial records; drop anything unusable. */
const isUsableMovie = (movie: Movie): boolean =>
  typeof movie?.id === 'number' && typeof movie?.title === 'string' && movie.title.length > 0;

const get = async <T>(path: string, params: Record<string, string | number> = {}): Promise<T> => {
  try {
    const response = await client.get<T>('', { params: { path, ...params } });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
};

const getList = async (path: string, params: Record<string, string | number> = {}): Promise<Movie[]> => {
  const data = await get<PagedResponse<Movie>>(path, params);
  return (data.results ?? []).filter(isUsableMovie);
};

export const getTrendingMovies = (): Promise<Movie[]> => getList('/trending/movie/day');

export const searchMovies = (query: string): Promise<Movie[]> => {
  const trimmed = query.trim();
  if (!trimmed) return Promise.resolve([]);
  return getList('/search/movie', { query: trimmed });
};

export const getMoviesByGenre = (genreId: number): Promise<Movie[]> =>
  getList('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc' });

/**
 * Discover movies for a mood.
 *
 * `neutral` has no genre mapping by design — when we cannot read a mood we show
 * what is trending instead of inventing a preference.
 */
export const getMovieRecommendationsBySentiment = (sentiment: SentimentLabel): Promise<Movie[]> => {
  const genreIds = SENTIMENT_GENRE_MAP[sentiment];
  if (!genreIds || genreIds.length === 0) return getTrendingMovies();

  return getList('/discover/movie', {
    with_genres: genreIds.join('|'), // OR — a film need only match one mood genre
    sort_by: 'popularity.desc',
    'vote_count.gte': 150, // filters out obscure entries with a single 10/10 vote
  });
};

/** Full details for one movie. Throws `ApiError` with kind `not_found` for unknown IDs. */
export const getMovieDetails = (id: number): Promise<MovieDetail> => get<MovieDetail>(`/movie/${id}`);

/** TMDB's own "similar" and "recommendations" lists, used as the candidate pool. */
export const getSimilarMovies = (id: number): Promise<Movie[]> => getList(`/movie/${id}/similar`);

export const getRelatedMovies = (id: number): Promise<Movie[]> => getList(`/movie/${id}/recommendations`);

interface KeywordsResponse {
  keywords?: { id: number; name: string }[];
}

export const getMovieKeywords = async (id: number): Promise<string[]> => {
  const data = await get<KeywordsResponse>(`/movie/${id}/keywords`);
  return (data.keywords ?? []).map((keyword) => keyword.name);
};

export { ApiError };
