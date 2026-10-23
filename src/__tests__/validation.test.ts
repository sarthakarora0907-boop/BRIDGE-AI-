// Bridge AI — Unit Tests: Validation

import {
  validateText,
  validateImageFile,
  validateCategory,
  validateBridgeInput,
  VALIDATION_CONSTANTS,
} from '@/lib/validation';

describe('validateText', () => {
  test('accepts valid text', () => {
    const result = validateText('My electricity bill doubled this month.');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects empty string', () => {
    const result = validateText('');
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('text');
    expect(result.errors[0].message).toMatch(/describe your problem/i);
  });

  test('rejects whitespace-only string', () => {
    const result = validateText('   ');
    expect(result.valid).toBe(false);
  });

  test('rejects text that is too short', () => {
    const result = validateText('Hi');
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toMatch(/at least/i);
  });

  test('rejects text that exceeds max length', () => {
    const longText = 'a'.repeat(VALIDATION_CONSTANTS.MAX_TEXT_LENGTH + 1);
    const result = validateText(longText);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toMatch(/too long/i);
  });

  test('accepts text at maximum allowed length', () => {
    const maxText = 'a'.repeat(VALIDATION_CONSTANTS.MAX_TEXT_LENGTH);
    const result = validateText(maxText);
    expect(result.valid).toBe(true);
  });

  test('rejects non-string input', () => {
    const result = validateText(42);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toMatch(/string/i);
  });

  test('rejects null input', () => {
    const result = validateText(null);
    expect(result.valid).toBe(false);
  });

  test('rejects undefined input', () => {
    const result = validateText(undefined);
    expect(result.valid).toBe(false);
  });
});

describe('validateImageFile', () => {
  const createFile = (name: string, type: string, size: number) => {
    const blob = new Blob(['x'.repeat(size)], { type });
    return new File([blob], name, { type });
  };

  test('accepts valid JPEG file', () => {
    const file = createFile('test.jpg', 'image/jpeg', 1000);
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test('accepts valid PNG file', () => {
    const file = createFile('test.png', 'image/png', 1000);
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test('accepts valid WebP file', () => {
    const file = createFile('test.webp', 'image/webp', 1000);
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test('rejects PDF file', () => {
    const file = createFile('document.pdf', 'application/pdf', 1000);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toMatch(/unsupported file type/i);
  });

  test('rejects file over 5 MB', () => {
    const file = createFile('large.jpg', 'image/jpeg', VALIDATION_CONSTANTS.MAX_IMAGE_SIZE_BYTES + 1);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toMatch(/too large/i);
  });

  test('accepts file at exactly 5 MB', () => {
    const file = createFile('exact.jpg', 'image/jpeg', VALIDATION_CONSTANTS.MAX_IMAGE_SIZE_BYTES);
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  test('rejects executable file masquerading as image', () => {
    const file = createFile('virus.exe', 'application/octet-stream', 1000);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
  });
});

describe('validateCategory', () => {
  test('accepts all valid categories', () => {
    const validCategories = ['health', 'travel', 'documents', 'public-services', 'finance', 'weather', 'news', 'legal', 'emergency', 'general'];
    validCategories.forEach((cat) => {
      const result = validateCategory(cat);
      expect(result.valid).toBe(true);
    });
  });

  test('accepts undefined (category is optional)', () => {
    const result = validateCategory(undefined);
    expect(result.valid).toBe(true);
  });

  test('accepts empty string (category is optional)', () => {
    const result = validateCategory('');
    expect(result.valid).toBe(true);
  });

  test('rejects invalid category', () => {
    const result = validateCategory('cooking');
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('category');
  });

  test('rejects injection attempt', () => {
    const result = validateCategory('<script>alert(1)</script>');
    expect(result.valid).toBe(false);
  });
});

describe('validateBridgeInput', () => {
  test('accepts valid full input', () => {
    const input = {
      text: 'My electricity bill doubled this month.',
      category: 'finance',
    };
    const result = validateBridgeInput(input);
    expect(result.valid).toBe(true);
  });

  test('accepts minimal valid input (text only)', () => {
    const input = { text: 'Help me understand this bill.' };
    const result = validateBridgeInput(input);
    expect(result.valid).toBe(true);
  });

  test('rejects null input', () => {
    const result = validateBridgeInput(null);
    expect(result.valid).toBe(false);
  });

  test('rejects input with no text', () => {
    const result = validateBridgeInput({ text: '' });
    expect(result.valid).toBe(false);
  });

  test('rejects non-object input', () => {
    const result = validateBridgeInput('just a string');
    expect(result.valid).toBe(false);
  });

  test('rejects input with invalid category', () => {
    const result = validateBridgeInput({ text: 'Valid text here.', category: 'invalidcat' });
    expect(result.valid).toBe(false);
  });

  test('rejects input with empty imageBase64', () => {
    const result = validateBridgeInput({ text: 'Valid text here.', imageBase64: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'imageBase64')).toBe(true);
  });

  test('rejects image with invalid mime type', () => {
    const result = validateBridgeInput({
      text: 'Valid text here.',
      imageBase64: 'validbase64data',
      imageMimeType: 'application/pdf',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'imageMimeType')).toBe(true);
  });

  test('accepts input with valid imageBase64 and mimeType', () => {
    const result = validateBridgeInput({
      text: 'Tell me what this document says.',
      imageBase64: 'validbase64data',
      imageMimeType: 'image/jpeg',
    });
    expect(result.valid).toBe(true);
  });
});
