# 🚨 Quick Fix for Windows Crash

## Your app is crashing? Here's what to do:

### 1️⃣ Find the Log File (This will tell you EXACTLY what's wrong)

**Press `Win + R`, type this, and press Enter:**
```
%APPDATA%\com.cafepos.app
```

**Open the file:** `startup.log`

---

### 2️⃣ Common Problems & Solutions

#### ❌ "mongod.exe not found"
**Problem:** MongoDB wasn't included when building
**Fix:** You need to rebuild with MongoDB in `desktop/src-tauri/resources/mongodb/`

#### ❌ "Backend main.js not found"
**Problem:** Backend wasn't built
**Fix:** 
```bash
cd backend
npm run build
cd ../desktop
npm run build
```

#### ❌ "Failed to spawn backend: program not found"
**Problem:** Node.js is not installed
**Fix:** Install Node.js from https://nodejs.org (v18+)

#### ❌ "Timeout waiting for port"
**Problem:** Port is already in use or service won't start
**Fix:** 
- Kill any running `mongod.exe` or `node.exe` in Task Manager
- Restart the app

---

### 3️⃣ Rebuild the App (with fixes)

The code has been updated with better error handling. To rebuild:

```bash
# 1. Build backend
cd backend
npm install
npm run build

# 2. Build desktop app
cd ../desktop
npm install
npm run build
```

**The installer will be in:** `desktop/src-tauri/target/release/bundle/`

---

### 4️⃣ What's New?

✅ **Detailed logs** - No more guessing what went wrong
✅ **Error dialogs** - Clear messages when startup fails  
✅ **Better checks** - Verifies files exist before trying to run them
✅ **Path logging** - Shows exactly where it's looking for files

---

### 5️⃣ Need Help?

Share your `startup.log` file - it has all the info needed to diagnose the issue!

**Location:** `%APPDATA%\com.cafepos.app\startup.log`
