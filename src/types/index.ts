export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface Sentiment {
  score: number; // -1 to 1, where -1 is negative, 0 is neutral, 1 is positive
  label: SentimentLabel;
  confidence: number;
}

export type SentimentLabel = 'happy' | 'sad' | 'excited' | 'relaxed' | 'neutral' | 'angry' | 'fearful';

export interface GenreMap {
  [key: number]: string;
}

export interface SentimentGenreMap {
  [key: SentimentLabel]: number[];
}