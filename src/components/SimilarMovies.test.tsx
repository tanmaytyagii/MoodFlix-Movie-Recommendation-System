import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Movie, MovieDetail } from '../types';
import SimilarMovies from './SimilarMovies';
import * as recommendations from '../services/recommendationService';

vi.mock('../services/recommendationService', () => ({
  getContentBasedRecommendations: vi.fn(),
}));

const candidate = (id: number, title: string): Movie => ({
  id,
  title,
  overview: 'A heist unfolds.',
  poster_path: null,
  backdrop_path: null,
  release_date: '2020-05-01',
  vote_average: 7.4,
  genre_ids: [80],
});

const reference: MovieDetail = {
  id: 1,
  title: 'Vault Breakers',
  overview: 'A crew of thieves plan a casino vault heist.',
  poster_path: null,
  backdrop_path: null,
  release_date: '2019-01-01',
  vote_average: 8,
  genres: [{ id: 80, name: 'Crime' }],
  runtime: 120,
  tagline: null,
  status: 'Released',
};

const renderRail = () =>
  render(
    <MemoryRouter>
      <SimilarMovies movie={reference} />
    </MemoryRouter>,
  );

describe('SimilarMovies', () => {
  it('renders a card per recommendation once loaded', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([
      { movie: candidate(2, 'Casino Job'), similarity: 0.82 },
      { movie: candidate(3, 'Bank Run'), similarity: 0.41 },
    ]);

    renderRail();

    expect(await screen.findByRole('heading', { name: 'More like this' })).toBeDefined();
    expect(screen.getByRole('link', { name: /Casino Job/ })).toBeDefined();
    expect(screen.getByRole('link', { name: /Bank Run/ })).toBeDefined();
  });

  it('links each card to its own deep-linkable route', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([
      { movie: candidate(2, 'Casino Job'), similarity: 0.82 },
    ]);

    renderRail();
    const link = await screen.findByRole('link', { name: /Casino Job/ });
    expect(link.getAttribute('href')).toBe('/movie/2');
  });

  it('surfaces the similarity score as a percentage match', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([
      { movie: candidate(2, 'Casino Job'), similarity: 0.823 },
    ]);

    renderRail();
    expect(await screen.findByText('82% match')).toBeDefined();
  });

  it('shows a loading state while ranking', () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockReturnValue(new Promise(() => {}));
    renderRail();
    expect(screen.getByText('Finding similar movies…')).toBeDefined();
  });

  /**
   * This rail is supplementary to the page. An empty or failed result should
   * disappear rather than leave a heading over an error.
   */
  it('renders nothing when there are no recommendations', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([]);
    const { container } = renderRail();
    await waitFor(() => expect(container.innerHTML).toBe(''));
  });

  it('renders nothing when ranking fails', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockRejectedValue(new Error('boom'));
    const { container } = renderRail();
    await waitFor(() => expect(container.innerHTML).toBe(''));
  });

  it('falls back cleanly for candidates with no poster', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([
      { movie: candidate(2, 'Casino Job'), similarity: 0.5 },
    ]);

    renderRail();
    expect(await screen.findByRole('img', { name: 'No poster available for Casino Job' })).toBeDefined();
  });
});
