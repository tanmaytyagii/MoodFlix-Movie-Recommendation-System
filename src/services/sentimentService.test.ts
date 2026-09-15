import { describe, expect, it } from 'vitest';
import { analyzeSentiment, manualSentiment, normalize, stem, UNCERTAIN_THRESHOLD } from './sentimentService';

describe('analyzeSentiment', () => {
  it('reads a plainly stated positive mood', () => {
    const result = analyzeSentiment('I am happy');
    expect(result.label).toBe('happy');
    expect(result.score).toBeGreaterThan(0);
    expect(result.source).toBe('lexicon');
  });

  // The headline bug in the previous engine: it counted the keyword and ignored
  // the "not" in front of it.
  it('does not read a negated positive as positive', () => {
    const result = analyzeSentiment('I am not happy');
    expect(result.label).not.toBe('happy');
    expect(result.score).toBeLessThan(0);
  });

  it.each([
    ["I'm not happy at all today", 'happy'],
    ['I never feel joyful lately', 'happy'],
    ["I don't feel excited about anything", 'excited'],
    ["I'm not scared of horror films", 'fearful'],
  ])('%s is not classified as %s', (text, forbidden) => {
    expect(analyzeSentiment(text).label).not.toBe(forbidden);
  });

  it('redirects a negated mood to its opposite', () => {
    expect(analyzeSentiment('I am not happy').label).toBe('sad');
    expect(analyzeSentiment('I am not sad').label).toBe('happy');
  });

  // "excited" used to live in both the happy and excited word lists, so a 1-1
  // tie resolved to happy purely by array order.
  it('classifies "I am excited" as excited, not happy', () => {
    expect(analyzeSentiment('I am excited').label).toBe('excited');
  });

  it('reads a plainly stated negative mood', () => {
    expect(analyzeSentiment('I am sad').label).toBe('sad');
  });

  it('handles vocabulary beyond the basic emotions', () => {
    const result = analyzeSentiment('melancholy and wistful');
    expect(result.label).toBe('melancholic');
    expect(result.isUncertain).toBe(false);
  });

  it.each([
    ['I want something romantic tonight', 'romantic'],
    ['feeling nostalgic about my childhood', 'nostalgic'],
    ['something contemplative and philosophical', 'thoughtful'],
    ['I want a mystery that keeps me guessing', 'mysterious'],
    ['craving adventure and exploration', 'adventurous'],
    ['I am furious right now', 'angry'],
  ])('%s → %s', (text, expected) => {
    expect(analyzeSentiment(text).label).toBe(expected);
  });

  describe('neutral and uncertain input', () => {
    it.each(['', '   ', 'asdf qwerty zxcv'])('returns neutral for %j', (text) => {
      const result = analyzeSentiment(text);
      expect(result.label).toBe('neutral');
      expect(result.isUncertain).toBe(true);
      expect(result.confidence).toBe(0);
    });

    it('does not treat generic quality words as a mood', () => {
      // "I want a good movie" describes the film, not the viewer.
      expect(analyzeSentiment('I want a good movie').label).toBe('neutral');
    });

    it('does not read "love" as romantic when it is a verb about genre', () => {
      expect(analyzeSentiment('I love action movies').label).not.toBe('romantic');
    });
  });

  describe('confidence', () => {
    it('stays within 0 and 1', () => {
      for (const text of ['I am happy', 'melancholy and wistful', 'nothing here', 'thrilled and energised and pumped']) {
        const { confidence } = analyzeSentiment(text);
        expect(confidence).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeLessThanOrEqual(1);
      }
    });

    it('rises with more corroborating evidence', () => {
      const weak = analyzeSentiment('I am happy');
      const strong = analyzeSentiment('I am happy, joyful and cheerful');
      expect(strong.confidence).toBeGreaterThan(weak.confidence);
    });

    it('is raised by intensifiers and lowered by downtoners', () => {
      const plain = analyzeSentiment('I am happy').confidence;
      expect(analyzeSentiment('I am very happy').confidence).toBeGreaterThan(plain);
      expect(analyzeSentiment('I am slightly happy').confidence).toBeLessThan(plain);
    });

    it('flags low-confidence results as uncertain', () => {
      const result = analyzeSentiment('nothing meaningful in this string');
      expect(result.isUncertain).toBe(result.confidence < UNCERTAIN_THRESHOLD);
    });
  });

  it('does not double-count a phrase and the words inside it', () => {
    // "rough week" is one cue, not a phrase hit plus a separate "rough" hit.
    const { matchedTerms } = analyzeSentiment('had a rough week');
    expect(matchedTerms).toContain('rough week');
    expect(matchedTerms).not.toContain('rough');
  });

  it('prefers a specific intent phrase over an incidental state word', () => {
    expect(analyzeSentiment('Had a rough week. Could use a good laugh.').label).toBe('happy');
  });

  it('is deterministic across repeated calls', () => {
    const runs = Array.from({ length: 5 }, () => analyzeSentiment('I feel calm but a little curious'));
    expect(new Set(runs.map((run) => run.label)).size).toBe(1);
    expect(new Set(runs.map((run) => run.confidence)).size).toBe(1);
  });

  it('reports the terms it matched so the UI can explain itself', () => {
    expect(analyzeSentiment('I am thrilled').matchedTerms).toEqual(['thrilled']);
  });
});

describe('manualSentiment', () => {
  it('marks a hand-picked mood as fully certain and manually sourced', () => {
    const result = manualSentiment('romantic');
    expect(result).toMatchObject({ label: 'romantic', confidence: 1, source: 'manual', isUncertain: false });
  });
});

describe('helpers', () => {
  it('normalises case, punctuation and apostrophes', () => {
    expect(normalize("I'm NOT happy!!")).toBe('im not happy');
  });

  it('merges morphological variants without mangling short words', () => {
    expect(stem('tears')).toBe('tear');
    expect(stem('sad')).toBe('sad');
    expect(stem('relaxing')).toBe('relax');
  });
});

/**
 * Locked-in regression suite.
 *
 * These exact strings are the acceptance cases for the mood engine. Each one
 * previously either misclassified or did not exist in the taxonomy, so they are
 * asserted verbatim rather than paraphrased.
 */
describe('mood regression suite', () => {
  it.each([
    ['I am happy', 'happy'],
    ['I am not happy', 'sad'],
    ['I am excited', 'excited'],
    ['I am sad', 'sad'],
    ['I feel relaxed', 'relaxed'],
    ['I am angry', 'angry'],
    ['I feel nostalgic', 'nostalgic'],
    ['I want something mysterious', 'mysterious'],
    ['melancholy and wistful', 'melancholic'],
    ["don't feel happy", 'sad'],
    ['never happy', 'sad'],
  ])('%j → %s', (text, expected) => {
    expect(analyzeSentiment(text).label).toBe(expected);
  });

  it('resolves every regression case confidently, not by accident', () => {
    const texts = [
      'I am happy', 'I am not happy', 'I am excited', 'I am sad', 'I feel relaxed',
      'I am angry', 'I feel nostalgic', 'I want something mysterious',
      'melancholy and wistful', "don't feel happy", 'never happy',
    ];
    for (const text of texts) {
      const result = analyzeSentiment(text);
      expect(result.isUncertain).toBe(false);
      expect(result.label).not.toBe('neutral');
    }
  });

  it('handles all three negation forms identically', () => {
    // "not", contracted "don't" and "never" all scope the same way.
    const labels = ['I am not happy', "don't feel happy", 'never happy'].map(
      (text) => analyzeSentiment(text).label,
    );
    expect(new Set(labels).size).toBe(1);
  });

  it('marks lexicon output as a keyword match, never as a model probability', () => {
    // The UI branches on `source` to avoid calling a heuristic score "confidence".
    for (const text of ['I am happy', 'melancholy and wistful', 'I feel nostalgic']) {
      expect(analyzeSentiment(text).source).toBe('lexicon');
    }
  });
});
