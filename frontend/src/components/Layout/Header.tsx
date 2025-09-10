// src/components/Layout/Header.tsx
import type { Page } from '../../types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const getTitle = () => {
    switch (currentPage) {
      case 'home': return '健康检测';
      case 'monitoring': return '声音监测';
      case 'analysis': return '声音监测';
      case 'result': return '声音分析 ';
      default: return '健康检测';
    }
  };

  const canGoBack = currentPage !== 'home';

  return (
    <div className="header">
      <span 
        className={`back-button ${canGoBack ? '' : 'hidden'}`} 
        onClick={() => {
          if (currentPage === 'monitoring') onNavigate('home');
          if (currentPage === 'analysis') onNavigate('monitoring');
          if (currentPage === 'result') onNavigate('analysis');
        }}
      >
        &lt;
      </span>
      <h1>{getTitle()}</h1>
      <span className="time"></span>
    </div>
  );
};

export default Header;