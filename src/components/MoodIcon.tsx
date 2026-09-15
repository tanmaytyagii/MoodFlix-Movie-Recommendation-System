import React from 'react';
import {
  Clock,
  CloudRain,
  Coffee,
  Compass,
  Eye,
  Flame,
  Frown,
  Ghost,
  Heart,
  Lightbulb,
  type LucideIcon,
  Meh,
  Smile,
  Zap,
} from 'lucide-react';
import { SentimentLabel } from '../types';

/**
 * One icon per mood, shared by the picker and the recommendation context panel
 * so a mood always looks the same wherever it appears.
 */
const ICONS: Record<SentimentLabel, LucideIcon> = {
  happy: Smile,
  sad: Frown,
  excited: Zap,
  relaxed: Coffee,
  romantic: Heart,
  adventurous: Compass,
  mysterious: Eye,
  fearful: Ghost,
  angry: Flame,
  nostalgic: Clock,
  thoughtful: Lightbulb,
  melancholic: CloudRain,
  neutral: Meh,
};

interface MoodIconProps {
  mood: SentimentLabel;
  size?: number;
  className?: string;
}

const MoodIcon: React.FC<MoodIconProps> = ({ mood, size = 18, className }) => {
  const Icon = ICONS[mood];
  return <Icon size={size} className={className} aria-hidden="true" strokeWidth={1.75} />;
};

export default MoodIcon;
