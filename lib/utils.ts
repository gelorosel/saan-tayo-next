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
 * Converts an activity string into a verb form
 * @param activity - The activity string (e.g., "swim", "island_hop", "museums")
 * @returns A verb form of the activity (e.g., "swim", "island hop", "visit museums")
 */
export function prettifyActivity(activity: string): string {
  // Handle special cases
  const activityMap: Record<string, string> = {
    island_hop: "island hopping",
    natural_wonders: "natural wonders",
    waterfalls: "waterfalls",
    food_trip: "food trips",
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
