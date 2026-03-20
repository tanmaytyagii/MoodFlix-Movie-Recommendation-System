import { Sentiment, SentimentLabel } from '../types';

// This is a simplified sentiment analysis model
// In a real application, you would use a more sophisticated ML model via an API
const analyzeSentiment = (text: string): Sentiment => {
  // Convert the text to lowercase for easier analysis
  const lowercaseText = text.toLowerCase();
  
  // Define simple word lists for different sentiments
  const happyWords = ['happy', 'joyful', 'excited', 'glad', 'good', 'joy', 'fun', 'laugh', 'comedy', 'humorous'];
  const sadWords = ['sad', 'unhappy', 'depressed', 'disappointed', 'miserable', 'gloomy', 'cry', 'tears', 'emotional'];
  const excitedWords = ['excited', 'thrilled', 'enthusiastic', 'eager', 'energetic', 'action', 'adventure', 'suspense'];
  const relaxedWords = ['relaxed', 'calm', 'peaceful', 'tranquil', 'chill', 'mellow', 'soothing', 'easy'];
  const angryWords = ['angry', 'mad', 'furious', 'outraged', 'annoyed', 'frustrated', 'irritated', 'intense'];
  const fearfulWords = ['scared', 'afraid', 'frightened', 'fearful', 'terror', 'horror', 'tense', 'thriller'];
  
  // Count occurrences of each type of word
  let happyCount = 0;
  let sadCount = 0;
  let excitedCount = 0;
  let relaxedCount = 0;
  let angryCount = 0;
  let fearfulCount = 0;
  
  // Split text into words and analyze each one
  const words = lowercaseText.split(/\W+/);
  
  for (const word of words) {
    if (happyWords.includes(word)) happyCount++;
    if (sadWords.includes(word)) sadCount++;
    if (excitedWords.includes(word)) excitedCount++;
    if (relaxedWords.includes(word)) relaxedCount++;
    if (angryWords.includes(word)) angryCount++;
    if (fearfulWords.includes(word)) fearfulCount++;
  }
  
  // Find the dominant sentiment
  const sentimentCounts = [
    { label: 'happy', count: happyCount },
    { label: 'sad', count: sadCount },
    { label: 'excited', count: excitedCount },
    { label: 'relaxed', count: relaxedCount },
    { label: 'angry', count: angryCount },
    { label: 'fearful', count: fearfulCount }
  ];
  
  // Sort by count in descending order
  sentimentCounts.sort((a, b) => b.count - a.count);
  
  // If no sentiment is clearly detected, return neutral
  if (sentimentCounts[0].count === 0) {
    return {
      score: 0,
      label: 'neutral',
      confidence: 1.0
    };
  }
  
  // Calculate total matched sentiment words
  const totalCount = sentimentCounts.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate confidence as the proportion of the dominant sentiment
  const confidence = sentimentCounts[0].count / totalCount;
  
  // Calculate score based on the type of sentiment
  // Positive sentiments: happy, excited, relaxed (0 to 1)
  // Negative sentiments: sad, angry, fearful (-1 to 0)
  // Neutral: 0
  let score = 0;
  const dominantLabel = sentimentCounts[0].label as SentimentLabel;
  
  if (dominantLabel === 'happy' || dominantLabel === 'excited' || dominantLabel === 'relaxed') {
    score = confidence;
  } else if (dominantLabel === 'sad' || dominantLabel === 'angry' || dominantLabel === 'fearful') {
    score = -confidence;
  }
  
  return {
    score,
    label: dominantLabel,
    confidence
  };
};

export { analyzeSentiment };