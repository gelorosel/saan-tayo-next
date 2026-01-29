export const FALLBACK_IMAGE = "/images/default-img.jpeg";

// Unwanted Unsplash image IDs (e.g., overused, low quality, or misleading images)
const BLOCKED_FALLBACK_IMAGE_IDS = new Set([
    "Ac7sWF9ogFA", // Chocolate Hills - oversaturates results
    "ouXsKzf7R98", // Davao City - oversaturates results
    "h108t1opIhY", // Entomophobia risk
    "lcrtG-zEHEY", // Not generic enough
    "tNaDgrIE9us", // Irrelevant image
    "BD_fOwfFiLM", // Irrelevant image
    "1OKsBTeKIok", // Irrelevant image
]);

// Cache for recently used fallback images - prevents repeating images
const RECENT_FALLBACK_CACHE_KEY = "unsplash-recent-fallbacks";
const MAX_RECENT_FALLBACKS = 3;

export interface UnsplashImageData {
    id?: string;
    url: string;
    photographerName: string;
    photographerUsername: string;
    photographerUrl: string;
    downloadLocation?: string;
}

// Get recently used fallback image IDs from localStorage
function getRecentFallbackIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const cached = localStorage.getItem(RECENT_FALLBACK_CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
    } catch {
        return [];
    }
}

// Add a fallback image ID to the recent cache
function addRecentFallbackId(imageId: string) {
    if (typeof window === "undefined") return;
    try {
        const recent = getRecentFallbackIds();
        // Add to the front, keep only last MAX_RECENT_FALLBACKS
        const updated = [imageId, ...recent.filter(id => id !== imageId)].slice(0, MAX_RECENT_FALLBACKS);
        localStorage.setItem(RECENT_FALLBACK_CACHE_KEY, JSON.stringify(updated));
    } catch {
        // Silently fail if localStorage is not available
    }
}

export async function fetchUnsplashImage(
    query: string,
    isFallbackQuery: boolean = false
): Promise<UnsplashImageData | null> {
    try {
        // if query contains "mt." remove it
        query = query.replace(/\bmt\.\s*/g, '');

        const perPage = isFallbackQuery ? 20 : 1;
        const response = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&per_page=${perPage}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();

        if (isFallbackQuery && data.results && data.results.length > 0) {
            // Get recently used fallback image IDs
            const recentFallbackIds = getRecentFallbackIds();

            // Filter out blocked images and recently used fallback images
            const filtered = data.results.filter((image: any) => {
                return !BLOCKED_FALLBACK_IMAGE_IDS.has(image.id) && !recentFallbackIds.includes(image.id);
            });

            if (filtered.length > 0) {
                const randomIndex = Math.floor(Math.random() * Math.min(filtered.length, 20));
                const image = filtered[randomIndex];
                console.log("Selected fallback image:", image);

                // Cache this fallback image ID to prevent reuse
                if (image?.id) {
                    addRecentFallbackId(image.id);
                }

                return image || null;
            }

            // If all results were filtered out but we have results, allow reusing recent ones
            if (data.results.length > 0) {
                const fallbackFiltered = data.results.filter((image: any) => {
                    return !BLOCKED_FALLBACK_IMAGE_IDS.has(image.id);
                });

                if (fallbackFiltered.length > 0) {
                    const randomIndex = Math.floor(Math.random() * Math.min(fallbackFiltered.length, 20));
                    const image = fallbackFiltered[randomIndex];
                    console.log("Selected fallback image (reusing recent):", image);

                    if (image?.id) {
                        addRecentFallbackId(image.id);
                    }

                    return image || null;
                }
            }

            // If all results were blocked, return null to trigger fallback
            return null;
        }

        return data || null;
    } catch {
        return null;
    }
}

export async function triggerDownload(downloadLocation: string | undefined) {
    if (!downloadLocation) return;

    try {
        await fetch(`/api/unsplash/download?download_location=${encodeURIComponent(downloadLocation)}`);
    } catch {
        // Silently fail - download tracking is not critical
        // but it's polite to do
    }
}
