import { useState, useRef } from 'react';
import Header from '../components/Layout/Header';
import HomePage from '../components/pages/HomePage';
import SoundMonitoring from '../components/pages/SoundMonitoring';
import SoundAnalysis from '../components/pages/SoundAnalysis';
import EmotionResult from '../components/pages/EmotionResult';
import  type { Page, EmotionData, SoundBar } from '../types';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [analysisData, setAnalysisData] = useState({
    volumeLevel: 0,
    analysisProgress: 0,
    soundBars: [] as SoundBar[],
    emotionResults: [
      { name: '悲伤', percentage: 20, color: '#4a6bff' },
      { name: '不安', percentage: 15, color: '#6c5ce7' },
      { name: '焦虑', percentage: 25, color: '#ff4757' },
      { name: '愤怒', percentage: 10, color: '#ff6b6b' },
      { name: '平静', percentage: 30, color: '#4cd964' }
    ] as EmotionData[],
    summary: ""
  });

  const monitoringIntervalRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  // 生成随机声浪条
  const generateSoundBars = (count: number = 20): SoundBar[] => {
    const bars: SoundBar[] = [];
    const colors = ['#4a6bff', '#6c5ce7', '#ff4757', '#ff6b6b', '#4cd964'];
    
    for (let i = 0; i < count; i++) {
      bars.push({
        id: i,
        height: Math.random() * 80 + 20, // 20-100% 高度
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return bars;
  };

  // 生成随机情绪分析
  const generateRandomEmotions = (): EmotionData[] => {
    const emotions = ['悲伤', '不安', '焦虑', '愤怒', '平静', '快乐', '兴奋', '恐惧'];
    const colors = ['#4a6bff', '#6c5ce7', '#ff4757', '#ff6b6b', '#4cd964', '#ffcc00', '#ff9ff3', '#00d2d3'];
    
    // 随机选择3-5种情绪
    const selectedCount = Math.floor(Math.random() * 3) + 3;
    const selectedEmotions: EmotionData[] = [];
    
    for (let i = 0; i < selectedCount; i++) {
      const randomIndex = Math.floor(Math.random() * emotions.length);
      const emotion = emotions[randomIndex];
      
      // 确保不重复
      if (!selectedEmotions.find(e => e.name === emotion)) {
        selectedEmotions.push({
          name: emotion,
          percentage: Math.floor(Math.random() * 30) + 10, // 10-40%
          color: colors[randomIndex]
        });
      }
    }
    
    // 确保总和为100%
    const total = selectedEmotions.reduce((sum, e) => sum + e.percentage, 0);
    const scale = 100 / total;
    
    return selectedEmotions.map(e => ({
      ...e,
      percentage: Math.round(e.percentage * scale)
    }));
  };

  // 生成随机总结
  const generateRandomSummary = (emotions: EmotionData[]): string => {
    const dominantEmotion = emotions.reduce((prev, current) => 
      (prev.percentage > current.percentage) ? prev : current
    );
    
    const summaries = [
      `综上分析此宠物${emotions.map(e => e.name).join('、')}等情绪占比明显，其中${dominantEmotion.name}情绪最为突出。建议多关注宠物行为表现，提供适当的环境调整。`,
      `检测结果显示宠物情绪以${dominantEmotion.name}为主，其他情绪分布较为均衡。可结合日常观察进一步确认宠物状态。`,
      `分析表明宠物${dominantEmotion.name}情绪占主导地位，整体情绪状态${dominantEmotion.name === '平静' || dominantEmotion.name === '快乐' ? '良好' : '需要关注'}。建议定期监测。`,
      `宠物情绪分析完成，${dominantEmotion.name}情绪占比最高。${dominantEmotion.name === '焦虑' || dominantEmotion.name === '恐惧' ? '请注意宠物生活环境的安全性。' : '当前情绪状态相对稳定。'}`
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)] + '（本次分析由AI生成，注意甄别）';
  };

  const startMonitoring = () => {
    setCurrentPage('monitoring');
    
    // 初始化声浪条
    setAnalysisData(prev => ({
      ...prev,
      soundBars: generateSoundBars(20),
      volumeLevel: 0
    }));

    // 模拟数据收集过程
    let volume = 0;
    
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    monitoringIntervalRef.current = window.setInterval(() => {
      volume += 2;
      
      if (volume >= 100) {
        if (monitoringIntervalRef.current) {
          clearInterval(monitoringIntervalRef.current);
        }
        setAnalysisData(prev => ({ ...prev, volumeLevel: 100 }));
        setTimeout(() => setCurrentPage('analysis'), 500);
      } else {
        // 更新声浪条高度
        setAnalysisData(prev => ({
          ...prev,
          volumeLevel: volume,
          soundBars: prev.soundBars.map(bar => ({
            ...bar,
            height: Math.random() * 80 + 20
          }))
        }));
      }
    }, 100);
  };

  const stopMonitoring = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    setCurrentPage('analysis');
  };

  const startAnalysis = () => {
    // 生成随机情绪数据
    const randomEmotions = generateRandomEmotions();
    const randomSummary = generateRandomSummary(randomEmotions);
    
    setAnalysisData(prev => ({
      ...prev,
      emotionResults: randomEmotions,
      summary: randomSummary,
      analysisProgress: 0
    }));

    // 模拟分析过程
    let progress = 0;
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    analysisIntervalRef.current = window.setInterval(() => {
      progress += 2;
      
      if (progress >= 100) {
        if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
        }
        setAnalysisData(prev => ({ ...prev, analysisProgress: 100 }));
        setTimeout(() => setCurrentPage('result'), 1000);
      } else {
        setAnalysisData(prev => ({ ...prev, analysisProgress: progress }));
      }
    }, 100);
  };

  const resetApp = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    
    setAnalysisData({
      volumeLevel: 0,
      analysisProgress: 0,
      soundBars: [],
      emotionResults: [],
      summary: ""
    });
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'monitoring':
        return (
          <SoundMonitoring 
            volumeLevel={analysisData.volumeLevel}
            soundBars={analysisData.soundBars}
            onStartMonitoring={startMonitoring}
            onStopMonitoring={stopMonitoring}
            onNavigate={navigateTo}
          />
        );
      case 'analysis':
        return (
          <SoundAnalysis 
            analysisProgress={analysisData.analysisProgress}
            onStartAnalysis={startAnalysis}
            // onNavigate={navigateTo}
          />
        );
      case 'result':
        return (
          <EmotionResult 
            emotionResults={analysisData.emotionResults}
            summary={analysisData.summary}
            onReset={resetApp}
            // onNavigate={navigateTo}
          />
        );
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={navigateTo} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;