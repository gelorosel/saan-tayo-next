export type IslandGroup = "Luzon" | "Visayas" | "Mindanao";

export type Season =
  | "cool_dry"
  | "hot_dry"
  | "wet"
  | "typhoon";

export type Activity =
  | "swim"
  | "hike"
  | "relax"
  | "explore"
  | "surf";

export interface Destination {
  id: string;
  name: string;
  island: IslandGroup;
  activities: Activity[];
  bestSeasons: Season[];
  budget: "low" | "mid" | "high";
  crowdLevel: "low" | "medium" | "high";
}
