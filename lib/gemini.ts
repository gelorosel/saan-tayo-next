import { GoogleGenAI, Type } from "@google/genai";

/**
 * Returns a short tourist-friendly description for a destination using Gemini.
 */

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function geminiShortDescription(
    destinationName: string,
    activity: string
): Promise<string> {
    const ai = getAi();

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `Provide details for the tourist destination: ${destinationName} and why it would fit for this tourist's preference: ${activity}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "A concise 1-2 sentence description." },
                },
                required: ["description"]
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const parsed = JSON.parse(text.trim());
    return parsed.description || "";
}
