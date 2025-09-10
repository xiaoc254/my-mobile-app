// src/components/Pages/SoundAnalysis.tsx
import { useEffect } from 'react';

interface SoundAnalysisProps {
  analysisProgress: number;
  onStartAnalysis: () => void;
}

const SoundAnalysis: React.FC<SoundAnalysisProps> = ({ 
  analysisProgress, 
  onStartAnalysis 
}) => {
  useEffect(() => {
    if (analysisProgress === 0) {
      setTimeout(onStartAnalysis, 300);
    }
  }, [analysisProgress, onStartAnalysis]);

  return (
    <div className="page analysis-page">
      <div className="content">
        <div className="analysis-progress">
          <div className="progress-number">{analysisProgress}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="sound-bars-container stopped">
          <div className="status-text">已停止收集</div>
          <div className="sound-bars">
            {Array.from({ length: 20 }, (_, index) => (
              <div
                key={index}
                className="sound-bar"
                style={{
                  height: `${Math.random() * 40 + 20}%`,
                  width: `${90 / 20}%`
                }}
              />
            ))}
          </div>
        </div>
        
        <p className="analysis-text">进行声音分析</p>
      </div>
    </div>
  );
};

export default SoundAnalysis;