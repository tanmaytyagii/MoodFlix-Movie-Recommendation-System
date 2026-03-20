import React from 'react';
import { motion } from 'framer-motion';
import SentimentForm from '../components/SentimentForm';
import { Film, Sparkles, ThumbsUp } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Discover Movies Based on Your <span className="text-yellow-400">Mood</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Our advanced sentiment analysis understands how you feel and recommends 
            the perfect movies to match your emotional state.
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <SentimentForm />
        </motion.div>
        
        <motion.div 
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Curated Recommendations</h3>
            <p className="text-gray-400">Get personalized movie suggestions based on how you're feeling right now.</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <div className="h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sentiment Analysis</h3>
            <p className="text-gray-400">Our AI analyzes your mood and emotional state to find the perfect match.</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ThumbsUp size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Discover New Favorites</h3>
            <p className="text-gray-400">Explore a diverse range of films from thousands of titles across all genres.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;