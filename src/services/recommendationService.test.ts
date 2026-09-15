import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Movie, MovieDetail } from '../types';
import { getContentBasedRecommendations } from './recommendationService';
import * as tmdb from './tmdbService';

vi.mock('./tmdbService', () => ({
  getSimilarMovies: vi.fn(),
  getRelatedMovies: vi.fn(),
  getMoviesByGenre: vi.fn(),
  getMovieKeywords: vi.fn(),
}));

const movie = (id: number, title: string, overview: string, genreIds: number[] = [28]): Movie => ({
  id,
  title,
  overview,
  poster_path: null,
  backdrop_path: null,
  release_date: '2020-01-01',
  vote_average: 7,
  genre_ids: genreIds,
});

const reference: MovieDetail = {
  id: 1,
  title: 'Vault Breakers',
  overview: 'A crew of thieves plan an elaborate casino vault heist in Las Vegas.',
  poster_path: null,
  backdrop_path: null,
  release_date: '2019-01-01',
  vote_average: 8,
  genres: [{ id: 80, name: 'Crime' }],
  runtime: 120,
  tagline: null,
  status: 'Released',
};

beforeEach(() => {
  vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([]);
  vi.mocked(tmdb.getRelatedMovies).mockResolvedValue([]);
  vi.mocked(tmdb.getMoviesByGenre).mockResolvedValue([]);
  vi.mocked(tmdb.getMovieKeywords).mockResolvedValue([]);
});

describe('getContentBasedRecommendations', () => {
  it('excludes the reference movie from its own recommendations', async () => {
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
      movie(1, 'Vault Breakers', 'A crew of thieves plan an elaborate casino vault heist.'),
      movie(2, 'Casino Job', 'Thieves plan a casino vault heist in Las Vegas.'),
    ]);

    const results = await getContentBasedRecommendations(reference);
    expect(results.map((entry) => entry.movie.id)).not.toContain(1);
  });

  it('removes duplicates that appear in more than one candidate pool', async () => {
    const shared = movie(2, 'Casino Job', 'Thieves plan a casino vault heist in Las Vegas.');
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([shared]);
    vi.mocked(tmdb.getRelatedMovies).mockResolvedValue([shared]);
    vi.mocked(tmdb.getMoviesByGenre).mockResolvedValue([shared]);

    const ids = (await getContentBasedRecommendations(reference)).map((entry) => entry.movie.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  it('ranks the more textually similar candidate first', async () => {
    // Deliberately supplied in reverse order, so passthrough would fail this.
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
      movie(4, 'Street Race', 'A getaway driver races through Las Vegas at night.', [28]),
      movie(2, 'Casino Job', 'Thieves plan an elaborate casino vault heist in Las Vegas.', [80]),
    ]);

    const results = await getContentBasedRecommendations(reference);
    expect(results).toHaveLength(2);
    expect(results[0].movie.id).toBe(2);
    expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
  });

  /**
   * The discriminating test: all three candidates share the reference film's
   * genre, so genre filtering alone would leave them in arbitrary order. Only a
   * text-similarity pass can rank them by how close their overviews actually are.
   */
  it('ranks by text similarity, not by genre membership', async () => {
    const sameGenre = 80; // every candidate is Crime, like the reference
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
      movie(5, 'Harbour Nights', 'A detective investigates smuggling on the docks.', [sameGenre]),
      movie(4, 'Street Race', 'A getaway driver races through Las Vegas at night.', [sameGenre]),
      movie(2, 'Casino Job', 'Thieves plan an elaborate casino vault heist in Las Vegas.', [sameGenre]),
    ]);

    const results = await getContentBasedRecommendations(reference);

    // "Casino Job" shares thieves/casino/vault/heist/vegas with the reference.
    expect(results[0].movie.id).toBe(2);
    // Strictly descending: a genre-only filter could not produce this ordering.
    const scores = results.map((entry) => entry.similarity);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    expect(scores[0]).toBeGreaterThan(scores[scores.length - 1]);
  });

  it('gives a film maximal similarity to its own text', async () => {
    // Sanity check on the metric itself: identical documents must score highest.
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
      movie(2, reference.title, reference.overview, [80]),
      movie(3, 'Street Race', 'A getaway driver races through Las Vegas at night.', [80]),
    ]);

    const results = await getContentBasedRecommendations(reference);
    expect(results[0].movie.id).toBe(2);
    expect(results[0].similarity).toBeGreaterThan(0.9);
  });

  it('drops candidates with nothing meaningful in common', async () => {
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
      movie(2, 'Casino Job', 'Thieves plan an elaborate casino vault heist in Las Vegas.', [80]),
      movie(3, 'Paris Wedding', 'A florist falls for a pastry chef during a summer wedding.', [10749]),
    ]);

    const ids = (await getContentBasedRecommendations(reference)).map((entry) => entry.movie.id);
    expect(ids).toEqual([2]);
  });

  it('returns similarity scores inside the 0..1 range', async () => {
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
      movie(2, 'Casino Job', 'Thieves plan a casino vault heist in Las Vegas.'),
      movie(3, 'Paris Wedding', 'A florist falls for a pastry chef.', [10749]),
    ]);

    for (const { similarity } of await getContentBasedRecommendations(reference)) {
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic across repeated runs', async () => {
    vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
      movie(2, 'Casino Job', 'Thieves plan a casino vault heist in Las Vegas.'),
      movie(3, 'Bank Run', 'A bank vault heist goes wrong in Las Vegas.'),
      movie(4, 'Paris Wedding', 'A florist falls for a pastry chef.', [10749]),
    ]);

    const first = await getContentBasedRecommendations(reference);
    const second = await getContentBasedRecommendations(reference);
    expect(second.map((e) => [e.movie.id, e.similarity])).toEqual(first.map((e) => [e.movie.id, e.similarity]));
  });

  describe('missing or unusable metadata', () => {
    it('survives candidates with empty overviews', async () => {
      vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
        movie(2, 'Untitled', '', []),
        movie(3, 'Casino Job', 'Thieves plan a casino vault heist in Las Vegas.'),
      ]);

      const results = await getContentBasedRecommendations(reference);
      expect(results.map((entry) => entry.movie.id)).toContain(3);
    });

    it('handles a reference movie with no overview or genres', async () => {
      vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([movie(2, 'Casino Job', 'A heist.')]);
      const bare: MovieDetail = { ...reference, overview: '', genres: [] };
      await expect(getContentBasedRecommendations(bare)).resolves.toEqual([]);
    });

    it('returns an empty list when there are no candidates at all', async () => {
      await expect(getContentBasedRecommendations(reference)).resolves.toEqual([]);
    });
  });

  describe('partial upstream failure', () => {
    it('still ranks using the pools that succeeded', async () => {
      vi.mocked(tmdb.getSimilarMovies).mockRejectedValue(new Error('upstream down'));
      vi.mocked(tmdb.getRelatedMovies).mockResolvedValue([
        movie(2, 'Casino Job', 'Thieves plan a casino vault heist in Las Vegas.'),
      ]);

      const results = await getContentBasedRecommendations(reference);
      expect(results.map((entry) => entry.movie.id)).toEqual([2]);
    });

    it('does not fail when the keyword lookup fails', async () => {
      vi.mocked(tmdb.getMovieKeywords).mockRejectedValue(new Error('keywords unavailable'));
      vi.mocked(tmdb.getSimilarMovies).mockResolvedValue([
        movie(2, 'Casino Job', 'Thieves plan a casino vault heist in Las Vegas.'),
      ]);

      await expect(getContentBasedRecommendations(reference)).resolves.toHaveLength(1);
    });

    it('returns an empty list when every pool fails', async () => {
      const boom = new Error('upstream down');
      vi.mocked(tmdb.getSimilarMovies).mockRejectedValue(boom);
      vi.mocked(tmdb.getRelatedMovies).mockRejectedValue(boom);
      vi.mocked(tmdb.getMoviesByGenre).mockRejectedValue(boom);

      await expect(getContentBasedRecommendations(reference)).resolves.toEqual([]);
    });
  });
});
