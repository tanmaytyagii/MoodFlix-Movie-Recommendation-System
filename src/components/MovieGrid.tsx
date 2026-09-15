import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  /** Number the cards by position, for similarity-ranked rails. */
  ranked?: boolean;
}

/**
 * The single poster grid used by every listing surface, so column counts and
 * gutters cannot drift apart between pages.
 */
const MovieGrid: React.FC<MovieGridProps> = ({ movies, ranked = false }) => (
  <ul className="rise-in grid grid-cols-2 gap-x-4 gap-y-7 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6">
    {movies.map((movie, index) => (
      <li key={movie.id}>
        <MovieCard
          movie={movie}
          rank={ranked ? index + 1 : undefined}
          // First row is above the fold on most viewports.
          priority={index < 6}
        />
      </li>
    ))}
  </ul>
);

export default MovieGrid;
