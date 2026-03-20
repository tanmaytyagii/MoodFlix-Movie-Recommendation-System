import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Smile, 
  Frown, 
  Zap, 
  Coffee, 
  Meh, 
  AlertTriangle, 
  Ghost 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SentimentLabel } from '../types';
import { SENTIMENT_DESCRIPTIONS, SENTIMENT_EMOJIS } from '../utils/constants';

const SentimentForm: React.FC = () => {
  const [sentimentText, setSentimentText] = useState('');
  const [textAnalysisMode, setTextAnalysisMode] = useState(true);
  const { analyzeSentimentAndGetMovies, setUserSentimentManually, isLoading } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (textAnalysisMode) {
      if (!sentimentText.trim()) return;
      await analyzeSentimentAndGetMovies(sentimentText);
    }
    
    navigate('/recommendations');
  };

  const handleSentimentSelection = async (sentiment: SentimentLabel) => {
    await setUserSentimentManually(sentiment);
    navigate('/recommendations');
  };

  const sentimentOptions: { label: SentimentLabel; icon: React.ReactNode; color: string }[] = [
    { label: 'happy', icon: <Smile size={24} />, color: 'bg-green-500' },
    { label: 'sad', icon: <Frown size={24} />, color: 'bg-blue-500' },
    { label: 'excited', icon: <Zap size={24} />, color: 'bg-yellow-500' },
    { label: 'relaxed', icon: <Coffee size={24} />, color: 'bg-teal-500' },
    { label: 'neutral', icon: <Meh size={24} />, color: 'bg-gray-500' },
    { label: 'angry', icon: <AlertTriangle size={24} />, color: 'bg-red-500' },
    { label: 'fearful', icon: <Ghost size={24} />, color: 'bg-purple-500' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">How are you feeling today?</h2>
        
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setTextAnalysisMode(true)}
              className={`px-4 py-2 rounded-l-md transition-colors ${
                textAnalysisMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Describe Your Mood
            </button>
            <button
              onClick={() => setTextAnalysisMode(false)}
              className={`px-4 py-2 rounded-r-md transition-colors ${
                !textAnalysisMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Select Emotion
            </button>
          </div>
        </div>
        
        {textAnalysisMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sentimentText" className="block text-sm font-medium text-gray-300 mb-2">
                Tell us how you're feeling or what kind of movie you're in the mood for:
              </label>
              <textarea
                id="sentimentText"
                rows={4}
                value={sentimentText}
                onChange={(e) => setSentimentText(e.target.value)}
                placeholder="E.g., I'm feeling happy and excited today, looking for something uplifting..."
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !sentimentText.trim()}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  isLoading || !sentimentText.trim()
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                }`}
              >
                {isLoading ? 'Analyzing...' : 'Get Recommendations'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-gray-300 mb-6 text-center">
              Select an emotion below to get movie recommendations:
            </p>
            
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {sentimentOptions.map((option) => (
                <motion.button
                  key={option.label}
                  onClick={() => handleSentimentSelection(option.label)}
                  disabled={isLoading}
                  className={`${option.color} p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-lg transition-all hover:-translate-y-1 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mb-2">{option.icon}</span>
                  <span className="font-medium capitalize">{option.label}</span>
                  <span className="text-2xl mt-1">{SENTIMENT_EMOJIS[option.label]}</span>
                </motion.button>
              ))}
            </motion.div>
            
            {isLoading && (
              <div className="flex justify-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentForm;