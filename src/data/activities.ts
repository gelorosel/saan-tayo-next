import { Activity } from "../types/preference";

export type ActivityOption = { label: string; value: Activity };
export type Environment = "beach" | "mountains" | "city" | "reef" | "any";
export type Vibe = "rest" | "activities" | "sights" | "learn";

export const pretty = (v: string) =>
  v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const envActivityMap: Record<string, ActivityOption[]> =
{
  beach: [
    { label: "Swim", value: "swim" },
    { label: "Snorkel", value: "snorkel" },
    { label: "Dive", value: "dive" },
    { label: "Island hop", value: "island_hop" },
    { label: "Surf", value: "surf" },
    { label: "Relax", value: "relax" },
    { label: "Natural wonders", value: "natural_wonders" },
    { label: "Party / Nightlife", value: "nightlife" },
    { label: "Food trip", value: "food_trip" },
  ],
  mountains: [
    { label: "Hike", value: "hike" },
    { label: "Trek / multi-day", value: "trek" },
    { label: "Camping", value: "camp" },
    { label: "Waterfalls", value: "waterfalls" },
    { label: "Natural wonders", value: "natural_wonders" },
    { label: "Explore", value: "explore" },
    { label: "Heritage / Historical sites", value: "history" },
    { label: "Relax", value: "relax" },
    { label: "Swim", value: "swim" },
    { label: "Food trip", value: "food_trip" },
  ],
  city: [
    { label: "Food trip", value: "food_trip" },
    { label: "Museums", value: "museums" },
    { label: "Heritage / Historical sites", value: "history" },
    { label: "Party / Nightlife", value: "nightlife" },
    { label: "Explore", value: "explore" },
    { label: "Relax", value: "relax" },
  ],
};

const vibeActivityMap: Record<Vibe, Activity[]> = {
  rest: ["relax", "swim", "camp", "food_trip", "nightlife", "hike", "history", "explore", "museums"],
  activities: ["hike", "trek", "camp", "dive", "snorkel", "surf", "island_hop", "waterfalls", "natural_wonders", "swim"],
  sights: ["explore", "island_hop", "natural_wonders", "food_trip", "waterfalls", "history", "museums", "hike", "dive", "snorkel", "swim"],
  learn: ["museums", "history", "explore", "food_trip", "natural_wonders", "snorkel", "hike", "swim"],
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
        ]
      )
      : envActivityMap[environment] ?? [];

  if (!vibe) return baseOptions;

  const allowed = new Set(vibeActivityMap[vibe] ?? []);
  const filtered = baseOptions.filter((option) => allowed.has(option.value));

  const activityOptions = filtered.length > 0 ? filtered : baseOptions
  return activityOptions.slice().sort((a, b) =>
    a.label.localeCompare(b.label)
  );
};

