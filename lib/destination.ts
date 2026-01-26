import { Destination } from "@/src/types/destination";


export function toQueryName(destination: Destination): string {
    const name = destination.name
    const region = destination.location?.region
    const includeRegion = region && region.toLowerCase() !== name.toLowerCase()
        && !name.toLowerCase().includes(region.toLowerCase());

    return destination.overrideGoogleSearchName || includeRegion ? `${name} ${region}` : name;
}
