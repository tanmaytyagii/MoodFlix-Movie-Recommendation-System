import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import MovieList from '../components/MovieList';
import { useAppContext } from '../context/useAppContext';
import { Sentiment } from '../types';
import { SENTIMENT_DESCRIPTIONS, SENTIMENT_EMOJIS } from '../utils/constants';

/**
 * How the mood was arrived at, in the user's words.
 *
 * The distinction matters: a transformer's softmax output and a keyword match
 * score are not the same quantity, and labelling both "confidence" would
 * overstate what the lexicon actually knows.
 */
const provenance = (sentiment: Sentiment): string => {
  const percent = Math.round(sentiment.confidence * 100);

  switch (sentiment.source) {
    case 'manual':
      return 'You chose this mood.';
    case 'model':
      return `Emotion model · ${percent}% confidence`;
    case 'lexicon':
      return sentiment.matchedTerms.length > 0
        ? `Keyword match · ${percent}% mood match · matched ${sentiment.matchedTerms
            .slice(0, 4)
            .map((term) => `“${term}”`)
            .join(', ')}`
        : `Keyword match · ${percent}% mood match`;
  }
};

const Recommendations: React.FC = () => {
  const { userSentiment, recommendedMovies, searchQuery } = useAppContext();
  const navigate = useNavigate();

  const hasResults = recommendedMovies.length > 0;

  // Nothing to show means the user landed here directly; send them to the form.
  useEffect(() => {
    if (!userSentiment && !hasResults && !searchQuery) {
      navigate('/', { replace: true });
    }
  }, [userSentiment, hasResults, searchQuery, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 pb-16 pt-24">
      <div className="container mx-auto px-4 py-8">
        {userSentiment && !searchQuery && (
          <motion.div
            className="mx-auto mb-10 max-w-3xl rounded-xl bg-gray-800 p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 flex items-center justify-center">
              <span aria-hidden="true" className="mr-3 text-4xl">
                {SENTIMENT_EMOJIS[userSentiment.label]}
              </span>
              <h2 className="text-2xl font-bold capitalize text-white">
                {userSentiment.label} mood
              </h2>
            </div>

            <p className="text-center text-gray-300">
              {SENTIMENT_DESCRIPTIONS[userSentiment.label]}
            </p>

            <p className="mt-3 text-center text-sm text-gray-500">{provenance(userSentiment)}</p>

            {userSentiment.isUncertain && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-gray-700/60 p-3 text-sm text-gray-300">
                <Info size={16} className="mt-0.5 shrink-0 text-yellow-400" aria-hidden="true" />
                <span>
                  We couldn&rsquo;t read a clear mood from that. Try describing how you feel in a
                  little more detail, or pick a mood directly.
                </span>
              </p>
            )}

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                Change mood
              </button>
            </div>
          </motion.div>
        )}

        <MovieList />
      </div>
    </div>
  );
};

export default Recommendations;
