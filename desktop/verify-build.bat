@echo off
REM ============================================
REM Pre-Build Verification for Cafe POS
REM Checks all requirements before building
REM ============================================

echo.
echo ========================================
echo   Pre-Build Verification
echo ========================================
echo.

set ERROR_COUNT=0

REM Check Node.js
echo [1/7] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo       FAIL: Node.js not found
    echo       Install from: https://nodejs.org/
    set /a ERROR_COUNT+=1
) else (
    for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
    echo       OK: Node.js !NODE_VERSION!
)

REM Check npm
echo [2/7] Checking npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo       FAIL: npm not found
    set /a ERROR_COUNT+=1
) else (
    for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
    echo       OK: npm !NPM_VERSION!
)

REM Check Rust
echo [3/7] Checking Rust...
where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo       FAIL: Rust/Cargo not found
    echo       Install from: https://rustup.rs/
    set /a ERROR_COUNT+=1
) else (
    for /f "tokens=*" %%v in ('cargo -V') do set CARGO_VERSION=%%v
    echo       OK: !CARGO_VERSION!
)

REM Check backend build
echo [4/7] Checking backend build...
if exist "..\backend\dist\main.js" (
    echo       OK: Backend is built
) else (
    echo       WARNING: Backend not built (will build during setup)
)

REM Check frontend build
echo [5/7] Checking frontend build...
if exist "..\frontend\out\index.html" (
    echo       OK: Frontend is built
) else (
    echo       WARNING: Frontend not built (will build during setup)
)

REM Check MongoDB binary
echo [6/7] Checking MongoDB binary...
if exist "src-tauri\resources\mongodb\mongod.exe" (
    for %%F in (src-tauri\resources\mongodb\mongod.exe) do set MONGO_SIZE=%%~zF
    set /a MONGO_MB=!MONGO_SIZE! / 1048576
    echo       OK: mongod.exe found (!MONGO_MB! MB)
) else (
    echo       FAIL: mongod.exe not found
    echo       Run: setup-mongodb.bat to download
    set /a ERROR_COUNT+=1
)

REM Check Tauri dependencies
echo [7/7] Checking Tauri dependencies...
if exist "src-tauri\Cargo.toml" (
    echo       OK: Tauri project configured
) else (
    echo       FAIL: Tauri configuration not found
    set /a ERROR_COUNT+=1
)

echo.
echo ========================================

if %ERROR_COUNT% EQU 0 (
    echo   ALL CHECKS PASSED!
    echo.
    echo   You are ready to build the application.
    echo   Run: build-windows.bat
) else (
    echo   %ERROR_COUNT% ERROR(S) FOUND!
    echo.
    echo   Please fix the errors above before building.
)

echo ========================================
echo.

pause
exit /b %ERROR_COUNT%
