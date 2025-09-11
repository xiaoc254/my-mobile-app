// src/types/index.ts
export type Page = 'home' | 'monitoring' | 'analysis' | 'result';

export interface EmotionResult {
  sadness: number;
  unease: number;
  anxiety: number;
  anger: number;
  calm: number;
}

export interface SoundData {
  duration: number;
  volume: number;
  waveform: number[];
}