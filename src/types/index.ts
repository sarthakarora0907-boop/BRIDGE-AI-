// Bridge AI - Core Type Definitions
// These types define the strict contract between the AI service and the UI

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';

export type ProblemCategory =
  | 'health'
  | 'travel'
  | 'documents'
  | 'public-services'
  | 'finance'
  | 'weather'
  | 'news'
  | 'legal'
  | 'emergency'
  | 'general';

export interface Resource {
  title: string;
  description: string;
  url?: string;
  type: 'official' | 'informational' | 'emergency';
}

export interface ActionStep {
  step: number;
  title: string;
  description: string;
  isUrgent?: boolean;
}

export interface ExtractedInformation {
  intent: string;
  entities: string[];
  dates: string[];
  locations: string[];
  constraints: string[];
  missingInformation: string[];
}

export interface VerifiedInformation {
  item: string;
  source: string;
  isVerified: boolean;
  verificationNote: string;
}

/**
 * The canonical structured response from Gemini AI.
 * Every field has a safe fallback in the UI layer.
 */
export interface BridgeAIResponse {
  // Core understanding
  intent: string;
  summary: string;
  category: ProblemCategory;
  urgency: UrgencyLevel;

  // Structured extraction
  extracted_information: ExtractedInformation;

  // Trust & transparency
  verified_information: VerifiedInformation[];
  uncertain_information: string[];
  assumptions: string[];

  // Actionable output
  recommended_action: string;
  steps: ActionStep[];

  // Safety
  warnings: string[];

  // Resources
  resources: Resource[];

  // Confidence
  confidence: ConfidenceLevel;
  confidence_explanation: string;
}

/**
 * The user's input to the Bridge AI system.
 */
export interface BridgeAIInput {
  text: string;
  imageBase64?: string;
  imageMimeType?: string;
  category?: ProblemCategory;
}

/**
 * API request/response wrapper types
 */
export interface APIRequest {
  input: BridgeAIInput;
}

export interface APIResponse {
  success: true;
  data: BridgeAIResponse;
}

export interface APIError {
  success: false;
  error: string;
  code: 'INVALID_INPUT' | 'AI_ERROR' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'MISSING_CONFIG';
}

export type APIResult = APIResponse | APIError;

/**
 * UI state types
 */
export type AppState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStep {
  message: string;
  duration: number;
}

export const LOADING_STEPS: LoadingStep[] = [
  { message: 'Understanding your request…', duration: 1500 },
  { message: 'Structuring the problem…', duration: 2000 },
  { message: 'Analysing key information…', duration: 2000 },
  { message: 'Preparing your next steps…', duration: 1500 },
];

/**
 * Category metadata for UI display
 */
export interface CategoryInfo {
  id: ProblemCategory;
  label: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'general', label: 'General', icon: '🌐', description: 'Any other problem' },
  { id: 'health', label: 'Health', icon: '🏥', description: 'Medical information & guidance' },
  { id: 'travel', label: 'Travel & Mobility', icon: '🚦', description: 'Routes, transport & planning' },
  { id: 'documents', label: 'Documents', icon: '📄', description: 'Forms, notices & paperwork' },
  { id: 'public-services', label: 'Public Services', icon: '🏛️', description: 'Government & civic services' },
  { id: 'finance', label: 'Finance & Bills', icon: '💳', description: 'Bills, payments & finances' },
  { id: 'weather', label: 'Weather Planning', icon: '🌦️', description: 'Weather-related decisions' },
  { id: 'legal', label: 'Legal', icon: '⚖️', description: 'Legal guidance & rights' },
  { id: 'emergency', label: 'Emergency', icon: '🆘', description: 'Urgent situations' },
  { id: 'news', label: 'Understanding News', icon: '📰', description: 'Making sense of information' },
];
