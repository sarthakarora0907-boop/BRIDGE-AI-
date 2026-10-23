// Bridge AI - Utility Functions

import type { ConfidenceLevel, UrgencyLevel } from '@/types';

/**
 * Converts a File to a base64 string (data only, no data URL prefix).
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Returns CSS classes for confidence level badges.
 */
export function getConfidenceClasses(confidence: ConfidenceLevel): { bg: string; text: string; border: string } {
  switch (confidence) {
    case 'high':
      return { bg: 'confidence-high-bg', text: 'confidence-high-text', border: 'confidence-high-border' };
    case 'medium':
      return { bg: 'confidence-medium-bg', text: 'confidence-medium-text', border: 'confidence-medium-border' };
    case 'low':
      return { bg: 'confidence-low-bg', text: 'confidence-low-text', border: 'confidence-low-border' };
  }
}

/**
 * Returns CSS classes for urgency level badges.
 */
export function getUrgencyClasses(urgency: UrgencyLevel): { bg: string; text: string } {
  switch (urgency) {
    case 'critical':
      return { bg: 'urgency-critical-bg', text: 'urgency-critical-text' };
    case 'high':
      return { bg: 'urgency-high-bg', text: 'urgency-high-text' };
    case 'medium':
      return { bg: 'urgency-medium-bg', text: 'urgency-medium-text' };
    case 'low':
      return { bg: 'urgency-low-bg', text: 'urgency-low-text' };
  }
}

/**
 * Formats a character count indicator string.
 */
export function formatCharCount(current: number, max: number): string {
  return `${current.toLocaleString()} / ${max.toLocaleString()}`;
}

/**
 * Truncates a URL for display purposes.
 */
export function truncateUrl(url: string, maxLength = 50): string {
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname;
    return display.length > maxLength ? display.substring(0, maxLength) + '…' : display;
  } catch {
    return url.length > maxLength ? url.substring(0, maxLength) + '…' : url;
  }
}

/**
 * Safely sanitises a string for display (prevents XSS).
 * We never use dangerouslySetInnerHTML, but this is an additional guard.
 */
export function sanitiseString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Checks if the browser supports the Web Speech API for voice input.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/**
 * Returns a human-readable label for confidence levels.
 */
export function getConfidenceLabel(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'high': return 'High Confidence';
    case 'medium': return 'Medium Confidence';
    case 'low': return 'Low Confidence';
  }
}

/**
 * Returns a human-readable label for urgency levels.
 */
export function getUrgencyLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'critical': return 'Critical';
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Low Priority';
  }
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
