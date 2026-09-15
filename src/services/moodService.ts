import { Sentiment, SentimentLabel } from '../types';
import { createApiClient } from './apiClient';
import { analyzeSentiment } from './sentimentService';

/**
 * Mood classification entry point.
 *
 * Two tiers, in order of preference:
 *
 *  1. A hosted transformer (`/api/emotion` → DistilRoBERTa emotion classifier).
 *     Accurate on natural phrasing, but covers only 7 coarse emotions and needs
 *     a configured inference token.
 *  2. The local lexicon engine (`sentimentService`). Always available, zero
 *     latency, and covers MoodFlix's finer 12-mood taxonomy — including moods
 *     the model has no label for at all (nostalgic, mysterious, thoughtful).
 *
 * The model wins when it is confident about a non-neutral emotion. Otherwise the
 * lexicon does, because "neutral" from the model often just means "an emotion I
 * was not trained on". Either way `Sentiment.source` records which tier decided,
 * and the UI labels the number accordingly — a model probability and a lexicon
 * match strength are not the same quantity.
 */

const EMOTION_ENDPOINT = '/api/emotion';
const CLIENT_TIMEOUT_MS = 8000;

/** Below this the model is not adding anything over the lexicon. */
const MODEL_CONFIDENCE_FLOOR = 0.5;

const client = createApiClient(EMOTION_ENDPOINT, CLIENT_TIMEOUT_MS);

interface EmotionResponse {
  mood?: string;
  confidence?: number;
  model?: string;
  rawLabel?: string;
}

const MODEL_MOODS = new Set<SentimentLabel>(['happy', 'sad', 'angry', 'fearful', 'excited', 'neutral']);

const isModelMood = (value: string): value is SentimentLabel =>
  MODEL_MOODS.has(value as SentimentLabel);

const POSITIVE = new Set<SentimentLabel>(['happy', 'excited']);
const NEGATIVE = new Set<SentimentLabel>(['sad', 'angry', 'fearful']);

const valence = (label: SentimentLabel, confidence: number): number => {
  if (POSITIVE.has(label)) return confidence;
  if (NEGATIVE.has(label)) return -confidence;
  return 0;
};

/**
 * Ask the hosted model. Returns `null` for every failure mode — not configured,
 * cold-starting, rate limited, offline — so the caller can fall back silently.
 */
const classifyWithModel = async (text: string): Promise<Sentiment | null> => {
  try {
    const { data } = await client.post<EmotionResponse>('', { text });

    if (!data?.mood || typeof data.confidence !== 'number') return null;
    if (!isModelMood(data.mood)) return null;

    const confidence = Number(data.confidence.toFixed(3));
    if (data.mood === 'neutral' || confidence < MODEL_CONFIDENCE_FLOOR) return null;

    return {
      score: Number(valence(data.mood, confidence).toFixed(3)),
      label: data.mood,
      confidence,
      source: 'model',
      matchedTerms: [],
      isUncertain: false,
    };
  } catch {
    // Expected whenever inference is unconfigured or unavailable. The lexicon
    // covers it, so this is not worth surfacing to the user.
    return null;
  }
};

/**
 * Classify free text into a mood, preferring the hosted model and falling back
 * to the local lexicon. Never throws — the lexicon always produces a result.
 */
export const classifyMood = async (text: string): Promise<Sentiment> => {
  if (!text.trim()) return analyzeSentiment(text);

  const fromModel = await classifyWithModel(text);
  return fromModel ?? analyzeSentiment(text);
};
