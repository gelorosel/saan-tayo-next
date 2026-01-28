import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const uniqueByValue = <T extends { value: string }>(arr: T[]): T[] => {
  const map = new Map<string, T>();

  for (const item of arr) {
    if (!map.has(item.value)) {
      map.set(item.value, item);
    }
  }

  return Array.from(map.values());
};

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts an activity string into a verb form
 * @param activity - The activity string (e.g., "swim", "island_hop", "museums")
 * @returns A verb form of the activity (e.g., "swim", "island hop", "visit museums")
 */
export function prettifyActivity(activity: string): string {
  // Handle special cases
  const activityMap: Record<string, string> = {
    island_hop: "island hopping",
    natural_wonders: "natural wonders",
    food_trip: "food trips",
    waterfalls: "to see",
    museums: "to see",
    history: "to see",
    nightlife: "to see", // not much nightlife outside cities
    trek: "to trek",
    camp: "camping",
    relax: "destinations to relax",
    explore: "to explore",
    swim: "to swim",
    snorkel: "to snorkel",
    dive: "to dive",
    surf: "to surf",
    hike: "to hike",
  };

  // Return mapped value if exists, otherwise convert snake_case to space-separated and capitalize
  if (activityMap[activity]) {
    return activityMap[activity];
  }

  // Default: replace underscores with spaces and capitalize first letter
  return activity
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * This was TOO FRUSTRATING to figure out!!!
 * Converts an image URL to a data URL using canvas for better iOS compatibility
 * @param imageUrl - The URL of the image to convert
 * @returns Promise that resolves to a data URL string
 */
export const convertImageToDataUrl = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Constrain dimensions for iOS compatibility
        // Max dimension 2048px to stay well under iOS canvas limits
        const maxDimension = 2048;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        // Create canvas with constrained dimensions
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', {
          alpha: false, // Better performance for JPEG
          willReadFrequently: false
        });

        if (ctx) {
          // Fill with white background (for transparency)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to data URL with optimized quality for iOS
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

          // Verify data URL is valid and not too large (iOS has ~10MB limit for data URLs)
          if (dataUrl.length > 10 * 1024 * 1024) {
            reject(new Error('Image too large after conversion'));
          } else {
            resolve(dataUrl);
          }
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Set src to trigger loading
    img.src = imageUrl;
  });
};
