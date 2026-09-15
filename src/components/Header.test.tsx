import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import Header from './Header';

const renderHeader = () =>
  render(
    <MemoryRouter>
      <AppProvider>
        <Header />
      </AppProvider>
    </MemoryRouter>,
  );

const toggle = () => screen.getByRole('button', { name: /navigation menu/i });

/** The menu is the `<nav>` the toggle points at via aria-controls. */
const mobileMenu = () => {
  const id = toggle().getAttribute('aria-controls');
  const menu = document.getElementById(id ?? '');
  if (!menu) throw new Error('mobile menu element not found');
  return menu;
};

describe('Header navigation', () => {
  /**
   * The navigation used to be `hidden md:flex` with no mobile alternative, so
   * Recommendations and About were unreachable on a phone.
   */
  it('exposes a menu control for small screens', () => {
    renderHeader();
    expect(toggle()).toBeDefined();
  });

  it('starts collapsed', () => {
    renderHeader();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(mobileMenu().hasAttribute('hidden')).toBe(true);
  });

  it('opens on click and reveals every destination', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(toggle());

    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    const menu = within(mobileMenu());
    expect(menu.getByRole('link', { name: 'Home' })).toBeDefined();
    expect(menu.getByRole('link', { name: 'Recommendations' })).toBeDefined();
    expect(menu.getByRole('link', { name: 'About' })).toBeDefined();
  });

  it('closes again on a second click', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(toggle());
    await user.click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('is operable from the keyboard', async () => {
    const user = userEvent.setup();
    renderHeader();
    toggle().focus();
    await user.keyboard('{Enter}');
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(toggle());
    await user.keyboard('{Escape}');

    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle());
  });

  it('closes after navigating', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(toggle());
    await user.click(within(mobileMenu()).getByRole('link', { name: 'About' }));
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('wires the toggle to the menu it controls', () => {
    renderHeader();
    expect(toggle().getAttribute('aria-controls')).toBe(mobileMenu().id);
  });

  /**
   * Two search fields render: one in the desktop rail, one on its own row for
   * mobile. CSS shows exactly one at a given breakpoint; jsdom sees both.
   * Search stays visible on mobile rather than hiding inside the menu, because
   * it is a primary action in a discovery product.
   */
  it('labels every search input for screen readers', () => {
    renderHeader();
    const inputs = screen.getAllByLabelText('Search movies by title');
    expect(inputs).toHaveLength(2);
    for (const input of inputs) expect(input.getAttribute('type')).toBe('search');
  });

  it('gives each search input a unique id so its label binds correctly', () => {
    renderHeader();
    const ids = screen.getAllByLabelText('Search movies by title').map((input) => input.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(Boolean)).toBe(true);
  });

  it('offers no clear button until there is a query', () => {
    renderHeader();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('clears the query from the search field', async () => {
    const user = userEvent.setup();
    renderHeader();
    const [input] = screen.getAllByLabelText('Search movies by title');

    await user.type(input, 'blade');
    expect((input as HTMLInputElement).value).toBe('blade');

    await user.click(screen.getAllByRole('button', { name: 'Clear search' })[0]);
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('keeps the desktop navigation reachable', () => {
    renderHeader();
    const navs = screen.getAllByRole('navigation', { name: 'Main' });
    expect(within(navs[0]).getByRole('link', { name: 'Recommendations' })).toBeDefined();
  });

  it('hides the collapsed menu from assistive tech, then exposes it when open', async () => {
    const user = userEvent.setup();
    renderHeader();
    // Only the desktop nav is in the accessibility tree while collapsed.
    expect(screen.getAllByRole('navigation', { name: 'Main' })).toHaveLength(1);

    await user.click(toggle());
    expect(screen.getAllByRole('navigation', { name: 'Main' })).toHaveLength(2);
  });
});
