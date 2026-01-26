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
  let primary = hybridByPair[topPair] || answerToPersonality[sortedKeys[0]];

  // Final filter: adjust personality based on selected activity
  const selectedActivity = answers.activity as Activity | undefined;
  if (selectedActivity && !personalityPreferredActivities[primary].includes(selectedActivity)) {
    // Find highest-scoring personality that includes this activity
    const match = sortedKeys
      .map(key => answerToPersonality[key])
      .find(id => personalityPreferredActivities[id].includes(selectedActivity));

    if (match) primary = match;
  }

  return { primary, scores: answerCounts as any, preferredActivities: personalityPreferredActivities[primary] };
}

const personalityPreferredActivities: Record<PersonalityId, Activity[]> = {
  relaxed_escapist: ["relax", "swim", "food_trip", "camp", "snorkel"],
  adventurer: ["hike", "trek", "dive", "surf", "waterfalls", "natural_wonders", "camp"],
  curious_wanderer: ["explore", "food_trip", "museums", "history", "nightlife", "island_hop"],
  // this mf wants to do everything
  master_planner: ["museums", "history", "food_trip", "natural_wonders", "island_hop", "explore", "camp", "snorkel", "hike", "trek", "dive", "surf", "waterfalls"],
  chill_explorer: ["relax", "explore", "food_trip", "swim", "camp", "waterfalls", "snorkel"],
  purposeful_adventurer: ["hike", "trek", "waterfalls", "dive", "surf", "natural_wonders", "camp"],
  free_spirited_nomad: ["explore", "nightlife", "surf", "island_hop", "food_trip", "snorkel", "dive"],
  soft_life_traveler: ["relax", "swim", "food_trip", "camp", "snorkel", "nightlife"],
  cultural_strategist: ["museums", "history", "food_trip", "explore", "natural_wonders", "island_hop"],
  chaos_romantic: ["explore", "nightlife", "island_hop", "food_trip", "surf", "dive", "snorkel"],
  mood_based_traveler: ["relax", "explore", "food_trip", "swim", "hike", "nightlife", "camp"],
};
