/**
 * Modal Component for Todo List Application
 * Reusable modal dialog component with animations and keyboard support
 * PT Erajaya Swasembada
 */

class Modal {
  constructor(modalId, options = {}) {
    this.modalId = modalId;
    this.modal = Utils.getElementById(modalId);
    this.isOpen = false;
    this.focusableElements = [];
    this.previousFocus = null;
    
    // Default options
    this.options = {
      closeOnBackdrop: true,
      closeOnEscape: true,
      trapFocus: true,
      autoFocus: true,
      ...options
    };

    if (!this.modal) {
      console.error(`Modal with ID '${modalId}' not found`);
      return;
    }

    this.init();
  }

  /**
   * Initialize modal component
   */
  init() {
    this.content = this.modal.querySelector('.modal-content');
    this.closeButton = this.modal.querySelector('.modal-close');
    
    // Bind event listeners
    this.bindEvents();
    
    // Find focusable elements
    this.updateFocusableElements();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Close button
    if (this.closeButton) {
      Utils.addEventListener(this.closeButton, 'click', () => this.close());
    }

    // Backdrop click
    if (this.options.closeOnBackdrop) {
      Utils.addEventListener(this.modal, 'click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.options.closeOnEscape) {
      Utils.addEventListener(document, 'keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          e.preventDefault();
          this.close();
        }
      });
    }

    // Tab key for focus trapping
    if (this.options.trapFocus) {
      Utils.addEventListener(this.modal, 'keydown', (e) => {
        if (e.key === 'Tab' && this.isOpen) {
          this.handleTabKey(e);
        }
      });
    }
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    if (!this.modal) return;
    
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    this.focusableElements = this.modal.querySelectorAll(selectors.join(', '));
  }

  /**
   * Handle tab key for focus trapping
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleTabKey(e) {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Open modal
   * @param {Function} callback - Callback function after modal opens
   */
  open(callback) {
    if (this.isOpen || !this.modal) return;

    // Store current focus
    this.previousFocus = document.activeElement;

    // Add active class
    Utils.addClass(this.modal, 'active');
    
    // Prevent body scroll
    Utils.addClass(document.body, 'modal-open');
    
    // Update state
    this.isOpen = true;
    
    // Update focusable elements
    this.updateFocusableElements();
    
    // Auto focus first element
    if (this.options.autoFocus && this.focusableElements.length > 0) {
      setTimeout(() => {
        this.focusableElements[0].focus();
      }, CONFIG.ANIMATION.FAST);
    }

    // Dispatch event
    this.modal.dispatchEvent(new CustomEvent('modal:open', {
      detail: { modalId: this.modalId }
    }));

    // Execute callback
    if (typeof callback === 'function') {
      setTimeout(callback, CONFIG.ANIMATION.NORMAL);
    }
  }

  /**
   * Close modal
   * @param {Function} callback - Callback function after modal closes
   */
  close(callback) {
    if (!this.isOpen || !this.modal) return;

    // Remove active class
    Utils.removeClass(this.modal, 'active');
    
    // Allow body scroll
    Utils.removeClass(document.body, 'modal-open');
    
    // Update state
    this.isOpen = false;
    
    // Restore previous focus
    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }

    // Dispatch event
    this.modal.dispatchEvent(new CustomEvent('modal:close', {
      detail: { modalId: this.modalId }
    }));

    // Execute callback
    if (typeof callback === 'function') {
      setTimeout(callback, CONFIG.ANIMATION.NORMAL);
    }
  }

  /**
   * Toggle modal state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Set modal title
   * @param {string} title - Modal title
   */
  setTitle(title) {
    const titleElement = this.modal.querySelector('.modal-title');
    if (titleElement) {
      Utils.setText(titleElement, title);
    }
  }

  /**
   * Set modal content
   * @param {string} content - Modal content (HTML)
   */
  setContent(content) {
    const bodyElement = this.modal.querySelector('.modal-body');
    if (bodyElement) {
      Utils.setHTML(bodyElement, content);
      this.updateFocusableElements();
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    const content = `
      <div class="text-center">
        <div class="spinner"></div>
        <p class="mt-3">Loading...</p>
      </div>
    `;
    this.setContent(content);
  }

  /**
   * Get modal form data
   * @returns {Object} - Form data object
   */
  getFormData() {
    const form = this.modal.querySelector('form');
    return form ? Utils.getFormData(form) : {};
  }

  /**
   * Reset modal form
   */
  resetForm() {
    const form = this.modal.querySelector('form');
    if (form) {
      Utils.resetForm(form);
    }
  }

  /**
   * Add event listener to modal
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (this.modal) {
      Utils.addEventListener(this.modal, event, callback);
    }
  }

  /**
   * Remove event listener from modal
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (this.modal) {
      Utils.removeEventListener(this.modal, event, callback);
    }
  }

  /**
   * Destroy modal component
   */
  destroy() {
    if (this.isOpen) {
      this.close();
    }
    
    // Remove event listeners would need to be tracked for proper cleanup
    // For simplicity, we'll just mark as destroyed
    this.modal = null;
    this.isOpen = false;
  }

  /**
   * Get modal state
   * @returns {Object} - Modal state information
   */
  getState() {
    return {
      isOpen: this.isOpen,
      modalId: this.modalId,
      hasFocus: this.modal && this.modal.contains(document.activeElement)
    };
  }
}

/**
 * Modal Manager - Manages multiple modals
 */
class ModalManager {
  constructor() {
    this.modals = new Map();
    this.openModals = [];
  }

  /**
   * Register a modal
   * @param {string} modalId - Modal ID
   * @param {Object} options - Modal options
   * @returns {Modal} - Modal instance
   */
  register(modalId, options = {}) {
    if (this.modals.has(modalId)) {
      return this.modals.get(modalId);
    }

    const modal = new Modal(modalId, options);
    this.modals.set(modalId, modal);

    // Track open/close events
    modal.on('modal:open', () => {
      this.openModals.push(modalId);
    });

    modal.on('modal:close', () => {
      const index = this.openModals.indexOf(modalId);
      if (index > -1) {
        this.openModals.splice(index, 1);
      }
    });

    return modal;
  }

  /**
   * Get modal instance
   * @param {string} modalId - Modal ID
   * @returns {Modal|null} - Modal instance
   */
  get(modalId) {
    return this.modals.get(modalId) || null;
  }

  /**
   * Open modal
   * @param {string} modalId - Modal ID
   * @param {Function} callback - Callback function
   */
  open(modalId, callback) {
    const modal = this.get(modalId);
    if (modal) {
      modal.open(callback);
    }
  }

  /**
   * Close modal
   * @param {string} modalId - Modal ID
   * @param {Function} callback - Callback function
   */
  close(modalId, callback) {
    const modal = this.get(modalId);
    if (modal) {
      modal.close(callback);
    }
  }

  /**
   * Close all open modals
   */
  closeAll() {
    this.openModals.slice().forEach(modalId => {
      this.close(modalId);
    });
  }

  /**
   * Get currently open modals
   * @returns {Array} - Array of open modal IDs
   */
  getOpenModals() {
    return [...this.openModals];
  }

  /**
   * Check if any modal is open
   * @returns {boolean} - True if any modal is open
   */
  hasOpenModal() {
    return this.openModals.length > 0;
  }
}

/**
 * Global modal manager instance
 */
const modalManager = new ModalManager();

// Make it globally accessible
window.modalManager = modalManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Modal, ModalManager, modalManager };
}
