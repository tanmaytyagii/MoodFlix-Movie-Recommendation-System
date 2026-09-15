import React, { useEffect, useState } from 'react';
import { Film } from 'lucide-react';
import { TMDB_IMAGE_BASE_URL } from '../utils/constants';

interface MoviePosterProps {
  /** TMDB poster path, e.g. `/abc123.jpg`. `null` when the film has no artwork. */
  path: string | null;
  title: string;
  /** TMDB size bucket. `w500` for cards, `w780` for the detail hero. */
  size?: 'w342' | 'w500' | 'w780';
  className?: string;
}

/**
 * Poster with a self-contained fallback.
 *
 * Replaces the previous `via.placeholder.com` URL, which is a dead host — every
 * poster-less film rendered a broken image icon. The fallback is drawn in the
 * DOM, so it needs no network at all and cannot break again.
 *
 * The wrapper holds a 2:3 aspect ratio whether or not the image loads, so the
 * grid never shifts as posters arrive.
 */
const MoviePoster: React.FC<MoviePosterProps> = ({ path, title, size = 'w500', className = '' }) => {
  const [failed, setFailed] = useState(false);

  // A new path is a new image: clear the previous failure so a working poster
  // is not permanently hidden by an earlier one that broke.
  useEffect(() => {
    setFailed(false);
  }, [path]);

  const showFallback = !path || failed;

  return (
    <div className={`relative aspect-[2/3] w-full overflow-hidden bg-gray-800 ${className}`}>
      {showFallback ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-700 to-gray-900 p-4 text-center"
          role="img"
          aria-label={`No poster available for ${title}`}
        >
          <Film size={32} className="text-gray-500" aria-hidden="true" />
          <span className="line-clamp-3 text-xs font-medium text-gray-400">{title}</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-600">No poster</span>
        </div>
      ) : (
        <img
          src={`${TMDB_IMAGE_BASE_URL}/${size}${path}`}
          alt={`Poster for ${title}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      )}
    </div>
  );
};

export default MoviePoster;
