import { Destination } from "@/src/types/destination";


export function toQueryName(destination: Destination): string {
    if (destination.overrideGoogleSearchName) {
        return destination.overrideGoogleSearchName;
    }
    const name = destination.name
    const region = destination.location?.region
    const includeRegion = region && region.toLowerCase() !== name.toLowerCase()
        && !name.toLowerCase().includes(region.toLowerCase());

    return includeRegion ? `${name} ${region}` : name;
}
