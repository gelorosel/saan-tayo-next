import { Preference } from "@/src/types/preference";

export function toPreference(answers: Record<string, string>): Preference {
  return {
    island: answers.island as Preference["island"],
    environment: answers.environment as Preference["environment"],
    activity: answers.activity
      ? (answers.activity.split(",") as Preference["activity"])
      : undefined,
    season: answers.season
      ? (answers.season.split(",") as Preference["season"])
      : undefined,
    group: answers.group as Preference["group"],
  };
}
