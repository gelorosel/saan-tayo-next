// ============================================
// RATE LIMIT CONFIGURATION
// Change this value to adjust the timeout duration
// ============================================
export const RATE_LIMIT_TIMEOUT_HOURS = 1; // Hours until rate limit resets

// ============================================
// RATE LIMIT CONSTANTS
// ============================================
export const MAX_DESCRIPTION_REQUESTS = 50;
const RATE_LIMIT_KEY = 'description-rate-limit';

export interface RateLimitData {
    count: number;
    resetTime: number; // Unix timestamp
}

/**
 * Get the current rate limit data from localStorage
 */
export function getRateLimitData(): RateLimitData {
    if (typeof window === 'undefined') {
        return { count: 0, resetTime: Date.now() + RATE_LIMIT_TIMEOUT_HOURS * 60 * 60 * 1000 };
    }

    try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        if (!stored) {
            return { count: 0, resetTime: Date.now() + RATE_LIMIT_TIMEOUT_HOURS * 60 * 60 * 1000 };
        }

        const data: RateLimitData = JSON.parse(stored);

        // Check if rate limit has expired
        if (Date.now() >= data.resetTime) {
            // Reset the rate limit
            const newData: RateLimitData = {
                count: 0,
                resetTime: Date.now() + RATE_LIMIT_TIMEOUT_HOURS * 60 * 60 * 1000
            };
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData));
            return newData;
        }

        return data;
    } catch (error) {
        console.error('Error reading rate limit data:', error);
        return { count: 0, resetTime: Date.now() + RATE_LIMIT_TIMEOUT_HOURS * 60 * 60 * 1000 };
    }
}

/**
 * Check if the user has exceeded the rate limit
 */
export function isRateLimited(): boolean {
    const data = getRateLimitData();
    return data.count >= MAX_DESCRIPTION_REQUESTS;
}

/**
 * Increment the rate limit counter
 * Returns the new count
 */
export function incrementRateLimit(): number {
    if (typeof window === 'undefined') return 0;

    try {
        const data = getRateLimitData();

        // If already at limit, don't increment
        if (data.count >= MAX_DESCRIPTION_REQUESTS) {
            return data.count;
        }

        const newData: RateLimitData = {
            count: data.count + 1,
            resetTime: data.resetTime
        };

        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData));
        return newData.count;
    } catch (error) {
        console.error('Error incrementing rate limit:', error);
        return 0;
    }
}

/**
 * Get remaining requests before rate limit
 */
export function getRemainingRequests(): number {
    const data = getRateLimitData();
    return Math.max(0, MAX_DESCRIPTION_REQUESTS - data.count);
}

/**
 * Get time remaining until rate limit resets (in milliseconds)
 */
export function getTimeUntilReset(): number {
    const data = getRateLimitData();
    return Math.max(0, data.resetTime - Date.now());
}

/**
 * Format time until reset as a human-readable string
 */
export function formatTimeUntilReset(): string {
    const ms = getTimeUntilReset();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}${minutes > 0 ? ` and ${minutes} minute${minutes === 1 ? '' : 's'}` : ''}`;
    }

    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

/**
 * Reset the rate limit (for testing/admin purposes)
 */
export function resetRateLimit(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(RATE_LIMIT_KEY);
    } catch (error) {
        console.error('Error resetting rate limit:', error);
    }
}

/**
 * Reset the rate limit (for testing/admin purposes)
 */
export function triggerRateLimit(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: MAX_DESCRIPTION_REQUESTS, resetTime: Date.now() + RATE_LIMIT_TIMEOUT_HOURS * 60 * 60 * 1000 }));
    } catch (error) {
        console.error('Error resetting rate limit:', error);
    }
}

