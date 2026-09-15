import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { Movie, Sentiment, SentimentLabel } from '../types';
import { classifyMood } from '../services/moodService';
import { manualSentiment } from '../services/sentimentService';
import { getMovieRecommendationsBySentiment } from '../services/tmdbService';
import { ApiError, toApiError } from '../services/apiClient';
import { AppContext, AppContextValue } from './useAppContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userSentiment, setUserSentiment] = useState<Sentiment | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /** The last request, replayed by `retry()` after a failure. */
  const lastRequest = useRef<(() => Promise<void>) | null>(null);

  const loadFor = useCallback(async (sentiment: Sentiment) => {
    setIsLoading(true);
    setError(null);
    setUserSentiment(sentiment);

    try {
      const movies = await getMovieRecommendationsBySentiment(sentiment.label);
      setRecommendedMovies(movies);
    } catch (caught) {
      // Keep the detected mood on screen — only the movie fetch failed, and
      // clearing the results would hide that distinction from the user.
      setError(toApiError(caught));
      setRecommendedMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeSentimentAndGetMovies = useCallback(
    async (text: string) => {
      const run = async () => {
        const sentiment = await classifyMood(text);
        await loadFor(sentiment);
      };
      lastRequest.current = run;
      await run();
    },
    [loadFor],
  );

  const setUserSentimentManually = useCallback(
    async (label: SentimentLabel) => {
      const run = () => loadFor(manualSentiment(label));
      lastRequest.current = run;
      await run();
    },
    [loadFor],
  );

  const retry = useCallback(async () => {
    await lastRequest.current?.();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      userSentiment,
      recommendedMovies,
      isLoading,
      error,
      analyzeSentimentAndGetMovies,
      setUserSentimentManually,
      retry,
      searchQuery,
      setSearchQuery,
    }),
    [
      userSentiment,
      recommendedMovies,
      isLoading,
      error,
      analyzeSentimentAndGetMovies,
      setUserSentimentManually,
      retry,
      searchQuery,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
