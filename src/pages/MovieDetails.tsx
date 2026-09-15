import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Star } from 'lucide-react';
import { MovieDetail } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../utils/constants';
import { getMovieDetails } from '../services/tmdbService';
import { ApiError, toApiError } from '../services/apiClient';
import MoviePoster from '../components/MoviePoster';
import StatusMessage from '../components/StatusMessage';
import SimilarMovies from '../components/SimilarMovies';

/**
 * Movie detail page.
 *
 * Loads from the `:id` route parameter rather than router state, so `/movie/550`
 * works on refresh, from a shared link and in a new tab. Navigation from a card
 * goes through the same fetch path.
 */
const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const movieId = Number(id);
  const isValidId = Boolean(id) && Number.isInteger(movieId) && movieId > 0;

  const load = useCallback(async () => {
    if (!isValidId) {
      setError(new ApiError('not_found', 'Invalid movie id.'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setMovie(await getMovieDetails(movieId));
    } catch (caught) {
      setMovie(null);
      setError(toApiError(caught));
    } finally {
      setLoading(false);
    }
  }, [isValidId, movieId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Return to the top on a new film, otherwise deep links land mid-page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [movieId]);

  // `navigate(-1)` leaves the app when the page was opened directly.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const backButton = (
    <button
      type="button"
      onClick={goBack}
      className="pressable inline-flex items-center gap-2 rounded-lg border border-line bg-surface/80 px-3 py-2 text-sm font-medium text-ink-muted shadow-control backdrop-blur hover:border-line-strong hover:text-ink"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back
    </button>
  );

  if (loading) {
    return (
      <div className="container-page py-10" role="status" aria-label="Loading film">
        <div className="skeleton mb-8 h-9 w-24 rounded-lg" />
        <div className="grid gap-8 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <div className="skeleton aspect-[2/3] w-full rounded-panel" />
          <div className="space-y-4">
            <div className="skeleton h-10 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-8 w-2/3 rounded-full" />
            <div className="skeleton h-28 w-full rounded-card" />
          </div>
        </div>
        <span className="sr-only">Loading film</span>
      </div>
    );
  }

  if (error || !movie) {
    const notFound = error?.kind === 'not_found';
    return (
      <div className="container-page py-10">
        {backButton}
        <StatusMessage
          variant={notFound ? 'empty' : 'error'}
          title={notFound ? 'Film not found' : "We couldn't load this film"}
          description={
            notFound
              ? "That film doesn't exist on TMDB, or the link is out of date."
              : (error?.userMessage ?? 'Please try again.')
          }
          onRetry={notFound ? undefined : () => void load()}
        />
      </div>
    );
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating = Number.isFinite(movie.vote_average) ? movie.vote_average : 0;
  const genres = movie.genres?.map((genre) => genre.name) ?? [];

  return (
    <article>
      {/*
        Cinematic plate. Sized in vh so it scales with the viewport, masked at
        the bottom so the image dissolves into the page rather than stopping.

        `isolate` is load-bearing: it creates a stacking context so the `-z-10`
        plate sits behind the content but still in front of the page background.
        Without it the plate renders behind <body> and is invisible.
      */}
      <div className="relative isolate -mt-[8.25rem] pt-[8.25rem] md:-mt-[5.5rem] md:pt-[5.5rem]">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[42vh] min-h-[260px] overflow-hidden sm:h-[58vh]">
          {movie.backdrop_path && (
            <img
              src={`${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}`}
              alt=""
              className="mask-fade-b h-full w-full scale-105 object-cover object-center opacity-[0.8] blur-[1px]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/70 to-canvas/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas/85 via-transparent to-canvas/55" />
          {/* Matching key light, so detail pages share the hero's lighting. */}
          <div className="ambient-light -right-20 -top-28 h-[28rem] w-[28rem] bg-accent/[0.18]" />
        </div>

        <div className="container-page pt-6">
          {backButton}

          <div className="mt-6 grid gap-6 sm:mt-10 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[minmax(0,268px)_minmax(0,1fr)] lg:gap-12">
            {/* Poster is capped on mobile so it never eats the whole screen. */}
            <div className="w-32 shrink-0 [perspective:900px] sm:w-auto">
              {/* Physical depth: the poster sits forward of the backdrop plate. */}
              <div className="poster-edge overflow-hidden rounded-panel shadow-depth-shadow transition-depth duration-base ease-out hover:-translate-y-1.5 motion-reduce:hover:translate-y-0">
                <MoviePoster
                  path={movie.poster_path}
                  title={movie.title}
                  size="w500"
                  sizes="(min-width: 1024px) 268px, (min-width: 640px) 180px, 128px"
                  priority
                />
              </div>
            </div>

            <div className="min-w-0 max-w-prose">
              <h1 className="text-title text-balance text-ink">{movie.title}</h1>
              {movie.tagline && (
                <p className="mt-2 text-lede italic text-ink-faint">{movie.tagline}</p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {rating > 0 && (
                  <span className="chip border-accent/25 bg-accent-soft text-accent">
                    <Star size={12} className="fill-accent" aria-hidden="true" />
                    <span className="font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-accent/60">/ 10</span>
                  </span>
                )}
                {releaseYear && <span className="chip tabular-nums">{releaseYear}</span>}
                {movie.runtime ? (
                  <span className="chip">
                    <Clock size={12} aria-hidden="true" />
                    {movie.runtime} min
                  </span>
                ) : null}
                {genres.map((genre) => (
                  <span key={genre} className="chip">
                    {genre}
                  </span>
                ))}
              </div>

              {/* Editorial, not a boxed widget — the synopsis is the content. */}
              <div className="mt-7">
                <h2 className="eyebrow mb-2">Overview</h2>
                <p className="text-lede leading-relaxed text-ink-muted">
                  {movie.overview || 'No overview is available for this title.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page pb-16 sm:pb-24">
        <SimilarMovies movie={movie} />
      </div>
    </article>
  );
};

export default MovieDetails;
