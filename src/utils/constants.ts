import { SentimentGenreMap, GenreMap, SentimentLabel } from '../types';

/**
 * TMDB is reached through our own serverless proxy at `/api/tmdb`, which holds
 * the read token server-side. No TMDB credential exists in this bundle.
 * See `api/tmdb.ts` and the Security section of the README.
 */
export const TMDB_PROXY_BASE_URL = '/api/tmdb';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/** TMDB genre IDs → display names. Stable IDs, safe to hardcode. */
export const GENRE_MAP: GenreMap = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

/**
 * Mood → TMDB genre IDs used for discovery. These are editorial curation
 * choices, not learned weights.
 *
 * `neutral` is intentionally empty: when we cannot read a mood we show trending
 * movies rather than guessing a genre.
 */
export const SENTIMENT_GENRE_MAP: SentimentGenreMap = {
  happy: [35, 10751, 16, 10402], // Comedy, Family, Animation, Music
  sad: [18, 10749], // Drama, Romance
  angry: [28, 80, 53], // Action, Crime, Thriller
  excited: [28, 12, 878], // Action, Adventure, Science Fiction
  relaxed: [99, 16, 10751], // Documentary, Animation, Family
  romantic: [10749, 18, 35], // Romance, Drama, Comedy
  adventurous: [12, 14, 37], // Adventure, Fantasy, Western
  mysterious: [9648, 53, 80], // Mystery, Thriller, Crime
  fearful: [27, 53, 9648], // Horror, Thriller, Mystery
  nostalgic: [10751, 10402, 36], // Family, Music, History
  thoughtful: [18, 99, 36], // Drama, Documentary, History
  melancholic: [18, 10749, 10402], // Drama, Romance, Music
  neutral: [],
};

/** Shown to the user alongside the detected mood, so the mapping is legible. */
export const SENTIMENT_DESCRIPTIONS: Record<SentimentLabel, string> = {
  happy: 'Upbeat and cheerful — leaning into comedies and feel-good stories.',
  sad: 'Low and tender — character-driven drama that sits with the feeling.',
  angry: 'Charged up — high-friction action, crime and thrillers.',
  excited: 'High energy — big, kinetic adventure and science fiction.',
  relaxed: 'Calm and unhurried — gentle, low-stakes viewing.',
  romantic: 'Warm and affectionate — love stories and romantic comedy.',
  adventurous: 'Restless for somewhere else — sweeping journeys and fantasy.',
  mysterious: 'Curious and puzzle-minded — mysteries and slow-burn thrillers.',
  fearful: 'On edge — horror and tension, if you want to lean into it.',
  nostalgic: 'Looking backwards fondly — period pieces and old favourites.',
  thoughtful: 'Reflective — films that reward attention.',
  melancholic: 'Bittersweet and wistful — quiet, aching stories.',
  neutral: 'No strong mood signal — here is what everyone is watching.',
};

export const SENTIMENT_EMOJIS: Record<SentimentLabel, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  excited: '🤩',
  relaxed: '😌',
  romantic: '💖',
  adventurous: '🧭',
  mysterious: '🕵️',
  fearful: '😨',
  nostalgic: '📼',
  thoughtful: '🤔',
  melancholic: '🌧️',
  neutral: '😐',
};

/**
 * A single hue per mood, used as a small indicator dot and a low-opacity tint —
 * never as a full-bleed button fill, which made the picker read as a toy.
 */
export const SENTIMENT_COLORS: Record<SentimentLabel, string> = {
  happy: '#F5C451',
  sad: '#6C9BD8',
  angry: '#E2685F',
  excited: '#F0964A',
  relaxed: '#5FBFA8',
  romantic: '#E084A8',
  adventurous: '#D9A05B',
  mysterious: '#8E86D6',
  fearful: '#A374C6',
  nostalgic: '#C79A6B',
  thoughtful: '#6FAFC4',
  melancholic: '#8B93A6',
  neutral: '#8A8A95',
};

/** Every mood a user can pick manually, in display order. */
export const SELECTABLE_SENTIMENTS: SentimentLabel[] = [
  'happy',
  'sad',
  'excited',
  'relaxed',
  'romantic',
  'adventurous',
  'mysterious',
  'fearful',
  'angry',
  'nostalgic',
  'thoughtful',
  'melancholic',
];
