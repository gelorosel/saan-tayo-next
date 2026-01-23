import { Destination } from "@/src/types/destination";
import { Preference } from "@/src/types/preference";

type Scored = Destination & { score: number; reasons: string[] };

export function scoreDestinations(
  pref: Preference,
  dests: Destination[]
): Scored[] {
  const scoredDestinations = dests
    .filter((d) => pref.island == "surprise" || d.island === pref.island)
    .filter((d) => pref.environment == "surprise" || d.environments?.includes(pref.environment))
    .filter((d) => pref.activity == "surprise" || d.activities.includes(pref.activity))
    // .map((d) => {
    //   return { ...d, score: 100, reasons: [] };
    // })
    .map((d) => {
      let score = 0;
      const reasons: string[] = [d.island, "Fits your main activity"];

      if (pref.season == "surprise" || d.bestSeasons.includes(pref.season)) {
        score += 2; reasons.push("Good for your travel season");
      } else {
        score += 1;
      }
      if (d.budget === pref.budget) {
        score += 1; reasons.push("Matches your budget");
      }
      if (d.goodForGroups?.includes(pref.group)) {
        score += 1; reasons.push("Good for your travel group");
      }
      if (d.environments.includes("reef") && pref.activity === "dive") {
        score += 5; reasons.push("Perfect reef diving destination");
      }

      return { ...d, score, reasons };
    })
    // .filter((d) => d.score > 300)
    .sort((a, b) => b.score - a.score);

  return scoredDestinations
}
