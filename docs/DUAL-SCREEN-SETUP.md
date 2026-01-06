# Dual-Screen POS System Implementation

## Overview

This implementation provides a dual-screen setup for the Cafe POS system:
- **Operator Screen**: Main POS interface on laptop
- **Customer Display**: Fullscreen display on HDMI TV showing cart and promotional content

## Architecture

### Frontend (Next.js)
- **Route-based separation**: `/operator` and `/display`
- **Real-time state sync**: Socket.IO client
- **Responsive design**: 16:9 aspect ratio for display

### Backend (NestJS)
- **WebSocket Gateway**: Real-time communication hub
- **Display Module**: Manages broadcast to all connected clients
- **REST API**: Fallback for HTTP-based updates

### Desktop (Tauri v2)
- **Multi-window support**: Two windows from one app
- **Auto-positioning**: Detects second monitor and positions display window
- **Fullscreen mode**: Display window on second monitor

## File Structure

```
cafe-pos/
├── backend/
│   └── src/
│       └── display/
│           ├── display.gateway.ts    # WebSocket gateway
│           ├── display.module.ts     # Module definition
│           └── display.controller.ts # REST endpoints
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── operator/
│       │   │   └── page.tsx          # Operator UI
│       │   └── display/
│       │       └── page.tsx          # Customer display UI
│       └── hooks/
│           └── use-display-sync.ts   # WebSocket client hook
└── desktop/
    └── src-tauri/
        ├── src/
        │   └── main.rs               # Window management
        └── tauri.conf.json           # Window configuration
```

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**Frontend:**
```bash
cd frontend
npm install socket.io-client framer-motion
```

### 2. Backend Configuration

The DisplayModule is already registered in `app.module.ts`. No additional configuration needed.

**WebSocket endpoint:** `ws://localhost:3001/display`

### 3. Frontend Environment

Create/update `.env.local`:
```
NEXT_PUBLIC_BACKEND_PORT=3001
```

### 4. Tauri Configuration

The configuration in `tauri.conf.json` defines the operator window. The display window is created programmatically in `main.rs`.

## Usage

### Starting the Application

1. **Development mode** (for testing):
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev

   # Terminal 3: Desktop (optional)
   cd desktop
   npm run tauri dev
   ```

2. **Production mode** (Tauri app):
   ```bash
   cd desktop
   npm run tauri build
   ```

### Window Management

**Operator Window:**
- Opens on primary monitor
- Route: `/operator`
- Resizable, with decorations
- Standard window controls

**Display Window:**
- Automatically created on app startup
- Route: `/display`
- Fullscreen on second monitor (if available)
- No decorations, no taskbar icon
- Can be moved manually if only one monitor

### State Synchronization

The system uses WebSocket for real-time sync:

1. **Operator actions** → WebSocket → **Backend gateway** → **All clients**
2. **Display listens** for updates and renders accordingly

**Message Types:**
- `CART_UPDATE`: Cart items changed
- `SALE_COMPLETE`: Transaction finished, show thank you

## Key Features

### Operator UI Features
- Full POS interface
- Real-time connection status indicator
- Tabbed interface: POS, Sales, Products, Customers
- Cart management with instant sync

### Display UI Features
- Welcome screen with rotating promotions
- Animated cart display
- Large, readable text optimized for distance viewing
- Smooth transitions between states
- Auto-return to welcome after sale

### Technical Features
- **Auto-reconnection**: Socket.IO handles reconnection automatically
- **State persistence**: Backend caches current cart state
- **Multi-client support**: Multiple displays can connect
- **Failsafe design**: App works even if display connection fails

## Window Positioning

The Rust code in `main.rs` handles monitor detection:

```rust
// Pseudocode flow:
1. Get all available monitors
2. If >= 2 monitors:
   - Position display window on second monitor
   - Set to fullscreen
3. Else:
   - Position at offset
   - Allow manual positioning
   - OS remembers position
```

## Customization

### Promotional Content

Edit `/frontend/src/app/display/page.tsx`:

```typescript
const promos = [
  {
    title: 'Your Title',
    subtitle: 'Your Subtitle',
    icon: YourIcon, // from lucide-react
  },
  // Add more...
];
```

### Styling

Display UI uses Tailwind CSS. Key classes:
- `text-6xl`: Large headings
- `text-3xl`: Subheadings
- `bg-gradient-to-br`: Gradient backgrounds
- Framer Motion for animations

### WebSocket Events

To add custom events, update:

1. **Backend**: `display.gateway.ts` - Add message type
2. **Frontend hook**: `use-display-sync.ts` - Handle new message
3. **Display page**: React to new state

## Troubleshooting

### Display window not appearing
- Check logs: `%APPDATA%/cafe-pos/startup.log` (Windows)
- Verify second monitor is connected and extended
- Try manually: Backend + Frontend dev mode, open `/display` in browser

### WebSocket connection issues
- Check backend is running: `http://localhost:3001/display/status`
- Verify port 3001 is not blocked
- Check browser console for connection errors

### State not syncing
- Verify both windows are connected (check browser console)
- Test REST endpoint: `POST http://localhost:3001/display/cart`
- Check backend logs for WebSocket errors

## Production Deployment

### Building the Tauri App

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Build backend
cd ../backend
npm run build

# 3. Bundle resources (if needed)
# Ensure backend/dist is in desktop/src-tauri/resources/backend/

# 4. Build Tauri app
cd ../desktop
npm run tauri build
```

### Installer

The Tauri build creates:
- Windows: `.msi` installer in `desktop/src-tauri/target/release/bundle/msi/`
- Portable: `.exe` in `desktop/src-tauri/target/release/`

## Future Enhancements

### Planned Features
- [ ] Multiple display support (one operator, many displays)
- [ ] Remote display over network
- [ ] Display configuration UI
- [ ] Custom branding per display
- [ ] Video/image ads during idle
- [ ] QR code for order tracking

### Scalability
The current architecture supports:
- Multiple operator windows
- Multiple display windows
- Remote displays (just need network access to backend)
- Cloud-based backend (update WebSocket URL)

## API Reference

### REST Endpoints

**GET** `/display/status`
```json
{
  "connected": 2,
  "hasDisplay": true
}
```

**POST** `/display/cart`
```json
{
  "items": [
    {
      "id": "123",
      "name": "Coffee",
      "price": 3.50,
      "quantity": 2
    }
  ],
  "total": 7.00
}
```

**POST** `/display/sale-complete`
```json
{
  "total": 7.00
}
```

### WebSocket Events

**Client → Server:**
```typescript
socket.emit('message', {
  type: 'CART_UPDATE' | 'SALE_COMPLETE',
  payload: { ... }
})
```

**Server → Client:**
```typescript
socket.on('message', (data) => {
  // { type: '...', payload: { ... } }
})
```

## Testing

### Manual Testing

1. Open operator: `http://localhost:3000/operator`
2. Open display: `http://localhost:3000/display`
3. Add items in operator
4. Verify display updates in real-time
5. Complete sale
6. Verify display shows thank you and resets

### Automated Testing

Add E2E tests in `/backend/test/`:

```typescript
describe('Display Sync', () => {
  it('should sync cart updates', async () => {
    // Test WebSocket communication
  });
});
```

## Support

For issues or questions:
1. Check logs in `%APPDATA%/cafe-pos/` (Windows)
2. Review console output in both operator and display
3. Test WebSocket connection: Browser DevTools → Network → WS

## License

Same as main Cafe POS project.
