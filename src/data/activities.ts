import { Activity } from "../types/preference";

// src/data/activities.ts
export type ActivityOption = { label: string; value: Activity };
export type Environment = "beach" | "mountains" | "city" | "reef";

export const activityOptionsByEnvironment: Record<Environment, ActivityOption[]> =
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
  ],
  mountains: [
    { label: "Hike", value: "hike" },
    { label: "Trek / multi-day", value: "trek" },
    { label: "Camping", value: "camp" },
    { label: "Waterfalls", value: "waterfalls" },
    { label: "Natural wonders", value: "natural_wonders" },
    { label: "Explore", value: "explore" },
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
};
