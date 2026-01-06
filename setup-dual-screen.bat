@echo off
REM Dual-Screen POS Setup Script for Windows
REM This script installs all required dependencies for the dual-screen feature

echo.
echo ====================================
echo 🚀 Setting up Dual-Screen POS System
echo ====================================
echo.

REM Check if we're in the cafe-pos directory
if not exist "backend" (
    echo ❌ Error: backend folder not found
    echo Please run this script from the cafe-pos root directory
    exit /b 1
)
if not exist "frontend" (
    echo ❌ Error: frontend folder not found
    echo Please run this script from the cafe-pos root directory
    exit /b 1
)
if not exist "desktop" (
    echo ❌ Error: desktop folder not found
    echo Please run this script from the cafe-pos root directory
    exit /b 1
)

echo 📦 Installing backend dependencies...
cd backend
call npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
if errorlevel 1 (
    echo ❌ Backend dependency installation failed
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install socket.io-client framer-motion
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

echo 🔧 Setting up environment variables...
if not exist ".env.local" (
    echo NEXT_PUBLIC_BACKEND_PORT=3001 > .env.local
    echo ✅ Created .env.local
) else (
    findstr /C:"NEXT_PUBLIC_BACKEND_PORT" .env.local >nul
    if errorlevel 1 (
        echo NEXT_PUBLIC_BACKEND_PORT=3001 >> .env.local
        echo ✅ Updated .env.local
    ) else (
        echo ℹ️  .env.local already configured
    )
)

cd ..

echo.
echo ====================================
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Start backend:  cd backend ^&^& npm run start:dev
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Test operator:  http://localhost:3000/operator
echo 4. Test display:   http://localhost:3000/display
echo 5. Build desktop:  cd desktop ^&^& npm run tauri build
echo.
echo 📖 See DUAL-SCREEN-SETUP.md for detailed documentation
echo.
pause
