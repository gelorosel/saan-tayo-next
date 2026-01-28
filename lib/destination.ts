import { Destination } from "@/src/types/destination";


export function toQueryName(destination: Destination): string {
    if (destination.overrideGoogleSearchName) {
        return destination.overrideGoogleSearchName;
    }
    let name = destination.name.toLowerCase()
    // if name contains "mt." remove it
    name = name.replace(/\bmt\.\s*/g, '');

    const region = destination.location?.region
    const includeRegion = region && region.toLowerCase() !== name.toLowerCase()
        && !name.toLowerCase().includes(region.toLowerCase());

    return includeRegion ? `${name} ${region}` : name;
}

export function getFallbackQuery(destination: Destination): string {
    if (destination.name.toLowerCase().includes('reef')) {
        return "reef philippines";
    }
    if (destination.name.toLowerCase().includes('lake')) {
        return "lake philippines";
    }
    if (!destination.environments?.length) {
        return "philippines";
    }
    return destination.island.toLowerCase() === "luzon"
        ? `${destination.environments[0] === "mountains" ? "peak" : destination.environments[0]} philippines` // "mountains luzon" -> "peak philippines"
        : `${destination.environments[0]} ${destination.location?.region || "philippines"}`;
}
