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

const answerKeys: AnswerKey[] = ["a", "b", "c", "d"];

const allPersonalityIds: PersonalityId[] = [
  "relaxed_escapist",
  "adventurer",
  "curious_wanderer",
  "master_planner",
  "chill_explorer",
  "purposeful_adventurer",
  "free_spirited_nomad",
  "soft_life_traveler",
  "cultural_strategist",
  "chaos_romantic",
  "mood_based_traveler",
];

const hybridByPair: Record<string, PersonalityId> = {
  "a+c": "chill_explorer",
  "b+d": "purposeful_adventurer",
  "b+c": "free_spirited_nomad",
  "a+d": "soft_life_traveler",
  "c+d": "cultural_strategist",
};

const tieBreakOrder: AnswerKey[] = ["a", "b", "c", "d"];

export type PersonalityScoreResult = {
  primary: PersonalityId;
  scores: Record<PersonalityId, number>;
  preferredActivities: Activity[];
};

export function personalityScore(
  answers: Record<string, string>
): PersonalityScoreResult | null {
  const scores = allPersonalityIds.reduce<Record<PersonalityId, number>>((acc, id) => {
    acc[id] = 0;
    return acc;
  }, {} as Record<PersonalityId, number>);

  let total = 0;
  const answerCounts = answerKeys.reduce<Record<AnswerKey, number>>((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<AnswerKey, number>);

  for (const id of QUESTION_IDS) {
    const answer = answers[id] as AnswerKey | undefined;
    if (!answer || !(answer in answerToPersonality)) continue;
    const personality = answerToPersonality[answer];
    scores[personality] += 1;
    answerCounts[answer] += 1;
    total += 1;
  }

  if (total === 0) return null;

  const sortedKeys = [...answerKeys].sort((a, b) => {
    const diff = answerCounts[b] - answerCounts[a];
    if (diff !== 0) return diff;
    return tieBreakOrder.indexOf(a) - tieBreakOrder.indexOf(b);
  });

  const distinctAnswers = answerKeys.filter((key) => answerCounts[key] > 0).length;
  const maxCount = answerCounts[sortedKeys[0]];
  const minCount = answerCounts[sortedKeys[sortedKeys.length - 1]];

  if (distinctAnswers === 4 && maxCount - minCount <= 1) {
    const primary = "chaos_romantic";
    return { primary, scores, preferredActivities: personalityPreferredActivities[primary] };
  }

  if (distinctAnswers >= 3 && maxCount <= 2) {
    const primary = "mood_based_traveler";
    return { primary, scores, preferredActivities: personalityPreferredActivities[primary] };
  }

  const topPair = [sortedKeys[0], sortedKeys[1]].sort().join("+");
  const hybrid = hybridByPair[topPair];
  if (hybrid) {
    return { primary: hybrid, scores, preferredActivities: personalityPreferredActivities[hybrid] };
  }

  const base = answerToPersonality[sortedKeys[0]];
  return { primary: base, scores, preferredActivities: personalityPreferredActivities[base] };
}

const personalityPreferredActivities: Record<PersonalityId, Activity[]> = {
  relaxed_escapist: ["relax", "swim", "food_trip"],
  adventurer: ["hike", "trek", "dive"],
  curious_wanderer: ["explore", "food_trip", "museums"],
  master_planner: ["museums", "history", "food_trip"],
  chill_explorer: ["relax", "explore", "food_trip"],
  purposeful_adventurer: ["hike", "trek", "waterfalls"],
  free_spirited_nomad: ["explore", "nightlife", "surf"],
  soft_life_traveler: ["relax", "swim", "food_trip"],
  cultural_strategist: ["museums", "history", "food_trip"],
  chaos_romantic: ["explore", "nightlife", "island_hop"],
  mood_based_traveler: ["relax", "explore", "food_trip"],
};
