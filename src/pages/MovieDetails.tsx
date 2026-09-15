import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Film, Loader, Star } from 'lucide-react';
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
 * Loads from the `:id` route parameter rather than from `location.state`. The
 * previous version read only router state, so `/movie/550` showed "Movie not
 * found" on refresh, on a shared link, or in a new tab — every deep link was
 * broken. Navigation from a card still works; it now just goes through the same
 * fetch path as everything else.
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

  // `navigate(-1)` lands outside the app when the page was opened directly, so
  // fall back to the home route when there is no in-app history to return to.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const backButton = (
    <motion.button
      type="button"
      onClick={goBack}
      className="mb-6 inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
      Back to movies
    </motion.button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pb-16 pt-24">
        <div className="container mx-auto flex items-center justify-center px-4 py-24" role="status">
          <Loader size={32} className="animate-spin text-yellow-500" aria-hidden="true" />
          <span className="ml-3 text-xl text-gray-300">Loading movie…</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    const notFound = error?.kind === 'not_found';
    return (
      <div className="min-h-screen bg-gray-900 pb-16 pt-24">
        <div className="container mx-auto px-4">
          {backButton}
          <StatusMessage
            variant={notFound ? 'empty' : 'error'}
            title={notFound ? 'Movie not found' : "We couldn't load this movie"}
            description={
              notFound
                ? "That movie doesn't exist on TMDB, or the link is out of date."
                : (error?.userMessage ?? 'Please try again.')
            }
            onRetry={notFound ? undefined : () => void load()}
          />
        </div>
      </div>
    );
  }

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating = Number.isFinite(movie.vote_average) ? (movie.vote_average / 10) * 5 : 0;
  const genres = movie.genres?.map((genre) => genre.name) ?? [];

  return (
    <div className="relative min-h-screen bg-gray-900 pb-16 pt-24">
      {movie.backdrop_path && (
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 z-0 h-[60vh] w-full opacity-20"
          style={{
            backgroundImage: `url(${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          }}
        />
      )}

      <div className="container relative z-10 mx-auto px-4">
        {backButton}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MoviePoster
              path={movie.poster_path}
              title={movie.title}
              size="w780"
              className="rounded-lg shadow-xl"
            />
          </motion.div>

          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="mb-2 text-4xl font-bold text-white">{movie.title}</h1>
            {movie.tagline && <p className="mb-4 text-lg italic text-gray-400">{movie.tagline}</p>}

            <div className="mb-6 flex flex-wrap gap-3">
              {releaseYear && (
                <span className="flex items-center rounded-full bg-gray-800 px-3 py-1">
                  <Calendar size={16} className="mr-2 text-yellow-500" aria-hidden="true" />
                  <span className="text-gray-300">{releaseYear}</span>
                </span>
              )}
              {rating > 0 && (
                <span className="flex items-center rounded-full bg-gray-800 px-3 py-1">
                  <Star size={16} className="mr-2 text-yellow-500" aria-hidden="true" />
                  <span className="text-gray-300">{rating.toFixed(1)} / 5</span>
                </span>
              )}
              {movie.runtime ? (
                <span className="flex items-center rounded-full bg-gray-800 px-3 py-1">
                  <Clock size={16} className="mr-2 text-yellow-500" aria-hidden="true" />
                  <span className="text-gray-300">{movie.runtime} min</span>
                </span>
              ) : null}
              {genres.length > 0 && (
                <span className="flex items-center rounded-full bg-gray-800 px-3 py-1">
                  <Film size={16} className="mr-2 text-yellow-500" aria-hidden="true" />
                  <span className="text-gray-300">{genres.join(', ')}</span>
                </span>
              )}
            </div>

            <div className="rounded-lg bg-gray-800 p-6">
              <h2 className="mb-3 text-xl font-semibold text-white">Overview</h2>
              <p className="leading-relaxed text-gray-300">
                {movie.overview || 'No overview is available for this title.'}
              </p>
            </div>
          </motion.div>
        </div>

        <SimilarMovies movie={movie} />
      </div>
    </div>
  );
};

export default MovieDetails;
