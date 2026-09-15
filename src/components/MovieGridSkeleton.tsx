import React from 'react';

interface MovieGridSkeletonProps {
  count?: number;
  label?: string;
}

/**
 * Placeholder grid shown while movies load.
 *
 * Mirrors `MovieGrid`'s columns and the 2:3 poster ratio exactly, so the real
 * results drop straight in with no layout shift. A spinner in the middle of an
 * empty page cannot do that.
 */
const MovieGridSkeleton: React.FC<MovieGridSkeletonProps> = ({
  count = 12,
  label = 'Loading films',
}) => (
  <div role="status" aria-label={label} aria-busy="true">
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <div className="skeleton aspect-[2/3] w-full rounded-card ring-1 ring-line" />
          <div className="skeleton mt-2.5 h-3.5 w-4/5 rounded" />
          <div className="skeleton mt-2 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
    <span className="sr-only">{label}</span>
  </div>
);

export default MovieGridSkeleton;
