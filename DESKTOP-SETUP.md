# 🖥️ Desktop Application Setup Guide

This guide will help you build the **Cafe POS Desktop Application** - a standalone Windows executable that requires no external MongoDB installation.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Building the Desktop App](#building-the-desktop-app)
4. [Testing](#testing)
5. [Distribution](#distribution)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

### Required Software

#### 1. Node.js (v18 or later)
```bash
# Check if installed
node --version

# Download from:
https://nodejs.org/
```

#### 2. Rust (for Tauri)
```bash
# Check if installed
cargo --version

# Install on Windows (PowerShell as Admin):
# Download and run rustup-init.exe from:
https://rustup.rs/

# Or use:
winget install --id Rustlang.Rustup
```

#### 3. Visual Studio C++ Build Tools (Windows)
Required for compiling native modules.

**Option A: Full Visual Studio**
- Download Visual Studio Community: https://visualstudio.microsoft.com/
- Select "Desktop development with C++" workload

**Option B: Build Tools Only** (Recommended)
```powershell
# Via winget
winget install Microsoft.VisualStudio.2022.BuildTools

# Or download directly:
https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
```

During installation, select:
- ✅ MSVC v143 - VS 2022 C++ x64/x86 build tools
- ✅ Windows 10/11 SDK

#### 4. MongoDB Binaries
You need to download MongoDB separately (it's not in Git due to size).

---

## 🚀 Initial Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project root
cd cafe-pos

# Install all dependencies (frontend, backend, desktop)
npm run install:all
```

### Step 2: Download MongoDB

1. **Visit MongoDB Download Center**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Select:**
   - Version: `7.0.x` (or latest stable)
   - Platform: `Windows`
   - Package: `ZIP`

3. **Download and Extract**
   - Download the ZIP file (~200 MB)
   - Extract to a temporary location

4. **Copy `mongod.exe`**
   ```bash
   # Copy mongod.exe to desktop resources
   # From: extracted-folder/bin/mongod.exe
   # To: desktop/src-tauri/resources/mongodb/mongod.exe
   ```

   Windows PowerShell:
   ```powershell
   # Example (adjust paths):
   Copy-Item "C:\Downloads\mongodb-win32-x86_64-windows-7.0.0\bin\mongod.exe" `
             "desktop\src-tauri\resources\mongodb\mongod.exe"
   ```

5. **Verify**
   ```bash
   # Check file exists and size is ~50-100 MB
   ls -lh desktop/src-tauri/resources/mongodb/mongod.exe
   ```

### Step 3: Setup Icons (Optional)

For a professional app, add icons:

```bash
cd desktop/src-tauri/icons
```

Required files:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.ico` (Windows)
- `icon.icns` (macOS)

Generate icons using:
```bash
npm install -g @tauri-apps/cli
tauri icon path/to/your-icon.png
```

---

## 🏗️ Building the Desktop App

### Quick Build (Automated)

**Windows:**
```batch
cd desktop
build.bat
```

**macOS/Linux:**
```bash
cd desktop
bash build.sh
```

This script will:
1. ✅ Build the backend
2. ✅ Build the frontend
3. ✅ Copy resources to Tauri
4. ✅ Build the Windows installer

### Manual Build (Step by Step)

#### 1. Build Backend
```bash
cd backend
npm run build

# Verify output
ls dist/main.js
```

#### 2. Build Frontend
```bash
cd frontend
DESKTOP_BUILD=true npm run build

# Verify output
ls out/
```

#### 3. Prepare Resources
```bash
cd desktop

# Create resources directory
mkdir -p src-tauri/resources/backend

# Copy backend
cp -r ../backend/dist src-tauri/resources/backend/
cp -r ../backend/node_modules src-tauri/resources/backend/
cp ../backend/package.json src-tauri/resources/backend/
```

#### 4. Build Tauri App
```bash
npm run build

# Or use Tauri CLI directly
npm run tauri build
```

### Build Output

The installer will be created at:
```
desktop/src-tauri/target/release/bundle/
├── msi/
│   └── Cafe POS_1.0.0_x64_en-US.msi      # MSI installer
└── nsis/
    └── Cafe POS_1.0.0_x64-setup.exe      # NSIS installer (if enabled)
```

---

## 🧪 Testing

### Development Mode

Test without building:

```bash
# Terminal 1: Frontend dev server
cd frontend
npm run dev

# Terminal 2: Backend dev server  
cd backend
npm run start:dev

# Terminal 3: Desktop app (in dev mode)
cd desktop
npm run dev
```

The app will load frontend from `localhost:3000` and auto-start backend/MongoDB.

### Testing Built App

```bash
# Run the built executable directly
cd desktop/src-tauri/target/release
./cafe-pos.exe
```

### Verify Services

1. **MongoDB**: Check port 27017
   ```bash
   netstat -an | findstr "27017"
   ```

2. **Backend**: Check port 3001
   ```bash
   curl http://localhost:3001/api/docs
   ```

3. **Frontend**: Should load in the app window automatically

---

## 📦 Distribution

### Package Types

#### MSI Installer (Recommended)
- **File**: `Cafe POS_1.0.0_x64_en-US.msi`
- **Benefits**: 
  - Native Windows installer
  - Integrates with Add/Remove Programs
  - Can be deployed via Group Policy

#### NSIS Installer
- **File**: `Cafe POS_1.0.0_x64-setup.exe`
- **Benefits**:
  - Smaller file size
  - Custom installer UI
  - More configuration options

### Distribution Checklist

- [ ] Test installer on clean Windows machine
- [ ] Verify MongoDB auto-starts
- [ ] Verify backend auto-starts
- [ ] Test offline functionality
- [ ] Check app uninstall works correctly
- [ ] Sign the executable (optional but recommended)

### Code Signing (Optional)

To avoid Windows SmartScreen warnings:

1. **Get a code signing certificate**
   - From trusted CA (DigiCert, Sectigo, etc.)
   - Or use self-signed for internal use

2. **Sign the executable**
   ```powershell
   signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com "Cafe POS_1.0.0_x64-setup.exe"
   ```

3. **Update `tauri.conf.json`**
   ```json
   "windows": {
     "certificateThumbprint": "YOUR_CERT_THUMBPRINT"
   }
   ```

---

## 🐛 Troubleshooting

### Issue: "MongoDB binary not found"

**Solution:**
```bash
# Verify mongod.exe exists
ls desktop/src-tauri/resources/mongodb/mongod.exe

# If not, download MongoDB and copy mongod.exe
# See "Step 2: Download MongoDB" above
```

### Issue: "Rust not found" during build

**Solution:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Or on Windows
winget install --id Rustlang.Rustup

# Restart terminal and verify
cargo --version
```

### Issue: "MSVC not found"

**Solution:**
Install Visual Studio Build Tools with C++ support.

```powershell
# Check what's installed
where cl.exe

# If not found, install Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
```

During installation, ensure:
- ✅ MSVC v143 build tools
- ✅ Windows SDK

### Issue: Backend won't start in built app

**Solution:**
1. Verify Node.js is installed system-wide
   ```bash
   where node
   ```

2. Check backend was copied to resources
   ```bash
   ls desktop/src-tauri/resources/backend/dist/main.js
   ```

3. Check environment variables in `main.rs`

### Issue: App shows blank screen

**Solution:**
1. Verify frontend was built with `DESKTOP_BUILD=true`
2. Check `frontend/out/` directory exists
3. Verify `tauri.conf.json` points to correct `distDir`
   ```json
   "distDir": "../../frontend/out"
   ```

### Issue: MongoDB fails to start

**Solution:**
1. Check port 27017 is not in use
   ```powershell
   netstat -an | findstr "27017"
   ```

2. Check MongoDB logs
   ```
   %APPDATA%\cafe-pos\data\logs\mongodb.log
   ```

3. Verify mongod.exe has execute permissions

4. Try running mongod manually
   ```bash
   desktop/src-tauri/resources/mongodb/mongod.exe --version
   ```

---

## 📚 Additional Resources

### Documentation
- **Tauri Guide**: https://tauri.app/v1/guides/
- **MongoDB Manual**: https://docs.mongodb.com/manual/
- **Rust Book**: https://doc.rust-lang.org/book/

### Tools
- **Tauri CLI**: `npm install -g @tauri-apps/cli`
- **Icon Generator**: https://tauri.app/v1/guides/features/icons
- **Dependency Walker**: Check missing DLLs on Windows

### Community
- **Tauri Discord**: https://discord.com/invite/tauri
- **Stack Overflow**: Tag `tauri`

---

## 🎯 Success Checklist

Your desktop app is ready when:

- ✅ Builds without errors
- ✅ Installer is created in `target/release/bundle/`
- ✅ App runs on clean Windows machine without MongoDB installed
- ✅ MongoDB auto-starts and binds to 127.0.0.1:27017
- ✅ Backend auto-starts and connects to MongoDB
- ✅ Frontend loads in app window
- ✅ All features work offline
- ✅ App exits cleanly, stopping all services

---

## 🎨 Customization

### Change App Name
Edit `desktop/src-tauri/tauri.conf.json`:
```json
{
  "package": {
    "productName": "Your App Name",
    "version": "1.0.0"
  }
}
```

### Change Window Size
Edit `desktop/src-tauri/tauri.conf.json`:
```json
{
  "tauri": {
    "windows": [{
      "width": 1400,
      "height": 900
    }]
  }
}
```

### Change Ports
Edit `desktop/src-tauri/src/main.rs`:
```rust
// MongoDB port
"--port", "27017"

// Backend port
.env("PORT", "3001")
```

---

## 📝 Notes

- **MongoDB binaries** (~100 MB) are excluded from Git
- **node_modules** in resources will make the installer large (~200-400 MB)
- **First startup** may take 10-15 seconds while MongoDB initializes
- **Database location**: `%APPDATA%\cafe-pos\data\db`
- **No admin rights** required for installation or operation

---

## 🚀 Next Steps

After successful build:

1. **Test thoroughly** on various Windows versions
2. **Create installer documentation** for end users
3. **Set up CI/CD** to automate builds
4. **Implement auto-update** using Tauri's updater
5. **Add crash reporting** for production monitoring

---

**Need help?** Check the main [Desktop README](desktop/README.md) or open an issue.
