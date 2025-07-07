/**
 * Task Item Component for Todo List Application
 * Reusable component for displaying individual tasks
 * PT Erajaya Swasembada
 */

class TaskItem {
  constructor(taskData, options = {}) {
    this.taskData = taskData;
    this.options = {
      showActions: true,
      showPriority: true,
      showDueDate: true,
      showDescription: true,
      editable: true,
      ...options
    };
    this.element = null;
    this.callbacks = {
      onToggle: null,
      onEdit: null,
      onDelete: null,
      onClick: null
    };

    this.create();
  }

  /**
   * Create task item element
   */
  create() {
    this.element = document.createElement('div');
    this.element.className = `task-item ${this.taskData.completed || this.taskData.is_completed ? 'completed' : ''}`;
    this.element.setAttribute('data-task-id', this.taskData.id);

    this.render();
    this.bindEvents();
  }

  /**
   * Render task content
   */
  render() {
    const isCompleted = this.taskData.completed || this.taskData.is_completed;
    const priority = this.taskData.priority || 'medium';
    const dueDate = this.taskData.due_date;

    const html = `
      <div class="task-checkbox ${isCompleted ? 'checked' : ''}" 
           title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
      </div>
      
      <div class="task-content">
        <div class="task-name">${Utils.escapeHTML(this.taskData.name || this.taskData.title || 'Untitled Task')}</div>
        
        <div class="task-meta">
          ${this.options.showPriority ? `
            <span class="task-priority ${priority}">
              <i class="fas fa-flag"></i>
              ${priority}
            </span>
          ` : ''}
          
          ${this.options.showDueDate && dueDate ? `
            <span class="task-due-date ${Utils.isOverdue(dueDate) ? 'overdue' : ''}">
              <i class="fas fa-calendar"></i>
              ${Utils.formatDate(dueDate)}
            </span>
          ` : ''}
          
          ${this.taskData.created_at ? `
            <span class="task-created">
              <i class="fas fa-clock"></i>
              ${Utils.formatRelativeTime(this.taskData.created_at)}
            </span>
          ` : ''}
        </div>
        
        ${this.options.showDescription && this.taskData.description ? `
          <div class="task-description">${Utils.escapeHTML(this.taskData.description)}</div>
        ` : ''}
      </div>
      
      ${this.options.showActions ? this.renderActions() : ''}
    `;

    this.element.innerHTML = html;
  }

  /**
   * Render task actions
   * @returns {string} - Actions HTML
   */
  renderActions() {
    return `
      <div class="task-actions">
        ${this.options.editable ? `
          <button class="btn-icon btn-edit" title="Edit Task">
            <i class="fas fa-edit"></i>
          </button>
        ` : ''}
        <button class="btn-icon btn-delete btn-danger" title="Delete Task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Checkbox toggle
    const checkbox = this.element.querySelector('.task-checkbox');
    if (checkbox) {
      Utils.addEventListener(checkbox, 'click', (e) => {
        e.stopPropagation();
        this.handleToggle(e);
      });
    }

    // Task content click
    const content = this.element.querySelector('.task-content');
    if (content) {
      Utils.addEventListener(content, 'click', (e) => {
        this.handleClick(e);
      });
    }

    // Action buttons
    if (this.options.showActions) {
      const editBtn = this.element.querySelector('.btn-edit');
      const deleteBtn = this.element.querySelector('.btn-delete');

      if (editBtn) {
        Utils.addEventListener(editBtn, 'click', (e) => {
          e.stopPropagation();
          this.handleEdit(e);
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
   * Handle checkbox toggle
   * @param {Event} e - Click event
   */
  handleToggle(e) {
    const newState = !(this.taskData.completed || this.taskData.is_completed);
    
    // Update local state immediately for responsive UI
    this.updateCompletionState(newState);

    if (this.callbacks.onToggle) {
      this.callbacks.onToggle(this.taskData, newState, this, e);
    }

    // Dispatch custom event
    this.element.dispatchEvent(new CustomEvent('task:toggle', {
      detail: { 
        taskData: this.taskData, 
        completed: newState, 
        task: this 
      },
      bubbles: true
    }));
  }

  /**
   * Handle task click
   * @param {Event} e - Click event
   */
  handleClick(e) {
    if (this.callbacks.onClick) {
      this.callbacks.onClick(this.taskData, this, e);
    }

    this.element.dispatchEvent(new CustomEvent('task:click', {
      detail: { taskData: this.taskData, task: this },
      bubbles: true
    }));
  }

  /**
   * Handle edit button click
   * @param {Event} e - Click event
   */
  handleEdit(e) {
    if (this.callbacks.onEdit) {
      this.callbacks.onEdit(this.taskData, this, e);
    }

    this.element.dispatchEvent(new CustomEvent('task:edit', {
      detail: { taskData: this.taskData, task: this },
      bubbles: true
    }));
  }

  /**
   * Handle delete button click
   * @param {Event} e - Click event
   */
  handleDelete(e) {
    if (this.callbacks.onDelete) {
      this.callbacks.onDelete(this.taskData, this, e);
    }

    this.element.dispatchEvent(new CustomEvent('task:delete', {
      detail: { taskData: this.taskData, task: this },
      bubbles: true
    }));
  }

  /**
   * Update completion state
   * @param {boolean} completed - Completion state
   */
  updateCompletionState(completed) {
    this.taskData.completed = completed;
    this.taskData.is_completed = completed;

    const checkbox = this.element.querySelector('.task-checkbox');
    if (checkbox) {
      if (completed) {
        Utils.addClass(checkbox, 'checked');
        Utils.addClass(this.element, 'completed');
      } else {
        Utils.removeClass(checkbox, 'checked');
        Utils.removeClass(this.element, 'completed');
      }
    }
  }

  /**
   * Update task data and re-render
   * @param {Object} newData - Updated task data
   */
  update(newData) {
    this.taskData = { ...this.taskData, ...newData };
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
    const spinner = document.createElement('div');
    spinner.className = 'task-spinner';
    spinner.innerHTML = '<div class="spinner"></div>';
    this.element.appendChild(spinner);
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    Utils.removeClass(this.element, 'loading');
    const spinner = this.element.querySelector('.task-spinner');
    if (spinner) {
      spinner.remove();
    }
  }

  /**
   * Highlight task (e.g., after creation/update)
   */
  highlight() {
    Utils.addClass(this.element, 'highlight');
    setTimeout(() => {
      Utils.removeClass(this.element, 'highlight');
    }, 2000);
  }

  /**
   * Check if task is overdue
   * @returns {boolean} - True if task is overdue
   */
  isOverdue() {
    const dueDate = this.taskData.due_date;
    return dueDate && Utils.isOverdue(dueDate) && !this.isCompleted();
  }

  /**
   * Check if task is completed
   * @returns {boolean} - True if task is completed
   */
  isCompleted() {
    return this.taskData.completed || this.taskData.is_completed;
  }

  /**
   * Get task priority level
   * @returns {string} - Priority level
   */
  getPriority() {
    return this.taskData.priority || 'medium';
  }

  /**
   * Get task urgency score (for sorting)
   * @returns {number} - Urgency score
   */
  getUrgencyScore() {
    let score = 0;
    
    // Priority weight
    const priority = this.getPriority();
    switch (priority) {
      case 'high': score += 100; break;
      case 'medium': score += 50; break;
      case 'low': score += 10; break;
    }
    
    // Due date weight
    const dueDate = this.taskData.due_date;
    if (dueDate) {
      const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue < 0) {
        score += 200; // Overdue
      } else if (daysUntilDue <= 1) {
        score += 150; // Due today/tomorrow
      } else if (daysUntilDue <= 7) {
        score += 75; // Due this week
      }
    }
    
    return score;
  }

  /**
   * Get DOM element
   * @returns {HTMLElement} - Task element
   */
  getElement() {
    return this.element;
  }

  /**
   * Get task data
   * @returns {Object} - Task data
   */
  getData() {
    return { ...this.taskData };
  }

  /**
   * Destroy task component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.callbacks = {};
  }

  /**
   * Clone task with new data
   * @param {Object} newData - Data for cloned task
   * @returns {TaskItem} - New task instance
   */
  clone(newData = {}) {
    const clonedData = {
      ...this.taskData,
      ...newData,
      id: newData.id || Utils.generateId(),
      name: newData.name || `${this.taskData.name} (Copy)`,
      completed: false,
      is_completed: false
    };

    return new TaskItem(clonedData, this.options);
  }

  /**
   * Export task data
   * @returns {Object} - Exportable task data
   */
  export() {
    return {
      taskData: this.getData(),
      isCompleted: this.isCompleted(),
      isOverdue: this.isOverdue(),
      priority: this.getPriority(),
      urgencyScore: this.getUrgencyScore()
    };
  }
}

/**
 * Task List Manager - Manages multiple task items
 */
class TaskListManager {
  constructor() {
    this.tasks = new Map();
    this.container = null;
    this.emptyState = null;
  }

  /**
   * Set container element for tasks
   * @param {HTMLElement|string} container - Container element or selector
   */
  setContainer(container) {
    this.container = typeof container === 'string' 
      ? Utils.querySelector(container) 
      : container;
  }

  /**
   * Set empty state element
   * @param {HTMLElement|string} emptyState - Empty state element or HTML
   */
  setEmptyState(emptyState) {
    this.emptyState = emptyState;
  }

  /**
   * Create and add task to container
   * @param {Object} taskData - Task data
   * @param {Object} options - Task options
   * @returns {TaskItem} - Task instance
   */
  create(taskData, options = {}) {
    const task = new TaskItem(taskData, options);
    this.tasks.set(taskData.id, task);

    if (this.container) {
      this.container.appendChild(task.getElement());
    }

    this.updateEmptyState();
    return task;
  }

  /**
   * Create multiple tasks
   * @param {Array} tasksData - Array of task data
   * @param {Object} options - Task options
   * @returns {Array} - Array of task instances
   */
  createMultiple(tasksData, options = {}) {
    const tasks = tasksData.map(taskData => {
      const task = new TaskItem(taskData, options);
      this.tasks.set(taskData.id, task);
      return task;
    });

    if (this.container) {
      tasks.forEach(task => {
        this.container.appendChild(task.getElement());
      });
    }

    this.updateEmptyState();
    return tasks;
  }

  /**
   * Get task by ID
   * @param {string|number} taskId - Task ID
   * @returns {TaskItem|null} - Task instance or null
   */
  get(taskId) {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Update task
   * @param {string|number} taskId - Task ID
   * @param {Object} newData - Updated data
   * @returns {boolean} - Success status
   */
  update(taskId, newData) {
    const task = this.get(taskId);
    if (task) {
      task.update(newData);
      return true;
    }
    return false;
  }

  /**
   * Remove task
   * @param {string|number} taskId - Task ID
   * @returns {boolean} - Success status
   */
  remove(taskId) {
    const task = this.get(taskId);
    if (task) {
      task.destroy();
      this.tasks.delete(taskId);
      this.updateEmptyState();
      return true;
    }
    return false;
  }

  /**
   * Clear all tasks
   */
  clear() {
    this.tasks.forEach(task => task.destroy());
    this.tasks.clear();
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.updateEmptyState();
  }

  /**
   * Get all tasks
   * @returns {Array} - Array of task instances
   */
  getAll() {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks count
   * @returns {number} - Number of tasks
   */
  getCount() {
    return this.tasks.size;
  }

  /**
   * Get completed tasks count
   * @returns {number} - Number of completed tasks
   */
  getCompletedCount() {
    return this.getAll().filter(task => task.isCompleted()).length;
  }

  /**
   * Get pending tasks count
   * @returns {number} - Number of pending tasks
   */
  getPendingCount() {
    return this.getCount() - this.getCompletedCount();
  }

  /**
   * Get overdue tasks
   * @returns {Array} - Array of overdue tasks
   */
  getOverdueTasks() {
    return this.getAll().filter(task => task.isOverdue());
  }

  /**
   * Filter tasks by criteria
   * @param {Function} predicate - Filter function
   * @returns {Array} - Filtered tasks
   */
  filter(predicate) {
    return this.getAll().filter(predicate);
  }

  /**
   * Sort tasks by criteria
   * @param {Function} compareFn - Compare function
   * @returns {Array} - Sorted tasks
   */
  sort(compareFn) {
    const sortedTasks = this.getAll().sort(compareFn);
    
    // Re-append in sorted order if container exists
    if (this.container) {
      sortedTasks.forEach(task => {
        this.container.appendChild(task.getElement());
      });
    }
    
    return sortedTasks;
  }

  /**
   * Sort tasks by urgency (priority + due date)
   */
  sortByUrgency() {
    return this.sort((a, b) => b.getUrgencyScore() - a.getUrgencyScore());
  }

  /**
   * Sort tasks by completion status
   */
  sortByCompletion() {
    return this.sort((a, b) => {
      if (a.isCompleted() !== b.isCompleted()) {
        return a.isCompleted() ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Search tasks by term
   * @param {string} term - Search term
   * @returns {Array} - Matching tasks
   */
  search(term) {
    const searchTerm = term.toLowerCase();
    return this.filter(task => {
      const data = task.getData();
      return (
        data.name.toLowerCase().includes(searchTerm) ||
        (data.description && data.description.toLowerCase().includes(searchTerm))
      );
    });
  }

  /**
   * Update empty state visibility
   */
  updateEmptyState() {
    if (!this.container || !this.emptyState) return;

    const isEmpty = this.getCount() === 0;
    const emptyStateElement = typeof this.emptyState === 'string'
      ? this.container.querySelector(this.emptyState)
      : this.emptyState;

    if (emptyStateElement) {
      if (isEmpty) {
        Utils.removeClass(emptyStateElement, 'hidden');
      } else {
        Utils.addClass(emptyStateElement, 'hidden');
      }
    }
  }

  /**
   * Get statistics
   * @returns {Object} - Task statistics
   */
  getStats() {
    const all = this.getAll();
    const completed = all.filter(task => task.isCompleted());
    const pending = all.filter(task => !task.isCompleted());
    const overdue = all.filter(task => task.isOverdue());

    return {
      total: all.length,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      completionRate: all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0
    };
  }
}

/**
 * Global task list manager instance
 */
const taskListManager = new TaskListManager();

// Make it globally accessible
window.taskListManager = taskListManager;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TaskItem, TaskListManager, taskListManager };
}
