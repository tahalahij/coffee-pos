# Windows Build Setup Guide

Complete guide for building Cafe POS Desktop on Windows.

## Prerequisites

### Required Software

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node -v` should show v18.0.0 or higher

2. **Rust**
   - Download: https://rustup.rs/
   - Verify: `cargo -V` should show cargo 1.70.0 or higher

3. **Visual Studio Build Tools** (if not already installed)
   - Rust installer will prompt you to install these
   - Or download: https://visualstudio.microsoft.com/visual-cpp-build-tools/

### Optional but Recommended

- **Git** for version control
- **Windows Terminal** for better command-line experience

## Setup Process

### Option 1: Automated Setup (Recommended)

1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the desktop folder:
   ```bat
   cd path\to\cafe-pos\desktop
   ```
3. Run the complete setup:
   ```bat
   setup-complete.bat
   ```
4. Wait for all dependencies to install and MongoDB to download

### Option 2: Manual Setup

1. **Install npm dependencies:**
   ```bat
   cd path\to\cafe-pos
   npm install
   cd backend && npm install
   cd ..\frontend && npm install
   cd ..\desktop && npm install
   ```

2. **Download MongoDB:**
   ```bat
   cd desktop
   setup-mongodb.bat
   ```

3. **Verify setup:**
   ```bat
   verify-build.bat
   ```

## Building the Application

### Full Build

Build everything (backend, frontend, desktop app):

```bat
cd desktop
build-windows.bat
```

This will:
1. ✅ Check prerequisites
2. ✅ Install dependencies
3. ✅ Build backend (NestJS)
4. ✅ Build frontend (Next.js)
5. ✅ Copy resources to Tauri
6. ✅ Verify MongoDB binary
7. ✅ Build Tauri application

**Build time:** 10-15 minutes on first build, 3-5 minutes on subsequent builds

### Output Files

After successful build, find the installers at:

- **MSI Installer:** `src-tauri\target\release\bundle\msi\Cafe POS_1.0.0_x64_en-US.msi`
- **NSIS Installer:** `src-tauri\target\release\bundle\nsis\Cafe POS_1.0.0_x64-setup.exe`
- **Portable EXE:** `src-tauri\target\release\cafe-pos.exe`

## Verification

### Before Building

Run verification check:
```bat
cd desktop
verify-build.bat
```

This checks:
- ✅ Node.js installed
- ✅ npm installed
- ✅ Rust/Cargo installed
- ✅ MongoDB binary present
- ✅ Tauri configuration

### After Building

Test the application:
```bat
cd src-tauri\target\release
cafe-pos.exe
```

Check the startup log for errors:
```bat
%APPDATA%\Cafe POS\startup.log
```

## Troubleshooting

### Build Fails: "mongod.exe not found"

**Solution:**
```bat
cd desktop
setup-mongodb.bat
```

### Build Fails: "Backend not built"

**Solution:**
```bat
cd backend
npm run build
```

### Build Fails: "Frontend not built"

**Solution:**
```bat
cd frontend
set DESKTOP_BUILD=true
npm run build
```

### Runtime Error: "MongoDB failed to start"

**Check:**
1. MongoDB binary exists: `desktop\src-tauri\resources\mongodb\mongod.exe`
2. Port 27017 is not in use
3. Check logs: `%APPDATA%\Cafe POS\startup.log`

### Runtime Error: "Backend failed to start"

**Check:**
1. Node.js is installed and in PATH
2. Backend files are bundled: `desktop\src-tauri\resources\backend\`
3. Check logs: `%APPDATA%\Cafe POS\startup.log`

### App crashes immediately

**Debug steps:**
1. Check startup log: `%APPDATA%\Cafe POS\startup.log`
2. Run portable EXE from command line to see errors
3. Verify all prerequisites are installed

### Cannot find log file

**Log location:**
```
C:\Users\YourUsername\AppData\Roaming\Cafe POS\startup.log
```

**Or access via:**
```bat
Win + R → %APPDATA%\Cafe POS
```

## Development Mode

### Running in Dev Mode

```bat
cd frontend
npm run dev

# In another terminal:
cd backend
npm run start:dev

# In another terminal:
cd desktop
npm run tauri dev
```

### Rebuilding After Changes

**Backend changes:**
```bat
cd backend
npm run build
cd ..\desktop
npm run build
```

**Frontend changes:**
```bat
cd frontend
npm run build
cd ..\desktop
npm run build
```

**Rust/Tauri changes:**
```bat
cd desktop
npm run build
```

## Clean Build

To start fresh:

```bat
# Clean Rust build
cd desktop\src-tauri
cargo clean

# Clean node_modules (if needed)
cd ..\..
rd /s /q node_modules
rd /s /q backend\node_modules
rd /s /q frontend\node_modules
rd /s /q desktop\node_modules

# Reinstall
npm install
cd backend && npm install
cd ..\frontend && npm install
cd ..\desktop && npm install
```

## Distribution

### Creating Release

1. Build with production settings:
   ```bat
   cd desktop
   set NODE_ENV=production
   build-windows.bat
   ```

2. Choose installer:
   - **MSI:** Better for corporate deployment
   - **NSIS:** More features, smaller size
   - **Portable EXE:** No installation required

3. Test on clean Windows machine before releasing

### Installer Size

Expected sizes:
- **MSI/NSIS Installer:** 150-250 MB (includes MongoDB)
- **Installed Application:** 200-300 MB
- **Runtime Data:** Grows with database usage

## Support

### Logs

- **Application:** `%APPDATA%\Cafe POS\startup.log`
- **MongoDB:** `%APPDATA%\Cafe POS\data\logs\mongodb.log`
- **Build:** Console output during build

### Common Issues

See TROUBLESHOOTING-WINDOWS.md for detailed solutions.

### Getting Help

1. Check logs for error messages
2. Verify all prerequisites are installed
3. Try clean build
4. Check GitHub issues

---

**Last Updated:** January 2026
**Compatible With:** Windows 10/11 x64
