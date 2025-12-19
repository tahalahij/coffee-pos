# 🎯 Desktop App Build Checklist

Use this checklist to ensure successful desktop app build and deployment.

---

## 📋 Pre-Build Setup

### Development Environment
- [ ] **Node.js 18+** installed
  ```bash
  node --version  # Should show v18.x or higher
  ```
- [ ] **Rust & Cargo** installed
  ```bash
  cargo --version  # Should show version info
  ```
- [ ] **Visual Studio Build Tools** installed (Windows)
  - [ ] MSVC v143 build tools
  - [ ] Windows 10/11 SDK

### MongoDB Setup
- [ ] MongoDB Community Server downloaded
- [ ] `mongod.exe` extracted
- [ ] `mongod.exe` copied to `desktop/src-tauri/resources/mongodb/`
- [ ] File size ~50-100 MB verified

### Dependencies
- [ ] Root dependencies installed
  ```bash
  npm install  # In project root
  ```
- [ ] Backend dependencies installed
  ```bash
  cd backend && npm install
  ```
- [ ] Frontend dependencies installed
  ```bash
  cd frontend && npm install
  ```
- [ ] Desktop dependencies installed
  ```bash
  cd desktop && npm install
  ```

### Optional: Icons
- [ ] Application icons created
- [ ] Icons placed in `desktop/src-tauri/icons/`
- [ ] Required: `icon.ico`, `32x32.png`, `128x128.png`

---

## 🏗️ Build Process

### Backend Build
- [ ] Navigate to backend directory
  ```bash
  cd backend
  ```
- [ ] Run build command
  ```bash
  npm run build
  ```
- [ ] Verify output exists
  ```bash
  ls dist/main.js  # Should exist
  ```

### Frontend Build
- [ ] Navigate to frontend directory
  ```bash
  cd frontend
  ```
- [ ] Run build with desktop flag
  ```bash
  DESKTOP_BUILD=true npm run build
  # Windows: set DESKTOP_BUILD=true && npm run build
  ```
- [ ] Verify output exists
  ```bash
  ls out/  # Should contain static files
  ```

### Resource Preparation
- [ ] Navigate to desktop directory
  ```bash
  cd desktop
  ```
- [ ] Create resources directory
  ```bash
  mkdir -p src-tauri/resources/backend
  ```
- [ ] Copy backend dist
  ```bash
  cp -r ../backend/dist src-tauri/resources/backend/
  ```
- [ ] Copy backend node_modules
  ```bash
  cp -r ../backend/node_modules src-tauri/resources/backend/
  ```
- [ ] Copy backend package.json
  ```bash
  cp ../backend/package.json src-tauri/resources/backend/
  ```

### Tauri Build
- [ ] Run Tauri build
  ```bash
  npm run build
  # Or: npx tauri build
  ```
- [ ] Wait for compilation (5-15 minutes first time)
- [ ] Verify no errors in output

---

## ✅ Build Verification

### Check Build Output
- [ ] Installer exists
  ```bash
  ls src-tauri/target/release/bundle/msi/
  # Should show: Cafe POS_1.0.0_x64_en-US.msi
  ```
- [ ] Installer size reasonable (300-500 MB)
- [ ] Executable exists
  ```bash
  ls src-tauri/target/release/cafe-pos.exe
  ```

### Test Executable Directly
- [ ] Run executable
  ```bash
  ./src-tauri/target/release/cafe-pos.exe
  ```
- [ ] App window opens
- [ ] No console errors
- [ ] MongoDB starts (check port 27017)
- [ ] Backend starts (check port 3001)
- [ ] Frontend loads in window

### Test Installer
- [ ] Create clean Windows VM or test machine
- [ ] Copy `.msi` installer to test machine
- [ ] Run installer
- [ ] Installation completes without errors
- [ ] App appears in Start Menu
- [ ] Launch app from Start Menu
- [ ] All services start automatically
- [ ] App works offline (disconnect network)
- [ ] Close app cleanly
- [ ] Verify processes stopped

---

## 🧪 Functional Testing

### MongoDB
- [ ] MongoDB process starts
- [ ] Binds to 127.0.0.1:27017 (check with `netstat`)
- [ ] Database files created in `%APPDATA%/cafe-pos/data/db/`
- [ ] Logs written to `%APPDATA%/cafe-pos/data/logs/mongodb.log`
- [ ] No external network access

### Backend
- [ ] Backend process starts
- [ ] API accessible at `http://localhost:3001/api`
- [ ] Swagger docs available at `http://localhost:3001/api/docs`
- [ ] Connects to MongoDB successfully
- [ ] CORS properly configured
- [ ] Environment variables correct

### Frontend
- [ ] UI loads in app window
- [ ] No blank screen
- [ ] All pages accessible
- [ ] API calls work
- [ ] Data persists after restart
- [ ] Responsive layout works

### Desktop Integration
- [ ] Window size correct (1400x900)
- [ ] Window resizable
- [ ] Minimize/maximize works
- [ ] Close button works
- [ ] App appears in taskbar
- [ ] Icon shows correctly (if set)

---

## 🔐 Security Checks

- [ ] MongoDB bound to localhost only
- [ ] No external ports exposed
- [ ] Database in user AppData (not Program Files)
- [ ] No admin privileges required
- [ ] Processes run as current user
- [ ] Clean shutdown kills all child processes

---

## 📦 Distribution Preparation

### Installer Package
- [ ] Installer file renamed appropriately
- [ ] Version number correct
- [ ] File hash generated (SHA256)
- [ ] Installer tested on clean machine

### Documentation
- [ ] User installation guide created
- [ ] System requirements documented
- [ ] Troubleshooting guide included
- [ ] Release notes written

### Optional: Code Signing
- [ ] Code signing certificate acquired
- [ ] Installer signed with certificate
- [ ] Signature verified
- [ ] SmartScreen warning avoided

### Distribution Channels
- [ ] Upload location determined
- [ ] Download instructions created
- [ ] Update mechanism planned
- [ ] Support process established

---

## 🎉 Final Validation

Before releasing to production:

- [ ] ✅ All build steps complete without errors
- [ ] ✅ Installer created successfully
- [ ] ✅ Tested on clean Windows 10 machine
- [ ] ✅ Tested on clean Windows 11 machine
- [ ] ✅ MongoDB auto-starts correctly
- [ ] ✅ Backend auto-starts correctly
- [ ] ✅ Frontend loads correctly
- [ ] ✅ All features work as expected
- [ ] ✅ Works completely offline
- [ ] ✅ Exits cleanly with no hanging processes
- [ ] ✅ Uninstall works correctly
- [ ] ✅ No files left after uninstall (except AppData)
- [ ] ✅ Documentation complete
- [ ] ✅ Support process ready

---

## 📊 Build Metrics

Record these for reference:

- **Build Date**: _______________
- **Build Time**: _______________ minutes
- **Installer Size**: _______________ MB
- **Installed Size**: _______________ MB
- **Windows Version Tested**: _______________
- **Node.js Version**: _______________
- **Rust Version**: _______________
- **Tauri Version**: _______________
- **MongoDB Version**: _______________

---

## 🐛 Common Issues Log

Document any issues encountered and their solutions:

### Issue 1:
**Problem**: _______________________________________________
**Solution**: _______________________________________________

### Issue 2:
**Problem**: _______________________________________________
**Solution**: _______________________________________________

### Issue 3:
**Problem**: _______________________________________________
**Solution**: _______________________________________________

---

## 📝 Notes

Additional notes or observations:

_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Checklist Version**: 1.0  
**Last Updated**: December 19, 2025  
**Status**: Ready for use
