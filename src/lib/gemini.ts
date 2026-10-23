// Bridge AI - Gemini Service Layer
// Handles all communication with the Gemini API. Never exposed to client.

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import type { BridgeAIInput, BridgeAIResponse } from '@/types';
import { buildSystemInstruction, buildUserPrompt, getFallbackResponse } from './prompt';

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('MISSING_CONFIG: GEMINI_API_KEY environment variable is not set.');
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

/**
 * Safety settings to prevent harmful outputs.
 */
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Parses and validates the Gemini JSON response.
 * Provides safe defaults for every field to prevent UI crashes.
 */
function parseGeminiResponse(rawText: string): BridgeAIResponse {
  let parsed: Record<string, unknown>;

  try {
    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // If JSON parsing fails, use fallback
    parsed = JSON.parse(getFallbackResponse());
  }

  // Safe field extraction with fallbacks
  const response: BridgeAIResponse = {
    intent: safeString(parsed.intent, 'Understanding your request'),
    summary: safeString(parsed.summary, 'Your request has been received.'),
    category: safeCategory(parsed.category),
    urgency: safeUrgency(parsed.urgency),
    extracted_information: {
      intent: safeString((parsed.extracted_information as Record<string, unknown>)?.intent, ''),
      entities: safeStringArray((parsed.extracted_information as Record<string, unknown>)?.entities),
      dates: safeStringArray((parsed.extracted_information as Record<string, unknown>)?.dates),
      locations: safeStringArray((parsed.extracted_information as Record<string, unknown>)?.locations),
      constraints: safeStringArray((parsed.extracted_information as Record<string, unknown>)?.constraints),
      missingInformation: safeStringArray((parsed.extracted_information as Record<string, unknown>)?.missingInformation),
    },
    verified_information: safeVerifiedArray(parsed.verified_information),
    uncertain_information: safeStringArray(parsed.uncertain_information),
    assumptions: safeStringArray(parsed.assumptions),
    recommended_action: safeString(parsed.recommended_action, 'Provide more information for a detailed response.'),
    steps: safeStepsArray(parsed.steps),
    warnings: safeStringArray(parsed.warnings),
    resources: safeResourcesArray(parsed.resources),
    confidence: safeConfidence(parsed.confidence),
    confidence_explanation: safeString(parsed.confidence_explanation, 'Confidence level based on available information.'),
  };

  return response;
}

// --- Safe extraction helpers ---

function safeString(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
}

function safeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function safeCategory(val: unknown): BridgeAIResponse['category'] {
  const valid = ['health', 'travel', 'documents', 'public-services', 'finance', 'weather', 'news', 'legal', 'emergency', 'general'] as const;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (valid.includes(lower as (typeof valid)[number])) return lower as BridgeAIResponse['category'];
    if (lower.includes('health') || lower.includes('medic') || lower.includes('doctor')) return 'health';
    if (lower.includes('travel') || lower.includes('flight') || lower.includes('train')) return 'travel';
    if (lower.includes('doc') || lower.includes('passport') || lower.includes('visa')) return 'documents';
    if (lower.includes('service') || lower.includes('gov') || lower.includes('council')) return 'public-services';
    if (lower.includes('finan') || lower.includes('money') || lower.includes('tax') || lower.includes('bank')) return 'finance';
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('storm')) return 'weather';
    if (lower.includes('news')) return 'news';
    if (lower.includes('legal') || lower.includes('law') || lower.includes('court')) return 'legal';
    if (lower.includes('emerg') || lower.includes('urgent') || lower.includes('911') || lower.includes('999')) return 'emergency';
  }
  return 'general';
}

function safeUrgency(val: unknown): BridgeAIResponse['urgency'] {
  const valid = ['critical', 'high', 'medium', 'low'] as const;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (valid.includes(lower as (typeof valid)[number])) return lower as BridgeAIResponse['urgency'];
    if (lower.includes('crit')) return 'critical';
    if (lower.includes('high')) return 'high';
    if (lower.includes('med') || lower.includes('mod')) return 'medium';
    if (lower.includes('low')) return 'low';
  }
  return 'medium';
}

function safeConfidence(val: unknown): BridgeAIResponse['confidence'] {
  const valid = ['high', 'medium', 'low'] as const;
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (valid.includes(lower as (typeof valid)[number])) return lower as BridgeAIResponse['confidence'];
    if (lower.includes('high')) return 'high';
    if (lower.includes('med') || lower.includes('mod')) return 'medium';
    if (lower.includes('low')) return 'low';
  }
  return 'medium';
}

function safeVerifiedArray(val: unknown): BridgeAIResponse['verified_information'] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      item: safeString(item.item, 'Information item'),
      source: safeString(item.source, 'AI interpretation'),
      isVerified: item.isVerified === true,
      verificationNote: safeString(item.verificationNote, 'AI interpretation — not independently verified.'),
    }));
}

function safeStepsArray(val: unknown): BridgeAIResponse['steps'] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item, idx) => ({
      step: typeof item.step === 'number' ? item.step : idx + 1,
      title: safeString(item.title, `Step ${idx + 1}`),
      description: safeString(item.description, ''),
      isUrgent: item.isUrgent === true,
    }));
}

function safeResourcesArray(val: unknown): BridgeAIResponse['resources'] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      title: safeString(item.title, 'Resource'),
      description: safeString(item.description, ''),
      url: typeof item.url === 'string' && item.url.startsWith('http') ? item.url : undefined,
      type: ['official', 'informational', 'emergency'].includes(item.type as string)
        ? (item.type as BridgeAIResponse['resources'][0]['type'])
        : 'informational',
    }));
}

// Models ordered by priority.
// gemini-3.5-flash-lite and gemini-3.1-flash-lite have active free-tier quota,
// very low latency (~800ms), and excellent JSON structuring adherence.
const SUPPORTED_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

// Maximum retries per model for transient errors (e.g. 503)
const MAX_RETRIES_PER_MODEL = 1;
// Base delay in ms for exponential backoff
const RETRY_BASE_DELAY_MS = 1000;
// Maximum request duration before aborting to try the next model
const REQUEST_TIMEOUT_MS = 25000;

/**
 * Returns true if the error indicates a model-specific issue or quota exhaustion
 * where retrying the exact same model will not help, so we should immediately
 * move on to the next supported model.
 */
function isSkipToNextModelError(message: string): boolean {
  return (
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('no longer available') ||
    message.includes('not supported') ||
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('Quota exceeded') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('rate limit')
  );
}

/**
 * Returns true if the error indicates a temporary server blip (e.g. 503)
 * that is worth retrying once on the same model.
 */
function isTransientRetryableError(message: string): boolean {
  return (
    message.includes('503') ||
    message.includes('UNAVAILABLE') ||
    message.includes('high demand') ||
    message.includes('try again later') ||
    message.includes('overloaded') ||
    message.includes('temporarily')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function: calls Gemini with the user's input and returns structured data.
 * Tries supported models in order with robust error handling and fallback.
 */
export async function analyseWithGemini(input: BridgeAIInput): Promise<BridgeAIResponse> {
  const genAI = getGenAI();
  const systemInstruction = buildSystemInstruction();
  const userPrompt = buildUserPrompt(input);

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: userPrompt },
  ];

  if (input.imageBase64 && input.imageMimeType) {
    const cleanBase64 = input.imageBase64.replace(/^data:[^;]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: input.imageMimeType,
        data: cleanBase64,
      },
    });
  }

  let lastError: Error | null = null;

  for (const modelName of SUPPORTED_MODELS) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Gemini SDK] Trying model: ${modelName}`);
    }

    const model = genAI.getGenerativeModel(
      {
        model: modelName,
        systemInstruction,
        safetySettings: SAFETY_SETTINGS,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );

    let attempt = 0;
    while (attempt <= MAX_RETRIES_PER_MODEL) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts }],
        });

        const responseText = result.response.text();

        if (!responseText) {
          throw new Error(`Empty response from Gemini model ${modelName}.`);
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Gemini SDK] Success from ${modelName} on attempt ${attempt + 1}`);
        }

        return parseGeminiResponse(responseText);
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        const safeMessage = errMessage.replace(/key=[^\&\s]+/gi, 'key=[REDACTED]');

        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Gemini SDK] Model ${modelName} attempt ${attempt + 1} failed: ${safeMessage}`);
        }

        lastError = new Error(safeMessage);

        // Quota / availability error -> immediately try next model
        if (isSkipToNextModelError(safeMessage)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[Gemini SDK] Model ${modelName} hit quota/availability limit. Switching to next model.`);
          }
          break;
        }

        // Transient 503 error -> retry once with backoff
        if (isTransientRetryableError(safeMessage) && attempt < MAX_RETRIES_PER_MODEL) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Gemini SDK] Transient error on ${modelName}. Retrying in ${delay}ms...`);
          }
          await sleep(delay);
          attempt++;
          continue;
        }

        // Other errors -> move to next model
        break;
      }
    }
  }

  throw lastError ?? new Error('AI_ERROR: Failed to obtain response from any supported Gemini model.');
}
