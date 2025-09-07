import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export const callAIModel = async (prompt) => {
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

  const data = await response.json();

  if (!data.choices) {
    throw new Error(JSON.stringify(data));
  }

  return data.choices[0].message.content;
};
