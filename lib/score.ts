import { Destination } from "@/src/types/destination";
import { Preference } from "@/src/types/preference";

type Scored = Destination & { score: number; reasons: string[] };

export function scoreDestinations(
  pref: Preference,
  dests: Destination[]
): Scored[] {
  const scoredDestinations = dests
    .filter((d) => !pref.island || d.island === pref.island)
    .filter((d) => !pref.environment || d.environments?.includes(pref.environment))
    .sort(() => Math.random() - 0.5)
    .map((d) => {
      let score = 0;
      const reasons: string[] = [`Found in ${d.island}`];

      if (pref.activity && d.activities.includes(pref.activity)) {
        score += 5; reasons.push("Fits your main activity");
      }
      if (!pref.season || d.bestSeasons.includes(pref.season)) {
        score += 2; reasons.push("Good for your travel season");
      } else {
        score += 1;
      }
      if (d.environments.includes("reef") && pref.activity === "dive") {
        score += 5; reasons.push("Perfect reef diving destination");
      }

      return { ...d, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return scoredDestinations
}
