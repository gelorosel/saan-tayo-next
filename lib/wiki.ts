// wikiDescribe.ts
// Node 18+ (built-in fetch). For Node 16, install node-fetch.

type WikiSearchResult = {
    pages?: Array<{ title: string }>;
};

type WikiSummaryResult = {
    title?: string;
    extract?: string; // plain-text summary
    content_urls?: {
        desktop?: { page?: string };
    };
};

export type WikiDescription = {
    query: string;
    title: string | null;
    description: string | null;
    url: string | null;
};

function clampText(text: string, maxChars = 300): string {
    const t = (text ?? "").trim();
    if (!t) return "";
    if (t.length <= maxChars) return t;
    return t.slice(0, Math.max(0, maxChars - 1)).trimEnd() + "…";
}

/**
 * Send a destination name (e.g., "Mount Apo") and get a short description.
 */
export async function wikiShortDescription(
    destination: string,
    maxChars = 300
): Promise<WikiDescription> {
    const q = destination.trim();
    if (!q) {
        return { query: destination, title: null, description: null, url: null };
    }

    // Important: Wikimedia asks clients to set a descriptive User-Agent/Api-User-Agent. :contentReference[oaicite:1]{index=1}
    const headers = {
        "Api-User-Agent": "destination-bot/1.0 (contact: you@example.com)",
        "User-Agent": "destination-bot/1.0 (contact: you@example.com)",
    };

    // 1) Find best matching title
    const searchUrl = new URL("https://en.wikipedia.org/w/rest.php/v1/search/title");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("limit", "1");

    const searchResp = await fetch(searchUrl, { headers });
    if (!searchResp.ok) {
        throw new Error(`Search failed: ${searchResp.status} ${searchResp.statusText}`);
    }
    const searchJson = (await searchResp.json()) as WikiSearchResult;

    const title = searchJson.pages?.[0]?.title ?? null;
    if (!title) {
        return { query: destination, title: null, description: null, url: null };
    }

    // 2) Fetch summary for the resolved title
    const summaryUrl =
        "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title);

    const sumResp = await fetch(summaryUrl, { headers });
    if (!sumResp.ok) {
        throw new Error(`Summary failed: ${sumResp.status} ${sumResp.statusText}`);
    }
    const sumJson = (await sumResp.json()) as WikiSummaryResult;

    const extract = clampText(sumJson.extract ?? "", maxChars);
    const pageUrl = sumJson.content_urls?.desktop?.page ?? null;

    return {
        query: destination,
        title: sumJson.title ?? title,
        description: extract || null,
        url: pageUrl,
    };
}
