import { analyseWithGemini } from '@/lib/gemini';

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn().mockImplementation(() => ({
  generateContent: mockGenerateContent,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
  HarmBlockThreshold: {
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
}));

describe('analyseWithGemini', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test_dummy_key_12345';
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  const validResponsePayload = JSON.stringify({
    intent: 'Find passport guidance',
    summary: 'The user needs help finding a lost passport.',
    category: 'documents',
    urgency: 'high',
    extracted_information: {
      intent: 'Find passport',
      entities: ['passport'],
      dates: ['tomorrow'],
      locations: ['airport'],
      constraints: ['urgent'],
      missingInformation: [],
    },
    verified_information: [
      {
        item: 'Embassy issues emergency travel documents',
        source: 'Official policy',
        isVerified: true,
        verificationNote: 'Confirmed',
      },
    ],
    uncertain_information: ['Exact flight time'],
    assumptions: ['User is a citizen'],
    recommended_action: 'Contact embassy immediately',
    steps: [
      {
        step: 1,
        title: 'Call the embassy',
        description: 'Call the emergency consular services line.',
        isUrgent: true,
      },
    ],
    warnings: ['Do not miss your flight'],
    resources: [
      {
        title: 'Emergency Consular Assistance',
        description: 'Official helpline',
        url: 'https://travel.state.gov',
        type: 'official',
      },
    ],
    confidence: 'high',
    confidence_explanation: 'Standard emergency procedure',
  });

  test('successfully returns structured response on first model attempt', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => validResponsePayload,
      },
    });

    const result = await analyseWithGemini({
      text: 'I lost my passport and have a flight tomorrow.',
      category: 'documents',
    });

    expect(result.intent).toBe('Find passport guidance');
    expect(result.category).toBe('documents');
    expect(result.urgency).toBe('high');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].title).toBe('Call the embassy');
  });

  test('falls back to next model when encountering 429 quota exhaustion', async () => {
    // First model fails with 429 Quota exceeded
    mockGenerateContent.mockRejectedValueOnce(
      new Error('429 Too Many Requests: Quota exceeded for metric generate_content_free_tier_requests')
    );
    // Second model succeeds
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => validResponsePayload,
      },
    });

    const result = await analyseWithGemini({
      text: 'I lost my passport.',
      category: 'documents',
    });

    expect(mockGetGenerativeModel).toHaveBeenCalledTimes(2);
    expect(result.intent).toBe('Find passport guidance');
  });

  test('falls back to next model when encountering 404 model not found', async () => {
    mockGenerateContent.mockRejectedValueOnce(
      new Error('404 Not Found: This model is no longer available to new users.')
    );
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => validResponsePayload,
      },
    });

    const result = await analyseWithGemini({
      text: 'I lost my passport.',
      category: 'documents',
    });

    expect(mockGetGenerativeModel).toHaveBeenCalledTimes(2);
    expect(result.summary).toBe('The user needs help finding a lost passport.');
  });

  test('handles markdown code fences around JSON gracefully', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => `\`\`\`json\n${validResponsePayload}\n\`\`\``,
      },
    });

    const result = await analyseWithGemini({
      text: 'I lost my passport.',
      category: 'documents',
    });

    expect(result.intent).toBe('Find passport guidance');
  });

  test('throws error if all supported models fail', async () => {
    mockGenerateContent.mockRejectedValue(
      new Error('404 Not Found: Model not supported')
    );

    await expect(
      analyseWithGemini({
        text: 'Problem statement',
      })
    ).rejects.toThrow('Model not supported');
  });
});
