// Bridge AI — Unit Tests: ResultsDashboard Component

import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsDashboard from '@/components/ResultsDashboard/ResultsDashboard';
import { generateDemoAnalysis } from '@/lib/demo-analyzer';

// Ensure the DOM is clean between every test
afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

// ─── Helper: stable mock result ───────────────────────────────────────────────

const makeMockResult = (text = 'I have been feeling dizzy. What should I do?') =>
  generateDemoAnalysis({ text });

// ─── Existing layout / grid tests ─────────────────────────────────────────────

describe('ResultsDashboard Layout & Grid Refactor', () => {
  const mockResult = makeMockResult();
  const onReset = jest.fn();
  const onEdit = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  test('renders container with max-w-5xl class for wide desktop layout', () => {
    render(<ResultsDashboard result={mockResult} onReset={onReset} onEdit={onEdit} />);
    const dashboard = screen.getByLabelText('Analysis results');
    expect(dashboard).toBeInTheDocument();
    expect(dashboard.className).toContain('max-w-5xl');
  });

  test('renders primary cards in a responsive grid with grid grid-cols-1 md:grid-cols-2 gap-4', () => {
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

    const verifiedBadges = screen.getAllByLabelText(/Verified|Not independently verified/i);
    expect(verifiedBadges.length).toBeGreaterThan(0);
    verifiedBadges.forEach((badge) => {
      expect(badge.className).toContain('badge');
      expect(badge.textContent?.length).toBeGreaterThan(0);
    });
  });

  test('handles edit and reset user interactions', () => {
    render(<ResultsDashboard result={mockResult} onReset={onReset} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: /Edit your request/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /Start a new question/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

// ─── Copy Result button tests ──────────────────────────────────────────────────

describe('ResultsDashboard — Copy Result button', () => {
  // Keep a reference so we can restore it precisely
  const originalClipboard = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(navigator),
    'clipboard'
  );

  const setClipboard = (value: unknown) => {
    Object.defineProperty(navigator, 'clipboard', {
      value,
      configurable: true,
      writable: true,
    });
  };

  const restoreClipboard = () => {
    if (originalClipboard) {
      Object.defineProperty(Object.getPrototypeOf(navigator), 'clipboard', originalClipboard);
    } else {
      try { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); }
      catch { /* ignore */ }
    }
  };

  afterEach(() => {
    restoreClipboard();
  });

  test('renders Copy buttons in header and bottom actions', () => {
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });
    render(
      <ResultsDashboard result={makeMockResult('passport stuck')} onReset={jest.fn()} onEdit={jest.fn()} />
    );
    const btns = screen.getAllByRole('button', { name: /Copy result to clipboard/i });
    expect(btns.length).toBeGreaterThanOrEqual(2);
  });

  test('shows "Copied!" after a successful clipboard write', async () => {
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });

    render(
      <ResultsDashboard result={makeMockResult('passport stuck')} onReset={jest.fn()} onEdit={jest.fn()} />
    );

    const [firstCopyBtn] = screen.getAllByRole('button', { name: /Copy result to clipboard/i });

    await act(async () => {
      fireEvent.click(firstCopyBtn);
      // Flush the resolved Promise from clipboard.writeText
      await Promise.resolve();
    });

    const copiedBtns = screen.getAllByRole('button', { name: /Result copied to clipboard/i });
    expect(copiedBtns.length).toBeGreaterThanOrEqual(1);
    expect(copiedBtns[0]).toHaveTextContent('Copied!');
  });

  test('shows "Copy failed" when clipboard API is absent and execCommand returns false', async () => {
    // Remove clipboard API entirely
    setClipboard(undefined);
    // jsdom's execCommand always returns false — that triggers the failure branch

    render(
      <ResultsDashboard result={makeMockResult('passport stuck')} onReset={jest.fn()} onEdit={jest.fn()} />
    );

    const [firstCopyBtn] = screen.getAllByRole('button', { name: /Copy result to clipboard/i });

    await act(async () => {
      fireEvent.click(firstCopyBtn);
      await Promise.resolve();
    });

    const failedBtns = screen.getAllByRole('button', { name: /Copy failed/i });
    expect(failedBtns.length).toBeGreaterThanOrEqual(1);
    expect(failedBtns[0]).toHaveTextContent('Copy failed');
  });

  test('resets to default label 2 s after a successful copy', async () => {
    jest.useFakeTimers();
    setClipboard({ writeText: jest.fn().mockResolvedValue(undefined) });

    render(
      <ResultsDashboard result={makeMockResult('passport stuck')} onReset={jest.fn()} onEdit={jest.fn()} />
    );

    const [firstCopyBtn] = screen.getAllByRole('button', { name: /Copy result to clipboard/i });

    await act(async () => {
      fireEvent.click(firstCopyBtn);
      await Promise.resolve();
    });

    // Confirm "Copied!" state
    expect(
      screen.getAllByRole('button', { name: /Result copied to clipboard/i }).length
    ).toBeGreaterThanOrEqual(1);

    // Advance + re-render
    act(() => { jest.advanceTimersByTime(2001); });

    // Back to default
    const defaultBtns = screen.getAllByRole('button', { name: /Copy result to clipboard/i });
    expect(defaultBtns.length).toBeGreaterThanOrEqual(1);

    jest.useRealTimers();
  });

  test('resets to default label 3 s after a copy failure', async () => {
    jest.useFakeTimers();
    setClipboard(undefined);

    render(
      <ResultsDashboard result={makeMockResult('passport stuck')} onReset={jest.fn()} onEdit={jest.fn()} />
    );

    const [firstCopyBtn] = screen.getAllByRole('button', { name: /Copy result to clipboard/i });

    await act(async () => {
      fireEvent.click(firstCopyBtn);
      await Promise.resolve();
    });

    // Confirm "Copy failed" state
    expect(
      screen.queryAllByRole('button', { name: /Copy failed/i }).length
    ).toBeGreaterThanOrEqual(1);

    // Advance + re-render
    act(() => { jest.advanceTimersByTime(3001); });

    // "Copy failed" buttons should be gone
    expect(screen.queryAllByRole('button', { name: /Copy failed/i }).length).toBe(0);
    // Default Copy buttons should be back
    expect(
      screen.queryAllByRole('button', { name: /Copy result to clipboard/i }).length
    ).toBeGreaterThanOrEqual(1);

    jest.useRealTimers();
  });
});

// ─── Download Result button tests ──────────────────────────────────────────────

describe('ResultsDashboard — Download Result button', () => {
  // Always provide working clipboard so no textarea fallback pollutes the body
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  test('renders Download buttons in header and bottom actions', () => {
    render(
      <ResultsDashboard result={makeMockResult('flooding near me')} onReset={jest.fn()} onEdit={jest.fn()} />
    );
    const dlBtns = screen.getAllByRole('button', { name: /Download result as text file/i });
    expect(dlBtns.length).toBeGreaterThanOrEqual(2);
  });

  test('creates a Blob URL and triggers an anchor click when Download is pressed', () => {
    const mockUrl = 'blob:http://localhost/mock-download';
    const createObjectURL = jest.fn().mockReturnValue(mockUrl);
    const revokeObjectURL = jest.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    // Spy on HTMLAnchorElement click so we don't need to stub appendChild
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <ResultsDashboard result={makeMockResult('flooding near me')} onReset={jest.fn()} onEdit={jest.fn()} />
    );

    const [firstDlBtn] = screen.getAllByRole('button', { name: /Download result as text file/i });
    fireEvent.click(firstDlBtn);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  test('generates a filename matching the bridge-ai-<slug>.txt pattern', () => {
    const mockUrl = 'blob:http://localhost/mock-download-2';
    global.URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
    global.URL.revokeObjectURL = jest.fn();

    // Capture the anchor element via a spy on the prototype
    let capturedDownload: string | null = null;
    let capturedHref: string | null = null;
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      capturedDownload = this.download;
      capturedHref = this.href;
    });

    render(
      <ResultsDashboard result={makeMockResult('flooding near me')} onReset={jest.fn()} onEdit={jest.fn()} />
    );

    const [firstDlBtn] = screen.getAllByRole('button', { name: /Download result as text file/i });
    fireEvent.click(firstDlBtn);

    expect(capturedDownload).toMatch(/^bridge-ai-.+\.txt$/);
    expect(capturedHref).toContain(mockUrl);
  });
});
