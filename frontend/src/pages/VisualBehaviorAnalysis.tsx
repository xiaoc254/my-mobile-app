import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Button, Toast } from "antd-mobile";
import dogImg from "../image/dog.jpg";

export default function VisualBehaviorAnalysis() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  // 开始录制视频
  const startRecording = async () => {
    try {
      // 请求摄像头权限
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // 后置摄像头
        },
        audio: true,
      });

      streamRef.current = stream;

      // 显示摄像头预览
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // 创建录制器
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9", // 使用webm格式
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        // 在视频元素中显示录制结果
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
      };

      // 开始录制
      mediaRecorder.start();
      setIsRecording(true);
      setHasRecorded(false);
      setRecordingTime(0);
      recordingStartTime.current = Date.now();

      // 启动计时器
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      Toast.show({ content: "📹 开始录制宠物视频...", position: "center" });
    } catch (error) {
      console.error("无法访问摄像头:", error);
      Toast.show({
        content: "❌ 无法访问摄像头，请检查权限设置",
        position: "center",
        duration: 3000,
      });
    }
  };

  // 停止录制
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecorded(true);

      // 停止摄像头流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // 清除计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      Toast.show({ content: "🎬 视频录制完成", position: "center" });
    }
  };

  // 重新录制
  const retakeVideo = () => {
    setHasRecorded(false);
    setVideoBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl("");
    }
    setRecordingTime(0);
  };

  // 进行视频分析
  const analyzeVideo = async () => {
    if (!videoBlob) {
      Toast.show({ content: "❌ 没有可分析的视频", position: "center" });
      return;
    }

    setIsAnalyzing(true);
    Toast.show({ content: "🎬 正在分析宠物行为...", position: "center" });

    try {
      // 准备上传视频文件
      const formData = new FormData();
      formData.append("video", videoBlob, "pet-behavior.webm");
      formData.append(
        "duration",
        Math.floor((Date.now() - recordingStartTime.current) / 1000).toString()
      );
      formData.append("timestamp", new Date().toISOString());

      console.log("准备分析视频:", {
        size: videoBlob.size,
        type: videoBlob.type,
        duration: Math.floor((Date.now() - recordingStartTime.current) / 1000),
      });

      // 调用后端视频分析接口
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ai/video-analysis", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }

      const result = await response.json();
      console.log("视频分析结果:", result);

      if (result.success) {
        // 将分析结果保存到localStorage，传递给结果页面
        localStorage.setItem(
          "visualAnalysisResult",
          JSON.stringify(result.data)
        );

        Toast.show({
          content: "🎉 分析完成！",
          position: "center",
        });

        // 跳转到结果页面
        navigate("/visual-analysis-result");
      } else {
        throw new Error(result.message || "分析失败");
      }
    } catch (error) {
      console.error("视频分析失败:", error);
      Toast.show({
        content: "❌ 分析失败，使用模拟结果",
        position: "center",
        duration: 3000,
      });

      // 分析失败时使用默认结果
      const defaultResult = {
        behaviors: [
          {
            behavior: "活跃",
            percentage: 35,
            color: "#27AE60",
            description: "宠物表现出较高的活动水平",
          },
          {
            behavior: "休息",
            percentage: 30,
            color: "#3498DB",
            description: "观察到正常的休息行为",
          },
          {
            behavior: "警觉",
            percentage: 20,
            color: "#F39C12",
            description: "对环境保持适度警觉",
          },
          {
            behavior: "玩耍",
            percentage: 10,
            color: "#E74C3C",
            description: "少量玩耍行为",
          },
          {
            behavior: "觅食",
            percentage: 5,
            color: "#9B59B6",
            description: "轻微的觅食行为",
          },
        ],
        summary:
          "从视频分析来看，宠物整体表现健康活跃，行为模式正常。建议继续保持当前的生活环境和照顾方式。",
        recommendations: [
          "继续提供充足的活动空间",
          "定期观察宠物的行为变化",
          "保持规律的作息时间",
          "如发现异常行为，及时咨询兽医",
        ],
      };

      localStorage.setItem(
        "visualAnalysisResult",
        JSON.stringify(defaultResult)
      );
      navigate("/visual-analysis-result");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 格式化录制时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        style={{
          backgroundColor: "#fff",
          color: "#333",
        }}
      >
        视觉行为分析
      </NavBar>

      {/* 页面内容 */}
      <div style={{ padding: "20px", paddingBottom: "60px" }}>
        {/* 视频录制/预览区域 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "20px",
            }}
          >
            📹 视频录制
          </div>

          {/* 视频显示区域 */}
          <div
            style={{
              width: "100%",
              maxWidth: "350px",
              height: "250px",
              backgroundColor: "#000",
              borderRadius: "8px",
              margin: "0 auto 20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              playsInline
              muted
            />

            {/* 录制状态指示器 */}
            {isRecording && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  backgroundColor: "rgba(231, 76, 60, 0.9)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                🔴 录制中 {formatTime(recordingTime)}
              </div>
            )}

            {/* 默认提示 */}
            {!isRecording && !hasRecorded && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📷</div>
                <div style={{ fontSize: "14px" }}>点击开始录制</div>
              </div>
            )}
          </div>

          {/* 录制时间显示 */}
          {(isRecording || hasRecorded) && (
            <div
              style={{
                fontSize: "16px",
                color: "#666",
                marginBottom: "20px",
              }}
            >
              录制时长: {formatTime(recordingTime)}
            </div>
          )}

          {/* 控制按钮区域 */}
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            {!isRecording && !hasRecorded && (
              <Button
                onClick={startRecording}
                style={{
                  width: "120px",
                  height: "45px",
                  background:
                    "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                  border: "none",
                  borderRadius: "22px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                🎬 开始录制
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                style={{
                  width: "120px",
                  height: "45px",
                  background:
                    "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
                  border: "none",
                  borderRadius: "22px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                ⏹️ 停止录制
              </Button>
            )}

            {hasRecorded && (
              <>
                <Button
                  onClick={retakeVideo}
                  style={{
                    width: "100px",
                    height: "40px",
                    background:
                      "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  🔄 重录
                </Button>
                <Button
                  onClick={analyzeVideo}
                  disabled={isAnalyzing}
                  style={{
                    width: "120px",
                    height: "40px",
                    background: isAnalyzing
                      ? "linear-gradient(135deg, #999 0%, #777 100%)"
                      : "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                    border: "none",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                    opacity: isAnalyzing ? 0.7 : 1,
                  }}
                >
                  {isAnalyzing ? "🤖 分析中..." : "🔍 开始分析"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e9ecef",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "12px",
            }}
          >
            🎯 视觉行为分析功能
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.6",
              textAlign: "left",
            }}
          >
            • <strong>行为识别</strong>：分析宠物的运动模式、姿态变化
            <br />
            <br />• <strong>活跃度评估</strong>：评估宠物的精神状态和体能水平
            <br />
            <br />• <strong>异常检测</strong>：识别可能的健康问题或异常行为
            <br />
            <br />• 请确保光线充足，录制时长5-30秒为佳
          </div>
        </div>
      </div>
    </div>
  );
}
