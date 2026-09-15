import { Movie, MovieDetail, ScoredMovie } from '../types';
import { GENRE_MAP } from '../utils/constants';
import { buildTfIdfModel, cosineSimilarity, tokenize, vectorize } from '../lib/tfidf';
import {
  getMovieKeywords,
  getMoviesByGenre,
  getRelatedMovies,
  getSimilarMovies,
} from './tmdbService';

/**
 * Content-based "More Like This".
 *
 * Distinct from mood-based discovery (see `tmdbService.getMovieRecommendations-
 * BySentiment`), which maps a *feeling* to genres. This one maps a *movie* to
 * other movies by textual metadata similarity:
 *
 *   candidate pool → TF-IDF over overview + genres + keywords → cosine → rank
 *
 * TMDB's own `/similar` and `/recommendations` supply the candidate pool; the
 * TF-IDF pass re-ranks them against the reference film's actual text, which is
 * what makes this a content-based recommender rather than a passthrough.
 */

const MAX_RESULTS = 12;
/** Below this, "similar" is not a claim worth making. */
const MIN_SIMILARITY = 0.02;

const genreNames = (ids: number[]): string[] =>
  ids.map((id) => GENRE_MAP[id]).filter((name): name is string => Boolean(name));

/**
 * Build the text document for a movie. Genres are repeated so that sharing a
 * genre counts for more than sharing an incidental synopsis word.
 */
const buildDocument = (title: string, overview: string, genres: string[], keywords: string[]): string =>
  [title, overview, ...genres, ...genres, ...keywords].join(' ');

const candidateDocument = (movie: Movie): string =>
  buildDocument(movie.title, movie.overview ?? '', genreNames(movie.genre_ids ?? []), []);

/** Dedupe by TMDB id, preserving first-seen order, and drop the reference film. */
const uniqueCandidates = (pools: Movie[][], excludeId: number): Movie[] => {
  const seen = new Set<number>([excludeId]);
  const result: Movie[] = [];

  for (const pool of pools) {
    for (const movie of pool) {
      if (seen.has(movie.id)) continue;
      seen.add(movie.id);
      result.push(movie);
    }
  }

  return result;
};

/**
 * Settled results only: a failing candidate source should degrade the pool, not
 * fail the whole section. If every source fails we return an empty list and the
 * UI simply omits the section.
 */
const settledMovies = async (promises: Promise<Movie[]>[]): Promise<Movie[][]> => {
  const settled = await Promise.allSettled(promises);
  return settled.map((entry) => (entry.status === 'fulfilled' ? entry.value : []));
};

export const getContentBasedRecommendations = async (
  movie: MovieDetail,
): Promise<ScoredMovie[]> => {
  const referenceGenres = movie.genres?.map((genre) => genre.name) ?? [];
  const primaryGenreId = movie.genres?.[0]?.id;

  const [pools, keywords] = await Promise.all([
    settledMovies([
      getSimilarMovies(movie.id),
      getRelatedMovies(movie.id),
      ...(primaryGenreId ? [getMoviesByGenre(primaryGenreId)] : []),
    ]),
    // Keywords sharpen the vectors but are not worth failing over.
    getMovieKeywords(movie.id).catch((): string[] => []),
  ]);

  const candidates = uniqueCandidates(pools, movie.id);
  if (candidates.length === 0) return [];

  const referenceTokens = tokenize(
    buildDocument(movie.title, movie.overview ?? '', referenceGenres, keywords),
  );
  const candidateTokens = candidates.map((candidate) => tokenize(candidateDocument(candidate)));

  // Fit IDF on the reference plus every candidate so weights reflect this pool.
  const model = buildTfIdfModel([referenceTokens, ...candidateTokens]);
  const referenceVector = vectorize(model, referenceTokens);

  return candidates
    .map((candidate, index) => ({
      movie: candidate,
      similarity: cosineSimilarity(referenceVector, vectorize(model, candidateTokens[index])),
    }))
    .filter((scored) => scored.similarity >= MIN_SIMILARITY)
    // Deterministic: equal scores fall back to TMDB id so ordering never drifts.
    .sort((a, b) => b.similarity - a.similarity || a.movie.id - b.movie.id)
    .slice(0, MAX_RESULTS);
};
