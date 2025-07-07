# Todo List Frontend Application

A modern, responsive web application for managing todo lists with PT Erajaya Swasembada corporate branding.

## 🚀 Features

- **Authentication**: Secure login/register with JWT tokens
- **Responsive Design**: Mobile-first approach with PT Erajaya Swasembada colors
- **Real-time Updates**: Dynamic UI updates without page refreshes
- **Modular Architecture**: Component-based structure for maintainability
- **Theme Support**: Light/dark theme toggle
- **Accessibility**: ARIA labels and keyboard navigation support

## 🏗️ Project Structure

```
frontend/
├── assets/
│   ├── css/
│   │   ├── styles.css           # Main application styles
│   │   └── components.css       # Reusable component styles
│   ├── js/
│   │   ├── components/
│   │   │   ├── modal.js         # Modal component
│   │   │   ├── toast.js         # Toast notification component
│   │   │   ├── list-card.js     # List card component
│   │   │   └── task-item.js     # Task item component
│   │   ├── pages/
│   │   │   ├── dashboard.js     # Dashboard page controller
│   │   │   ├── lists.js         # Lists page controller
│   │   │   └── profile.js       # Profile page controller
│   │   ├── config.js            # Application configuration
│   │   ├── utils.js             # Utility functions
│   │   ├── api.js               # API service layer
│   │   ├── auth.js              # Authentication manager
│   │   └── app.js               # Main application controller
│   └── images/
│       ├── logo.png             # PT Erajaya logo
│       └── default-avatar.png   # Default user avatar
├── docs/
│   ├── COMPONENTS.md           # Component documentation
│   ├── API.md                  # API integration guide
│   ├── STYLING.md              # Styling guidelines
│   └── DEPLOYMENT.md           # Deployment instructions
└── index.html                  # Main HTML file
```

## 🎨 PT Erajaya Swasembada Branding

The application uses the official PT Erajaya Swasembada corporate colors:

- **Primary**: `#1e40af` (Blue 700)
- **Secondary**: `#3b82f6` (Blue 500) 
- **Accent**: `#60a5fa` (Blue 400)
- **Success**: `#10b981` (Emerald 500)
- **Warning**: `#f59e0b` (Amber 500)
- **Error**: `#ef4444` (Red 500)
- **Text**: `#1f2937` (Gray 800)
- **Background**: `#f9fafb` (Gray 50)

## 🚀 Quick Start

1. **Setup Backend**: Ensure the FastAPI backend is running on `http://localhost:8000`

2. **Configure Frontend**: Update the API base URL in `assets/js/config.js`:
   ```javascript
   const CONFIG = {
     API: {
       BASE_URL: 'http://localhost:8000/v1'
     }
   };
   ```

3. **Serve Frontend**: Open `index.html` in a web browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js
   npx serve . -p 3000
   ```

4. **Access Application**: Navigate to `http://localhost:3000`

## 📱 Responsive Design

The application is built with a mobile-first approach and supports:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

## 🔧 Configuration

### Environment Variables

Configure the application in `assets/js/config.js`:

```javascript
const CONFIG = {
  API: {
    BASE_URL: 'http://localhost:8000/v1',
    TIMEOUT: 10000
  },
  AUTH: {
    TOKEN_KEY: 'todo_app_token',
    USER_KEY: 'todo_app_user'
  },
  UI: {
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300
  }
};
```

## 🧩 Component System

The application uses a modular component system for reusability:

### Core Components

- **Modal**: Reusable modal dialogs
- **Toast**: Notification system
- **ListCard**: Todo list display component
- **TaskItem**: Individual task component

### Page Controllers

- **Dashboard**: Overview and quick actions
- **Lists**: Todo list management
- **Profile**: User account management

## 🔐 Authentication

The application supports dual authentication methods:

1. **Bearer Token**: JWT tokens from login endpoint
2. **Basic Auth**: Direct email/password authentication

## 🎯 Usage

### Creating a Todo List

1. Navigate to the Lists page
2. Click "Create New List"
3. Enter list name and save

### Managing Tasks

1. Select a todo list
2. Add tasks using the "+" button
3. Mark tasks complete by checking them
4. Edit/delete tasks using the action menu

### User Profile

1. Access profile from the user menu
2. Update personal information
3. Change password if needed

## 🧪 Testing

The frontend integrates with the backend API for testing:

1. Register a new account
2. Login with credentials
3. Create and manage todo lists
4. Test responsive design on different devices

## 🚀 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [Component Documentation](docs/COMPONENTS.md)
- [API Integration Guide](docs/API.md)
- [Styling Guidelines](docs/STYLING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Follow the existing code structure
2. Use PT Erajaya Swasembada branding guidelines
3. Ensure responsive design compatibility
4. Document new components and features
5. Test across different browsers and devices

## 📄 License

This project is proprietary to PT Erajaya Swasembada.
