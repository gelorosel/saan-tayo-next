import type {
    Activity,
    Budget,
    IslandGroup,
    Season,
    TravelGroup,
  } from "./preference";
import { Environment } from "../data/activities";

  
  export type CrowdLevel = "low" | "medium" | "high";
  
  export interface Destination {
    id: string;
    name: string;
  
    /** Basic classification */
    island: IslandGroup;
    environments: Environment[]; // beach | mountains | city
  
    /** What you can do there */
    activities: Activity[];
  
    /** When it’s best to go */
    bestSeasons: Season[];
  
    /** Cost + vibe helpers */
    budget: Budget;
    crowdLevel?: CrowdLevel;
  
    /** Trip suitability */
    goodForGroups?: TravelGroup[];
  
    /** Optional UX fields */
    description?: string;
    highlights?: string[]; // bullet points
    image?: string; // URL or /public path
    location?: {
      lat: number;
      lng: number;
      region?: string; // e.g. "Palawan", "Cebu", "Bohol"
    };
  
    /** Optional logistics helpers (future scoring) */
    nearestAirport?: string;
    tags?: string[]; // free-form escape hatch
  }
  