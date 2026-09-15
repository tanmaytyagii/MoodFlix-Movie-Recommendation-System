import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/useAppContext';
import { SentimentLabel } from '../types';
import { SELECTABLE_SENTIMENTS, SENTIMENT_COLORS } from '../utils/constants';
import MoodIcon from './MoodIcon';

/** Starter phrases. Real sentences, to show free text is genuinely understood. */
const EXAMPLES = [
  'Had a rough week, could use a good laugh',
  'Exhausted — something light and easy',
  'Keep me guessing until the very end',
];

type Tab = 'describe' | 'pick';

const SentimentForm: React.FC = () => {
  const [text, setText] = useState('');
  const [tab, setTab] = useState<Tab>('describe');
  const [pending, setPending] = useState<SentimentLabel | null>(null);
  const { analyzeSentimentAndGetMovies, setUserSentimentManually, isLoading } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    await analyzeSentimentAndGetMovies(text);
    navigate('/recommendations');
  };

  const handlePick = async (mood: SentimentLabel) => {
    setPending(mood);
    try {
      await setUserSentimentManually(mood);
      navigate('/recommendations');
    } finally {
      setPending(null);
    }
  };

  const tabClass = (active: boolean) =>
    [
      'relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-fast',
      active ? 'bg-surface-hover text-ink shadow-card' : 'text-ink-muted hover:text-ink',
    ].join(' ');

  return (
    <div className="rounded-panel border border-line bg-surface/80 p-5 shadow-lift backdrop-blur-sm sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            How are you feeling?
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Describe it in your own words, or pick a mood.
          </p>
        </div>

        <div
          role="group"
          aria-label="Choose how to set your mood"
          className="flex rounded-xl border border-line bg-surface-sunken p-1"
        >
          <button type="button" onClick={() => setTab('describe')} aria-pressed={tab === 'describe'} className={tabClass(tab === 'describe')}>
            Describe
          </button>
          <button type="button" onClick={() => setTab('pick')} aria-pressed={tab === 'pick'} className={tabClass(tab === 'pick')}>
            Pick a mood
          </button>
        </div>
      </div>

      {tab === 'describe' ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor="moodText" className="sr-only">
            Describe how you&rsquo;re feeling
          </label>
          <textarea
            id="moodText"
            rows={3}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Tell us how you're feeling, or what you're in the mood to watch…"
            required
            className="w-full resize-none rounded-xl border border-line bg-surface-sunken p-4 text-base leading-relaxed text-ink placeholder:text-ink-faint transition-colors duration-fast hover:border-line-strong focus:border-accent/60"
          />

          <div className="mt-4">
            <p className="eyebrow mb-2">Try one of these</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setText(example)}
                  className="rounded-full border border-line bg-surface-raised px-3 py-1.5 text-meta text-ink-muted transition-colors duration-fast hover:border-line-strong hover:text-ink"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-accent-contrast transition-colors duration-fast hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-ink-faint sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Reading your mood…
              </>
            ) : (
              <>
                Find my films
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {SELECTABLE_SENTIMENTS.map((mood) => {
              const busy = pending === mood;
              return (
                <li key={mood}>
                  <button
                    type="button"
                    onClick={() => handlePick(mood)}
                    disabled={isLoading}
                    style={{ ['--mood' as string]: SENTIMENT_COLORS[mood] }}
                    className="group flex min-h-[52px] w-full items-center gap-2.5 rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-left transition-[border-color,background-color,transform] duration-fast hover:-translate-y-0.5 hover:border-[color:var(--mood)] hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[color:var(--mood)]"
                      style={{ backgroundColor: `${SENTIMENT_COLORS[mood]}1F` }}
                    >
                      {busy ? (
                        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <MoodIcon mood={mood} size={16} />
                      )}
                    </span>
                    <span className="truncate text-sm font-medium capitalize text-ink-muted transition-colors duration-fast group-hover:text-ink">
                      {mood}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {isLoading && (
            <p role="status" className="mt-4 text-center text-meta text-ink-faint">
              Finding films for that mood…
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SentimentForm;
