import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const downloadLocation = searchParams.get('download_location');

  if (!downloadLocation) {
    return NextResponse.json(
      { error: 'download_location parameter is required' },
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
    // Trigger the download by calling Unsplash's download endpoint
    const response = await fetch(`${downloadLocation}&client_id=${accessKey}`, {
      method: 'GET',
    });

    if (!response.ok) {
      // Don't fail if download tracking fails, just log it
      console.warn('Failed to trigger Unsplash download:', response.status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Don't fail if download tracking fails, just log it
    console.warn('Error triggering Unsplash download:', error);
    return NextResponse.json({ success: false });
  }
}
