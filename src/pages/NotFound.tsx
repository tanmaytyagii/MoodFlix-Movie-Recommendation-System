import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

/**
 * Catch-all route. With the SPA rewrite in `vercel.json` every unknown path
 * serves `index.html`, so without this the router would render an empty shell.
 */
const NotFound: React.FC = () => (
  <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
    <span aria-hidden="true" className="mb-6 grid h-14 w-14 place-items-center rounded-full border border-line bg-surface text-accent">
      <Compass size={24} />
    </span>
    <p className="eyebrow mb-3">404</p>
    <h1 className="text-title text-balance text-ink">This page rolled off the reel</h1>
    <p className="mt-4 max-w-md text-lede text-ink-muted">
      That link doesn&rsquo;t lead anywhere in MoodFlix. It may be out of date.
    </p>
    <Link
      to="/"
      className="pressable mt-8 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast shadow-control hover:bg-accent-strong hover:shadow-card"
    >
      Back to MoodFlix
    </Link>
  </div>
);

export default NotFound;
