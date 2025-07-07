/**
 * List Card Component for Todo List Application
 * Reusable component for displaying todo lists in a card format
 * PT Erajaya Swasembada
 */

class ListCard {
  constructor(listData, options = {}) {
    this.listData = listData;
    this.options = {
      showMenu: true,
      showProgress: true,
      showStats: true,
      clickable: true,
      ...options
    };
    this.element = null;
    this.callbacks = {
      onClick: null,
      onEdit: null,
      onDelete: null,
      onDuplicate: null
    };

    this.create();
  }

  /**
   * Create list card element
   */
  create() {
    this.element = document.createElement('div');
    this.element.className = 'list-card';
    this.element.setAttribute('data-list-id', this.listData.id);

    this.render();
    this.bindEvents();
  }

  /**
   * Render card content
   */
  render() {
    const stats = this.calculateStats();
    const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    const html = `
      <div class="list-card-header">
        <h3 class="list-card-title">${Utils.escapeHTML(this.listData.name || 'Untitled List')}</h3>
        ${this.options.showMenu ? this.renderMenu() : ''}
      </div>
      
      ${this.listData.description ? `
        <p class="list-card-description">${Utils.escapeHTML(this.listData.description)}</p>
      ` : ''}
      
      ${this.options.showStats ? `
        <div class="list-card-stats">
          <span class="list-card-tasks">
            <i class="fas fa-tasks"></i>
            ${stats.completed}/${stats.total} tasks
          </span>
          <span class="list-card-date">
            ${Utils.formatRelativeTime(this.listData.created_at || this.listData.updated_at)}
          </span>
        </div>
      ` : ''}
      
      ${this.options.showProgress ? `
        <div class="list-card-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
          </div>
        </div>
      ` : ''}
    `;

    this.element.innerHTML = html;
  }

  /**
   * Render card menu
   * @returns {string} - Menu HTML
   */
  renderMenu() {
    return `
      <div class="list-card-menu">
        <button class="btn-icon btn-edit" title="Edit List">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon btn-duplicate" title="Duplicate List">
          <i class="fas fa-copy"></i>
        </button>
        <button class="btn-icon btn-delete btn-danger" title="Delete List">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Calculate list statistics
   * @returns {Object} - Statistics object
   */
  calculateStats() {
    const tasks = this.listData.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed || task.is_completed).length;
    const pending = total - completed;

    return {
      total,
      completed,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Card click
    if (this.options.clickable) {
      Utils.addEventListener(this.element, 'click', (e) => {
        // Don't trigger if clicking on menu buttons
        if (e.target.closest('.list-card-menu')) {
          return;
        }
        this.handleClick(e);
      });
    }

    // Menu buttons
    if (this.options.showMenu) {
      const editBtn = this.element.querySelector('.btn-edit');
      const duplicateBtn = this.element.querySelector('.btn-duplicate');
      const deleteBtn = this.element.querySelector('.btn-delete');

      if (editBtn) {
        Utils.addEventListener(editBtn, 'click', (e) => {
          e.stopPropagation();
          this.handleEdit(e);
        });
      }

      if (duplicateBtn) {
        Utils.addEventListener(duplicateBtn, 'click', (e) => {
          e.stopPropagation();
          this.handleDuplicate(e);
        });
      }

      if (deleteBtn) {
        Utils.addEventListener(deleteBtn, 'click', (e) => {
          e.stopPropagation();
          this.handleDelete(e);
        });
      }
    }
  }

  /**
   * Handle card click
   * @param {Event} e - Click event
   */
  handleClick(e) {
    if (this.callbacks.onClick) {
      this.callbacks.onClick(this.listData, this, e);
    }

    // Dispatch custom event
    this.element.dispatchEvent(new CustomEvent('listcard:click', {
      detail: { listData: this.listData, card: this },
      bubbles: true
    }));
  }

  /**
   * Handle edit button click
   * @param {Event} e - Click event
   */
  handleEdit(e) {
    if (this.callbacks.onEdit) {
      this.callbacks.onEdit(this.listData, this, e);
    }

    this.element.dispatchEvent(new CustomEvent('listcard:edit', {
      detail: { listData: this.listData, card: this },
      bubbles: true
    }));
  }

  /**
   * Handle duplicate button click
   * @param {Event} e - Click event
   */
  handleDuplicate(e) {
    if (this.callbacks.onDuplicate) {
      this.callbacks.onDuplicate(this.listData, this, e);
    }

    this.element.dispatchEvent(new CustomEvent('listcard:duplicate', {
      detail: { listData: this.listData, card: this },
      bubbles: true
    }));
  }

  /**
   * Handle delete button click
   * @param {Event} e - Click event
   */
  handleDelete(e) {
    if (this.callbacks.onDelete) {
      this.callbacks.onDelete(this.listData, this, e);
    }

    this.element.dispatchEvent(new CustomEvent('listcard:delete', {
      detail: { listData: this.listData, card: this },
      bubbles: true
    }));
  }

  /**
   * Update list data and re-render
   * @param {Object} newData - Updated list data
   */
  update(newData) {
    this.listData = { ...this.listData, ...newData };
    this.render();
    this.bindEvents();
  }

  /**
   * Set callback functions
   * @param {Object} callbacks - Callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Show loading state
   */
  showLoading() {
    Utils.addClass(this.element, 'loading');
    const overlay = document.createElement('div');
    overlay.className = 'card-loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    this.element.appendChild(overlay);
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    Utils.removeClass(this.element, 'loading');
    const overlay = this.element.querySelector('.card-loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Highlight card (e.g., after creation/update)
   */
  highlight() {
    Utils.addClass(this.element, 'highlight');
    setTimeout(() => {
      Utils.removeClass(this.element, 'highlight');
    }, 2000);
  }

  /**
   * Get DOM element
   * @returns {HTMLElement} - Card element
   */
  getElement() {
    return this.element;
  }

  /**
   * Get list data
   * @returns {Object} - List data
   */
  getData() {
    return { ...this.listData };
  }

  /**
   * Get list statistics
   * @returns {Object} - Statistics
   */
  getStats() {
    return this.calculateStats();
  }

  /**
   * Check if list is empty
   * @returns {boolean} - True if list has no tasks
   */
  isEmpty() {
    const tasks = this.listData.tasks || [];
    return tasks.length === 0;
  }

  /**
   * Check if list is completed
   * @returns {boolean} - True if all tasks are completed
   */
  isCompleted() {
    const stats = this.calculateStats();
    return stats.total > 0 && stats.completed === stats.total;
  }

  /**
   * Destroy card component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.callbacks = {};
  }

  /**
   * Clone card with new data
   * @param {Object} newData - Data for cloned card
   * @returns {ListCard} - New card instance
   */
  clone(newData = {}) {
    const clonedData = {
      ...this.listData,
      ...newData,
      id: newData.id || Utils.generateId(),
      name: newData.name || `${this.listData.name} (Copy)`
    };

    return new ListCard(clonedData, this.options);
  }

  /**
   * Export card data
   * @returns {Object} - Exportable card data
   */
  export() {
    return {
      listData: this.getData(),
      stats: this.getStats(),
      isEmpty: this.isEmpty(),
      isCompleted: this.isCompleted()
    };
  }
}

/**
 * List Card Factory - Creates and manages list cards
 */
class ListCardFactory {
  constructor() {
    this.cards = new Map();
    this.container = null;
  }

  /**
   * Set container element for cards
   * @param {HTMLElement|string} container - Container element or selector
   */
  setContainer(container) {
    this.container = typeof container === 'string' 
      ? Utils.querySelector(container) 
      : container;
  }

  /**
   * Create and add card to container
   * @param {Object} listData - List data
   * @param {Object} options - Card options
   * @returns {ListCard} - Card instance
   */
  create(listData, options = {}) {
    const card = new ListCard(listData, options);
    this.cards.set(listData.id, card);

    if (this.container) {
      this.container.appendChild(card.getElement());
    }

    return card;
  }

  /**
   * Create multiple cards
   * @param {Array} listsData - Array of list data
   * @param {Object} options - Card options
   * @returns {Array} - Array of card instances
   */
  createMultiple(listsData, options = {}) {
    return listsData.map(listData => this.create(listData, options));
  }

  /**
   * Get card by list ID
   * @param {string|number} listId - List ID
   * @returns {ListCard|null} - Card instance or null
   */
  get(listId) {
    return this.cards.get(listId) || null;
  }

  /**
   * Update card
   * @param {string|number} listId - List ID
   * @param {Object} newData - Updated data
   * @returns {boolean} - Success status
   */
  update(listId, newData) {
    const card = this.get(listId);
    if (card) {
      card.update(newData);
      return true;
    }
    return false;
  }

  /**
   * Remove card
   * @param {string|number} listId - List ID
   * @returns {boolean} - Success status
   */
  remove(listId) {
    const card = this.get(listId);
    if (card) {
      card.destroy();
      this.cards.delete(listId);
      return true;
    }
    return false;
  }

  /**
   * Clear all cards
   */
  clear() {
    this.cards.forEach(card => card.destroy());
    this.cards.clear();
    
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Get all cards
   * @returns {Array} - Array of card instances
   */
  getAll() {
    return Array.from(this.cards.values());
  }

  /**
   * Get cards count
   * @returns {number} - Number of cards
   */
  getCount() {
    return this.cards.size;
  }

  /**
   * Filter cards by criteria
   * @param {Function} predicate - Filter function
   * @returns {Array} - Filtered cards
   */
  filter(predicate) {
    return this.getAll().filter(predicate);
  }

  /**
   * Sort cards by criteria
   * @param {Function} compareFn - Compare function
   * @returns {Array} - Sorted cards
   */
  sort(compareFn) {
    const sortedCards = this.getAll().sort(compareFn);
    
    // Re-append in sorted order if container exists
    if (this.container) {
      sortedCards.forEach(card => {
        this.container.appendChild(card.getElement());
      });
    }
    
    return sortedCards;
  }

  /**
   * Search cards by term
   * @param {string} term - Search term
   * @returns {Array} - Matching cards
   */
  search(term) {
    const searchTerm = term.toLowerCase();
    return this.filter(card => {
      const data = card.getData();
      return (
        data.name.toLowerCase().includes(searchTerm) ||
        (data.description && data.description.toLowerCase().includes(searchTerm))
      );
    });
  }
}

/**
 * Global list card factory instance
 */
const listCardFactory = new ListCardFactory();

// Make it globally accessible
window.listCardFactory = listCardFactory;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ListCard, ListCardFactory, listCardFactory };
}
