// Bridge AI — Unit Tests: Utility Functions

import {
  formatCharCount,
  truncateUrl,
  getConfidenceLabel,
  getUrgencyLabel,
  clamp,
  sanitiseString,
} from '@/lib/utils';

describe('formatCharCount', () => {
  test('formats character count correctly', () => {
    expect(formatCharCount(100, 5000)).toBe('100 / 5,000');
  });

  test('formats zero count', () => {
    expect(formatCharCount(0, 5000)).toBe('0 / 5,000');
  });

  test('formats when current equals max', () => {
    expect(formatCharCount(5000, 5000)).toBe('5,000 / 5,000');
  });
});

describe('truncateUrl', () => {
  test('truncates a long URL', () => {
    const longUrl = 'https://www.government.example.co.uk/services/passport/apply-for-first-passport-online-guide';
    const result = truncateUrl(longUrl, 50);
    expect(result.length).toBeLessThanOrEqual(53); // 50 chars + ellipsis
    expect(result.endsWith('…')).toBe(true);
  });

  test('does not truncate a short URL', () => {
    const shortUrl = 'https://nhs.uk';
    const result = truncateUrl(shortUrl, 50);
    // URL.pathname always includes trailing slash, so hostname + pathname = 'nhs.uk/'
    expect(result).toContain('nhs.uk');
    expect(result.endsWith('…')).toBe(false);
  });

  test('handles invalid URL gracefully', () => {
    const invalidUrl = 'not-a-real-url-at-all';
    const result = truncateUrl(invalidUrl, 50);
    expect(typeof result).toBe('string');
  });

  test('handles empty string', () => {
    const result = truncateUrl('', 50);
    expect(result).toBe('');
  });
});

describe('getConfidenceLabel', () => {
  test('returns correct label for high', () => {
    expect(getConfidenceLabel('high')).toBe('High Confidence');
  });

  test('returns correct label for medium', () => {
    expect(getConfidenceLabel('medium')).toBe('Medium Confidence');
  });

  test('returns correct label for low', () => {
    expect(getConfidenceLabel('low')).toBe('Low Confidence');
  });
});

describe('getUrgencyLabel', () => {
  test('returns correct label for critical', () => {
    expect(getUrgencyLabel('critical')).toBe('Critical');
  });

  test('returns correct label for high', () => {
    expect(getUrgencyLabel('high')).toBe('High Priority');
  });

  test('returns correct label for medium', () => {
    expect(getUrgencyLabel('medium')).toBe('Medium Priority');
  });

  test('returns correct label for low', () => {
    expect(getUrgencyLabel('low')).toBe('Low Priority');
  });
});

describe('clamp', () => {
  test('returns value within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  test('clamps to minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  test('clamps to maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  test('returns min when value equals min', () => {
    expect(clamp(0, 0, 100)).toBe(0);
  });

  test('returns max when value equals max', () => {
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

describe('sanitiseString', () => {
  test('escapes HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const result = sanitiseString(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  test('escapes ampersands', () => {
    const result = sanitiseString('bread & butter');
    expect(result).toBe('bread &amp; butter');
  });

  test('escapes double quotes', () => {
    const result = sanitiseString('Say "hello"');
    expect(result).toContain('&quot;');
  });

  test('passes through safe strings unchanged in meaning', () => {
    const safe = 'Hello world, this is a normal string.';
    const result = sanitiseString(safe);
    expect(result).toBe(safe);
  });

  test('handles empty string', () => {
    expect(sanitiseString('')).toBe('');
  });
});
