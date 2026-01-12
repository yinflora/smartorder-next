import { NextRequest, NextResponse } from 'next/server';
import { parseMenuFromImage } from '@/services';

// POST /api/ai/parse-menu - Parse menu image using Gemini AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.base64Data) {
      return NextResponse.json({ error: 'base64Data is required' }, { status: 400 });
    }

    const result = await parseMenuFromImage(
      body.base64Data,
      body.mimeType || 'image/jpeg',
      body.shopName || ''
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error parsing menu:', error);
    return NextResponse.json({ error: 'Failed to parse menu image' }, { status: 500 });
  }
}
