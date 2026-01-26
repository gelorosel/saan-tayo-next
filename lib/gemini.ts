import { personalities } from "@/src/data/personalities";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Returns a short tourist-friendly description and best months to visit for a destination using Gemini.
 */

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface GeminiDescriptionResult {
    description: string;
    bestMonths: string;
}

export async function geminiShortDescription(
    destinationName: string,
    activity: string,
    personalityId?: string,
): Promise<GeminiDescriptionResult> {
    const ai = getAi();
    const personality = personalities.find((p) => p.id === personalityId) || null;
    const personalityLine = personality
        ? ` The traveler's personality type: ${personality.description}.`
        : "";
    const prompt = `Provide details for the tourist destination: ${destinationName} and why it would fit for this tourist's preference: ${activity}.${personalityLine} Include the best months to visit. Do not use the phrase "perfect for" in your description.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "A concise 1-2 sentence description." },
                    bestMonths: { type: Type.STRING, description: "Best months to visit (e.g., 'December to February' or 'March to May')." },
                },
                required: ["description", "bestMonths"]
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const parsed = JSON.parse(text.trim());
    return {
        description: parsed.description || "",
        bestMonths: parsed.bestMonths || ""
    };
}
