import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

/**
 * Catch-all route. With the SPA rewrite in `vercel.json` every unknown path
 * serves `index.html`, so without this the router would render an empty shell.
 */
const NotFound: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 pb-16 pt-24 text-center">
    <Compass size={48} className="mb-4 text-yellow-400" aria-hidden="true" />
    <h1 className="mb-2 text-4xl font-bold text-white">Page not found</h1>
    <p className="mb-6 max-w-md text-gray-400">
      That link doesn&rsquo;t lead anywhere in MoodFlix. It may be out of date.
    </p>
    <Link
      to="/"
      className="rounded-md bg-blue-600 px-5 py-2.5 text-white transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
    >
      Back to MoodFlix
    </Link>
  </div>
);

export default NotFound;
