/**
 * Dashboard Page Controller for Todo List Application
 * Manages the dashboard view with statistics and recent lists
 * PT Erajaya Swasembada
 */

class DashboardController {
  constructor() {
    this.isInitialized = false;
    this.refreshInterval = null;
    this.elements = {};
    this.data = {
      stats: null,
      recentLists: []
    };
  }

  /**
   * Initialize dashboard
   */
  async init() {
    if (this.isInitialized) return;

    this.bindElements();
    this.bindEvents();
    await this.loadData();
    this.setupAutoRefresh();
    
    this.isInitialized = true;
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.elements = {
      // Statistics elements
      totalLists: Utils.getElementById('total-lists'),
      totalTasks: Utils.getElementById('total-tasks'),
      completedTasks: Utils.getElementById('completed-tasks'),
      pendingTasks: Utils.getElementById('pending-tasks'),
      
      // Recent lists container
      recentListsContainer: Utils.getElementById('recent-lists-container'),
      
      // Create list button
      createListBtn: Utils.getElementById('create-list-btn')
    };
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Create list button
    if (this.elements.createListBtn) {
      Utils.addEventListener(this.elements.createListBtn, 'click', () => {
        this.showCreateListModal();
      });
    }

    // Listen for data changes
    window.addEventListener('lists:updated', () => {
      this.refreshData();
    });

    window.addEventListener('tasks:updated', () => {
      this.refreshData();
    });

    // Listen for list card events
    if (this.elements.recentListsContainer) {
      Utils.addEventListener(this.elements.recentListsContainer, 'listcard:click', (e) => {
        const { listData } = e.detail;
        this.openListDetail(listData);
      });

      Utils.addEventListener(this.elements.recentListsContainer, 'listcard:edit', (e) => {
        const { listData } = e.detail;
        this.editList(listData);
      });

      Utils.addEventListener(this.elements.recentListsContainer, 'listcard:delete', (e) => {
        const { listData } = e.detail;
        this.deleteList(listData);
      });
    }
  }

  /**
   * Load dashboard data
   */
  async loadData() {
    try {
      this.showLoading();
      
      // Load statistics and recent lists in parallel
      const [stats, recentLists] = await Promise.all([
        this.loadStatistics(),
        this.loadRecentLists()
      ]);

      this.data.stats = stats;
      this.data.recentLists = recentLists;

      this.renderStatistics();
      this.renderRecentLists();
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toastManager.error('Error', 'Failed to load dashboard data');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Load statistics data
   * @returns {Promise<Object>} - Statistics data
   */
  async loadStatistics() {
    try {
      // Get all lists and tasks to calculate statistics
      const [lists, tasks] = await Promise.all([
        apiService.getLists(),
        apiService.getTasks()
      ]);

      const totalLists = lists.length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.completed || task.is_completed).length;
      const pendingTasks = totalTasks - completedTasks;

      return {
        totalLists,
        totalTasks,
        completedTasks,
        pendingTasks
      };
    } catch (error) {
      console.error('Failed to load statistics:', error);
      return {
        totalLists: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
      };
    }
  }

  /**
   * Load recent lists
   * @returns {Promise<Array>} - Recent lists data
   */
  async loadRecentLists() {
    try {
      const lists = await apiService.getLists({ limit: 6, sort: '-updated_at' });
      
      // Load tasks for each list to show progress
      const listsWithTasks = await Promise.all(
        lists.map(async (list) => {
          try {
            const tasks = await apiService.getListTasks(list.id);
            return { ...list, tasks };
          } catch (error) {
            console.error(`Failed to load tasks for list ${list.id}:`, error);
            return { ...list, tasks: [] };
          }
        })
      );

      return listsWithTasks;
    } catch (error) {
      console.error('Failed to load recent lists:', error);
      return [];
    }
  }

  /**
   * Render statistics
   */
  renderStatistics() {
    if (!this.data.stats) return;

    const { totalLists, totalTasks, completedTasks, pendingTasks } = this.data.stats;

    // Animate numbers
    this.animateNumber(this.elements.totalLists, totalLists);
    this.animateNumber(this.elements.totalTasks, totalTasks);
    this.animateNumber(this.elements.completedTasks, completedTasks);
    this.animateNumber(this.elements.pendingTasks, pendingTasks);
  }

  /**
   * Render recent lists
   */
  renderRecentLists() {
    if (!this.elements.recentListsContainer) return;

    // Clear container
    this.elements.recentListsContainer.innerHTML = '';

    if (this.data.recentLists.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Create list cards
    this.data.recentLists.forEach(listData => {
      const card = new ListCard(listData, {
        showMenu: true,
        showProgress: true,
        showStats: true
      });

      // Set callbacks
      card.setCallbacks({
        onClick: (data) => this.openListDetail(data),
        onEdit: (data) => this.editList(data),
        onDelete: (data) => this.deleteList(data)
      });

      this.elements.recentListsContainer.appendChild(card.getElement());
    });
  }

  /**
   * Render empty state for recent lists
   */
  renderEmptyState() {
    const emptyStateHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-list"></i>
        </div>
        <h3 class="empty-state-title">No Lists Yet</h3>
        <p class="empty-state-description">
          Create your first todo list to get started organizing your tasks.
        </p>
        <button class="btn-primary" id="empty-state-create-btn">
          <i class="fas fa-plus"></i>
          Create Your First List
        </button>
      </div>
    `;

    this.elements.recentListsContainer.innerHTML = emptyStateHTML;

    // Bind create button in empty state
    const createBtn = Utils.getElementById('empty-state-create-btn');
    if (createBtn) {
      Utils.addEventListener(createBtn, 'click', () => {
        this.showCreateListModal();
      });
    }
  }

  /**
   * Show create list modal
   */
  showCreateListModal() {
    const modal = modalManager.get('list-modal');
    if (modal) {
      modal.setTitle('Create New List');
      modal.resetForm();
      modal.open();
    }
  }

  /**
   * Open list detail modal
   * @param {Object} listData - List data
   */
  openListDetail(listData) {
    // Navigate to lists page and open detail
    window.app.navigateTo('lists');
    
    // Wait for page to load then open detail
    setTimeout(() => {
      if (window.listsController) {
        window.listsController.openListDetail(listData.id);
      }
    }, 100);
  }

  /**
   * Edit list
   * @param {Object} listData - List data
   */
  editList(listData) {
    const modal = modalManager.get('list-modal');
    if (modal) {
      modal.setTitle('Edit List');
      
      // Populate form with existing data
      const form = modal.modal.querySelector('#list-form');
      if (form) {
        form.querySelector('#list-name').value = listData.name || '';
        form.querySelector('#list-description').value = listData.description || '';
        form.setAttribute('data-list-id', listData.id);
      }
      
      modal.open();
    }
  }

  /**
   * Delete list
   * @param {Object} listData - List data
   */
  async deleteList(listData) {
    const confirmed = confirm(`Are you sure you want to delete "${listData.name}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      await apiService.deleteList(listData.id);
      toastManager.success('Success', CONFIG.SUCCESS.LIST_DELETED);
      this.refreshData();
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('lists:updated'));
    } catch (error) {
      console.error('Failed to delete list:', error);
      toastManager.error('Error', error.message || 'Failed to delete list');
    }
  }

  /**
   * Animate number counter
   * @param {HTMLElement} element - Target element
   * @param {number} target - Target number
   */
  animateNumber(element, target) {
    if (!element) return;

    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (target - start) * easeOutQuart);
      
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Show loading state
   */
  showLoading() {
    // Show skeleton cards in recent lists
    if (this.elements.recentListsContainer) {
      const skeletonHTML = Array(3).fill(0).map(() => `
        <div class="list-card skeleton">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </div>
      `).join('');
      
      this.elements.recentListsContainer.innerHTML = skeletonHTML;
    }

    // Show loading in stats
    Object.values(this.elements).forEach(element => {
      if (element && element.classList.contains('stat-number')) {
        element.textContent = '-';
      }
    });
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    // Loading state is replaced by actual content in render methods
  }

  /**
   * Refresh dashboard data
   */
  async refreshData() {
    await this.loadData();
  }

  /**
   * Setup auto-refresh interval
   */
  setupAutoRefresh() {
    // Refresh every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 5 * 60 * 1000);
  }

  /**
   * Clear auto-refresh interval
   */
  clearAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Handle page visibility change
   */
  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.refreshData();
    }
  }

  /**
   * Destroy dashboard controller
   */
  destroy() {
    this.clearAutoRefresh();
    this.isInitialized = false;
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  /**
   * Get dashboard data
   * @returns {Object} - Current dashboard data
   */
  getData() {
    return {
      stats: this.data.stats,
      recentLists: this.data.recentLists,
      isLoading: false
    };
  }

  /**
   * Export dashboard data
   * @returns {Object} - Exportable dashboard data
   */
  export() {
    return {
      timestamp: new Date().toISOString(),
      ...this.getData()
    };
  }
}

/**
 * Global dashboard controller instance
 */
const dashboardController = new DashboardController();

// Make it globally accessible
window.dashboardController = dashboardController;

// Auto-refresh on page visibility change
document.addEventListener('visibilitychange', () => {
  dashboardController.onVisibilityChange();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DashboardController, dashboardController };
}
