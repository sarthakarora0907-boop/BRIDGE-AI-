'use client';

import { useEffect, useState } from 'react';
import { LOADING_STEPS } from '@/types';
import styles from './LoadingState.module.css';

export default function LoadingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let totalDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOADING_STEPS.forEach((step, idx) => {
      totalDelay += step.duration;
      if (idx < LOADING_STEPS.length - 1) {
        const timer = setTimeout(() => {
          setStepIndex(idx + 1);
        }, totalDelay);
        timers.push(timer);
      }
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const currentStep = LOADING_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / LOADING_STEPS.length) * 100;

  return (
    <div
      className={styles.wrapper}
      role="status"
      aria-live="polite"
      aria-label="Bridge AI is processing your request"
    >
      {/* Orbital animation */}
      <div className={styles.orbitContainer} aria-hidden="true">
        <div className={styles.orbit}>
          <div className={styles.orbitRing} />
          <div className={styles.orbitRing2} />
          <div className={styles.orbitCore}>
            <span>✦</span>
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className={styles.textBlock}>
        <p className={styles.statusText} key={stepIndex}>
          {currentStep?.message}
        </p>
        <p className={styles.subText}>
          Bridge AI is analysing your situation using Gemini
        </p>
      </div>

      {/* Progress bar */}
      <div className={styles.progressTrack} aria-label={`Processing step ${stepIndex + 1} of ${LOADING_STEPS.length}`}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className={styles.steps} aria-label="Processing steps">
        {LOADING_STEPS.map((step, idx) => (
          <div
            key={step.message}
            className={`${styles.step} ${idx <= stepIndex ? styles.stepActive : ''}`}
            aria-current={idx === stepIndex ? 'step' : undefined}
          >
            <div className={styles.stepDot} />
            <span className={styles.stepLabel}>{step.message.replace('…', '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
