'use client';

import { Zap } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Zap size={16} aria-hidden="true" />
          <span>Bridge<span className={styles.accent}>AI</span></span>
        </div>

        <p className={styles.tagline}>
          Turn messy problems into clear next steps.
        </p>

        <p className={styles.disclaimer}>
          Bridge AI is an AI-powered tool. Responses are for informational purposes only.
          Always consult qualified professionals for medical, legal, financial, or emergency decisions.
          Information is not independently verified unless explicitly stated.
        </p>

        <div className={styles.bottom}>
          <p className={styles.credit}>
            Powered by <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer">Google Gemini</a>
          </p>
          <p className={styles.copyright}>
            Built for the Google Gemini Hackathon · Societal Benefit Challenge
          </p>
        </div>
      </div>
    </footer>
  );
}
