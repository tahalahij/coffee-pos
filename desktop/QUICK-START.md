# 🖥️ Desktop Application Quick Reference

## 🚀 Quick Build

### Prerequisites
1. **Node.js 18+** → https://nodejs.org/
2. **Rust** → https://rustup.rs/
3. **VS Build Tools** (Windows) → https://visualstudio.microsoft.com/downloads/
4. **MongoDB binaries** → Place `mongod.exe` in `desktop/src-tauri/resources/mongodb/`

### Build Commands

```bash
# From project root
npm run install:all        # Install all dependencies

# From desktop directory
cd desktop
build.bat                  # Windows: Full build → creates .msi installer

# Or individual steps
npm run build:backend      # Build NestJS
npm run build:frontend     # Build Next.js
npm run build              # Build Tauri app
```

### Output
```
desktop/src-tauri/target/release/bundle/msi/
└── Cafe POS_1.0.0_x64_en-US.msi  (~300-400 MB)
```

---

## 📖 Documentation

- **[DESKTOP-SETUP.md](../DESKTOP-SETUP.md)** - Complete setup guide
- **[desktop/README.md](README.md)** - Desktop app documentation  
- **[IMPLEMENTATION-SUMMARY.md](../IMPLEMENTATION-SUMMARY.md)** - Technical details

---

## ✅ What You Get

A **single `.msi` installer** that includes:
- ✅ MongoDB database (no external install)
- ✅ NestJS backend API
- ✅ Next.js frontend UI
- ✅ Auto-start on launch
- ✅ Offline operation
- ✅ No admin privileges needed

---

## 🎯 Key Features

### Auto-Start Services
- MongoDB starts on `127.0.0.1:27017`
- Backend starts on `127.0.0.1:3001`
- Frontend loads in app window

### Security
- MongoDB bound to localhost only
- No network exposure
- Data in user's `%APPDATA%` directory

### User Experience
- One-click install
- No configuration needed
- Clean uninstall

---

## 🐛 Common Issues

### "MongoDB binary not found"
```bash
# Download MongoDB and copy mongod.exe to:
desktop/src-tauri/resources/mongodb/mongod.exe
```

### "Rust not found"
```bash
# Install Rust
winget install --id Rustlang.Rustup
```

### "Build failed - MSVC not found"
```bash
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
# Select "Desktop development with C++" workload
```

---

## 📋 Build Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Rust installed (`cargo --version`)
- [ ] VS Build Tools installed (Windows)
- [ ] MongoDB binary downloaded (`mongod.exe` in resources)
- [ ] Dependencies installed (`npm run install:all`)
- [ ] Backend builds (`cd backend && npm run build`)
- [ ] Frontend builds (`cd frontend && DESKTOP_BUILD=true npm run build`)
- [ ] Desktop builds (`cd desktop && build.bat`)
- [ ] Installer created in `target/release/bundle/msi/`

---

## 🎉 Success Criteria

Your desktop app is ready when:

✅ Builds without errors  
✅ Creates `.msi` installer  
✅ Runs on clean Windows machine  
✅ MongoDB auto-starts  
✅ Backend auto-starts  
✅ Frontend loads  
✅ Works offline  
✅ Exits cleanly  

---

**Need detailed help?** See [DESKTOP-SETUP.md](../DESKTOP-SETUP.md)
