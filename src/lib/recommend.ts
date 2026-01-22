import { destinations } from "../data/destinations";

export function recommendDestinations(answers: any) {
  return destinations
    .map((dest) => {
      let score = 0;

      if (answers.island !== "any" && dest.island === answers.island)
        score += 2;

      if (dest.activities.includes(answers.activity))
        score += 3;

      if (
        answers.season !== "any" &&
        dest.bestSeasons.includes(answers.season)
      )
        score += 2;

      return { ...dest, score };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
}
