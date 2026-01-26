
/**
 * Opens a Google search for the query in a new tab
 * @param query - The query to search for
 */
export function openGoogleSearch(query: string): void {
    const searchQuery = encodeURIComponent(`${query} -ai`); // -ai to exclude AI overview
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
}