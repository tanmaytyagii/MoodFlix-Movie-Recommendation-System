import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Database, Shield, Sparkles } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const PILLARS = [
  {
    icon: Brain,
    title: 'Reading your mood',
    body: 'Your text is classified into one of twelve moods. A hosted DistilRoBERTa emotion model handles it when available; otherwise a built-in keyword engine takes over. That engine understands negation, so “I’m not happy” does not read as happy. MoodFlix always tells you which one produced the result.',
  },
  {
    icon: Database,
    title: 'Finding the films',
    body: 'Each mood maps to a curated set of TMDB genres — melancholic leans toward drama and quieter romance, excited toward action and science fiction. MoodFlix then queries TMDB for well-reviewed films in those genres.',
  },
  {
    icon: Sparkles,
    title: 'More like this',
    body: 'On any film’s page, MoodFlix builds TF-IDF vectors from overviews, genres and keywords, then ranks candidates by cosine similarity. This is content-based filtering — it compares films to each other, not viewers to each other.',
  },
];

/** Deliberately precise: no claim here outruns what the code actually does. */
const About: React.FC = () => (
  <div className="container-page py-12 sm:py-16">
    <header className="max-w-prose">
      <p className="eyebrow mb-4">About</p>
      <h1 className="text-title text-balance text-ink">
        Film discovery that starts with how you feel
      </h1>
      <p className="mt-5 text-lede text-ink-muted">
        MoodFlix recommends films based on your mood right now, rather than asking you to pick a
        genre from a dropdown. Describe it in your own words — or choose one directly — and MoodFlix
        maps it to the kinds of films that suit it.
      </p>
    </header>

    <section className="mt-14 sm:mt-20" aria-labelledby="how-heading">
      <SectionHeading id="how-heading" eyebrow="How it works" title="Three moving parts" />
      <div className="mt-8 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-3">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <article key={title} className="bg-surface p-6 lg:p-7">
            <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
              <Icon size={18} aria-hidden="true" strokeWidth={1.75} />
            </span>
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="mt-14 grid gap-8 sm:mt-20 lg:grid-cols-2" aria-labelledby="honesty-heading">
      <div className="rounded-panel border border-line bg-surface p-6 lg:p-8">
        <h2 id="honesty-heading" className="text-base font-semibold text-ink">
          What MoodFlix does not claim
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          No model was trained for this project, so no accuracy, precision, recall or F1 figure is
          published anywhere in it. The emotion classifier is a publicly available pretrained model
          consumed through an inference API; the fallback is a transparent rule-based lexicon, and
          the interface labels its score a <em>mood match</em> rather than a model probability.
        </p>
      </div>

      <div className="rounded-panel border border-line bg-surface p-6 lg:p-8">
        <div className="mb-3 flex items-center gap-2.5">
          <Shield size={17} className="text-positive" aria-hidden="true" />
          <h2 className="text-base font-semibold text-ink">Privacy and data</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">
          There are no accounts and no database. What you type is sent for classification and then
          discarded — it is never written to disk, and mood text is sent by POST so it does not
          appear in server logs. TMDB requests go through MoodFlix&rsquo;s own backend, so your
          browser never talks to TMDB directly.
        </p>
      </div>
    </section>

    <section className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8 sm:mt-20">
      <p className="max-w-prose text-meta text-ink-faint">
        Movie data from{' '}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
        >
          The Movie Database
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors duration-fast hover:bg-accent-strong"
      >
        Find something to watch
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  </div>
);

export default About;
