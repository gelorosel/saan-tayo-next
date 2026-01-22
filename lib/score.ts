import { Destination } from "@/src/types/destination";
import { Preference } from "@/src/types/preference";

type Scored = Destination & { score: number; reasons: string[] };

export function scoreDestinations(
  pref: Preference,
  dests: Destination[]
): Scored[] {
  return dests
    .map((d) => {
      let score = 0;
      const reasons: string[] = [];

      if (pref.island !== "any" && d.island === pref.island) {
        score += 2; reasons.push("Matches island group");
      }
      if (pref.environment && d.environments?.includes(pref.environment)) {
        score += 3; reasons.push("Matches environment");
      }
      if (d.activities.includes(pref.activity)) {
        score += 4; reasons.push("Fits your main activity");
      }
      if (pref.season !== "any" && d.bestSeasons.includes(pref.season)) {
        score += 2; reasons.push("Good for your travel season");
      }
      if (d.budget === pref.budget) {
        score += 1; reasons.push("Matches your budget");
      }
      if (d.goodForGroups?.includes(pref.group)) {
        score += 1; reasons.push("Good for your travel group");
      }

      return { ...d, score, reasons };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
}
