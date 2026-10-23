// Bridge AI — Unit Tests: Header Component Navbar Layout & Alignments

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/Header/Header';
import { ThemeProvider } from '@/contexts/ThemeContext';

describe('Header Navbar Layout & Alignments', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('renders Your goal text container with hidden lg:block truncate max-w-xs classes when goal is provided', async () => {
    const goalText = 'Assess symptoms safely and determine appropriate medical care level';
    const { container } = render(
      <ThemeProvider>
        <Header goal={goalText} />
      </ThemeProvider>
    );

    // Wait for ThemeProvider mount timeout(0)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const goalContainer = container.querySelector('.truncate.max-w-xs');
    expect(goalContainer).toBeInTheDocument();
    expect(goalContainer?.className).toContain('hidden');
    expect(goalContainer?.className).toContain('lg:block');
    expect(goalContainer?.className).toContain('truncate');
    expect(goalContainer?.className).toContain('max-w-xs');
    expect(goalContainer).toHaveTextContent('Your goal:');
    expect(goalContainer).toHaveTextContent(goalText);

    // Verify navigation links like 'How It Works' are rendered alongside
    expect(screen.getByRole('link', { name: 'How It Works' })).toBeInTheDocument();
  });

  test('renders hidden lg:block truncate max-w-xs container when no goal prop is provided', async () => {
    const { container } = render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    );

    // Wait for ThemeProvider mount timeout(0)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const goalContainer = container.querySelector('.truncate.max-w-xs');
    expect(goalContainer).toBeInTheDocument();
    expect(goalContainer?.className).toContain('hidden');
    expect(goalContainer?.className).toContain('lg:block');
    expect(goalContainer?.className).toContain('truncate');
    expect(goalContainer?.className).toContain('max-w-xs');
    expect(screen.getByRole('link', { name: 'How It Works' })).toBeInTheDocument();
  });
});
