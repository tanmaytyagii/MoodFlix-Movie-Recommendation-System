import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Movie } from '../types';
import { getTrendingMovies } from '../services/tmdbService';
import { TMDB_IMAGE_BASE_URL } from '../utils/constants';
import SentimentForm from '../components/SentimentForm';
import MovieGrid from '../components/MovieGrid';
import MovieGridSkeleton from '../components/MovieGridSkeleton';
import SectionHeading from '../components/SectionHeading';

const TRENDING_ON_HOME = 12;

/** What the product does, in its own words. No inflated claims. */
const STEPS = [
  {
    step: '01',
    title: 'Say how you feel',
    body: 'Free text or a mood chip. Negation is handled — “not happy” does not read as happy.',
  },
  {
    step: '02',
    title: 'We read the mood',
    body: 'An emotion model classifies it, with a transparent keyword engine as the fallback.',
  },
  {
    step: '03',
    title: 'Films that fit',
    body: 'Each mood maps to a curated set of genres, then pulls well-reviewed films from TMDB.',
  },
];

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // One request serves both the hero backdrop and the trending grid below.
  useEffect(() => {
    let cancelled = false;
    getTrendingMovies()
      .then((movies) => {
        if (!cancelled) setTrending(movies);
      })
      .catch(() => {
        if (!cancelled) setTrending([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const heroBackdrop = trending.find((movie) => movie.backdrop_path)?.backdrop_path ?? null;

  return (
    <>
      <section className="relative isolate overflow-hidden">
        {/* Cinematic plate: a real backdrop from what is trending right now,
            dimmed hard so type stays legible and the image reads as atmosphere. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          {heroBackdrop && (
            <img
              src={`${TMDB_IMAGE_BASE_URL}/w1280${heroBackdrop}`}
              alt=""
              className="h-full w-full object-cover object-center opacity-[0.55]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-canvas/70 via-canvas/80 to-canvas" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/55 to-transparent" />
        </div>

        <div className="container-page pb-14 pt-10 sm:pb-20 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-14">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">Mood-first film discovery</p>
              <h1 className="text-display text-balance text-ink">
                Watch something that
                <span className="text-accent"> matches how you feel</span>
              </h1>
              <p className="mt-5 max-w-lg text-lede text-ink-muted">
                Skip the endless scroll. Tell MoodFlix what kind of evening you&rsquo;re having and
                it will find films that fit — powered by live data from TMDB.
              </p>
              {/* Dividers drawn as borders rather than dot elements, so a wrap
                  never strands a separator at the end of a line. */}
              {/* Stacked on the narrowest screens; inline with hairline
                  dividers from `xs` up, so a wrap never strands a separator. */}
              <ul className="mt-7 flex flex-col gap-1 text-meta text-ink-faint xs:flex-row xs:flex-wrap xs:gap-y-1">
                {['12 moods', 'Content-based similarity', 'No account needed'].map((fact, index) => (
                  <li
                    key={fact}
                    className={index > 0 ? 'xs:ml-4 xs:border-l xs:border-line xs:pl-4' : ''}
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:justify-self-end lg:pt-2">
              <SentimentForm />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20" aria-labelledby="trending-heading">
        <SectionHeading
          id="trending-heading"
          eyebrow="Popular now"
          title="Trending this week"
          action={
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 rounded-lg px-1 text-sm font-medium text-ink-muted transition-colors duration-fast hover:text-accent"
            >
              Browse all
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-7">
          {loading ? (
            <MovieGridSkeleton count={TRENDING_ON_HOME} label="Loading trending films" />
          ) : trending.length > 0 ? (
            <MovieGrid movies={trending.slice(0, TRENDING_ON_HOME)} />
          ) : (
            // Non-blocking: the hero and mood form above still work.
            <p className="rounded-card border border-line bg-surface p-6 text-sm text-ink-muted">
              Trending films are unavailable right now. Pick a mood above to get recommendations.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-surface-sunken/60" aria-labelledby="how-heading">
        <div className="container-page py-14 sm:py-20">
          <SectionHeading id="how-heading" eyebrow="How it works" title="Three steps, no sign-up" />
          <ol className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="border-t border-line pt-5">
                <span className="text-meta font-semibold tabular-nums text-accent">{item.step}</span>
                <h3 className="mt-2 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
};

export default Home;
