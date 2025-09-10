export type Page = 'home' | 'monitoring' | 'analysis' | 'result';

export interface EmotionData {
  name: string;
  percentage: number;
  color: string;
}

export interface AnalysisResult {
  emotions: EmotionData[];
  summary: string;
}

export interface SoundBar {
  id: number;
  height: number;
  color: string;
}