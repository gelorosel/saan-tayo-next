import { personalities } from "@/src/data/personalities";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Returns a short tourist-friendly description and best months to visit for a destination using Gemini.
 */

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Simple in-memory cache to reduce API calls
const descriptionCache = new Map<string, GeminiDescriptionResult>();

function getCacheKey(destinationName: string, activity: string, personalityId?: string): string {
    return `${destinationName}|${activity}|${personalityId || 'none'}`;
}

export interface GeminiDescriptionResult {
    description: string;
    bestMonths: string;
}

export async function geminiShortDescription(
    destinationName: string,
    activity: string,
    personalityId?: string,
): Promise<GeminiDescriptionResult> {
    // Check cache first
    const cacheKey = getCacheKey(destinationName, activity, personalityId);
    const cached = descriptionCache.get(cacheKey);
    if (cached) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return cached;
    }

    console.log(`[Cache MISS] ${cacheKey} - Making API call...`);

    const ai = getAi();
    const personality = personalities.find((p) => p.id === personalityId) || null;
    const personalityLine = personality
        ? ` The traveler's personality type: ${personality.description}.`
        : "";
    let prompt = `Provide details for the tourist destination: ${destinationName}`
    prompt += ` and why it would fit for this tourist's preference: ${activity}.${personalityLine}`;
    prompt += ` Include the best months to visit.`;
    prompt += ` Do not use the phrase "perfect for" in your description.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "A concise 1-2 sentence description. Make sure it is factual and not too long." },
                    bestMonths: { type: Type.STRING, description: "Best months to visit (e.g., 'December to February' or 'March to May')." },
                },
                required: ["description", "bestMonths"]
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const parsed = JSON.parse(text.trim());
    const result = {
        description: parsed.description || "",
        bestMonths: parsed.bestMonths || ""
    };

    // Store in cache
    descriptionCache.set(cacheKey, result);
    console.log(`[Cached] ${cacheKey} - Cache size: ${descriptionCache.size}`);

    return result;
}
