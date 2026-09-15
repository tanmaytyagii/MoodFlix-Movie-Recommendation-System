import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Movie } from '../types';
import { GENRE_MAP } from '../utils/constants';
import { useTilt } from '../hooks/useTilt';
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
  // Flat on touch devices and under prefers-reduced-motion — see useTilt.
  const tiltRef = useTilt<HTMLAnchorElement>({ max: 3 });

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
      ref={tiltRef}
      to={`/movie/${movie.id}`}
      className="scene group block rounded-card focus-visible:ring-offset-4"
      aria-label={`${movie.title}${releaseYear ? `, ${releaseYear}` : ''} — view details`}
    >
      <div className="tilt rounded-card">
        {/* preserve-3d so the badges can sit forward of the poster plane. */}
        <div className="relative [transform-style:preserve-3d]">
          <div className="poster-edge relative overflow-hidden rounded-card bg-surface shadow-card transition-depth duration-base ease-out group-hover:shadow-poster">
            <MoviePoster
              path={movie.poster_path}
              title={movie.title}
              size="w500"
              sizes={CARD_SIZES}
              priority={priority}
              className="transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />

            {/* Specular sweep: reads as light catching a physical poster. */}
            <div
              aria-hidden="true"
              className="sheen pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100"
            />

            {/* Permanent base scrim: keeps the badges legible on pale posters. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent"
            />

            {/* Synopsis on hover — supplementary detail, desktop pointers only. */}
            {movie.overview && (
              <div
                aria-hidden="true"
                /* pb clears the rating badge, which sits forward of this layer
                   and would otherwise overlap the last line of the synopsis. */
                className="pointer-events-none absolute inset-0 hidden flex-col justify-end bg-gradient-to-t from-black/95 via-black/75 to-black/10 p-3 pb-10 opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100 md:flex"
              >
                <p className="line-clamp-5 text-meta leading-relaxed text-ink-muted">
                  {movie.overview}
                </p>
              </div>
            )}
          </div>

          {/*
           * Badges live outside the clipping container: `overflow-hidden`
           * flattens a 3D subtree, which would cancel their translateZ.
           */}
          {rating > 0 && (
            <span className="layer-raise-sm pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-meta font-semibold text-ink shadow-control backdrop-blur-sm">
              <Star size={11} className="fill-accent text-accent" aria-hidden="true" />
              {rating.toFixed(1)}
            </span>
          )}

          {rank !== undefined && (
            /*
             * Rank, not raw similarity. TF-IDF cosine over short synopses lands
             * around 0.05-0.2, and "7% match" reads as a broken score while
             * implying a probability the number does not carry.
             */
            <span className="layer-raise-sm pointer-events-none absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md bg-black/75 text-micro font-bold tabular-nums text-ink shadow-control backdrop-blur-sm">
              {rank}
              <span className="sr-only">{`Ranked ${rank} by similarity`}</span>
            </span>
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
      </div>
    </Link>
  );
};

export default MovieCard;
