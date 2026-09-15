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

  /**
   * Cards carry a rank, not a raw similarity percentage. TF-IDF cosine over
   * short synopses lands around 0.05-0.2, so "7% match" reads as a broken score
   * and implies a probability the number does not carry. Order is the signal.
   */
  it('numbers the results by similarity rank', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([
      { movie: candidate(2, 'Casino Job'), similarity: 0.19 },
      { movie: candidate(3, 'Bank Run'), similarity: 0.07 },
    ]);

    renderRail();

    expect(await screen.findByText('Ranked 1 by similarity')).toBeDefined();
    expect(screen.getByText('Ranked 2 by similarity')).toBeDefined();
  });

  it('never renders a raw similarity percentage', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([
      { movie: candidate(2, 'Casino Job'), similarity: 0.07 },
    ]);

    const { container } = renderRail();
    await screen.findByRole('link', { name: /Casino Job/ });
    expect(container.textContent).not.toMatch(/\d+%/);
  });

  it('preserves the order the recommender returned', async () => {
    vi.mocked(recommendations.getContentBasedRecommendations).mockResolvedValue([
      { movie: candidate(2, 'Casino Job'), similarity: 0.19 },
      { movie: candidate(3, 'Bank Run'), similarity: 0.07 },
    ]);

    renderRail();
    await screen.findByRole('link', { name: /Casino Job/ });

    const titles = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(titles).toEqual(['/movie/2', '/movie/3']);
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
