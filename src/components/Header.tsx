import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Menu, Search, X } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/about', label: 'About' },
];

/**
 * Site header.
 *
 * The navigation used to be `hidden md:flex` with no mobile alternative, which
 * made Recommendations and About unreachable on a phone. It now collapses into
 * a disclosure menu below `md`; the desktop layout is unchanged.
 */
const Header: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const searchId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  // Close on navigation, so tapping a link does not leave the panel covering
  // the page it just navigated to.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes the menu and returns focus to the control that opened it.
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

  const linkClass = 'rounded transition-colors hover:text-yellow-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400';

  return (
    <header className="fixed top-0 z-20 w-full bg-gradient-to-r from-blue-900 to-purple-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/" className={`mr-auto flex items-center ${linkClass}`}>
            <Film size={32} className="mr-2 text-yellow-400" aria-hidden="true" />
            <span className="text-2xl font-bold tracking-tight">
              Mood<span className="text-yellow-400">Flix</span>
            </span>
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`rounded-md p-2 hover:bg-white/10 md:hidden ${linkClass}`}
          >
            {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>

          <div className="relative order-last w-full md:order-none md:w-1/3 md:max-w-sm">
            <label htmlFor={searchId} className="sr-only">
              Search movies by title
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={18} className="text-gray-400" aria-hidden="true" />
            </div>
            <input
              id={searchId}
              type="search"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <nav aria-label="Main" className="hidden md:flex md:space-x-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav
          id={menuId}
          aria-label="Main"
          hidden={!menuOpen}
          className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-2 py-2 text-lg hover:bg-white/10 ${linkClass}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
