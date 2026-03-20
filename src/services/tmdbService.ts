import axios from 'axios';
import { Movie, SentimentLabel } from '../types';
import { TMDB_ACCESS_TOKEN, TMDB_BASE_URL, SENTIMENT_GENRE_MAP } from '../utils/constants';

// Create axios instance for TMDB API
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// Get trending movies
export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/trending/movie/day');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

// Get movie details by ID
export const getMovieDetails = async (id: number): Promise<Movie | null> => {
  try {
    const response = await tmdbApi.get(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    return null;
  }
};

// Search movies by query
export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

// Get movie recommendations based on sentiment
export const getMovieRecommendationsBySentiment = async (sentiment: SentimentLabel): Promise<Movie[]> => {
  try {
    // Get genre IDs associated with the sentiment
    const genreIds = SENTIMENT_GENRE_MAP[sentiment];
    
    if (!genreIds || genreIds.length === 0) {
      return await getTrendingMovies();
    }
    
    // Create a comma-separated string of genre IDs
    const genreParam = genreIds.join(',');
    
    // Fetch movies that match these genres
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreParam,
        sort_by: 'popularity.desc',
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movies by sentiment:', error);
    return [];
  }
};

// Get popular movies by genre
export const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreId}:`, error);
    return [];
  }
};