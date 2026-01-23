import { NextRequest, NextResponse } from 'next/server';
import { geminiShortDescription } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const destination = searchParams.get('destination');
  const activity = searchParams.get('activity');

  if (!destination) {
    return NextResponse.json(
      { error: 'Destination parameter is required' },
      { status: 400 }
    );
  }

  try {
    const description = await geminiShortDescription(destination, activity || 'travel');
    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error fetching Gemini description:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Gemini description' },
      { status: 500 }
    );
  }
}
