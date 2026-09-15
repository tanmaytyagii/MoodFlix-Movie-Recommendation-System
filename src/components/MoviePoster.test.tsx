import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MoviePoster from './MoviePoster';

describe('MoviePoster', () => {
  it('renders the TMDB image when a path is supplied', () => {
    render(<MoviePoster path="/abc.jpg" title="Heat" />);
    const image = screen.getByRole('img', { name: 'Poster for Heat' });
    expect(image.getAttribute('src')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
  });

  it('honours the requested size bucket', () => {
    render(<MoviePoster path="/abc.jpg" title="Heat" size="w780" />);
    expect(screen.getByRole('img', { name: 'Poster for Heat' }).getAttribute('src')).toContain('/w780/');
  });

  /**
   * The old fallback pointed at via.placeholder.com, a dead host, so every
   * poster-less film rendered a broken image. The replacement is drawn in the
   * DOM and needs no network.
   */
  it('renders a labelled in-DOM fallback when there is no poster', () => {
    render(<MoviePoster path={null} title="Untitled Film" />);
    expect(screen.getByRole('img', { name: 'No poster available for Untitled Film' })).toBeDefined();
    expect(screen.queryByRole('img', { name: /^Poster for/ })).toBeNull();
  });

  it('never points at the dead placeholder host', () => {
    const { container } = render(<MoviePoster path={null} title="Untitled Film" />);
    expect(container.innerHTML).not.toContain('via.placeholder.com');
  });

  it('swaps to the fallback when the image fails to load', () => {
    render(<MoviePoster path="/broken.jpg" title="Heat" />);
    fireEvent.error(screen.getByRole('img', { name: 'Poster for Heat' }));
    expect(screen.getByRole('img', { name: 'No poster available for Heat' })).toBeDefined();
  });

  it('retries when the path changes, so one failure is not permanent', () => {
    const { rerender } = render(<MoviePoster path="/broken.jpg" title="Heat" />);
    fireEvent.error(screen.getByRole('img', { name: 'Poster for Heat' }));

    rerender(<MoviePoster path="/working.jpg" title="Collateral" />);
    expect(screen.getByRole('img', { name: 'Poster for Collateral' })).toBeDefined();
  });

  it('reserves 2:3 space so the grid does not shift as posters load', () => {
    const { container } = render(<MoviePoster path={null} title="Heat" />);
    expect(container.firstElementChild?.className).toContain('aspect-[2/3]');
  });

  /**
   * Regression: a cached image can complete before React attaches `onLoad`, so
   * the fade-in never ran and the poster stayed invisible.
   */
  describe('already-cached images', () => {
    const patch = (complete: boolean, naturalWidth: number) => {
      const saved = {
        complete: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete'),
        naturalWidth: Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'naturalWidth'),
      };
      Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, get: () => complete });
      Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', { configurable: true, get: () => naturalWidth });
      // Restore exactly, so the patch cannot leak into any later test.
      return () => {
        for (const [key, value] of Object.entries(saved)) {
          if (value) Object.defineProperty(HTMLImageElement.prototype, key, value);
          else delete (HTMLImageElement.prototype as unknown as Record<string, unknown>)[key];
        }
      };
    };

    it('reveals an image that was already complete before mount', () => {
      const restore = patch(true, 500);
      try {
        render(<MoviePoster path="/cached.jpg" title="Heat" />);
        const image = screen.getByRole('img', { name: 'Poster for Heat' });
        expect(image.className).toContain('opacity-100');
      } finally {
        restore();
      }
    });

    it('falls back when a cached image completed with no pixels', () => {
      const restore = patch(true, 0);
      try {
        render(<MoviePoster path="/broken.jpg" title="Heat" />);
        expect(screen.getByRole('img', { name: 'No poster available for Heat' })).toBeDefined();
      } finally {
        restore();
      }
    });

    it('restores the prototype so later tests see a normal image', () => {
      render(<MoviePoster path="/abc.jpg" title="Heat" />);
      expect(screen.getByRole('img', { name: 'Poster for Heat' })).toBeDefined();
    });
  });

  it('serves a responsive srcSet so phones fetch smaller artwork', () => {
    render(<MoviePoster path="/abc.jpg" title="Heat" size="w500" />);
    const srcSet = screen.getByRole('img', { name: 'Poster for Heat' }).getAttribute('srcset') ?? '';
    expect(srcSet).toContain('/w185/abc.jpg 185w');
    expect(srcSet).toContain('/w500/abc.jpg 500w');
  });

  it('lazy-loads posters below the fold', () => {
    render(<MoviePoster path="/abc.jpg" title="Heat" />);
    expect(screen.getByRole('img', { name: 'Poster for Heat' }).getAttribute('loading')).toBe('lazy');
  });

  it('eagerly loads a poster marked as priority', () => {
    render(<MoviePoster path="/abc.jpg" title="Heat" priority />);
    expect(screen.getByRole('img', { name: 'Poster for Heat' }).getAttribute('loading')).toBe('eager');
  });
});
