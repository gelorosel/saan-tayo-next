import { PersonalityId } from "@/src/types/personality";
import { Activity } from "@/src/types/preference";

type AnswerKey = "a" | "b" | "c" | "d";

const QUESTION_IDS = [
  "traveler_morning",
  "traveler_afternoon",
  "traveler_spend",
  "traveler_suitcase",
  "traveler_plans",
];

const answerToPersonality: Record<AnswerKey, PersonalityId> = {
  a: "relaxed_escapist",
  b: "adventurer",
  c: "curious_wanderer",
  d: "master_planner",
};

const hybridByPair: Record<string, PersonalityId> = {
  "a+c": "chill_explorer",
  "b+d": "purposeful_adventurer",
  "b+c": "free_spirited_nomad",
  "a+d": "soft_life_traveler",
  "c+d": "cultural_strategist",
};

export type PersonalityScoreResult = {
  primary: PersonalityId;
  scores: Record<PersonalityId, number>;
  preferredActivities: Activity[];
};

export function personalityScore(
  answers: Record<string, string>
): PersonalityScoreResult | null {
  const answerCounts: Record<AnswerKey, number> = { a: 0, b: 0, c: 0, d: 0 };

  // Count answers
  for (const id of QUESTION_IDS) {
    const answer = answers[id] as AnswerKey | undefined;
    if (answer && answer in answerToPersonality) {
      answerCounts[answer] += 1;
    }
  }

  // Check if any answers were given
  const distinctAnswers = Object.values(answerCounts).filter((count) => count > 0).length;
  if (distinctAnswers === 0) return null;

  // Sort answers by count
  const sortedKeys = (["a", "b", "c", "d"] as AnswerKey[]).sort((a, b) =>
    answerCounts[b] - answerCounts[a]
  );

  const maxCount = answerCounts[sortedKeys[0]];

  // Check for rare types
  if (distinctAnswers === 4 && maxCount - answerCounts[sortedKeys[3]] <= 1) {
    const primary = "chaos_romantic";
    return { primary, scores: answerCounts as any, preferredActivities: personalityPreferredActivities[primary] };
  }

  if (distinctAnswers >= 3 && maxCount <= 2) {
    const primary = "mood_based_traveler";
    return { primary, scores: answerCounts as any, preferredActivities: personalityPreferredActivities[primary] };
  }

  // Check for hybrid type
  const topPair = [sortedKeys[0], sortedKeys[1]].sort().join("+");
  const primary = hybridByPair[topPair] || answerToPersonality[sortedKeys[0]];

  return { primary, scores: answerCounts as any, preferredActivities: personalityPreferredActivities[primary] };
}

const personalityPreferredActivities: Record<PersonalityId, Activity[]> = {
  // Pure relaxation - gets Tagaytay, Mactan, peaceful beaches
  relaxed_escapist: ["relax", "swim", "food_trip"],

  // Hardcore adventure - gets Siargao, Lanuza, La Union, mountain treks
  adventurer: ["surf", "hike", "trek", "dive", "waterfalls", "natural_wonders"],

  // Cultural exploration - wandering, local experiences
  curious_wanderer: ["explore", "food_trip", "museums", "history", "nightlife", "island_hop"],

  // Can plan anything - master planner gets all activities
  master_planner: ["museums", "history", "food_trip", "natural_wonders", "island_hop", "explore", "camp", "snorkel", "hike", "trek", "dive", "surf", "waterfalls", "relax", "swim"],

  // Balanced explorer - gentle adventures with rest (camping, easy hikes, snorkeling)
  chill_explorer: ["relax", "explore", "food_trip", "swim", "snorkel", "camp", "island_hop"],

  // Planned adventure - same as adventurer but organized
  purposeful_adventurer: ["hike", "trek", "dive", "surf", "waterfalls", "natural_wonders", "camp"],

  // Spontaneous traveler - island hopping, surfing, social activities
  free_spirited_nomad: ["island_hop", "surf", "explore", "nightlife", "food_trip", "dive", "snorkel"],

  // Comfort-focused - easy activities, no roughing it
  soft_life_traveler: ["relax", "swim", "food_trip", "explore", "snorkel"],

  // Heritage & culture - gets Vigan, Binondo, historical cities
  cultural_strategist: ["museums", "history", "food_trip", "explore"],

  // Unpredictable mix - variety of social and adventurous activities
  chaos_romantic: ["explore", "nightlife", "island_hop", "surf", "food_trip", "dive", "snorkel"],

  // Flexible traveler - balanced mix that adapts to mood
  mood_based_traveler: ["relax", "explore", "food_trip", "swim", "hike", "camp"],
};
