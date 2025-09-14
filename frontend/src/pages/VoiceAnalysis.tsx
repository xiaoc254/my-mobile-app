import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Button, Toast } from "antd-mobile";
import dogImg from "../image/dog.jpg";

export default function VoiceAnalysis() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [hasRecorded, setHasRecorded] = useState(false); // 是否已录制过
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 是否正在分析
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false); // 添加ref来跟踪录制状态
  const recordingStartTime = useRef<number>(0); // 录制开始时间
  const audioFeaturesRef = useRef<{
    maxVolume: number;
    avgVolume: number;
    minVolume: number;
    volumeVariance: number; // 音量方差
    lowFreqEnergy: number; // 低频能量 (20-250Hz)
    midFreqEnergy: number; // 中频能量 (250-4000Hz)
    highFreqEnergy: number; // 高频能量 (4000Hz+)
    dominantFrequency: number; // 主导频率
    frequencyStability: number; // 频率稳定性
    silencePeriods: number; // 静默时段数
    volumeChanges: number[]; // 音量变化序列
    duration: number;
    sampleCount: number; // 采样数
  }>({
    maxVolume: 0,
    avgVolume: 0,
    minVolume: 255,
    volumeVariance: 0,
    lowFreqEnergy: 0,
    midFreqEnergy: 0,
    highFreqEnergy: 0,
    dominantFrequency: 0,
    frequencyStability: 0,
    silencePeriods: 0,
    volumeChanges: [],
    duration: 0,
    sampleCount: 0,
  }); // 详细音频特征数据

  // 初始化默认声波数据
  const initDefaultData = () => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push(Math.sin(i * 0.2) * 30 + 40); // 生成波浪形的初始数据
    }
    setAudioData(data);
  };

  // 生成随机声波数据（模拟实时音频）
  const generateRandomAudioData = () => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push(Math.random() * 100 + 10);
    }
    return data;
  };

  // 检查设备和浏览器兼容性
  const checkMicrophoneCompatibility = () => {
    // 检查是否支持getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        supported: false,
        reason: "浏览器不支持媒体设备访问",
        suggestion: "请更新到最新版本的浏览器",
      };
    }

    // 检查是否为HTTPS或localhost
    const isSecureContext =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";

    // 获取更详细的环境信息
    const currentUrl = location.href;
    const isLocalNetwork = location.hostname.match(/^192\.168\.|^172\.|^10\./);

    if (!isSecureContext) {
      let reason = "需要HTTPS环境才能访问麦克风";
      let suggestion = "请在HTTPS环境下使用此功能";

      if (isLocalNetwork) {
        reason = "局域网IP需要HTTPS才能访问麦克风";
        suggestion = `请使用以下方式访问：
1. 使用localhost:5173 (如果是本地开发)
2. 配置HTTPS证书
3. 使用ngrok等工具提供HTTPS访问`;
      } else if (currentUrl.includes(":")) {
        reason = "开发服务器需要HTTPS才能访问麦克风";
        suggestion = "请使用localhost或配置HTTPS证书";
      }

      return {
        supported: false,
        reason,
        suggestion,
      };
    }

    return { supported: true };
  };

  // 移动端专用的权限请求
  const requestMicrophonePermissionMobile = async () => {
    try {
      // 对于移动端，先尝试简单的音频配置
      const constraints = {
        audio: {
          // 移动端优化配置
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // 降低采样率以提高兼容性
          sampleRate: 44100,
          channelCount: 1,
        },
      };

      console.log("🎤 开始请求麦克风权限...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      return { success: true, stream };
    } catch (error: any) {
      console.error("移动端麦克风权限请求失败:", error);

      let errorMessage = "无法访问麦克风";
      let suggestion = "请检查浏览器权限设置";

      if (error.name === "NotAllowedError") {
        errorMessage = "麦克风权限被拒绝";
        suggestion = "请在浏览器设置中允许麦克风访问";
      } else if (error.name === "NotFoundError") {
        errorMessage = "未找到麦克风设备";
        suggestion = "请检查设备是否连接了麦克风";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "浏览器不支持此功能";
        suggestion = "请使用支持的浏览器版本";
      } else if (error.name === "NotReadableError") {
        errorMessage = "麦克风被其他应用占用";
        suggestion = "请关闭其他使用麦克风的应用";
      }

      return { success: false, error: errorMessage, suggestion };
    }
  };

  // 初始化音频上下文（兼容iOS Safari）
  const initializeAudioContext = async () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("AudioContext not supported");
      }

      const audioContext = new AudioContextClass();

      // iOS Safari需要在用户交互后恢复AudioContext
      if (audioContext.state === "suspended") {
        console.log("🎵 恢复AudioContext状态...");
        await audioContext.resume();
      }

      return audioContext;
    } catch (error) {
      console.error("AudioContext初始化失败:", error);
      throw error;
    }
  };

  // 开始录制
  const startRecording = async () => {
    setHasRecorded(false); // 重置录制状态

    // 首先检查兼容性
    const compatibility = checkMicrophoneCompatibility();
    if (!compatibility.supported) {
      Toast.show({
        content: `❌ ${compatibility.reason}`,
        position: "center",
        duration: 5000,
      });

      // 显示详细的解决方案
      setTimeout(() => {
        Toast.show({
          content: `💡 ${compatibility.suggestion}`,
          position: "center",
          duration: 8000,
        });
      }, 1000);
      console.error("兼容性检查失败:", compatibility);
      startSimulation();
      return;
    }

    // 显示准备中的提示
    Toast.show({
      content: "🎤 正在请求麦克风权限...",
      position: "center",
      duration: 2000,
    });

    try {
      // 请求麦克风权限
      const permissionResult = await requestMicrophonePermissionMobile();

      if (!permissionResult.success) {
        throw new Error(
          `${permissionResult.error}: ${permissionResult.suggestion}`
        );
      }

      const stream = permissionResult.stream!;
      console.log("✅ 成功获取音频流");

      // 初始化音频上下文
      const audioContext = await initializeAudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      // 设置更高的精度和敏感度
      analyser.fftSize = 512; // 增加FFT大小获得更好的频率分辨率
      analyser.smoothingTimeConstant = 0.3; // 减少平滑以获得更快的响应
      analyser.minDecibels = -90; // 增加对低音量的敏感度
      analyser.maxDecibels = -10; // 设置最大分贝

      source.connect(analyser);

      // 保存引用
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      streamRef.current = stream;

      // 创建MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus", // 使用更兼容的编码格式
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);
      isRecordingRef.current = true; // 同步更新ref
      recordingStartTime.current = Date.now(); // 记录开始时间

      // 重置音频特征数据
      audioFeaturesRef.current = {
        maxVolume: 0,
        avgVolume: 0,
        minVolume: 255,
        volumeVariance: 0,
        lowFreqEnergy: 0,
        midFreqEnergy: 0,
        highFreqEnergy: 0,
        dominantFrequency: 0,
        frequencyStability: 0,
        silencePeriods: 0,
        volumeChanges: [],
        duration: 0,
        sampleCount: 0,
      };

      // 开始实时分析音频
      analyzeAudio();

      Toast.show({
        content: "🎤 真实麦克风录制已启动",
        position: "center",
        duration: 2000,
      });

      console.log("🎵 录制成功启动，音频上下文状态:", audioContext.state);
    } catch (error: any) {
      console.error("录制失败:", error);

      let errorMessage = "🔧 无法访问麦克风，使用模拟声波模式";

      if (error.message.includes("权限被拒绝")) {
        errorMessage = "🔐 麦克风权限被拒绝，使用模拟模式";
      } else if (error.message.includes("HTTPS")) {
        errorMessage = "🔒 需要HTTPS环境，使用模拟模式";
      }

      Toast.show({
        content: errorMessage,
        position: "center",
        duration: 3000,
      });

      // 如果无法获取麦克风，使用模拟数据
      startSimulation();
    }
  };

  // 模拟录制（如果无法获取真实麦克风）
  const startSimulation = () => {
    setIsRecording(true);
    isRecordingRef.current = true; // 同步更新ref

    // 清除之前的定时器
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    // 立即设置初始数据
    setAudioData(generateRandomAudioData());

    // 启动定时器持续更新数据
    simulationIntervalRef.current = setInterval(() => {
      setAudioData(generateRandomAudioData());
    }, 150);
  };

  // 实时分析音频
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateData = () => {
      // 检查录制状态和分析器是否还存在
      if (!analyserRef.current) return;

      try {
        analyser.getByteFrequencyData(dataArray);

        // 处理音频数据 - 增强对低音量的敏感度
        const audioDataArray = [];
        let maxValue = 0;
        let sumValue = 0;

        for (let i = 0; i < 50; i++) {
          // 从频谱数据中选择合适的频率范围
          const index = Math.floor(i * (bufferLength / 50));
          let value = dataArray[index];
          maxValue = Math.max(maxValue, value);
          sumValue += value;

          // 增强数据的可视化效果
          value = Math.max(value * 1.5 + 20, 10); // 放大并添加基础高度
          audioDataArray.push(Math.min(value, 120)); // 限制最大高度
        }

        // 收集详细音频特征数据用于AI分析
        const avgValue = sumValue / bufferLength;
        const features = audioFeaturesRef.current;

        // 基础音量统计
        features.maxVolume = Math.max(features.maxVolume, maxValue);
        features.minVolume = Math.min(features.minVolume, maxValue);
        features.avgVolume =
          (features.avgVolume * features.sampleCount + avgValue) /
          (features.sampleCount + 1);
        features.volumeChanges.push(maxValue);

        // 频段能量分析
        const sampleRate = audioContextRef.current?.sampleRate || 44100;
        const freqBinSize = sampleRate / bufferLength;

        let lowFreqEnergy = 0,
          midFreqEnergy = 0,
          highFreqEnergy = 0;
        let maxFreqValue = 0,
          dominantFreqBin = 0;

        for (let i = 0; i < bufferLength; i++) {
          const frequency = i * freqBinSize;
          const value = dataArray[i];

          // 频段划分
          if (frequency < 250) {
            lowFreqEnergy += value;
          } else if (frequency < 4000) {
            midFreqEnergy += value;
          } else {
            highFreqEnergy += value;
          }

          // 寻找主导频率
          if (value > maxFreqValue) {
            maxFreqValue = value;
            dominantFreqBin = i;
          }
        }

        // 更新频率特征
        features.lowFreqEnergy = (features.lowFreqEnergy + lowFreqEnergy) / 2;
        features.midFreqEnergy = (features.midFreqEnergy + midFreqEnergy) / 2;
        features.highFreqEnergy =
          (features.highFreqEnergy + highFreqEnergy) / 2;
        features.dominantFrequency = dominantFreqBin * freqBinSize;

        // 计算频率稳定性（前后帧主导频率差异）
        const prevDominantFreq = features.dominantFrequency;
        const currentDominantFreq = dominantFreqBin * freqBinSize;
        if (features.sampleCount > 0) {
          const freqStabilityDiff = Math.abs(
            currentDominantFreq - prevDominantFreq
          );
          features.frequencyStability =
            (features.frequencyStability + freqStabilityDiff) / 2;
        }

        // 检测静默时段（音量低于阈值）
        if (maxValue < 30) {
          features.silencePeriods++;
        }

        features.sampleCount++;

        // 调试信息：每秒输出一次最大音量值
        if (Math.random() < 0.02) {
          // 大约每秒输出一次 (2% 概率 * ~60fps)
          console.log(
            "🎵 实时音频分析 - 最大音量值:",
            maxValue,
            "平均音量:",
            avgValue.toFixed(2),
            "原始数据范围:",
            Math.min(...dataArray),
            "-",
            Math.max(...dataArray)
          );
        }

        setAudioData(audioDataArray);

        // 只有在录制状态下才继续更新
        if (isRecordingRef.current) {
          animationFrameRef.current = requestAnimationFrame(updateData);
        }
      } catch (error) {
        console.error("音频分析错误:", error);
      }
    };

    updateData();
  };

  // 停止录制
  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false; // 同步更新ref
    setHasRecorded(true); // 标记已录制过

    // 计算录制时长
    const duration = (Date.now() - recordingStartTime.current) / 1000;
    audioFeaturesRef.current.duration = duration;

    // 计算最终的音频特征统计
    const features = audioFeaturesRef.current;
    const volumeVariance =
      features.volumeChanges.length > 1
        ? features.volumeChanges.reduce(
            (sum, v) => sum + Math.pow(v - features.avgVolume, 2),
            0
          ) / features.volumeChanges.length
        : 0;
    features.volumeVariance = volumeVariance;

    console.log("录制完成 - 详细音频特征数据:", {
      duration: duration.toFixed(2) + "秒",
      sampleCount: features.sampleCount,
      volume: {
        max: features.maxVolume.toFixed(1),
        avg: features.avgVolume.toFixed(1),
        min: features.minVolume.toFixed(1),
        variance: volumeVariance.toFixed(1),
      },
      frequency: {
        dominant: features.dominantFrequency.toFixed(1) + "Hz",
        stability: features.frequencyStability.toFixed(1),
        lowEnergy: features.lowFreqEnergy.toFixed(1),
        midEnergy: features.midFreqEnergy.toFixed(1),
        highEnergy: features.highFreqEnergy.toFixed(1),
      },
      behavior: {
        silencePeriods: features.silencePeriods,
        volumeChanges: features.volumeChanges.slice(-5), // 最后5个音量值
      },
    });

    // 不自动显示分析结果

    // 停止MediaRecorder
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("停止MediaRecorder时出错:", error);
      }
      mediaRecorderRef.current = null;
    }

    // 停止音频流（释放麦克风）
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
          console.log("🎤 已停止音频轨道:", track.label || track.kind);
        } catch (error) {
          console.error("停止音频轨道时出错:", error);
        }
      });
      streamRef.current = null;
    }

    // 关闭AudioContext
    if (audioContextRef.current) {
      try {
        audioContextRef.current
          .close()
          .then(() => {
            console.log("🎵 AudioContext已关闭");
          })
          .catch((error) => {
            console.error("关闭AudioContext时出错:", error);
          });
      } catch (error) {
        console.error("同步关闭AudioContext时出错:", error);
      }
      audioContextRef.current = null;
    }

    // 清除分析器引用
    analyserRef.current = null;

    // 清除动画帧
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 清除模拟定时器
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    Toast.show({ content: "声音收集完成", position: "center" });
  };

  // 分析音量变化模式
  const analyzeVolumePattern = (volumeChanges: number[]) => {
    if (volumeChanges.length < 5) return "数据不足";

    const recentChanges = volumeChanges.slice(-20); // 最近20个采样点
    let increasingCount = 0;
    let decreasingCount = 0;
    let stableCount = 0;

    for (let i = 1; i < recentChanges.length; i++) {
      const diff = recentChanges[i] - recentChanges[i - 1];
      if (diff > 5) increasingCount++;
      else if (diff < -5) decreasingCount++;
      else stableCount++;
    }

    const total = increasingCount + decreasingCount + stableCount;
    if (increasingCount / total > 0.4) return "递增型(兴奋/激动)";
    if (decreasingCount / total > 0.4) return "递减型(疲惫/平息)";
    if (stableCount / total > 0.6) return "稳定型(平静)";
    return "波动型(不安/焦虑)";
  };

  // 进行声音分析
  const analyzeRecordedAudio = async () => {
    setIsAnalyzing(true);
    Toast.show({ content: "🎵 正在分析声音数据...", position: "center" });

    try {
      // 准备发送到后端的详细音频特征数据
      const features = audioFeaturesRef.current;

      // 计算音频特征指标
      const volumeRange = features.maxVolume - features.minVolume;
      const totalEnergy =
        features.lowFreqEnergy +
        features.midFreqEnergy +
        features.highFreqEnergy;
      const frequencyDistribution = {
        low:
          totalEnergy > 0
            ? ((features.lowFreqEnergy / totalEnergy) * 100).toFixed(1)
            : "0",
        mid:
          totalEnergy > 0
            ? ((features.midFreqEnergy / totalEnergy) * 100).toFixed(1)
            : "0",
        high:
          totalEnergy > 0
            ? ((features.highFreqEnergy / totalEnergy) * 100).toFixed(1)
            : "0",
      };

      const analysisData = {
        // 基础信息
        duration: features.duration.toFixed(1),
        sampleCount: features.sampleCount,

        // 音量特征
        volumeStats: {
          max: features.maxVolume.toFixed(1),
          avg: features.avgVolume.toFixed(1),
          min: features.minVolume.toFixed(1),
          variance: features.volumeVariance.toFixed(1),
          range: volumeRange.toFixed(1),
        },

        // 频率特征
        frequencyStats: {
          dominantFreq: features.dominantFrequency.toFixed(1),
          stability: features.frequencyStability.toFixed(1),
          distribution: frequencyDistribution,
        },

        // 行为特征
        behaviorStats: {
          silenceRatio:
            features.sampleCount > 0
              ? (
                  (features.silencePeriods / features.sampleCount) *
                  100
                ).toFixed(1)
              : "0",
          silencePeriods: features.silencePeriods,
          volumePattern: analyzeVolumePattern(features.volumeChanges),
        },
      };

      console.log("发送到AI分析的数据:", analysisData);

      // 调用后端AI分析接口
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ai/voice-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }

      const result = await response.json();
      console.log("AI分析结果:", result);

      if (result.success) {
        // 将AI分析结果保存到localStorage，传递给结果页面
        localStorage.setItem(
          "voiceAnalysisResult",
          JSON.stringify(result.data)
        );

        Toast.show({
          content: "🎉 分析完成！",
          position: "center",
        });

        // 跳转到结果页面
        navigate("/voice-analysis-result");
      } else {
        throw new Error(result.message || "分析失败");
      }
    } catch (error) {
      console.error("声音分析失败:", error);
      Toast.show({
        content: "❌ 分析失败，使用默认结果",
        position: "center",
        duration: 3000,
      });

      // 分析失败时使用默认结果
      const defaultResult = {
        emotions: [
          {
            emotion: "平静",
            percentage: 30,
            color: "#27AE60",
            description: "声音平稳，节奏规律",
          },
          {
            emotion: "焦虑",
            percentage: 25,
            color: "#F39C12",
            description: "声音节奏较快，音调偏高",
          },
          {
            emotion: "悲伤",
            percentage: 20,
            color: "#4A90E2",
            description: "检测到低沉、缓慢的声音特征",
          },
          {
            emotion: "不安",
            percentage: 15,
            color: "#9B59B6",
            description: "声音频率略有波动",
          },
          {
            emotion: "惊怒",
            percentage: 10,
            color: "#E74C3C",
            description: "短暂的高频声音爆发",
          },
        ],
        summary:
          "网络连接问题，无法连接AI分析服务。显示默认分析结果，建议检查网络后重试。",
        recommendations: [
          "检查网络连接状态",
          "重新录制宠物声音进行分析",
          "观察宠物的日常行为模式",
          "如有异常，建议咨询专业兽医",
        ],
      };

      localStorage.setItem(
        "voiceAnalysisResult",
        JSON.stringify(defaultResult)
      );
      navigate("/voice-analysis-result");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // 页面加载时初始化
  useEffect(() => {
    // 首先显示默认数据
    initDefaultData();

    // 然后尝试开始录制
    const initRecording = async () => {
      await startRecording();
    };

    // 延迟一点时间开始录制，让用户先看到界面
    const timer = setTimeout(initRecording, 500);

    return () => clearTimeout(timer);
  }, []);

  // 获取柱子颜色
  const getBarColor = (value: number, index: number) => {
    const colors = [
      "#3498db", // 蓝色
      "#f1c40f", // 黄色
      "#e74c3c", // 红色
      "#2ecc71", // 绿色
      "#9b59b6", // 紫色
      "#e67e22", // 橙色
      "#1abc9c", // 青绿色
      "#34495e", // 深灰色
    ];
    // 根据音量值调整颜色透明度
    const opacity = Math.min(value / 100, 1);
    const baseColor = colors[index % colors.length];
    return `${baseColor}${Math.floor(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.7)), url(${dogImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => {
          stopRecording();
          navigate(-1);
        }}
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          color: "#333",
          backdropFilter: "blur(10px)",
        }}
      >
        声波图
      </NavBar>

      {/* 页面内容 */}
      <div style={{ padding: "20px", textAlign: "center" }}>
        {/* 声波图标题 */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#ff8c00",
            marginBottom: "30px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          声波图
        </div>

        {/* 声波可视化区域 */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "12px",
            padding: "30px 20px",
            marginBottom: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* 声波图 */}
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "center",
              height: "150px",
              gap: "3px",
              marginBottom: "20px",
            }}
          >
            {audioData.map((value, index) => (
              <div
                key={index}
                style={{
                  width: "6px",
                  height: `${Math.max(value * 1.2, 10)}px`,
                  backgroundColor: getBarColor(value, index),
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.1s ease",
                  opacity: isRecording ? 1 : 0.5,
                }}
              />
            ))}
          </div>

          {/* 状态文字 */}
          <div
            style={{
              fontSize: "16px",
              color: "#666",
              marginTop: "10px",
            }}
          >
            {isRecording
              ? "正在收集..."
              : hasRecorded
              ? "收集完成"
              : "准备收集"}
          </div>
        </div>

        {/* 控制按钮区域 */}
        <div
          style={{
            position: "fixed",
            bottom: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <Button
            onClick={
              isRecording
                ? stopRecording
                : hasRecorded
                ? analyzeRecordedAudio
                : startRecording
            }
            disabled={isAnalyzing}
            style={{
              width: "200px",
              height: "50px",
              background: isAnalyzing
                ? "linear-gradient(135deg, #999 0%, #777 100%)"
                : "linear-gradient(135deg, #d4994b 0%, #c8955a 100%)",
              border: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 4px 12px rgba(212, 153, 75, 0.3)",
              opacity: isAnalyzing ? 0.7 : 1,
            }}
          >
            {isAnalyzing
              ? "AI分析中..."
              : isRecording
              ? "停止声音收集"
              : hasRecorded
              ? "进行声音分析"
              : "开始声音收集"}
          </Button>
        </div>

        {/* 环境检查和权限帮助 */}
        {!isRecording &&
          !hasRecorded &&
          (() => {
            const compatibility = checkMicrophoneCompatibility();
            const isLocalNetwork = location.hostname.match(
              /^192\.168\.|^172\.|^10\./
            );

            return (
              <div
                style={{
                  position: "fixed",
                  bottom: "200px",
                  left: "20px",
                  right: "20px",
                  backgroundColor: compatibility.supported
                    ? "rgba(255, 243, 205, 0.95)"
                    : "rgba(255, 235, 238, 0.95)",
                  borderRadius: "8px",
                  padding: "12px",
                  border: compatibility.supported
                    ? "1px solid rgba(255, 234, 167, 0.8)"
                    : "1px solid rgba(255, 205, 210, 0.8)",
                  backdropFilter: "blur(10px)",
                  maxHeight: "140px",
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: compatibility.supported ? "#d68910" : "#d32f2f",
                    marginBottom: "6px",
                    textAlign: "center",
                  }}
                >
                  {compatibility.supported ? "📱 使用提示" : "⚠️ 环境问题"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: compatibility.supported ? "#8e5a00" : "#c62828",
                    lineHeight: "1.4",
                    textAlign: "left",
                  }}
                >
                  {compatibility.supported ? (
                    <>
                      点击"开始声音收集"时请允许麦克风权限
                      <br />• Chrome: 地址栏锁形图标 → 允许
                    </>
                  ) : (
                    <>
                      <strong>检测到非安全环境</strong>
                      <br />
                      当前: {location.protocol}//{location.host}
                      <br />
                      {isLocalNetwork && (
                        <>需要HTTPS或localhost才能访问麦克风</>
                      )}
                    </>
                  )}
                  <br />
                  <div
                    style={{ display: "flex", gap: "5px", marginTop: "6px" }}
                  >
                    {!compatibility.supported ? (
                      <span
                        onClick={() => navigate("/dev-environment-guide")}
                        style={{
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontWeight: "bold",
                          color: "#d32f2f",
                          fontSize: "10px",
                          padding: "2px 6px",
                          backgroundColor: "rgba(255,255,255,0.8)",
                          borderRadius: "4px",
                        }}
                      >
                        🛠️ 解决方案 →
                      </span>
                    ) : null}
                    <span
                      onClick={() => navigate("/mobile-media-test")}
                      style={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontWeight: "bold",
                        color: compatibility.supported ? "#d68910" : "#d32f2f",
                        fontSize: "10px",
                        padding: "2px 6px",
                        backgroundColor: "rgba(255,255,255,0.8)",
                        borderRadius: "4px",
                      }}
                    >
                      🔧 权限测试 →
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* 底部提示文字 */}
        <div
          style={{
            position: "fixed",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "14px",
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          {isRecording
            ? "将麦克风对准宠物 收集宠物声音"
            : hasRecorded
            ? "点击按钮开始分析收集的声音"
            : "将麦克风对准宠物 收集宠物声音"}
        </div>
      </div>
    </div>
  );
}
