import { Environment } from "../data/activities";

export type IslandGroup = "luzon" | "visayas" | "mindanao";

export type Season = "cool_dry" | "hot_dry" | "wet";

export type Budget = "low" | "mid" | "high";

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
  | "cafes"
  | "explore";

export interface Preference {
  /** Always resolved to a concrete value (never "surprise") */
  island: IslandGroup | "any";

  /** Resolved environment, even if chosen via Surprise */
  environment: Environment;

  /** Resolved activity (never "surprise") */
  activity: Activity;

  /** Season user is traveling in */
  season: Season | "any";

  /** Budget preference */
  budget: Budget;

  /** Who the user is traveling with */
  group: TravelGroup;

  /**
   * Meta flag:
   * true if user tapped "Surprise me" on Environment
   * used only for UI / activity randomization
   */
  environmentWasSurprise?: boolean;
}
