import { Destination } from "../types/destination";

export const destinations: Destination[] = [
  {
    id: "siquijor",
    name: "Siquijor",
    island: "Visayas",
    activities: ["swim", "relax", "explore"],
    bestSeasons: ["cool_dry", "hot_dry"],
    budget: "low",
    crowdLevel: "low",
  },
  {
    id: "siargao",
    name: "Siargao",
    island: "Mindanao",
    activities: ["surf", "swim", "explore"],
    bestSeasons: ["cool_dry"],
    budget: "mid",
    crowdLevel: "high",
  },
];
