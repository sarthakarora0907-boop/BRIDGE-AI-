// Bridge AI — Unit Tests: Prompt Engineering

import { buildUserPrompt, getFallbackResponse, buildSystemInstruction } from '@/lib/prompt';
import type { BridgeAIInput } from '@/types';

describe('buildSystemInstruction', () => {
  let systemInstruction: string;

  beforeAll(() => {
    systemInstruction = buildSystemInstruction();
  });

  test('returns a non-empty string', () => {
    expect(typeof systemInstruction).toBe('string');
    expect(systemInstruction.length).toBeGreaterThan(0);
  });

  test('contains JSON schema definition', () => {
    expect(systemInstruction).toContain('intent');
    expect(systemInstruction).toContain('confidence');
    expect(systemInstruction).toContain('steps');
  });

  test('contains verification rules', () => {
    expect(systemInstruction.toLowerCase()).toContain('verif');
  });

  test('contains safety rules for medical situations', () => {
    expect(systemInstruction.toLowerCase()).toContain('medical');
  });

  test('contains emergency handling instructions', () => {
    expect(systemInstruction.toLowerCase()).toContain('emergency');
  });

  test('instructs AI not to fabricate data', () => {
    expect(systemInstruction.toLowerCase()).toContain('fabricat');
  });
});

describe('buildUserPrompt', () => {
  test('includes the user text', () => {
    const input: BridgeAIInput = {
      text: 'My electricity bill doubled this month.',
    };
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain(input.text);
  });

  test('includes category when provided', () => {
    const input: BridgeAIInput = {
      text: 'My bill is too high.',
      category: 'finance',
    };
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain('finance');
  });

  test('does not include category note for general category', () => {
    const input: BridgeAIInput = {
      text: 'Help me with this.',
      category: 'general',
    };
    const prompt = buildUserPrompt(input);
    // 'general' category should not add a category annotation
    expect(prompt).not.toContain('USER-SELECTED CATEGORY: general');
  });

  test('mentions image when imageBase64 is provided', () => {
    const input: BridgeAIInput = {
      text: 'What does this say?',
      imageBase64: 'validbase64',
      imageMimeType: 'image/jpeg',
    };
    const prompt = buildUserPrompt(input);
    expect(prompt.toLowerCase()).toContain('image');
  });

  test('does not mention image when no image provided', () => {
    const input: BridgeAIInput = { text: 'Text only question.' };
    const prompt = buildUserPrompt(input);
    expect(prompt).not.toContain('[An image');
  });

  test('trims whitespace from user text', () => {
    const input: BridgeAIInput = { text: '   help me   ' };
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain('help me');
    expect(prompt).not.toContain('   help me   ');
  });
});

describe('getFallbackResponse', () => {
  let fallback: string;
  let parsed: Record<string, unknown>;

  beforeAll(() => {
    fallback = getFallbackResponse();
    parsed = JSON.parse(fallback);
  });

  test('returns valid JSON', () => {
    expect(() => JSON.parse(fallback)).not.toThrow();
  });

  test('contains all required fields', () => {
    const requiredFields = [
      'intent', 'summary', 'category', 'urgency',
      'extracted_information', 'verified_information',
      'uncertain_information', 'assumptions',
      'recommended_action', 'steps', 'warnings',
      'resources', 'confidence', 'confidence_explanation',
    ];

    requiredFields.forEach((field) => {
      expect(parsed).toHaveProperty(field);
    });
  });

  test('confidence is low', () => {
    expect(parsed.confidence).toBe('low');
  });

  test('steps is an array', () => {
    expect(Array.isArray(parsed.steps)).toBe(true);
  });

  test('resources is an array', () => {
    expect(Array.isArray(parsed.resources)).toBe(true);
  });
});
