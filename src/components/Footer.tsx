import React from 'react';
import { Github } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="mt-auto border-t border-line bg-surface-sunken">
    <div className="container-page flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ink">
          Mood<span className="text-accent">Flix</span>
        </p>
        <p className="mt-1.5 max-w-prose text-meta text-ink-faint">
          Movie data provided by The Movie Database. This product uses the TMDB API but is not
          endorsed or certified by TMDB.
        </p>
      </div>

      <a
        href="https://github.com/tanmaytyagii/MoodFlix-Movie-Recommendation-System"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-meta font-medium text-ink-muted transition-colors duration-fast hover:border-line-strong hover:text-ink"
      >
        <Github size={15} aria-hidden="true" />
        Source on GitHub
      </a>
    </div>
  </footer>
);

export default Footer;
