/**
 * Toast Notification Component for Todo List Application
 * Displays temporary notification messages with different types and animations
 * PT Erajaya Swasembada
 */

class Toast {
  constructor(options = {}) {
    // Default options
    this.options = {
      type: 'info',          // 'success', 'error', 'warning', 'info'
      title: '',
      message: '',
      duration: CONFIG.UI.TOAST.DURATION,
      position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
      closable: true,
      icon: null,
      onClick: null,
      onClose: null,
      ...options
    };

    this.id = Utils.generateId();
    this.element = null;
    this.timer = null;
    this.isVisible = false;

    this.create();
  }

  /**
   * Create toast element
   */
  create() {
    this.element = document.createElement('div');
    this.element.className = `toast toast-${this.options.type}`;
    this.element.setAttribute('data-toast-id', this.id);

    // Determine icon based on type
    let icon = this.options.icon;
    if (!icon) {
      switch (this.options.type) {
        case 'success':
          icon = 'fas fa-check-circle';
          break;
        case 'error':
          icon = 'fas fa-exclamation-circle';
          break;
        case 'warning':
          icon = 'fas fa-exclamation-triangle';
          break;
        default:
          icon = 'fas fa-info-circle';
      }
    }

    // Build toast HTML
    const html = `
      <div class="toast-icon">
        <i class="${icon}"></i>
      </div>
      <div class="toast-content">
        ${this.options.title ? `<div class="toast-title">${Utils.escapeHTML(this.options.title)}</div>` : ''}
        <div class="toast-message">${Utils.escapeHTML(this.options.message)}</div>
      </div>
      ${this.options.closable ? '<button class="toast-close"><i class="fas fa-times"></i></button>' : ''}
    `;

    this.element.innerHTML = html;

    // Bind events
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Close button
    if (this.options.closable) {
      const closeBtn = this.element.querySelector('.toast-close');
      if (closeBtn) {
        Utils.addEventListener(closeBtn, 'click', (e) => {
          e.stopPropagation();
          this.close();
        });
      }
    }

    // Click handler
    if (this.options.onClick) {
      Utils.addEventListener(this.element, 'click', (e) => {
        if (!e.target.closest('.toast-close')) {
          this.options.onClick(this);
        }
      });
    }

    // Hover to pause/resume auto-close
    Utils.addEventListener(this.element, 'mouseenter', () => {
      this.pauseAutoClose();
    });

    Utils.addEventListener(this.element, 'mouseleave', () => {
      this.resumeAutoClose();
    });
  }

  /**
   * Show toast
   */
  show() {
    if (this.isVisible) return;

    const container = this.getContainer();
    container.appendChild(this.element);

    // Trigger animation
    requestAnimationFrame(() => {
      Utils.addClass(this.element, 'show');
    });

    this.isVisible = true;

    // Auto-close timer
    if (this.options.duration > 0) {
      this.startAutoClose();
    }

    // Dispatch event
    this.element.dispatchEvent(new CustomEvent('toast:show', {
      detail: { toast: this, id: this.id }
    }));

    return this;
  }

  /**
   * Close toast
   */
  close() {
    if (!this.isVisible) return;

    this.clearAutoClose();
    Utils.removeClass(this.element, 'show');

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.isVisible = false;

      // Call close callback
      if (this.options.onClose) {
        this.options.onClose(this);
      }

      // Dispatch event
      this.element.dispatchEvent(new CustomEvent('toast:close', {
        detail: { toast: this, id: this.id }
      }));
    }, CONFIG.ANIMATION.NORMAL);

    return this;
  }

  /**
   * Start auto-close timer
   */
  startAutoClose() {
    this.clearAutoClose();
    this.timer = setTimeout(() => {
      this.close();
    }, this.options.duration);
  }

  /**
   * Pause auto-close timer
   */
  pauseAutoClose() {
    this.clearAutoClose();
  }

  /**
   * Resume auto-close timer
   */
  resumeAutoClose() {
    if (this.options.duration > 0 && this.isVisible) {
      this.startAutoClose();
    }
  }

  /**
   * Clear auto-close timer
   */
  clearAutoClose() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Get or create toast container
   * @returns {HTMLElement} - Toast container element
   */
  getContainer() {
    let container = Utils.getElementById('toast-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = `toast-container toast-${this.options.position}`;
      document.body.appendChild(container);
    }

    return container;
  }

  /**
   * Update toast content
   * @param {Object} options - New options
   */
  update(options = {}) {
    Object.assign(this.options, options);
    
    if (this.element) {
      // Update title
      const titleElement = this.element.querySelector('.toast-title');
      if (this.options.title) {
        if (titleElement) {
          Utils.setText(titleElement, this.options.title);
        } else {
          const content = this.element.querySelector('.toast-content');
          const newTitle = document.createElement('div');
          newTitle.className = 'toast-title';
          Utils.setText(newTitle, this.options.title);
          content.insertBefore(newTitle, content.firstChild);
        }
      } else if (titleElement) {
        titleElement.remove();
      }

      // Update message
      const messageElement = this.element.querySelector('.toast-message');
      if (messageElement) {
        Utils.setText(messageElement, this.options.message);
      }

      // Update type class
      this.element.className = `toast toast-${this.options.type} show`;
    }

    return this;
  }

  /**
   * Get toast state
   * @returns {Object} - Toast state
   */
  getState() {
    return {
      id: this.id,
      isVisible: this.isVisible,
      options: { ...this.options }
    };
  }
}

/**
 * Toast Manager - Manages multiple toasts
 */
class ToastManager {
  constructor() {
    this.toasts = new Map();
    this.maxToasts = CONFIG.UI.TOAST.MAX_TOASTS;
  }

  /**
   * Create and show a toast
   * @param {Object} options - Toast options
   * @returns {Toast} - Toast instance
   */
  create(options = {}) {
    const toast = new Toast(options);
    this.toasts.set(toast.id, toast);

    // Remove oldest toast if limit exceeded
    if (this.toasts.size > this.maxToasts) {
      const oldestId = this.toasts.keys().next().value;
      this.close(oldestId);
    }

    // Remove from map when closed
    toast.element.addEventListener('toast:close', () => {
      this.toasts.delete(toast.id);
    });

    toast.show();
    return toast;
  }

  /**
   * Show success toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} - Toast instance
   */
  success(title, message, options = {}) {
    return this.create({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  /**
   * Show error toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} - Toast instance
   */
  error(title, message, options = {}) {
    return this.create({
      type: 'error',
      title,
      message,
      duration: 0, // Don't auto-close error messages
      ...options
    });
  }

  /**
   * Show warning toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} - Toast instance
   */
  warning(title, message, options = {}) {
    return this.create({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  /**
   * Show info toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} - Toast instance
   */
  info(title, message, options = {}) {
    return this.create({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  /**
   * Get toast by ID
   * @param {string} toastId - Toast ID
   * @returns {Toast|null} - Toast instance or null
   */
  get(toastId) {
    return this.toasts.get(toastId) || null;
  }

  /**
   * Close toast by ID
   * @param {string} toastId - Toast ID
   * @returns {boolean} - Success status
   */
  close(toastId) {
    const toast = this.get(toastId);
    if (toast) {
      toast.close();
      return true;
    }
    return false;
  }

  /**
   * Close all toasts
   */
  closeAll() {
    this.toasts.forEach(toast => toast.close());
  }

  /**
   * Get all active toasts
   * @returns {Array} - Array of toast instances
   */
  getAll() {
    return Array.from(this.toasts.values());
  }

  /**
   * Get count of active toasts
   * @returns {number} - Number of active toasts
   */
  getCount() {
    return this.toasts.size;
  }

  /**
   * Set maximum number of toasts
   * @param {number} max - Maximum number of toasts
   */
  setMaxToasts(max) {
    this.maxToasts = Math.max(1, max);
  }

  /**
   * Clear all toasts and reset
   */
  reset() {
    this.closeAll();
    this.toasts.clear();
  }
}

/**
 * Global toast manager instance
 */
const toastManager = new ToastManager();

// Make it globally accessible
window.toastManager = toastManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Toast, ToastManager, toastManager };
}
