'use client';

import { ShieldCheck, Eye, Brain, Users } from 'lucide-react';
import styles from './About.module.css';

const PRINCIPLES = [
  {
    icon: Brain,
    title: 'AI as a bridge, not a barrier',
    description: 'Humans should never need to understand complex systems before asking for help. The AI understands the human first, structures the problem, then guides through the system.',
  },
  {
    icon: Eye,
    title: 'Radical transparency',
    description: 'Every response clearly marks what is AI interpretation, what is general knowledge, and what is user-provided. We never blur the line between verified and unverified information.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety first',
    description: 'For medical, legal, financial, and emergency situations, Bridge AI is explicit about its limitations and always directs users to appropriate professional resources.',
  },
  {
    icon: Users,
    title: 'Universal access',
    description: 'Built for anyone, regardless of technical knowledge, education, or familiarity with complex government, medical, or financial systems.',
  },
];

export default function About() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.left}>
            <div className="badge badge-brand">About</div>
            <h2 id="about-heading">
              Why Bridge AI?
            </h2>
            <p className={styles.intro}>
              Complex systems — government, healthcare, finance, law — are designed for institutions,
              not for people. Bridge AI bridges the gap between human intent and institutional complexity.
            </p>
            <p className={styles.body}>
              Built for the Google Gemini hackathon challenge on societal benefit,
              Bridge AI demonstrates that artificial intelligence can act as a universal
              interpreter: understanding messy human problems and translating them into
              structured, actionable guidance that anyone can follow.
            </p>
            <blockquote className={styles.quote}>
              &ldquo;Mankind should not need to understand complex systems before asking for help.
              The AI should understand the human first, structure the problem, and then
              guide the human through the system.&rdquo;
            </blockquote>
          </div>

          <div className={styles.right}>
            <ul className={styles.principles} aria-label="Design principles">
              {PRINCIPLES.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.title} className={styles.principle}>
                    <div className={styles.principleIcon} aria-hidden="true">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className={styles.principleTitle}>{p.title}</h3>
                      <p className={styles.principleDesc}>{p.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
