// Bridge AI — Unit Tests: Voice Input Speech Recognition Handler

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputPanel from '@/components/InputPanel/InputPanel';

describe('InputPanel Voice Input', () => {
  let mockRecognitionInstance: {
    start: jest.Mock;
    stop: jest.Mock;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    onresult: ((event: unknown) => void) | null;
  };

  beforeEach(() => {
    mockRecognitionInstance = {
      start: jest.fn(),
      stop: jest.fn(),
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
    };

    const MockSpeechRecognition = jest.fn().mockImplementation(() => mockRecognitionInstance);
    // @ts-expect-error Mocking browser Web Speech API
    window.SpeechRecognition = MockSpeechRecognition;
  });

  afterEach(() => {
    // @ts-expect-error Cleanup mock
    delete window.SpeechRecognition;
  });

  test('rebuilds transcript cleanly across multiple interim onresult events without duplication', async () => {
    render(<InputPanel onSubmit={jest.fn()} isLoading={false} />);

    // Wait for voiceSupported state to be initialized via setTimeout(0)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const voiceBtn = screen.getByRole('button', { name: /Voice input/i });
    fireEvent.click(voiceBtn);

    expect(mockRecognitionInstance.start).toHaveBeenCalledTimes(1);

    // Simulate onstart
    act(() => {
      mockRecognitionInstance.onstart?.();
    });

    const textarea = screen.getByRole('textbox', { name: /Describe your problem/i }) as HTMLTextAreaElement;

    // First interim result: "I"
    act(() => {
      mockRecognitionInstance.onresult?.({
        results: [
          [{ transcript: 'I' }],
        ],
      });
    });
    expect(textarea.value).toBe('I');

    // Second interim result: "I have"
    act(() => {
      mockRecognitionInstance.onresult?.({
        results: [
          [{ transcript: 'I have' }],
        ],
      });
    });
    expect(textarea.value).toBe('I have');

    // Third interim result: "I have a headache"
    act(() => {
      mockRecognitionInstance.onresult?.({
        results: [
          [{ transcript: 'I have a headache' }],
        ],
      });
    });
    expect(textarea.value).toBe('I have a headache');

    // Verify it NEVER duplicated into "I I have I have a headache"
    expect(textarea.value).not.toContain('I I');
  });
});
