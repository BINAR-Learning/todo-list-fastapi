/**
 * Main Application Controller for Todo List Application
 * Central controller that manages the entire application state and navigation
 * PT Erajaya Swasembada
 */

class TodoApp {
  constructor() {
    this.isInitialized = false;
    this.currentPage = 'auth';
    this.elements = {};
    this.controllers = {};
    this.modals = {};
    this.theme = 'light';
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Show loading spinner
      this.showGlobalLoading();

      // Initialize core components
      this.bindElements();
      this.initializeTheme();
      this.initializeModals();
      this.bindGlobalEvents();
      
      // Initialize auth manager
      await this.initializeAuth();
      
      // Initialize page controllers
      this.initializeControllers();
      
      // Set up navigation
      this.setupNavigation();
      
      // Handle initial route
      this.handleInitialRoute();
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showFatalError('Failed to initialize application. Please refresh the page.');
    } finally {
      this.hideGlobalLoading();
    }
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.elements = {
      // Global elements
      loadingSpinner: Utils.getElementById('loading-spinner'),
      
      // Navigation elements
      navbar: Utils.getElementById('navbar'),
      navLinks: Utils.querySelectorAll('.nav-link'),
      navToggle: Utils.getElementById('nav-toggle'),
      navMenu: Utils.getElementById('nav-menu'),
      userMenuBtn: Utils.getElementById('user-menu-btn'),
      userDropdown: Utils.getElementById('user-dropdown'),
      logoutBtn: Utils.getElementById('logout-btn'),
      themeToggle: Utils.getElementById('theme-toggle'),
      
      // Page containers
      authPage: Utils.getElementById('auth-page'),
      dashboardPage: Utils.getElementById('dashboard-page'),
      listsPage: Utils.getElementById('lists-page'),
      profilePage: Utils.getElementById('profile-page'),
      
      // Auth form elements
      loginForm: Utils.getElementById('login-form'),
      registerForm: Utils.getElementById('register-form'),
      showRegisterBtn: Utils.getElementById('show-register'),
      showLoginBtn: Utils.getElementById('show-login'),
      
      // Password toggle buttons
      passwordToggles: Utils.querySelectorAll('.password-toggle')
    };
  }

  /**
   * Initialize theme system
   */
  initializeTheme() {
    // Load saved theme
    const savedTheme = StorageUtils.get(CONFIG.STORAGE.THEME, 'light');
    this.setTheme(savedTheme);
  }

  /**
   * Initialize modal components
   */
  initializeModals() {
    // Register all modals with the modal manager
    this.modals = {
      listModal: modalManager.register('list-modal', {
        closeOnBackdrop: true,
        closeOnEscape: true
      }),
      listDetailModal: modalManager.register('list-detail-modal', {
        closeOnBackdrop: true,
        closeOnEscape: true
      }),
      taskModal: modalManager.register('task-modal', {
        closeOnBackdrop: true,
        closeOnEscape: true
      })
    };
  }

  /**
   * Initialize authentication
   */
  async initializeAuth() {
    // Set up auth change listener
    authManager.onAuthChange((authState) => {
      this.handleAuthChange(authState);
    });

    // Set up auto-logout (30 minutes)
    if (CONFIG.FEATURES.AUTO_SAVE) {
      authManager.setupAutoLogout(30);
    }

    // Check if user is already authenticated
    if (authManager.isLoggedIn()) {
      this.showAuthenticatedUI();
    } else {
      this.showUnauthenticatedUI();
    }
  }

  /**
   * Initialize page controllers
   */
  initializeControllers() {
    this.controllers = {
      dashboard: dashboardController,
      lists: listsController,
      profile: profileController
    };
  }

  /**
   * Set up navigation system
   */
  setupNavigation() {
    // Navigation link clicks
    this.elements.navLinks.forEach(link => {
      Utils.addEventListener(link, 'click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        if (page) {
          this.navigateTo(page);
        }
      });
    });

    // Mobile menu toggle
    if (this.elements.navToggle) {
      Utils.addEventListener(this.elements.navToggle, 'click', () => {
        this.toggleMobileMenu();
      });
    }

    // User menu toggle
    if (this.elements.userMenuBtn) {
      Utils.addEventListener(this.elements.userMenuBtn, 'click', (e) => {
        e.stopPropagation();
        this.toggleUserMenu();
      });
    }

    // Close user menu when clicking outside
    Utils.addEventListener(document, 'click', () => {
      this.closeUserMenu();
    });

    // Theme toggle
    if (this.elements.themeToggle) {
      Utils.addEventListener(this.elements.themeToggle, 'click', () => {
        this.toggleTheme();
      });
    }

    // Logout button
    if (this.elements.logoutBtn) {
      Utils.addEventListener(this.elements.logoutBtn, 'click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  /**
   * Bind global event listeners
   */
  bindGlobalEvents() {
    // Auth form events
    this.bindAuthFormEvents();
    
    // Password toggle events
    this.bindPasswordToggleEvents();
    
    // Modal form events
    this.bindModalFormEvents();
    
    // Global keyboard shortcuts
    this.bindKeyboardShortcuts();
    
    // Window events
    Utils.addEventListener(window, 'resize', Utils.throttle(() => {
      this.handleWindowResize();
    }, 250));

    Utils.addEventListener(window, 'beforeunload', () => {
      this.handleBeforeUnload();
    });
  }

  /**
   * Bind authentication form events
   */
  bindAuthFormEvents() {
    // Login form
    if (this.elements.loginForm) {
      Utils.addEventListener(this.elements.loginForm, 'submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Register form
    if (this.elements.registerForm) {
      Utils.addEventListener(this.elements.registerForm, 'submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Show register form
    if (this.elements.showRegisterBtn) {
      Utils.addEventListener(this.elements.showRegisterBtn, 'click', (e) => {
        e.preventDefault();
        this.showRegisterForm();
      });
    }

    // Show login form
    if (this.elements.showLoginBtn) {
      Utils.addEventListener(this.elements.showLoginBtn, 'click', (e) => {
        e.preventDefault();
        this.showLoginForm();
      });
    }
  }

  /**
   * Bind password toggle events
   */
  bindPasswordToggleEvents() {
    this.elements.passwordToggles.forEach(toggle => {
      Utils.addEventListener(toggle, 'click', (e) => {
        e.preventDefault();
        const targetId = toggle.getAttribute('data-target');
        const passwordInput = Utils.getElementById(targetId);
        
        if (passwordInput) {
          const isPassword = passwordInput.type === 'password';
          passwordInput.type = isPassword ? 'text' : 'password';
          
          const icon = toggle.querySelector('i');
          if (icon) {
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
          }
        }
      });
    });
  }

  /**
   * Bind modal form events
   */
  bindModalFormEvents() {
    // List form cancel button
    const listFormCancel = Utils.getElementById('list-form-cancel');
    if (listFormCancel) {
      Utils.addEventListener(listFormCancel, 'click', () => {
        modalManager.close('list-modal');
      });
    }

    // Task form cancel button
    const taskFormCancel = Utils.getElementById('task-form-cancel');
    if (taskFormCancel) {
      Utils.addEventListener(taskFormCancel, 'click', () => {
        modalManager.close('task-modal');
      });
    }
  }

  /**
   * Bind global keyboard shortcuts
   */
  bindKeyboardShortcuts() {
    Utils.addEventListener(document, 'keydown', (e) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            if (this.currentPage === 'lists' || this.currentPage === 'dashboard') {
              this.controllers.lists?.showCreateListModal();
            }
            break;
          case 'k':
            e.preventDefault();
            // Focus search input if available
            break;
        }
      }

      // Escape key - close modals
      if (e.key === 'Escape') {
        modalManager.closeAll();
      }
    });
  }

  /**
   * Handle authentication state changes
   * @param {Object} authState - Authentication state
   */
  handleAuthChange(authState) {
    if (authState.isAuthenticated) {
      this.showAuthenticatedUI();
      
      // If on auth page, navigate to dashboard
      if (this.currentPage === 'auth') {
        this.navigateTo('dashboard');
      }
    } else {
      this.showUnauthenticatedUI();
      this.navigateTo('auth');
    }
  }

  /**
   * Handle login form submission
   */
  async handleLogin() {
    const form = this.elements.loginForm;
    if (!form) return;

    try {
      this.showAuthLoading(form);
      
      const formData = Utils.getFormData(form);
      
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      await authManager.login(formData);
      
      toastManager.success('Welcome!', CONFIG.SUCCESS.LOGIN);
      
    } catch (error) {
      console.error('Login failed:', error);
      toastManager.error('Login Failed', error.message || 'Invalid credentials');
    } finally {
      this.hideAuthLoading(form);
    }
  }

  /**
   * Handle register form submission
   */
  async handleRegister() {
    const form = this.elements.registerForm;
    if (!form) return;

    try {
      this.showAuthLoading(form);
      
      const formData = Utils.getFormData(form);
      
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      // Validate password strength
      const passwordValidation = Utils.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      await authManager.register(formData);
      
      toastManager.success('Welcome!', CONFIG.SUCCESS.REGISTER);
      
    } catch (error) {
      console.error('Registration failed:', error);
      toastManager.error('Registration Failed', error.message || 'Registration failed');
    } finally {
      this.hideAuthLoading(form);
    }
  }

  /**
   * Handle logout
   */
  async logout() {
    try {
      await authManager.logout();
      toastManager.success('Goodbye!', CONFIG.SUCCESS.LOGOUT);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still proceed with logout on client side
      authManager.logout(false);
    }
  }

  /**
   * Navigate to a page
   * @param {string} page - Page name
   */
  async navigateTo(page) {
    if (this.currentPage === page) return;

    // Hide all pages
    Object.values(this.elements).forEach(element => {
      if (element && element.classList.contains('page-container')) {
        Utils.removeClass(element, 'active');
      }
    });

    // Update navigation
    this.updateNavigation(page);

    // Show target page
    const targetPage = this.elements[`${page}Page`];
    if (targetPage) {
      Utils.addClass(targetPage, 'active');
    }

    // Initialize page controller if needed
    if (page !== 'auth' && this.controllers[page]) {
      await this.controllers[page].init();
    }

    this.currentPage = page;

    // Update URL (for future history support)
    if (window.history && window.history.replaceState) {
      window.history.replaceState({ page }, '', `#${page}`);
    }
  }

  /**
   * Update navigation active state
   * @param {string} page - Active page
   */
  updateNavigation(page) {
    this.elements.navLinks.forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === page) {
        Utils.addClass(link, 'active');
      } else {
        Utils.removeClass(link, 'active');
      }
    });
  }

  /**
   * Show authenticated UI
   */
  showAuthenticatedUI() {
    if (this.elements.navbar) {
      Utils.removeClass(this.elements.navbar, 'hidden');
    }
  }

  /**
   * Show unauthenticated UI
   */
  showUnauthenticatedUI() {
    // Hide navbar for unauthenticated users
    if (this.elements.navbar) {
      Utils.addClass(this.elements.navbar, 'hidden');
    }
  }

  /**
   * Show register form
   */
  showRegisterForm() {
    if (this.elements.loginForm) {
      Utils.removeClass(this.elements.loginForm, 'active');
    }
    if (this.elements.registerForm) {
      Utils.addClass(this.elements.registerForm, 'active');
    }
  }

  /**
   * Show login form
   */
  showLoginForm() {
    if (this.elements.registerForm) {
      Utils.removeClass(this.elements.registerForm, 'active');
    }
    if (this.elements.loginForm) {
      Utils.addClass(this.elements.loginForm, 'active');
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    if (this.elements.navMenu) {
      Utils.toggleClass(this.elements.navMenu, 'active');
    }
  }

  /**
   * Toggle user menu
   */
  toggleUserMenu() {
    if (this.elements.userDropdown) {
      Utils.toggleClass(this.elements.userDropdown, 'active');
    }
  }

  /**
   * Close user menu
   */
  closeUserMenu() {
    if (this.elements.userDropdown) {
      Utils.removeClass(this.elements.userDropdown, 'active');
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set theme
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme toggle icon
    if (this.elements.themeToggle) {
      const icon = this.elements.themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      }
    }
    
    // Save theme preference
    StorageUtils.set(CONFIG.STORAGE.THEME, theme);
  }

  /**
   * Handle initial route
   */
  handleInitialRoute() {
    // Check URL hash for initial page
    const hash = window.location.hash.substring(1);
    const validPages = ['dashboard', 'lists', 'profile'];
    
    if (authManager.isLoggedIn() && validPages.includes(hash)) {
      this.navigateTo(hash);
    } else if (authManager.isLoggedIn()) {
      this.navigateTo('dashboard');
    } else {
      this.navigateTo('auth');
    }
  }

  /**
   * Show auth form loading
   * @param {HTMLElement} form - Form element
   */
  showAuthLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
      submitBtn.setAttribute('data-original-text', originalText);
    }
  }

  /**
   * Hide auth form loading
   * @param {HTMLElement} form - Form element
   */
  hideAuthLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      const originalText = submitBtn.getAttribute('data-original-text');
      if (originalText) {
        submitBtn.innerHTML = originalText;
        submitBtn.removeAttribute('data-original-text');
      }
    }
  }

  /**
   * Show global loading spinner
   */
  showGlobalLoading() {
    if (this.elements.loadingSpinner) {
      Utils.removeClass(this.elements.loadingSpinner, 'hidden');
    }
  }

  /**
   * Hide global loading spinner
   */
  hideGlobalLoading() {
    if (this.elements.loadingSpinner) {
      Utils.addClass(this.elements.loadingSpinner, 'hidden');
    }
  }

  /**
   * Show fatal error message
   * @param {string} message - Error message
   */
  showFatalError(message) {
    document.body.innerHTML = `
      <div class="fatal-error">
        <div class="fatal-error-content">
          <i class="fas fa-exclamation-triangle"></i>
          <h1>Application Error</h1>
          <p>${Utils.escapeHTML(message)}</p>
          <button onclick="window.location.reload()" class="btn-primary">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Handle window resize
   */
  handleWindowResize() {
    // Close mobile menu on larger screens
    if (window.innerWidth > 768) {
      if (this.elements.navMenu) {
        Utils.removeClass(this.elements.navMenu, 'active');
      }
    }
  }

  /**
   * Handle before unload
   */
  handleBeforeUnload() {
    // Save any pending data
    // Clear sensitive data if needed
  }

  /**
   * Get application state
   * @returns {Object} - Application state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      currentPage: this.currentPage,
      theme: this.theme,
      isAuthenticated: authManager.isLoggedIn(),
      user: authManager.getUser()
    };
  }

  /**
   * Destroy application
   */
  destroy() {
    // Clean up controllers
    Object.values(this.controllers).forEach(controller => {
      if (controller.destroy) {
        controller.destroy();
      }
    });

    // Clear modals
    modalManager.closeAll();

    // Clear toasts
    toastManager.closeAll();

    this.isInitialized = false;
  }
}

/**
 * Initialize and start the application
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Create global app instance
    window.app = new TodoApp();
    
    // Initialize the application
    await window.app.init();
    
    console.log('Todo List Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TodoApp };
}
