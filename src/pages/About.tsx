import React from 'react';
import { motion } from 'framer-motion';
import { Film, Brain, Database, Search } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-6 text-center">About MoodFlix</h1>
          
          <div className="bg-gray-800 rounded-xl p-8 mb-10">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              MoodFlix is an innovative movie recommendation platform that uses sentiment analysis 
              to understand your emotional state and suggest films that match your current mood. 
              We believe that the right movie at the right time can enhance your viewing experience 
              and emotional connection to the film.
            </p>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              Our advanced sentiment analysis algorithm processes your input to determine your 
              emotional state, then matches it with movie genres and themes that complement 
              or enhance that mood. Whether you're feeling happy, sad, excited, or anything 
              in between, MoodFlix helps you find the perfect film for your current state of mind.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Brain size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sentiment Analysis</h3>
              <p className="text-gray-400">
                Our machine learning model analyzes text input to determine emotional tone 
                and sentiment, categorizing it into specific mood categories like happy, sad, 
                excited, relaxed, neutral, angry, or fearful.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Database size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Movie Database</h3>
              <p className="text-gray-400">
                We integrate with The Movie Database (TMDB) to access a vast collection 
                of movies across all genres, complete with details like plot summaries, 
                release dates, ratings, and more.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Matching Algorithm</h3>
              <p className="text-gray-400">
                Our recommendation engine maps emotional states to appropriate genres and themes, 
                then searches the movie database to find the most relevant and highly-rated films 
                that match your current mood.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="h-12 w-12 bg-yellow-600 rounded-full flex items-center justify-center mb-4">
                <Film size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Personalized Results</h3>
              <p className="text-gray-400">
                The final step presents you with a curated list of films tailored to your 
                emotional state, giving you the perfect selection to enhance your viewing experience.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Data Privacy</h2>
            <p className="text-gray-300 text-lg">
              At MoodFlix, we value your privacy. We do not store your sentiment input or 
              create permanent user profiles. Each recommendation session is temporary and 
              processed in real-time, ensuring your data remains private and secure.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;