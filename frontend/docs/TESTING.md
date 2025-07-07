# Testing Guide

This document outlines the testing strategy and implementation for the Todo List frontend application.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Browser Testing](#browser-testing)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [Security Testing](#security-testing)

---

## Testing Strategy

### Testing Pyramid

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions
3. **End-to-End Tests**: Test complete user workflows
4. **Manual Tests**: Test usability and edge cases

### Test Coverage Areas

- **Authentication**: Login, logout, token management
- **CRUD Operations**: Create, read, update, delete for lists and tasks
- **UI Components**: Modal, toast, form validation
- **Responsive Design**: Mobile, tablet, desktop layouts
- **Error Handling**: Network errors, validation errors
- **Performance**: Load times, smooth animations
- **Accessibility**: Screen reader support, keyboard navigation

---

## Manual Testing

### Test Checklist

#### Authentication Flow
- [ ] Register new user with valid email/password
- [ ] Register with invalid email format
- [ ] Register with weak password
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Token expiration handling
- [ ] Remember me functionality (if implemented)

#### List Management
- [ ] Create new list with valid name
- [ ] Create list with empty name (validation)
- [ ] View all lists
- [ ] Edit list name
- [ ] Delete list
- [ ] Delete list with tasks (confirmation)

#### Task Management
- [ ] Create new task in list
- [ ] Mark task as complete
- [ ] Mark task as incomplete
- [ ] Edit task description
- [ ] Delete task
- [ ] View tasks in list

#### UI/UX Testing
- [ ] Navigation between pages
- [ ] Modal dialogs open/close correctly
- [ ] Toast notifications appear and disappear
- [ ] Form validation messages
- [ ] Loading states displayed
- [ ] Error states handled gracefully
- [ ] Empty states shown appropriately

#### Responsive Design
- [ ] Mobile layout (320px - 768px)
- [ ] Tablet layout (768px - 1024px)
- [ ] Desktop layout (1024px+)
- [ ] Navigation menu on mobile
- [ ] Touch interactions work properly
- [ ] Text remains readable at all sizes

#### Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Test Data

#### Valid Test Users
```
Email: test@example.com
Password: TestPassword123!

Email: user@test.com
Password: SecurePass456!
```

#### Test Lists
```
- Shopping List
- Work Tasks
- Personal Goals
- Project Ideas
```

#### Test Tasks
```
Shopping List:
- Buy groceries
- Pick up dry cleaning
- Get gas for car

Work Tasks:
- Review code
- Attend team meeting
- Update documentation
```

---

## Automated Testing

### Unit Testing Framework

Although not currently implemented, here's the recommended setup:

```javascript
// Example test structure
describe('Utils', () => {
  describe('validateEmail', () => {
    test('should validate correct email format', () => {
      expect(ValidationUtils.validateEmail('test@example.com')).toBe(true);
    });
    
    test('should reject invalid email format', () => {
      expect(ValidationUtils.validateEmail('invalid-email')).toBe(false);
    });
  });
});

describe('ApiService', () => {
  beforeEach(() => {
    // Mock fetch or axios
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    });
  });
  
  test('should fetch lists successfully', async () => {
    const lists = await ApiService.getLists();
    expect(lists.success).toBe(true);
    expect(Array.isArray(lists.data)).toBe(true);
  });
});
```

### E2E Testing with Playwright

```javascript
// Example E2E test
const { test, expect } = require('@playwright/test');

test('user can create and manage todo lists', async ({ page }) => {
  // Login
  await page.goto('/');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'TestPassword123!');
  await page.click('#login-btn');
  
  // Create list
  await page.click('#create-list-btn');
  await page.fill('#list-name', 'Test List');
  await page.click('#save-list-btn');
  
  // Verify list created
  await expect(page.locator('.list-card')).toContainText('Test List');
  
  // Add task
  await page.click('.list-card');
  await page.click('#add-task-btn');
  await page.fill('#task-description', 'Test Task');
  await page.click('#save-task-btn');
  
  // Verify task created
  await expect(page.locator('.task-item')).toContainText('Test Task');
});
```

---

## Browser Testing

### Cross-Browser Testing Matrix

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|---------|---------|
| Chrome | Latest 2 | ✓ | ✓ | ✅ |
| Firefox | Latest 2 | ✓ | ✓ | ✅ |
| Safari | Latest 2 | ✓ | ✓ | ✅ |
| Edge | Latest 2 | ✓ | ✓ | ✅ |
| IE 11 | N/A | ❌ | N/A | Not Supported |

### Testing Tools

1. **BrowserStack**: Cross-browser testing
2. **Sauce Labs**: Automated browser testing
3. **Local Testing**: Developer tools in each browser

### Common Issues to Check

- CSS Grid/Flexbox support
- ES6+ feature support
- Fetch API support
- Local Storage availability
- Touch event handling

---

## Performance Testing

### Metrics to Monitor

1. **Load Time**: Time to first contentful paint
2. **Interactive Time**: Time to interactive
3. **Bundle Size**: JavaScript and CSS file sizes
4. **Network Requests**: Number and size of requests
5. **Memory Usage**: JavaScript heap size

### Performance Budget

```javascript
// Performance targets
const PERFORMANCE_BUDGET = {
  loadTime: 3000, // 3 seconds
  firstContentfulPaint: 1500, // 1.5 seconds
  timeToInteractive: 5000, // 5 seconds
  bundleSize: 500000, // 500KB
  imageSize: 100000 // 100KB per image
};
```

### Testing Tools

1. **Lighthouse**: Automated performance audits
2. **WebPageTest**: Detailed performance analysis
3. **Chrome DevTools**: Performance profiling
4. **GTmetrix**: Performance scoring

### Optimization Checklist

- [ ] Images optimized and compressed
- [ ] CSS and JavaScript minified
- [ ] Gzip compression enabled
- [ ] CDN usage for static assets
- [ ] Critical CSS inlined
- [ ] Non-critical resources deferred
- [ ] Service worker for caching

---

## Accessibility Testing

### WCAG 2.1 Compliance

Testing for Level AA compliance:

#### Perceivable
- [ ] Text alternatives for images
- [ ] Captions for audio/video
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Text resizable up to 200%
- [ ] Images of text avoided

#### Operable
- [ ] All functionality keyboard accessible
- [ ] No seizure-inducing content
- [ ] Users can control timing
- [ ] Clear navigation and orientation

#### Understandable
- [ ] Text is readable and understandable
- [ ] Content appears and operates predictably
- [ ] Users are helped to avoid and correct mistakes

#### Robust
- [ ] Content compatible with assistive technologies
- [ ] Valid HTML markup

### Testing Tools

1. **WAVE**: Web accessibility evaluation
2. **axe DevTools**: Automated accessibility testing
3. **Lighthouse**: Accessibility audit
4. **Screen Readers**: NVDA, JAWS, VoiceOver
5. **Keyboard Navigation**: Tab order testing

### Manual Accessibility Tests

- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader
- [ ] Verify focus indicators visible
- [ ] Check color contrast ratios
- [ ] Test with browser zoom at 200%
- [ ] Verify ARIA labels present and correct

---

## Security Testing

### Security Checklist

#### Input Validation
- [ ] XSS prevention in user inputs
- [ ] SQL injection prevention (backend)
- [ ] File upload validation
- [ ] URL parameter validation

#### Authentication & Authorization
- [ ] Secure token storage
- [ ] Token expiration handling
- [ ] Session management
- [ ] Password strength requirements

#### Data Protection
- [ ] HTTPS enforcement
- [ ] Secure cookie settings
- [ ] Content Security Policy
- [ ] No sensitive data in localStorage

#### Network Security
- [ ] API endpoints secured
- [ ] CORS configuration
- [ ] Rate limiting (backend)
- [ ] Input sanitization

### Security Testing Tools

1. **OWASP ZAP**: Security vulnerability scanner
2. **Burp Suite**: Web application security testing
3. **Mozilla Observatory**: Website security analysis
4. **SSL Labs**: SSL configuration testing

---

## Continuous Testing

### CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint CSS
      run: npm run lint:css
    
    - name: Lint JavaScript
      run: npm run lint:js
    
    - name: Run unit tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Lighthouse CI
      run: npm run lighthouse:ci
```

### Test Reporting

1. **Test Results**: Pass/fail status for all tests
2. **Coverage Reports**: Code coverage metrics
3. **Performance Reports**: Lighthouse scores
4. **Accessibility Reports**: axe-core results
5. **Security Reports**: Vulnerability assessments

---

## Test Environment Setup

### Local Testing Environment

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run linting
npm run lint

# Run tests (when implemented)
npm test

# Build for testing
npm run build

# Serve built application
npm run serve
```

### Testing Utilities

Create testing utilities for common tasks:

```javascript
// test-utils.js
const TestUtils = {
  // Mock API responses
  mockApiResponse: (data, success = true) => ({
    success,
    data: success ? data : undefined,
    error: success ? undefined : data
  }),
  
  // Create test user
  createTestUser: () => ({
    id: 'test-user-123',
    email: 'test@example.com',
    username: 'testuser'
  }),
  
  // Create test list
  createTestList: () => ({
    id: 'test-list-456',
    name: 'Test List',
    userId: 'test-user-123'
  }),
  
  // Create test task
  createTestTask: () => ({
    id: 'test-task-789',
    listId: 'test-list-456',
    description: 'Test Task',
    completed: false
  }),
  
  // Wait for element
  waitForElement: (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
};
```

---

## Bug Reporting Template

When reporting bugs, use this template:

```markdown
## Bug Report

### Summary
Brief description of the issue

### Environment
- Browser: Chrome 120.0.0
- OS: Windows 11
- Screen Size: 1920x1080
- Device: Desktop

### Steps to Reproduce
1. Navigate to...
2. Click on...
3. Enter...
4. Observe...

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Screenshots
Include relevant screenshots

### Additional Information
Any other relevant details
```
