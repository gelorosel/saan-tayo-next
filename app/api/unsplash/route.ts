import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache to reduce API calls
const unsplashCache = new Map<string, any>();

function getCacheKey(query: string, perPage: number): string {
  return `${query}|${perPage}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const perPage = parseInt(searchParams.get('per_page') || '1', 10);

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: 'Unsplash API key not configured' },
      { status: 500 }
    );
  }

  // Check cache first
  const cacheKey = getCacheKey(query, perPage);
  const cached = unsplashCache.get(cacheKey);
  if (cached) {
    console.log(`[Unsplash Cache HIT] ${cacheKey}`);
    return NextResponse.json(cached);
  }

  console.log(`[Unsplash Cache MISS] ${cacheKey} - Making API call...`);

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${Math.min(perPage, 10)}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // If per_page > 1, return all results, otherwise return single image
      let result;
      if (perPage > 1) {
        result = {
          results: data.results.map((image: any) => {
            const baseUrl = image.urls?.regular || image.urls?.full || image.urls?.raw;
            const urlWithParams = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}w=800&auto=format`;
            return {
              id: image.id,
              url: urlWithParams,
              alt: image.alt_description || query,
              photographerName: image.user?.name || 'Unknown',
              photographerUsername: image.user?.username || 'unknown',
              photographerUrl: image.user?.links?.html || `https://unsplash.com/@${image.user?.username || 'unknown'}`,
              downloadLocation: image.links?.download_location,
            };
          }),
        };
      } else {
        const image = data.results[0];
        const baseUrl = image.urls?.regular || image.urls?.full || image.urls?.raw;
        const urlWithParams = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}w=800&auto=format`;
        result = {
          id: image.id,
          url: urlWithParams,
          alt: image.alt_description || query,
          photographerName: image.user?.name || 'Unknown',
          photographerUsername: image.user?.username || 'unknown',
          photographerUrl: image.user?.links?.html || `https://unsplash.com/@${image.user?.username || 'unknown'}`,
          downloadLocation: image.links?.download_location,
        };
      }
      
      // Store in cache
      unsplashCache.set(cacheKey, result);
      console.log(`[Unsplash Cached] ${cacheKey} - Cache size: ${unsplashCache.size}`);
      
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'No images found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
