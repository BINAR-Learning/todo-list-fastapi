/**
 * Lists Page Controller for Todo List Application
 * Manages the lists view with CRUD operations and task management
 * PT Erajaya Swasembada
 */

class ListsController {
  constructor() {
    this.isInitialized = false;
    this.elements = {};
    this.data = {
      lists: [],
      currentList: null,
      currentTasks: []
    };
    this.listCardFactory = new ListCardFactory();
    this.taskListManager = new TaskListManager();
    this.searchTimeout = null;
  }

  /**
   * Initialize lists page
   */
  async init() {
    if (this.isInitialized) return;

    this.bindElements();
    this.bindEvents();
    this.setupModals();
    await this.loadLists();
    
    this.isInitialized = true;
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.elements = {
      // Lists grid
      listsGrid: Utils.getElementById('lists-grid'),
      
      // Create list button
      createListBtn: Utils.getElementById('create-list-btn-2'),
      
      // Modals
      listModal: Utils.getElementById('list-modal'),
      listDetailModal: Utils.getElementById('list-detail-modal'),
      taskModal: Utils.getElementById('task-modal'),
      
      // Forms
      listForm: Utils.getElementById('list-form'),
      taskForm: Utils.getElementById('task-form'),
      
      // List detail elements
      listDetailTitle: Utils.getElementById('list-detail-title'),
      listDetailDescription: Utils.getElementById('list-detail-description'),
      tasksContainer: Utils.getElementById('tasks-container'),
      addTaskBtn: Utils.getElementById('add-task-btn'),
      editListBtn: Utils.getElementById('edit-list-btn'),
      deleteListBtn: Utils.getElementById('delete-list-btn')
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

    // List form submission
    if (this.elements.listForm) {
      Utils.addEventListener(this.elements.listForm, 'submit', (e) => {
        e.preventDefault();
        this.handleListFormSubmit();
      });
    }

    // Task form submission
    if (this.elements.taskForm) {
      Utils.addEventListener(this.elements.taskForm, 'submit', (e) => {
        e.preventDefault();
        this.handleTaskFormSubmit();
      });
    }

    // Add task button
    if (this.elements.addTaskBtn) {
      Utils.addEventListener(this.elements.addTaskBtn, 'click', () => {
        this.showCreateTaskModal();
      });
    }

    // Edit list button
    if (this.elements.editListBtn) {
      Utils.addEventListener(this.elements.editListBtn, 'click', () => {
        this.editCurrentList();
      });
    }

    // Delete list button
    if (this.elements.deleteListBtn) {
      Utils.addEventListener(this.elements.deleteListBtn, 'click', () => {
        this.deleteCurrentList();
      });
    }

    // Listen for list card events
    if (this.elements.listsGrid) {
      Utils.addEventListener(this.elements.listsGrid, 'listcard:click', (e) => {
        const { listData } = e.detail;
        this.openListDetail(listData.id);
      });

      Utils.addEventListener(this.elements.listsGrid, 'listcard:edit', (e) => {
        const { listData } = e.detail;
        this.editList(listData);
      });

      Utils.addEventListener(this.elements.listsGrid, 'listcard:delete', (e) => {
        const { listData } = e.detail;
        this.deleteList(listData);
      });
    }

    // Listen for task events
    if (this.elements.tasksContainer) {
      Utils.addEventListener(this.elements.tasksContainer, 'task:toggle', (e) => {
        const { taskData, completed } = e.detail;
        this.toggleTask(taskData.id, completed);
      });

      Utils.addEventListener(this.elements.tasksContainer, 'task:edit', (e) => {
        const { taskData } = e.detail;
        this.editTask(taskData);
      });

      Utils.addEventListener(this.elements.tasksContainer, 'task:delete', (e) => {
        const { taskData } = e.detail;
        this.deleteTask(taskData);
      });
    }

    // Listen for global events
    window.addEventListener('lists:updated', () => {
      this.refreshLists();
    });

    window.addEventListener('tasks:updated', () => {
      this.refreshCurrentListTasks();
    });
  }

  /**
   * Setup modal instances
   */
  setupModals() {
    // Register modals with modal manager
    modalManager.register('list-modal');
    modalManager.register('list-detail-modal');
    modalManager.register('task-modal');

    // Setup list card factory
    this.listCardFactory.setContainer(this.elements.listsGrid);

    // Setup task list manager
    this.taskListManager.setContainer(this.elements.tasksContainer);
  }

  /**
   * Load all lists
   */
  async loadLists() {
    try {
      this.showLoading();
      
      const lists = await apiService.getLists();
      this.data.lists = lists;

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

      this.data.lists = listsWithTasks;
      this.renderLists();
      
    } catch (error) {
      console.error('Failed to load lists:', error);
      toastManager.error('Error', 'Failed to load lists');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Render lists
   */
  renderLists() {
    if (!this.elements.listsGrid) return;

    // Clear existing cards
    this.listCardFactory.clear();

    if (this.data.lists.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Create list cards
    this.data.lists.forEach(listData => {
      const card = this.listCardFactory.create(listData, {
        showMenu: true,
        showProgress: true,
        showStats: true
      });

      // Set callbacks
      card.setCallbacks({
        onClick: (data) => this.openListDetail(data.id),
        onEdit: (data) => this.editList(data),
        onDelete: (data) => this.deleteList(data)
      });
    });
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    const emptyStateHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h3 class="empty-state-title">No Lists Found</h3>
        <p class="empty-state-description">
          Create your first todo list to start organizing your tasks and boost your productivity.
        </p>
        <button class="btn-primary" id="empty-create-list-btn">
          <i class="fas fa-plus"></i>
          Create New List
        </button>
      </div>
    `;

    this.elements.listsGrid.innerHTML = emptyStateHTML;

    // Bind create button
    const createBtn = Utils.getElementById('empty-create-list-btn');
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
      
      // Remove any existing list ID
      const form = modal.modal.querySelector('#list-form');
      if (form) {
        form.removeAttribute('data-list-id');
      }
      
      modal.open();
    }
  }

  /**
   * Edit list
   * @param {Object} listData - List data
   */
  editList(listData) {
    const modal = modalManager.get('list-modal');
    if (modal) {
      modal.setTitle('Edit List');
      
      // Populate form
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
   * Handle list form submission
   */
  async handleListFormSubmit() {
    const form = this.elements.listForm;
    if (!form) return;

    try {
      const formData = Utils.getFormData(form);
      const listId = form.getAttribute('data-list-id');

      if (listId) {
        // Update existing list
        await this.updateList(listId, formData);
      } else {
        // Create new list
        await this.createList(formData);
      }

      modalManager.close('list-modal');
      
    } catch (error) {
      console.error('Failed to save list:', error);
      toastManager.error('Error', error.message || 'Failed to save list');
    }
  }

  /**
   * Create new list
   * @param {Object} listData - List data
   */
  async createList(listData) {
    try {
      const newList = await apiService.createList(listData);
      toastManager.success('Success', CONFIG.SUCCESS.LIST_CREATED);
      
      // Add to local data
      this.data.lists.unshift({ ...newList, tasks: [] });
      this.renderLists();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('lists:updated'));
      
    } catch (error) {
      console.error('Failed to create list:', error);
      throw error;
    }
  }

  /**
   * Update existing list
   * @param {string|number} listId - List ID
   * @param {Object} listData - Updated list data
   */
  async updateList(listId, listData) {
    try {
      const updatedList = await apiService.updateList(listId, listData);
      toastManager.success('Success', CONFIG.SUCCESS.LIST_UPDATED);
      
      // Update local data
      const index = this.data.lists.findIndex(list => list.id == listId);
      if (index !== -1) {
        this.data.lists[index] = { ...this.data.lists[index], ...updatedList };
        this.renderLists();
      }
      
      // Update current list if it's the one being edited
      if (this.data.currentList && this.data.currentList.id == listId) {
        this.data.currentList = { ...this.data.currentList, ...updatedList };
        this.updateListDetailView();
      }
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('lists:updated'));
      
    } catch (error) {
      console.error('Failed to update list:', error);
      throw error;
    }
  }

  /**
   * Delete list
   * @param {Object} listData - List data
   */
  async deleteList(listData) {
    const confirmed = confirm(`Are you sure you want to delete "${listData.name}"? This will also delete all tasks in this list. This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      await apiService.deleteList(listData.id);
      toastManager.success('Success', CONFIG.SUCCESS.LIST_DELETED);
      
      // Remove from local data
      this.data.lists = this.data.lists.filter(list => list.id !== listData.id);
      this.renderLists();
      
      // Close detail modal if this list is open
      if (this.data.currentList && this.data.currentList.id === listData.id) {
        modalManager.close('list-detail-modal');
        this.data.currentList = null;
      }
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('lists:updated'));
      
    } catch (error) {
      console.error('Failed to delete list:', error);
      toastManager.error('Error', error.message || 'Failed to delete list');
    }
  }

  /**
   * Open list detail modal
   * @param {string|number} listId - List ID
   */
  async openListDetail(listId) {
    try {
      this.showListDetailLoading();
      
      // Find list in local data or fetch from API
      let listData = this.data.lists.find(list => list.id == listId);
      if (!listData) {
        listData = await apiService.getList(listId);
      }

      // Load tasks
      const tasks = await apiService.getListTasks(listId);
      
      this.data.currentList = { ...listData, tasks };
      this.data.currentTasks = tasks;
      
      this.renderListDetail();
      
      const modal = modalManager.get('list-detail-modal');
      if (modal) {
        modal.open();
      }
      
    } catch (error) {
      console.error('Failed to load list detail:', error);
      toastManager.error('Error', 'Failed to load list details');
    }
  }

  /**
   * Render list detail
   */
  renderListDetail() {
    if (!this.data.currentList) return;

    // Update title and description
    if (this.elements.listDetailTitle) {
      Utils.setText(this.elements.listDetailTitle, this.data.currentList.name);
    }
    
    if (this.elements.listDetailDescription) {
      Utils.setText(this.elements.listDetailDescription, this.data.currentList.description || 'No description');
    }

    // Render tasks
    this.renderTasks();
  }

  /**
   * Render tasks in list detail
   */
  renderTasks() {
    if (!this.elements.tasksContainer) return;

    // Clear existing tasks
    this.taskListManager.clear();

    if (this.data.currentTasks.length === 0) {
      this.renderTasksEmptyState();
      return;
    }

    // Create task items
    this.taskListManager.createMultiple(this.data.currentTasks, {
      showActions: true,
      showPriority: true,
      showDueDate: true
    });

    // Sort tasks by urgency
    this.taskListManager.sortByUrgency();
  }

  /**
   * Render tasks empty state
   */
  renderTasksEmptyState() {
    const emptyStateHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <h4 class="empty-state-title">No Tasks Yet</h4>
        <p class="empty-state-description">
          Add your first task to this list to get started.
        </p>
        <button class="btn-primary" id="empty-add-task-btn">
          <i class="fas fa-plus"></i>
          Add First Task
        </button>
      </div>
    `;

    this.elements.tasksContainer.innerHTML = emptyStateHTML;

    // Bind add task button
    const addBtn = Utils.getElementById('empty-add-task-btn');
    if (addBtn) {
      Utils.addEventListener(addBtn, 'click', () => {
        this.showCreateTaskModal();
      });
    }
  }

  /**
   * Show create task modal
   */
  showCreateTaskModal() {
    if (!this.data.currentList) return;

    const modal = modalManager.get('task-modal');
    if (modal) {
      modal.setTitle('Add New Task');
      modal.resetForm();
      
      // Remove any existing task ID
      const form = modal.modal.querySelector('#task-form');
      if (form) {
        form.removeAttribute('data-task-id');
      }
      
      modal.open();
    }
  }

  /**
   * Edit task
   * @param {Object} taskData - Task data
   */
  editTask(taskData) {
    const modal = modalManager.get('task-modal');
    if (modal) {
      modal.setTitle('Edit Task');
      
      // Populate form
      const form = modal.modal.querySelector('#task-form');
      if (form) {
        form.querySelector('#task-name').value = taskData.name || taskData.title || '';
        form.querySelector('#task-description').value = taskData.description || '';
        form.querySelector('#task-priority').value = taskData.priority || 'medium';
        form.querySelector('#task-due-date').value = taskData.due_date || '';
        form.setAttribute('data-task-id', taskData.id);
      }
      
      modal.open();
    }
  }

  /**
   * Handle task form submission
   */
  async handleTaskFormSubmit() {
    const form = this.elements.taskForm;
    if (!form || !this.data.currentList) return;

    try {
      const formData = Utils.getFormData(form);
      const taskId = form.getAttribute('data-task-id');

      // Add list ID to task data
      formData.list_id = this.data.currentList.id;

      if (taskId) {
        // Update existing task
        await this.updateTask(taskId, formData);
      } else {
        // Create new task
        await this.createTask(formData);
      }

      modalManager.close('task-modal');
      
    } catch (error) {
      console.error('Failed to save task:', error);
      toastManager.error('Error', error.message || 'Failed to save task');
    }
  }

  /**
   * Create new task
   * @param {Object} taskData - Task data
   */
  async createTask(taskData) {
    try {
      const newTask = await apiService.createTask(taskData);
      toastManager.success('Success', CONFIG.SUCCESS.TASK_CREATED);
      
      // Add to current tasks
      this.data.currentTasks.unshift(newTask);
      this.renderTasks();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('tasks:updated'));
      
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  /**
   * Update existing task
   * @param {string|number} taskId - Task ID
   * @param {Object} taskData - Updated task data
   */
  async updateTask(taskId, taskData) {
    try {
      const updatedTask = await apiService.updateTask(taskId, taskData);
      toastManager.success('Success', CONFIG.SUCCESS.TASK_UPDATED);
      
      // Update local data
      const index = this.data.currentTasks.findIndex(task => task.id == taskId);
      if (index !== -1) {
        this.data.currentTasks[index] = updatedTask;
        this.renderTasks();
      }
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('tasks:updated'));
      
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  /**
   * Toggle task completion
   * @param {string|number} taskId - Task ID
   * @param {boolean} completed - Completion state
   */
  async toggleTask(taskId, completed) {
    try {
      if (completed) {
        await apiService.completeTask(taskId);
        toastManager.success('Success', CONFIG.SUCCESS.TASK_COMPLETED);
      } else {
        await apiService.incompleteTask(taskId);
        toastManager.success('Success', CONFIG.SUCCESS.TASK_INCOMPLETED);
      }
      
      // Update local data
      const task = this.data.currentTasks.find(t => t.id == taskId);
      if (task) {
        task.completed = completed;
        task.is_completed = completed;
      }
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('tasks:updated'));
      
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toastManager.error('Error', error.message || 'Failed to update task');
      
      // Revert the UI change
      const taskItem = this.taskListManager.get(taskId);
      if (taskItem) {
        taskItem.updateCompletionState(!completed);
      }
    }
  }

  /**
   * Delete task
   * @param {Object} taskData - Task data
   */
  async deleteTask(taskData) {
    const confirmed = confirm(`Are you sure you want to delete "${taskData.name || taskData.title}"?`);
    
    if (!confirmed) return;

    try {
      await apiService.deleteTask(taskData.id);
      toastManager.success('Success', CONFIG.SUCCESS.TASK_DELETED);
      
      // Remove from local data
      this.data.currentTasks = this.data.currentTasks.filter(task => task.id !== taskData.id);
      this.renderTasks();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('tasks:updated'));
      
    } catch (error) {
      console.error('Failed to delete task:', error);
      toastManager.error('Error', error.message || 'Failed to delete task');
    }
  }

  /**
   * Edit current list (from detail modal)
   */
  editCurrentList() {
    if (this.data.currentList) {
      this.editList(this.data.currentList);
    }
  }

  /**
   * Delete current list (from detail modal)
   */
  async deleteCurrentList() {
    if (this.data.currentList) {
      await this.deleteList(this.data.currentList);
    }
  }

  /**
   * Update list detail view
   */
  updateListDetailView() {
    if (this.data.currentList) {
      this.renderListDetail();
    }
  }

  /**
   * Refresh lists
   */
  async refreshLists() {
    await this.loadLists();
  }

  /**
   * Refresh current list tasks
   */
  async refreshCurrentListTasks() {
    if (this.data.currentList) {
      try {
        const tasks = await apiService.getListTasks(this.data.currentList.id);
        this.data.currentTasks = tasks;
        this.renderTasks();
      } catch (error) {
        console.error('Failed to refresh tasks:', error);
      }
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.elements.listsGrid) {
      const skeletonHTML = Array(6).fill(0).map(() => `
        <div class="list-card skeleton">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </div>
      `).join('');
      
      this.elements.listsGrid.innerHTML = skeletonHTML;
    }
  }

  /**
   * Show list detail loading
   */
  showListDetailLoading() {
    const modal = modalManager.get('list-detail-modal');
    if (modal) {
      modal.showLoading();
      modal.open();
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    // Loading state is replaced by actual content
  }

  /**
   * Search lists
   * @param {string} term - Search term
   */
  searchLists(term) {
    const filteredLists = this.listCardFactory.search(term);
    
    // Hide/show cards based on search
    this.listCardFactory.getAll().forEach(card => {
      const element = card.getElement();
      if (filteredLists.includes(card)) {
        Utils.removeClass(element, 'hidden');
      } else {
        Utils.addClass(element, 'hidden');
      }
    });
  }

  /**
   * Sort lists
   * @param {string} sortBy - Sort criteria
   */
  sortLists(sortBy) {
    let compareFn;
    
    switch (sortBy) {
      case 'name':
        compareFn = (a, b) => a.getData().name.localeCompare(b.getData().name);
        break;
      case 'created':
        compareFn = (a, b) => new Date(b.getData().created_at) - new Date(a.getData().created_at);
        break;
      case 'updated':
        compareFn = (a, b) => new Date(b.getData().updated_at) - new Date(a.getData().updated_at);
        break;
      case 'progress':
        compareFn = (a, b) => {
          const aStats = a.getStats();
          const bStats = b.getStats();
          return bStats.percentage - aStats.percentage;
        };
        break;
      default:
        return;
    }
    
    this.listCardFactory.sort(compareFn);
  }

  /**
   * Destroy lists controller
   */
  destroy() {
    this.isInitialized = false;
    this.listCardFactory.clear();
    this.taskListManager.clear();
  }

  /**
   * Get current data
   * @returns {Object} - Current lists data
   */
  getData() {
    return {
      lists: this.data.lists,
      currentList: this.data.currentList,
      currentTasks: this.data.currentTasks
    };
  }
}

/**
 * Global lists controller instance
 */
const listsController = new ListsController();

// Make it globally accessible
window.listsController = listsController;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ListsController, listsController };
}
