import type  { Page, SoundBar } from '../../types';

interface SoundMonitoringProps {
  volumeLevel: number;
  soundBars: SoundBar[];
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onNavigate: (page: Page) => void;
}

const SoundMonitoring: React.FC<SoundMonitoringProps> = ({ 
  volumeLevel, 
  soundBars,
  onStartMonitoring, 
  onStopMonitoring,
  onNavigate 
}) => {
  return (
    <div className="page monitoring-page">
      <div className="content">
        <div className="sound-bars-container">
          <div className="status-text">
            {volumeLevel > 0 ? '正在收集...' : '声波图'}
          </div>
          <div className="sound-bars">
            {soundBars.map(bar => (
              <div
                key={bar.id}
                className="sound-bar"
                style={{
                  height: `${bar.height}%`,
                  backgroundColor: bar.color,
                  width: `${100 / soundBars.length}%`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="volume-indicator">
          <div 
            className="volume-level" 
            style={{ width: `${volumeLevel}%` }}
          ></div>
        </div>
        
        <div className="controls">
          <button 
            className={`monitor-button ${volumeLevel > 0 ? 'stop' : 'start'}`}
            onClick={volumeLevel > 0 ? onStopMonitoring : onStartMonitoring}
          >
            {volumeLevel > 0 ? '停止声音收集' : '开始声音收集'}
          </button>
        </div>
        
        <p className="instruction">将麦克风对准宠物 收集宠物声音</p>
      </div>
    </div>
  );
};

export default SoundMonitoring;