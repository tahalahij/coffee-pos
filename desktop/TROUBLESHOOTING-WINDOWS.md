# 🔧 Windows Application Troubleshooting Guide

## Immediate Crash on Startup

If the application crashes immediately when you click on it, follow these steps:

### Step 1: Check the Startup Log

The application now creates a detailed log file. Find it at:

```
%APPDATA%\com.cafepos.app\startup.log
```

**How to access:**
1. Press `Win + R`
2. Type: `%APPDATA%\com.cafepos.app`
3. Press Enter
4. Open `startup.log` with Notepad

The log will tell you exactly what went wrong.

---

## Common Issues and Solutions

### Issue 1: MongoDB Not Found

**Error in log:**
```
mongod.exe not found at: ...
```

**Solution:**
1. MongoDB was not bundled with the application
2. You need to rebuild the app with MongoDB included
3. Place `mongod.exe` in `desktop/src-tauri/resources/mongodb/`
4. Rebuild using the build script

### Issue 2: Backend Not Found

**Error in log:**
```
Backend main.js not found at: ...
```

**Solution:**
1. The backend wasn't built or bundled correctly
2. Make sure to build the backend before building the desktop app:
   ```bash
   cd backend
   npm run build
   ```
3. The build script should copy the backend to the resources folder

### Issue 3: Node.js Not Installed

**Error in log:**
```
Failed to spawn backend process: program not found
```

**Solution:**
1. Install Node.js 18+ from https://nodejs.org
2. Restart your computer after installation
3. Verify: Open Command Prompt and type `node --version`

### Issue 4: Port Already in Use

**Error in log:**
```
Timeout waiting for port 27017
```
or
```
Timeout waiting for port 3001
```

**Solution:**
1. Another program is using these ports
2. Close any running instances of the app
3. Check Task Manager for `mongod.exe` or `node.exe` processes
4. Kill them if found
5. Try restarting the application

### Issue 5: Permission Issues

**Error in log:**
```
Failed to create db directory: Permission denied
```

**Solution:**
1. Run the application as Administrator (right-click > Run as Administrator)
2. Or check that `%APPDATA%` is writable

---

## Rebuild Instructions

If you need to rebuild the application with the fixes:

### Step 1: Update Code

The fixes have been applied to:
- `desktop/src-tauri/Cargo.toml` - Added logging dependencies
- `desktop/src-tauri/src/main.rs` - Added comprehensive logging and error dialogs

### Step 2: Build Backend

```bash
cd backend
npm install
npm run build
```

### Step 3: Build Desktop App

**On Windows:**
```bash
cd desktop
npm install
npm run build
```

Or use the build script:
```bash
.\build-windows.bat
```

### Step 4: Test

The new build will:
- Create a log file at `%APPDATA%\com.cafepos.app\startup.log`
- Show error dialogs if something fails
- Give you clear error messages

---

## Additional Diagnostics

### Check MongoDB Manually

1. Navigate to where you installed the app
2. Try running MongoDB manually:
   ```
   .\mongod.exe --dbpath C:\temp\mongodata
   ```
3. If it fails, MongoDB itself might be corrupted

### Check Backend Manually

1. Open Command Prompt
2. Navigate to the backend folder in resources
3. Run:
   ```
   node dist/main.js
   ```
4. Check for errors

### Verify Node.js Installation

```bash
node --version
npm --version
```

Both should return version numbers.

---

## Getting Help

When asking for help, please provide:

1. **The complete `startup.log` file**
2. **Your Windows version**: Run `winver` to check
3. **Node.js version**: `node --version`
4. **How you installed the app**: Downloaded installer, built from source, etc.
5. **Any error dialogs** that appeared (take a screenshot)

---

## Log File Location Quick Reference

| OS | Log Location |
|----|--------------|
| Windows | `%APPDATA%\com.cafepos.app\startup.log` |
| macOS | `~/Library/Application Support/com.cafepos.app/startup.log` |
| Linux | `~/.config/com.cafepos.app/startup.log` |

---

## MongoDB Log Location

If MongoDB starts but has issues:

| OS | MongoDB Log Location |
|----|---------------------|
| Windows | `%APPDATA%\com.cafepos.app\data\logs\mongodb.log` |
| macOS | `~/Library/Application Support/com.cafepos.app/data/logs/mongodb.log` |
| Linux | `~/.config/com.cafepos.app/data/logs/mongodb.log` |

---

## Quick Fix Summary

1. ✅ **Check the log file** first
2. ✅ **Install Node.js** if not installed
3. ✅ **Kill any running processes** (mongod.exe, node.exe)
4. ✅ **Run as Administrator** if permission errors
5. ✅ **Rebuild** if resources are missing

The new error dialogs will guide you to the specific issue!
