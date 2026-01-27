import { Activity } from "../types/preference";

// src/data/activities.ts
export type ActivityOption = { label: string; value: Activity };
export type Environment = "beach" | "mountains" | "city" | "reef" | "any";
export type Vibe = "rest" | "activities" | "sights" | "learn";

export const envActivityMap: Record<Environment, ActivityOption[]> =
{
  beach: [
    { label: "Swim", value: "swim" },
    { label: "Snorkel", value: "snorkel" },
    { label: "Dive", value: "dive" },
    { label: "Island hop", value: "island_hop" },
    { label: "Surf", value: "surf" },
    { label: "Relax", value: "relax" },
    { label: "Natural wonders", value: "natural_wonders" },
    { label: "Nightlife", value: "nightlife" },
    { label: "Food trip", value: "food_trip" },
  ],
  mountains: [
    { label: "Hike", value: "hike" },
    { label: "Trek / multi-day", value: "trek" },
    { label: "Camping", value: "camp" },
    { label: "Waterfalls", value: "waterfalls" },
    { label: "Natural wonders", value: "natural_wonders" },
    { label: "Explore", value: "explore" },
    { label: "Historical sites", value: "history" },
  ],
  city: [
    { label: "Food trip", value: "food_trip" },
    { label: "Museums", value: "museums" },
    { label: "Historical sites", value: "history" },
    { label: "Nightlife", value: "nightlife" },
    { label: "Explore", value: "explore" },
  ],
  reef: [
    { label: "Dive", value: "dive" },
    { label: "Snorkel", value: "snorkel" },
    { label: "Swim", value: "swim" },
    { label: "Natural wonders", value: "natural_wonders" },
  ],
  any: []
};

const vibeActivityMap: Record<Vibe, Activity[]> = {
  rest: ["relax", "swim", "camp", "food_trip", "nightlife", "hike", "history", "waterfalls"],
  activities: ["hike", "trek", "camp", "dive", "snorkel", "surf", "island_hop", "waterfalls", "natural_wonders"],
  sights: ["explore", "island_hop", "natural_wonders", "food_trip", "waterfalls", "history", "museums", "hike", "dive", "snorkel"],
  learn: ["museums", "history", "explore", "food_trip", "natural_wonders", "snorkel", "hike"],
};

const uniqueOptionsByValue = (options: ActivityOption[]): ActivityOption[] => {
  const seen = new Set<Activity>();
  return options.filter((option) => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
};

export const getActivityOptions = (
  environment: Environment,
  vibe?: Vibe
): ActivityOption[] => {
  const baseOptions =
    environment === "any"
      ? uniqueOptionsByValue(
        [
          ...envActivityMap.beach,
          ...envActivityMap.mountains,
          ...envActivityMap.city,
          ...envActivityMap.reef,
        ]
      )
      : envActivityMap[environment] ?? [];

  if (!vibe) return baseOptions;

  const allowed = new Set(vibeActivityMap[vibe] ?? []);
  const filtered = baseOptions.filter((option) => allowed.has(option.value));
  return filtered.length > 0 ? filtered : baseOptions;
};

