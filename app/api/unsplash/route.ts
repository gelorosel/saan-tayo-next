import { NextRequest, NextResponse } from 'next/server';

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
      if (perPage > 1) {
        return NextResponse.json({
          results: data.results.map((image: any) => ({
            id: image.id,
            url: image.urls?.regular || image.urls?.full || image.urls?.raw,
            alt: image.alt_description || query,
            photographerName: image.user?.name || 'Unknown',
            photographerUsername: image.user?.username || 'unknown',
            photographerUrl: image.user?.links?.html || `https://unsplash.com/@${image.user?.username || 'unknown'}`,
            downloadLocation: image.links?.download_location,
          })),
        });
      } else {
        const image = data.results[0];
        return NextResponse.json({
          id: image.id,
          url: image.urls?.regular || image.urls?.full || image.urls?.raw,
          alt: image.alt_description || query,
          photographerName: image.user?.name || 'Unknown',
          photographerUsername: image.user?.username || 'unknown',
          photographerUrl: image.user?.links?.html || `https://unsplash.com/@${image.user?.username || 'unknown'}`,
          downloadLocation: image.links?.download_location,
        });
      }
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
