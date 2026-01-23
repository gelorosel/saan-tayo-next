import { Destination } from "@/src/types/destination";
import { toQueryName } from "./destination";

export interface DescriptionData {
    description: string;
    source: 'gemini' | 'wiki';
}

interface LoadDescriptionOptions {
    destination: Destination;
    preferredActivity?: string;
    activities: string[];
}

/**
 * Loads a description for a destination, trying Wiki first, then Gemini as fallback
 * (or vice versa based on prioritizeGemini config)
 */
export async function loadDescription(
    options: LoadDescriptionOptions
): Promise<DescriptionData | null> {
    const { destination, preferredActivity, activities } = options;

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

    if (prioritizeGemini) {
        // Try Gemini first
        try {
            const geminiResponse = await fetch(`/api/gemini?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`);
            if (geminiResponse.ok) {
                const geminiData = await geminiResponse.json();
                if (geminiData.description) {
                    return {
                        description: geminiData.description,
                        source: 'gemini'
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
        // Try Wiki first
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

        // Fallback to Gemini if Wiki fails
        try {
            const geminiResponse = await fetch(`/api/gemini?destination=${encodeURIComponent(queryName)}&activity=${encodeURIComponent(activityParam)}`);
            if (geminiResponse.ok) {
                const geminiData = await geminiResponse.json();
                if (geminiData.description) {
                    return {
                        description: geminiData.description,
                        source: 'gemini'
                    };
                }
            }
        } catch {
            // Silently fail - will fallback to Wiki
        }
    }

    return null;
}
