export const APP_CONFIG = {
  name: "LMS Platform",
  description: "AI-Powered Learning Management System",
  version: "1.0.0",
};

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  COMPANIONS: "/companions",
  SESSIONS: "/sessions",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
} as const;

export const COMPANION_LIMITS = {
  FREE: 3,
  BASIC: 10,
  PRO: -1, // unlimited
} as const;

export const DEFAULT_PAGINATION = {
  LIMIT: 10,
  PAGE: 1,
} as const;