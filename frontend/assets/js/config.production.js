/**
 * Production Configuration
 * PT Erajaya Swasembada Todo List Application
 */

const CONFIG = {
  // Environment
  ENVIRONMENT: 'production',
  
  // API Configuration
  API: {
    BASE_URL: 'https://api.yourdomain.com/v1',
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
  
  // Debug Configuration (disabled for production)
  DEBUG: {
    LOG_API_REQUESTS: false,
    LOG_API_RESPONSES: false,
    LOG_API_ERRORS: false,
    ENABLE_CONSOLE_LOGS: false,
    SHOW_PERFORMANCE_METRICS: false,
    ENABLE_MOCK_DATA: false
  },
  
  // Features
  FEATURES: {
    DARK_THEME: true,
    OFFLINE_SUPPORT: true,
    PUSH_NOTIFICATIONS: true,
    ANALYTICS: true,
    ERROR_REPORTING: true
  },
  
  // Performance
  PERFORMANCE: {
    ENABLE_CACHING: true,
    CACHE_DURATION: 1800000, // 30 minutes
    LAZY_LOADING: true
  },
  
  // Security
  SECURITY: {
    ENABLE_CSP: true,
    STRICT_TRANSPORT_SECURITY: true
  }
};
