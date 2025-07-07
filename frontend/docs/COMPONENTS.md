# Component Documentation

This document provides comprehensive documentation for all reusable UI components in the Todo List application.

## Table of Contents

- [Modal Component](#modal-component)
- [Toast Component](#toast-component)
- [List Card Component](#list-card-component)
- [Task Item Component](#task-item-component)

---

## Modal Component

### Overview

A flexible, reusable modal dialog component with PT Erajaya Swasembada styling.

### Location
`assets/js/components/modal.js`

### Features

- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Navigation**: ESC key to close, tab navigation
- **Accessibility**: ARIA labels and focus management
- **Animation**: Smooth fade-in/fade-out transitions
- **Overlay Click**: Close modal by clicking outside

### Usage

```javascript
// Initialize modal
const modal = new Modal('modal-id', {
  title: 'Modal Title',
  content: '<p>Modal content here</p>',
  showCloseButton: true,
  className: 'custom-modal-class'
});

// Show modal
modal.show();

// Hide modal
modal.hide();

// Update content
modal.updateContent('<p>New content</p>');

// Event listeners
modal.onShow(() => console.log('Modal opened'));
modal.onHide(() => console.log('Modal closed'));
```

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | String | `''` | Modal title text |
| `content` | String | `''` | HTML content for modal body |
| `showCloseButton` | Boolean | `true` | Show/hide close button |
| `className` | String | `''` | Additional CSS classes |
| `size` | String | `'medium'` | Modal size: `small`, `medium`, `large` |
| `backdrop` | Boolean | `true` | Show backdrop overlay |

### Methods

#### `show()`
Shows the modal with fade-in animation.

#### `hide()`
Hides the modal with fade-out animation.

#### `updateContent(content)`
Updates the modal body content.

**Parameters:**
- `content` (String): New HTML content

#### `updateTitle(title)`
Updates the modal title.

**Parameters:**
- `title` (String): New title text

#### `onShow(callback)`
Registers a callback for when modal is shown.

**Parameters:**
- `callback` (Function): Callback function

#### `onHide(callback)`
Registers a callback for when modal is hidden.

**Parameters:**
- `callback` (Function): Callback function

### CSS Classes

```css
.modal-overlay       /* Backdrop overlay */
.modal-container     /* Modal wrapper */
.modal-content       /* Modal content area */
.modal-header        /* Modal header */
.modal-title         /* Modal title */
.modal-close         /* Close button */
.modal-body          /* Modal body content */
.modal-footer        /* Modal footer (if used) */
```

### Examples

#### Basic Modal
```javascript
const basicModal = new Modal('basic-modal', {
  title: 'Information',
  content: '<p>This is a basic modal example.</p>'
});
basicModal.show();
```

#### Confirmation Modal
```javascript
const confirmModal = new Modal('confirm-modal', {
  title: 'Confirm Action',
  content: `
    <p>Are you sure you want to delete this item?</p>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="confirmModal.hide()">Cancel</button>
      <button class="btn btn-danger" onclick="handleDelete()">Delete</button>
    </div>
  `
});
```

---

## Toast Component

### Overview

A notification system for displaying temporary messages with different severity levels.

### Location
`assets/js/components/toast.js`

### Features

- **Multiple Types**: Success, error, warning, info
- **Auto-dismiss**: Configurable timeout
- **Manual Dismiss**: Close button
- **Queue System**: Multiple toasts stack vertically
- **Icons**: FontAwesome icons for visual feedback
- **Responsive**: Adapts to mobile screens

### Usage

```javascript
// Show different types of toasts
Toast.success('Operation completed successfully!');
Toast.error('An error occurred');
Toast.warning('Please check your input');
Toast.info('New update available');

// Custom toast with options
Toast.show('Custom message', {
  type: 'success',
  duration: 5000,
  dismissible: true
});
```

### Static Methods

#### `Toast.success(message, options)`
Shows a success toast.

**Parameters:**
- `message` (String): Message text
- `options` (Object): Optional configuration

#### `Toast.error(message, options)`
Shows an error toast.

#### `Toast.warning(message, options)`
Shows a warning toast.

#### `Toast.info(message, options)`
Shows an info toast.

#### `Toast.show(message, options)`
Shows a custom toast.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | String | `'info'` | Toast type: `success`, `error`, `warning`, `info` |
| `duration` | Number | `3000` | Auto-dismiss time in milliseconds |
| `dismissible` | Boolean | `true` | Show close button |
| `position` | String | `'top-right'` | Toast position |

### CSS Classes

```css
.toast-container     /* Container for all toasts */
.toast              /* Individual toast */
.toast-success      /* Success toast styling */
.toast-error        /* Error toast styling */
.toast-warning      /* Warning toast styling */
.toast-info         /* Info toast styling */
.toast-icon         /* Toast icon */
.toast-message      /* Toast message text */
.toast-close        /* Close button */
```

---

## List Card Component

### Overview

A component for displaying todo lists with actions and metadata.

### Location
`assets/js/components/list-card.js`

### Features

- **Task Count**: Shows total and completed tasks
- **Progress Bar**: Visual progress indicator
- **Action Menu**: Edit, delete, and other actions
- **Responsive**: Adapts to different screen sizes
- **Click Navigation**: Navigate to list details

### Usage

```javascript
// Create list card
const listCard = new ListCard('card-container', {
  id: 'list-123',
  name: 'Shopping List',
  taskCount: 10,
  completedCount: 6,
  createdAt: '2024-01-15',
  onEdit: (listId) => console.log('Edit list:', listId),
  onDelete: (listId) => console.log('Delete list:', listId),
  onClick: (listId) => console.log('Open list:', listId)
});

// Render the card
listCard.render();

// Update task counts
listCard.updateProgress(8, 10);
```

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | String | Required | Unique list identifier |
| `name` | String | Required | List name |
| `taskCount` | Number | `0` | Total number of tasks |
| `completedCount` | Number | `0` | Number of completed tasks |
| `createdAt` | String | `''` | Creation date |
| `onClick` | Function | `null` | Click handler |
| `onEdit` | Function | `null` | Edit handler |
| `onDelete` | Function | `null` | Delete handler |

### Methods

#### `render()`
Renders the list card in the container.

#### `updateProgress(completed, total)`
Updates the progress bar and counts.

**Parameters:**
- `completed` (Number): Completed task count
- `total` (Number): Total task count

#### `updateName(name)`
Updates the list name.

**Parameters:**
- `name` (String): New list name

### Events

The component fires custom events:

- `listcard:click`: When card is clicked
- `listcard:edit`: When edit action is triggered
- `listcard:delete`: When delete action is triggered

---

## Task Item Component

### Overview

A component for individual task items with completion toggle and actions.

### Location
`assets/js/components/task-item.js`

### Features

- **Completion Toggle**: Checkbox to mark complete/incomplete
- **Inline Editing**: Edit task description in place
- **Action Menu**: Edit, delete, and other actions
- **Keyboard Support**: Enter to save, Escape to cancel
- **Visual States**: Different styles for completed tasks

### Usage

```javascript
// Create task item
const taskItem = new TaskItem('task-container', {
  id: 'task-456',
  description: 'Buy groceries',
  completed: false,
  onToggle: (taskId, completed) => console.log('Toggle:', taskId, completed),
  onEdit: (taskId, description) => console.log('Edit:', taskId, description),
  onDelete: (taskId) => console.log('Delete:', taskId)
});

// Render the task
taskItem.render();

// Update task
taskItem.updateTask({
  description: 'Buy groceries and milk',
  completed: true
});
```

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | String | Required | Unique task identifier |
| `description` | String | Required | Task description |
| `completed` | Boolean | `false` | Completion status |
| `onToggle` | Function | `null` | Toggle completion handler |
| `onEdit` | Function | `null` | Edit handler |
| `onDelete` | Function | `null` | Delete handler |

### Methods

#### `render()`
Renders the task item in the container.

#### `updateTask(taskData)`
Updates the task with new data.

**Parameters:**
- `taskData` (Object): Task data object

#### `setCompleted(completed)`
Sets the completion status.

**Parameters:**
- `completed` (Boolean): Completion status

#### `startEdit()`
Enters edit mode for the task description.

#### `cancelEdit()`
Cancels edit mode and reverts changes.

#### `saveEdit()`
Saves the edited description.

### Events

The component fires custom events:

- `taskitem:toggle`: When completion is toggled
- `taskitem:edit`: When task is edited
- `taskitem:delete`: When task is deleted

---

## Best Practices

### Component Design

1. **Single Responsibility**: Each component should have one clear purpose
2. **Reusability**: Design components to be used in multiple contexts
3. **Configuration**: Use options objects for flexible configuration
4. **Events**: Use custom events for component communication
5. **Accessibility**: Include ARIA labels and keyboard support

### Performance

1. **Event Delegation**: Use event delegation for dynamic content
2. **Debouncing**: Debounce user input events
3. **Lazy Loading**: Load components only when needed
4. **Memory Management**: Clean up event listeners when destroying components

### Styling

1. **BEM Methodology**: Use Block-Element-Modifier naming convention
2. **CSS Variables**: Use custom properties for theme colors
3. **Responsive Design**: Mobile-first approach
4. **Consistent Spacing**: Use standardized spacing units

### Error Handling

1. **Graceful Degradation**: Handle missing dependencies
2. **User Feedback**: Show appropriate error messages
3. **Logging**: Log errors for debugging
4. **Recovery**: Provide ways to recover from errors

---

## Testing Components

### Manual Testing

1. **Visual Testing**: Verify appearance across browsers
2. **Interaction Testing**: Test all user interactions
3. **Responsive Testing**: Test on different screen sizes
4. **Accessibility Testing**: Use screen readers and keyboard navigation

### Unit Testing

```javascript
// Example test for Modal component
describe('Modal Component', () => {
  let modal;
  
  beforeEach(() => {
    modal = new Modal('test-modal');
  });
  
  test('should show modal', () => {
    modal.show();
    expect(modal.isVisible()).toBe(true);
  });
  
  test('should hide modal', () => {
    modal.show();
    modal.hide();
    expect(modal.isVisible()).toBe(false);
  });
});
```

---

## Contributing

When creating new components:

1. Follow the existing component structure
2. Include comprehensive documentation
3. Add proper error handling
4. Ensure accessibility compliance
5. Test across different browsers and devices
6. Use PT Erajaya Swasembada branding guidelines
