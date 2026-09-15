/**
 * A small, dependency-free TF-IDF + cosine similarity implementation.
 *
 * This is the same technique as the exploratory notebook
 * (`notebooks/ProjectRecommendation.ipynb`), reimplemented to run over live
 * TMDB metadata at request time rather than over a 2.6 MB CSV shipped to the
 * browser. See the README's Recommendation System section.
 *
 * Everything here is pure and deterministic: identical inputs always produce
 * identical rankings.
 */

/** High-frequency English words plus film-blurb filler that carries no signal. */
const STOP_WORDS = new Set([
  'a', 'about', 'after', 'again', 'against', 'all', 'also', 'am', 'an', 'and',
  'another', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before',
  'being', 'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does',
  'doing', 'down', 'during', 'each', 'even', 'ever', 'every', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'however', 'i', 'if',
  'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'must', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'will', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  // Film-synopsis filler: appears in a large share of overviews.
  'film', 'movie', 'story', 'stories', 'new', 'one', 'two', 'life', 'lives',
  'man', 'woman', 'young', 'old', 'world', 'time', 'times', 'find', 'finds',
  'must', 'get', 'gets', 'take', 'takes', 'make', 'makes', 'back', 'set',
]);

const MIN_TOKEN_LENGTH = 3;

/**
 * Light suffix stripper so "killer"/"killers" and "escape"/"escapes" collide.
 * Intentionally conservative — an aggressive stemmer creates false matches that
 * are worse than the recall it buys.
 */
export const stemToken = (token: string): string => {
  if (token.length <= 4) return token;
  if (token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.endsWith('sses')) return token.slice(0, -2);
  if (token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) return token.slice(0, -1);
  if (token.endsWith('ing') && token.length > 6) return token.slice(0, -3);
  if (token.endsWith('ed') && token.length > 5) return token.slice(0, -2);
  return token;
};

/** Lower-case, strip non-letters, drop stop words and very short tokens, then stem. */
export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH && !STOP_WORDS.has(token))
    .map(stemToken);

/** A document's term vector, L2-normalised so cosine similarity is a dot product. */
export type TermVector = Map<string, number>;

export interface TfIdfModel {
  /** term → inverse document frequency */
  idf: Map<string, number>;
  documentCount: number;
}

/**
 * Fit IDF weights over a corpus.
 *
 * Uses the smoothed form `ln((1 + N) / (1 + df)) + 1`, which keeps weights
 * positive even for a term present in every document.
 */
export const buildTfIdfModel = (corpus: string[][]): TfIdfModel => {
  const documentFrequency = new Map<string, number>();

  for (const tokens of corpus) {
    for (const term of new Set(tokens)) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, df] of documentFrequency) {
    idf.set(term, Math.log((1 + corpus.length) / (1 + df)) + 1);
  }

  return { idf, documentCount: corpus.length };
};

/** Project a token list into L2-normalised TF-IDF space. */
export const vectorize = (model: TfIdfModel, tokens: string[]): TermVector => {
  const vector: TermVector = new Map();
  if (tokens.length === 0) return vector;

  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);

  let sumOfSquares = 0;
  for (const [term, count] of counts) {
    const idf = model.idf.get(term);
    if (idf === undefined) continue; // term unseen in the corpus — no weight
    const weight = (count / tokens.length) * idf;
    vector.set(term, weight);
    sumOfSquares += weight * weight;
  }

  if (sumOfSquares === 0) return new Map();

  const norm = Math.sqrt(sumOfSquares);
  for (const [term, weight] of vector) vector.set(term, weight / norm);

  return vector;
};

/**
 * Cosine similarity of two L2-normalised vectors, clamped to [0, 1].
 * Returns 0 when either vector is empty rather than NaN.
 */
export const cosineSimilarity = (a: TermVector, b: TermVector): number => {
  if (a.size === 0 || b.size === 0) return 0;

  // Iterate the smaller vector: the result is symmetric and this is cheaper.
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];

  let dot = 0;
  for (const [term, weight] of smaller) {
    const other = larger.get(term);
    if (other !== undefined) dot += weight * other;
  }

  return Math.min(1, Math.max(0, dot));
};
