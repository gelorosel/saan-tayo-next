import { NextRequest, NextResponse } from 'next/server';
import { wikiShortDescription } from '@/lib/wiki';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get('destination');

  if (!destination) {
    return NextResponse.json(
      { error: 'Destination parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result = await wikiShortDescription(destination, 300);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching wiki description:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wiki description' },
      { status: 500 }
    );
  }
}
