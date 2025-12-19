# 🖥️ Cafe POS Desktop Application

## Overview

This directory contains the **Tauri-based desktop application** that bundles:
- ✅ Next.js frontend
- ✅ NestJS backend
- ✅ MongoDB database (bundled, no external install required)

The desktop app is a **standalone Windows executable** that auto-starts all services.

---

## 📋 Prerequisites

### Development Environment

1. **Node.js** (v18 or later)
   - Download: https://nodejs.org/

2. **Rust** (for Tauri)
   - Download: https://www.rust-lang.org/tools/install
   - Run: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

3. **Visual Studio C++ Build Tools** (Windows only)
   - Download: https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++" workload

4. **MongoDB Binaries**
   - Download MongoDB Community Server
   - Extract `mongod.exe` to `src-tauri/resources/mongodb/`
   - See: `src-tauri/resources/mongodb/README.md`

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# From project root
cd desktop
npm install

# Install Rust dependencies (first time only)
cd src-tauri
cargo fetch
```

### 2. Download MongoDB

```bash
# Download MongoDB 7.0 for Windows
# Extract mongod.exe to: src-tauri/resources/mongodb/mongod.exe
```

See detailed instructions in `src-tauri/resources/mongodb/README.md`

### 3. Build Backend & Frontend

```bash
# From desktop directory
npm run build:backend
npm run build:frontend
```

This will:
- Build NestJS backend to `../backend/dist/`
- Build Next.js frontend to `../frontend/out/`

### 4. Development Mode

```bash
npm run dev
```

This starts Tauri in development mode, loading:
- Frontend from `http://localhost:3000` (must run separately)
- Backend will auto-start on port 3001
- MongoDB will auto-start on port 27017

### 5. Production Build

```bash
npm run build
```

Creates Windows installer in `src-tauri/target/release/bundle/`

---

## 📂 Project Structure

```
desktop/
├── package.json                 # Desktop app dependencies
├── src-tauri/
│   ├── Cargo.toml              # Rust dependencies
│   ├── tauri.conf.json         # Tauri configuration
│   ├── build.rs                # Build script
│   ├── src/
│   │   └── main.rs             # Application entry point
│   ├── resources/
│   │   └── mongodb/
│   │       ├── mongod.exe      # MongoDB binary (download separately)
│   │       ├── mongod.cfg      # MongoDB configuration
│   │       └── README.md       # Setup instructions
│   ├── icons/
│   │   └── *.png, *.ico        # Application icons
│   └── target/                 # Build outputs
│       └── release/
│           └── bundle/
│               ├── msi/        # Windows installer
│               └── nsis/       # Alternative installer
└── README.md                    # This file
```

---

## 🔧 Configuration

### Environment Variables

The desktop app sets these automatically:

```bash
DESKTOP_MODE=true                          # Enables desktop-specific features
MONGODB_URI=mongodb://127.0.0.1:27017/cafe_pos
PORT=3001                                  # Backend port
NODE_ENV=production
```

### MongoDB Configuration

Located at `src-tauri/resources/mongodb/mongod.cfg`:

```yaml
storage:
  dbPath: data/db                # Relative to app data directory

net:
  bindIp: 127.0.0.1             # Localhost only (secure)
  port: 27017

systemLog:
  destination: file
  path: data/logs/mongodb.log
```

### Tauri Configuration

Edit `src-tauri/tauri.conf.json` to customize:

- Window size and behavior
- Application metadata
- Bundle settings
- Security policies

---

## 🏗️ Building for Production

### Full Build Process

```bash
# 1. Clean previous builds (optional)
rm -rf src-tauri/target

# 2. Build backend
npm run build:backend

# 3. Build frontend for desktop
cd ../frontend
DESKTOP_BUILD=true npm run build
cd ../desktop

# 4. Build Tauri app
npm run build
```

### Output

The installer will be created at:

```
src-tauri/target/release/bundle/
├── msi/
│   └── Cafe POS_1.0.0_x64_en-US.msi      # MSI installer
└── nsis/
    └── Cafe POS_1.0.0_x64-setup.exe      # NSIS installer
```

### Distribution

Distribute either `.msi` or `.exe` to end users. Both are self-contained installers.

---

## 🧪 Testing

### Test the Built App

```bash
# After building, test the executable directly
./src-tauri/target/release/cafe-pos.exe
```

### Verify Services

1. **MongoDB**: Should start automatically on port 27017
2. **Backend**: Should start automatically on port 3001
3. **Frontend**: Should load in the app window

### Check Logs

Logs are stored in:
```
%APPDATA%/cafe-pos/data/logs/mongodb.log
```

---

## 🐛 Troubleshooting

### MongoDB Won't Start

**Symptoms**: App opens but doesn't connect to database

**Solutions**:
1. Verify `mongod.exe` exists in `src-tauri/resources/mongodb/`
2. Check file permissions
3. Ensure port 27017 is not in use
4. Check MongoDB logs in app data directory

### Backend Won't Start

**Symptoms**: Frontend loads but API calls fail

**Solutions**:
1. Verify backend was built: `../backend/dist/main.js` exists
2. Check Node.js is installed system-wide
3. Verify port 3001 is available
4. Check environment variables in `main.rs`

### Frontend Shows Error

**Symptoms**: App window shows error page

**Solutions**:
1. Verify frontend was built: `../frontend/out/` exists
2. Check `tauri.conf.json` distDir setting
3. Ensure `DESKTOP_BUILD=true` was set during frontend build

### Build Fails

**Symptoms**: `npm run build` produces errors

**Solutions**:
1. Install Rust: https://rustup.rs/
2. Install Visual Studio Build Tools (Windows)
3. Run `cargo clean` in `src-tauri/`
4. Clear npm cache: `npm cache clean --force`

---

## 📦 Packaging Backend in Resources

The Rust application expects the backend to be in `resources/backend/`. Currently, you'll need to manually copy it:

```bash
# After building backend
mkdir -p src-tauri/resources/backend
cp -r ../backend/dist src-tauri/resources/backend/
cp -r ../backend/node_modules src-tauri/resources/backend/
cp ../backend/package.json src-tauri/resources/backend/
```

**Note**: This can be automated in the build script. See "Enhancements" section below.

---

## 🎯 Success Criteria

A properly built desktop app should:

✅ Install without requiring MongoDB installation
✅ Auto-start MongoDB on launch
✅ Auto-start backend after MongoDB is ready
✅ Load frontend in app window
✅ Work completely offline
✅ Cleanly stop all processes on exit

---

## 🚀 Deployment

### For End Users

1. Download the installer (`.msi` or `.exe`)
2. Run the installer
3. Launch "Cafe POS" from Start Menu
4. No additional setup required!

### System Requirements

- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk**: 500 MB free space
- **Network**: Not required (fully offline)

---

## 🔐 Security

- MongoDB binds only to `127.0.0.1` (localhost)
- No external network access required
- Database stored in user's `%APPDATA%` directory
- No admin privileges needed

---

## 🛠️ Development Tips

### Live Reload

For development with live reload:

```bash
# Terminal 1: Frontend dev server
cd ../frontend
npm run dev

# Terminal 2: Backend dev server
cd ../backend
npm run start:dev

# Terminal 3: Tauri dev mode
cd ../desktop
npm run dev
```

### Debugging

Enable debug logs in `main.rs`:
```rust
println!("[DEBUG] MongoDB path: {:?}", mongod_path);
```

View console output when running `tauri dev`.

---

## 📚 Additional Resources

- **Tauri Docs**: https://tauri.app/v1/guides/
- **MongoDB Manual**: https://docs.mongodb.com/manual/
- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎨 Enhancements (TODO)

Future improvements:

- [ ] Auto-copy backend to resources during build
- [ ] Health check endpoint before showing UI
- [ ] Auto-update support via Tauri updater
- [ ] Database migration runner on first launch
- [ ] Splash screen during startup
- [ ] Tray icon for background operation
- [ ] Custom installer with license agreement
- [ ] Code signing for Windows SmartScreen

---

## 📝 License

Same as parent project.

---

## 🆘 Support

For issues specific to the desktop app, check:
1. This README
2. MongoDB setup guide: `src-tauri/resources/mongodb/README.md`
3. Icon setup guide: `src-tauri/icons/README.md`
4. Tauri documentation: https://tauri.app/

For general application issues, see main project README.
