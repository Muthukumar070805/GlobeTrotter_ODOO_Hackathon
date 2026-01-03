
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiSuggestion, CityInfo } from "../types";

<<<<<<< HEAD
// Always initialize with named parameter and direct process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
=======
// Initialize with Vite environment variable
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
>>>>>>> 5ab50d3 (Configure app for Vercel deployment with environment variables)

export const GeminiService = {
  async searchCities(query: string, region: string = "All"): Promise<CityInfo[]> {
    try {
      const prompt = `Provide a list of 6 travel cities related to "${query}" in the region "${region}". 
      For each city, include: name, country, region, costIndex (1-5), popularity (1-100), and a brief 1-sentence description. 
      Return as JSON array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                country: { type: Type.STRING },
                region: { type: Type.STRING },
                costIndex: { type: Type.INTEGER },
                popularity: { type: Type.INTEGER },
                description: { type: Type.STRING },
              },
              propertyOrdering: ["name", "country", "region", "costIndex", "popularity", "description"]
            }
          }
        }
      });
<<<<<<< HEAD
      
=======

>>>>>>> 5ab50d3 (Configure app for Vercel deployment with environment variables)
      const jsonStr = (response.text || "").trim();
      return jsonStr ? JSON.parse(jsonStr) : [];
    } catch (e) {
      console.error("Gemini City Search Error:", e);
      return [];
    }
  },

  async getActivitySuggestions(city: string, budgetLevel: string): Promise<GeminiSuggestion[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `List 5 unique activities to do in ${city} for a ${budgetLevel} budget.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                category: { type: Type.STRING },
                bestTime: { type: Type.STRING },
              },
              propertyOrdering: ["name", "description", "estimatedCost", "category", "bestTime"]
            }
          }
        }
      });
      const jsonStr = (response.text || "").trim();
      return jsonStr ? JSON.parse(jsonStr) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
