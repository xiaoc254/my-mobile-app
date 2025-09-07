import fetch from "node-fetch";

export const callAIModel = async (prompt) => {
  try {
    console.log("API Key存在:", !!process.env.OPENAI_API_KEY);
    console.log("API Key前缀:", process.env.OPENAI_API_KEY?.substring(0, 10));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // 可以换成别的模型
        messages: [{ role: "user", content: prompt }],
      }),
    });

    console.log("API 响应状态:", response.status);

    const data = await response.json();
    console.log("API 响应数据:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`OpenAI API 错误 (${response.status}): ${JSON.stringify(data)}`);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error(`API 响应格式错误: ${JSON.stringify(data)}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI 服务详细错误:", error);
    throw error;
  }
};
