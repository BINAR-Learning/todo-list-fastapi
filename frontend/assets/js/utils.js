/**
 * Utility functions for the Todo List Application
 * PT Erajaya Swasembada
 */

/**
 * Utility class containing helper functions
 */
class Utils {
  /**
   * Get element by ID with error handling
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} - DOM element or null if not found
   */
  static getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with ID '${id}' not found`);
    }
    return element;
  }

  /**
   * Get elements by class name
   * @param {string} className - Class name
   * @returns {NodeList} - NodeList of elements
   */
  static getElementsByClassName(className) {
    return document.getElementsByClassName(className);
  }

  /**
   * Get element by query selector
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} - DOM element or null if not found
   */
  static querySelector(selector) {
    return document.querySelector(selector);
  }

  /**
   * Get elements by query selector
   * @param {string} selector - CSS selector
   * @returns {NodeList} - NodeList of elements
   */
  static querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Add event listener with error handling
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   * @param {Object} options - Event options
   */
  static addEventListener(element, event, callback, options = {}) {
    if (!element) {
      console.warn('Cannot add event listener: element is null');
      return;
    }
    element.addEventListener(event, callback, options);
  }

  /**
   * Remove event listener
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   */
  static removeEventListener(element, event, callback) {
    if (!element) return;
    element.removeEventListener(event, callback);
  }

  /**
   * Add class to element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to add
   */
  static addClass(element, className) {
    if (element && className) {
      element.classList.add(className);
    }
  }

  /**
   * Remove class from element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to remove
   */
  static removeClass(element, className) {
    if (element && className) {
      element.classList.remove(className);
    }
  }

  /**
   * Toggle class on element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to toggle
   * @returns {boolean} - True if class was added, false if removed
   */
  static toggleClass(element, className) {
    if (element && className) {
      return element.classList.toggle(className);
    }
    return false;
  }

  /**
   * Check if element has class
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to check
   * @returns {boolean} - True if element has class
   */
  static hasClass(element, className) {
    if (element && className) {
      return element.classList.contains(className);
    }
    return false;
  }

  /**
   * Set text content safely
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text content
   */
  static setText(element, text) {
    if (element) {
      element.textContent = text || '';
    }
  }

  /**
   * Set HTML content safely
   * @param {HTMLElement} element - Target element
   * @param {string} html - HTML content
   */
  static setHTML(element, html) {
    if (element) {
      element.innerHTML = html || '';
    }
  }

  /**
   * Get form data as object
   * @param {HTMLFormElement} form - Form element
   * @returns {Object} - Form data object
   */
  static getFormData(form) {
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }

  /**
   * Reset form and remove validation classes
   * @param {HTMLFormElement} form - Form element
   */
  static resetForm(form) {
    if (!form) return;
    
    form.reset();
    
    // Remove validation classes
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.classList.remove('is-valid', 'is-invalid');
    });
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} - True if valid email
   */
  static isValidEmail(email) {
    return CONFIG.VALIDATION.EMAIL.PATTERN.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password
   * @returns {Object} - Validation result
   */
  static validatePassword(password) {
    const rules = CONFIG.VALIDATION.PASSWORD;
    const result = {
      isValid: true,
      errors: []
    };

    if (!password || password.length < rules.MIN_LENGTH) {
      result.isValid = false;
      result.errors.push(`Password must be at least ${rules.MIN_LENGTH} characters long`);
    }

    if (rules.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one uppercase letter');
    }

    if (rules.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one lowercase letter');
    }

    if (rules.REQUIRE_NUMBERS && !/\d/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must contain at least one number');
    }

    if (rules.REQUIRE_SPECIAL) {
      const specialChars = rules.SPECIAL_CHARS;
      const hasSpecial = specialChars.split('').some(char => password.includes(char));
      if (!hasSpecial) {
        result.isValid = false;
        result.errors.push('Password must contain at least one special character');
      }
    }

    return result;
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @param {string} format - Format type ('date' or 'datetime')
   * @returns {string} - Formatted date string
   */
  static formatDate(date, format = 'date') {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const options = format === 'datetime' 
      ? { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }
      : { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        };

    return dateObj.toLocaleDateString('en-US', options);
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {string|Date} date - Date to format
   * @returns {string} - Relative time string
   */
  static formatRelativeTime(date) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return this.formatDate(dateObj);
  }

  /**
   * Check if date is overdue
   * @param {string|Date} date - Date to check
   * @returns {boolean} - True if overdue
   */
  static isOverdue(date) {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    return dateObj < now;
  }

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} - Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} - Throttled function
   */
  static throttle(func, delay) {
    let lastExecuted = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastExecuted >= delay) {
        lastExecuted = now;
        func.apply(this, args);
      }
    };
  }

  /**
   * Generate unique ID
   * @returns {string} - Unique ID
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Sanitize HTML to prevent XSS
   * @param {string} html - HTML string
   * @returns {string} - Sanitized HTML
   */
  static sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} - Success status
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  }

  /**
   * Download data as file
   * @param {string} data - Data to download
   * @param {string} filename - File name
   * @param {string} type - MIME type
   */
  static downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Create a download link for data
   * @param {string} data - Data to download
   * @param {string} filename - File name
   * @param {string} type - MIME type
   */
  static downloadData(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export lists and tasks to JSON
   * @param {Array} lists - Array of lists with tasks
   * @returns {string} - JSON string
   */
  static exportToJSON(lists) {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      lists: lists
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import data from JSON
   * @param {string} jsonString - JSON data string
   * @returns {Object} - Parsed data object
   */
  static importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate structure
      if (!data.lists || !Array.isArray(data.lists)) {
        throw new Error('Invalid data format: missing lists array');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to import JSON:', error);
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Check if device is mobile
   * @returns {boolean} - True if mobile device
   */
  static isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if device is tablet
   * @returns {boolean} - True if tablet device
   */
  static isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  /**
   * Check if device is desktop
   * @returns {boolean} - True if desktop device
   */
  static isDesktop() {
    return window.innerWidth > 1024;
  }

  /**
   * Get device type
   * @returns {string} - Device type: 'mobile', 'tablet', or 'desktop'
   */
  static getDeviceType() {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  }

  /**
   * Check if user prefers dark mode
   * @returns {boolean} - True if dark mode preferred
   */
  static prefersDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Check if user prefers reduced motion
   * @returns {boolean} - True if reduced motion preferred
   */
  static prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get browser information
   * @returns {Object} - Browser info object
   */
  static getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const browser = {
      name: 'Unknown',
      version: 'Unknown',
      mobile: this.isMobile()
    };

    if (userAgent.indexOf('Chrome') > -1) {
      browser.name = 'Chrome';
      browser.version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browser.name = 'Firefox';
      browser.version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser.name = 'Safari';
      browser.version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Edge') > -1) {
      browser.name = 'Edge';
      browser.version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    return browser;
  }

  /**
   * Generate a comprehensive application health report
   * @returns {Object} - Health report object
   */
  static generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      application: {
        version: '1.0.0',
        environment: CONFIG?.ENVIRONMENT || 'unknown'
      },
      browser: this.getBrowserInfo(),
      device: {
        type: this.getDeviceType(),
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio || 1
      },
      preferences: {
        darkMode: this.prefersDarkMode(),
        reducedMotion: this.prefersReducedMotion()
      },
      storage: {
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        indexedDB: !!window.indexedDB
      },
      network: {
        online: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null
      },
      performance: {
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null
      }
    };

    return report;
  }

  /**
   * Print application health report
   */
  static printHealthReport() {
    const report = this.generateHealthReport();
    console.group('🏥 Application Health Report');
    console.log('📊 Report Generated:', report.timestamp);
    console.log('🖥️  Browser:', `${report.browser.name} ${report.browser.version}`);
    console.log('📱 Device:', `${report.device.type} (${report.device.screenSize})`);
    console.log('🌐 Network:', report.network.online ? 'Online' : 'Offline');
    if (report.performance.memory) {
      console.log('💾 Memory:', `${report.performance.memory.used}MB / ${report.performance.memory.total}MB`);
    }
    console.log('📋 Full Report:', report);
    console.groupEnd();
  }

  /**
   * Enable or disable API logging
   * @param {boolean} enable - Whether to enable logging
   */
  static setApiLogging(enable = true) {
    if (CONFIG.DEBUG) {
      CONFIG.DEBUG.LOG_API_REQUESTS = enable;
      CONFIG.DEBUG.LOG_API_RESPONSES = enable;
      CONFIG.DEBUG.LOG_API_ERRORS = enable;
      
      console.log(`🔧 API Logging ${enable ? 'enabled' : 'disabled'}`);
    } else {
      console.warn('⚠️ DEBUG configuration not found. Please ensure CONFIG.DEBUG is defined.');
    }
  }

  /**
   * Get current API logging status
   * @returns {Object} - Current logging settings
   */
  static getApiLoggingStatus() {
    if (CONFIG.DEBUG) {
      return {
        requests: CONFIG.DEBUG.LOG_API_REQUESTS,
        responses: CONFIG.DEBUG.LOG_API_RESPONSES,
        errors: CONFIG.DEBUG.LOG_API_ERRORS
      };
    }
    return null;
  }

  /**
   * Print API logging status
   */
  static printApiLoggingStatus() {
    const status = this.getApiLoggingStatus();
    if (status) {
      console.group('📡 API Logging Status');
      console.log('📤 Request Logging:', status.requests ? '✅ Enabled' : '❌ Disabled');
      console.log('📥 Response Logging:', status.responses ? '✅ Enabled' : '❌ Disabled');
      console.log('🚨 Error Logging:', status.errors ? '✅ Enabled' : '❌ Disabled');
      console.groupEnd();
    } else {
      console.warn('⚠️ API logging configuration not available');
    }
  }

}

// Storage utilities
class StorageUtils {
  /**
   * Get item from localStorage with JSON parsing
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} - Stored value or default
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage with JSON stringification
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} - Success status
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Success status
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   * @returns {boolean} - Success status
   */
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} - True if available
   */
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export utilities for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Utils, StorageUtils };
}
