/**
 * Application-wide constants
 * Use these throughout the app instead of hard-coding values
 */

// App meta information
export const APP_CONFIG = {
  NAME: 'AutoPenAI',
  DESCRIPTION: 'Automated penetration testing with AI',
  VERSION: '1.0.0',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  SCAN_TIMEOUT: 3600000, // 1 hour
  SESSION_TIMEOUT: 1800000, // 30 minutes
} as const;

// Scan statuses
export const SCAN_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type ScanStatus = typeof SCAN_STATUS[keyof typeof SCAN_STATUS];

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  LAST_SCAN_ID: 'last_scan_id',
} as const;

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful!',
    LOGOUT: 'Logged out successfully',
    SCAN_STARTED: 'Scan started successfully',
    SCAN_STOPPED: 'Scan stopped',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    SERVER: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Unauthorized. Please log in again.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
  },
} as const;
