import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader } from 'lucide-react';
import MovieCard from './MovieCard';
import StatusMessage from './StatusMessage';
import { Movie } from '../types';
import { useAppContext } from '../context/useAppContext';
import { searchMovies, getTrendingMovies } from '../services/tmdbService';
import { ApiError, toApiError } from '../services/apiClient';

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

  const [showFilter, setShowFilter] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const filterId = useId();
  const filterPanelId = useId();

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

  // Fetch trending at most once. The previous version refetched whenever the
  // search-results array was replaced with a new empty array.
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
    (movie) => filterRating === 0 || (movie.vote_average / 10) * 5 >= filterRating,
  );

  const heading =
    mode === 'search'
      ? `Search results for "${trimmedQuery}"`
      : mode === 'recommendations' && userSentiment
        ? `Recommended for your ${userSentiment.label} mood`
        : 'Trending movies';

  const retryHandler =
    mode === 'search' ? undefined : mode === 'recommendations' ? () => void retry() : retryTrending;

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12" role="status">
          <Loader size={32} className="animate-spin text-yellow-500" aria-hidden="true" />
          <span className="ml-3 text-xl text-gray-300">Loading movies…</span>
        </div>
      );
    }

    if (failure) {
      return (
        <StatusMessage
          variant="error"
          title="We couldn't load these movies"
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
          title={filteredOut ? 'No movies match that rating' : 'No movies found'}
          description={
            filteredOut
              ? 'Lower the minimum rating to see more results.'
              : mode === 'search'
                ? 'Try a different search term.'
                : 'Try selecting a different mood.'
          }
          onRetry={filteredOut ? () => setFilterRating(0) : undefined}
          retryLabel="Reset filter"
        />
      );
    }

    return (
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-center justify-between sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-white">{heading}</h2>
          <p className="mt-1 text-gray-400" aria-live="polite">
            {loading || failure
              ? ' '
              : `${filteredMovies.length} ${filteredMovies.length === 1 ? 'movie' : 'movies'} found`}
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowFilter((open) => !open)}
            aria-expanded={showFilter}
            aria-controls={filterPanelId}
            className="flex items-center rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <Filter size={16} className="mr-2" aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>

      <div id={filterPanelId} hidden={!showFilter} className="mb-6 rounded-lg bg-gray-800 p-4">
        <label htmlFor={filterId} className="mb-3 block font-medium text-white">
          Minimum rating
        </label>
        <div className="flex items-center">
          <input
            id={filterId}
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filterRating}
            onChange={(event) => setFilterRating(Number.parseFloat(event.target.value))}
            className="w-full max-w-xs"
          />
          <span className="ml-3 text-white">
            {filterRating > 0 ? `${filterRating}+ stars` : 'All ratings'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFilterRating(0)}
          className="mt-4 rounded bg-gray-700 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        >
          Reset
        </button>
      </div>

      {renderBody()}
    </div>
  );
};

export default MovieList;
