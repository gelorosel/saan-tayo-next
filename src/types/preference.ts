import { Environment } from "../data/activities";

export type IslandGroup = "luzon" | "visayas" | "mindanao";

export type Season = "cool_dry" | "hot_dry" | "wet";

export type TravelGroup = "solo" | "couple" | "friends" | "family";

export type Activity =
  | "swim"
  | "snorkel"
  | "dive"
  | "island_hop"
  | "surf"
  | "relax"
  | "natural_wonders"
  | "hike"
  | "trek"
  | "camp"
  | "waterfalls"
  | "history"
  | "food_trip"
  | "museums"
  | "nightlife"
  | "markets"
  | "explore";

export interface Preference {
  island?: IslandGroup;

  environment?: Environment;

  activity?: Activity;

  season?: Season;

  /** Who the user is traveling with */
  group?: TravelGroup;
}
