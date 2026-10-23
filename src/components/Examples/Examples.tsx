'use client';

import styles from './Examples.module.css';

const EXAMPLES = [
  {
    category: '🏥 Health',
    title: 'Unexplained symptoms',
    preview: 'I have been feeling dizzy and short of breath for two days and I am not sure if I should go to A&E or wait.',
    tags: ['Medical', 'Urgent', 'Self-help'],
  },
  {
    category: '🚦 Travel',
    title: 'Weather-impacted journey',
    preview: "I need to reach the hospital tomorrow morning but heavy rain is expected. I don't know which route will be safe.",
    tags: ['Routing', 'Planning', 'Risk'],
  },
  {
    category: '📄 Documents',
    title: 'Confusing government notice',
    preview: "I received a letter from the council about planning permission. I don't understand what I need to do or how quickly.",
    tags: ['Government', 'Legal', 'Deadline'],
  },
  {
    category: '💳 Finance',
    title: 'Unexpected bill spike',
    preview: 'My electricity bill this month is three times higher than usual. I have not changed my habits. What could have happened?',
    tags: ['Bills', 'Energy', 'Diagnosis'],
  },
  {
    category: '🏛️ Public Services',
    title: 'First-time passport',
    preview: 'I need to get a passport urgently for a flight in three weeks. I have never applied before and do not know where to start.',
    tags: ['Government', 'Urgent', 'Step-by-step'],
  },
  {
    category: '⚖️ Legal',
    title: 'Tenant dispute',
    preview: 'My landlord is refusing to return my £800 deposit claiming damages that were already there when I moved in.',
    tags: ['Rights', 'Dispute', 'Housing'],
  },
  {
    category: '🌦️ Weather',
    title: 'Flood preparedness',
    preview: 'There are flood warnings in my area. We live near a river. What should we do to prepare and keep our family safe?',
    tags: ['Safety', 'Emergency prep', 'Family'],
  },
  {
    category: '🆘 Emergency',
    title: 'Found someone collapsed',
    preview: 'I found an elderly person collapsed on the pavement. They are breathing but unresponsive. What do I do right now?',
    tags: ['Critical', 'First aid', 'Urgent'],
  },
];

interface ExamplesProps {
  onExampleSelect: (text: string) => void;
}

export default function Examples({ onExampleSelect }: ExamplesProps) {
  return (
    <section id="examples" className={styles.section} aria-labelledby="examples-heading">
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className="badge badge-brand">Examples</div>
          <h2 id="examples-heading">Explore What Bridge AI Can Help With</h2>
          <p className={styles.subtitle}>
            Click any example to load it into the input area and see how Bridge AI responds.
          </p>
        </div>

        <div className={styles.grid}>
          {EXAMPLES.map((example) => (
            <button
              key={example.title}
              className={styles.exampleCard}
              onClick={() => onExampleSelect(example.preview)}
              aria-label={`Load example: ${example.title} — ${example.preview}`}
              type="button"
            >
              <div className={styles.cardTop}>
                <span className={styles.category}>{example.category}</span>
              </div>
              <h3 className={styles.cardTitle}>{example.title}</h3>
              <p className={styles.cardPreview}>&ldquo;{example.preview}&rdquo;</p>
              <div className={styles.tags} aria-label="Tags">
                {example.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
