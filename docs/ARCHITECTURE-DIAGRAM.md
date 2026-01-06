
# Dual-Screen Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                    WINDOWS LAPTOP (Extended Display)                    │
├─────────────────────────────────┬──────────────────────────────────────┤
│                                 │                                      │
│    PRIMARY MONITOR (Laptop)     │    SECONDARY MONITOR (HDMI TV)      │
│                                 │                                      │
│  ┌───────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │   OPERATOR WINDOW         │  │  │    DISPLAY WINDOW             │  │
│  │   (Resizable, Decorated)  │  │  │    (Fullscreen, No Decor)     │  │
│  ├───────────────────────────┤  │  ├───────────────────────────────┤  │
│  │ ┌───┐  Cafe POS - Operator│  │  │                               │  │
│  │ │ × │                      │  │  │     Welcome to Our Café       │  │
│  │ └───┘  [Display: 🟢 ON ]  │  │  │   Fresh Coffee & Treats       │  │
│  │ ┌─────────────────────────┤  │  │                               │  │
│  │ │POS│Sales│Products│Cust. │  │  │   ┌───────────────────────┐   │  │
│  │ └─────────────────────────┤  │  │   │  Your Order            │   │  │
│  │                            │  │  │   │  2x Coffee    $7.00    │   │  │
│  │  [Product Grid]            │  │  │   │  1x Muffin    $3.50    │   │  │
│  │  ☕ 🍰 🥐 🥗              │  │  │   │  ────────────────────   │   │  │
│  │                            │  │  │   │  Total:      $10.50    │   │  │
│  │  Cart:                     │  │  │   └───────────────────────┘   │  │
│  │  - Coffee x2  $7.00        │  │  │                               │  │
│  │  - Muffin x1  $3.50        │  │  │                               │  │
│  │  Total: $10.50             │  │  │                               │  │
│  │  [Complete Sale] [Clear]   │  │  │                               │  │
│  └────────────────────────────┘  │  └───────────────────────────────┘  │
│         localhost:3000/operator  │       localhost:3000/display        │
└─────────────────────────────────┴──────────────────────────────────────┘
                    ▲                              ▲
                    │                              │
                    │    Socket.IO WebSocket       │
                    │    (Real-time Updates)       │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   NESTJS BACKEND SERVER     │
                    │   Port 3001                 │
                    ├─────────────────────────────┤
                    │  DisplayGateway             │
                    │  - Manages connections      │
                    │  - Broadcasts cart updates  │
                    │  - Handles events           │
                    ├─────────────────────────────┤
                    │  REST API                   │
                    │  GET  /display/status       │
                    │  POST /display/cart         │
                    │  POST /display/sale-complete│
                    ├─────────────────────────────┤
                    │  MongoDB (Port 27017)       │
                    │  - Products                 │
                    │  - Sales                    │
                    │  - Customers                │
                    └─────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

PROCESS FLOW:

1. USER ACTION: Cashier adds item in Operator Window
   
2. STATE UPDATE: React zustand store updates cart
   
3. WEBSOCKET EMIT: useDisplaySync hook sends message
   
   Message: {
     type: "CART_UPDATE",
     payload: {
       items: [...],
       total: 10.50,
       itemCount: 3
     }
   }
   
4. BACKEND RECEIVES: DisplayGateway processes message
   
5. BACKEND BROADCASTS: Gateway emits to all connected clients
   
6. DISPLAY RECEIVES: Display window's socket listener triggered
   
7. UI UPDATE: Display window re-renders with new cart data
   
   ⚡ Total time: <50ms (local network)

═══════════════════════════════════════════════════════════════════════════

WINDOW CREATION (Tauri Rust):

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 1. Start MongoDB
            start_mongodb()?;
            
            // 2. Start NestJS backend
            start_backend()?;
            
            // 3. Create operator window (defined in tauri.conf.json)
            //    Opens on primary monitor
            
            // 4. Create display window programmatically
            create_display_window(app)?;
            //    - Detects monitors
            //    - Positions on second monitor if available
            //    - Sets fullscreen
            //    - No decorations
            
            Ok(())
        })
        .run()?;
}

═══════════════════════════════════════════════════════════════════════════

MONITOR DETECTION LOGIC:

let monitors = app.available_monitors()?;

if monitors.len() >= 2 {
    // USE SECOND MONITOR
    let second = &monitors[1];
    position = second.position();
    size = second.size();
    fullscreen = true;
} else {
    // FALLBACK (Manual positioning)
    position = (100, 100);
    size = (1920, 1080);
    fullscreen = false;
}

WindowBuilder::new(app, "display", "/display")
    .position(position.x, position.y)
    .inner_size(size.width, size.height)
    .fullscreen(fullscreen)
    .decorations(false)
    .build()?;

═══════════════════════════════════════════════════════════════════════════

FILE STRUCTURE:

cafe-pos/
├── backend/
│   └── src/
│       ├── app.module.ts              [+] Import DisplayModule
│       └── display/                   [NEW]
│           ├── display.gateway.ts     [NEW] WebSocket handler
│           ├── display.module.ts      [NEW] Module def
│           └── display.controller.ts  [NEW] REST endpoints
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── operator/              [NEW]
│       │   │   └── page.tsx           [NEW] Cashier UI
│       │   └── display/               [NEW]
│       │       └── page.tsx           [NEW] Customer UI
│       └── hooks/
│           └── use-display-sync.ts    [NEW] WebSocket client
│
├── desktop/
│   └── src-tauri/
│       ├── tauri.conf.json            [MODIFIED] Window config
│       └── src/
│           └── main.rs                [MODIFIED] Dual window logic
│
├── DUAL-SCREEN-SETUP.md               [NEW] Full documentation
├── DUAL-SCREEN-QUICK-START.md         [NEW] Quick guide
├── IMPLEMENTATION-DUAL-SCREEN.md      [NEW] Summary
├── setup-dual-screen.sh               [NEW] Unix installer
└── setup-dual-screen.bat              [NEW] Windows installer

═══════════════════════════════════════════════════════════════════════════

DEPENDENCIES:

Backend:
  - @nestjs/websockets
  - @nestjs/platform-socket.io
  - socket.io

Frontend:
  - socket.io-client
  - framer-motion

═══════════════════════════════════════════════════════════════════════════
```
