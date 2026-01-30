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

function countAnswers(answers: Record<string, string>): Record<AnswerKey, number> {
  const counts: Record<AnswerKey, number> = { a: 0, b: 0, c: 0, d: 0 };

  for (const id of QUESTION_IDS) {
    const answer = answers[id] as AnswerKey | undefined;
    if (answer && answer in answerToPersonality) {
      counts[answer]++;
    }
  }

  return counts;
}

function determinePersonality(counts: Record<AnswerKey, number>): PersonalityId {
  const sorted = (["a", "b", "c", "d"] as AnswerKey[]).sort((a, b) => counts[b] - counts[a]);
  const [first, second, , fourth] = sorted;
  const [max, secondMax] = [counts[first], counts[second]];
  const distinctCount = Object.values(counts).filter(c => c > 0).length;

  // Chaos romantic: all 4 types with similar counts
  if (distinctCount === 4 && max - counts[fourth] <= 1) {
    return "chaos_romantic";
  }

  // Mood based: 3+ types with low max count
  if (distinctCount >= 3 && max <= 2) {
    return "mood_based_traveler";
  }

  // Hybrid: top 2 are close (tied or within 1)
  if (secondMax > 0 && max - secondMax <= 1) {
    const pair = [first, second].sort().join("+");
    return hybridByPair[pair] || answerToPersonality[first];
  }

  // Core type: clear winner
  return answerToPersonality[first];
}

export function personalityScore(
  answers: Record<string, string>
): PersonalityScoreResult | null {
  const counts = countAnswers(answers);

  // No answers given
  if (Object.values(counts).every(c => c === 0)) {
    return null;
  }

  const primary = determinePersonality(counts);

  return {
    primary,
    scores: counts as any,
    preferredActivities: personalityPreferredActivities[primary]
  };
}

export const personalityPreferredActivities: Record<PersonalityId, Activity[]> = {
  // Pure relaxation - gets Tagaytay, Mactan, peaceful beaches
  relaxed_escapist: ["relax", "swim", "food_trip", "explore"],

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
