import { callAIModel } from "../services/aiService.js";

export const getAIResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "缺少 prompt 参数" });
    }

    const reply = await callAIModel(prompt);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI 服务出错", details: err.message });
  }
};
