import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/about', label: 'About' },
];

/**
 * Site header.
 *
 * Transparent over the hero and opaque once the page scrolls, so cinematic
 * imagery runs behind it without the navigation ever losing legibility.
 *
 * Mobile keeps search on its own full-width row rather than hiding it behind the
 * menu — search is a primary action in a discovery product, not a secondary one.
 */
const Header: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const searchId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Only re-render when the boolean actually flips, not on every scroll frame.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'relative rounded-full px-3 py-2 text-sm font-medium transition-colors duration-fast ease-out',
      isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
    ].join(' ');

  /** Active marker as a separate element so it can sit under the label cleanly. */
  const ActiveDot = ({ isActive }: { isActive: boolean }) =>
    isActive ? (
      <span
        aria-hidden="true"
        className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent"
      />
    ) : null;

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-40 transition-colors duration-base ease-out',
        scrolled || menuOpen
          ? 'border-b border-line bg-canvas/95 backdrop-blur-xl'
          : 'border-b border-transparent bg-gradient-to-b from-canvas/90 to-transparent',
      ].join(' ')}
    >
      <div className="container-page">
        <div className="flex h-16 items-center gap-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-md py-1 text-lg font-extrabold tracking-tight"
          >
            {/* Film-strip mark: two perforations either side of a frame. */}
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
              <span className="h-3.5 w-2 rounded-[2px] bg-accent-contrast" />
            </span>
            <span className="text-ink">
              Mood<span className="text-accent">Flix</span>
            </span>
          </Link>

          <nav aria-label="Main" className="ml-4 hidden md:flex md:items-center md:gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    <ActiveDot isActive={isActive} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop search sits right; on mobile it moves to its own row below. */}
          <div className="ml-auto hidden min-w-0 md:block md:w-64 lg:w-80">
            <SearchField id={`${searchId}-desktop`} value={searchQuery} onChange={setSearchQuery} />
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors duration-fast hover:bg-surface-raised hover:text-ink md:hidden"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        <div className="pb-3 md:hidden">
          <SearchField id={`${searchId}-mobile`} value={searchQuery} onChange={setSearchQuery} />
        </div>

        <nav
          id={menuId}
          aria-label="Main"
          hidden={!menuOpen}
          className="border-t border-line pb-3 pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    [
                      'flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium transition-colors duration-fast',
                      isActive
                        ? 'bg-accent-soft text-accent'
                        : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

interface SearchFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

/** Search input. Rendered twice (desktop rail, mobile row) from one definition. */
const SearchField: React.FC<SearchFieldProps> = ({ id, value, onChange }) => (
  <div className="group relative">
    <label htmlFor={id} className="sr-only">
      Search movies by title
    </label>
    <Search
      size={16}
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint transition-colors duration-fast group-focus-within:text-accent"
    />
    <input
      id={id}
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search films…"
      className="h-10 w-full rounded-lg border border-line bg-surface-raised pl-9 pr-9 text-sm text-ink placeholder:text-ink-faint transition-colors duration-fast hover:border-line-strong focus:border-accent/60 focus:bg-surface-hover [&::-webkit-search-cancel-button]:appearance-none"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-ink-faint transition-colors duration-fast hover:bg-surface-hover hover:text-ink"
      >
        <X size={14} aria-hidden="true" />
      </button>
    )}
  </div>
);

export default Header;
