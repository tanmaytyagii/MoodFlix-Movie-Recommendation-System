import React, { useEffect, useState } from 'react';
import { MovieDetail, ScoredMovie } from '../types';
import { getContentBasedRecommendations } from '../services/recommendationService';
import MovieGrid from './MovieGrid';
import MovieGridSkeleton from './MovieGridSkeleton';
import SectionHeading from './SectionHeading';

interface SimilarMoviesProps {
  movie: MovieDetail;
}

/**
 * The content-based rail on the movie detail page.
 *
 * Renders nothing at all when there is no usable result — a heading above an
 * error message is worse than no section, because this is supplementary to the
 * page rather than its purpose.
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
      <section className="mt-16 sm:mt-20">
        <SectionHeading eyebrow="Content-based" title="More like this" />
        <div className="mt-7">
          <MovieGridSkeleton count={6} label="Finding similar movies…" />
        </div>
      </section>
    );
  }

  if (results.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-20">
      <SectionHeading
        eyebrow="Content-based"
        title="More like this"
        description="Ranked by TF-IDF cosine similarity across each film's overview, genres and keywords — closest first."
      />
      <div className="mt-7">
        <MovieGrid movies={results.map((entry) => entry.movie)} ranked />
      </div>
    </section>
  );
};

export default SimilarMovies;
