import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppContext();

  return (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 text-white shadow-lg fixed w-full top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <Link to="/" className="flex items-center mb-4 sm:mb-0">
          <Film size={32} className="text-yellow-400 mr-2" />
          <h1 className="text-2xl font-bold tracking-tight">
            Mood<span className="text-yellow-400">Flix</span>
          </h1>
        </Link>
        
        <div className="relative w-full sm:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        
        <nav className="hidden md:flex space-x-6 mt-4 sm:mt-0">
          <Link to="/" className="hover:text-yellow-400 transition-colors">Home</Link>
          <Link to="/recommendations" className="hover:text-yellow-400 transition-colors">Recommendations</Link>
          <Link to="/about" className="hover:text-yellow-400 transition-colors">About</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;