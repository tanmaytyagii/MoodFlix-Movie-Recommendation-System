import { SentimentLabel } from '../types';

/**
 * Curated mood vocabulary.
 *
 * Rules this file must obey (enforced by `moodLexicon.test.ts`):
 *  1. No term appears under more than one mood. Overlapping vocabulary was the
 *     root cause of the old engine returning `happy` for "I am excited".
 *  2. Terms describe how the *viewer* feels, not how a film is. Generic quality
 *     words ("good", "amazing", "terrible") are deliberately excluded because
 *     "I want a good movie" is not a mood signal.
 *  3. Highly polysemous words ("love", "think") are handled as phrases instead
 *     of bare terms — "I love action movies" must not read as romantic.
 */
export const MOOD_TERMS: Record<Exclude<SentimentLabel, 'neutral'>, string[]> = {
  happy: [
    'happy', 'happiness', 'joyful', 'joy', 'cheerful', 'cheery', 'cheered', 'glad',
    'delighted', 'elated', 'upbeat', 'sunny', 'fun', 'funny', 'laugh', 'laughter',
    'hilarious', 'comedy', 'humour', 'humor', 'smiling', 'smile', 'giggle',
    'lighthearted', 'feelgood', 'chipper', 'buoyant', 'grinning',
  ],
  sad: [
    'sad', 'sadness', 'unhappy', 'depressed', 'depressing', 'miserable',
    'heartbroken', 'crying', 'cry', 'tears', 'tearful', 'grief', 'grieving',
    'sorrow', 'sorrowful', 'despair', 'upset', 'lonely', 'loneliness', 'weepy',
    'devastated', 'hurting', 'rough', 'glum', 'dejected', 'downcast',
  ],
  angry: [
    'angry', 'anger', 'mad', 'furious', 'fury', 'rage', 'enraged', 'outraged',
    'outrage', 'annoyed', 'annoying', 'irritated', 'irritating', 'frustrated',
    'frustrating', 'livid', 'resentful', 'bitter', 'hostile', 'aggressive',
    'vengeful', 'revenge', 'seething',
  ],
  excited: [
    'excited', 'exciting', 'excitement', 'thrilled', 'thrilling', 'pumped',
    'hyped', 'energetic', 'energised', 'energized', 'buzzing', 'ecstatic',
    'exhilarated', 'adrenaline', 'electrified', 'amped', 'stoked',
  ],
  relaxed: [
    'relaxed', 'relaxing', 'relax', 'calm', 'calming', 'peaceful', 'peace',
    'tranquil', 'serene', 'chill', 'chilled', 'mellow', 'soothing', 'cosy',
    'cozy', 'unwind', 'unwinding', 'restful', 'easygoing', 'laidback', 'lazy',
    'sleepy', 'tired', 'exhausted', 'drained', 'comfy', 'quiet',
  ],
  romantic: [
    'romantic', 'romance', 'affection', 'affectionate', 'tender', 'intimate',
    'passion', 'passionate', 'crush', 'smitten', 'infatuated', 'heartwarming',
    'cuddle', 'cuddly', 'valentine', 'swoon', 'sweetheart', 'lovestruck',
  ],
  adventurous: [
    'adventurous', 'adventure', 'explore', 'exploring', 'exploration',
    'wanderlust', 'journey', 'quest', 'epic', 'escapism', 'wander', 'roaming',
    'daring', 'bold', 'restless', 'outdoors', 'discovery', 'voyage',
  ],
  mysterious: [
    'mysterious', 'mystery', 'curious', 'curiosity', 'puzzle', 'puzzling',
    'puzzled', 'riddle', 'enigma', 'enigmatic', 'intrigued', 'intriguing',
    'suspense', 'suspenseful', 'twisty', 'detective', 'whodunit', 'cryptic',
    'secretive', 'unsolved', 'clue', 'investigate',
  ],
  fearful: [
    'fearful', 'fear', 'scared', 'scary', 'afraid', 'frightened', 'frightening',
    'terrified', 'terrifying', 'horror', 'horrifying', 'creepy', 'spooky',
    'eerie', 'haunted', 'dread', 'dreadful', 'anxious', 'anxiety', 'nervous',
    'panic', 'paranoid', 'tense', 'uneasy', 'chilling', 'unsettling', 'jumpy',
  ],
  nostalgic: [
    'nostalgic', 'nostalgia', 'childhood', 'memories', 'memory', 'reminisce',
    'reminiscing', 'retro', 'vintage', 'classic', 'classics', 'oldschool',
    'throwback', 'yesteryear', 'sentimental', 'homesick', 'bygone',
  ],
  thoughtful: [
    'thoughtful', 'reflective', 'contemplative', 'contemplating', 'pensive',
    'philosophical', 'introspective', 'meaningful', 'profound', 'cerebral',
    'thoughtprovoking', 'ponder', 'pondering', 'existential', 'meditative',
    'insightful', 'introspection',
  ],
  melancholic: [
    'melancholic', 'melancholy', 'wistful', 'wistfulness', 'bittersweet',
    'somber', 'sombre', 'poignant', 'longing', 'yearning', 'aching', 'forlorn',
    'moody', 'gloomy', 'hollow', 'numb', 'autumnal', 'brooding',
  ],
};

/**
 * Multi-word cues. Matched against the normalised text, so they capture intent
 * that single words cannot ("rough week" is sad; "rough cut" is not a mood).
 * Weighted higher than single terms because they are far less ambiguous.
 */
export const MOOD_PHRASES: Record<Exclude<SentimentLabel, 'neutral'>, string[]> = {
  happy: ['feel good', 'feeling good', 'cheer me up', 'pick me up', 'good mood', 'great mood', 'light hearted', 'make me laugh', 'made me laugh', 'could use a good laugh', 'need a good laugh', 'want to laugh', 'need a laugh'],
  sad: ['rough week', 'rough day', 'bad day', 'hard week', 'down in the dumps', 'broke up', 'break up', 'feeling low', 'feel low', 'going through a lot'],
  angry: ['let off steam', 'blow off steam', 'fed up', 'had enough', 'pissed off', 'worked up', 'wound up'],
  excited: ['fired up', 'hyped up', 'on a high', 'after the gym', 'cant sit still'],
  relaxed: ['wind down', 'winding down', 'switch off', 'low stakes', 'easy watch', 'easy watching', 'nothing heavy', 'background noise', 'long day', 'burnt out', 'burned out'],
  romantic: ['love story', 'in love', 'date night', 'falling in love', 'fell in love', 'rom com', 'romantic comedy'],
  adventurous: ['get away', 'far away', 'road trip', 'wide open', 'somewhere else', 'big screen epic'],
  mysterious: ['figure it out', 'keep me guessing', 'plot twist', 'slow burn', 'edge of my seat'],
  fearful: ['on edge', 'scare me', 'creeped out', 'freaked out', 'jump scare', 'cant sleep'],
  nostalgic: ['back in the day', 'when i was a kid', 'grew up with', 'old times', 'used to watch', 'good old days'],
  thoughtful: ['makes me think', 'make me think', 'food for thought', 'something deep', 'something meaningful'],
  melancholic: ['bitter sweet', 'in my feelings', 'rainy day', 'staring out the window'],
};

/**
 * Where a negated mood should redirect its weight. "I am not happy" reads as
 * sad rather than as no signal at all. Moods with no sensible opposite are
 * simply suppressed.
 */
export const MOOD_ANTONYMS: Partial<Record<SentimentLabel, SentimentLabel>> = {
  happy: 'sad',
  sad: 'happy',
  excited: 'relaxed',
  relaxed: 'excited',
  angry: 'relaxed',
  fearful: 'relaxed',
  melancholic: 'happy',
  adventurous: 'relaxed',
};

/** Words that flip the meaning of the mood terms that follow them. */
export const NEGATORS = new Set([
  'not', 'never', 'no', 'none', 'nothing', 'neither', 'nor', 'without',
  'hardly', 'barely', 'rarely', 'cant', 'cannot', 'isnt', 'wasnt', 'arent',
  'werent', 'dont', 'doesnt', 'didnt', 'wont', 'wouldnt', 'couldnt',
  'shouldnt', 'aint', 'havent', 'hasnt',
]);

/** How many tokens after a negator stay within its scope. */
export const NEGATION_WINDOW = 3;

export const INTENSIFIERS = new Set([
  'very', 'really', 'so', 'extremely', 'incredibly', 'super', 'totally',
  'absolutely', 'insanely', 'deeply', 'utterly', 'ridiculously', 'seriously',
  'completely', 'thoroughly',
]);

export const DOWNTONERS = new Set([
  'slightly', 'somewhat', 'bit', 'little', 'kinda', 'sorta', 'mildly',
  'vaguely', 'fairly',
]);
