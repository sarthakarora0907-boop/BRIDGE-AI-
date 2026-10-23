'use client';

import { useState, useCallback, useRef } from 'react';
import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import InputPanel from '@/components/InputPanel/InputPanel';
import LoadingState from '@/components/LoadingState/LoadingState';
import ResultsDashboard from '@/components/ResultsDashboard/ResultsDashboard';
import ErrorState from '@/components/ErrorState/ErrorState';
import HowItWorks from '@/components/HowItWorks/HowItWorks';
import Examples from '@/components/Examples/Examples';
import About from '@/components/About/About';
import Footer from '@/components/Footer/Footer';
import type { AppState, BridgeAIInput, BridgeAIResponse, APIError } from '@/types';
import styles from './page.module.css';

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BridgeAIResponse | null>(null);
  const [error, setError] = useState<APIError | null>(null);
  const [lastInput, setLastInput] = useState<BridgeAIInput | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (input: BridgeAIInput, isDemo = false) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLastInput(input);
    setAppState('loading');
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, demo: isDemo }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          error: 'An unexpected error occurred.',
          code: 'SERVER_ERROR',
        }));
        setError(errorData as APIError);
        setAppState('error');
        return;
      }

      const data = await response.json();

      if (!data.success) {
        setError(data as APIError);
        setIsLoading(false);
        setAppState('error');
        return;
      }

      setResult(data.data as BridgeAIResponse);
      setIsLoading(false);
      setAppState('success');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was intentionally cancelled - return to idle
        setAppState('idle');
        return;
      }

      setError({
        success: false,
        error: 'Unable to reach the server. Please check your connection and try again.',
        code: 'SERVER_ERROR',
      });
      setAppState('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAppState('idle');
    setResult(null);
    setError(null);
    setLastInput(null);
    // Scroll to input
    const inputEl = document.getElementById('input-area');
    inputEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleEdit = useCallback(() => {
    setAppState('idle');
    const inputEl = document.getElementById('problem-input');
    setTimeout(() => {
      inputEl?.focus();
      const container = document.getElementById('input-area');
      container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleRetry = useCallback(() => {
    if (lastInput) {
      handleSubmit(lastInput);
    }
  }, [lastInput, handleSubmit]);

  const handleRunDemo = useCallback(() => {
    if (lastInput) {
      handleSubmit(lastInput, true);
    }
  }, [lastInput, handleSubmit]);

  const handleExampleSelect = useCallback((text: string) => {
    // This communicates to InputPanel via URL param or event
    // We use a custom event to communicate with the InputPanel
    const event = new CustomEvent('bridge-ai-example', { detail: { text } });
    window.dispatchEvent(event);

    // Scroll to input
    const inputEl = document.getElementById('input-area');
    inputEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      {/* Background gradient */}
      <div className="page-bg" aria-hidden="true" />

      {/* Skip to main content (accessibility) */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <Header goal={result?.intent} />

      <main id="main-content" className={styles.main}>
        {/* Hero is only shown on idle state */}
        {appState === 'idle' && <Hero />}

        {/* Input Panel — always visible when idle or after error */}
        {(appState === 'idle' || appState === 'error') && (
          <InputPanel
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}

        {/* Loading State */}
        {appState === 'loading' && (
          <div className={styles.stateWrapper} role="status">
            <LoadingState />
          </div>
        )}

        {/* Success — Results Dashboard */}
        {appState === 'success' && result && (
          <div className={styles.resultsWrapper}>
            <ResultsDashboard
              result={result}
              onReset={handleReset}
              onEdit={handleEdit}
            />
          </div>
        )}

        {/* Error State */}
        {appState === 'error' && error && (
          <ErrorState
            error={error}
            onRetry={handleRetry}
            onEdit={handleEdit}
            onReset={handleReset}
            onRunDemo={handleRunDemo}
          />
        )}

        {/* Sections below input — always visible */}
        {appState === 'idle' && (
          <>
            <HowItWorks />
            <Examples onExampleSelect={handleExampleSelect} />
            <About />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
