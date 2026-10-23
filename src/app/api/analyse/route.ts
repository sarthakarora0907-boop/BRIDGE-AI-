// Bridge AI - API Route
// Server-side only. Handles all Gemini communication securely.
// The GEMINI_API_KEY never leaves the server.

import { NextRequest, NextResponse } from 'next/server';
import { analyseWithGemini } from '@/lib/gemini';
import { generateDemoAnalysis } from '@/lib/demo-analyzer';
import { validateBridgeInput } from '@/lib/validation';
import type { APIResult } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Rate limiting: simple in-memory store (for production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse<APIResult>> {
  // Rate limiting
  const rateLimitKey = getRateLimitKey(request);
  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json<APIResult>(
      { success: false, error: 'Too many requests. Please wait a moment before trying again.', code: 'RATE_LIMIT' },
      { status: 429 }
    );
  }

  // Parse request body
  let body: Record<string, unknown> | null = null;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json<APIResult>(
      { success: false, error: 'Invalid request format.', code: 'INVALID_INPUT' },
      { status: 400 }
    );
  }

  // Extract and validate input
  const inputData = body?.input;
  const validation = validateBridgeInput(inputData);

  if (!validation.valid) {
    const errorMessage = validation.errors.map((e) => e.message).join(' ');
    return NextResponse.json<APIResult>(
      { success: false, error: errorMessage, code: 'INVALID_INPUT' },
      { status: 400 }
    );
  }

  const input = inputData as Parameters<typeof analyseWithGemini>[0];
  const isDemoRequested = body?.demo === true || request.nextUrl.searchParams.get('demo') === 'true';

  // Check API configuration
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(
    apiKey &&
    apiKey.trim().length > 0 &&
    apiKey !== 'your_gemini_api_key_here' &&
    !apiKey.startsWith('your_')
  );

  // If client requested demo mode, immediately serve demo simulation
  if (isDemoRequested) {
    const demoResult = generateDemoAnalysis(input);
    return NextResponse.json<APIResult>(
      { success: true, data: demoResult },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-BridgeAI-Mode': 'simulation',
        },
      }
    );
  }

  // If not configured, report MISSING_CONFIG
  if (!isConfigured) {
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json<APIResult>(
      {
        success: false,
        error: isDev
          ? 'Development notice: GEMINI_API_KEY is not configured in .env.local. You can add your API key or click "Try with Demo Simulation" to test the app.'
          : 'Service temporarily unavailable. Please try again later.',
        code: 'MISSING_CONFIG',
      },
      { status: 503 }
    );
  }

  // Call Gemini
  try {
    const result = await analyseWithGemini(input);

    return NextResponse.json<APIResult>(
      { success: true, data: result },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store', // AI responses must not be cached
          'X-BridgeAI-Mode': 'gemini-live',
        },
      }
    );
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : 'Unknown error';
    const safeMessage = rawMessage.replace(/key=[^&\s]+/gi, 'key=[REDACTED]');

    if (process.env.NODE_ENV === 'development') {
      console.error('[API Route - Gemini Error in Development]:', safeMessage);
    }

    if (rawMessage.startsWith('MISSING_CONFIG:')) {
      return NextResponse.json<APIResult>(
        { success: false, error: 'Service configuration error. Please contact support.', code: 'MISSING_CONFIG' },
        { status: 503 }
      );
    }

    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json<APIResult>(
      {
        success: false,
        error: isDev
          ? `Gemini API error: ${safeMessage}`
          : 'Something went wrong while processing your request with Gemini. Please try again.',
        code: 'AI_ERROR',
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
