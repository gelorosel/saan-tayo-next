import { NextResponse } from 'next/server';

export async function GET() {
  const prioritizeGemini = process.env.PRIORITIZE_GEMINI_DESCRIPTION === 'true';

  return NextResponse.json({
    prioritizeGemini,
  });
}
