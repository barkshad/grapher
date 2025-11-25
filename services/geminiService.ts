import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set REACT_APP_API_KEY or process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export interface AIAnalysisResult {
  title: string;
  description: string;
  tags: string[];
}

export const analyzeImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  const ai = getAiClient();
  
  // Extract base64 data if it includes the prefix
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: "Analyze this image for a professional photography portfolio. Generate a creative Title, a professional Description, and a list of 5 relevant Tags."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise, creative title for the photo" },
            description: { type: Type.STRING, description: "A professional, descriptive sentence about the photo" },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of single-word tags"
            }
          },
          required: ["title", "description", "tags"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};