/**
 * Profile Page Controller for Todo List Application
 * Manages user profile view and settings
 * PT Erajaya Swasembada
 */

class ProfileController {
  constructor() {
    this.isInitialized = false;
    this.elements = {};
    this.data = {
      user: null
    };
  }

  /**
   * Initialize profile page
   */
  async init() {
    if (this.isInitialized) return;

    this.bindElements();
    this.bindEvents();
    await this.loadUserProfile();
    
    this.isInitialized = true;
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.elements = {
      // Profile display elements
      profileName: Utils.getElementById('profile-name'),
      profileEmail: Utils.getElementById('profile-email'),
      
      // Profile form
      profileForm: Utils.getElementById('profile-form'),
      profileUsernameInput: Utils.getElementById('profile-username'),
      profileEmailInput: Utils.getElementById('profile-email-input'),
      
      // Navigation user elements
      userNameNav: Utils.getElementById('user-name'),
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Profile form submission
    if (this.elements.profileForm) {
      Utils.addEventListener(this.elements.profileForm, 'submit', (e) => {
        e.preventDefault();
        this.handleProfileFormSubmit();
      });
    }

    // Listen for auth changes
    authManager.onAuthChange((authState) => {
      if (authState.type === 'userUpdate') {
        this.data.user = authState.user;
        this.renderProfile();
      }
    });

    // Real-time form validation
    if (this.elements.profileEmailInput) {
      Utils.addEventListener(this.elements.profileEmailInput, 'blur', () => {
        this.validateEmailField();
      });

      Utils.addEventListener(this.elements.profileEmailInput, 'input', 
        Utils.debounce(() => {
          this.validateEmailField();
        }, 500)
      );
    }
  }

  /**
   * Load user profile data
   */
  async loadUserProfile() {
    try {
      this.showLoading();
      
      // Get user from auth manager first
      this.data.user = authManager.getUser();
      
      // If no user in auth manager, fetch from API
      if (!this.data.user) {
        this.data.user = await apiService.getUserProfile();
        authManager.updateUser(this.data.user);
      }

      this.renderProfile();
      
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toastManager.error('Error', 'Failed to load profile');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Render profile information
   */
  renderProfile() {
    if (!this.data.user) return;

    // Update profile display
    if (this.elements.profileName) {
      const displayName = this.data.user.username || this.data.user.email || 'User';
      Utils.setText(this.elements.profileName, displayName);
    }

    if (this.elements.profileEmail) {
      Utils.setText(this.elements.profileEmail, this.data.user.email || '');
    }

    // Update navigation
    if (this.elements.userNameNav) {
      const displayName = this.data.user.username || 
        (this.data.user.email ? this.data.user.email.split('@')[0] : 'User');
      Utils.setText(this.elements.userNameNav, displayName);
    }

    // Populate form fields
    if (this.elements.profileUsernameInput) {
      this.elements.profileUsernameInput.value = this.data.user.username || '';
    }

    if (this.elements.profileEmailInput) {
      this.elements.profileEmailInput.value = this.data.user.email || '';
    }
  }

  /**
   * Handle profile form submission
   */
  async handleProfileFormSubmit() {
    const form = this.elements.profileForm;
    if (!form) return;

    try {
      // Validate form
      if (!this.validateForm()) {
        return;
      }

      this.showFormLoading();
      
      const formData = Utils.getFormData(form);
      
      // Remove empty fields
      Object.keys(formData).forEach(key => {
        if (formData[key] === '') {
          delete formData[key];
        }
      });

      // Update profile via API
      const updatedUser = await apiService.updateUserProfile(formData);
      
      // Update auth manager
      authManager.updateUser(updatedUser);
      
      // Update local data
      this.data.user = updatedUser;
      
      // Re-render profile
      this.renderProfile();
      
      toastManager.success('Success', CONFIG.SUCCESS.PROFILE_UPDATED);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      toastManager.error('Error', error.message || 'Failed to update profile');
    } finally {
      this.hideFormLoading();
    }
  }

  /**
   * Validate profile form
   * @returns {boolean} - Validation result
   */
  validateForm() {
    let isValid = true;

    // Validate email
    if (!this.validateEmailField()) {
      isValid = false;
    }

    // Validate username (if provided)
    if (this.elements.profileUsernameInput) {
      const username = this.elements.profileUsernameInput.value.trim();
      if (username && username.length < 3) {
        this.showFieldError(this.elements.profileUsernameInput, 'Username must be at least 3 characters long');
        isValid = false;
      } else {
        this.clearFieldError(this.elements.profileUsernameInput);
      }
    }

    return isValid;
  }

  /**
   * Validate email field
   * @returns {boolean} - Validation result
   */
  validateEmailField() {
    if (!this.elements.profileEmailInput) return true;

    const email = this.elements.profileEmailInput.value.trim();
    
    if (!email) {
      this.showFieldError(this.elements.profileEmailInput, 'Email is required');
      return false;
    }

    if (!Utils.isValidEmail(email)) {
      this.showFieldError(this.elements.profileEmailInput, 'Please enter a valid email address');
      return false;
    }

    this.clearFieldError(this.elements.profileEmailInput);
    return true;
  }

  /**
   * Show field validation error
   * @param {HTMLElement} field - Form field element
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    if (!field) return;

    // Add error class
    Utils.addClass(field, 'is-invalid');
    Utils.removeClass(field, 'is-valid');

    // Find or create error message element
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      field.parentNode.appendChild(errorElement);
    }

    Utils.setText(errorElement, message);
  }

  /**
   * Clear field validation error
   * @param {HTMLElement} field - Form field element
   */
  clearFieldError(field) {
    if (!field) return;

    // Remove error class
    Utils.removeClass(field, 'is-invalid');
    Utils.addClass(field, 'is-valid');

    // Remove error message
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    // Show skeleton loading in profile card
    const profileCard = Utils.querySelector('.profile-card');
    if (profileCard) {
      Utils.addClass(profileCard, 'loading');
    }

    // Show skeleton in form fields
    if (this.elements.profileUsernameInput) {
      this.elements.profileUsernameInput.value = '';
      this.elements.profileUsernameInput.placeholder = 'Loading...';
    }

    if (this.elements.profileEmailInput) {
      this.elements.profileEmailInput.value = '';
      this.elements.profileEmailInput.placeholder = 'Loading...';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const profileCard = Utils.querySelector('.profile-card');
    if (profileCard) {
      Utils.removeClass(profileCard, 'loading');
    }

    // Restore placeholders
    if (this.elements.profileUsernameInput) {
      this.elements.profileUsernameInput.placeholder = 'Enter username';
    }

    if (this.elements.profileEmailInput) {
      this.elements.profileEmailInput.placeholder = 'Enter email';
    }
  }

  /**
   * Show form loading state
   */
  showFormLoading() {
    const submitBtn = this.elements.profileForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
      submitBtn.setAttribute('data-original-text', originalText);
    }

    // Disable form fields
    const inputs = this.elements.profileForm?.querySelectorAll('input, select, textarea');
    inputs?.forEach(input => {
      input.disabled = true;
    });
  }

  /**
   * Hide form loading state
   */
  hideFormLoading() {
    const submitBtn = this.elements.profileForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      const originalText = submitBtn.getAttribute('data-original-text');
      if (originalText) {
        submitBtn.innerHTML = originalText;
        submitBtn.removeAttribute('data-original-text');
      }
    }

    // Enable form fields
    const inputs = this.elements.profileForm?.querySelectorAll('input, select, textarea');
    inputs?.forEach(input => {
      input.disabled = false;
    });
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} - User statistics
   */
  async getUserStatistics() {
    try {
      const [lists, tasks] = await Promise.all([
        apiService.getLists(),
        apiService.getTasks()
      ]);

      const completedTasks = tasks.filter(task => task.completed || task.is_completed).length;
      const pendingTasks = tasks.length - completedTasks;

      return {
        totalLists: lists.length,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        joinDate: this.data.user?.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      return null;
    }
  }

  /**
   * Export user data
   * @returns {Promise<Object>} - Exportable user data
   */
  async exportUserData() {
    try {
      const [lists, tasks, stats] = await Promise.all([
        apiService.getLists(),
        apiService.getTasks(),
        this.getUserStatistics()
      ]);

      // Get tasks for each list
      const listsWithTasks = await Promise.all(
        lists.map(async (list) => {
          try {
            const listTasks = await apiService.getListTasks(list.id);
            return { ...list, tasks: listTasks };
          } catch (error) {
            return { ...list, tasks: [] };
          }
        })
      );

      return {
        user: this.data.user,
        statistics: stats,
        lists: listsWithTasks,
        tasks,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  /**
   * Download user data as JSON
   */
  async downloadUserData() {
    try {
      this.showLoading();
      
      const userData = await this.exportUserData();
      const dataStr = JSON.stringify(userData, null, 2);
      const fileName = `todo-data-${new Date().toISOString().split('T')[0]}.json`;
      
      Utils.downloadFile(dataStr, fileName, 'application/json');
      
      toastManager.success('Success', 'Data exported successfully');
      
    } catch (error) {
      console.error('Failed to download user data:', error);
      toastManager.error('Error', 'Failed to export data');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Change password (placeholder for future implementation)
   */
  async changePassword(currentPassword, newPassword) {
    try {
      // This would be implemented when password change API is available
      throw new Error('Password change not yet implemented');
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Delete account (placeholder for future implementation)
   */
  async deleteAccount() {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your lists and tasks.'
    );
    
    if (!confirmed) return;

    try {
      // This would be implemented when account deletion API is available
      throw new Error('Account deletion not yet implemented');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }

  /**
   * Refresh profile data
   */
  async refreshProfile() {
    await this.loadUserProfile();
  }

  /**
   * Destroy profile controller
   */
  destroy() {
    this.isInitialized = false;
  }

  /**
   * Get current profile data
   * @returns {Object} - Current profile data
   */
  getData() {
    return {
      user: this.data.user
    };
  }
}

/**
 * Global profile controller instance
 */
const profileController = new ProfileController();

// Make it globally accessible
window.profileController = profileController;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfileController, profileController };
}
