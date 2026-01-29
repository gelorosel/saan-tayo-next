import { Destination } from "@/src/types/destination";
import { Activity, Preference } from "@/src/types/preference";
import { prettyEnvironment, seasonLabels } from "./environment";
import { capitalize } from "./utils";
import { pretty } from "@/src/data/activities";

type Scored = Destination & { score: number; reasons: string[] };

/**
 * Activities that must be present when user selects only one activity.
 * These are specific enough that we should only show destinations that support them.
 */
const NON_NEGOTIABLE_ACTIVITIES: Activity[] = [
  "relax",
  "surf",
  "dive",
  "trek",
  "camp",
  "waterfalls",
  "history",
  "museums"
];

/** Score values for different matching criteria */
const SCORE_WEIGHTS = {
  PRIMARY_ACTIVITY: 5,
  SECONDARY_ACTIVITY: 3,
  PERSONALITY_MATCH_BOOST: 4,      // When sticking to travel style
  PERSONALITY_MATCH_NORMAL: 2,     // Normal personality influence
  PERSONALITY_NEW_EXPERIENCE: 3,   // When trying something new
  PERFECT_FIT_BONUS: 5,            // Minimal destinations with perfect personality match
  SEASON_MATCH: 3,
  SEASON_MISMATCH: 1,
  WET_SEASON_BONUS: 6,             // Double bonus for rare wet season matches
  REEF_DIVING_BONUS: 5,
  CITY_NATURE_BONUS: 3,
  BEACH_MOUNTAINS_BONUS: 2,
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
    reasons.push(`Fits your main activity: ${pretty(primaryActivity)}`);
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
  preferences: Preference,
  personalityActivities: Set<Activity>,
  shouldBoostPersonalityMatches: boolean
) {
  const matchingActivitiesCount = destination.activities.filter(activity =>
    personalityActivities.has(activity)
  ).length;

  const totalPersonalityActivities = personalityActivities.size;
  const hasPersonalityActivities = totalPersonalityActivities > 0;

  // Check if this is a minimal destination with perfect personality match
  const allActivitiesMatchPersonality = destination.activities.every(activity =>
    personalityActivities.has(activity)
  );

  // Perfect fit bonus: minimal destinations (≤4 activities) that perfectly match personality
  if (allActivitiesMatchPersonality && destination.activities.length <= 4 && destination.activities.length > 0) {
    return {
      score: matchingActivitiesCount * SCORE_WEIGHTS.PERSONALITY_MATCH_BOOST + SCORE_WEIGHTS.PERFECT_FIT_BONUS,
      reason: "Matches your travel style"
    };
  }

  // User wants to stick to their travel style - boost personality matches strongly
  if (shouldBoostPersonalityMatches && matchingActivitiesCount > 0) {
    return {
      score: matchingActivitiesCount * SCORE_WEIGHTS.PERSONALITY_MATCH_BOOST,
      reason: "Matches your travel personality"
    };
  }

  // User wants to try something new - reward destinations that diverge from personality
  if (!shouldBoostPersonalityMatches && hasPersonalityActivities) {
    const nonMatchingActivities = destination.activities.filter(activity =>
      activity !== "relax" && activity !== "natural_wonders" && !personalityActivities.has(activity) && !preferences.activity?.includes(activity)
    );
    const nonMatchingCount = nonMatchingActivities.length;

    // Destinations with activities outside their comfort zone
    if (nonMatchingCount > 0) {
      const score = Math.min(nonMatchingCount, 3) * SCORE_WEIGHTS.PERSONALITY_NEW_EXPERIENCE;
      return { score, reason: `Other activities for you: ${nonMatchingActivities.slice(0, 3).map(pretty).join(", ")}` };
    }
  }

  // Baseline personality influence when neither boosting nor penalizing
  if (matchingActivitiesCount > 0) {
    return {
      score: matchingActivitiesCount * SCORE_WEIGHTS.PERSONALITY_MATCH_NORMAL,
      reason: null
    };
  }

  return { score: 0, reason: null };
}

/**
 * Score destinations that offer multiple environments (versatility bonus).
 */
function scoreVersatility(destination: Destination, preferences: Preference) {
  let score = 0;
  const reasons: string[] = [];

  const environmentCount = destination.environments.length;

  // Multi-environment destinations are more versatile
  if (environmentCount >= 2) {
    score += 2; // Base versatility bonus

    // Check if user's preferred environment is included
    if (preferences.environment &&
      destination.environments.includes(preferences.environment)) {
      score += 1; // Matches preference + offers variety

      // List the bonus environments
      const otherEnvironments = destination.environments
        .filter(e => e !== preferences.environment)
        .join(", ");
    }
  }

  // Special case: beach + mountains (ultimate versatility)
  if (destination.environments.includes("beach") &&
    destination.environments.includes("mountains")) {
    score += SCORE_WEIGHTS.BEACH_MOUNTAINS_BONUS; // Extra bonus for best combo
    reasons.push("Best of both worlds: beach and mountains");
  }

  // City + anything (good for diverse groups)
  if (destination.environments.includes("city") && environmentCount >= 2) {
    score += SCORE_WEIGHTS.CITY_NATURE_BONUS; // Extra bonus for best combo
    reasons.push("Established infrastructure alongside nature");
  }

  return { score, reasons };
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
    preferences,
    personalityActivities,
    shouldBoostPersonalityMatches
  );
  totalScore += personalityScore.score;
  if (personalityScore.reason) {
    reasons.push(personalityScore.reason);
  }

  // -------------------------------------------------------------------------
  // Score environment versatility
  // -------------------------------------------------------------------------

  const versatilityScore = scoreVersatility(destination, preferences);
  totalScore += versatilityScore.score;
  reasons.push(...versatilityScore.reasons);

  // -------------------------------------------------------------------------
  // Score season/timing match
  // -------------------------------------------------------------------------

  // Treat all 3 seasons selected as no preference
  const allSeasonsSelected = preferences.season?.length === 3;
  const hasSeasonPreference = preferences.season && preferences.season.length > 0 && !allSeasonsSelected;

  // Check if wet season only is selected (be more lenient)
  const isWetSeasonOnly = preferences.season?.length === 1 && preferences.season[0] === "wet";

  // Check if destination matches any of the selected seasons
  const matchesSeason = !preferences.season ||
    allSeasonsSelected ||
    preferences.season.some(season => destination.bestSeasons.includes(season));

  if (isWetSeasonOnly) {
    // Wet season leniency: boost matches heavily, but don't penalize mismatches
    if (matchesSeason) {
      totalScore += SCORE_WEIGHTS.WET_SEASON_BONUS;
      reasons.push("Perfect timing for the wet season");
    } else {
      // No penalty for non-wet destinations - they can still be visited
      reasons.push("Can visit year-round");
    }
  } else {
    // Normal season scoring for other cases
    if (matchesSeason) {
      totalScore += SCORE_WEIGHTS.SEASON_MATCH;

      if (hasSeasonPreference) {
        const selectedSeasonLabels = preferences.season!
          .map(s => seasonLabels[s])
          .join(" or ");
        reasons.push(`Your timing fits the ${selectedSeasonLabels}.`);
      }
    } else {
      totalScore += SCORE_WEIGHTS.SEASON_MISMATCH;
    }
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
