/**
 * Configuration settings for the Todo List Application
 * PT Erajaya Swasembada
 */

const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: 'http://localhost:3000',  // Change this to your API URL
    VERSION: 'v1',
    ENDPOINTS: {
      AUTH: {
        REGISTER: '/v1/auth/register',
        LOGIN: '/v1/auth/login',
        REFRESH: '/v1/auth/refresh'
      },
      USERS: {
        PROFILE: '/users/me',
        UPDATE: '/users/me'
      },
      LISTS: {
        BASE: '/v1/lists',
        BY_ID: (id) => `/v1/lists/${id}`,
        TASKS: (id) => `/v1/lists/${id}/tasks`
      },
      TASKS: {
        BASE: '/v1/tasks',
        BY_ID: (id) => `/v1/tasks/${id}`,
        COMPLETE: (id) => `/v1/tasks/${id}/complete`,
        INCOMPLETE: (id) => `/v1/tasks/${id}/incomplete`
      }
    },
	DEBUG: {
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: true,
    ENABLE_CONSOLE_LOGS: true
	}
  },

  // UI Configuration
  UI: {
    THEME: {
      DEFAULT: 'light',
      STORAGE_KEY: 'todo-app-theme'
    },
    PAGINATION: {
      DEFAULT_LIMIT: 20,
      MAX_LIMIT: 100
    },
    TOAST: {
      DURATION: 5000,
      MAX_TOASTS: 5
    },
    MODAL: {
      ANIMATION_DURATION: 300
    }
  },

  // Local Storage Keys
  STORAGE: {
    TOKEN: 'todo-app-token',
    USER: 'todo-app-user',
    THEME: 'todo-app-theme',
    PREFERENCES: 'todo-app-preferences'
  },

  // Application Features
  FEATURES: {
    DARK_MODE: true,
    NOTIFICATIONS: true,
    OFFLINE_SUPPORT: false,
    AUTO_SAVE: true
  },

  // Validation Rules
  VALIDATION: {
    PASSWORD: {
      MIN_LENGTH: 10,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SPECIAL: true,
      SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    },
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    TASK: {
      NAME_MAX_LENGTH: 200,
      DESCRIPTION_MAX_LENGTH: 1000
    },
    LIST: {
      NAME_MAX_LENGTH: 100,
      DESCRIPTION_MAX_LENGTH: 500
    }
  },

  // Date and Time Formats
  FORMATS: {
    DATE: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATE: 'MMM D, YYYY',
    DISPLAY_DATETIME: 'MMM D, YYYY h:mm A'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },

  // Error Messages
  ERRORS: {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Your session has expired. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    SERVER: 'Server error. Please try again later.',
    UNKNOWN: 'An unexpected error occurred. Please try again.'
  },

  // Success Messages
  SUCCESS: {
    LOGIN: 'Successfully logged in!',
    REGISTER: 'Account created successfully!',
    LOGOUT: 'Successfully logged out!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    LIST_CREATED: 'List created successfully!',
    LIST_UPDATED: 'List updated successfully!',
    LIST_DELETED: 'List deleted successfully!',
    TASK_CREATED: 'Task created successfully!',
    TASK_UPDATED: 'Task updated successfully!',
    TASK_DELETED: 'Task deleted successfully!',
    TASK_COMPLETED: 'Task marked as completed!',
    TASK_INCOMPLETED: 'Task marked as incomplete!'
  },

  // Priority Levels
  PRIORITY: {
    LOW: {
      value: 'low',
      label: 'Low',
      color: '#28A745'
    },
    MEDIUM: {
      value: 'medium',
      label: 'Medium',
      color: '#FFC107'
    },
    HIGH: {
      value: 'high',
      label: 'High',
      color: '#DC3545'
    }
  },

  // Animation Durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },

  // Debug Configuration
  DEBUG: {
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: true,
    LOG_API_ERRORS: true,
    ENABLE_CONSOLE_LOGS: true,
    SHOW_PERFORMANCE_METRICS: false,
    ENABLE_MOCK_DATA: false
  }
};

// Freeze the configuration object to prevent modifications
Object.freeze(CONFIG);

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
