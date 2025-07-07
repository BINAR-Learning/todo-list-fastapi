# Deployment Guide

This document provides comprehensive instructions for deploying the Todo List frontend application to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Static Hosting](#static-hosting)
- [CDN Deployment](#cdn-deployment)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Configuration](#environment-configuration)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Analytics](#monitoring-and-analytics)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: 16.x or higher (for build tools)
- **Git**: Latest version
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Development Tools

```bash
# Install build tools globally
npm install -g http-server
npm install -g serve
npm install -g surge
```

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/todo-list-api.git
   cd todo-list-api/frontend
   ```

2. **Configure Environment**
   ```bash
   # Copy and configure environment settings
   cp assets/js/config.example.js assets/js/config.js
   ```

---

## Build Process

### Development Build

For development deployment with debugging enabled:

```javascript
// assets/js/config.js
const CONFIG = {
  ENVIRONMENT: 'development',
  API: {
    BASE_URL: 'http://localhost:8000/v1'
  },
  DEBUG: {
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: true,
    ENABLE_CONSOLE_LOGS: true
  }
};
```

### Production Build

For production deployment with optimizations:

```javascript
// assets/js/config.js
const CONFIG = {
  ENVIRONMENT: 'production',
  API: {
    BASE_URL: 'https://api.yourdomain.com/v1'
  },
  DEBUG: {
    LOG_API_REQUESTS: false,
    LOG_API_RESPONSES: false,
    ENABLE_CONSOLE_LOGS: false
  }
};
```

### Build Script

Create a build script for automating the deployment process:

```bash
#!/bin/bash
# build.sh

set -e

echo "🚀 Building Todo List Frontend..."

# Create build directory
mkdir -p dist

# Copy all files
cp -r assets dist/
cp index.html dist/

# Update configuration for production
echo "📝 Updating configuration..."
# Replace development URLs with production URLs
sed -i 's/localhost:8000/api.yourdomain.com/g' dist/assets/js/config.js

# Minify CSS (optional)
if command -v cleancss &> /dev/null; then
    echo "🎨 Minifying CSS..."
    cleancss -o dist/assets/css/styles.min.css dist/assets/css/styles.css
    cleancss -o dist/assets/css/components.min.css dist/assets/css/components.css
fi

# Minify JavaScript (optional)
if command -v uglifyjs &> /dev/null; then
    echo "⚡ Minifying JavaScript..."
    find dist/assets/js -name "*.js" -exec uglifyjs {} -o {} \;
fi

echo "✅ Build complete! Files are in dist/ directory"
```

Make it executable:

```bash
chmod +x build.sh
./build.sh
```

---

## Static Hosting

### Netlify Deployment

1. **Direct Deployment**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy to Netlify
   netlify deploy --prod --dir=dist
   ```

2. **Git Integration**
   - Connect your GitHub repository to Netlify
   - Set build command: `./build.sh`
   - Set publish directory: `dist`
   - Set environment variables in Netlify dashboard

3. **Configuration File**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "./build.sh"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [build.environment]
     NODE_VERSION = "18"
   ```

### Vercel Deployment

1. **Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

2. **Configuration File**
   Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/**",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/frontend/index.html"
       }
     ]
   }
   ```

### GitHub Pages

1. **Manual Deployment**
   ```bash
   # Build the project
   ./build.sh
   
   # Push to gh-pages branch
   git checkout -b gh-pages
   git add dist/
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

2. **GitHub Actions**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '18'
       
       - name: Build
         run: |
           cd frontend
           ./build.sh
       
       - name: Deploy
         uses: peaceiris/actions-gh-pages@v3
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./frontend/dist
   ```

### AWS S3 + CloudFront

1. **S3 Bucket Setup**
   ```bash
   # Create S3 bucket
   aws s3 mb s3://your-todo-app-bucket
   
   # Enable static website hosting
   aws s3 website s3://your-todo-app-bucket \
     --index-document index.html \
     --error-document index.html
   ```

2. **Deploy to S3**
   ```bash
   # Build and upload
   ./build.sh
   aws s3 sync dist/ s3://your-todo-app-bucket --delete
   
   # Set proper content types
   aws s3 cp dist/ s3://your-todo-app-bucket \
     --recursive \
     --metadata-directive REPLACE \
     --content-type "text/html" \
     --exclude "*" --include "*.html"
   ```

3. **CloudFront Configuration**
   ```json
   {
     "Origins": [{
       "DomainName": "your-todo-app-bucket.s3.amazonaws.com",
       "Id": "S3-todo-app",
       "S3OriginConfig": {
         "OriginAccessIdentity": ""
       }
     }],
     "DefaultCacheBehavior": {
       "TargetOriginId": "S3-todo-app",
       "ViewerProtocolPolicy": "redirect-to-https",
       "Compress": true,
       "DefaultTTL": 86400
     },
     "CustomErrorResponses": [{
       "ErrorCode": 404,
       "ResponseCode": 200,
       "ResponsePagePath": "/index.html"
     }]
   }
   ```

---

## CDN Deployment

### Cloudflare Pages

1. **Connect Repository**
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: `cd frontend && ./build.sh`
   - Set output directory: `frontend/dist`

2. **Configuration**
   Create `_redirects` file in dist directory:
   ```
   /*    /index.html   200
   ```

3. **Environment Variables**
   Set in Cloudflare Pages dashboard:
   - `NODE_VERSION`: `18`
   - `API_BASE_URL`: `https://api.yourdomain.com/v1`

### KeyCDN

1. **Upload to CDN**
   ```bash
   # Build project
   ./build.sh
   
   # Upload to KeyCDN using FTP/SFTP
   rsync -avz --delete dist/ user@keycdn.com:/path/to/zone/
   ```

2. **Configure CDN**
   - Enable Gzip compression
   - Set cache headers
   - Configure origin shield

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in frontend directory:

```dockerfile
# Multi-stage build
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN ./build.sh

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (optional)
        location /api/ {
            proxy_pass http://backend:8000/v1/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/todoapp
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=todoapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deployment Commands

```bash
# Build and run
docker-compose up -d --build

# Scale frontend
docker-compose up -d --scale frontend=3

# Update deployment
docker-compose pull
docker-compose up -d

# View logs
docker-compose logs -f frontend
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'frontend/**' ]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Lint CSS
      run: |
        cd frontend
        npx stylelint "assets/css/**/*.css"
    
    - name: Lint JavaScript
      run: |
        cd frontend
        npx eslint "assets/js/**/*.js"
    
    - name: Run tests
      run: |
        cd frontend
        npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build
      run: |
        cd frontend
        ./build.sh
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: frontend-build
        path: frontend/dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: frontend-build
        path: dist/
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
    
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

before_script:
  - cd frontend

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run lint
    - npm test
  cache:
    paths:
      - frontend/node_modules/

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - ./build.sh
  artifacts:
    paths:
      - frontend/dist/
    expire_in: 1 hour
  only:
    - main

deploy_staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST "$STAGING_WEBHOOK_URL"
  environment:
    name: staging
    url: https://staging.yourdomain.com
  only:
    - main

deploy_production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST "$PRODUCTION_WEBHOOK_URL"
  environment:
    name: production
    url: https://yourdomain.com
  when: manual
  only:
    - main
```

---

## Environment Configuration

### Multi-Environment Setup

Create environment-specific configuration files:

**config.development.js**
```javascript
const CONFIG = {
  ENVIRONMENT: 'development',
  API: {
    BASE_URL: 'http://localhost:8000/v1',
    TIMEOUT: 10000
  },
  DEBUG: {
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: true
  }
};
```

**config.staging.js**
```javascript
const CONFIG = {
  ENVIRONMENT: 'staging',
  API: {
    BASE_URL: 'https://api-staging.yourdomain.com/v1',
    TIMEOUT: 15000
  },
  DEBUG: {
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: false
  }
};
```

**config.production.js**
```javascript
const CONFIG = {
  ENVIRONMENT: 'production',
  API: {
    BASE_URL: 'https://api.yourdomain.com/v1',
    TIMEOUT: 10000
  },
  DEBUG: {
    LOG_API_REQUESTS: false,
    LOG_API_RESPONSES: false
  }
};
```

### Environment Variable Injection

Create a build script that injects environment variables:

```bash
#!/bin/bash
# build-with-env.sh

ENVIRONMENT=${1:-production}

echo "Building for environment: $ENVIRONMENT"

# Copy appropriate config
cp "assets/js/config.$ENVIRONMENT.js" "assets/js/config.js"

# Replace environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    source ".env.$ENVIRONMENT"
    
    # Replace variables in config file
    sed -i "s|\${API_BASE_URL}|$API_BASE_URL|g" assets/js/config.js
    sed -i "s|\${ENVIRONMENT}|$ENVIRONMENT|g" assets/js/config.js
fi

# Run standard build
./build.sh
```

---

## Performance Optimization

### Asset Optimization

1. **Image Optimization**
   ```bash
   # Install optimization tools
   npm install -g imagemin-cli
   
   # Optimize images
   imagemin assets/images/* --out-dir=dist/assets/images
   ```

2. **CSS Optimization**
   ```bash
   # Install CSS optimization tools
   npm install -g clean-css-cli
   npm install -g purgecss
   
   # Remove unused CSS
   purgecss --css assets/css/*.css --content index.html assets/js/**/*.js --output dist/assets/css/
   
   # Minify CSS
   cleancss -o dist/assets/css/styles.min.css dist/assets/css/styles.css
   ```

3. **JavaScript Optimization**
   ```bash
   # Install JS optimization tools
   npm install -g uglify-js
   npm install -g terser
   
   # Minify JavaScript
   terser assets/js/app.js -o dist/assets/js/app.min.js
   ```

### Service Worker

Create `sw.js` for offline support:

```javascript
const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
  '/',
  '/assets/css/styles.css',
  '/assets/css/components.css',
  '/assets/js/app.js',
  '/assets/js/api.js',
  '/assets/js/auth.js',
  '/assets/images/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
```

### CDN Configuration

Configure CDN for optimal performance:

```javascript
// assets/js/config.js
const CONFIG = {
  CDN: {
    BASE_URL: 'https://cdn.yourdomain.com',
    ASSETS_PATH: '/assets',
    CACHE_BUSTER: '?v=1.0.0'
  }
};
```

---

## Monitoring and Analytics

### Google Analytics

Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

Add Sentry for error tracking:

```html
<script src="https://browser.sentry-cdn.com/7.0.0/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production'
  });
</script>
```

### Performance Monitoring

Add performance monitoring:

```javascript
// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    
    // Send performance data to analytics
    gtag('event', 'page_load_time', {
      value: Math.round(perfData.loadEventEnd - perfData.fetchStart)
    });
  });
}
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify API CORS configuration
   - Check request headers
   - Ensure proper preflight handling

2. **404 Errors on Refresh**
   - Configure server to serve `index.html` for all routes
   - Add URL rewrite rules
   - Check static hosting configuration

3. **CSS/JS Not Loading**
   - Verify file paths
   - Check MIME types
   - Ensure proper cache headers

4. **Authentication Issues**
   - Verify token storage
   - Check API endpoints
   - Validate HTTPS requirements

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
// In config.js
const CONFIG = {
  DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'debug',
    SHOW_CONSOLE: true
  }
};

// In app.js
if (CONFIG.DEBUG.ENABLED) {
  console.log('Debug mode enabled');
  window.debugApp = app;
}
```

### Health Checks

Create health check endpoints:

```javascript
// Health check function
function healthCheck() {
  const checks = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'healthy',
    checks: {
      api: 'unknown',
      auth: 'unknown',
      storage: 'unknown'
    }
  };
  
  // Check API connectivity
  fetch(CONFIG.API.BASE_URL + '/health')
    .then(() => checks.checks.api = 'healthy')
    .catch(() => checks.checks.api = 'unhealthy');
  
  // Check authentication
  if (AuthManager.isAuthenticated()) {
    checks.checks.auth = 'authenticated';
  } else {
    checks.checks.auth = 'not_authenticated';
  }
  
  // Check local storage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    checks.checks.storage = 'healthy';
  } catch (e) {
    checks.checks.storage = 'unhealthy';
  }
  
  return checks;
}

// Expose health check
window.healthCheck = healthCheck;
```

### Rollback Strategy

Plan for rollbacks:

```bash
#!/bin/bash
# rollback.sh

BACKUP_DIR="backups"
CURRENT_BACKUP="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"

# Create backup before deployment
mkdir -p "$CURRENT_BACKUP"
cp -r dist/* "$CURRENT_BACKUP/"

# Rollback function
rollback() {
    local version=$1
    if [ -d "$BACKUP_DIR/$version" ]; then
        cp -r "$BACKUP_DIR/$version"/* dist/
        echo "Rolled back to version: $version"
    else
        echo "Backup version not found: $version"
        exit 1
    fi
}

# Usage: ./rollback.sh 20240115_143000
if [ $# -eq 1 ]; then
    rollback $1
fi
```
