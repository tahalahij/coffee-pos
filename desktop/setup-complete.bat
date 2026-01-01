@echo off
REM ============================================
REM Complete Setup for Cafe POS Desktop (Windows)
REM Installs dependencies and prepares for build
REM ============================================

echo.
echo ========================================
echo   Cafe POS Desktop - Complete Setup
echo ========================================
echo.
echo This script will:
echo   - Install all npm dependencies
echo   - Download MongoDB binaries
echo   - Prepare resources for building
echo.
set /p continue="Continue? (y/n): "
if /i not "%continue%"=="y" exit /b 0

echo.
echo [1/5] Installing root dependencies...
cd /d "%~dp0"
cd ..
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [3/5] Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [4/5] Installing desktop dependencies...
cd ..\desktop
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install desktop dependencies
    pause
    exit /b 1
)

echo.
echo [5/5] Setting up MongoDB...
if not exist "src-tauri\resources\mongodb\mongod.exe" (
    echo.
    echo MongoDB binaries not found. Downloading...
    call setup-mongodb.bat
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo WARNING: MongoDB setup incomplete
        echo You can download it manually later
    )
) else (
    echo       MongoDB already configured!
)

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo   1. Verify setup: verify-build.bat
echo   2. Build application: build-windows.bat
echo.
echo ========================================

pause
