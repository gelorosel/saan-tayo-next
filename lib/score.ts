import { Destination } from "@/src/types/destination";
import { Activity, Preference } from "@/src/types/preference";
import { prettyEnvironment, seasonLabels } from "./environment";
import { capitalize } from "./utils";

type Scored = Destination & { score: number; reasons: string[] };

/**
 * Activities that must be present when user selects only one activity.
 * These are specific enough that we should only show destinations that support them.
 */
const NON_NEGOTIABLE_ACTIVITIES: Activity[] = [
  "relax",
  "surf",
  "dive",
  "swim",
  "trek",
  "camp",
  "waterfalls",
  "history",
  "museums"
];

/** Score values for different matching criteria */
const SCORE_WEIGHTS = {
  PRIMARY_ACTIVITY: 5,
  SECONDARY_ACTIVITY: 2,
  PERSONALITY_MATCH: 2,
  SEASON_MATCH: 4,
  SEASON_MISMATCH: 1,
  REEF_DIVING_BONUS: 5,
} as const;

// ============================================================================
// Filter Functions
// ============================================================================

/**
 * Check if destination matches the selected island preference.
 */
const matchesIsland = (destination: Destination, island?: Preference["island"]): boolean => {
  return !island || destination.island === island;
};

/**
 * Check if destination matches the selected environment preference.
 */
const matchesEnvironment = (destination: Destination, environment?: Preference["environment"]): boolean => {
  return !environment || environment === "any" || destination.environments?.includes(environment);
};

/**
 * Check if destination matches non-negotiable activity requirements.
 * When a user selects exactly one activity that is specific/non-negotiable,
 * we should only show destinations that support it.
 */
const matchesNonNegotiableActivity = (
  destination: Destination,
  activities?: Activity[]
): boolean => {
  if (activities?.length !== 1) {
    return true; // Multiple activities are flexible
  }

  const [singleActivity] = activities;
  const isNonNegotiable = NON_NEGOTIABLE_ACTIVITIES.includes(singleActivity);

  if (isNonNegotiable) {
    return destination.activities.includes(singleActivity);
  }

  return true;
};

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score how well the destination matches the user's selected activities.
 * Primary activity gets more weight than secondary activities.
 */
function scoreActivities(destination: Destination, activities: Activity[]) {
  let score = 0;
  const reasons: string[] = [];

  const [primaryActivity, ...secondaryActivities] = activities;

  // Score primary activity (most important)
  if (primaryActivity && destination.activities.includes(primaryActivity)) {
    score += SCORE_WEIGHTS.PRIMARY_ACTIVITY;
    reasons.push("Fits your main activity");
  }

  // Score secondary activities (nice to have)
  const secondaryMatches = secondaryActivities.filter(activity =>
    destination.activities.includes(activity)
  ).length;

  if (secondaryMatches > 0) {
    score += secondaryMatches * SCORE_WEIGHTS.SECONDARY_ACTIVITY;

    const reasonText = secondaryMatches === 1
      ? "Includes another activity you picked"
      : `Includes ${secondaryMatches} more activities you picked`;
    reasons.push(reasonText);
  }

  return { score, reasons };
}

/**
 * Score how well the destination matches the user's personality type.
 * Can optionally boost destinations that match personality or highlight new experiences.
 */
function scorePersonality(
  destination: Destination,
  personalityActivities: Set<Activity>,
  shouldBoostPersonalityMatches: boolean
) {
  const matchingActivitiesCount = destination.activities.filter(activity =>
    personalityActivities.has(activity)
  ).length;

  // Boost destinations that match personality
  if (shouldBoostPersonalityMatches && matchingActivitiesCount > 0) {
    return {
      score: matchingActivitiesCount * SCORE_WEIGHTS.PERSONALITY_MATCH,
      reason: "Matches your travel personality"
    };
  }

  // Highlight destinations that offer something new
  const hasPersonalityActivities = personalityActivities.size > 0;
  const hasNoMatches = matchingActivitiesCount === 0;

  if (!shouldBoostPersonalityMatches && hasPersonalityActivities && hasNoMatches) {
    return { score: 0, reason: "Something new for you" };
  }

  return { score: 0, reason: null };
}

/**
 * Calculate a comprehensive score for how well a destination matches user preferences.
 * Returns the destination with score and human-readable reasons.
 */
function scoreDestination(
  destination: Destination,
  preferences: Preference,
  personalityActivities: Set<Activity>,
  shouldBoostPersonalityMatches: boolean
): Scored {
  let totalScore = 0;
  const reasons: string[] = [];

  // -------------------------------------------------------------------------
  // Add contextual reasons for base filters
  // -------------------------------------------------------------------------

  if (preferences.environment && preferences.environment !== "any") {
    reasons.push(`You wanted ${prettyEnvironment(preferences.environment)}.`);
  }

  if (preferences.island) {
    reasons.push(`It keeps you in ${capitalize(preferences.island)}.`);
  }

  // -------------------------------------------------------------------------
  // Score user-selected activities
  // -------------------------------------------------------------------------

  if (preferences.activity?.length) {
    const activityScore = scoreActivities(destination, preferences.activity);
    totalScore += activityScore.score;
    reasons.push(...activityScore.reasons);
  }

  // -------------------------------------------------------------------------
  // Score personality match
  // -------------------------------------------------------------------------

  const personalityScore = scorePersonality(
    destination,
    personalityActivities,
    shouldBoostPersonalityMatches
  );
  totalScore += personalityScore.score;
  if (personalityScore.reason) {
    reasons.push(personalityScore.reason);
  }

  // -------------------------------------------------------------------------
  // Score season/timing match
  // -------------------------------------------------------------------------

  const hasSeasonPreference = preferences.season && preferences.season !== "any";
  const matchesSeason = !preferences.season ||
    preferences.season === "any" ||
    destination.bestSeasons.includes(preferences.season);

  if (matchesSeason) {
    totalScore += SCORE_WEIGHTS.SEASON_MATCH;

    if (hasSeasonPreference) {
      reasons.push(`Your timing fits the ${seasonLabels[preferences.season!]}.`);
    } else {
      reasons.push("Your timing fits the right season.");
    }
  } else {
    totalScore += SCORE_WEIGHTS.SEASON_MISMATCH;
  }

  // -------------------------------------------------------------------------
  // Apply special bonuses
  // -------------------------------------------------------------------------

  // Bonus for reef diving destinations
  const isReefDivingMatch = destination.environments.includes("reef") &&
    preferences.activity?.includes("dive");
  if (isReefDivingMatch) {
    totalScore += SCORE_WEIGHTS.REEF_DIVING_BONUS;
    reasons.push("Perfect reef diving destination");
  }

  return { ...destination, score: totalScore, reasons };
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Score and rank destinations based on user preferences and personality.
 * 
 * @param preferences - User's travel preferences (island, environment, activities, season)
 * @param destinations - List of all available destinations to consider
 * @param personalityPreferredActivities - Activities preferred by user's personality type
 * @param shouldBoostPersonalityMatches - Whether to boost destinations matching personality
 * @returns Filtered, scored, and sorted destinations (highest score first)
 */
export function scoreDestinations(
  preferences: Preference,
  destinations: Destination[],
  personalityPreferredActivities: Activity[] = [],
  shouldBoostPersonalityMatches: boolean = true
): Scored[] {
  const personalityActivitiesSet = new Set(personalityPreferredActivities);

  return destinations
    // Step 1: Apply hard filters (must-have requirements)
    .filter(destination =>
      matchesIsland(destination, preferences.island) &&
      matchesEnvironment(destination, preferences.environment) &&
      matchesNonNegotiableActivity(destination, preferences.activity)
    )
    // Step 2: Randomize to add variety before scoring
    .sort(() => Math.random() - 0.5)
    // Step 3: Calculate scores with reasons
    .map(destination =>
      scoreDestination(
        destination,
        preferences,
        personalityActivitiesSet,
        shouldBoostPersonalityMatches
      )
    )
    // Step 4: Sort by score (highest first)
    .sort((a, b) => b.score - a.score);
}
