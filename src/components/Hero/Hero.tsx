'use client';

import { ArrowDown } from 'lucide-react';
import styles from './Hero.module.css';

const STATS = [
  { value: '10+', label: 'Problem Types' },
  { value: 'Real-time', label: 'AI Analysis' },
  { value: 'Structured', label: 'Clear Guidance' },
];

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      {/* Top badge */}
      <div className={styles.badge} aria-label="Product category">
        <span aria-hidden="true">✦</span>
        Powered by Google Gemini
        <span aria-hidden="true">✦</span>
      </div>

      {/* Headline */}
      <h1 id="hero-heading" className={styles.headline}>
        Tell us the problem.
        <br />
        <span className="text-gradient">We&apos;ll find your next step.</span>
      </h1>

      {/* Subheading */}
      <p className={styles.subheading}>
        Describe any complicated real-world situation — a confusing notice, a health question,
        a difficult journey, a complex form. Bridge AI transforms your messy problem into
        structured, understandable, and actionable guidance.
      </p>

      {/* Stats strip */}
      <div className={styles.stats} role="list" aria-label="Key capabilities">
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.statItem} role="listitem">
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <a href="#input-area" className={styles.scrollIndicator} aria-label="Scroll to problem input">
        <ArrowDown size={16} aria-hidden="true" />
        <span>Start here</span>
      </a>
    </section>
  );
}
