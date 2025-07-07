/**
 * Authentication Manager for Todo List Application
 * Handles user authentication, session management, and auth state
 * PT Erajaya Swasembada
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.isAuthenticated = false;
    this.authCallbacks = [];
    
    // Initialize from stored data
    this.init();
  }

  /**
   * Initialize authentication state from storage
   */
  init() {
    const storedToken = StorageUtils.get(CONFIG.STORAGE.TOKEN);
    const storedUser = StorageUtils.get(CONFIG.STORAGE.USER);

    if (storedToken && storedUser) {
      this.token = storedToken;
      this.currentUser = storedUser;
      this.isAuthenticated = true;
    }

    // Check token validity
    if (this.isAuthenticated) {
      this.validateToken();
    }
  }

  /**
   * Validate current token
   */
  async validateToken() {
    try {
      const user = await apiService.getUserProfile();
      this.updateUser(user);
    } catch (error) {
      console.error('Token validation failed:', error);
      this.logout(false);
    }
  }

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} - Registration result
   */
  async register(userData) {
    try {
      const response = await apiService.register(userData);
      
      if (response.access_token) {
        this.setAuthData(response.access_token, response.user || response);
        this.notifyAuthChange('register');
        return { success: true, user: this.currentUser };
      }
      
      throw new Error('Invalid registration response');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} - Login result
   */
  async login(credentials) {
    try {
      const response = await apiService.login(credentials);
      
      if (response.access_token) {
        this.setAuthData(response.access_token, response.user || response);
        this.notifyAuthChange('login');
        return { success: true, user: this.currentUser };
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * @param {boolean} callAPI - Whether to call API logout endpoint
   */
  async logout(callAPI = true) {
    try {
      if (callAPI && this.isAuthenticated) {
        // Call API logout endpoint if it exists
        // await apiService.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
      this.notifyAuthChange('logout');
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<boolean>} - Success status
   */
  async refreshToken() {
    try {
      const response = await apiService.refreshToken();
      
      if (response.access_token) {
        this.token = response.access_token;
        StorageUtils.set(CONFIG.STORAGE.TOKEN, this.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout(false);
      return false;
    }
  }

  /**
   * Set authentication data
   * @param {string} token - Access token
   * @param {Object} user - User data
   */
  setAuthData(token, user) {
    this.token = token;
    this.currentUser = user;
    this.isAuthenticated = true;

    // Store in localStorage
    StorageUtils.set(CONFIG.STORAGE.TOKEN, token);
    StorageUtils.set(CONFIG.STORAGE.USER, user);
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    this.token = null;
    this.currentUser = null;
    this.isAuthenticated = false;

    // Clear from localStorage
    StorageUtils.remove(CONFIG.STORAGE.TOKEN);
    StorageUtils.remove(CONFIG.STORAGE.USER);
  }

  /**
   * Update user data
   * @param {Object} userData - Updated user data
   */
  updateUser(userData) {
    if (this.isAuthenticated) {
      this.currentUser = { ...this.currentUser, ...userData };
      StorageUtils.set(CONFIG.STORAGE.USER, this.currentUser);
      this.notifyAuthChange('userUpdate');
    }
  }

  /**
   * Get current user
   * @returns {Object|null} - Current user data
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Get current token
   * @returns {string|null} - Current access token
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isLoggedIn() {
    return this.isAuthenticated;
  }

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} - Permission status
   */
  hasPermission(permission) {
    if (!this.isAuthenticated || !this.currentUser) {
      return false;
    }

    // Add permission checking logic here if needed
    // For now, authenticated users have all permissions
    return true;
  }

  /**
   * Add authentication state change callback
   * @param {Function} callback - Callback function
   */
  onAuthChange(callback) {
    if (typeof callback === 'function') {
      this.authCallbacks.push(callback);
    }
  }

  /**
   * Remove authentication state change callback
   * @param {Function} callback - Callback function to remove
   */
  offAuthChange(callback) {
    const index = this.authCallbacks.indexOf(callback);
    if (index > -1) {
      this.authCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all callbacks of authentication change
   * @param {string} type - Type of change ('login', 'logout', 'register', 'userUpdate')
   */
  notifyAuthChange(type) {
    const authState = {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      token: this.token,
      type
    };

    this.authCallbacks.forEach(callback => {
      try {
        callback(authState);
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    });

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('auth:change', {
      detail: authState
    }));
  }

  /**
   * Handle password validation for registration/change
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result
   */
  validatePassword(password) {
    return Utils.validatePassword(password);
  }

  /**
   * Handle email validation
   * @param {string} email - Email to validate
   * @returns {boolean} - Validation result
   */
  validateEmail(email) {
    return Utils.isValidEmail(email);
  }

  /**
   * Generate password strength indicator
   * @param {string} password - Password to check
   * @returns {Object} - Strength information
   */
  getPasswordStrength(password) {
    if (!password) {
      return { strength: 0, label: 'No password', color: '#DC3545' };
    }

    let score = 0;
    const checks = {
      length: password.length >= CONFIG.VALIDATION.PASSWORD.MIN_LENGTH,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
    };

    // Calculate score
    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    // Additional points for length
    if (password.length >= 12) score += 0.5;
    if (password.length >= 16) score += 0.5;

    // Determine strength level
    let strength, label, color;
    
    if (score < 2) {
      strength = 1;
      label = 'Very Weak';
      color = '#DC3545';
    } else if (score < 3) {
      strength = 2;
      label = 'Weak';
      color = '#FF6B35';
    } else if (score < 4) {
      strength = 3;
      label = 'Medium';
      color = '#FFC107';
    } else if (score < 5) {
      strength = 4;
      label = 'Strong';
      color = '#28A745';
    } else {
      strength = 5;
      label = 'Very Strong';
      color = '#0066CC';
    }

    return {
      strength,
      label,
      color,
      score,
      checks,
      percentage: Math.min((score / 5) * 100, 100)
    };
  }

  /**
   * Auto-logout after inactivity
   * @param {number} minutes - Minutes of inactivity before logout
   */
  setupAutoLogout(minutes = 30) {
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.logout();
        // Show notification about auto-logout
        if (window.toastManager) {
          window.toastManager.warning('Auto Logout', 'You were logged out due to inactivity.');
        }
      }, minutes * 60 * 1000);
    };

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initial timer setup
    if (this.isAuthenticated) {
      resetTimer();
    }

    // Reset timer on auth change
    this.onAuthChange((authState) => {
      if (authState.isAuthenticated) {
        resetTimer();
      } else {
        clearTimeout(inactivityTimer);
      }
    });
  }

  /**
   * Check if user session is expired
   * @returns {boolean} - True if session is expired
   */
  isSessionExpired() {
    if (!this.token || !this.currentUser) {
      return true;
    }

    // You can add JWT token expiration checking here
    // For now, we rely on API calls to detect expired tokens
    return false;
  }

  /**
   * Force re-authentication
   */
  forceReauth() {
    this.clearAuthData();
    this.notifyAuthChange('forceReauth');
  }
}

/**
 * Singleton auth manager instance
 */
const authManager = new AuthManager();

// Make it globally accessible
window.authManager = authManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, authManager };
}
