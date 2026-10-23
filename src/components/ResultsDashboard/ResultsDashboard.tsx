'use client';

import {
  Brain, MapPin, CheckCircle, AlertTriangle, Target,
  ListOrdered, ShieldAlert, Link2, BarChart3, RotateCcw,
  Edit3, ChevronRight, Info, ExternalLink, Clock,
} from 'lucide-react';
import type { BridgeAIResponse } from '@/types';
import { getConfidenceLabel, getUrgencyLabel, truncateUrl } from '@/lib/utils';
import styles from './ResultsDashboard.module.css';

interface ResultsDashboardProps {
  result: BridgeAIResponse;
  onReset: () => void;
  onEdit: () => void;
}

export default function ResultsDashboard({ result, onReset, onEdit }: ResultsDashboardProps) {
  const urgencyIsHigh = result.urgency === 'critical' || result.urgency === 'high';

  return (
    <div className={`${styles.dashboard} max-w-5xl`} aria-label="Analysis results">
      {/* Dashboard Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <div className={`badge badge-brand ${styles.categoryBadge}`}>
            {result.category.replace('-', ' ')}
          </div>
          <span className={`badge badge-urgency-${result.urgency}`}>
            {urgencyIsHigh && <span aria-hidden="true">!</span>}
            {getUrgencyLabel(result.urgency)}
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onEdit}
            aria-label="Edit your request"
          >
            <Edit3 size={14} aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            aria-label="Start a new question"
          >
            <RotateCcw size={14} aria-hidden="true" />
            New question
          </button>
        </div>
      </div>

      {/* Critical warning banner */}
      {result.urgency === 'critical' && (
        <div className={styles.criticalBanner} role="alert" aria-live="assertive">
          <ShieldAlert size={20} aria-hidden="true" />
          <div>
            <strong>Urgent Situation Detected</strong>
            <p>If this is an emergency, contact emergency services (999 / 112 / 911) immediately.</p>
          </div>
        </div>
      )}

      {/* Primary Cards Grid */}
      <div className={`${styles.grid} grid grid-cols-1 md:grid-cols-2 gap-4`}>

        {/* 1. What I Understand */}
        <section className={`${styles.card} ${styles.cardWide} md:col-span-2 col-span-full animate-fade-in delay-1`} aria-labelledby="understanding-title">
          <div className="section-header">
            <div className="section-icon" aria-hidden="true">
              <Brain size={16} color="white" />
            </div>
            <h2 id="understanding-title" className="section-title">What I Understand</h2>
          </div>
          <p className={styles.summaryText}>{result.summary}</p>
          <div className={styles.intentChip}>
            <Target size={13} aria-hidden="true" />
            <span><strong>Your goal:</strong> {result.intent}</span>
          </div>
        </section>

        {/* 2. Recommended Action — MOST PROMINENT */}
        <section className={`${styles.card} ${styles.cardWide} ${styles.recommendedCard} md:col-span-2 col-span-full animate-fade-in delay-2`} aria-labelledby="action-title">
          <div className="section-header">
            <div className={`section-icon ${styles.iconGold}`} aria-hidden="true">
              <Target size={16} color="white" />
            </div>
            <h2 id="action-title" className="section-title">Recommended Action</h2>
          </div>
          <p className={styles.recommendedText}>{result.recommended_action}</p>
        </section>

        {/* 3. Key Details */}
        {(result.extracted_information.entities.length > 0 ||
          result.extracted_information.dates.length > 0 ||
          result.extracted_information.locations.length > 0 ||
          result.extracted_information.constraints.length > 0 ||
          result.extracted_information.missingInformation.length > 0) && (
          <section className={`${styles.card} animate-fade-in delay-3`} aria-labelledby="details-title">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <MapPin size={16} color="white" />
              </div>
              <h2 id="details-title" className="section-title">Key Details Detected</h2>
            </div>
            <dl className={styles.detailList}>
              {result.extracted_information.entities.length > 0 && (
                <div className={styles.detailRow}>
                  <dt>Entities</dt>
                  <dd>{result.extracted_information.entities.join(', ')}</dd>
                </div>
              )}
              {result.extracted_information.dates.length > 0 && (
                <div className={styles.detailRow}>
                  <dt><Clock size={12} aria-hidden="true" /> Time / Date</dt>
                  <dd>{result.extracted_information.dates.join(', ')}</dd>
                </div>
              )}
              {result.extracted_information.locations.length > 0 && (
                <div className={styles.detailRow}>
                  <dt><MapPin size={12} aria-hidden="true" /> Location</dt>
                  <dd>{result.extracted_information.locations.join(', ')}</dd>
                </div>
              )}
              {result.extracted_information.constraints.length > 0 && (
                <div className={styles.detailRow}>
                  <dt>Constraints</dt>
                  <dd>{result.extracted_information.constraints.join(', ')}</dd>
                </div>
              )}
              {result.extracted_information.missingInformation.length > 0 && (
                <div className={`${styles.detailRow} ${styles.missingInfo}`}>
                  <dt><Info size={12} aria-hidden="true" /> Missing info</dt>
                  <dd>{result.extracted_information.missingInformation.join(', ')}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* 4. Step-by-Step Plan */}
        {result.steps.length > 0 && (
          <section className={`${styles.card} animate-fade-in delay-4`} aria-labelledby="steps-title">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <ListOrdered size={16} color="white" />
              </div>
              <h2 id="steps-title" className="section-title">Step-by-Step Plan</h2>
            </div>
            <ol className={styles.stepsList} aria-label="Action steps">
              {result.steps.map((step) => (
                <li key={step.step} className={`${styles.stepItem} ${step.isUrgent ? styles.stepUrgent : ''}`}>
                  <div className={styles.stepNumber} aria-hidden="true">
                    {step.step}
                  </div>
                  <div className={styles.stepContent}>
                    <strong className={styles.stepTitle}>{step.title}</strong>
                    {step.description && (
                      <p className={styles.stepDesc}>{step.description}</p>
                    )}
                    {step.isUrgent && (
                      <span className="badge badge-urgency-high" aria-label="Urgent step">
                        Urgent
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 5. Verified Information */}
        {result.verified_information.length > 0 && (
          <section className={`${styles.card} animate-fade-in delay-4`} aria-labelledby="verified-title">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <CheckCircle size={16} color="white" />
              </div>
              <h2 id="verified-title" className="section-title">Information Status</h2>
            </div>
            <ul className={styles.verifiedList} aria-label="Information verification status">
              {result.verified_information.map((item, idx) => (
                <li key={idx} className={styles.verifiedItem}>
                  <span
                    className={`badge ${item.isVerified ? 'badge-verified' : 'badge-unverified'}`}
                    aria-label={item.isVerified ? 'Verified' : 'Not independently verified'}
                  >
                    {item.isVerified ? '✓ Verified' : '~ AI interpretation'}
                  </span>
                  <div className={styles.verifiedContent}>
                    <p className={styles.verifiedItemText}>{item.item}</p>
                    <p className={styles.verifiedNote}>{item.verificationNote}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 6. Uncertain Information */}
        {result.uncertain_information.length > 0 && (
          <section className={`${styles.card} animate-fade-in delay-5`} aria-labelledby="uncertain-title">
            <div className="section-header">
              <div className={`section-icon ${styles.iconWarning}`} aria-hidden="true">
                <AlertTriangle size={16} color="white" />
              </div>
              <h2 id="uncertain-title" className="section-title">Needs Confirmation</h2>
            </div>
            <p className={styles.sectionNote}>
              These items are uncertain or based on assumptions. Verify them before acting.
            </p>
            <ul className={styles.tagList} aria-label="Items needing confirmation">
              {result.uncertain_information.map((item, idx) => (
                <li key={idx} className={styles.uncertainTag}>
                  <AlertTriangle size={12} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            {result.assumptions.length > 0 && (
              <div className={styles.assumptionsBlock}>
                <p className={styles.assumptionsLabel}>Assumptions made:</p>
                <ul>
                  {result.assumptions.map((a, idx) => (
                    <li key={idx} className={styles.assumptionItem}>
                      <ChevronRight size={12} aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 7. Warnings */}
        {result.warnings.length > 0 && (
          <section className={`${styles.card} ${styles.warningCard} ${result.resources.length === 0 ? `${styles.cardWide} md:col-span-2 col-span-full` : ''} animate-fade-in delay-6`} aria-labelledby="warnings-title">
            <div className="section-header">
              <div className={`section-icon ${styles.iconDanger}`} aria-hidden="true">
                <ShieldAlert size={16} color="white" />
              </div>
              <h2 id="warnings-title" className="section-title">Important Warnings</h2>
            </div>
            <ul className={styles.warningList} aria-label="Important warnings">
              {result.warnings.map((warning, idx) => (
                <li key={idx} className={styles.warningItem}>
                  <ShieldAlert size={14} aria-hidden="true" className={styles.warningIcon} />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 8. Useful Resources */}
        {result.resources.length > 0 && (
          <section className={`${styles.card} ${result.warnings.length === 0 ? `${styles.cardWide} md:col-span-2 col-span-full` : ''} animate-fade-in delay-7`} aria-labelledby="resources-title">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <Link2 size={16} color="white" />
              </div>
              <h2 id="resources-title" className="section-title">Useful Resources</h2>
            </div>
            <ul className={styles.resourceList} aria-label="Useful resources and links">
              {result.resources.map((resource, idx) => (
                <li key={idx} className={styles.resourceItem}>
                  <div className={styles.resourceHeader}>
                    <span className={`badge badge-${resource.type === 'emergency' ? 'urgency-critical' : resource.type === 'official' ? 'verified' : 'brand'}`}>
                      {resource.type}
                    </span>
                    <strong className={styles.resourceTitle}>{resource.title}</strong>
                  </div>
                  <p className={styles.resourceDesc}>{resource.description}</p>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.resourceLink}
                      aria-label={`Open ${resource.title} (opens in new tab)`}
                    >
                      <ExternalLink size={12} aria-hidden="true" />
                      {truncateUrl(resource.url)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 9. Confidence Level */}
        <section className={`${styles.card} ${styles.cardWide} md:col-span-2 col-span-full animate-fade-in delay-8`} aria-labelledby="confidence-title">
          <div className="section-header">
            <div className="section-icon" aria-hidden="true">
              <BarChart3 size={16} color="white" />
            </div>
            <h2 id="confidence-title" className="section-title">Confidence Level</h2>
          </div>
          <div className={styles.confidenceRow}>
            <span className={`badge badge-confidence-${result.confidence}`} aria-label={`Confidence level: ${getConfidenceLabel(result.confidence)}`}>
              {getConfidenceLabel(result.confidence)}
            </span>
            <p className={styles.confidenceExplanation}>{result.confidence_explanation}</p>
          </div>
          <div className={styles.disclaimerBox}>
            <Info size={14} aria-hidden="true" />
            <p>
              Bridge AI provides structured guidance based on your input.
              For medical, legal, or financial decisions, always consult a qualified professional.
              Information marked as &quot;AI interpretation&quot; has not been independently verified.
            </p>
          </div>
        </section>

      </div>

      {/* Bottom actions */}
      <div className={styles.bottomActions}>
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          <Edit3 size={16} aria-hidden="true" />
          Refine my question
        </button>
        <button type="button" className="btn btn-primary" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" />
          Ask a new question
        </button>
      </div>
    </div>
  );
}
