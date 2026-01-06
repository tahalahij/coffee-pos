# Quick Start - Dual-Screen POS

## One-Command Setup

### Windows
```bash
setup-dual-screen.bat
```

### macOS/Linux
```bash
./setup-dual-screen.sh
```

## Manual Setup (if script fails)

### 1. Backend Dependencies
```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### 2. Frontend Dependencies
```bash
cd frontend
npm install socket.io-client framer-motion
```

### 3. Environment Setup
Create `frontend/.env.local`:
```
NEXT_PUBLIC_BACKEND_PORT=3001
```

## Testing the Setup

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Test URLs:**
- Operator: http://localhost:3000/operator
- Display: http://localhost:3000/display

### Desktop App

```bash
cd desktop
npm run tauri dev
```

This will:
1. Start MongoDB
2. Start NestJS backend
3. Open operator window on primary monitor
4. Open display window on secondary monitor (if available)

## Expected Behavior

✅ **Operator Window:**
- Opens first, on laptop screen
- Shows full POS interface
- Has "Display Connected" indicator (green when active)
- Cart changes sync instantly to display

✅ **Display Window:**
- Opens automatically on second monitor
- Fullscreen, no borders
- Shows welcome/promo when idle
- Shows cart items when operator adds them
- Shows thank you message after sale completion

## Troubleshooting

### "Display Disconnected" indicator
- Check backend is running on port 3001
- Open browser console (F12) for errors
- Test: `curl http://localhost:3001/display/status`

### Display window not appearing (desktop app)
- Check logs: `%APPDATA%/cafe-pos/startup.log` (Windows)
- May need second monitor connected before starting app
- If only one monitor: manually open http://localhost:3000/display

### Changes not syncing
1. Verify WebSocket connection in browser console
2. Check backend logs for errors
3. Test REST API: 
   ```bash
   curl -X POST http://localhost:3001/display/cart \
     -H "Content-Type: application/json" \
     -d '{"items":[],"total":0}'
   ```

## Next Steps

- Read [DUAL-SCREEN-SETUP.md](DUAL-SCREEN-SETUP.md) for full documentation
- Customize promotional content in `frontend/src/app/display/page.tsx`
- Build production app: `cd desktop && npm run tauri build`

## Support

Issues? Check:
1. All dependencies installed
2. Backend running on port 3001
3. Frontend running on port 3000
4. WebSocket connection in browser DevTools
