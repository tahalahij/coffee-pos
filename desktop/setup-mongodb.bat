@echo off
REM ============================================
REM MongoDB Setup for Cafe POS Desktop
REM Downloads and configures MongoDB for bundling
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   MongoDB Setup for Cafe POS
echo ========================================
echo.

cd /d "%~dp0\src-tauri\resources\mongodb"

if exist "mongod.exe" (
    echo MongoDB is already set up!
    echo.
    echo mongod.exe found at: %CD%\mongod.exe
    echo.
    set /p reinstall="Do you want to download again? (y/n): "
    if /i not "!reinstall!"=="y" (
        echo.
        echo Setup complete. You can now run build-windows.bat
        pause
        exit /b 0
    )
    del mongod.exe
)

echo.
echo This script will download MongoDB Community Server
echo and extract mongod.exe for bundling with the app.
echo.
echo NOTE: The download is approximately 300-400 MB
echo.
set /p continue="Continue? (y/n): "
if /i not "%continue%"=="y" exit /b 0

echo.
echo [1/4] Downloading MongoDB Community Server...
echo       Version: 7.0.15 for Windows x64
echo.

REM Download MongoDB 7.0.15 (latest stable as of Jan 2026)
set MONGO_URL=https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.15.zip
set ZIP_FILE=mongodb-windows.zip

curl -L -o "%ZIP_FILE%" "%MONGO_URL%"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Download failed!
    echo.
    echo Please download manually from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo Extract and copy mongod.exe to:
    echo %CD%
    pause
    exit /b 1
)

echo       Downloaded successfully!

echo.
echo [2/4] Extracting MongoDB binaries...

REM Extract using PowerShell
powershell -Command "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '.' -Force"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Extraction failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Copying mongod.exe...

REM Find and copy mongod.exe (it's in bin folder of extracted directory)
for /d %%d in (mongodb-*) do (
    if exist "%%d\bin\mongod.exe" (
        copy "%%d\bin\mongod.exe" "mongod.exe"
        echo       Copied from %%d\bin\mongod.exe
    )
)

if not exist "mongod.exe" (
    echo ERROR: Could not find mongod.exe in extracted files!
    pause
    exit /b 1
)

echo.
echo [4/4] Cleaning up...

REM Remove downloaded files
del "%ZIP_FILE%"
for /d %%d in (mongodb-*) do rd /s /q "%%d"

echo       Cleanup complete!

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo MongoDB binaries are ready for bundling.
echo.
echo File location: %CD%\mongod.exe
for %%F in (mongod.exe) do echo File size: %%~zF bytes (approx. %%~zF / 1048576 MB)
echo.
echo Next steps:
echo   1. Return to desktop folder: cd ..\..\..
echo   2. Run build script: build-windows.bat
echo.
echo ========================================

pause
