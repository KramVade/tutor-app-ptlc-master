import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side API route for message moderation
 * This keeps the OpenAI API key secure on the server
 */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ OPENAI_API_KEY not set, skipping AI moderation');
      // Return a valid response that indicates no AI moderation
      return NextResponse.json({
        flagged: false,
        categories: {},
        category_scores: {}
      });
    }

    console.log('🔍 Calling OpenAI Moderation API...');

    // Call OpenAI Moderation API
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error: ${response.status}`, errorText);
      
      // Return a valid response instead of throwing
      // This allows the system to fall back to custom rules
      return NextResponse.json({
        flagged: false,
        categories: {},
        category_scores: {},
        error: `OpenAI API error: ${response.status}`
      });
    }

    const data = await response.json();
    console.log('✅ OpenAI moderation complete');
    return NextResponse.json(data.results[0]);
  } catch (error: any) {
    console.error('❌ Error in moderation API:', error.message);
    
    // Return a valid response instead of 500 error
    // This allows the system to continue with custom rules
    return NextResponse.json({
      flagged: false,
      categories: {},
      category_scores: {},
      error: error.message
    });
  }
}
