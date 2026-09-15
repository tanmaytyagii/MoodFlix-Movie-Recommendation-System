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
  const { analyzeSentimentAndGetMovies, setUserSentimentManually, isLoading, userSentiment } =
    useAppContext();
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
      'pressable relative rounded-lg px-4 py-2 text-sm font-medium',
      active ? 'bg-white/[0.09] text-ink shadow-control' : 'text-ink-muted hover:text-ink',
    ].join(' ');

  return (
    <div className="glass glass-edge rounded-[1.5rem] p-5 sm:p-6">
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
          className="flex rounded-xl border border-black/40 bg-black/25 p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
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
            className="w-full resize-none rounded-xl border border-black/40 bg-black/25 p-4 text-base leading-relaxed text-ink shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] transition-depth duration-base ease-out placeholder:text-ink-faint hover:border-white/15 focus:border-accent/50 focus:shadow-gold-glow"
          />

          <div className="mt-4">
            <p className="eyebrow mb-2">Try one of these</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setText(example)}
                  className="pressable rounded-full border border-cinematic-border bg-glass-surface px-3 py-1.5 text-meta text-ink-muted backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.08] hover:text-ink"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="pressable mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-accent-contrast shadow-gold-glow hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-ink-faint disabled:shadow-none sm:w-auto"
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
          {/*
            Three columns, icon stacked above the label.

            The previous layout put a 32px icon beside the label inside a 92px
            button, leaving 24px of text box for words needing up to 86px — so
            every name was clipped to a single letter. Stacking gives the label
            the full button width, and dropping to two columns below `xs` keeps
            it readable down to 320px.
          */}
          <ul className="grid grid-cols-2 gap-2.5 xs:grid-cols-3">
            {SELECTABLE_SENTIMENTS.map((mood) => {
              const busy = pending === mood;
              const selected = userSentiment?.label === mood;
              return (
                <li key={mood}>
                  <button
                    type="button"
                    onClick={() => handlePick(mood)}
                    disabled={isLoading}
                    aria-pressed={selected}
                    style={{ ['--mood' as string]: SENTIMENT_COLORS[mood] }}
                    className={[
                      'pressable group relative flex min-h-[94px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-2 py-3 text-center',
                      'bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-sm',
                      'shadow-ambient-shadow hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-depth-shadow',
                      'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100',
                      selected
                        ? 'border-accent/55 shadow-gold-glow'
                        : 'border-cinematic-border hover:border-[color:var(--mood)]/50',
                    ].join(' ')}
                  >
                    {/* Accent glow, only on the selected mood — not all twelve. */}
                    {selected && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-70"
                        style={{
                          background:
                            'radial-gradient(85% 70% at 50% 0%, rgba(232,179,62,0.28) 0%, transparent 72%)',
                        }}
                      />
                    )}

                    <span
                      className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-[color:var(--mood)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_2px_6px_-2px_rgba(0,0,0,0.6)] transition-transform duration-base ease-out group-hover:-translate-y-0.5"
                      style={{
                        background: `radial-gradient(120% 120% at 50% 0%, ${SENTIMENT_COLORS[mood]}33 0%, ${SENTIMENT_COLORS[mood]}12 60%, transparent 100%)`,
                      }}
                    >
                      {busy ? (
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <MoodIcon mood={mood} size={18} />
                      )}
                    </span>

                    {/*
                      No `truncate` here: the label must always be readable in
                      full, and may wrap rather than clip.
                    */}
                    <span
                      className={[
                        'relative text-[0.8125rem] font-medium capitalize leading-tight transition-colors duration-fast',
                        selected ? 'text-ink' : 'text-ink-muted group-hover:text-ink',
                      ].join(' ')}
                    >
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
