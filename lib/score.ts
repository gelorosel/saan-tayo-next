import { Destination } from "@/src/types/destination";
import { Activity, Preference } from "@/src/types/preference";
import { prettyEnvironment, seasonLabels } from "./environment";
import { capitalize } from "./utils";

type Scored = Destination & { score: number; reasons: string[] };

const NON_NEGOTIABLE_ACTIVITIES: Activity[] = ["relax", "surf", "dive", "swim", "trek", "camp", "waterfalls", "history", "museums"];

const matchesIsland = (d: Destination, island?: Preference["island"]) =>
  !island || d.island === island;
const matchesEnvironment = (d: Destination, env?: Preference["environment"]) =>
  !env || env === "any" || d.environments?.includes(env);

const matchesNonNegotiableActivity = (
  d: Destination,
  activities?: Activity[]
): boolean => {
  // If user selected exactly 1 activity and it's non-negotiable,
  // the destination MUST have that activity
  if (activities?.length === 1) {
    const [singleActivity] = activities;
    if (NON_NEGOTIABLE_ACTIVITIES.includes(singleActivity)) {
      return d.activities.includes(singleActivity);
    }
  }
  // Otherwise, don't filter based on this rule
  return true;
};

function scoreActivities(dest: Destination, activities: Activity[]) {
  let score = 0;
  const reasons: string[] = [];

  const [primary, ...others] = activities;

  if (primary && dest.activities.includes(primary)) {
    score += 5;
    reasons.push("Fits your main activity");
  }

  const otherMatches = others.filter(act => dest.activities.includes(act)).length;
  if (otherMatches > 0) {
    score += otherMatches * 2;
    reasons.push(otherMatches === 1
      ? "Includes another activity you picked"
      : `Includes ${otherMatches} more activities you picked`
    );
  }

  return { score, reasons };
}

function scorePersonality(
  dest: Destination,
  personalityActivities: Set<Activity>,
  applyFilter: boolean
) {
  const matched = dest.activities.filter(a => personalityActivities.has(a)).length;

  if (applyFilter && matched > 0) {
    return { score: matched * 2, reason: "Matches your travel personality" };
  }

  if (!applyFilter && personalityActivities.size > 0 && matched === 0) {
    return { score: 0, reason: "Something new for you" };
  }

  return { score: 0, reason: null };
}

function scoreDestination(
  dest: Destination,
  pref: Preference,
  personalityActivities: Set<Activity>,
  applyPersonalityFilter: boolean
): Scored {
  let score = 0;
  const reasons: string[] = [];

  // Add contextual reasons
  if (pref.environment && pref.environment !== "any") {
    reasons.push(`You wanted ${prettyEnvironment(pref.environment)}.`);
  }
  if (pref.season) {
    reasons.push(`Your timing fits the ${seasonLabels[pref.season] ?? "right season"}.`);
  }
  if (pref.island) {
    reasons.push(`It keeps you in ${capitalize(pref.island)}.`);
  }

  // Score user-selected activities
  if (pref.activity?.length) {
    const activityScore = scoreActivities(dest, pref.activity);
    score += activityScore.score;
    reasons.push(...activityScore.reasons);
  }

  // Score personality match
  const personalityScore = scorePersonality(dest, personalityActivities, applyPersonalityFilter);
  score += personalityScore.score;
  if (personalityScore.reason) reasons.push(personalityScore.reason);

  // Score season match
  const seasonMatch = !pref.season || pref.season === "any" || dest.bestSeasons.includes(pref.season);
  score += seasonMatch ? 2 : 1;
  if (seasonMatch) reasons.push("Good for your travel season");

  // Bonus for reef diving
  if (dest.environments.includes("reef") && pref.activity?.includes("dive")) {
    score += 5;
    reasons.push("Perfect reef diving destination");
  }

  return { ...dest, score, reasons };
}

export function scoreDestinations(
  pref: Preference,
  dests: Destination[],
  personalityPreferredActivities: Activity[] = [],
  applyPersonalityFilter: boolean = true
): Scored[] {
  const personalitySet = new Set(personalityPreferredActivities);

  return dests
    .filter(d =>
      matchesIsland(d, pref.island) &&
      matchesEnvironment(d, pref.environment) &&
      matchesNonNegotiableActivity(d, pref.activity)
    )
    .sort(() => Math.random() - 0.5)
    .map(d => scoreDestination(d, pref, personalitySet, applyPersonalityFilter))
    .sort((a, b) => b.score - a.score);
}
