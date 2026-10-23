'use client';

import {
  useState, useRef, useCallback, useEffect, ChangeEvent, FormEvent,
} from 'react';
import {
  Mic, MicOff, ImagePlus, X, Send, AlertCircle, Loader2,
} from 'lucide-react';
import type { BridgeAIInput, ProblemCategory } from '@/types';
import { CATEGORIES } from '@/types';
import { validateText, validateImageFile, VALIDATION_CONSTANTS } from '@/lib/validation';
import { fileToBase64, isSpeechRecognitionSupported } from '@/lib/utils';
import styles from './InputPanel.module.css';

const EXAMPLE_PROMPTS = [
  { label: '🏥 Health', text: 'I have been feeling dizzy and short of breath for two days. What should I do?' },
  { label: '🚦 Travel', text: "I need to reach the hospital tomorrow morning and heavy rain is expected. I don't know the safest way." },
  { label: '📄 Document', text: 'I received a government notice saying I must respond within 14 days but I do not understand what they want from me.' },
  { label: '💳 Bill', text: 'My electricity bill suddenly doubled this month compared to last month. Can you help me understand why?' },
  { label: '🏛️ Public', text: 'I need to apply for a replacement passport urgently but I have never done this before.' },
  { label: '⚖️ Legal', text: 'My landlord is refusing to return my security deposit after I moved out. What are my rights?' },
  { label: '🌦️ Weather', text: 'There are flood warnings in my area. What should I do to prepare and stay safe?' },
  { label: '🆘 Urgent', text: 'I found an elderly person collapsed on the street and they are unresponsive. What do I do?' },
];

interface InputPanelProps {
  onSubmit: (input: BridgeAIInput, isDemo?: boolean) => void;
  isLoading: boolean;
}

// Browser SpeechRecognition type declarations
interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionResult {
  readonly 0: { transcript: string };
  readonly length: number;
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionEvent {
  readonly results: ISpeechRecognitionResultList;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

export default function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('general');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);
  const [charCount, setCharCount] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const baseTextRef = useRef('');
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVoiceSupported(isSpeechRecognitionSupported());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Listen for example selection events from the Examples section
  useEffect(() => {
    const handleExampleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>;
      if (customEvent.detail?.text) {
        const exampleText = customEvent.detail.text;
        setText(exampleText);
        setCharCount(exampleText.length);
        setTextError(null);
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('bridge-ai-example', handleExampleEvent);
    return () => window.removeEventListener('bridge-ai-example', handleExampleEvent);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 360)}px`;
    }
  }, [text]);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= VALIDATION_CONSTANTS.MAX_TEXT_LENGTH) {
      setText(val);
      setCharCount(val.length);
      if (textError) setTextError(null);
    }
  }, [textError]);

  const handleImageUpload = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.errors[0]?.message ?? 'Invalid file.');
      return;
    }
    setImageError(null);
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  }, []);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const removeImage = useCallback(() => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setImageError(null);
  }, [imagePreview]);

  const handleVoiceInput = useCallback(() => {
    if (!voiceSupported) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      baseTextRef.current = '';
      return;
    }

    const windowWithSpeech = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition ?? windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    // Preserve any existing text before speech begins
    const currentVal = textRef.current;
    baseTextRef.current = currentVal ? (currentVal.endsWith(' ') ? currentVal : `${currentVal} `) : '';

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      baseTextRef.current = '';
    };
    recognition.onerror = () => {
      setIsListening(false);
      baseTextRef.current = '';
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let speechTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        speechTranscript += event.results[i][0].transcript;
      }
      const newText = baseTextRef.current ? `${baseTextRef.current}${speechTranscript}` : speechTranscript;
      setText(newText);
      setCharCount(newText.length);
      setTextError(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceSupported, isListening]);

  const handleExampleClick = useCallback((exampleText: string) => {
    setText(exampleText);
    setCharCount(exampleText.length);
    setTextError(null);
    textareaRef.current?.focus();
  }, []);

  const triggerSubmit = useCallback(async (isDemo = false) => {
    const trimmedText = text.trim();
    const textValidation = validateText(trimmedText);
    if (!textValidation.valid) {
      setTextError(textValidation.errors[0]?.message ?? 'Invalid input.');
      textareaRef.current?.focus();
      return;
    }

    const input: BridgeAIInput = {
      text: trimmedText,
      category,
    };

    if (imageFile) {
      try {
        const base64 = await fileToBase64(imageFile);
        input.imageBase64 = base64;
        input.imageMimeType = imageFile.type;
      } catch {
        setImageError('Failed to process image. Please try again.');
        return;
      }
    }

    onSubmit(input, isDemo);
  }, [text, category, imageFile, onSubmit]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    triggerSubmit(false);
  }, [triggerSubmit]);

  const isOverLimit = charCount > VALIDATION_CONSTANTS.MAX_TEXT_LENGTH * 0.9;
  const isEmpty = text.trim().length === 0;

  return (
    <section id="input-area" className={styles.section} aria-labelledby="input-heading">
      <div className={`container ${styles.container}`}>
        <div className={styles.inputCard}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <h2 id="input-heading" className={styles.cardTitle}>
              Describe your problem
            </h2>
            <p className={styles.cardSubtitle}>
              Use your own words. No technical knowledge required.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Category Selector */}
            <div className={styles.categorySection}>
              <label htmlFor="category-select" className={styles.categoryLabel}>
                Category <span className={styles.optional}>(optional — AI will detect automatically)</span>
              </label>
              <div className={styles.categoryGrid} role="group" aria-label="Problem category">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.categoryChip} ${category === cat.id ? styles.categoryChipActive : ''}`}
                    onClick={() => setCategory(cat.id)}
                    aria-pressed={category === cat.id}
                    title={cat.description}
                  >
                    <span aria-hidden="true">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Textarea */}
            <div className={styles.textareaWrapper}>
              <label htmlFor="problem-input" className="sr-only">
                Describe your problem
              </label>
              <textarea
                id="problem-input"
                ref={textareaRef}
                className={`${styles.textarea} ${textError ? styles.textareaError : ''}`}
                placeholder="e.g. I received a letter from my local council and I don't understand what they want me to do. It mentions something about planning permission but I have never applied for anything…"
                value={text}
                onChange={handleTextChange}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                aria-describedby={textError ? 'text-error' : 'char-count'}
                aria-invalid={textError ? 'true' : 'false'}
                aria-required="true"
                disabled={isLoading}
                rows={5}
              />

              {/* Textarea footer */}
              <div className={styles.textareaFooter}>
                <div>
                  {textError && (
                    <p id="text-error" className="form-error" role="alert" aria-live="polite">
                      <AlertCircle size={14} aria-hidden="true" />
                      {textError}
                    </p>
                  )}
                </div>
                <span
                  id="char-count"
                  className={`${styles.charCount} ${isOverLimit ? styles.charCountWarn : ''}`}
                  aria-live="polite"
                  aria-label={`${charCount} of ${VALIDATION_CONSTANTS.MAX_TEXT_LENGTH} characters used`}
                >
                  {charCount.toLocaleString()} / {VALIDATION_CONSTANTS.MAX_TEXT_LENGTH.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Image upload area */}
            <div
              className={styles.imageUploadArea}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                <div className={styles.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Uploaded document preview" className={styles.previewImg} />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={removeImage}
                    aria-label="Remove uploaded image"
                  >
                    <X size={14} />
                  </button>
                  <span className={styles.imageFileName}>{imageFile?.name}</span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => fileInputRef.current?.click()}
                  aria-describedby={imageError ? 'image-error' : undefined}
                  disabled={isLoading}
                >
                  <ImagePlus size={16} aria-hidden="true" />
                  <span>Attach image</span>
                  <span className={styles.uploadHint}>JPEG, PNG, WebP · Max 5 MB</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="sr-only"
                aria-label="Upload image"
                tabIndex={-1}
              />
            </div>

            {imageError && (
              <p id="image-error" className="form-error" role="alert" aria-live="polite">
                <AlertCircle size={14} aria-hidden="true" />
                {imageError}
              </p>
            )}

            {/* Action bar */}
            <div className={styles.actionBar}>
              {/* Voice input */}
              <div className={styles.voiceSection}>
                {voiceSupported === false ? (
                  <p className={styles.voiceUnsupported} role="status">
                    <MicOff size={14} aria-hidden="true" />
                    Voice input unavailable in this browser. Please type your request.
                  </p>
                ) : (
                  <button
                    type="button"
                    className={`btn btn-ghost btn-sm ${isListening ? styles.listeningBtn : ''}`}
                    onClick={handleVoiceInput}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    aria-pressed={isListening}
                    disabled={isLoading}
                  >
                    {isListening ? (
                      <>
                        <span className={styles.listeningDot} aria-hidden="true" />
                        <Mic size={16} aria-hidden="true" />
                        <span>Listening…</span>
                      </>
                    ) : (
                      <>
                        <Mic size={16} aria-hidden="true" />
                        <span>Voice input</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className={styles.submitButtons}>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => triggerSubmit(true)}
                  disabled={isLoading || isEmpty}
                  aria-label="Try with instant simulation demo"
                  title="Instant structured demo response without requiring Gemini API key"
                >
                  <span>✦ Demo Simulation</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isLoading || isEmpty}
                  aria-label={isLoading ? 'Processing your request' : 'Analyse with Gemini AI'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} aria-hidden="true" className={styles.spinIcon} />
                      <span>Analysing…</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} aria-hidden="true" />
                      <span>Analyse with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Example prompts */}
          <div className={styles.examples}>
            <p className={styles.examplesLabel}>
              Try an example:
            </p>
            <div className={styles.exampleChips} role="list">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  className={styles.exampleChip}
                  onClick={() => handleExampleClick(ex.text)}
                  disabled={isLoading}
                  role="listitem"
                  aria-label={`Use example: ${ex.label}`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
