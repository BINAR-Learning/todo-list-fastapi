/**
 * API Service for Todo List Application
 * Handles all HTTP requests to the backend API
 * PT Erajaya Swasembada
 */

class ApiService {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Get authentication headers
   * @returns {Object} - Headers with auth token
   */
  getAuthHeaders() {
    const token = StorageUtils.get(CONFIG.STORAGE.TOKEN);
    const headers = { ...this.defaultHeaders };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   * @param {Response} response - Fetch response
   * @returns {Promise<Object>} - Parsed response data
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data = null;

    // Parse response based on content type
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
      }
    } else {
      data = await response.text();
    }

    // Handle different status codes
    if (response.ok) {
      return data;
    }

    // Handle specific error cases
    switch (response.status) {
      case CONFIG.HTTP_STATUS.UNAUTHORIZED:
        // Clear stored token and redirect to login
        this.handleUnauthorized();
        throw new Error(CONFIG.ERRORS.UNAUTHORIZED);
      
      case CONFIG.HTTP_STATUS.FORBIDDEN:
        throw new Error(CONFIG.ERRORS.FORBIDDEN);
      
      case CONFIG.HTTP_STATUS.NOT_FOUND:
        throw new Error(CONFIG.ERRORS.NOT_FOUND);
      
      case CONFIG.HTTP_STATUS.UNPROCESSABLE_ENTITY:
        // Return validation errors
        const errorMessage = data?.detail || CONFIG.ERRORS.VALIDATION;
        const error = new Error(errorMessage);
        error.details = data;
        throw error;
      
      case CONFIG.HTTP_STATUS.INTERNAL_SERVER_ERROR:
        throw new Error(CONFIG.ERRORS.SERVER);
      
      default:
        const message = data?.detail || data?.message || CONFIG.ERRORS.UNKNOWN;
        throw new Error(message);
    }
  }

  /**
   * Handle unauthorized requests
   */
  handleUnauthorized() {
    StorageUtils.remove(CONFIG.STORAGE.TOKEN);
    StorageUtils.remove(CONFIG.STORAGE.USER);
    
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} - Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    // Log API request if debugging is enabled
    if (CONFIG.DEBUG?.LOG_API_REQUESTS) {
      console.group(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      console.log('📡 URL:', url);
      console.log('📋 Headers:', config.headers);
      if (config.body) {
        console.log('📦 Body:', config.body);
      }
      console.log('⏱️ Timestamp:', new Date().toISOString());
      console.groupEnd();
    }

    try {
      const startTime = performance.now();
      const response = await fetch(url, config);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Log API response if debugging is enabled
      if (CONFIG.DEBUG?.LOG_API_RESPONSES) {
        console.group(`📡 API Response: ${response.status} ${response.statusText}`);
        console.log('📡 URL:', url);
        console.log('🎯 Status:', response.status, response.statusText);
        console.log('⏱️ Duration:', `${duration}ms`);
        console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
        console.groupEnd();
      }

      const result = await this.handleResponse(response);

      // Log successful response data if debugging is enabled
      if (CONFIG.DEBUG?.LOG_API_RESPONSES && result) {
        console.group(`✅ API Response Data: ${options.method || 'GET'} ${endpoint}`);
        console.log('📦 Data:', result);
        console.groupEnd();
      }

      return result;
    } catch (error) {
      // Log API errors if debugging is enabled
      if (CONFIG.DEBUG?.LOG_API_ERRORS) {
        console.group(`❌ API Error: ${options.method || 'GET'} ${endpoint}`);
        console.error('🚨 Error:', error.message);
        console.error('📡 URL:', url);
        console.error('📋 Headers:', config.headers);
        if (config.body) {
          console.error('📦 Body:', config.body);
        }
        console.error('⏱️ Timestamp:', new Date().toISOString());
        console.groupEnd();
      }

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(CONFIG.ERRORS.NETWORK);
      }
      throw error;
    }
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Response data
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.pathname + url.search, {
      method: 'GET'
    });
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} - Response data
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} - Response data
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Make PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} - Response data
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Authentication API methods
  
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - User data and token
   */
  async register(userData) {
    return this.post(CONFIG.API.ENDPOINTS.AUTH.REGISTER, userData);
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} - User data and token
   */
  async login(credentials) {
    return this.post(CONFIG.API.ENDPOINTS.AUTH.LOGIN, credentials);
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} - New token
   */
  async refreshToken() {
    return this.post(CONFIG.API.ENDPOINTS.AUTH.REFRESH);
  }

  // User API methods

  /**
   * Get current user profile
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile() {
    return this.get(CONFIG.API.ENDPOINTS.USERS.PROFILE);
  }

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} - Updated user data
   */
  async updateUserProfile(userData) {
    return this.put(CONFIG.API.ENDPOINTS.USERS.UPDATE, userData);
  }

  // Lists API methods

  /**
   * Get all lists for current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - Array of lists
   */
  async getLists(params = {}) {
    return this.get(CONFIG.API.ENDPOINTS.LISTS.BASE, params);
  }

  /**
   * Get list by ID
   * @param {string|number} listId - List ID
   * @returns {Promise<Object>} - List data
   */
  async getList(listId) {
    return this.get(CONFIG.API.ENDPOINTS.LISTS.BY_ID(listId));
  }

  /**
   * Create new list
   * @param {Object} listData - List data
   * @returns {Promise<Object>} - Created list data
   */
  async createList(listData) {
    return this.post(CONFIG.API.ENDPOINTS.LISTS.BASE, listData);
  }

  /**
   * Update list
   * @param {string|number} listId - List ID
   * @param {Object} listData - Updated list data
   * @returns {Promise<Object>} - Updated list data
   */
  async updateList(listId, listData) {
    return this.put(CONFIG.API.ENDPOINTS.LISTS.BY_ID(listId), listData);
  }

  /**
   * Delete list
   * @param {string|number} listId - List ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteList(listId) {
    return this.delete(CONFIG.API.ENDPOINTS.LISTS.BY_ID(listId));
  }

  /**
   * Get tasks for a list
   * @param {string|number} listId - List ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - Array of tasks
   */
  async getListTasks(listId, params = {}) {
    return this.get(CONFIG.API.ENDPOINTS.LISTS.TASKS(listId), params);
  }

  // Tasks API methods

  /**
   * Get all tasks for current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - Array of tasks
   */
  async getTasks(params = {}) {
    return this.get(CONFIG.API.ENDPOINTS.TASKS.BASE, params);
  }

  /**
   * Get task by ID
   * @param {string|number} taskId - Task ID
   * @returns {Promise<Object>} - Task data
   */
  async getTask(taskId) {
    return this.get(CONFIG.API.ENDPOINTS.TASKS.BY_ID(taskId));
  }

  /**
   * Create new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} - Created task data
   */
  async createTask(taskData) {
    return this.post(CONFIG.API.ENDPOINTS.TASKS.BASE, taskData);
  }

  /**
   * Update task
   * @param {string|number} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} - Updated task data
   */
  async updateTask(taskId, taskData) {
    return this.put(CONFIG.API.ENDPOINTS.TASKS.BY_ID(taskId), taskData);
  }

  /**
   * Delete task
   * @param {string|number} taskId - Task ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteTask(taskId) {
    return this.delete(CONFIG.API.ENDPOINTS.TASKS.BY_ID(taskId));
  }

  /**
   * Mark task as completed
   * @param {string|number} taskId - Task ID
   * @returns {Promise<Object>} - Updated task data
   */
  async completeTask(taskId) {
    return this.post(CONFIG.API.ENDPOINTS.TASKS.COMPLETE(taskId));
  }

  /**
   * Mark task as incomplete
   * @param {string|number} taskId - Task ID
   * @returns {Promise<Object>} - Updated task data
   */
  async incompleteTask(taskId) {
    return this.post(CONFIG.API.ENDPOINTS.TASKS.INCOMPLETE(taskId));
  }

  /**
   * Upload file (if file upload is supported)
   * @param {string} endpoint - Upload endpoint
   * @param {FormData} formData - Form data with file
   * @returns {Promise<Object>} - Upload result
   */
  async uploadFile(endpoint, formData) {
    const headers = { ...this.getAuthHeaders() };
    delete headers['Content-Type']; // Let browser set content-type for FormData

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: formData
    });
  }

  /**
   * Health check endpoint
   * @returns {Promise<Object>} - Health status
   */
  async healthCheck() {
    try {
      return await this.get('/health');
    } catch (error) {
      throw new Error('API health check failed');
    }
  }
}

/**
 * Singleton API service instance
 */
const apiService = new ApiService();

// Handle unauthorized events globally
window.addEventListener('auth:unauthorized', () => {
  // Redirect to login page or show login modal
  if (window.authManager) {
    window.authManager.logout(false); // Don't call API logout since we're already unauthorized
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiService, apiService };
}
