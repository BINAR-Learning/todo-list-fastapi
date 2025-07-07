# API Integration Guide

This document provides comprehensive guidance on integrating with the Todo List API backend.

## Table of Contents

- [API Service Overview](#api-service-overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## API Service Overview

### Location
`assets/js/api.js`

### Features

- **HTTP Client**: Axios-based HTTP client with interceptors
- **Authentication**: Automatic token handling
- **Error Handling**: Centralized error processing
- **Request/Response Logging**: Debug-friendly logging
- **Timeout Management**: Configurable request timeouts
- **Base URL Configuration**: Environment-specific URLs

### Configuration

```javascript
// In config.js
const CONFIG = {
  API: {
    BASE_URL: 'http://localhost:8000/v1',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
  }
};
```

---

## Authentication

### Overview

The API supports dual authentication methods:
1. **Bearer Token**: JWT tokens (recommended)
2. **Basic Auth**: Direct email/password

### Token Management

```javascript
// Login and get token
const response = await ApiService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Token is automatically stored and used for subsequent requests
console.log(response.token); // JWT token

// Logout (clears token)
ApiService.logout();
```

### Manual Token Handling

```javascript
// Set token manually
ApiService.setAuthToken('your-jwt-token-here');

// Get current token
const token = ApiService.getAuthToken();

// Clear token
ApiService.clearAuthToken();
```

### Basic Auth (Alternative)

```javascript
// Set basic auth credentials
ApiService.setBasicAuth('user@example.com', 'password123');

// Clear basic auth
ApiService.clearBasicAuth();
```

---

## Error Handling

### Global Error Handler

The API service includes a global error handler that processes all API errors:

```javascript
// Error response structure
{
  success: false,
  error: {
    message: 'Human-readable error message',
    code: 'ERROR_CODE',
    details: 'Detailed error information',
    status: 400
  }
}
```

### Error Types

| Status Code | Type | Description |
|-------------|------|-------------|
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `422` | Validation Error | Request validation failed |
| `500` | Server Error | Internal server error |

### Custom Error Handling

```javascript
try {
  const response = await ApiService.getLists();
  // Handle success
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
    AuthManager.logout();
    window.location.reload();
  } else if (error.status === 404) {
    // Handle not found
    Toast.error('Resource not found');
  } else {
    // Handle general error
    Toast.error(error.message || 'An error occurred');
  }
}
```

---

## API Endpoints

### Authentication Endpoints

#### Register User
```javascript
ApiService.register({
  email: 'user@example.com',
  username: 'username', // optional
  password: 'StrongPass123!'
})
```

**Response:**
```javascript
{
  success: true,
  data: {
    message: 'User registered successfully.',
    userId: '654321abcdef',
    email: 'user@example.com'
  }
}
```

#### Login (Email)
```javascript
ApiService.login({
  email: 'user@example.com',
  password: 'StrongPass123!'
})
```

**Response:**
```javascript
{
  success: true,
  data: {
    message: 'Login successful.',
    token: 'jwt-token-here',
    token_type: 'bearer',
    expires_in: 30
  }
}
```

#### Login (Username)
```javascript
ApiService.loginUsername({
  username: 'username',
  password: 'StrongPass123!'
})
```

### List Management Endpoints

#### Get All Lists
```javascript
ApiService.getLists()
```

**Response:**
```javascript
{
  success: true,
  data: [
    {
      id: 'list123',
      name: 'Shopping List',
      userId: 'user123',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ]
}
```

#### Create List
```javascript
ApiService.createList({
  name: 'New List'
})
```

#### Get List by ID
```javascript
ApiService.getList('list123')
```

#### Update List
```javascript
ApiService.updateList('list123', {
  name: 'Updated List Name'
})
```

#### Delete List
```javascript
ApiService.deleteList('list123')
```

### Task Management Endpoints

#### Get Tasks in List
```javascript
ApiService.getTasks('list123')
```

**Response:**
```javascript
{
  success: true,
  data: [
    {
      id: 'task456',
      listId: 'list123',
      description: 'Buy milk',
      completed: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ]
}
```

#### Create Task
```javascript
ApiService.createTask('list123', {
  description: 'New task',
  completed: false
})
```

#### Get Task by ID
```javascript
ApiService.getTask('task456')
```

#### Update Task
```javascript
ApiService.updateTask('task456', {
  description: 'Updated task',
  completed: true
})
```

#### Delete Task
```javascript
ApiService.deleteTask('task456')
```

---

## Data Models

### User Model
```javascript
{
  id: String,           // Unique identifier
  username: String,     // Username (optional)
  email: String,        // Email address
  is_verified: Boolean, // Email verification status
  is_active: Boolean,   // Account active status
  created_at: String,   // ISO date string
  updated_at: String    // ISO date string
}
```

### List Model
```javascript
{
  id: String,         // Unique identifier
  name: String,       // List name
  userId: String,     // Owner user ID
  created_at: String, // ISO date string
  updated_at: String  // ISO date string
}
```

### Task Model
```javascript
{
  id: String,         // Unique identifier
  listId: String,     // Parent list ID
  description: String, // Task description
  completed: Boolean, // Completion status
  created_at: String, // ISO date string
  updated_at: String  // ISO date string
}
```

---

## Usage Examples

### Complete Registration Flow
```javascript
async function registerUser(userData) {
  try {
    // Register user
    const registerResponse = await ApiService.register(userData);
    Toast.success('Registration successful!');
    
    // Automatically login
    const loginResponse = await ApiService.login({
      email: userData.email,
      password: userData.password
    });
    
    // Store user session
    AuthManager.setUser(loginResponse.data);
    
    // Redirect to dashboard
    window.location.hash = '#dashboard';
    
  } catch (error) {
    Toast.error(error.message);
  }
}
```

### List Management Flow
```javascript
async function createAndPopulateList(listName, tasks) {
  try {
    // Create list
    const listResponse = await ApiService.createList({ name: listName });
    const listId = listResponse.data.id;
    
    // Add tasks
    const taskPromises = tasks.map(description => 
      ApiService.createTask(listId, { description })
    );
    
    await Promise.all(taskPromises);
    
    Toast.success(`Created "${listName}" with ${tasks.length} tasks`);
    
    // Refresh UI
    await loadLists();
    
  } catch (error) {
    Toast.error(`Failed to create list: ${error.message}`);
  }
}
```

### Task Management Flow
```javascript
async function toggleTaskCompletion(taskId, currentStatus) {
  try {
    // Update task
    const response = await ApiService.updateTask(taskId, {
      completed: !currentStatus
    });
    
    // Update UI
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    taskElement.classList.toggle('completed', response.data.completed);
    
    // Show feedback
    const message = response.data.completed ? 'Task completed!' : 'Task reopened';
    Toast.success(message);
    
  } catch (error) {
    Toast.error(`Failed to update task: ${error.message}`);
  }
}
```

### Error Recovery
```javascript
async function robustApiCall(apiFunction, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      lastError = error;
      
      // Don't retry client errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
}

// Usage
const lists = await robustApiCall(() => ApiService.getLists());
```

---

## Best Practices

### Performance Optimization

1. **Request Batching**: Combine related requests when possible
2. **Caching**: Cache frequently accessed data
3. **Pagination**: Use pagination for large datasets
4. **Debouncing**: Debounce search and filter operations

```javascript
// Debounced search
const debouncedSearch = Utils.debounce(async (query) => {
  const results = await ApiService.searchTasks(query);
  displaySearchResults(results);
}, 300);
```

### Data Synchronization

1. **Optimistic Updates**: Update UI immediately, revert on failure
2. **Real-time Updates**: Use WebSockets for real-time synchronization
3. **Conflict Resolution**: Handle concurrent modifications gracefully

```javascript
// Optimistic update example
async function optimisticToggleTask(taskId, currentStatus) {
  // Update UI immediately
  updateTaskUI(taskId, !currentStatus);
  
  try {
    // Send API request
    await ApiService.updateTask(taskId, { completed: !currentStatus });
  } catch (error) {
    // Revert UI on failure
    updateTaskUI(taskId, currentStatus);
    Toast.error('Failed to update task');
  }
}
```

### Security

1. **Token Expiration**: Handle token expiration gracefully
2. **HTTPS**: Always use HTTPS in production
3. **Input Validation**: Validate data before sending to API
4. **XSS Prevention**: Sanitize user input

```javascript
// Token refresh example
ApiService.interceptors.response.use(
  response => response,
  async error => {
    if (error.status === 401 && error.config && !error.config._retry) {
      error.config._retry = true;
      
      try {
        await ApiService.refreshToken();
        return ApiService.request(error.config);
      } catch (refreshError) {
        AuthManager.logout();
        window.location.reload();
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Error Handling

1. **User-Friendly Messages**: Show clear, actionable error messages
2. **Logging**: Log errors for debugging
3. **Fallbacks**: Provide fallback options when possible
4. **Recovery**: Offer ways to recover from errors

```javascript
// Comprehensive error handling
async function handleApiError(error, context = '') {
  // Log for debugging
  console.error(`API Error ${context}:`, error);
  
  // User-friendly messages
  const userMessage = getUserFriendlyErrorMessage(error);
  Toast.error(userMessage);
  
  // Specific handling
  switch (error.status) {
    case 401:
      AuthManager.logout();
      break;
    case 403:
      showPermissionError();
      break;
    case 404:
      showNotFoundError();
      break;
    case 500:
      showServerError();
      break;
  }
}
```

### Testing

1. **Mock API**: Use mock responses for testing
2. **Error Scenarios**: Test error handling
3. **Network Conditions**: Test slow/offline scenarios
4. **Edge Cases**: Test boundary conditions

```javascript
// Mock API for testing
class MockApiService {
  static async getLists() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockLists
        });
      }, 1000);
    });
  }
}

// Use mock in development
const currentApiService = CONFIG.ENVIRONMENT === 'development' 
  ? MockApiService 
  : ApiService;
```

---

## Debugging

### API Request Logging

Enable request/response logging in development:

```javascript
// In config.js
const CONFIG = {
  DEBUG: {
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: true,
    LOG_API_ERRORS: true
  }
};
```

### Network Tab

Use browser Developer Tools Network tab to:
1. Monitor request/response headers
2. Check request timing
3. Verify response data
4. Debug CORS issues

### Common Issues

1. **CORS Errors**: Configure backend CORS settings
2. **Authentication**: Check token format and expiration
3. **Content-Type**: Ensure correct Content-Type headers
4. **Base URL**: Verify API base URL configuration

---

## Migration Guide

### From v1.0 to v2.0

Breaking changes and migration steps:

1. **Authentication**: Email-based login is now primary
2. **Response Format**: All responses now wrapped in success/data structure
3. **Error Handling**: New error response format
4. **Token Storage**: Token key changed from `token` to `todo_app_token`

```javascript
// Old format
const response = await fetch('/api/lists');
const lists = await response.json();

// New format
const response = await ApiService.getLists();
const lists = response.data;
```
