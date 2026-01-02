
import { GoogleGenAI, Type } from "@google/genai";

export const getCollectionTheme = async (imageCount: number) => {
  // 安全地获取 API Key，避免 process 未定义的错误
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) return { title: "我的电影收藏", vibe: "一段充满回忆的光影之旅。" };

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `我正在制作一个包含 ${imageCount} 张海报的电影海报墙。请为这个合集起一个 4-6 字的中文电影感标题，并写一句非常简短（15字以内）的中文氛围描述。请以 JSON 格式返回。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            vibe: { type: Type.STRING }
          },
          required: ["title", "vibe"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);
    return data;
  } catch (error) {
    console.error("Gemini Error:", error);
    return { title: "光影长廊", vibe: "属于你的私人电影画廊。" };
  }
};
