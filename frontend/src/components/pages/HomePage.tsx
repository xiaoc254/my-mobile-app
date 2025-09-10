// src/components/Pages/HomePage.tsx
import { useState, useEffect } from 'react';
import type { Page } from '../../types';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState('12:00');

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
    <div className="page home-page">
      <div className="content">
        <div className="home-header">
          {/* <div className="time">{currentTime}</div> */}
          {/* <h1>健康检测</h1> */}
        </div>
        
        <div className="home-cards">
          <div className="card" onClick={() => onNavigate('monitoring')}>
            <div className="card-icon sound"></div>
            <h2>声音情绪识别</h2>
            <p>通过分析宠物声音识别情绪状态</p>
          </div>
          
          <div className="card">
            <div className="card-icon vision"></div>
            <h2>视觉行为分析</h2>
            <p>通过摄像头分析宠物行为模式</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;