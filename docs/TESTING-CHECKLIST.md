# Dual-Screen Implementation Verification Checklist

Use this checklist to verify the dual-screen POS implementation is working correctly.

## 📋 Pre-Installation Verification

- [ ] Node.js 18+ installed
- [ ] npm or pnpm available
- [ ] Rust and Cargo installed (for Tauri build)
- [ ] Git repository cloned
- [ ] All base dependencies installed (`npm install` in backend, frontend, desktop)

## 🔧 Installation Verification

### Windows
- [ ] Run `setup-dual-screen.bat`
- [ ] No errors during backend dependency installation
- [ ] No errors during frontend dependency installation
- [ ] `.env.local` file created in frontend folder
- [ ] `NEXT_PUBLIC_BACKEND_PORT=3001` present in `.env.local`

### macOS/Linux
- [ ] Script is executable (`chmod +x setup-dual-screen.sh`)
- [ ] Run `./setup-dual-screen.sh`
- [ ] No errors during backend dependency installation
- [ ] No errors during frontend dependency installation
- [ ] `.env.local` file created in frontend folder
- [ ] `NEXT_PUBLIC_BACKEND_PORT=3001` present in `.env.local`

## 📦 File Existence Check

### Backend Files
- [ ] `backend/src/display/display.gateway.ts` exists
- [ ] `backend/src/display/display.module.ts` exists
- [ ] `backend/src/display/display.controller.ts` exists
- [ ] `backend/src/app.module.ts` imports DisplayModule

### Frontend Files
- [ ] `frontend/src/app/operator/page.tsx` exists
- [ ] `frontend/src/app/display/page.tsx` exists
- [ ] `frontend/src/hooks/use-display-sync.ts` exists

### Desktop Files
- [ ] `desktop/src-tauri/src/main.rs` has `create_display_window` function
- [ ] `desktop/src-tauri/tauri.conf.json` has operator window config

### Documentation
- [ ] `DUAL-SCREEN-SETUP.md` exists
- [ ] `DUAL-SCREEN-QUICK-START.md` exists
- [ ] `IMPLEMENTATION-DUAL-SCREEN.md` exists
- [ ] `ARCHITECTURE-DIAGRAM.md` exists
- [ ] `README.md` mentions dual-screen feature

## 🧪 Development Mode Testing

### Backend
- [ ] Start backend: `cd backend && npm run start:dev`
- [ ] Backend starts without errors
- [ ] Listens on port 3001
- [ ] Test endpoint: `curl http://localhost:3001/display/status`
- [ ] Response: `{"connected":0,"hasDisplay":false}`

### Frontend
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Frontend starts without errors
- [ ] Listens on port 3000
- [ ] No compilation errors

### Operator Page
- [ ] Open `http://localhost:3000/operator` in browser
- [ ] Page loads without errors
- [ ] See "Operator Terminal" heading
- [ ] See tabbed interface (POS, Sales, Products, Customers)
- [ ] See connection status indicator (may show red initially)
- [ ] Open browser console (F12), no errors

### Display Page
- [ ] Open `http://localhost:3000/display` in second browser tab
- [ ] Page loads without errors
- [ ] See welcome screen with promotional content
- [ ] Promo content rotates every 5 seconds
- [ ] Open browser console (F12), no errors

### WebSocket Connection
- [ ] In operator page, connection indicator turns green
- [ ] Browser console shows: "Display socket connected"
- [ ] In display page, console shows: "Display client connected"
- [ ] Backend logs show two WebSocket connections

### Real-Time Sync Test
- [ ] In operator page, add items to cart (if POSInterface is available)
- [ ] OR: In browser console, run:
  ```javascript
  // Simulate cart update
  const event = new CustomEvent('cartUpdate', { 
    detail: { items: [{id: '1', name: 'Test', price: 5, quantity: 1}], total: 5 } 
  });
  window.dispatchEvent(event);
  ```
- [ ] Display page instantly shows cart items
- [ ] Cart updates appear with smooth animations
- [ ] Total displays correctly

### Sale Completion Test
- [ ] Complete a sale in operator (if available)
- [ ] Display shows thank you message
- [ ] After 3 seconds, display returns to welcome screen
- [ ] Cart resets to empty

## 🖥️ Desktop App Testing (Tauri)

### Build Verification
- [ ] Run `cd desktop && npm run tauri dev`
- [ ] MongoDB starts successfully
- [ ] Backend starts successfully
- [ ] Operator window opens

### Window Management
- [ ] Operator window opens on primary monitor
- [ ] Operator window is resizable
- [ ] Operator window has decorations (title bar, close button)
- [ ] Operator window shows `/operator` route
- [ ] Display window opens automatically
- [ ] Display window appears on second monitor (if connected)
- [ ] Display window is fullscreen (if second monitor available)
- [ ] Display window has no decorations
- [ ] Display window shows `/display` route

### Monitor Detection (with HDMI TV connected)
- [ ] Connect second monitor via HDMI
- [ ] Set display mode to "Extend" (not "Mirror")
- [ ] Start Tauri app
- [ ] Display window appears on second monitor
- [ ] Display window is fullscreen on second monitor
- [ ] Operator window remains on primary monitor

### Logs
- [ ] Check startup log file
  - Windows: `%APPDATA%/cafe-pos/startup.log`
  - macOS: `~/Library/Application Support/cafe-pos/startup.log`
- [ ] Log shows "MongoDB is ready!"
- [ ] Log shows "Backend is ready!"
- [ ] Log shows "Display window created successfully"
- [ ] No errors in log file

### Performance
- [ ] Both windows run smoothly (60 FPS)
- [ ] No lag when updating cart
- [ ] Animations are smooth
- [ ] CPU usage is reasonable (<20%)
- [ ] Memory usage is reasonable (<500MB total)

## 🚀 Production Build Testing

### Build Process
- [ ] Ensure frontend is built: `cd frontend && npm run build`
- [ ] Ensure backend is built: `cd backend && npm run build`
- [ ] Run `cd desktop && npm run tauri build`
- [ ] Build completes without errors
- [ ] Installer created in `desktop/src-tauri/target/release/bundle/`

### Installer Testing (Windows)
- [ ] Locate `.msi` file
- [ ] Double-click installer
- [ ] Installation completes successfully
- [ ] App appears in Start Menu
- [ ] Launch app from Start Menu
- [ ] Both windows open correctly
- [ ] All features work as expected

## 🔍 Edge Case Testing

### Single Monitor Scenario
- [ ] Disconnect second monitor
- [ ] Start app
- [ ] Display window appears (not fullscreen)
- [ ] Can manually drag display window
- [ ] Position is remembered on restart

### WebSocket Reconnection
- [ ] Start app with both windows
- [ ] Verify connection is green
- [ ] Stop backend (Ctrl+C)
- [ ] Connection indicator turns red
- [ ] Restart backend
- [ ] Connection automatically restores (green)
- [ ] State syncs correctly after reconnection

### Multiple Clients
- [ ] Open operator in Window 1
- [ ] Open display in Window 2
- [ ] Open another display in Window 3
- [ ] Update cart in operator
- [ ] All displays update simultaneously
- [ ] Check `/display/status` shows 3 connections

### Error Handling
- [ ] Start frontend without backend
- [ ] Check console for graceful error handling
- [ ] Start backend
- [ ] Connection auto-establishes
- [ ] Test with invalid data (empty cart)
- [ ] No crashes or console errors

## 📊 Final Verification

### Feature Completeness
- [ ] Operator UI complete and functional
- [ ] Display UI complete and functional
- [ ] WebSocket sync working
- [ ] Real-time updates <100ms latency
- [ ] Smooth animations
- [ ] Professional appearance

### Documentation
- [ ] All documentation files present
- [ ] README updated with dual-screen info
- [ ] Setup scripts work correctly
- [ ] Architecture diagram accurate

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings (critical ones)
- [ ] Rust code compiles without warnings
- [ ] Proper error handling throughout

## ✅ Sign-Off

- [ ] All checklist items completed
- [ ] System tested by developer
- [ ] System tested by non-technical user
- [ ] Performance meets requirements
- [ ] Ready for production use

---

**Tested By:** _______________
**Date:** _______________
**Version:** _______________
**Notes:** _______________

---

## 🐛 Known Issues / Limitations

Record any issues found during testing:

1. 
2. 
3. 

---

## 📝 Testing Notes

Additional observations or comments:


