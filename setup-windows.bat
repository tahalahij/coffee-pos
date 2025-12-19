@echo off
SETLOCAL

REM === Check for Node.js and npm ===
where npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm (Node.js) not found. Please install Node.js from https://nodejs.org/ and re-run this script.
    echo Press any key to continue...
    pause >nul
    cmd /k
)
cd backend
echo [INFO] Installing backend dependencies...
npm install || (echo [ERROR] npm install failed in backend. Press any key to continue... & pause >nul & cmd /k)
echo [INFO] Building backend...
npm run build || (echo [ERROR] Backend build failed. Press any key to continue... & pause >nul & cmd /k)
cd ..

REM === Install frontend dependencies ===
cd frontend
echo [INFO] Installing frontend dependencies...
npm install || (echo [ERROR] npm install failed in frontend. Press any key to continue... & pause >nul & cmd /k)
echo [INFO] Building frontend...
set DESKTOP_BUILD=true
npm run build || (echo [ERROR] Frontend build failed. Press any key to continue... & pause >nul & cmd /k)
cd ..

REM === Install desktop dependencies ===
cd desktop
echo [INFO] Installing desktop dependencies...
npm install || (echo [ERROR] npm install failed in desktop. Press any key to continue... & pause >nul & cmd /k)
cd ..

REM === Prepare backend resources for Tauri ===
cd desktop
if not exist src-tauri\resources\backend mkdir src-tauri\resources\backend

if not exist src-tauri\resources\backend mkdir src-tauri\resources\backend
xcopy /E /I /Y ..\backend\dist src-tauri\resources\backend\dist || (echo [ERROR] xcopy dist failed. Press any key to continue... & pause >nul & cmd /k)
xcopy /E /I /Y ..\backend\node_modules src-tauri\resources\backend\node_modules || (echo [ERROR] xcopy node_modules failed. Press any key to continue... & pause >nul & cmd /k)
copy ..\backend\package.json src-tauri\resources\backend\ || (echo [ERROR] copy package.json failed. Press any key to continue... & pause >nul & cmd /k)

REM === Build the Windows desktop app ===
echo [INFO] Building Windows desktop app...
npm run build || (echo [ERROR] Desktop build failed. Press any key to continue... & pause >nul & cmd /k)

echo [SUCCESS] All done! Find your installer in src-tauri\target\release\bundle\msi or nsis.
pause
ENDLOCAL
