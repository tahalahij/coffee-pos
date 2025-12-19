#!/bin/bash
# Build script for Cafe POS Desktop Application
# This script builds backend, frontend, and packages them with Tauri

set -e  # Exit on error

echo "🏗️  Building Cafe POS Desktop Application..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Rust not found. Please install Rust: https://rustup.rs/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# Build backend
echo "🔧 Building NestJS backend..."
cd ../backend
npm run build
if [ ! -f "dist/main.js" ]; then
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend built successfully${NC}"
echo ""

# Build frontend
echo "🎨 Building Next.js frontend..."
cd ../frontend
DESKTOP_BUILD=true npm run build
if [ ! -d "out" ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Prepare backend resources
echo "📦 Preparing backend resources..."
cd ../desktop
mkdir -p src-tauri/resources/backend
cp -r ../backend/dist src-tauri/resources/backend/
cp -r ../backend/node_modules src-tauri/resources/backend/
cp ../backend/package.json src-tauri/resources/backend/
echo -e "${GREEN}✅ Backend resources prepared${NC}"
echo ""

# Check MongoDB binary
echo "🔍 Checking MongoDB binary..."
if [ ! -f "src-tauri/resources/mongodb/mongod.exe" ]; then
    echo -e "${YELLOW}⚠️  MongoDB binary not found!${NC}"
    echo "Please download MongoDB and place mongod.exe in:"
    echo "  src-tauri/resources/mongodb/mongod.exe"
    echo ""
    echo "See: src-tauri/resources/mongodb/README.md"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ MongoDB binary found${NC}"
fi
echo ""

# Build Tauri app
echo "🚀 Building Tauri desktop app..."
npm run build

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "📦 Installer location:"
echo "  src-tauri/target/release/bundle/"
echo ""
echo "🎉 Desktop application is ready for distribution!"
