import { Preference } from "@/src/types/preference";

export function toPreference(answers: Record<string, string>): Preference {
  return {
    island: (answers.island ?? "any") as Preference["island"],
    environment: answers.environment as Preference["environment"],
    activity: answers.activity as Preference["activity"],
    season: (answers.season ?? "any") as Preference["season"],
    budget: answers.budget as Preference["budget"],
    group: answers.group as Preference["group"],
    environmentWasSurprise: answers.__envSurprise === "true",
  };
}
