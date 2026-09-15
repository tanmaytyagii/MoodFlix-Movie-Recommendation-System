import React from 'react';
import { motion } from 'framer-motion';
import { Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';
import { GENRE_MAP } from '../utils/constants';
import MoviePoster from './MoviePoster';

interface MovieCardProps {
  movie: Movie;
  /** Cosine similarity, shown only in the content-based "More Like This" rail. */
  similarity?: number;
}

/** TMDB rates out of 10; MoodFlix displays a 5-star scale. */
const toFiveStars = (voteAverage: number): number =>
  Number.isFinite(voteAverage) ? (voteAverage / 10) * 5 : 0;

const MovieCard: React.FC<MovieCardProps> = ({ movie, similarity }) => {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating = toFiveStars(movie.vote_average);

  const genres = (movie.genre_ids ?? [])
    .slice(0, 2)
    .map((id) => GENRE_MAP[id])
    .filter((genre): genre is string => Boolean(genre));

  return (
    <motion.div
      className="flex h-full flex-col overflow-hidden rounded-lg bg-gray-800 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      {/*
        The whole card is one link rather than a button calling navigate(): it
        restores middle-click, open-in-new-tab and keyboard activation, and gives
        screen readers a single labelled target instead of an image plus a
        detached "View Details" button.
      */}
      <Link
        to={`/movie/${movie.id}`}
        className="group flex h-full flex-col rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        aria-label={`${movie.title}${releaseYear ? `, ${releaseYear}` : ''} — view details`}
      >
        <div className="relative">
          <MoviePoster path={movie.poster_path} title={movie.title} size="w500" />
          {rating > 0 && (
            <div className="absolute right-0 top-0 m-2 flex items-center rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-gray-900">
              <Star size={14} className="mr-1" aria-hidden="true" />
              {rating.toFixed(1)}
            </div>
          )}
          {similarity !== undefined && (
            <div className="absolute bottom-0 left-0 m-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-gray-100">
              {Math.round(similarity * 100)}% match
            </div>
          )}
        </div>

        <div className="flex flex-grow flex-col p-4">
          <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-white group-hover:text-yellow-400">
            {movie.title}
          </h3>

          <div className="mb-2 flex items-center text-sm text-gray-400">
            <Calendar size={14} className="mr-1" aria-hidden="true" />
            {releaseYear ?? 'Release date unknown'}
            {genres.length > 0 && <span className="ml-2 flex-grow">• {genres.join(', ')}</span>}
          </div>

          <p className="line-clamp-3 text-sm text-gray-300">
            {movie.overview || 'No overview available for this title.'}
          </p>

          <span className="mt-auto pt-4 text-sm font-medium text-blue-400 group-hover:text-blue-300">
            View details →
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
