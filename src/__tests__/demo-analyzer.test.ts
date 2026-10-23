// Bridge AI — Unit Tests: Demo & Simulation Analyzer

import { generateDemoAnalysis } from '@/lib/demo-analyzer';
import type { BridgeAIInput } from '@/types';

describe('generateDemoAnalysis', () => {
  test('correctly handles health domain and applies medical safety disclaimers', () => {
    const input: BridgeAIInput = {
      text: 'I have been feeling dizzy and short of breath for two days. What should I do?',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('health');
    expect(response.urgency).toBe('medium');
    expect(response.intent).toContain('symptoms safely');
    expect(response.steps.length).toBeGreaterThan(0);
    expect(response.warnings.some((w) => w.includes('NOT medical diagnosis'))).toBe(true);
    expect(response.resources.some((r) => r.type === 'official')).toBe(true);
    expect(response.verified_information.some((v) => v.isVerified)).toBe(true);
    expect(response.uncertain_information.length).toBeGreaterThan(0);
  });

  test('correctly escalates life-threatening situations to critical urgency', () => {
    const input: BridgeAIInput = {
      text: 'I found an elderly person collapsed on the street and they are unresponsive.',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('emergency');
    expect(response.urgency).toBe('critical');
    expect(response.recommended_action).toContain('Emergency Services');
    expect(response.steps[0].isUrgent).toBe(true);
    expect(response.resources.some((r) => r.type === 'emergency')).toBe(true);
  });

  test('correctly extracts travel constraints and weather risks', () => {
    const input: BridgeAIInput = {
      text: "I need to reach the hospital tomorrow morning and heavy rain is expected. I don't know the safest way.",
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('travel');
    expect(response.extracted_information.dates).toContain('Tomorrow morning');
    expect(response.extracted_information.constraints).toContain('Adverse weather conditions expected');
    expect(response.steps.length).toBeGreaterThan(0);
    expect(response.confidence).toBeDefined();
  });

  test('handles document notice with statutory deadlines', () => {
    const input: BridgeAIInput = {
      text: 'I received a government notice saying I must respond within 14 days about planning permission.',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('documents');
    expect(response.extracted_information.dates).toContain('14-day statutory deadline');
    expect(response.steps.length).toBeGreaterThan(0);
    expect(response.resources.some((r) => r.url?.includes('gov.uk'))).toBe(true);
  });

  test('handles utility bill spike with audit steps', () => {
    const input: BridgeAIInput = {
      text: 'My electricity bill suddenly doubled this month compared to last month. Can you help me understand why?',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('finance');
    expect(response.recommended_action).toContain('meter reading');
    expect(response.steps.some((s) => s.title.includes('Estimated'))).toBe(true);
    expect(response.resources.some((r) => r.title.includes('Ombudsman'))).toBe(true);
  });

  test('handles legal tenant deposit disputes', () => {
    const input: BridgeAIInput = {
      text: 'My landlord is refusing to return my security deposit after I moved out claiming damages that were already there.',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('legal');
    expect(response.recommended_action).toContain('dispute');
    expect(response.verified_information.some((v) => v.item.includes('wear and tear'))).toBe(true);
    expect(response.resources.some((r) => r.title.includes('Tenancy Deposit Scheme'))).toBe(true);
  });

  test('handles weather and flood preparedness', () => {
    const input: BridgeAIInput = {
      text: 'There are flood warnings in my area near a river. What should we do to prepare?',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('weather');
    expect(response.extracted_information.locations).toContain('Near river basin');
    expect(response.steps.some((s) => s.title.includes('grab bag'))).toBe(true);
    expect(response.warnings.some((w) => w.includes('floodwater'))).toBe(true);
  });

  test('handles public services expedited passport request', () => {
    const input: BridgeAIInput = {
      text: 'I need to apply for a replacement passport urgently for a flight in three weeks.',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('public-services');
    expect(response.extracted_information.dates).toContain('3 weeks time constraint');
    expect(response.steps[0].title).toContain('NOT use the standard postal application');
    expect(response.resources.some((r) => r.title.includes('Passport Office'))).toBe(true);
  });

  test('provides robust general fallback structure for arbitrary unstructured queries', () => {
    const input: BridgeAIInput = {
      text: 'Something strange happened and I just do not know what to do next with this situation.',
    };
    const response = generateDemoAnalysis(input);

    expect(response.category).toBe('general');
    expect(response.intent).toBeDefined();
    expect(response.summary).toBeDefined();
    expect(response.steps.length).toBeGreaterThan(0);
    expect(response.recommended_action).toBeDefined();
    expect(response.confidence_explanation).toBeDefined();
  });
});
