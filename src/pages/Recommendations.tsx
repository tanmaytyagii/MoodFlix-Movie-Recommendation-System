import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MovieList from '../components/MovieList';
import { useAppContext } from '../context/AppContext';
import { SENTIMENT_DESCRIPTIONS, SENTIMENT_EMOJIS } from '../utils/constants';

const Recommendations: React.FC = () => {
  const { userSentiment, recommendedMovies, searchQuery } = useAppContext();
  const navigate = useNavigate();
  
  // Redirect to home if no recommendations and no search query
  useEffect(() => {
    if (!userSentiment && recommendedMovies.length === 0 && !searchQuery) {
      navigate('/');
    }
  }, [userSentiment, recommendedMovies, navigate, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4 py-8">
        {userSentiment && !searchQuery && (
          <motion.div 
            className="mb-10 bg-gray-800 rounded-xl p-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">{SENTIMENT_EMOJIS[userSentiment.label]}</span>
              <h2 className="text-2xl font-bold text-white">
                {userSentiment.label.charAt(0).toUpperCase() + userSentiment.label.slice(1)} Mood
              </h2>
            </div>
            <p className="text-gray-300 text-center">
              {SENTIMENT_DESCRIPTIONS[userSentiment.label]} Here are some movies that might match your current mood.
            </p>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
              >
                Change Mood
              </button>
            </div>
          </motion.div>
        )}
        
        <MovieList />
      </div>
    </div>
  );
};

export default Recommendations;