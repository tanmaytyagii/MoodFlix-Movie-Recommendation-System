import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Database, Film, Shield, Sparkles } from 'lucide-react';

/**
 * Plain-language explanation of what MoodFlix actually does.
 *
 * Kept deliberately precise: the mood engine is a lexicon with an optional
 * hosted model in front of it, and "More like this" is TF-IDF — neither is
 * described as more than it is.
 */
const About: React.FC = () => (
  <div className="min-h-screen bg-gray-900 pb-16 pt-24">
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-6 text-center text-4xl font-bold text-white">About MoodFlix</h1>

        <div className="mb-10 rounded-xl bg-gray-800 p-8">
          <p className="mb-6 text-lg leading-relaxed text-gray-300">
            MoodFlix recommends films based on how you feel right now, rather than asking you to
            pick a genre from a dropdown. Describe your mood in your own words — or choose one
            directly — and MoodFlix maps it to the kinds of films that suit it.
          </p>
          <p className="text-lg leading-relaxed text-gray-300">
            Movie data comes from The Movie Database (TMDB). Everything happens in the moment:
            there are no accounts, and nothing you type is stored.
          </p>
        </div>

        <h2 className="mb-6 text-2xl font-bold text-white">How it works</h2>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-gray-800 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <Brain size={24} className="text-white" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Reading your mood</h3>
            <p className="text-gray-400">
              Your text is classified into one of twelve moods. A hosted DistilRoBERTa emotion
              model handles it when available; otherwise a built-in keyword engine takes over. That
              engine understands negation, so &ldquo;I&rsquo;m not happy&rdquo; does not read as
              happy. MoodFlix always tells you which one produced the result.
            </p>
          </div>

          <div className="rounded-xl bg-gray-800 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600">
              <Database size={24} className="text-white" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Finding the films</h3>
            <p className="text-gray-400">
              Each mood maps to a curated set of TMDB genres — melancholic leans toward drama and
              quieter romance, excited toward action and science fiction. MoodFlix queries TMDB for
              well-reviewed films in those genres.
            </p>
          </div>

          <div className="rounded-xl bg-gray-800 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
              <Sparkles size={24} className="text-white" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">More like this</h3>
            <p className="text-gray-400">
              On any film&rsquo;s page, MoodFlix builds TF-IDF vectors from overviews, genres and
              keywords, then ranks candidates by cosine similarity to that film. This is content-based
              filtering — it compares films to each other, not viewers to each other.
            </p>
          </div>

          <div className="rounded-xl bg-gray-800 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-600">
              <Film size={24} className="text-white" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">What you get</h3>
            <p className="text-gray-400">
              A grid of films with posters, ratings and overviews, filterable by rating. Every film
              has its own shareable link.
            </p>
          </div>
        </div>

        <div className="mb-10 rounded-xl bg-gray-800 p-8">
          <div className="mb-4 flex items-center gap-3">
            <Shield size={24} className="text-green-400" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-white">Privacy</h2>
          </div>
          <p className="text-lg text-gray-300">
            MoodFlix has no accounts and no database. What you type is sent for classification and
            then discarded — it is never written to disk, and mood text is sent by POST so it does
            not appear in server logs. TMDB requests go through MoodFlix&rsquo;s own backend, so
            your browser never talks to TMDB directly.
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);

export default About;
