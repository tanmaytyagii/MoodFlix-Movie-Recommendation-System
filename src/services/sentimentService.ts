import { Sentiment, SentimentLabel } from '../types';
import {
  MOOD_TERMS,
  MOOD_PHRASES,
  MOOD_ANTONYMS,
  NEGATORS,
  NEGATION_WINDOW,
  INTENSIFIERS,
  DOWNTONERS,
} from './moodLexicon';

/**
 * Lexicon-based mood classifier.
 *
 * This is a transparent rule-based heuristic, NOT a trained model. It exists so
 * MoodFlix works instantly, offline, and with zero inference cost, and so it can
 * serve as the fallback when the hosted emotion model is unavailable. The
 * `source: 'lexicon'` field on the result makes that distinction visible to the
 * UI, which labels the number "mood match" rather than "model confidence".
 */

const TERM_WEIGHT = 1;
const PHRASE_BASE_WEIGHT = 1.8;
/** Each word beyond the second makes a phrase more specific, so worth more. */
const PHRASE_LENGTH_BONUS = 0.25;
const NEGATED_ANTONYM_WEIGHT = 0.75;
const INTENSIFIER_MULTIPLIER = 1.5;
const DOWNTONER_MULTIPLIER = 0.6;

/** Total weight at which we consider the evidence base fully convincing. */
const FULL_EVIDENCE = 3;

/** Below this, we tell the user the mood was unclear instead of pretending. */
export const UNCERTAIN_THRESHOLD = 0.45;

/**
 * Conservative suffix stripper. Used only to merge morphological variants of
 * terms that are already in the lexicon — both the lexicon and the input run
 * through it, so it can never invent a match for a word we never listed.
 */
export const stem = (word: string): string => {
  if (word.length <= 3) return word;
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('sses')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) return word.slice(0, -1);
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  return word;
};

/** Lower-case, strip punctuation (so "isn't" → "isnt"), collapse whitespace. */
export const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type MoodLabel = Exclude<SentimentLabel, 'neutral'>;

const MOOD_LABELS = Object.keys(MOOD_TERMS) as MoodLabel[];

/** Exact-term index, built once at module load. */
const TERM_INDEX = new Map<string, MoodLabel>();
/** Stemmed index, consulted only when the exact form misses. */
const STEM_INDEX = new Map<string, MoodLabel>();

for (const label of MOOD_LABELS) {
  for (const term of MOOD_TERMS[label]) {
    TERM_INDEX.set(term, label);
    const stemmed = stem(term);
    if (!STEM_INDEX.has(stemmed)) STEM_INDEX.set(stemmed, label);
  }
}

/** Positive-valence moods, used to derive the -1..1 score. */
const POSITIVE_MOODS = new Set<SentimentLabel>(['happy', 'excited', 'relaxed', 'romantic', 'adventurous', 'nostalgic']);
const NEGATIVE_MOODS = new Set<SentimentLabel>(['sad', 'angry', 'fearful', 'melancholic']);

const neutralResult = (source: Sentiment['source']): Sentiment => ({
  score: 0,
  label: 'neutral',
  confidence: 0,
  source,
  matchedTerms: [],
  isUncertain: true,
});

interface Scores {
  weights: Map<SentimentLabel, number>;
  matched: string[];
}

const addWeight = (scores: Scores, label: SentimentLabel, weight: number, evidence: string) => {
  scores.weights.set(label, (scores.weights.get(label) ?? 0) + weight);
  if (!scores.matched.includes(evidence)) scores.matched.push(evidence);
};

const phraseWeight = (phrase: string): number => {
  const words = phrase.split(' ').length;
  return PHRASE_BASE_WEIGHT * (1 + PHRASE_LENGTH_BONUS * Math.max(0, words - 2));
};

/**
 * All phrases, longest first, so "could use a good laugh" is consumed before
 * the shorter phrases nested inside it can claim the same words.
 */
const ORDERED_PHRASES: { label: MoodLabel; phrase: string }[] = MOOD_LABELS
  .flatMap((label) => MOOD_PHRASES[label].map((phrase) => ({ label, phrase })))
  .sort((a, b) => (b.phrase.split(' ').length - a.phrase.split(' ').length) || a.phrase.localeCompare(b.phrase));

/**
 * Score phrase hits and return the text with those hits removed.
 *
 * Consuming the matched span is what stops "rough week" from scoring both the
 * phrase and the bare term `rough`, which previously let one cue count twice.
 */
const scorePhrases = (normalized: string, scores: Scores): string => {
  let remaining = ` ${normalized} `;
  for (const { label, phrase } of ORDERED_PHRASES) {
    const needle = ` ${phrase} `;
    while (remaining.includes(needle)) {
      remaining = remaining.replace(needle, ' ');
      addWeight(scores, label, phraseWeight(phrase), phrase);
    }
  }
  return remaining.trim();
};

const scoreTerms = (tokens: string[], scores: Scores) => {
  /** Index of the token that most recently opened a negation scope. */
  let negationAt = -Infinity;
  let modifier = 1;

  tokens.forEach((token, index) => {
    if (NEGATORS.has(token)) {
      negationAt = index;
      modifier = 1;
      return;
    }
    if (INTENSIFIERS.has(token)) {
      modifier = INTENSIFIER_MULTIPLIER;
      return;
    }
    if (DOWNTONERS.has(token)) {
      modifier = DOWNTONER_MULTIPLIER;
      return;
    }

    const label = TERM_INDEX.get(token) ?? STEM_INDEX.get(stem(token));
    if (!label) return;

    const isNegated = index - negationAt <= NEGATION_WINDOW;

    if (isNegated) {
      // The stated mood is cancelled. Redirect a reduced amount of weight to the
      // opposite mood where one exists; otherwise the mention contributes nothing.
      const antonym = MOOD_ANTONYMS[label];
      if (antonym) {
        addWeight(scores, antonym, NEGATED_ANTONYM_WEIGHT * modifier, `not ${token}`);
      }
    } else {
      addWeight(scores, label, TERM_WEIGHT * modifier, token);
    }

    modifier = 1;
  });
};

/**
 * Deterministic: ties break alphabetically by label so the same input always
 * produces the same mood, regardless of engine sort stability.
 */
const pickDominant = (weights: Map<SentimentLabel, number>): [SentimentLabel, number] | null => {
  const entries = [...weights.entries()].filter(([, weight]) => weight > 0);
  if (entries.length === 0) return null;
  entries.sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]));
  return entries[0];
};

const valenceScore = (label: SentimentLabel, confidence: number): number => {
  if (POSITIVE_MOODS.has(label)) return confidence;
  if (NEGATIVE_MOODS.has(label)) return -confidence;
  return 0; // mysterious / thoughtful / neutral carry no clear valence
};

/**
 * Classify free text into a mood.
 *
 * The returned `confidence` is the dominant mood's share of total matched
 * weight, damped by how much evidence was found at all — a single matched word
 * cannot reach 1.0. It is a match strength, not a probability.
 */
export const analyzeSentiment = (text: string): Sentiment => {
  const normalized = normalize(text);
  if (!normalized) return neutralResult('lexicon');

  const scores: Scores = { weights: new Map(), matched: [] };
  const leftover = scorePhrases(normalized, scores);
  if (leftover) scoreTerms(leftover.split(' '), scores);

  const dominant = pickDominant(scores.weights);
  if (!dominant) return neutralResult('lexicon');

  const [label, topWeight] = dominant;
  const totalWeight = [...scores.weights.values()].reduce((sum, w) => sum + w, 0);

  const share = topWeight / totalWeight;
  const evidence = Math.min(1, totalWeight / FULL_EVIDENCE);
  const confidence = Number((share * (0.5 + 0.5 * evidence)).toFixed(3));

  return {
    score: Number(valenceScore(label, confidence).toFixed(3)),
    label,
    confidence,
    source: 'lexicon',
    matchedTerms: scores.matched,
    isUncertain: confidence < UNCERTAIN_THRESHOLD,
  };
};

/** Build the Sentiment for a mood the user picked explicitly. */
export const manualSentiment = (label: SentimentLabel): Sentiment => ({
  score: valenceScore(label, 1),
  label,
  confidence: 1,
  source: 'manual',
  matchedTerms: [],
  isUncertain: false,
});
