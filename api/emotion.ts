import { createHandler, jsonError, ProxyResult } from './_shared';

/**
 * Hosted emotion-classification proxy.
 *
 *   Browser → POST /api/emotion → Hugging Face Inference API
 *
 * The model is `j-hartmann/emotion-english-distilroberta-base`: a publicly
 * available DistilRoBERTa fine-tuned for 7-way emotion classification. MoodFlix
 * does **not** train this model — it consumes it. See the README's Machine
 * Learning section for exactly what that means.
 *
 * This endpoint is optional. With no `HUGGINGFACE_API_TOKEN` configured it
 * returns 503 and the client falls back to the local lexicon engine, so the app
 * stays fully functional either way.
 *
 * POST rather than GET so the user's free-text mood description does not end up
 * in server access logs or CDN cache keys.
 */

const DEFAULT_MODEL = 'j-hartmann/emotion-english-distilroberta-base';
const INFERENCE_BASE_URL = 'https://api-inference.huggingface.co/models';
const UPSTREAM_TIMEOUT_MS = 10000;
const MAX_INPUT_CHARS = 1000;

/**
 * The model's label space → the MoodFlix mood taxonomy.
 *
 * `surprise` maps to `excited` and `disgust` to `angry`: neither has a direct
 * MoodFlix equivalent, and these are the closest matches in terms of what a
 * viewer in that state actually wants to watch.
 */
const EMOTION_TO_MOOD: Record<string, string> = {
  joy: 'happy',
  sadness: 'sad',
  anger: 'angry',
  disgust: 'angry',
  fear: 'fearful',
  surprise: 'excited',
  neutral: 'neutral',
};

interface HuggingFaceScore {
  label: string;
  score: number;
}

const isScoreArray = (value: unknown): value is HuggingFaceScore[] =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      typeof (entry as HuggingFaceScore).label === 'string' &&
      typeof (entry as HuggingFaceScore).score === 'number',
  );

/** HF text-classification returns `[[{label,score}...]]`; older shapes return a flat array. */
const extractScores = (payload: unknown): HuggingFaceScore[] | null => {
  if (isScoreArray(payload)) return payload;
  if (Array.isArray(payload) && payload.length > 0 && isScoreArray(payload[0])) return payload[0];
  return null;
};

export const handleEmotionRequest = async (
  _url: URL,
  body: Record<string, unknown>,
): Promise<ProxyResult> => {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) {
    return jsonError(
      503,
      'Emotion model is not configured on the server.',
      'model_not_configured',
    );
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    return jsonError(400, 'Request body must include a non-empty "text" string.', 'missing_text');
  }
  if (text.length > MAX_INPUT_CHARS) {
    return jsonError(413, `"text" must be ${MAX_INPUT_CHARS} characters or fewer.`, 'text_too_long');
  }

  const model = process.env.HUGGINGFACE_EMOTION_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${INFERENCE_BASE_URL}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: false } }),
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return aborted
      ? jsonError(504, 'Emotion model did not respond in time.', 'upstream_timeout')
      : jsonError(502, 'Could not reach the emotion model.', 'upstream_unreachable');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // 503 from HF means the model is cold-starting — a retry may succeed, but we
    // would rather fall back instantly than make the user wait.
    if (response.status === 503) {
      return jsonError(503, 'Emotion model is warming up.', 'model_loading');
    }
    if (response.status === 401 || response.status === 403) {
      return jsonError(502, 'Inference provider rejected the server credential.', 'upstream_auth_failed');
    }
    if (response.status === 429) {
      return jsonError(429, 'Rate limited by the inference provider.', 'rate_limited');
    }
    return jsonError(502, 'Emotion model returned an error.', 'upstream_error');
  }

  const payload: unknown = await response.json();
  const scores = extractScores(payload);
  if (!scores || scores.length === 0) {
    return jsonError(502, 'Emotion model returned an unexpected response.', 'bad_upstream_shape');
  }

  const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
  const mood = EMOTION_TO_MOOD[best.label.toLowerCase()];
  if (!mood) {
    return jsonError(502, 'Emotion model returned an unrecognised label.', 'unknown_label');
  }

  return {
    status: 200,
    body: JSON.stringify({
      mood,
      confidence: best.score,
      model,
      rawLabel: best.label,
    }),
  };
};

export default createHandler(handleEmotionRequest, { method: 'POST' });
