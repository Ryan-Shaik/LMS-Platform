// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  preferences: UserPreferences;
  bio?: string;
  learningGoals?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  voicePreference: 'male' | 'female';
  stylePreference: 'casual' | 'formal';
}

// Companion Types
export interface Companion {
  id: string;
  name: string;
  subject: Subject;
  topic: string;
  voice: string;
  style: string;
  duration: number;
  authorId: string;
  isPublic: boolean;
  vapiAssistantId?: string;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanionData {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
  isPublic?: boolean;
  instructions?: string;
}

// Session Types
export interface SessionHistory {
  id: string;
  userId: string;
  companionId: string;
  duration: number;
  completedAt: Date;
  feedback?: string;
  rating?: number;
}

// Subject Enum
export enum Subject {
  MATHS = "maths",
  LANGUAGE = "language", 
  SCIENCE = "science",
  HISTORY = "history",
  CODING = "coding",
  ECONOMICS = "economics",
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface CompanionFormData {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
  isPublic: boolean;
}

// Query Types
export interface GetCompanionsQuery {
  limit?: number;
  page?: number;
  subject?: string;
  topic?: string;
  authorId?: string;
}

export interface GetSessionsQuery {
  limit?: number;
  page?: number;
  userId?: string;
}

// Vapi Types
export interface VapiAssistant {
  id: string;
  name: string;
  instructions: string;
  voice: {
    provider: string;
    voiceId: string;
  };
  llm: {
    provider: string;
    model: string;
  };
  transcriber: {
    provider: string;
    model: string;
  };
}

export interface VapiCall {
  id: string;
  assistantId: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  transcript?: string;
}

export interface LearningSession {
  id: string;
  userId: string;
  companionId: string;
  vapiCallId?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  transcript?: string;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLearningSessionData {
  companionId: string;
  userId: string;
}

// Subscription Types
export enum SubscriptionTier {
  FREE = "free",
  BASIC = "basic",
  PRO = "pro",
  ENTERPRISE = "enterprise"
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  interval: 'month' | 'year';
  companionLimit: number;
  sessionLimit: number; // per month
  features: string[];
  isPopular?: boolean;
  clerkPlanId?: string | null; // Clerk subscription plan ID
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageStats {
  companionsUsed: number;
  companionLimit: number;
  sessionsUsed: number;
  sessionLimit: number;
  canCreateCompanion: boolean;
  canStartSession: boolean;
}

export interface UpgradePromptData {
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  feature: string;
  message: string;
}