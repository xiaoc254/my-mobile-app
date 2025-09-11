// src/components/pages/SoundAnalysis.tsx
import { useState, useEffect } from 'react';
import type { Page, SoundData, EmotionResult } from '../../types';
import './SoundAnalysis.css';

interface SoundAnalysisProps {
  onNavigate: (page: Page, data?: any) => void;
  soundData: SoundData;
}

const SoundAnalysis: React.FC<SoundAnalysisProps> = ({ 
  onNavigate, 
  soundData 
}) => {
  const [currentTime, setCurrentTime] = useState('12:00');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [volume, setVolume] = useState(114); // 固定值114，符合图片

  useEffect(() => {
    // 设置当前时间
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();

    // 模拟分析过程
    const analyzeSound = async () => {
      // 快速填充到100%
      for (let i = 0; i <= 100; i += 20) {
        setAnalysisProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setAnalysisProgress(100);
      
      // 分析完成后自动跳转到结果页面
      setTimeout(() => {
        const emotionResult: EmotionResult = {
          sadness: 20,
          unease: 15,
          anxiety: 25,
          anger: 10,
          calm: 30
        };
        onNavigate('result', emotionResult);
      }, 800);
    };

    analyzeSound();
  }, [onNavigate]);

  // 生成静态波形数据
  const generateStaticWaveform = () => {
    return Array.from({ length: 30 }, () => Math.random() * 40 + 30);
  };

  return (
    <div className="analysis-page">
      {/* 顶部标题和时间 */}
      <div className="analysis-header">
        <h1>声音监测 39</h1>
        <span className="analysis-time">{currentTime}</span>
      </div>

      {/* 音量显示 - 固定值114 */}
      <div className="volume-display">
        <div className="volume-number">{volume}</div>
      </div>

      {/* 声波图区域 - 静态显示 */}
      <div className="analysis-container">
        <h3>声波图</h3>
        <div className="waveform-static">
          {generateStaticWaveform().map((height, index) => (
            <div
              key={index}
              className="wave-bar-static"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="analysis-status">已停止收集</div>
      </div>

      {/* 分析进度 */}
      <div className="progress-container">
        <div className="progress-text">
          声音分析中... {analysisProgress}%
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${analysisProgress}%` }}
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="analysis-controls">
        <button 
          className="analyze-button"
          onClick={() => {
            // 如果分析完成，直接跳转结果
            if (analysisProgress === 100) {
              const emotionResult: EmotionResult = {
                sadness: 20,
                unease: 15,
                anxiety: 25,
                anger: 10,
                calm: 30
              };
              onNavigate('result', emotionResult);
            }
          }}
          disabled={analysisProgress < 100}
        >
          进行声音分析
        </button>
      </div>
    </div>
  );
};

export default SoundAnalysis;