import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Movie, Sentiment, SentimentLabel } from '../types';
import { analyzeSentiment } from '../services/sentimentService';
import { getMovieRecommendationsBySentiment } from '../services/tmdbService';

interface AppContextProps {
  userSentiment: Sentiment | null;
  recommendedMovies: Movie[];
  isLoading: boolean;
  analyzeSentimentAndGetMovies: (text: string) => Promise<void>;
  setUserSentimentManually: (sentiment: SentimentLabel) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [userSentiment, setUserSentiment] = useState<Sentiment | null>(null);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const analyzeSentimentAndGetMovies = async (text: string) => {
    try {
      setIsLoading(true);
      
      // Analyze the sentiment
      const sentiment = analyzeSentiment(text);
      setUserSentiment(sentiment);
      
      // Get movie recommendations based on the sentiment
      const movies = await getMovieRecommendationsBySentiment(sentiment.label);
      setRecommendedMovies(movies);
    } catch (error) {
      console.error('Error analyzing sentiment and getting movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserSentimentManually = async (sentimentLabel: SentimentLabel) => {
    try {
      setIsLoading(true);
      
      // Create a sentiment object with the selected label
      const sentiment: Sentiment = {
        label: sentimentLabel,
        score: sentimentLabel === 'neutral' ? 0 : 
               ['happy', 'excited', 'relaxed'].includes(sentimentLabel) ? 0.8 : -0.8,
        confidence: 1.0
      };
      
      setUserSentiment(sentiment);
      
      // Get movie recommendations based on the sentiment
      const movies = await getMovieRecommendationsBySentiment(sentimentLabel);
      setRecommendedMovies(movies);
    } catch (error) {
      console.error('Error setting sentiment manually and getting movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userSentiment,
        recommendedMovies,
        isLoading,
        analyzeSentimentAndGetMovies,
        setUserSentimentManually,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};