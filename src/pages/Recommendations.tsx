import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, SlidersHorizontal } from 'lucide-react';
import MovieList from '../components/MovieList';
import MoodIcon from '../components/MoodIcon';
import { useAppContext } from '../context/useAppContext';
import { Sentiment } from '../types';
import { SENTIMENT_COLORS, SENTIMENT_DESCRIPTIONS } from '../utils/constants';

/**
 * How the mood was arrived at, in the user's words.
 *
 * A transformer's softmax output and a keyword match score are different
 * quantities; labelling both "confidence" would overstate what the lexicon
 * actually knows.
 */
const provenance = (sentiment: Sentiment): { label: string; detail?: string } => {
  const percent = Math.round(sentiment.confidence * 100);

  switch (sentiment.source) {
    case 'manual':
      return { label: 'You chose this mood' };
    case 'model':
      return { label: 'Emotion model', detail: `${percent}% confidence` };
    case 'lexicon':
      return {
        label: 'Keyword match',
        detail:
          sentiment.matchedTerms.length > 0
            ? `${percent}% · matched ${sentiment.matchedTerms.slice(0, 3).map((term) => `“${term}”`).join(', ')}`
            : `${percent}% mood match`,
      };
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

  const showMoodPanel = userSentiment && !searchQuery;
  const hue = userSentiment ? SENTIMENT_COLORS[userSentiment.label] : undefined;
  const source = userSentiment ? provenance(userSentiment) : null;

  return (
    <div className="container-page py-8 sm:py-12">
      {showMoodPanel && userSentiment && source && (
        <section
          aria-labelledby="mood-heading"
          className="rise-in relative isolate mb-10 overflow-hidden rounded-panel border border-line bg-surface p-6 sm:mb-12 sm:p-8"
        >
          {/* Mood hue as a soft wash, so the panel is tinted by the mood without
              the UI turning into a block of saturated colour. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.16]"
            style={{ background: `radial-gradient(120% 140% at 0% 0%, ${hue} 0%, transparent 60%)` }}
          />

          <div className="flex flex-wrap items-start gap-5">
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
              style={{ backgroundColor: `${hue}26`, color: hue }}
            >
              <MoodIcon mood={userSentiment.label} size={26} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="eyebrow">Your mood</p>
              <h1 id="mood-heading" className="mt-1 text-title capitalize text-ink">
                {userSentiment.label}
              </h1>
              <p className="mt-2 max-w-prose text-lede text-ink-muted">
                {SENTIMENT_DESCRIPTIONS[userSentiment.label]}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="chip">
                  <SlidersHorizontal size={12} aria-hidden="true" />
                  {source.label}
                </span>
                {source.detail && <span className="text-meta text-ink-faint">{source.detail}</span>}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-line-strong bg-surface-raised px-4 py-2 text-sm font-medium text-ink transition-colors duration-fast hover:border-accent/50 hover:text-accent"
            >
              Change mood
            </button>
          </div>

          {userSentiment.isUncertain && (
            <p className="mt-5 flex items-start gap-2.5 rounded-card border border-line bg-surface-sunken p-3.5 text-sm text-ink-muted">
              <Info size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <span>
                We couldn&rsquo;t read a clear mood from that. Try describing how you feel in a
                little more detail, or pick a mood directly.
              </span>
            </p>
          )}
        </section>
      )}

      <MovieList />
    </div>
  );
};

export default Recommendations;
