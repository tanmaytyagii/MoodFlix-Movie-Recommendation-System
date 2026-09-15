import React from 'react';
import { Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="flex items-center justify-center md:justify-start">
              Made with <Heart size={16} className="text-red-500 mx-1" aria-hidden="true" /> using React and the TMDB API
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a
              href="https://github.com/tanmaytyagii/MoodFlix-Movie-Recommendation-System"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <Github size={20} aria-hidden="true" />
              <span>Source on GitHub</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <p className="mt-1">Movie data provided by The Movie Database (TMDb).</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;