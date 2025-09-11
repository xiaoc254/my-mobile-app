// src/components/pages/SoundMonitoring.tsx
import { useState, useEffect, useRef } from 'react';
import type { Page, SoundData } from '../../types';
import './SoundMonitoring.css';

interface SoundMonitoringProps {
  onNavigate: (page: Page, data?: any) => void;
  onDataCollect: (data: SoundData) => void;
}

const SoundMonitoring: React.FC<SoundMonitoringProps> = ({ 
  onNavigate, 
  onDataCollect 
}) => {
  const [isRecording, setIsRecording] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState('12:00');
  const [volume, setVolume] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const waveformRef = useRef<number | null>(null);

  useEffect(() => {
    startRecording();
    updateTime();
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (waveformRef.current) clearTimeout(waveformRef.current);
    };
  }, []);

  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  };

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.log('使用模拟麦克风数据');
    }

    setIsRecording(true);
    setDuration(0);
    setVolume(85);

    // 持续时间计时器
    intervalRef.current = setInterval(() => {
      setDuration(prev => {
        if (prev >= 59) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    // 实时波形生成
    generateRealTimeWaveform();
  };

  const generateRealTimeWaveform = () => {
    const updateWaveform = () => {
      if (isRecording) {
        const newWaveform = Array.from({ length: 30 }, () => Math.random() * 60 + 20);
        setWaveformData(newWaveform);
        
        // 随机变化音量
        const volumeChange = Math.random() * 10 - 5;
        setVolume(prev => Math.max(70, Math.min(120, prev + volumeChange)));

        waveformRef.current = setTimeout(updateWaveform, 100);
      }
    };
    updateWaveform();
  };

  const stopRecording = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (waveformRef.current) clearTimeout(waveformRef.current);

    setIsRecording(false);
    
    const soundData: SoundData = {
      duration,
      volume: Math.round(volume),
      waveform: waveformData
    };
    
    // 添加完成震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }

    onDataCollect(soundData);
    
    // 延迟跳转，让用户看到停止状态
    setTimeout(() => {
      onNavigate('analysis', soundData);
    }, 800);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="monitoring-page">
      <div className="monitoring-header">
        <h1>声音监测</h1>
        <span className="monitoring-time">{currentTime}</span>
      </div>

      <div className="volume-display">
        <div className="volume-number">{Math.round(volume)}</div>
        <div className="volume-unit">dB</div>
      </div>

      <div className="waveform-container">
        <h3>声波图</h3>
        <div className="waveform">
          {waveformData.map((height, index) => (
            <div
              key={index}
              className={`wave-bar ${isRecording ? 'recording' : 'stopped'}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className={`recording-status ${isRecording ? 'recording' : 'stopped'}`}>
          {isRecording ? '正在收集...' : '已停止收集'}
        </div>
      </div>

      <div className="monitoring-controls">
        {isRecording ? (
          <button 
            className="stop-button"
            onClick={stopRecording}
            onTouchStart={(e) => e.currentTarget.classList.add('active')}
            onTouchEnd={(e) => e.currentTarget.classList.remove('active')}
          >
            <span className="button-icon">●</span>
            停止声音收集
          </button>
        ) : (
          <button 
            className="start-button"
            onClick={startRecording}
            onTouchStart={(e) => e.currentTarget.classList.add('active')}
            onTouchEnd={(e) => e.currentTarget.classList.remove('active')}
          >
            <span className="button-icon">🎤</span>
            开始声音收集
          </button>
        )}
      </div>

      <div className="monitoring-instruction">
        <p>将麦克风对准宠物 收集宠物声音</p>
      </div>


    </div>
  );
};

export default SoundMonitoring;