import { Destination } from "@/src/types/destination";

/**
 * Opens a Google search for the destination in a new tab
 * @param destination - The destination to search for
 */
export function openGoogleSearch(destination: Destination): void {
    const searchQuery = encodeURIComponent(toQueryName(destination));
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
}

export function toQueryName(destination: Destination): string {
    const name = destination.name
    const region = destination.location?.region
    const includeRegion = region && region.toLowerCase() !== name.toLowerCase()
        && !name.toLowerCase().includes(region.toLowerCase());

    return destination.overrideGoogleSearchName || includeRegion ? `${name} ${region}` : name;
}
