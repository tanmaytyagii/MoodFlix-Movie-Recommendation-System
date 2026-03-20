import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, Film, Heart, ArrowLeft } from 'lucide-react';
import { Movie } from '../types';
import { GENRE_MAP } from '../utils/constants';
import { TMDB_IMAGE_BASE_URL } from '../utils/constants';

const MovieDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie as Movie;

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : null;
  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : 'Unknown';
  const rating = (movie.vote_average / 10) * 5;
  const genres = movie.genre_ids.map(id => GENRE_MAP[id] || '').filter(genre => genre !== '');

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-16">
      {backdropUrl && (
        <div 
          className="absolute top-0 left-0 w-full h-[60vh] z-0 opacity-20"
          style={{
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
          }}
        />
      )}

      <div className="container mx-auto px-4 relative z-10">
        <motion.button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Movies
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              className="w-full rounded-lg shadow-xl"
            />
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                <Calendar size={16} className="text-yellow-500 mr-2" />
                <span className="text-gray-300">{releaseYear}</span>
              </div>
              <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                <Star size={16} className="text-yellow-500 mr-2" />
                <span className="text-gray-300">{rating.toFixed(1)} / 5</span>
              </div>
              <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full">
                <Film size={16} className="text-yellow-500 mr-2" />
                <span className="text-gray-300">{genres.join(', ')}</span>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recommended For</h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white"
                  >
                    <Heart size={14} className="mr-2" />
                    {genre} fans
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;