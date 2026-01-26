import { Destination } from "@/src/types/destination";
import { toQueryName } from "./destination";

export interface DescriptionData {
    description: string;
    source: 'gemini' | 'wiki';
    bestMonths?: string;
}

interface LoadDescriptionOptions {
    destination: Destination;
    preferredActivity?: string;
    activities: string[];
    personalityId?: string;
}

/**
 * Loads a description for a destination, trying Wiki first, then Gemini as fallback
 * (or vice versa based on prioritizeGemini config)
 */
export async function loadDescription(
    options: LoadDescriptionOptions
): Promise<DescriptionData | null> {
    const { destination, preferredActivity, activities, personalityId } = options;

    // Get configuration
    let prioritizeGemini = false;
    let fastMode = false;
    try {
        // Check localStorage first for fast mode
        const saved = localStorage.getItem("fastMode");
        if (saved !== null) {
            fastMode = saved === "true";
        }

        // Get prioritizeGemini from API
        const configResponse = await fetch('/api/config');
        if (configResponse.ok) {
            const config = await configResponse.json();
            prioritizeGemini = config.prioritizeGemini || false;
            // Only use API fastMode if localStorage doesn't have a value
            if (saved === null) {
                fastMode = config.fastMode || false;
            }
        }
    } catch {
        // Silently fail
    }

    // Fast mode: skip description fetching
    if (fastMode) {
        return null;
    }

    const queryName = toQueryName(destination);
    const activityParam = preferredActivity || activities[0] || 'travel';
    const personalityParam = personalityId
        ? `&personalityId=${encodeURIComponent(personalityId)}`
        : "";

    if (prioritizeGemini) {
        // Try Gemini first
        try {
            const geminiResponse = await fetch(
                `/api/gemini?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}${personalityParam}`
            );
            if (geminiResponse.ok) {
                const geminiData = await geminiResponse.json();
                if (geminiData.description) {
                    return {
                        description: geminiData.description,
                        source: 'gemini',
                        bestMonths: geminiData.bestMonths
                    };
                }
            }
        } catch {
            // Silently fail - will fallback to Wiki
        }

        // Fallback to Wiki if Gemini fails
        try {
            const wikiResponse = await fetch(`/api/wiki?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`);
            if (wikiResponse.ok) {
                const wikiData = await wikiResponse.json();
                if (wikiData.description) {
                    return {
                        description: wikiData.description,
                        source: 'wiki'
                    };
                }
            }
        } catch (error) {
            console.error("Error fetching wiki description:", error);
        }
    } else {
        // Try Wiki and Gemini in parallel, prefer Gemini if both succeed
        const [wikiResult, geminiResult] = await Promise.allSettled([
            fetch(`/api/wiki?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => data?.description ? { description: data.description, source: 'wiki' as const } : null)
                .catch(() => null),
            fetch(`/api/gemini?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}${personalityParam}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => data?.description ? {
                    description: data.description,
                    source: 'gemini' as const,
                    bestMonths: data.bestMonths
                } : null)
                .catch(() => null)
        ]);

        // Prefer Gemini if both succeed, otherwise use whichever succeeded
        const geminiData = geminiResult.status === 'fulfilled' ? geminiResult.value : null;
        const wikiData = wikiResult.status === 'fulfilled' ? wikiResult.value : null;

        if (geminiData) {
            return geminiData;
        }
        if (wikiData) {
            return wikiData;
        }
    }

    return null;
}
