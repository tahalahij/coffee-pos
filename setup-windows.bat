@echo off
SETLOCAL

REM === Check for Node.js and npm ===
where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [INFO] npm not found. Downloading Node.js LTS installer...
    powershell -Command "Start-Process 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -Wait"
    echo [INFO] Please install Node.js, then re-run this script.
    pause
    exit /b 1
)

REM === Install root dependencies ===
echo [INFO] Installing root dependencies...
npm install

REM === Install backend dependencies ===
cd backend
echo [INFO] Installing backend dependencies...
npm install
echo [INFO] Building backend...
npm run build
cd ..

REM === Install frontend dependencies ===
cd frontend
echo [INFO] Installing frontend dependencies...
npm install
echo [INFO] Building frontend...
set DESKTOP_BUILD=true
npm run build
cd ..

REM === Install desktop dependencies ===
cd desktop
echo [INFO] Installing desktop dependencies...
npm install
cd ..

REM === Prepare backend resources for Tauri ===
cd desktop
if not exist src-tauri\resources\backend mkdir src-tauri\resources\backend
xcopy /E /I /Y ..\backend\dist src-tauri\resources\backend\dist
xcopy /E /I /Y ..\backend\node_modules src-tauri\resources\backend\node_modules
copy ..\backend\package.json src-tauri\resources\backend\

REM === Build the Windows desktop app ===
echo [INFO] Building Windows desktop app...
npm run build

echo [SUCCESS] All done! Find your installer in src-tauri\target\release\bundle\msi or nsis.
pause
ENDLOCAL
