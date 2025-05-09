// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Content Analysis Types
export interface AnalysisRequest {
  id: string;
  userId: string;
  content: string;
  contentType: 'article' | 'social_media' | 'criticism' | 'question' | 'other';
  source?: string;
  createdAt: string;
}

export interface AnalysisPoint {
  id: string;
  analysisId: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: string;
  isKey: boolean;
}

export interface AnalysisResult {
  id: string;
  requestId: string;
  summary: string;
  keyPoints: AnalysisPoint[];
  arguments: AnalysisPoint[];
  criticisms: AnalysisPoint[];
  positivePoints?: string[];
  negativePoints?: string[];
  suggestedResponses?: string[];
  generatedAt: string;
}

// Response Generation Types
export interface ResponseRequest {
  id: string;
  userId: string;
  analysisId: string;
  selectedPoints: string[]; // IDs of selected analysis points
  responseType: 'talking_point' | 'tweet' | 'detailed_response' | 'report';
  tone: 'factual' | 'persuasive' | 'defensive' | 'assertive';
  additionalInstructions?: string;
  createdAt: string;
}

export interface GeneratedResponse {
  id: string;
  requestId: string;
  content: string;
  summary?: string;
  format: 'text' | 'html' | 'markdown';
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalAnalyses: number;
  totalResponses: number;
  recentAnalyses: AnalysisRequest[];
  recentResponses: GeneratedResponse[];
}

// History Types
export interface HistoryItem {
  id: string;
  type: 'analysis' | 'response';
  title: string;
  summary: string;
  createdAt: string;
  itemId: string; // ID of the related analysis or response
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}