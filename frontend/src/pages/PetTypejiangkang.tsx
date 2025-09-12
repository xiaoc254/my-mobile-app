import React, { useState, useEffect } from 'react';

// 定义情绪数据类型
interface EmotionData {
  sadness: number;
  unease: number;
  anxiety: number;
  anger: number;
  calm: number;
}

export default function PetHealthApp() {
  const [currentView, setCurrentView] = useState<'main' | 'soundCollection' | 'soundStopped' | 'soundAnalysis'>('main');
  const [soundLevel, setSoundLevel] = useState<number>(0);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [emotionData, setEmotionData] = useState<EmotionData | null>(null);

  // 模拟声音收集过程
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCollecting) {
      interval = setInterval(() => {
        setSoundLevel(prev => {
          const newLevel = prev + Math.random() * 10;
          return newLevel > 100 ? 100 : newLevel;
        });
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCollecting]);

  // 模拟声音分析结果
  useEffect(() => {
    if (currentView === 'soundAnalysis') {
      // 模拟分析结果
      const mockData: EmotionData = {
        sadness: 20,
        unease: 15,
        anxiety: 25,
        anger: 10,
        calm: 30
      };
      setEmotionData(mockData);
    }
  }, [currentView]);

  const startSoundCollection = () => {
    setSoundLevel(0);
    setIsCollecting(true);
    setCurrentView('soundCollection');
  };

  const stopSoundCollection = () => {
    setIsCollecting(false);
    setCurrentView('soundStopped');
  };

  const analyzeSound = () => {
    setCurrentView('soundAnalysis');
  };

  const resetToMain = () => {
    setCurrentView('main');
  };

  // 应用容器样式
  const appStyle: React.CSSProperties = {
    fontFamily: "'Inter', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif",
    maxWidth: '420px',
    margin: '0 auto',
    background: '255, 191, 107',
    minHeight: '100vh',
    color: '#fff',
    padding: '20px',
    boxSizing: 'border-box'
  };

  // 卡片容器样式
  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    color: '#333'
  };

  // 头部样式
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
  };

  const timeStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: 700,
    margin: '0',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
  };

  // 选项卡片样式
  const optionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '30px'
  };

  const optionCardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #e0d540ff 0%, #decc0bff 100%)',
    borderRadius: '18px',
    padding: '25px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 8px 20px rgba(37, 117, 252, 0.3)',
    color: 'white'
  };

  const optionIconStyle: React.CSSProperties = {
    fontSize: '40px',
    marginBottom: '15px',
    textAlign: 'center' as 'center'
  };

  // 声音内容样式
  const soundContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px'
  };

  const soundLevelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '10px'
  };

  const levelBarStyle: React.CSSProperties = {
    width: '35px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '18px',
    overflow: 'hidden',
    position: 'relative' as 'relative',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)'
  };

  const waveformStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '18px',
    padding: '25px',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const waveContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '120px',
    margin: '20px 0'
  };

  const collectingTextStyle: React.CSSProperties = {
    textAlign: 'center',
    fontWeight: 600,
    color: '#4facfe',
    margin: '0',
    fontSize: '16px'
  };

  const instructionStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    margin: '0',
    fontStyle: 'italic'
  };

  // 按钮样式
  const buttonStyle: React.CSSProperties = {
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '15px 35px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
  };

  const stopButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff0000 100%)'
  };

  const analyzeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #4ecd5f 0%, #2e8b37 100%)'
  };

  const backButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #6c5ce7 0%, #4a3fb5 100%)',
    marginTop: '25px'
  };

  // 分析内容样式
  const analysisContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  };

  const emotionsListStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '18px',
    padding: '25px',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const emotionItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '18px'
  };

  const emotionLabelStyle: React.CSSProperties = {
    width: '70px',
    fontWeight: 600,
    fontSize: '15px'
  };

  const emotionBarContainerStyle: React.CSSProperties = {
    flexGrow: 1,
    height: '14px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '7px',
    overflow: 'hidden',
    margin: '0 15px',
    boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.1)'
  };

  const emotionValueStyle: React.CSSProperties = {
    width: '45px',
    textAlign: 'right' as 'right',
    fontWeight: 700,
    fontSize: '15px'
  };

  const analysisSummaryStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '18px',
    padding: '25px',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const disclaimerStyle: React.CSSProperties = {
    display: 'block',
    marginTop: '12px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic'
  };

  // 悬停效果
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = '0 12px 25px rgba(37, 117, 252, 0.4)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 117, 252, 0.3)';
  };

  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 7px 20px rgba(0, 0, 0, 0.3)';
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
  };

  // 渲染主界面
  const renderMainView = () => (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {/* <span style={timeStyle}>12:00</span> */}
        <h1 style={{...titleStyle, color: '#333'}}>健康检测</h1>
      </div>
      
      <div style={optionsStyle}>
        <div 
          style={optionCardStyle}
          onClick={startSoundCollection}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div style={optionIconStyle}></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', textAlign: 'center' }}>声音情绪识别</h2>
          <p style={{ margin: '0', opacity: 0.9, fontSize: '14px', textAlign: 'center' }}>通过分析宠物声音判断情绪状态</p>
        </div>
        
        <div 
          style={{...optionCardStyle, background: 'linear-gradient(135deg, #b9ab0cff 0%, #d0c11cff 100%)'}}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div style={optionIconStyle}></div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', textAlign: 'center' }}>视觉行为分析</h2>
          <p style={{ margin: '0', opacity: 0.9, fontSize: '14px', textAlign: 'center' }}>通过摄像头分析宠物行为模式</p>
        </div>
      </div>
    </div>
  );

  // 渲染声音收集界面
  const renderSoundCollectionView = () => (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {/* <span style={{...timeStyle, color: '#666'}}>12:00</span> */}
        <h1 style={{...titleStyle, color: '#333'}}>声音监测</h1>
      </div>
      
      <div style={soundContentStyle}>
        <div style={soundLevelStyle}>
          <div style={levelBarStyle}>
            <div 
              style={{ 
                position: 'absolute',
                bottom: '0',
                width: '100%',
                background: 'linear-gradient(to top, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '18px',
                transition: 'height 0.3s ease',
                height: `${soundLevel}%`
              }}
            ></div>
          </div>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{Math.round(soundLevel)}</span>
        </div>
        
        <div style={waveformStyle}>
          <h3 style={{ marginTop: '0', textAlign: 'center', color: '#333', fontSize: '18px' }}>声波图</h3>
          <div style={waveContainerStyle}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: '5px',
                  background: 'linear-gradient(to top, #6a11cb 0%, #2575fc 100%)',
                  borderRadius: '3px',
                  animation: `wave 1.2s infinite ease-in-out ${i * 0.05}s`,
                  height: `${10 + Math.sin(i * 0.5) * 20 + Math.random() * 15}%`
                }}
              ></div>
            ))}
          </div>
          <p style={{...collectingTextStyle, color: '#4facfe'}}>正在收集...</p>
        </div>
        
        <button 
          style={stopButtonStyle} 
          onClick={stopSoundCollection}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        >
          停止声音收集
        </button>
        
        <p style={{...instructionStyle, color: '#666'}}>将麦克风对准宠物 收集宠物声音</p>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.6); }
        }
      `}</style>
    </div>
  );

  // 渲染声音停止界面
  const renderSoundStoppedView = () => (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {/* <span style={{...timeStyle, color: '#666'}}>12:00</span> */}
        <h1 style={{...titleStyle, color: '#333'}}>声音监测 </h1>
      </div>
      
      <div style={soundContentStyle}>
        <div style={soundLevelStyle}>
          <div style={levelBarStyle}>
            <div 
              style={{ 
                position: 'absolute',
                bottom: '0',
                width: '100%',
                background: 'linear-gradient(to top, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '18px',
                height: `${soundLevel}%`
              }}
            ></div>
          </div>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{Math.round(soundLevel)}</span>
        </div>
        
        <div style={waveformStyle}>
          <h3 style={{ marginTop: '0', textAlign: 'center', color: '#333', fontSize: '18px' }}>声波图</h3>
          <div style={waveContainerStyle}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: '5px',
                  background: 'linear-gradient(to top, #6a11cb 0%, #2575fc 100%)',
                  borderRadius: '3px',
                  height: `${10 + Math.sin(i * 0.5) * 20}%`
                }}
              ></div>
            ))}
          </div>
          <p style={{...collectingTextStyle, color: '#888'}}>已停止收集</p>
        </div>
        
        <button 
          style={analyzeButtonStyle} 
          onClick={analyzeSound}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        >
          进行声音分析
        </button>
      </div>
    </div>
  );

  // 渲染声音分析界面
  const renderSoundAnalysisView = () => (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {/* <span style={{...timeStyle, color: '#666'}}>12:00</span> */}
        <h1 style={{...titleStyle, color: '#333'}}>声音监测 </h1>
      </div>
      
      <div style={analysisContentStyle}>
        <h2 style={{ textAlign: 'center', margin: '10px 0 25px', color: '#333', fontSize: '22px' }}>声音分析</h2>
        
        <div style={emotionsListStyle}>
          <div style={emotionItemStyle}>
            <span style={emotionLabelStyle}>悲伤</span>
            <div style={emotionBarContainerStyle}>
              <div 
                style={{ 
                  height: '100%',
                  borderRadius: '7px',
                  transition: 'width 0.8s ease-out',
                  width: `${emotionData?.sadness}%`,
                  background: 'linear-gradient(to right, #6a11cb, #2575fc)'
                }}
              ></div>
            </div>
            <span style={emotionValueStyle}>{emotionData?.sadness}%</span>
          </div>
          
          <div style={emotionItemStyle}>
            <span style={emotionLabelStyle}>不安</span>
            <div style={emotionBarContainerStyle}>
              <div 
                style={{ 
                  height: '100%',
                  borderRadius: '7px',
                  transition: 'width 0.8s ease-out',
                  width: `${emotionData?.unease}%`,
                  background: 'linear-gradient(to right, #ff7e5f, #feb47b)'
                }}
              ></div>
            </div>
            <span style={emotionValueStyle}>{emotionData?.unease}%</span>
          </div>
          
          <div style={emotionItemStyle}>
            <span style={emotionLabelStyle}>焦虑</span>
            <div style={emotionBarContainerStyle}>
              <div 
                style={{ 
                  height: '100%',
                  borderRadius: '7px',
                  transition: 'width 0.8s ease-out',
                  width: `${emotionData?.anxiety}%`,
                  background: 'linear-gradient(to right, #ff5e62, #ff9966)'
                }}
              ></div>
            </div>
            <span style={emotionValueStyle}>{emotionData?.anxiety}%</span>
          </div>
          
          <div style={emotionItemStyle}>
            <span style={emotionLabelStyle}>愤怒</span>
            <div style={emotionBarContainerStyle}>
              <div 
                style={{ 
                  height: '100%',
                  borderRadius: '7px',
                  transition: 'width 0.8s ease-out',
                  width: `${emotionData?.anger}%`,
                  background: 'linear-gradient(to right, #ff0000, #ff512f)'
                }}
              ></div>
            </div>
            <span style={emotionValueStyle}>{emotionData?.anger}%</span>
          </div>
          
          <div style={emotionItemStyle}>
            <span style={emotionLabelStyle}>平静</span>
            <div style={emotionBarContainerStyle}>
              <div 
                style={{ 
                  height: '100%',
                  borderRadius: '7px',
                  transition: 'width 0.8s ease-out',
                  width: `${emotionData?.calm}%`,
                  background: 'linear-gradient(to right, #00b09b, #96c93d)'
                }}
              ></div>
            </div>
            <span style={emotionValueStyle}>{emotionData?.calm}%</span>
          </div>
        </div>
        
        <div style={analysisSummaryStyle}>
          <h3 style={{ marginTop: '0', color: '#333' }}>总结：</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '0', color: '#333' }}>
            综上分析此宠物平静和焦虑占比最重，其它情绪皆有并不多，
            此情绪并没有什么大碍，可留意宠物环境对宠物的影响，
            以及可以结合宠物动作进行准确分析。
            <span style={{...disclaimerStyle, color: '#666'}}>（本次分析由AI生成，注意甄别）</span>
          </p>
        </div>
        
        <button 
          style={backButtonStyle} 
          onClick={resetToMain}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        >
          返回主界面
        </button>
      </div>
    </div>
  );

  return (
    <div style={appStyle}>
      {currentView === 'main' && renderMainView()}
      {currentView === 'soundCollection' && renderSoundCollectionView()}
      {currentView === 'soundStopped' && renderSoundStoppedView()}
      {currentView === 'soundAnalysis' && renderSoundAnalysisView()}
    </div>
  );
}