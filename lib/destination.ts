import { Destination } from "@/src/types/destination";

/**
 * Opens a Google search for the destination in a new tab
 * @param destination - The destination to search for
 */
export function openGoogleSearch(destination: Destination): void {
    const name = destination.name
    const region = destination.location?.region
    const searchQuery = encodeURIComponent(name === region ? name : `${name} ${region}`);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
}
