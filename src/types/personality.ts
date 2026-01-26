export type PersonalityId =
  | "relaxed_escapist"
  | "adventurer"
  | "curious_wanderer"
  | "master_planner"
  | "chill_explorer"
  | "purposeful_adventurer"
  | "free_spirited_nomad"
  | "soft_life_traveler"
  | "cultural_strategist"
  | "chaos_romantic"
  | "mood_based_traveler";

export type PersonalityCategory = "core" | "hybrid" | "rare";

export interface PersonalityProfile {
  id: PersonalityId;
  emoji: string;
  name: string;
  category: PersonalityCategory;
  description: string;
  strengths: string[];
  struggles: string[];
  compatibleWith: PersonalityId[];
  avoidWith: PersonalityId[];
}
