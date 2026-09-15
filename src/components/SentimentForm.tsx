import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CloudRain,
  Coffee,
  Compass,
  Eye,
  Flame,
  Frown,
  Ghost,
  Heart,
  Lightbulb,
  Smile,
  Zap,
} from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import { SentimentLabel } from '../types';
import { SELECTABLE_SENTIMENTS, SENTIMENT_COLORS, SENTIMENT_EMOJIS } from '../utils/constants';

const MOOD_ICONS: Record<SentimentLabel, React.ReactNode> = {
  happy: <Smile size={22} aria-hidden="true" />,
  sad: <Frown size={22} aria-hidden="true" />,
  excited: <Zap size={22} aria-hidden="true" />,
  relaxed: <Coffee size={22} aria-hidden="true" />,
  romantic: <Heart size={22} aria-hidden="true" />,
  adventurous: <Compass size={22} aria-hidden="true" />,
  mysterious: <Eye size={22} aria-hidden="true" />,
  fearful: <Ghost size={22} aria-hidden="true" />,
  angry: <Flame size={22} aria-hidden="true" />,
  nostalgic: <Clock size={22} aria-hidden="true" />,
  thoughtful: <Lightbulb size={22} aria-hidden="true" />,
  melancholic: <CloudRain size={22} aria-hidden="true" />,
  neutral: null,
};

const SentimentForm: React.FC = () => {
  const [sentimentText, setSentimentText] = useState('');
  const [textAnalysisMode, setTextAnalysisMode] = useState(true);
  const { analyzeSentimentAndGetMovies, setUserSentimentManually, isLoading } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sentimentText.trim()) return;

    await analyzeSentimentAndGetMovies(sentimentText);
    navigate('/recommendations');
  };

  const handleSentimentSelection = async (sentiment: SentimentLabel) => {
    await setUserSentimentManually(sentiment);
    navigate('/recommendations');
  };

  const tabClass = (active: boolean) =>
    `px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
      active ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'
    }`;

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
      <div className="p-6 sm:p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">How are you feeling today?</h2>

        <div className="mb-8 flex justify-center">
          {/* Radio-style tabs: exactly one mode is active at a time. */}
          <div className="flex" role="group" aria-label="Choose how to set your mood">
            <button
              type="button"
              onClick={() => setTextAnalysisMode(true)}
              aria-pressed={textAnalysisMode}
              className={`rounded-l-md ${tabClass(textAnalysisMode)}`}
            >
              Describe your mood
            </button>
            <button
              type="button"
              onClick={() => setTextAnalysisMode(false)}
              aria-pressed={!textAnalysisMode}
              className={`rounded-r-md ${tabClass(!textAnalysisMode)}`}
            >
              Pick a mood
            </button>
          </div>
        </div>

        {textAnalysisMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sentimentText" className="mb-2 block text-sm font-medium text-gray-300">
                Tell us how you&rsquo;re feeling, or what you&rsquo;re in the mood to watch:
              </label>
              <textarea
                id="sentimentText"
                rows={4}
                value={sentimentText}
                onChange={(event) => setSentimentText(event.target.value)}
                placeholder="E.g. Had a rough week and could use a good laugh…"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !sentimentText.trim()}
                className={`rounded-lg px-8 py-3 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                  isLoading || !sentimentText.trim()
                    ? 'cursor-not-allowed bg-gray-600 text-gray-300'
                    : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                }`}
              >
                {isLoading ? 'Reading your mood…' : 'Get recommendations'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="mb-6 text-center text-gray-300">Pick a mood to get recommendations:</p>

            <motion.div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {SELECTABLE_SENTIMENTS.map((mood) => (
                <motion.button
                  key={mood}
                  type="button"
                  onClick={() => handleSentimentSelection(mood)}
                  disabled={isLoading}
                  className={`${SENTIMENT_COLORS[mood]} flex flex-col items-center justify-center rounded-lg p-4 text-white transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 ${
                    isLoading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  whileHover={isLoading ? undefined : { scale: 1.05 }}
                  whileTap={isLoading ? undefined : { scale: 0.95 }}
                >
                  <span className="mb-1">{MOOD_ICONS[mood]}</span>
                  <span className="text-sm font-medium capitalize">{mood}</span>
                  <span aria-hidden="true" className="mt-1 text-xl">
                    {SENTIMENT_EMOJIS[mood]}
                  </span>
                </motion.button>
              ))}
            </motion.div>

            {isLoading && (
              <div className="mt-6 flex justify-center" role="status">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-yellow-500" />
                <span className="sr-only">Loading recommendations</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentForm;
