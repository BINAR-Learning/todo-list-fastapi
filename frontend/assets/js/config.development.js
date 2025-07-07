/**
 * Development Configuration
 * PT Erajaya Swasembada Todo List Application
 */

const CONFIG = {
  // Environment
  ENVIRONMENT: 'development',
  
  // API Configuration
  API: {
    BASE_URL: 'http://localhost:8000/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },
  
  // Authentication
  AUTH: {
    TOKEN_KEY: 'todo_app_token',
    USER_KEY: 'todo_app_user',
    TOKEN_EXPIRY_BUFFER: 300000 // 5 minutes
  },
  
  // Storage
  STORAGE: {
    PREFIX: 'todo_app_',
    THEME: 'todo_app_theme',
    LANGUAGE: 'todo_app_language'
  },
  
  // UI Configuration
  UI: {
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    PAGE_SIZE: 20,
    MAX_UPLOAD_SIZE: 5242880 // 5MB
  },
  
  // Debug Configuration (enabled for development)
  DEBUG: {
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: true,
    LOG_API_ERRORS: true,
    ENABLE_CONSOLE_LOGS: true,
    SHOW_PERFORMANCE_METRICS: true,
    ENABLE_MOCK_DATA: false
  },
  
  // Features (can be disabled/enabled per environment)
  FEATURES: {
    DARK_THEME: true,
    OFFLINE_SUPPORT: false,
    PUSH_NOTIFICATIONS: false,
    ANALYTICS: false,
    ERROR_REPORTING: false
  },
  
  // Performance
  PERFORMANCE: {
    ENABLE_CACHING: false,
    CACHE_DURATION: 300000, // 5 minutes
    LAZY_LOADING: false
  },
  
  // Security
  SECURITY: {
    ENABLE_CSP: false,
    STRICT_TRANSPORT_SECURITY: false
  }
};
