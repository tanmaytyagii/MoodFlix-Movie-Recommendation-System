import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Movie } from '../types';
import { useAppContext } from '../context/useAppContext';
import { searchMovies, getTrendingMovies } from '../services/tmdbService';
import { ApiError, toApiError } from '../services/apiClient';
import MovieGrid from './MovieGrid';
import MovieGridSkeleton from './MovieGridSkeleton';
import StatusMessage from './StatusMessage';
import SectionHeading from './SectionHeading';
import RatingFilter from './RatingFilter';

const SEARCH_DEBOUNCE_MS = 400;

type Mode = 'search' | 'recommendations' | 'trending';

const MovieList: React.FC = () => {
  const { recommendedMovies, userSentiment, isLoading, error, retry, searchQuery } = useAppContext();

  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<ApiError | null>(null);

  const [trending, setTrending] = useState<Movie[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState<ApiError | null>(null);

  const [minRating, setMinRating] = useState(0);

  const trimmedQuery = searchQuery.trim();
  // Keyed off the presence of a mood rather than the length of the results
  // array, so a failed recommendation fetch shows its error instead of silently
  // falling through to trending.
  const mode: Mode = trimmedQuery ? 'search' : userSentiment ? 'recommendations' : 'trending';

  useEffect(() => {
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchMovies(trimmedQuery);
        if (cancelled) return;
        setSearchResults(results);
        setSearchError(null);
      } catch (caught) {
        if (cancelled) return;
        setSearchResults([]);
        setSearchError(toApiError(caught));
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  const loadTrending = useCallback(async () => {
    setTrendingLoading(true);
    setTrendingError(null);
    try {
      setTrending(await getTrendingMovies());
    } catch (caught) {
      setTrending([]);
      setTrendingError(toApiError(caught));
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  // Fetch trending at most once per mount.
  const trendingRequested = useRef(false);
  useEffect(() => {
    if (mode !== 'trending' || trendingRequested.current) return;
    trendingRequested.current = true;
    void loadTrending();
  }, [mode, loadTrending]);

  const retryTrending = useCallback(() => {
    trendingRequested.current = true;
    void loadTrending();
  }, [loadTrending]);

  const source: Record<Mode, { movies: Movie[]; loading: boolean; failure: ApiError | null }> = {
    search: { movies: searchResults, loading: searchLoading, failure: searchError },
    recommendations: { movies: recommendedMovies, loading: isLoading, failure: error },
    trending: { movies: trending, loading: trendingLoading, failure: trendingError },
  };
  const { movies, loading, failure } = source[mode];

  const filteredMovies = movies.filter(
    (movie) => minRating === 0 || movie.vote_average >= minRating,
  );

  const heading =
    mode === 'search'
      ? `Results for “${trimmedQuery}”`
      : mode === 'recommendations'
        ? 'Recommended films'
        : 'Trending this week';

  const eyebrow =
    mode === 'search'
      ? 'Search'
      : mode === 'recommendations' && userSentiment
        ? `${userSentiment.label} mood`
        : 'Popular now';

  const retryHandler =
    mode === 'search' ? undefined : mode === 'recommendations' ? () => void retry() : retryTrending;

  const renderBody = () => {
    if (loading) return <MovieGridSkeleton />;

    if (failure) {
      return (
        <StatusMessage
          variant="error"
          title="We couldn't load these films"
          description={failure.userMessage}
          onRetry={retryHandler}
        />
      );
    }

    if (filteredMovies.length === 0) {
      const filteredOut = movies.length > 0;
      return (
        <StatusMessage
          variant="empty"
          title={filteredOut ? 'Nothing above that rating' : 'No films found'}
          description={
            filteredOut
              ? `None of these ${movies.length} films scored ${minRating.toFixed(1)} or higher.`
              : mode === 'search'
                ? 'Try a different title or spelling.'
                : 'Try a different mood to see other films.'
          }
          onRetry={filteredOut ? () => setMinRating(0) : undefined}
          retryLabel="Clear rating filter"
        />
      );
    }

    return <MovieGrid movies={filteredMovies} />;
  };

  const showFilter = !loading && !failure && movies.length > 0;

  return (
    <section aria-labelledby="movie-list-heading">
      <SectionHeading
        id="movie-list-heading"
        eyebrow={eyebrow}
        title={heading}
        action={showFilter ? <RatingFilter value={minRating} onChange={setMinRating} /> : undefined}
      />

      <p className="mt-3 text-meta text-ink-faint" aria-live="polite">
        {loading || failure
          ? ' '
          : `${filteredMovies.length} ${filteredMovies.length === 1 ? 'film' : 'films'}${
              minRating > 0 ? ` rated ${minRating.toFixed(1)}+` : ''
            }`}
      </p>

      <div className="mt-6">{renderBody()}</div>
    </section>
  );
};

export default MovieList;
