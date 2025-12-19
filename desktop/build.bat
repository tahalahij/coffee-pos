@echo off
REM Build script for Cafe POS Desktop Application (Windows)
REM This script builds backend, frontend, and packages them with Tauri

echo Building Cafe POS Desktop Application...
echo.

REM Check prerequisites
echo Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    exit /b 1
)

where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Rust not found. Please install Rust: https://rustup.rs/
    exit /b 1
)

echo Prerequisites OK
echo.

REM Build backend
echo Building NestJS backend...
cd ..\backend
call npm run build
if not exist "dist\main.js" (
    echo ERROR: Backend build failed
    exit /b 1
)
echo Backend built successfully
echo.

REM Build frontend
echo Building Next.js frontend...
cd ..\frontend
set DESKTOP_BUILD=true
call npm run build
if not exist "out" (
    echo ERROR: Frontend build failed
    exit /b 1
)
echo Frontend built successfully
echo.

REM Prepare backend resources
echo Preparing backend resources...
cd ..\desktop
if not exist "src-tauri\resources\backend" mkdir "src-tauri\resources\backend"
xcopy /E /I /Y "..\backend\dist" "src-tauri\resources\backend\dist"
xcopy /E /I /Y "..\backend\node_modules" "src-tauri\resources\backend\node_modules"
copy /Y "..\backend\package.json" "src-tauri\resources\backend\"
echo Backend resources prepared
echo.

REM Check MongoDB binary
echo Checking MongoDB binary...
if not exist "src-tauri\resources\mongodb\mongod.exe" (
    echo WARNING: MongoDB binary not found!
    echo Please download MongoDB and place mongod.exe in:
    echo   src-tauri\resources\mongodb\mongod.exe
    echo.
    echo See: src-tauri\resources\mongodb\README.md
    echo.
    set /p continue="Continue anyway? (y/n) "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo MongoDB binary found
)
echo.

REM Build Tauri app
echo Building Tauri desktop app...
call npm run build

echo.
echo Build complete!
echo.
echo Installer location:
echo   src-tauri\target\release\bundle\
echo.
echo Desktop application is ready for distribution!

pause
