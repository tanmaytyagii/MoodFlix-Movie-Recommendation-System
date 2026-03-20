import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import { Movie } from '../types';
import { useAppContext } from '../context/AppContext';
import { searchMovies, getTrendingMovies } from '../services/tmdbService';
import { Filter, Loader } from 'lucide-react';

const MovieList: React.FC = () => {
  const { recommendedMovies, userSentiment, isLoading, searchQuery } = useAppContext();
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    // Handle search query
    const handleSearch = async () => {
      if (searchQuery.trim()) {
        setSearchLoading(true);
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
        setSearchLoading(false);
      } else {
        setSearchResults([]);
      }
    };

    const searchTimer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  useEffect(() => {
    // Determine which movies to display
    if (searchQuery && searchResults.length > 0) {
      setDisplayedMovies(searchResults);
    } else if (recommendedMovies.length > 0) {
      setDisplayedMovies(recommendedMovies);
    } else {
      // Load trending movies if no recommendations available
      const loadTrendingMovies = async () => {
        const trending = await getTrendingMovies();
        setDisplayedMovies(trending);
      };
      loadTrendingMovies();
    }
  }, [recommendedMovies, searchResults, searchQuery]);

  // Apply filters
  const filteredMovies = displayedMovies.filter(movie => {
    if (filterRating > 0) {
      const rating = (movie.vote_average / 10) * 5;
      return rating >= filterRating;
    }
    return true;
  });

  // Empty state when no movies found
  if ((!isLoading && !searchLoading) && filteredMovies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-gray-300 mb-4">No movies found</h3>
        <p className="text-gray-400">
          {searchQuery ? 'Try a different search term' : 'Try selecting a different mood'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {searchQuery ? (
              `Search Results for "${searchQuery}"`
            ) : userSentiment ? (
              `Recommended for your ${userSentiment.label} mood`
            ) : (
              'Trending Movies'
            )}
          </h2>
          <p className="text-gray-400 mt-1">
            {filteredMovies.length} movies found
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>
      </div>
      
      {showFilter && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gray-800 p-4 rounded-lg mb-6"
        >
          <h3 className="text-white font-medium mb-3">Filter by Rating</h3>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filterRating}
              onChange={(e) => setFilterRating(parseFloat(e.target.value))}
              className="w-full max-w-xs"
            />
            <span className="ml-3 text-white">{filterRating > 0 ? `${filterRating}+ stars` : 'All ratings'}</span>
          </div>
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => setFilterRating(0)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
            >
              Reset
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Loading state */}
      {(isLoading || searchLoading) ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={32} className="text-yellow-500 animate-spin" />
          <span className="ml-3 text-xl text-gray-300">Loading movies...</span>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MovieList;