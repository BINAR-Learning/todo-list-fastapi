#!/bin/bash

# Todo List Frontend Build Script
# PT Erajaya Swasembada

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
SOURCE_DIR="."
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 Building Todo List Frontend for ${ENVIRONMENT}...${NC}"

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
    rm -rf "$BUILD_DIR"
fi

# Create build directory
mkdir -p "$BUILD_DIR"

echo -e "${GREEN}📁 Created build directory${NC}"

# Copy all source files
echo -e "${BLUE}📋 Copying source files...${NC}"
cp -r assets "$BUILD_DIR/"
cp index.html "$BUILD_DIR/"

# Copy additional files if they exist
if [ -f "favicon.ico" ]; then
    cp favicon.ico "$BUILD_DIR/"
fi

if [ -f "robots.txt" ]; then
    cp robots.txt "$BUILD_DIR/"
fi

if [ -f "sitemap.xml" ]; then
    cp sitemap.xml "$BUILD_DIR/"
fi

# Update configuration for environment
echo -e "${BLUE}📝 Updating configuration for ${ENVIRONMENT}...${NC}"

if [ -f "assets/js/config.${ENVIRONMENT}.js" ]; then
    cp "assets/js/config.${ENVIRONMENT}.js" "$BUILD_DIR/assets/js/config.js"
    echo -e "${GREEN}✅ Applied ${ENVIRONMENT} configuration${NC}"
else
    echo -e "${YELLOW}⚠️  No ${ENVIRONMENT} configuration found, using default${NC}"
fi

# Environment-specific replacements
case $ENVIRONMENT in
    "production")
        echo -e "${BLUE}🔧 Applying production optimizations...${NC}"
        
        # Replace localhost URLs with production URLs
        if [ -n "$API_BASE_URL" ]; then
            sed -i.bak "s|http://localhost:8000/v1|$API_BASE_URL|g" "$BUILD_DIR/assets/js/config.js"
            rm -f "$BUILD_DIR/assets/js/config.js.bak"
        fi
        
        # Disable debug mode
        sed -i.bak "s|LOG_API_REQUESTS: true|LOG_API_REQUESTS: false|g" "$BUILD_DIR/assets/js/config.js"
        sed -i.bak "s|LOG_API_RESPONSES: true|LOG_API_RESPONSES: false|g" "$BUILD_DIR/assets/js/config.js"
        sed -i.bak "s|ENABLE_CONSOLE_LOGS: true|ENABLE_CONSOLE_LOGS: false|g" "$BUILD_DIR/assets/js/config.js"
        rm -f "$BUILD_DIR/assets/js/config.js.bak"
        ;;
        
    "staging")
        echo -e "${BLUE}🔧 Applying staging configuration...${NC}"
        
        if [ -n "$STAGING_API_URL" ]; then
            sed -i.bak "s|http://localhost:8000/v1|$STAGING_API_URL|g" "$BUILD_DIR/assets/js/config.js"
            rm -f "$BUILD_DIR/assets/js/config.js.bak"
        fi
        ;;
        
    "development")
        echo -e "${BLUE}🔧 Keeping development configuration...${NC}"
        # Keep debug mode enabled for development
        ;;
esac

# CSS Optimization (if tools are available)
if command -v cleancss &> /dev/null; then
    echo -e "${BLUE}🎨 Minifying CSS...${NC}"
    
    # Minify main CSS files
    cleancss -o "$BUILD_DIR/assets/css/styles.min.css" "$BUILD_DIR/assets/css/styles.css"
    cleancss -o "$BUILD_DIR/assets/css/components.min.css" "$BUILD_DIR/assets/css/components.css"
    
    # Update HTML to use minified CSS in production
    if [ "$ENVIRONMENT" = "production" ]; then
        sed -i.bak 's|assets/css/styles.css|assets/css/styles.min.css|g' "$BUILD_DIR/index.html"
        sed -i.bak 's|assets/css/components.css|assets/css/components.min.css|g' "$BUILD_DIR/index.html"
        rm -f "$BUILD_DIR/index.html.bak"
    fi
    
    echo -e "${GREEN}✅ CSS minification complete${NC}"
else
    echo -e "${YELLOW}⚠️  cleancss not found, skipping CSS minification${NC}"
fi

# JavaScript Optimization (if tools are available)
if command -v terser &> /dev/null && [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}⚡ Minifying JavaScript...${NC}"
    
    # Minify JavaScript files
    find "$BUILD_DIR/assets/js" -name "*.js" -type f | while read -r file; do
        if [[ ! $file =~ \.min\.js$ ]]; then
            minified_file="${file%.js}.min.js"
            terser "$file" -o "$minified_file" --compress --mangle
            
            # Replace original with minified in production
            if [ "$ENVIRONMENT" = "production" ]; then
                mv "$minified_file" "$file"
            fi
        fi
    done
    
    echo -e "${GREEN}✅ JavaScript minification complete${NC}"
else
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${YELLOW}⚠️  terser not found, skipping JavaScript minification${NC}"
    fi
fi

# Image Optimization (if tools are available)
if command -v imagemin &> /dev/null && [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}🖼️  Optimizing images...${NC}"
    
    if [ -d "$BUILD_DIR/assets/images" ]; then
        imagemin "$BUILD_DIR/assets/images/*" --out-dir="$BUILD_DIR/assets/images"
        echo -e "${GREEN}✅ Image optimization complete${NC}"
    fi
else
    if [ "$ENVIRONMENT" = "production" ] && [ -d "$BUILD_DIR/assets/images" ]; then
        echo -e "${YELLOW}⚠️  imagemin not found, skipping image optimization${NC}"
    fi
fi

# Add cache busting for production
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}🔄 Adding cache busting...${NC}"
    
    TIMESTAMP=$(date +%s)
    
    # Add version parameter to asset URLs
    sed -i.bak "s|assets/css/styles.css|assets/css/styles.css?v=$TIMESTAMP|g" "$BUILD_DIR/index.html"
    sed -i.bak "s|assets/css/components.css|assets/css/components.css?v=$TIMESTAMP|g" "$BUILD_DIR/index.html"
    sed -i.bak "s|assets/js/|assets/js/|g" "$BUILD_DIR/index.html"
    rm -f "$BUILD_DIR/index.html.bak"
    
    echo -e "${GREEN}✅ Cache busting applied${NC}"
fi

# Generate service worker for production
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}⚙️  Generating service worker...${NC}"
    
    cat > "$BUILD_DIR/sw.js" << 'EOF'
const CACHE_NAME = 'todo-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/css/components.css',
  '/assets/js/app.js',
  '/assets/js/api.js',
  '/assets/js/auth.js',
  '/assets/js/config.js',
  '/assets/js/utils.js'
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
        return response || fetch(event.request);
      }
    )
  );
});
EOF
    
    echo -e "${GREEN}✅ Service worker generated${NC}"
fi

# Create build info file
echo -e "${BLUE}📋 Creating build info...${NC}"

cat > "$BUILD_DIR/build-info.json" << EOF
{
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "$ENVIRONMENT",
  "version": "1.0.0",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF

# Validate build
echo -e "${BLUE}🔍 Validating build...${NC}"

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}❌ Build validation failed: index.html not found${NC}"
    exit 1
fi

if [ ! -d "$BUILD_DIR/assets" ]; then
    echo -e "${RED}❌ Build validation failed: assets directory not found${NC}"
    exit 1
fi

# Calculate build size
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
echo -e "${BLUE}📦 Build size: $BUILD_SIZE${NC}"

# Show build summary
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${BLUE}📁 Build directory: $BUILD_DIR${NC}"
echo -e "${BLUE}🌍 Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}📦 Size: $BUILD_SIZE${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${GREEN}🚀 Ready for production deployment!${NC}"
elif [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${YELLOW}🧪 Ready for staging deployment!${NC}"
else
    echo -e "${BLUE}🔧 Development build ready!${NC}"
fi

# Instructions
echo -e "${BLUE}"
echo "📋 Next steps:"
echo "  • Test the build: npm run serve"
echo "  • Deploy to hosting: Copy $BUILD_DIR/* to your web server"
echo "  • Local testing: http-server $BUILD_DIR -p 3000"
echo -e "${NC}"
