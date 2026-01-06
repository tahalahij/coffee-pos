#!/bin/bash

# Dual-Screen POS Setup Script
# This script installs all required dependencies for the dual-screen feature

echo "🚀 Setting up Dual-Screen POS System"
echo "===================================="

# Check if we're in the cafe-pos directory
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "desktop" ]; then
    echo "❌ Error: Please run this script from the cafe-pos root directory"
    exit 1
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install socket.io-client framer-motion
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"

echo ""
echo "🔧 Setting up environment variables..."
cd ../frontend
if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_BACKEND_PORT=3001" > .env.local
    echo "✅ Created .env.local"
else
    if ! grep -q "NEXT_PUBLIC_BACKEND_PORT" .env.local; then
        echo "NEXT_PUBLIC_BACKEND_PORT=3001" >> .env.local
        echo "✅ Updated .env.local"
    else
        echo "ℹ️  .env.local already configured"
    fi
fi

cd ..

echo ""
echo "===================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start backend:  cd backend && npm run start:dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Test operator:  http://localhost:3000/operator"
echo "4. Test display:   http://localhost:3000/display"
echo "5. Build desktop:  cd desktop && npm run tauri build"
echo ""
echo "📖 See DUAL-SCREEN-SETUP.md for detailed documentation"
