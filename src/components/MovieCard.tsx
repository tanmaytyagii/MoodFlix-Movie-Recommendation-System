import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie } from '../types';
import { GENRE_MAP } from '../utils/constants';
import MoviePoster from './MoviePoster';

interface MovieCardProps {
  movie: Movie;
  /** 1-based similarity rank, shown only in the "More like this" rail. */
  rank?: number;
  /** Set on the first row so above-the-fold posters are not lazy-loaded. */
  priority?: boolean;
}

/** Roughly how wide a card renders at each breakpoint, for responsive images. */
const CARD_SIZES = '(min-width: 1280px) 15vw, (min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw';

const MovieCard: React.FC<MovieCardProps> = ({ movie, rank, priority = false }) => {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating = Number.isFinite(movie.vote_average) ? movie.vote_average : 0;

  const genre = (movie.genre_ids ?? [])
    .map((id) => GENRE_MAP[id])
    .find((name): name is string => Boolean(name));

  return (
    /*
     * The whole card is one link rather than a button calling navigate(): it
     * keeps middle-click, open-in-new-tab and keyboard activation, and gives
     * assistive tech a single labelled target.
     *
     * Title, year and rating stay visible at all times. Hover only adds the
     * synopsis — it never hides anything the card needs.
     */
    <Link
      to={`/movie/${movie.id}`}
      className="group block rounded-card focus-visible:ring-offset-4"
      aria-label={`${movie.title}${releaseYear ? `, ${releaseYear}` : ''} — view details`}
    >
      <div className="relative overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line transition-[transform,box-shadow] duration-base ease-out group-hover:-translate-y-1 group-hover:shadow-lift group-focus-visible:-translate-y-1">
        <MoviePoster
          path={movie.poster_path}
          title={movie.title}
          size="w500"
          sizes={CARD_SIZES}
          priority={priority}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Permanent base scrim: keeps the badges legible on pale posters. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent"
        />

        {rating > 0 && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-meta font-semibold text-ink backdrop-blur-sm">
            <Star size={11} className="fill-accent text-accent" aria-hidden="true" />
            {rating.toFixed(1)}
          </span>
        )}

        {rank !== undefined && (
          /*
           * Rank, not raw similarity. TF-IDF cosine over short synopses lands
           * around 0.05-0.2, and "7% match" reads as a broken score while
           * implying a probability the number does not carry. Position in the
           * ranking is the signal that is actually meaningful.
           */
          <span className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md bg-black/70 text-micro font-bold tabular-nums text-ink backdrop-blur-sm">
            {rank}
            <span className="sr-only">{`Ranked ${rank} by similarity`}</span>
          </span>
        )}

        {/* Synopsis on hover — supplementary detail, desktop pointers only. */}
        {movie.overview && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden flex-col justify-end bg-gradient-to-t from-black/95 via-black/75 to-black/10 p-3 opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100 md:flex"
          >
            <p className="line-clamp-5 text-meta leading-relaxed text-ink-muted">{movie.overview}</p>
          </div>
        )}
      </div>

      <div className="px-0.5 pt-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors duration-fast group-hover:text-accent">
          {movie.title}
        </h3>
        <p className="mt-1 truncate text-meta text-ink-faint">
          {releaseYear ?? 'TBA'}
          {genre && <span className="text-ink-faint/60"> · {genre}</span>}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
