import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for image data
const imageCache = new Map<string, { buffer: ArrayBuffer; contentType: string }>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  // Check cache first
  const cached = imageCache.get(imageUrl);
  if (cached) {
    console.log(`[Image Cache HIT] ${imageUrl.substring(0, 50)}...`);
    return new NextResponse(cached.buffer, {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  console.log(`[Image Cache MISS] ${imageUrl.substring(0, 50)}... - Fetching image...`);

  try {
    // Fetch the image from Unsplash
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SaanTayoNext/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Store in cache
    imageCache.set(imageUrl, { buffer: imageBuffer, contentType });
    console.log(`[Image Cached] ${imageUrl.substring(0, 50)}... - Cache size: ${imageCache.size}`);

    // Return the image with proper headers for iOS compatibility
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}
