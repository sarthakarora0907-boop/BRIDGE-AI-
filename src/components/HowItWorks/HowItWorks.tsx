'use client';

import styles from './HowItWorks.module.css';

const STEPS = [
  {
    number: '01',
    title: 'Describe naturally',
    description: "Tell Bridge AI your problem in your own words. No technical jargon, no forms, no structure required. Just describe what's happening.",
    icon: '💬',
  },
  {
    number: '02',
    title: 'AI understands your intent',
    description: 'Gemini AI extracts your intent, identifies the entities, time constraints, locations, risks, and missing information from your raw description.',
    icon: '🧠',
  },
  {
    number: '03',
    title: 'Problem is structured',
    description: 'Your messy problem is transformed into a structured problem card — with clear categories, urgency levels, and detected context.',
    icon: '📋',
  },
  {
    number: '04',
    title: 'Get clear next steps',
    description: 'Bridge AI gives you a verified-vs-uncertain breakdown, a step-by-step action plan, important warnings, and useful resources.',
    icon: '🎯',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section} aria-labelledby="how-heading">
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className="badge badge-brand">Process</div>
          <h2 id="how-heading">How Bridge AI Works</h2>
          <p className={styles.subtitle}>
            From messy human problem to clear, structured, actionable guidance — in seconds.
          </p>
        </div>

        <div className={styles.steps} role="list">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className={`${styles.step} animate-fade-in delay-${idx + 1}`}
              role="listitem"
            >
              <div className={styles.stepNumber} aria-hidden="true">
                {step.number}
              </div>
              <div className={styles.stepIcon} aria-hidden="true">
                {step.icon}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>

        {/* Connection line */}
        <div className={styles.pipeline} aria-hidden="true">
          <div className={styles.pipelineLabel}>Human intent</div>
          <div className={styles.pipelineArrow}>→</div>
          <div className={styles.pipelineCore}>Gemini AI</div>
          <div className={styles.pipelineArrow}>→</div>
          <div className={styles.pipelineLabel}>Structured action</div>
        </div>
      </div>
    </section>
  );
}
