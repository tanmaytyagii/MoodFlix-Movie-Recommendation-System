import React, { useCallback, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { TMDB_IMAGE_BASE_URL } from '../utils/constants';

type PosterSize = 'w185' | 'w342' | 'w500' | 'w780';

interface MoviePosterProps {
  /** TMDB poster path, e.g. `/abc123.jpg`. `null` when the film has no artwork. */
  path: string | null;
  title: string;
  /** Rendered width bucket. Also anchors the responsive `srcSet`. */
  size?: PosterSize;
  /** Tells the browser how wide this poster will actually be, for `srcSet`. */
  sizes?: string;
  className?: string;
  /** Above-the-fold posters should load eagerly to avoid a blank first paint. */
  priority?: boolean;
}

/** Smaller buckets offered alongside the chosen size so phones fetch less. */
const SRCSET_STEPS: Record<PosterSize, { size: PosterSize; width: number }[]> = {
  w185: [{ size: 'w185', width: 185 }],
  w342: [
    { size: 'w185', width: 185 },
    { size: 'w342', width: 342 },
  ],
  w500: [
    { size: 'w185', width: 185 },
    { size: 'w342', width: 342 },
    { size: 'w500', width: 500 },
  ],
  w780: [
    { size: 'w342', width: 342 },
    { size: 'w500', width: 500 },
    { size: 'w780', width: 780 },
  ],
};

/**
 * Poster with a self-contained fallback.
 *
 * The wrapper holds a 2:3 ratio whether or not the image loads, so grids never
 * reflow as artwork arrives. The fallback is drawn in the DOM — it needs no
 * network and cannot break the way the previous remote placeholder host did.
 */
const MoviePoster: React.FC<MoviePosterProps> = ({
  path,
  title,
  size = 'w500',
  sizes,
  className = '',
  priority = false,
}) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /*
   * A new path is a new image: clear both flags so a working poster is never
   * hidden by an earlier one that broke.
   *
   * Done during render rather than in an effect. An effect runs *after* ref
   * callbacks, so it would overwrite the cached-image check below and leave the
   * poster permanently transparent.
   */
  const [renderedPath, setRenderedPath] = useState(path);
  if (path !== renderedPath) {
    setRenderedPath(path);
    setFailed(false);
    setLoaded(false);
  }

  /*
   * A cached image can finish loading before React attaches `onLoad`, in which
   * case the event never fires and the poster would stay at opacity-0 forever —
   * permanently invisible. Checking `complete` on mount closes that race.
   * `naturalWidth` guards against a cached *failure*, which also reports
   * complete.
   */
  const measureOnMount = useCallback((node: HTMLImageElement | null) => {
    if (!node?.complete) return;
    if (node.naturalWidth > 0) setLoaded(true);
    else setFailed(true);
  }, []);

  const showFallback = !path || failed;

  return (
    <div className={`relative aspect-[2/3] w-full overflow-hidden bg-surface-raised ${className}`}>
      {showFallback ? (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-raised p-4 text-center"
          role="img"
          aria-label={`No poster available for ${title}`}
        >
          <Clapperboard size={26} className="text-ink-faint/60" aria-hidden="true" />
          <span className="line-clamp-3 text-meta font-medium text-ink-faint">{title}</span>
          <span className="text-micro uppercase tracking-[0.14em] text-ink-faint/60">No poster</span>
        </div>
      ) : (
        <>
          {/* Placeholder tint under the image so the fade-in has something to
              reveal against instead of flashing the page background. */}
          {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
          <img
            ref={measureOnMount}
            src={`${TMDB_IMAGE_BASE_URL}/${size}${path}`}
            srcSet={SRCSET_STEPS[size]
              .map((step) => `${TMDB_IMAGE_BASE_URL}/${step.size}${path} ${step.width}w`)
              .join(', ')}
            sizes={sizes}
            alt={`Poster for ${title}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}
    </div>
  );
};

export default MoviePoster;
