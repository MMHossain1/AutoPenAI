/**
 * API Endpoints configuration
 * All backend API routes are defined here for easy maintenance
 */

import { env } from './env';

const BASE_URL = env.BACKEND_API_BASE_URL;

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH: `${BASE_URL}/auth/refresh`,
    VERIFY: `${BASE_URL}/auth/verify`,
  },

  // Scans endpoints
  SCANS: {
    LIST: `${BASE_URL}/scans`,
    GET: (id: string) => `${BASE_URL}/scans/${id}`,
    CREATE: `${BASE_URL}/scans`,
    UPDATE: (id: string) => `${BASE_URL}/scans/${id}`,
    DELETE: (id: string) => `${BASE_URL}/scans/${id}`,
    START: (id: string) => `${BASE_URL}/scans/${id}/start`,
    STOP: (id: string) => `${BASE_URL}/scans/${id}/stop`,
  },

  // Users endpoints
  USERS: {
    PROFILE: `${BASE_URL}/users/profile`,
    UPDATE: `${BASE_URL}/users/profile`,
    SETTINGS: `${BASE_URL}/users/settings`,
  },
} as const;
