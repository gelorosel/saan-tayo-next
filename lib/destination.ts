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

    const queryName = includeRegion ? `${name} ${region}` : name;
    return queryName.charAt(0).toUpperCase() + queryName.slice(1);
}

export function getFallbackUnsplashQuery(destination: Destination): string {
    if (
        destination.name.toLowerCase().includes('reef') ||
        destination.environments?.includes('reef')
    ) {
        return "underwater reef fish philippines";
    }
    if (destination.name.toLowerCase().includes('lake')) {
        return "lake philippines";
    }
    if (!destination.environments?.length) {
        return "philippines";
    }

    return `${destination.environments[0]} philippines`;
}
