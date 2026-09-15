import { describe, expect, it } from 'vitest';
import { buildTfIdfModel, cosineSimilarity, stemToken, tokenize, vectorize } from './tfidf';

describe('tokenize', () => {
  it('lower-cases, strips punctuation and drops stop words', () => {
    expect(tokenize('The Heist and THE Getaway!')).toEqual(['heist', 'getaway']);
  });

  it('drops tokens shorter than three characters', () => {
    expect(tokenize('a an ok spy')).toEqual(['spy']);
  });

  it('removes film-blurb filler that carries no signal', () => {
    // "movie", "young" and "man" appear in a large share of TMDB overviews.
    expect(tokenize('a movie about a young man')).toEqual([]);
    expect(tokenize('a movie about a young assassin')).toEqual(['assassin']);
  });

  it('returns an empty list for text with no content words', () => {
    expect(tokenize('the and of it')).toEqual([]);
  });
});

describe('stemToken', () => {
  it('collapses plurals and common verb endings', () => {
    expect(stemToken('killers')).toBe(stemToken('killer'));
    expect(stemToken('bodies')).toBe('body');
  });

  it('leaves short words and -ss endings alone', () => {
    expect(stemToken('spy')).toBe('spy');
    expect(stemToken('glass')).toBe('glass');
  });
});

describe('buildTfIdfModel', () => {
  it('weights a rare term above a ubiquitous one', () => {
    const model = buildTfIdfModel([
      ['heist', 'crime'],
      ['heist', 'romance'],
      ['heist', 'submarine'],
    ]);
    expect(model.idf.get('submarine')!).toBeGreaterThan(model.idf.get('heist')!);
  });

  it('keeps idf positive even for a term in every document', () => {
    const model = buildTfIdfModel([['heist'], ['heist']]);
    expect(model.idf.get('heist')!).toBeGreaterThan(0);
  });

  it('handles an empty corpus', () => {
    const model = buildTfIdfModel([]);
    expect(model.documentCount).toBe(0);
    expect(model.idf.size).toBe(0);
  });
});

describe('vectorize', () => {
  it('produces a unit-length vector', () => {
    const model = buildTfIdfModel([['heist', 'crime'], ['romance', 'paris']]);
    const vector = vectorize(model, ['heist', 'crime']);
    const magnitude = Math.sqrt([...vector.values()].reduce((sum, w) => sum + w * w, 0));
    expect(magnitude).toBeCloseTo(1, 10);
  });

  it('returns an empty vector for tokens the corpus never saw', () => {
    const model = buildTfIdfModel([['heist']]);
    expect(vectorize(model, ['submarine']).size).toBe(0);
  });

  it('returns an empty vector for empty input', () => {
    expect(vectorize(buildTfIdfModel([['heist']]), []).size).toBe(0);
  });
});

describe('cosineSimilarity', () => {
  const model = buildTfIdfModel([
    ['heist', 'crime', 'vault'],
    ['heist', 'crime', 'bank'],
    ['romance', 'paris', 'wedding'],
  ]);

  it('scores an identical document at 1', () => {
    const vector = vectorize(model, ['heist', 'crime', 'vault']);
    expect(cosineSimilarity(vector, vector)).toBeCloseTo(1, 10);
  });

  it('scores documents with no shared terms at 0', () => {
    const a = vectorize(model, ['heist', 'crime', 'vault']);
    const b = vectorize(model, ['romance', 'paris', 'wedding']);
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it('ranks a closer document above a more distant one', () => {
    const reference = vectorize(model, ['heist', 'crime', 'vault']);
    const near = vectorize(model, ['heist', 'crime', 'bank']);
    const far = vectorize(model, ['romance', 'paris', 'wedding']);
    expect(cosineSimilarity(reference, near)).toBeGreaterThan(cosineSimilarity(reference, far));
  });

  it('is symmetric', () => {
    const a = vectorize(model, ['heist', 'crime', 'vault']);
    const b = vectorize(model, ['heist', 'crime', 'bank']);
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 12);
  });

  it('returns 0 rather than NaN for an empty vector', () => {
    expect(cosineSimilarity(new Map(), vectorize(model, ['heist']))).toBe(0);
  });

  it('never exceeds the 0..1 range', () => {
    const a = vectorize(model, ['heist', 'heist', 'crime']);
    const b = vectorize(model, ['heist', 'crime', 'crime']);
    const score = cosineSimilarity(a, b);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
