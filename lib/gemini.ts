import { personalities } from "@/src/data/personalities";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Returns a short tourist-friendly description and best months to visit for a destination using Gemini.
 */

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Simple in-memory cache to reduce API calls
const MAX_CACHE_SIZE = 500;
const descriptionCache = new Map<string, GeminiDescriptionResult>();

function getCacheKey(destinationName: string, activity: string, personalityId?: string): string {
    return `${destinationName}|${activity}|${personalityId || 'none'}`;
}

function formatActivity(activity: string): string {
    // Convert snake_case to human-readable format
    return activity
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

function evictOldestCacheEntry(): void {
    if (descriptionCache.size >= MAX_CACHE_SIZE) {
        const firstKey = descriptionCache.keys().next().value;
        if (firstKey) {
            descriptionCache.delete(firstKey);
            console.log(`[Cache] Evicted oldest entry. Size: ${descriptionCache.size}`);
        }
    }
}

export interface GeminiDescriptionResult {
    description: string;
    bestMonths: string;
}

function buildPrompt(
    destinationName: string,
    activity: string,
    personalityDescription?: string
): string {
    const formattedActivity = formatActivity(activity);
    const parts: string[] = [];

    // Base prompt
    parts.push(`You are a knowledgeable travel guide for the Philippines.`);
    parts.push(`Provide details for: ${destinationName}`);
    parts.push(`Why it fits travelers interested in: ${formattedActivity}`);

    // Personality context
    if (personalityDescription) {
        parts.push(`Traveler personality: ${personalityDescription}`);
    }

    // General guidelines
    parts.push(`\nGuidelines:`);
    parts.push(`- Be concise and factual`);
    parts.push(`- Avoid phrases like "perfect for", "ideal", or "ultimate"`);
    parts.push(`- Focus on unique features and practical information`);
    parts.push(`- Use natural, conversational language`);

    // Activity-specific instructions
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('trek') || activityLower.includes('hike') || destinationName.toLowerCase().includes('mt')) {
        parts.push(`- Mention trail difficulty (beginner/moderate/difficult)`);
        parts.push(`- Note approximate duration if known`);
    }
    if (activityLower.includes('dive') || activityLower.includes('snorkel')) {
        parts.push(`- Mention marine life or underwater features`);
        parts.push(`- Note visibility and best dive sites if applicable`);
    }
    if (activityLower.includes('surf')) {
        parts.push(`- Mention wave conditions and surf spots`);
        parts.push(`- Note if suitable for beginners or advanced`);
    }
    if (activityLower.includes('museum')) {
        parts.push(`- Mention specific museums or galleries in the area`);
    }
    if (activityLower.includes('food')) {
        parts.push(`- Mention must-try local dishes or specialties`);
    }
    if (activityLower.includes('city')) {
        parts.push(`- Mention nearby attractions in the same island or province`);
    }

    // Specific corrections
    if (destinationName.toLowerCase().includes('carcar')) {
        parts.push(`- Note: Carcar City is the shoe capital of Cebu, not the Philippines`);
    }
    parts.push(`- Note: Do not call Kinilaw the "Filipino Ceviche"`);

    return parts.join('\n');
}

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

function validateResult(parsed: any): GeminiDescriptionResult {
    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid response format from AI');
    }

    const description = parsed.description?.trim();
    const bestMonths = parsed.bestMonths?.trim();

    if (!description || typeof description !== 'string') {
        throw new Error('Missing or invalid description in AI response');
    }

    if (!bestMonths || typeof bestMonths !== 'string') {
        throw new Error('Missing or invalid bestMonths in AI response');
    }

    // Ensure description isn't too short or too long
    if (description.length < 20) {
        throw new Error('Description too short');
    }

    if (description.length > 500) {
        console.warn('[Validation] Description longer than expected:', description.length);
    }

    return { description, bestMonths };
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

    try {
        const personality = personalities.find((p) => p.id === personalityId);
        const prompt = buildPrompt(
            destinationName,
            activity,
            personality?.description
        );

        const result = await retryWithBackoff(async () => {
            const ai = getAi();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: {
                                type: Type.STRING,
                                description: "A concise 2-3 sentence description highlighting unique features and why it suits the activity. Be factual and specific."
                            },
                            bestMonths: {
                                type: Type.STRING,
                                description: "Best months to visit in format 'Month to Month' (e.g., 'November to February', 'March to May', or 'Year-round')."
                            },
                        },
                        required: ["description", "bestMonths"]
                    }
                }
            });

            const text = response.text;
            if (!text) {
                throw new Error("Empty response from AI");
            }

            const parsed = JSON.parse(text.trim());
            return validateResult(parsed);
        });

        // Store in cache with eviction policy
        evictOldestCacheEntry();
        descriptionCache.set(cacheKey, result);
        console.log(`[Cached] ${cacheKey} - Cache size: ${descriptionCache.size}`);

        return result;
    } catch (error) {
        console.error(`[Error] Failed to generate description for ${destinationName}:`, error);

        // Return fallback result instead of throwing
        return {
            description: `${destinationName} is a beautiful destination in the Philippines offering great opportunities for ${formatActivity(activity).toLowerCase()}.`,
            bestMonths: 'November to May'
        };
    }
}
