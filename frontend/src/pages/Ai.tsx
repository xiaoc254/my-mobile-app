import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "user",
      text: "最近观察到我家宠物情况，我记录了以下数据，能否给我提供一些建议",
      chart: true,
    },
    { role: "ai", text: "根据您提供的数据，您的宠物在不同维度大致如下..." },
  ]);

  const [input, setInput] = useState("");

  const chartData = [
    { name: "玩耍", value: 20 },
    { name: "进食", value: 11 },
    { name: "睡眠", value: 12 },
    { name: "运动", value: 18 },
    { name: "互动", value: 5 },
  ];

  const handleSend = async () => {
    if (!input) return;
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");

    try {
      // 动态获取 API URL
      const getApiUrl = () => {
        if (import.meta.env.DEV) {
          const hostname = window.location.hostname;
          return `http://${hostname}:3000/api/ai`;
        }
        return "/api/ai";
      };

      // 调用 AI API
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.reply }]);
    } catch (error) {
      console.error("AI API 调用失败:", error);
      setMessages((m) => [
        ...m,
        { role: "ai", text: "抱歉，AI 服务暂时不可用，请稍后再试。" },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="p-4 bg-white shadow text-center font-bold">
        宠物AI分析
      </div>

      {/* 聊天内容 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-xs ${
                msg.role === "user" ? "bg-yellow-300" : "bg-white border"
              }`}
            >
              <p>{msg.text}</p>
              {msg.chart && (
                <BarChart width={250} height={150} data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 底部输入栏 */}
      <div className="p-3 flex items-center bg-white border-t">
        <input
          className="flex-1 border rounded-xl px-3 py-2 mr-2"
          placeholder="请输入内容..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-xl"
          onClick={handleSend}
        >
          发送
        </button>
      </div>
    </div>
  );
}
