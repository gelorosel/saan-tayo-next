import { NextResponse } from 'next/server';

export async function GET() {
  const prioritizeGemini = process.env.PRIORITIZE_GEMINI_DESCRIPTION === 'true';
  const fastMode = process.env.FAST_MODE === 'true';

  return NextResponse.json({
    prioritizeGemini,
    fastMode,
  });
}
