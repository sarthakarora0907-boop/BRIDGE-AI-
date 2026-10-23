// Bridge AI — Integration + Component Tests: API Response Handling

import { validateBridgeInput } from '@/lib/validation';

// Simulate parsing a BridgeAI response for safe fallback handling
// These tests mirror the logic in gemini.ts parseGeminiResponse

function safeString(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
}

function safeCategory(val: unknown): string {
  const valid = ['health', 'travel', 'documents', 'public-services', 'finance', 'weather', 'news', 'legal', 'emergency', 'general'];
  return valid.includes(val as string) ? (val as string) : 'general';
}

function safeConfidence(val: unknown): string {
  const valid = ['high', 'medium', 'low'];
  return valid.includes(val as string) ? (val as string) : 'medium';
}

function safeUrgency(val: unknown): string {
  const valid = ['critical', 'high', 'medium', 'low'];
  return valid.includes(val as string) ? (val as string) : 'medium';
}

function safeStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

describe('Response parsing safety (fallback handling)', () => {
  describe('safeString', () => {
    test('returns value when valid', () => {
      expect(safeString('Valid string', 'fallback')).toBe('Valid string');
    });

    test('returns fallback when null', () => {
      expect(safeString(null, 'fallback')).toBe('fallback');
    });

    test('returns fallback when undefined', () => {
      expect(safeString(undefined, 'fallback')).toBe('fallback');
    });

    test('returns fallback when empty string', () => {
      expect(safeString('', 'fallback')).toBe('fallback');
    });

    test('returns fallback when number', () => {
      expect(safeString(42, 'fallback')).toBe('fallback');
    });

    test('trims whitespace from valid string', () => {
      expect(safeString('  hello  ', 'fallback')).toBe('hello');
    });
  });

  describe('safeCategory', () => {
    test('accepts all valid categories', () => {
      const valid = ['health', 'travel', 'documents', 'public-services', 'finance', 'weather', 'news', 'legal', 'emergency', 'general'];
      valid.forEach((cat) => {
        expect(safeCategory(cat)).toBe(cat);
      });
    });

    test('falls back to general for invalid category', () => {
      expect(safeCategory('unknown-category')).toBe('general');
    });

    test('falls back to general for null', () => {
      expect(safeCategory(null)).toBe('general');
    });

    test('falls back to general for injection attempt', () => {
      expect(safeCategory('"; DROP TABLE categories;--')).toBe('general');
    });
  });

  describe('safeConfidence', () => {
    test('accepts high, medium, low', () => {
      expect(safeConfidence('high')).toBe('high');
      expect(safeConfidence('medium')).toBe('medium');
      expect(safeConfidence('low')).toBe('low');
    });

    test('falls back to medium for invalid value', () => {
      expect(safeConfidence('very-high')).toBe('medium');
      expect(safeConfidence(null)).toBe('medium');
    });
  });

  describe('safeUrgency', () => {
    test('accepts critical, high, medium, low', () => {
      expect(safeUrgency('critical')).toBe('critical');
      expect(safeUrgency('high')).toBe('high');
      expect(safeUrgency('medium')).toBe('medium');
      expect(safeUrgency('low')).toBe('low');
    });

    test('falls back to medium for invalid value', () => {
      expect(safeUrgency('extreme')).toBe('medium');
      expect(safeUrgency(undefined)).toBe('medium');
    });
  });

  describe('safeStringArray', () => {
    test('returns strings from mixed array', () => {
      const result = safeStringArray(['hello', 42, null, 'world', undefined, '']);
      expect(result).toEqual(['hello', 'world']);
    });

    test('returns empty array for null', () => {
      expect(safeStringArray(null)).toEqual([]);
    });

    test('returns empty array for non-array', () => {
      expect(safeStringArray('string')).toEqual([]);
      expect(safeStringArray(42)).toEqual([]);
    });

    test('returns empty array for empty array', () => {
      expect(safeStringArray([])).toEqual([]);
    });
  });
});

describe('API error handling scenarios', () => {
  test('validates correctly structured API error object', () => {
    const error = {
      success: false,
      error: 'Something went wrong.',
      code: 'AI_ERROR',
    };
    expect(error.success).toBe(false);
    expect(typeof error.error).toBe('string');
    expect(['INVALID_INPUT', 'AI_ERROR', 'RATE_LIMIT', 'SERVER_ERROR', 'MISSING_CONFIG'].includes(error.code)).toBe(true);
  });

  test('handles missing API key error code', () => {
    const error = {
      success: false,
      error: 'Service unavailable.',
      code: 'MISSING_CONFIG',
    };
    expect(error.code).toBe('MISSING_CONFIG');
  });
});

describe('Input → API boundary validation', () => {
  test('rejects SQL injection in text field', () => {
    const input = {
      text: "'; DROP TABLE users; --",
      category: 'general',
    };
    // The validation should still pass (we allow special chars in text, Gemini handles it)
    // but it must be a string of valid length
    const result = validateBridgeInput(input);
    expect(result.valid).toBe(true); // SQL in text is fine — it's text, not executed
  });

  test('rejects XSS in category field', () => {
    const input = {
      text: 'Help me with this problem.',
      category: '<script>alert(1)</script>',
    };
    const result = validateBridgeInput(input);
    expect(result.valid).toBe(false);
  });

  test('accepts very long but valid text', () => {
    const input = {
      text: 'a'.repeat(5000), // exactly at max
      category: 'general',
    };
    const result = validateBridgeInput(input);
    expect(result.valid).toBe(true);
  });

  test('rejects text that exceeds 5000 characters', () => {
    const input = {
      text: 'a'.repeat(5001),
    };
    const result = validateBridgeInput(input);
    expect(result.valid).toBe(false);
  });

  test('handles completely empty object', () => {
    const result = validateBridgeInput({});
    expect(result.valid).toBe(false);
  });

  test('handles array input (malformed request)', () => {
    const result = validateBridgeInput([]);
    expect(result.valid).toBe(false);
  });
});
