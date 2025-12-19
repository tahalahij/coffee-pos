@echo off
REM ============================================
REM Cafe POS Windows Build Script
REM Run this on a Windows machine to build .exe
REM ============================================

echo.
echo ========================================
echo   Cafe POS Desktop - Windows Build
echo ========================================
echo.

REM Check prerequisites
echo [1/7] Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org/
    exit /b 1
)
echo       Node.js: OK

where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Rust not found. Install from https://rustup.rs/
    exit /b 1
)
echo       Rust: OK

REM Install dependencies
echo.
echo [2/7] Installing dependencies...
cd /d "%~dp0"
cd ..
call npm install
cd backend && call npm install && cd ..
cd frontend && call npm install && cd ..
cd desktop && call npm install && cd ..

REM Build backend
echo.
echo [3/7] Building backend...
cd backend
call npm run build
if not exist "dist\main.js" (
    echo ERROR: Backend build failed
    exit /b 1
)
cd ..
echo       Backend: OK

REM Build frontend
echo.
echo [4/7] Building frontend...
cd frontend
set DESKTOP_BUILD=true
call npm run build
if not exist "out" (
    echo ERROR: Frontend build failed
    exit /b 1
)
cd ..
echo       Frontend: OK

REM Prepare resources
echo.
echo [5/7] Preparing resources...
cd desktop
if not exist "src-tauri\resources\backend" mkdir "src-tauri\resources\backend"
xcopy /E /I /Y "..\backend\dist" "src-tauri\resources\backend\dist"
xcopy /E /I /Y "..\backend\node_modules" "src-tauri\resources\backend\node_modules"
copy /Y "..\backend\package.json" "src-tauri\resources\backend\"
echo       Resources: OK

REM Check MongoDB
echo.
echo [6/7] Checking MongoDB binary...
if not exist "src-tauri\resources\mongodb\mongod.exe" (
    echo.
    echo WARNING: mongod.exe not found!
    echo.
    echo Please download MongoDB Community Server from:
    echo   https://www.mongodb.com/try/download/community
    echo.
    echo Extract and copy mongod.exe to:
    echo   desktop\src-tauri\resources\mongodb\mongod.exe
    echo.
    set /p continue="Continue without MongoDB? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo       MongoDB: OK
)

REM Build Tauri
echo.
echo [7/7] Building Tauri desktop app...
echo       This may take 5-10 minutes on first build...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    exit /b 1
)

echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo Output files:
echo   MSI Installer: src-tauri\target\release\bundle\msi\
echo   NSIS Installer: src-tauri\target\release\bundle\nsis\
echo   Executable: src-tauri\target\release\cafe-pos.exe
echo.
echo ========================================

pause
