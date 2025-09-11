// src/components/pages/EmotionResult.tsx
import { useState, useEffect } from 'react';
import type { Page, EmotionResult } from '../../types';
import './EmotionResult.css';

interface EmotionResultProps {
  onNavigate: (page: Page) => void;
  emotionResult: EmotionResult;
}

const EmotionResult: React.FC<EmotionResultProps> = ({ 
  onNavigate, 
  emotionResult 
}) => {
  const [currentTime, setCurrentTime] = useState('12:00');
  const [animatedPercentages, setAnimatedPercentages] = useState({
    sadness: 0,
    unease: 0,
    anxiety: 0,
    anger: 0,
    calm: 0
  });

  useEffect(() => {
    // 设置当前时间
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();

    // 情绪百分比动画
    const animatePercentages = () => {
      const duration = 1500; // 动画持续时间
      const steps = 60; // 动画步数
      const interval = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedPercentages({
          sadness: Math.round(emotionResult.sadness * progress),
          unease: Math.round(emotionResult.unease * progress),
          anxiety: Math.round(emotionResult.anxiety * progress),
          anger: Math.round(emotionResult.anger * progress),
          calm: Math.round(emotionResult.calm * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedPercentages(emotionResult); // 确保最终值准确
        }
      }, interval);

      return () => clearInterval(timer);
    };

    animatePercentages();
  }, [emotionResult]);

  const getEmotionColor = (emotion: string, percentage: number): string => {
    const colors: { [key: string]: string } = {
      sadness: '#FF6B6B',
      unease: '#FFD166',
      anxiety: '#F9A826',
      anger: '#EF476F',
      calm: '#06D6A0'
    };
    return colors[emotion] || '#8E8E93';
  };

  const getSummary = (result: EmotionResult): string => {
    return "综上分析此宠物平静和焦虑占比最重，其它情绪皆有并不多，此情绪并没有什么大碍，可留意宠物环境对宠物的影响，以及可以结合宠物动作进行准确分析。（本次分析由AI生成，注意甄别）";
  };

  return (
    <div className="result-page">
      {/* 顶部标题和时间 */}
      <div className="result-header">
        <h1>声音监测 40</h1>
        <span className="result-time">{currentTime}</span>
      </div>

      {/* 结果标题 */}
      <div className="result-title">
        <h2>声音分析</h2>
      </div>

      {/* 情绪结果列表 */}
      <div className="emotion-results">
        {/* 悲伤 - 20% */}
        <div className="emotion-item">
          <span className="emotion-label">悲伤</span>
          <div className="emotion-bar-container">
            <div 
              className="emotion-bar" 
              style={{ 
                width: `${animatedPercentages.sadness}%`,
                backgroundColor: getEmotionColor('sadness', animatedPercentages.sadness)
              }}
            />
          </div>
          <span className="emotion-percentage">{animatedPercentages.sadness}%</span>
        </div>

        {/* 不安 - 15% */}
        <div className="emotion-item">
          <span className="emotion-label">不安</span>
          <div className="emotion-bar-container">
            <div 
              className="emotion-bar" 
              style={{ 
                width: `${animatedPercentages.unease}%`,
                backgroundColor: getEmotionColor('unease', animatedPercentages.unease)
              }}
            />
          </div>
          <span className="emotion-percentage">{animatedPercentages.unease}%</span>
        </div>

        {/* 焦虑 - 25% */}
        <div className="emotion-item">
          <span className="emotion-label">焦虑</span>
          <div className="emotion-bar-container">
            <div 
              className="emotion-bar" 
              style={{ 
                width: `${animatedPercentages.anxiety}%`,
                backgroundColor: getEmotionColor('anxiety', animatedPercentages.anxiety)
              }}
            />
          </div>
          <span className="emotion-percentage">{animatedPercentages.anxiety}%</span>
        </div>

        {/* 愤怒 - 10% */}
        <div className="emotion-item">
          <span className="emotion-label">愤怒</span>
          <div className="emotion-bar-container">
            <div 
              className="emotion-bar" 
              style={{ 
                width: `${animatedPercentages.anger}%`,
                backgroundColor: getEmotionColor('anger', animatedPercentages.anger)
              }}
            />
          </div>
          <span className="emotion-percentage">{animatedPercentages.anger}%</span>
        </div>

        {/* 平静 - 30% */}
        <div className="emotion-item">
          <span className="emotion-label">平静</span>
          <div className="emotion-bar-container">
            <div 
              className="emotion-bar" 
              style={{ 
                width: `${animatedPercentages.calm}%`,
                backgroundColor: getEmotionColor('calm', animatedPercentages.calm)
              }}
            />
          </div>
          <span className="emotion-percentage">{animatedPercentages.calm}%</span>
        </div>
      </div>

      {/* 总结区域 */}
      <div className="result-summary">
        <h3>总结：</h3>
        <p>{getSummary(emotionResult)}</p>
      </div>

      {/* 操作按钮 */}
      <div className="result-controls">
        <button 
          className="restart-button"
          onClick={() => onNavigate('monitoring')}
        >
          重新分析
        </button>
        <button 
          className="home-button"
          onClick={() => onNavigate('home')}
        >
          返回首页
        </button>
      </div>
    </div>
  );
};

export default EmotionResult;