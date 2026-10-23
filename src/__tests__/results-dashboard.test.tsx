// Bridge AI — Unit Tests: ResultsDashboard Component Layout & Refactoring

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsDashboard from '@/components/ResultsDashboard/ResultsDashboard';
import { generateDemoAnalysis } from '@/lib/demo-analyzer';

describe('ResultsDashboard Layout & Grid Refactor', () => {
  const mockResult = generateDemoAnalysis({
    text: 'I have been feeling dizzy and short of breath for two days. What should I do?',
  });

  const onReset = jest.fn();
  const onEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders container with max-w-5xl class for wide desktop layout', () => {
    render(<ResultsDashboard result={mockResult} onReset={onReset} onEdit={onEdit} />);
    const dashboard = screen.getByLabelText('Analysis results');

    expect(dashboard).toBeInTheDocument();
    expect(dashboard.className).toContain('max-w-5xl');
  });

  test('renders primary cards in a 2-column responsive grid with grid grid-cols-1 md:grid-cols-2 gap-4', () => {
    const { container } = render(
      <ResultsDashboard result={mockResult} onReset={onReset} onEdit={onEdit} />
    );

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer?.className).toContain('grid');
    expect(gridContainer?.className).toContain('grid-cols-1');
    expect(gridContainer?.className).toContain('md:grid-cols-2');
    expect(gridContainer?.className).toContain('gap-4');
  });

  test('renders Key Details, Step-by-Step Plan, Information Status, and Needs Confirmation sections', () => {
    render(<ResultsDashboard result={mockResult} onReset={onReset} onEdit={onEdit} />);

    // Check headings
    expect(screen.getByText('Key Details Detected')).toBeInTheDocument();
    expect(screen.getByText('Step-by-Step Plan')).toBeInTheDocument();
    expect(screen.getByText('Information Status')).toBeInTheDocument();
    expect(screen.getByText('Needs Confirmation')).toBeInTheDocument();
  });

  test('renders badges with .badge class without text truncation', () => {
    const { container } = render(
      <ResultsDashboard result={mockResult} onReset={onReset} onEdit={onEdit} />
    );

    const badges = container.querySelectorAll('.badge');
    expect(badges.length).toBeGreaterThan(0);

    // Verified / Unverified badges
    const verifiedBadges = screen.getAllByLabelText(/Verified|Not independently verified/i);
    expect(verifiedBadges.length).toBeGreaterThan(0);
    verifiedBadges.forEach((badge) => {
      expect(badge.className).toContain('badge');
      expect(badge.textContent?.length).toBeGreaterThan(0);
    });
  });

  test('handles edit and reset user interactions', () => {
    render(<ResultsDashboard result={mockResult} onReset={onReset} onEdit={onEdit} />);

    const editBtn = screen.getByRole('button', { name: /Edit your request/i });
    const resetBtn = screen.getByRole('button', { name: /Start a new question/i });

    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
