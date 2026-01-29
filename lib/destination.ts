import { Destination } from "@/src/types/destination";


export function toQueryName(destination: Destination): string {
    if (destination.overrideGoogleSearchName) {
        return destination.overrideGoogleSearchName;
    }
    let name = destination.name.toLowerCase();
    // Replace "mt." with "mount"
    name = name.replace(/\bmt\.\s*/g, 'mount ');

    const region = destination.location?.region
    const includeRegion = region && region.toLowerCase() !== name.toLowerCase()
        && !name.toLowerCase().includes(region.toLowerCase());

    return includeRegion ? `${name} ${region}` : name;
}

export function getFallbackUnsplashQuery(destination: Destination): string {
    if (destination.name.toLowerCase().includes('reef')) {
        return "reef philippines";
    }
    if (destination.name.toLowerCase().includes('lake')) {
        return "lake philippines";
    }
    if (!destination.environments?.length) {
        return "philippines";
    }

    return `${destination.environments[0]} philippines`;
}
