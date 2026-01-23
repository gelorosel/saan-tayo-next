import { z } from "zod";

export const questionnaireSchema = z.object({
  island: z.enum(["Luzon", "Visayas", "Mindanao", "surprise"]),
  activity: z.enum(["swim", "hike", "relax", "explore", "surf"]),
  season: z.enum(["cool_dry", "hot_dry", "wet", "typhoon", "surprise"]),
});
