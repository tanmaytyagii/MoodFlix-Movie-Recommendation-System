import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { TMDB_IMAGE_BASE_URL, GENRE_MAP } from '../utils/constants';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();
  
  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';
    
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'Unknown';
    
  const rating = movie.vote_average ? (movie.vote_average / 10) * 5 : 0;
  
  const genres = movie.genre_ids
    .slice(0, 2)
    .map(id => GENRE_MAP[id] || '')
    .filter(genre => genre !== '');

  const handleViewDetails = () => {
    navigate(`/movie/${movie.id}`, { state: { movie } });
  };

  return (
    <motion.div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="relative overflow-hidden">
        <img 
          src={posterUrl} 
          alt={`${movie.title} poster`}
          className="w-full h-64 sm:h-80 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-0 right-0 bg-yellow-500 text-gray-900 px-2 py-1 m-2 rounded font-bold text-sm flex items-center">
          <Star size={14} className="mr-1" /> {rating.toFixed(1)}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{movie.title}</h3>
        
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <Calendar size={14} className="mr-1" /> {releaseYear}
          {genres.length > 0 && (
            <span className="ml-2 flex-grow">• {genres.join(', ')}</span>
          )}
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{movie.overview}</p>
        
        <button 
          onClick={handleViewDetails}
          className="mt-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
        >
          <Info size={16} className="mr-2" /> View Details
        </button>
      </div>
    </motion.div>
  );
};

export default MovieCard;