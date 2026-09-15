import { createContext, useContext } from 'react';
import { Movie, Sentiment, SentimentLabel } from '../types';
import { ApiError } from '../services/apiClient';

export interface AppContextValue {
  userSentiment: Sentiment | null;
  recommendedMovies: Movie[];
  isLoading: boolean;
  /** Set when the last recommendation fetch failed. `null` on success. */
  error: ApiError | null;
  analyzeSentimentAndGetMovies: (text: string) => Promise<void>;
  setUserSentimentManually: (sentiment: SentimentLabel) => Promise<void>;
  /** Re-run whichever recommendation request last failed. */
  retry: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Lives in its own module (not alongside `AppProvider`) so the provider file
 * exports only components — otherwise React Fast Refresh cannot hot-reload it.
 */
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
