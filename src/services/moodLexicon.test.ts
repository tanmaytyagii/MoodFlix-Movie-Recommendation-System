import { describe, expect, it } from 'vitest';
import { MOOD_PHRASES, MOOD_TERMS, MOOD_ANTONYMS } from './moodLexicon';
import { SENTIMENT_COLORS, SENTIMENT_DESCRIPTIONS, SENTIMENT_EMOJIS, SENTIMENT_GENRE_MAP } from '../utils/constants';
import { SentimentLabel } from '../types';

const MOODS = Object.keys(MOOD_TERMS) as Exclude<SentimentLabel, 'neutral'>[];

describe('mood lexicon', () => {
  /**
   * The invariant that the old engine violated: `excited` appeared in both the
   * happy and excited lists, so it scored for two moods at once.
   */
  it('never assigns a term to more than one mood', () => {
    const owner = new Map<string, string>();
    const duplicates: string[] = [];

    for (const mood of MOODS) {
      for (const term of MOOD_TERMS[mood]) {
        const existing = owner.get(term);
        if (existing) duplicates.push(`"${term}" in both ${existing} and ${mood}`);
        else owner.set(term, mood);
      }
    }

    expect(duplicates).toEqual([]);
  });

  it('never assigns a phrase to more than one mood', () => {
    const all = MOODS.flatMap((mood) => MOOD_PHRASES[mood]);
    expect(all.length).toBe(new Set(all).size);
  });

  it('has no duplicate terms within a single mood', () => {
    for (const mood of MOODS) {
      expect(MOOD_TERMS[mood].length).toBe(new Set(MOOD_TERMS[mood]).size);
    }
  });

  it('stores every term lower-case and free of punctuation', () => {
    for (const mood of MOODS) {
      for (const term of MOOD_TERMS[mood]) {
        expect(term).toMatch(/^[a-z]+$/);
      }
    }
  });

  it('stores phrases as lower-case multi-word strings', () => {
    for (const mood of MOODS) {
      for (const phrase of MOOD_PHRASES[mood]) {
        expect(phrase).toMatch(/^[a-z]+( [a-z]+)+$/);
      }
    }
  });

  it('only maps antonyms to real moods', () => {
    for (const [mood, antonym] of Object.entries(MOOD_ANTONYMS)) {
      expect(MOODS).toContain(mood);
      expect([...MOODS, 'neutral']).toContain(antonym);
    }
  });
});

describe('mood presentation tables', () => {
  const ALL: SentimentLabel[] = [...MOODS, 'neutral'];

  it.each([
    ['genres', SENTIMENT_GENRE_MAP],
    ['descriptions', SENTIMENT_DESCRIPTIONS],
    ['emojis', SENTIMENT_EMOJIS],
    ['colors', SENTIMENT_COLORS],
  ])('defines %s for every mood', (_name, table) => {
    for (const mood of ALL) {
      expect(table[mood]).toBeDefined();
    }
  });

  it('maps every non-neutral mood to at least one TMDB genre', () => {
    for (const mood of MOODS) {
      expect(SENTIMENT_GENRE_MAP[mood].length).toBeGreaterThan(0);
    }
  });

  // Deliberate: with no readable mood we show trending rather than guess.
  it('leaves neutral without a genre mapping', () => {
    expect(SENTIMENT_GENRE_MAP.neutral).toEqual([]);
  });
});
