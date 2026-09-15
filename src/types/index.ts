/** A movie as returned by TMDB list endpoints (`/discover`, `/search`, `/trending`). */
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

/** TMDB's `/movie/{id}` response returns full genre objects instead of `genre_ids`. */
export interface MovieDetail extends Omit<Movie, 'genre_ids'> {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  keywords?: string[];
}

/**
 * The mood taxonomy MoodFlix classifies into. These are *moods*, not sentiment
 * polarity — `melancholic` and `sad` are both negative-valence but map to
 * different viewing appetites.
 */
export type SentimentLabel =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'relaxed'
  | 'romantic'
  | 'adventurous'
  | 'mysterious'
  | 'fearful'
  | 'nostalgic'
  | 'thoughtful'
  | 'melancholic'
  | 'neutral';

/** Where a mood classification came from. Surfaced in the UI so the claim stays honest. */
export type SentimentSource = 'model' | 'lexicon' | 'manual';

export interface Sentiment {
  /** Valence from -1 (negative) to 1 (positive). 0 for neutral moods. */
  score: number;
  label: SentimentLabel;
  /**
   * How strongly the input matched this mood, 0-1. This is a *match strength*,
   * not a calibrated model probability — see `source`.
   */
  confidence: number;
  source: SentimentSource;
  /** Words/phrases that drove the classification. Empty for `manual` and `model`. */
  matchedTerms: string[];
  /** True when confidence fell below the usable threshold and we fell back. */
  isUncertain: boolean;
}

export type GenreMap = Record<number, string>;

export type SentimentGenreMap = Record<SentimentLabel, number[]>;

/** A movie scored by content similarity to a reference movie. */
export interface ScoredMovie {
  movie: Movie;
  /** Cosine similarity in TF-IDF space, 0-1. */
  similarity: number;
}
