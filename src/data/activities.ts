// src/data/activities.ts
export type ActivityOption = { label: string; value: string };
export type Environment = "beach" | "mountains" | "city";
export type EnvironmentOrSurprise = Environment | "surprise";

const withSurprise = (opts: ActivityOption[]): ActivityOption[] => [
  ...opts,
  { label: "Surprise me", value: "surprise" },
];

export const activityOptionsByEnvironment: Record<Environment, ActivityOption[]> =
  {
    beach: withSurprise([
      { label: "Swim", value: "swim" },
      { label: "Snorkel", value: "snorkel" },
      { label: "Dive", value: "dive" },
      { label: "Island hop", value: "island_hop" },
      { label: "Surf", value: "surf" },
      { label: "Relax", value: "relax" },
      { label: "Natural wonders", value: "natural_wonders" },
    ]),
    mountains: withSurprise([
      { label: "Hike", value: "hike" },
      { label: "Trek / multi-day", value: "trek" },
      { label: "Camping", value: "camp" },
      { label: "Waterfalls", value: "waterfalls" },
      { label: "Historical sites", value: "history" },
      { label: "Relax", value: "relax" },
      { label: "Natural wonders", value: "natural_wonders" },
    ]),
    city: withSurprise([
      { label: "Food trip", value: "food_trip" },
      { label: "Museums", value: "museums" },
      { label: "Historical sites", value: "history" },
      { label: "Nightlife", value: "nightlife" },
      { label: "Markets", value: "markets" },
      { label: "Cafés", value: "cafes" },
      { label: "Explore", value: "explore" },
    ]),
  };
