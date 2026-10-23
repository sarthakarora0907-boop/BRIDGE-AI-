'use client';

import { AlertCircle, RotateCcw, Edit3, Settings } from 'lucide-react';
import type { APIError } from '@/types';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  error: APIError;
  onRetry: () => void;
  onEdit: () => void;
  onReset: () => void;
  onRunDemo?: () => void;
}

const ERROR_MESSAGES: Record<APIError['code'], { title: string; description: string; showConfig: boolean }> = {
  INVALID_INPUT: {
    title: 'Invalid input',
    description: 'Your request could not be processed as submitted. Please check your input and try again.',
    showConfig: false,
  },
  AI_ERROR: {
    title: 'Something went wrong',
    description: 'There was a problem processing your request with the AI service. Please try again.',
    showConfig: false,
  },
  RATE_LIMIT: {
    title: 'Too many requests',
    description: 'You have sent too many requests in a short period. Please wait a moment and try again.',
    showConfig: false,
  },
  SERVER_ERROR: {
    title: 'Server error',
    description: 'An unexpected server error occurred. Please try again in a moment.',
    showConfig: false,
  },
  MISSING_CONFIG: {
    title: 'Service unavailable',
    description: 'The AI service is not properly configured. If you are a developer, check that GEMINI_API_KEY is set in .env.local.',
    showConfig: true,
  },
};

export default function ErrorState({ error, onRetry, onEdit, onReset, onRunDemo }: ErrorStateProps) {
  const errorInfo = ERROR_MESSAGES[error.code] ?? ERROR_MESSAGES.SERVER_ERROR;

  return (
    <div
      className={styles.wrapper}
      role="alert"
      aria-live="assertive"
      aria-label="An error occurred"
    >
      <div className={styles.iconWrapper} aria-hidden="true">
        <AlertCircle size={32} />
      </div>

      <h2 className={styles.title}>{errorInfo.title}</h2>
      <p className={styles.message}>{errorInfo.description}</p>

      {/* Show the specific API error message */}
      {error.error && (
        <p className={styles.detail}>{error.error}</p>
      )}

      {errorInfo.showConfig && (
        <div className={styles.configHint}>
          <Settings size={14} aria-hidden="true" />
          <code>GEMINI_API_KEY</code> can be set in your <code>.env.local</code> file for live Gemini 1.5 Flash analysis.
        </div>
      )}

      <div className={styles.actions}>
        {onRunDemo && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRunDemo}
            aria-label="Try with Demo Simulation"
          >
            ✦ Try with Demo Simulation
          </button>
        )}
        <button
          type="button"
          className={onRunDemo ? 'btn btn-secondary' : 'btn btn-primary'}
          onClick={onRetry}
          aria-label="Try again"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Try again
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onEdit}
          aria-label="Edit your request"
        >
          <Edit3 size={16} aria-hidden="true" />
          Edit request
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onReset}
          aria-label="Start over"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
