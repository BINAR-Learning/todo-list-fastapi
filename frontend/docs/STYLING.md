# Styling Guidelines

This document outlines the styling guidelines for the Todo List application, including PT Erajaya Swasembada branding, responsive design principles, and CSS best practices.

## Table of Contents

- [Brand Colors](#brand-colors)
- [Typography](#typography)
- [Layout System](#layout-system)
- [Component Styling](#component-styling)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [CSS Architecture](#css-architecture)
- [Best Practices](#best-practices)

---

## Brand Colors

### PT Erajaya Swasembada Corporate Colors

```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Secondary Colors */
  --secondary-50: #f8fafc;
  --secondary-100: #f1f5f9;
  --secondary-200: #e2e8f0;
  --secondary-300: #cbd5e1;
  --secondary-400: #94a3b8;
  --secondary-500: #64748b;
  --secondary-600: #475569;
  --secondary-700: #334155;
  --secondary-800: #1e293b;
  --secondary-900: #0f172a;

  /* Status Colors */
  --success-50: #ecfdf5;
  --success-500: #10b981;
  --success-600: #059669;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  --info-50: #f0f9ff;
  --info-500: #06b6d4;
  --info-600: #0891b2;
}
```

### Usage Guidelines

#### Primary Colors
- **Primary-700** (`#1d4ed8`): Main brand color for headers, primary buttons
- **Primary-600** (`#2563eb`): Hover states for primary elements
- **Primary-500** (`#3b82f6`): Secondary brand elements, links
- **Primary-100** (`#dbeafe`): Light backgrounds, subtle highlights

#### Secondary Colors
- **Secondary-800** (`#1e293b`): Primary text color
- **Secondary-600** (`#475569`): Secondary text color
- **Secondary-300** (`#cbd5e1`): Borders, dividers
- **Secondary-100** (`#f1f5f9`): Light backgrounds

#### Status Colors
- **Success**: Completion indicators, success messages
- **Warning**: Alerts, warnings, pending states
- **Error**: Error messages, destructive actions
- **Info**: Information messages, help text

---

## Typography

### Font Family

```css
:root {
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
}

body {
  font-family: var(--font-family-primary);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}
```

### Font Weights

```css
:root {
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Typography Scale

```css
:root {
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
}
```

### Heading Styles

```css
.heading-1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  color: var(--secondary-800);
}

.heading-2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
  color: var(--secondary-800);
}

.heading-3 {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
  color: var(--secondary-700);
}
```

### Body Text Styles

```css
.text-primary {
  color: var(--secondary-800);
  font-size: var(--text-base);
  line-height: 1.6;
}

.text-secondary {
  color: var(--secondary-600);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.text-muted {
  color: var(--secondary-500);
  font-size: var(--text-sm);
  line-height: 1.5;
}
```

---

## Layout System

### Container Sizes

```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: var(--container-sm); }
}

@media (min-width: 768px) {
  .container { max-width: var(--container-md); }
}

@media (min-width: 1024px) {
  .container { max-width: var(--container-lg); }
}
```

### Spacing Scale

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
}
```

### Grid System

```css
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-cols-2 { grid-template-columns: 1fr; }
  .grid-cols-3 { grid-template-columns: 1fr; }
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
}
```

### Flexbox Utilities

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }

.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }
```

---

## Component Styling

### Button Components

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-weight: var(--font-weight-medium);
  font-size: var(--text-sm);
  line-height: 1.25;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Primary Button */
.btn-primary {
  background-color: var(--primary-700);
  color: white;
  border-color: var(--primary-700);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-800);
  border-color: var(--primary-800);
}

/* Secondary Button */
.btn-secondary {
  background-color: white;
  color: var(--secondary-700);
  border-color: var(--secondary-300);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--secondary-50);
  border-color: var(--secondary-400);
}

/* Button Sizes */
.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
}
```

### Form Components

```css
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--secondary-700);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.form-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--secondary-300);
  border-radius: 0.375rem;
  font-size: var(--text-base);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: var(--error-500);
}

.form-error {
  color: var(--error-600);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
}
```

### Card Components

```css
.card {
  background: white;
  border: 1px solid var(--secondary-200);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--secondary-200);
  background-color: var(--secondary-50);
}

.card-body {
  padding: var(--space-4);
}

.card-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--secondary-200);
  background-color: var(--secondary-50);
}
```

### Modal Components

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.95);
  transition: transform 0.3s ease-in-out;
}

.modal-overlay.show .modal-container {
  transform: scale(1);
}
```

---

## Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### Mobile-First Approach

```css
/* Base styles for mobile */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

/* Tablet styles */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}
```

### Responsive Typography

```css
.responsive-heading {
  font-size: var(--text-xl);
  line-height: 1.4;
}

@media (min-width: 768px) {
  .responsive-heading {
    font-size: var(--text-2xl);
    line-height: 1.3;
  }
}

@media (min-width: 1024px) {
  .responsive-heading {
    font-size: var(--text-3xl);
    line-height: 1.2;
  }
}
```

### Responsive Spacing

```css
.responsive-padding {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .responsive-padding {
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .responsive-padding {
    padding: var(--space-8);
  }
}
```

---

## Accessibility

### Focus Styles

```css
:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Screen Reader Only Content

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### High Contrast Support

```css
@media (prefers-contrast: high) {
  :root {
    --primary-700: #000080;
    --secondary-800: #000000;
    --secondary-300: #808080;
  }
  
  .btn {
    border-width: 2px;
  }
  
  .form-input {
    border-width: 2px;
  }
}
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## CSS Architecture

### File Structure

```
assets/css/
├── styles.css          # Main styles file
├── components.css      # Component-specific styles
├── utilities.css       # Utility classes
├── variables.css       # CSS custom properties
└── themes/
    ├── light.css       # Light theme
    └── dark.css        # Dark theme
```

### BEM Methodology

```css
/* Block */
.todo-list {
  /* Block styles */
}

/* Element */
.todo-list__item {
  /* Element styles */
}

/* Modifier */
.todo-list__item--completed {
  /* Modifier styles */
}

.todo-list__item--priority-high {
  /* Another modifier */
}
```

### CSS Custom Properties Pattern

```css
.component {
  /* Define component-specific custom properties */
  --component-bg: var(--secondary-50);
  --component-border: var(--secondary-200);
  --component-text: var(--secondary-800);
  
  /* Use the properties */
  background-color: var(--component-bg);
  border: 1px solid var(--component-border);
  color: var(--component-text);
}

/* Theme variations */
[data-theme="dark"] .component {
  --component-bg: var(--secondary-800);
  --component-border: var(--secondary-600);
  --component-text: var(--secondary-100);
}
```

---

## Best Practices

### Performance

1. **Minimize CSS Size**: Use only necessary styles
2. **Avoid Deep Nesting**: Keep specificity low
3. **Use Efficient Selectors**: Prefer classes over complex selectors
4. **Optimize Images**: Use appropriate formats and sizes

```css
/* Good - Low specificity */
.nav-link {
  color: var(--primary-700);
}

/* Bad - High specificity */
nav ul li a.link {
  color: var(--primary-700);
}
```

### Maintainability

1. **Consistent Naming**: Use consistent naming conventions
2. **Modular CSS**: Break styles into logical modules
3. **Documentation**: Comment complex styles
4. **Version Control**: Track changes in CSS files

```css
/* Component: Todo List Item
 * Description: Individual task item with completion state
 * Dependencies: Base button styles, icon font
 */
.todo-item {
  /* Component styles here */
}
```

### Browser Support

1. **Progressive Enhancement**: Start with basic styles
2. **Feature Detection**: Use `@supports` for modern features
3. **Fallbacks**: Provide fallbacks for unsupported properties
4. **Testing**: Test across different browsers

```css
.modern-grid {
  /* Fallback for older browsers */
  display: block;
}

@supports (display: grid) {
  .modern-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
```

### Dark Theme Support

```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
}

[data-theme="dark"] {
  /* Dark theme */
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Print Styles

```css
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    font-size: 12pt;
    line-height: 1.4;
    color: black;
    background: white;
  }
  
  .card {
    border: 1px solid #ccc;
    box-shadow: none;
    page-break-inside: avoid;
  }
}
```

---

## Testing Styles

### Visual Regression Testing

1. **Screenshot Testing**: Use tools like Percy or Chromatic
2. **Cross-browser Testing**: Test on different browsers
3. **Device Testing**: Test on various screen sizes
4. **Accessibility Testing**: Use accessibility testing tools

### Manual Testing Checklist

- [ ] Mobile responsiveness (320px to 1920px)
- [ ] Touch target sizes (minimum 44px)
- [ ] Color contrast ratios (WCAG AA compliance)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Print styles
- [ ] High contrast mode
- [ ] Reduced motion preferences
- [ ] Dark/light theme switching
- [ ] RTL language support (if needed)

### CSS Validation

```bash
# Use CSS validation tools
npm install -g css-validator
css-validator assets/css/styles.css

# Lint CSS with stylelint
npm install -g stylelint
stylelint "assets/css/**/*.css"
```

---

## Migration and Updates

### Version Control for Styles

1. **Semantic Versioning**: Version your CSS changes
2. **Changelog**: Maintain a changelog for style updates
3. **Breaking Changes**: Document breaking changes clearly
4. **Deprecation**: Provide deprecation notices for old styles

### Upgrading Guidelines

When updating styles:

1. **Backup**: Always backup existing styles
2. **Test**: Test thoroughly before deployment
3. **Gradual Rollout**: Consider gradual rollout for major changes
4. **Monitoring**: Monitor for visual regressions

### Legacy Browser Support

```css
/* Support for IE11 and older browsers */
.legacy-flex {
  display: -ms-flexbox; /* IE10 */
  display: flex;
}

.legacy-flex-item {
  -ms-flex: 1; /* IE10 */
  flex: 1;
}

/* Use CSS feature queries */
@supports not (display: grid) {
  .fallback-layout {
    /* Fallback layout using flexbox or floats */
  }
}
```
