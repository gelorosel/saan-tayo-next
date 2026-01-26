import { Destination } from "@/src/types/destination";
import { Activity, Preference } from "@/src/types/preference";

type Scored = Destination & { score: number; reasons: string[] };

export function scoreDestinations(
  pref: Preference,
  dests: Destination[],
  personalityPreferredActivities: Activity[] = []
): Scored[] {
  const preferredSet = new Set(personalityPreferredActivities);
  const scoredDestinations = dests
    .filter((d) => !pref.island || d.island === pref.island)
    .filter(
      (d) =>
        !pref.environment ||
        pref.environment === "any" ||
        d.environments?.includes(pref.environment)
    )
    .sort(() => Math.random() - 0.5)
    .map((d) => {
      let score = 0;
      const reasons: string[] = [`It keeps you in ${d.island}`];

      if (pref.activity && pref.activity.length > 0) {
        const primaryActivity = pref.activity[0];
        if (primaryActivity && d.activities.includes(primaryActivity)) {
          score += 5;
          reasons.push("Fits your main activity");
        }
      }
      if (preferredSet.size > 0) {
        const matched = d.activities.filter((activity) => preferredSet.has(activity));
        if (matched.length > 0) {
          score += matched.length * 2;
          reasons.push("Matches your travel personality");
        }
      }
      if (!pref.season || pref.season === "any" || d.bestSeasons.includes(pref.season)) {
        score += 2; reasons.push("Good for your travel season");
      } else {
        score += 1;
      }
      if (d.environments.includes("reef") && pref.activity?.includes("dive")) {
        score += 5; reasons.push("Perfect reef diving destination");
      }

      return { ...d, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return scoredDestinations
}
