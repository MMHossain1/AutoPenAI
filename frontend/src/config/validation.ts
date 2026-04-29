/**
 * Validation rules and patterns
 * Reusable validation patterns for forms and API responses
 */

export const VALIDATION = {
  // Email validation
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },

  // Password validation
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    MESSAGE:
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
  },

  // Username validation
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    MESSAGE: 'Username can only contain letters, numbers, underscores, and hyphens',
  },

  // URL validation
  URL: {
    PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    MESSAGE: 'Please enter a valid URL',
  },
} as const;

// Helper functions
export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL.PATTERN.test(email);
};

export const validatePassword = (password: string): boolean => {
  return VALIDATION.PASSWORD.PATTERN.test(password);
};

export const validateUsername = (username: string): boolean => {
  return (
    username.length >= VALIDATION.USERNAME.MIN_LENGTH &&
    username.length <= VALIDATION.USERNAME.MAX_LENGTH &&
    VALIDATION.USERNAME.PATTERN.test(username)
  );
};

export const validateUrl = (url: string): boolean => {
  return VALIDATION.URL.PATTERN.test(url);
};
