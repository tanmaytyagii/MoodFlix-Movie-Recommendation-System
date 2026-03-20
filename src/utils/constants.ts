import { SentimentGenreMap, GenreMap } from '../types';

// TMDB API configuration
export const TMDB_API_KEY = '21e38e221fd4e6b87582d057ca74b7e4'; // Replace with your actual TMDB API key
export const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMWUzOGUyMjFmZDRlNmI4NzU4MmQwNTdjYTc0YjdlNCIsIm5iZiI6MTc0NTMzODA5Ny4yNzksInN1YiI6IjY4MDdiZWYxYjA4MmRiNjI3OWVlMjBjZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.VoZTnPkmYi1Yuogyn0CachBVN9xpgkg-P_DPbXJN-fU'; // Replace with your actual access token
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Genre mapping from TMDB
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
  37: 'Western'
};

// Mapping between sentiments and genres that might match that mood
export const SENTIMENT_GENRE_MAP: SentimentGenreMap = {
  happy: [35, 10751, 16, 10402], // Comedy, Family, Animation, Music
  sad: [18, 10749], // Drama, Romance
  excited: [28, 12, 878, 53], // Action, Adventure, Sci-Fi, Thriller
  relaxed: [99, 36, 10770], // Documentary, History, TV Movie
  neutral: [14, 9648, 37], // Fantasy, Mystery, Western
  angry: [28, 80, 53], // Action, Crime, Thriller
  fearful: [27, 9648, 53] // Horror, Mystery, Thriller
};

// Sentiment descriptions for user-friendly display
export const SENTIMENT_DESCRIPTIONS = {
  happy: "You're feeling cheerful and positive!",
  sad: "You're feeling down or reflective.",
  excited: "You're feeling energetic and thrilled!",
  relaxed: "You're feeling calm and at ease.",
  neutral: "You're feeling balanced and even-keeled.",
  angry: "You're feeling frustrated or irritated.",
  fearful: "You're feeling anxious or scared."
};

// Emoji mappings for sentiments
export const SENTIMENT_EMOJIS = {
  happy: '😊',
  sad: '😢',
  excited: '😃',
  relaxed: '😌',
  neutral: '😐',
  angry: '😠',
  fearful: '😨'
};