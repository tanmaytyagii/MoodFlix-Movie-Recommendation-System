import React, { useEffect, useState } from 'react';
import { Loader, Sparkles } from 'lucide-react';
import { MovieDetail, ScoredMovie } from '../types';
import { getContentBasedRecommendations } from '../services/recommendationService';
import MovieCard from './MovieCard';

interface SimilarMoviesProps {
  movie: MovieDetail;
}

/**
 * The content-based rail on the movie detail page.
 *
 * Renders nothing at all when there is no usable result — a "More Like This"
 * heading over an error message is worse than no section, because this is
 * supplementary to the page rather than its purpose.
 */
const SimilarMovies: React.FC<SimilarMoviesProps> = ({ movie }) => {
  const [results, setResults] = useState<ScoredMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setResults([]);

    getContentBasedRecommendations(movie)
      .then((scored) => {
        if (!cancelled) setResults(scored);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movie]);

  if (loading) {
    return (
      <section className="mt-12" aria-busy="true">
        <h2 className="mb-6 text-2xl font-bold text-white">More like this</h2>
        <div className="flex items-center py-8 text-gray-400" role="status">
          <Loader size={24} className="mr-3 animate-spin text-yellow-500" aria-hidden="true" />
          Finding similar movies…
        </div>
      </section>
    );
  }

  if (results.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={20} className="text-yellow-400" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-white">More like this</h2>
      </div>
      <p className="mb-6 text-sm text-gray-400">
        Ranked by TF-IDF cosine similarity over each film&rsquo;s overview, genres and keywords.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {results.map(({ movie: similar, similarity }) => (
          <MovieCard key={similar.id} movie={similar} similarity={similarity} />
        ))}
      </div>
    </section>
  );
};

export default SimilarMovies;
