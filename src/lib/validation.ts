// Bridge AI - Input Validation Layer
// Centralised validation for all user inputs before they reach the AI

import type { ProblemCategory } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const MAX_TEXT_LENGTH = 5000;
const MIN_TEXT_LENGTH = 3;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VALID_CATEGORIES: ProblemCategory[] = [
  'health', 'travel', 'documents', 'public-services',
  'finance', 'weather', 'news', 'legal', 'emergency', 'general',
];

/**
 * Validates the user's text input.
 */
export function validateText(text: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof text !== 'string') {
    errors.push({ field: 'text', message: 'Input must be a string.' });
    return { valid: false, errors };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    errors.push({ field: 'text', message: 'Please describe your problem before submitting.' });
  } else if (trimmed.length < MIN_TEXT_LENGTH) {
    errors.push({ field: 'text', message: `Please provide at least ${MIN_TEXT_LENGTH} characters.` });
  } else if (trimmed.length > MAX_TEXT_LENGTH) {
    errors.push({
      field: 'text',
      message: `Your input is too long. Please keep it under ${MAX_TEXT_LENGTH.toLocaleString()} characters.`,
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an uploaded image file.
 */
export function validateImageFile(file: File): ValidationResult {
  const errors: ValidationError[] = [];

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push({
      field: 'image',
      message: 'Unsupported file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    });
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    errors.push({
      field: 'image',
      message: 'Image is too large. Please upload an image smaller than 5 MB.',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a category value.
 */
export function validateCategory(category: unknown): ValidationResult {
  if (category === undefined || category === null || category === '') {
    return { valid: true, errors: [] }; // Category is optional
  }

  if (!VALID_CATEGORIES.includes(category as ProblemCategory)) {
    return {
      valid: false,
      errors: [{ field: 'category', message: 'Invalid problem category selected.' }],
    };
  }

  return { valid: true, errors: [] };
}

/**
 * Validates the entire BridgeAIInput object.
 */
export function validateBridgeInput(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'input', message: 'Invalid request body.' }],
    };
  }

  const obj = input as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // Validate text
  const textResult = validateText(obj.text);
  errors.push(...textResult.errors);

  // Validate category if provided
  const categoryResult = validateCategory(obj.category);
  errors.push(...categoryResult.errors);

  // Validate image fields if present
  if (obj.imageBase64 !== undefined) {
    if (typeof obj.imageBase64 !== 'string' || obj.imageBase64.length === 0) {
      errors.push({ field: 'imageBase64', message: 'Invalid image data.' });
    }
    if (obj.imageMimeType && !ALLOWED_IMAGE_TYPES.includes(obj.imageMimeType as string)) {
      errors.push({ field: 'imageMimeType', message: 'Unsupported image format.' });
    }
  }

  return { valid: errors.length === 0, errors };
}

export const VALIDATION_CONSTANTS = {
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
};
