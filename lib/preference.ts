import { Preference } from "@/src/types/preference";

export function toPreference(answers: Record<string, string>): Preference {
  return {
    island: answers.island as Preference["island"],
    environment: answers.environment as Preference["environment"],
    activity: answers.activity
      ? ([answers.activity] as Preference["activity"])
      : undefined,
    season: answers.season as Preference["season"],
    group: answers.group as Preference["group"],
  };
}
