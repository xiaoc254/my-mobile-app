
import type { EmotionData } from '../../types'

interface EmotionResultProps {
  emotionResults: EmotionData[];
  summary: string;
  onReset: () => void;
}

const EmotionResult: React.FC<EmotionResultProps> = ({ 
  emotionResults, 
  summary, 
  onReset
}) => {
  return (
    <div className="page result-page">
      <div className="content">
        <h2 className="section-title">声音分析</h2>
        
        <div className="emotion-results">
          {emotionResults.map((emotion, index) => (
            <div key={index} className="emotion-item">
              <span className="emotion-name">{emotion.name}</span>
              <div className="emotion-bar">
                <div 
                  className="emotion-fill" 
                  style={{ 
                    width: `${emotion.percentage}%`
                  }}
                ></div>
              </div>
              <span className="emotion-percentage">
                {emotion.percentage}%
              </span>
            </div>
          ))}
        </div>
        
        <div className="summary">
          <h3>总结：</h3>
          <p>{summary}</p>
        </div>
        
        <button className="restart-button" onClick={onReset}>
          重新开始检测
        </button>
      </div>
    </div>
  );
};

export default EmotionResult;