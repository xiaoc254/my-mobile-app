// src/components/Pages/HomePage.tsx
import { useState, useEffect } from 'react';
import type { Page } from '../../types';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState('12:00');
  const navigate = useNavigate();

  const handleAddPet = () => {
    navigate('/SoundMonitoring');
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="iphone-page">
      <div className="iphone-content">
        {/* 顶部状态栏 */}
        <div className="iphone-status-bar">
          <div className="status-time">{currentTime}</div>
        </div>
        
        {/* 主内容区 */}
        <div className="iphone-main">
          <h1 className="iphone-title">健康检测</h1>
          
          <div className="iphone-cards">
            <div 
              className="iphone-card iphone-card-primary"
              onClick={() => onNavigate('monitoring')}
            >
              <div className="card-icon">🎤</div>
              <div className="card-content"
              onClick={handleAddPet}>
                <h3>声音情绪识别</h3>
                <p>分析宠物声音识别情绪状态</p>
              </div>
              <div className="card-arrow">›</div>
            </div>
            
            <div className="iphone-card iphone-card-disabled">
              <div className="card-icon">📷</div>
              <div className="card-content">
                <h3>视觉行为分析</h3>
                <p>通过摄像头分析宠物行为模式</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;