import { beforeEach, describe, expect, it, vi } from 'vitest';
import { classifyMood } from './moodService';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: { ...actual.default, create: () => ({ post: mocks.post }) } };
});

const modelSays = (mood: string, confidence: number) =>
  mocks.post.mockResolvedValue({ data: { mood, confidence, model: 'test-model' } });

beforeEach(() => {
  mocks.post.mockReset();
});

describe('classifyMood', () => {
  it('uses the model when it returns a confident non-neutral emotion', async () => {
    modelSays('sad', 0.94);
    const result = await classifyMood('today has been a lot');
    expect(result).toMatchObject({ label: 'sad', source: 'model', confidence: 0.94 });
  });

  it('derives a negative valence score for a negative model mood', async () => {
    modelSays('angry', 0.8);
    expect((await classifyMood('this is infuriating')).score).toBeLessThan(0);
  });

  describe('falling back to the lexicon', () => {
    it('falls back when the model is not configured', async () => {
      mocks.post.mockRejectedValue(new Error('503 model_not_configured'));
      const result = await classifyMood('I am excited');
      expect(result).toMatchObject({ label: 'excited', source: 'lexicon' });
    });

    it('falls back when the request fails outright', async () => {
      mocks.post.mockRejectedValue(new Error('network down'));
      expect((await classifyMood('I am happy')).source).toBe('lexicon');
    });

    it('falls back when the model is unconfident', async () => {
      modelSays('happy', 0.21);
      expect((await classifyMood('melancholy and wistful')).source).toBe('lexicon');
    });

    // The model has no label for nostalgic, mysterious or thoughtful, so a
    // "neutral" verdict often just means "outside my label space".
    it('falls back when the model says neutral so finer moods survive', async () => {
      modelSays('neutral', 0.99);
      const result = await classifyMood('feeling nostalgic about my childhood');
      expect(result).toMatchObject({ label: 'nostalgic', source: 'lexicon' });
    });

    it('falls back when the model returns a label outside the taxonomy', async () => {
      modelSays('ennui', 0.99);
      expect((await classifyMood('I am happy')).source).toBe('lexicon');
    });

    it('falls back when the response is missing a confidence', async () => {
      mocks.post.mockResolvedValue({ data: { mood: 'happy' } });
      expect((await classifyMood('I am happy')).source).toBe('lexicon');
    });
  });

  it('never calls the model for blank input', async () => {
    const result = await classifyMood('   ');
    expect(mocks.post).not.toHaveBeenCalled();
    expect(result.label).toBe('neutral');
  });

  it('never throws, whatever the model does', async () => {
    mocks.post.mockRejectedValue(new Error('catastrophe'));
    await expect(classifyMood('I am happy')).resolves.toBeDefined();
  });
});
