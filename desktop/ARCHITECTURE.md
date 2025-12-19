# 🏗️ Desktop Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAFE POS DESKTOP APP                         │
│                         (cafe-pos.exe)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Tauri Runtime
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌──────────────────┐           ┌──────────────────┐
    │   RUST BACKEND   │           │   WEBVIEW (UI)   │
    │    (main.rs)     │           │  Next.js Static  │
    └──────────────────┘           └──────────────────┘
              │                               │
              │ Process Management            │ HTTP Requests
              │                               │
    ┌─────────┴────────┐                     │
    │                  │                     │
    ▼                  ▼                     │
┌─────────┐    ┌──────────────┐             │
│ MongoDB │    │ NestJS API   │◄────────────┘
│ Process │◄───│   (Node.js)  │
└─────────┘    └──────────────┘
    │                  │
    │                  │
    ▼                  ▼
┌─────────────────────────────┐
│      %APPDATA%/cafe-pos/    │
│  ├── data/db/               │
│  └── data/logs/             │
└─────────────────────────────┘
```

---

## Component Architecture

### 1. Tauri Shell (Rust)

**File**: `desktop/src-tauri/src/main.rs`

**Responsibilities**:
- Window management
- Process lifecycle management
- Resource path resolution
- Inter-process communication

**Key Functions**:
```rust
fn main()
  └─> Builder::default().setup(|app|)
        ├─> start_mongodb()
        ├─> wait_for_port(27017)
        ├─> start_backend()
        └─> wait_for_port(3001)

fn on_window_event()
  └─> CloseRequested
        ├─> kill(backend)
        └─> kill(mongodb)
```

---

### 2. MongoDB Instance

**Binary**: `resources/mongodb/mongod.exe`  
**Config**: `resources/mongodb/mongod.cfg`

**Startup**:
```bash
mongod.exe 
  --dbpath "%APPDATA%/cafe-pos/data/db"
  --logpath "%APPDATA%/cafe-pos/data/logs/mongodb.log"
  --bind_ip 127.0.0.1
  --port 27017
```

**Features**:
- Local-only binding
- File-based logging
- No authentication
- Auto-start on app launch
- Auto-stop on app close

---

### 3. NestJS Backend

**Entry**: `resources/backend/dist/main.js`  
**Runtime**: Node.js (system-installed)

**Environment**:
```bash
DESKTOP_MODE=true
MONGODB_URI=mongodb://127.0.0.1:27017/cafe_pos
PORT=3001
NODE_ENV=production
```

**Startup**:
```bash
node resources/backend/dist/main.js
```

**Modules**:
- Database (Mongoose)
- Sales
- Products
- Customers
- Analytics
- Campaigns
- Loyalty
- Discounts

---

### 4. Next.js Frontend

**Type**: Static Export  
**Location**: WebView loads from `frontend/out/`

**Build Mode**:
```bash
DESKTOP_BUILD=true npm run build
```

**Features**:
- Static HTML/CSS/JS
- No server-side rendering
- API calls to `http://localhost:3001/api`
- Bundled in app resources

---

## Data Flow

### Startup Sequence

```
Time 0s    User launches cafe-pos.exe
           │
           ▼
Time 0.1s  Tauri initializes
           │
           ▼
Time 0.2s  main.rs::setup() called
           │
           ├─> Resolve resource_dir()
           ├─> Resolve app_data_dir()
           └─> Create data directories
           │
           ▼
Time 0.5s  spawn(mongod.exe)
           │
           ├─> Wait for port 27017
           └─> Timeout: 30 seconds
           │
           ▼
Time 3s    MongoDB ready ✅
           │
           ▼
Time 3.1s  spawn(node dist/main.js)
           │
           ├─> Set DESKTOP_MODE=true
           ├─> Set MONGODB_URI
           ├─> Wait for port 3001
           └─> Timeout: 30 seconds
           │
           ▼
Time 5s    Backend ready ✅
           │
           ▼
Time 5.1s  Load WebView
           │
           ├─> Load index.html from out/
           └─> Initialize React app
           │
           ▼
Time 6s    App ready ✅
           │
           ▼
           Frontend makes API calls to localhost:3001
```

---

### Runtime Communication

```
┌────────────┐
│  Frontend  │
│ (WebView)  │
└─────┬──────┘
      │
      │ HTTP GET /api/products
      │
      ▼
┌────────────┐
│  Backend   │  GET /api/products
│ (NestJS)   ├──────────────────┐
└────────────┘                  │
                                │ Mongoose Query
                                ▼
                          ┌────────────┐
                          │  MongoDB   │
                          │  (mongod)  │
                          └────────────┘
                                │
                                │ Result
                                ▼
                          ┌────────────┐
                          │  Backend   │
                          └──────┬─────┘
                                 │
                                 │ JSON Response
                                 ▼
                          ┌────────────┐
                          │  Frontend  │
                          │  (Display) │
                          └────────────┘
```

---

### Shutdown Sequence

```
Time 0s    User clicks X (close)
           │
           ▼
Time 0.1s  on_window_event(CloseRequested)
           │
           ├─> Lock backend_process mutex
           ├─> child.kill()
           └─> child.wait()
           │
           ▼
Time 0.5s  Backend stopped ✅
           │
           ▼
Time 0.6s  Lock mongodb_process mutex
           │
           ├─> child.kill()
           ├─> sleep(2 seconds)  // Grace period
           └─> child.wait()
           │
           ▼
Time 2.6s  MongoDB stopped ✅
           │
           ▼
Time 2.7s  Tauri exits
           │
           ▼
Time 3s    Process terminated ✅
```

---

## File System Layout

### Development

```
cafe-pos/
├── backend/
│   ├── src/                    # NestJS source
│   ├── dist/                   # Compiled JS
│   └── node_modules/
│
├── frontend/
│   ├── src/                    # Next.js source
│   ├── out/                    # Static export
│   └── node_modules/
│
└── desktop/
    ├── src-tauri/
    │   ├── src/
    │   │   └── main.rs         # Entry point
    │   ├── resources/
    │   │   ├── mongodb/
    │   │   │   ├── mongod.exe  # Binary
    │   │   │   └── mongod.cfg  # Config
    │   │   └── backend/        # Copied at build time
    │   │       ├── dist/
    │   │       ├── node_modules/
    │   │       └── package.json
    │   └── target/
    │       └── release/
    │           ├── cafe-pos.exe
    │           └── bundle/
    │               └── msi/
    │                   └── Cafe POS_1.0.0_x64_en-US.msi
    └── package.json
```

### Runtime (Installed)

```
C:/Program Files/Cafe POS/
├── cafe-pos.exe                # Main executable
├── resources/
│   ├── mongodb/
│   │   ├── mongod.exe
│   │   └── mongod.cfg
│   ├── backend/
│   │   ├── dist/
│   │   ├── node_modules/
│   │   └── package.json
│   └── frontend/
│       └── out/
│           ├── index.html
│           ├── _next/
│           └── ...

%APPDATA%/cafe-pos/
├── data/
│   ├── db/                     # MongoDB database files
│   │   ├── collection-*.wt
│   │   ├── index-*.wt
│   │   └── WiredTiger*
│   └── logs/
│       └── mongodb.log         # MongoDB logs
└── .config                     # App configuration
```

---

## Security Model

### Network Isolation

```
┌─────────────────────────────────────┐
│          localhost only             │
│                                     │
│  ┌─────────┐    ┌──────────────┐  │
│  │ MongoDB │    │  NestJS API  │  │
│  │  :27017 │◄───│    :3001     │  │
│  └─────────┘    └──────┬───────┘  │
│                         │          │
│                         │          │
│  ┌──────────────────────▼───────┐  │
│  │      WebView Frontend        │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
        ▲
        │ NO external access
        │ Firewall blocks all
```

**Guarantees**:
- ✅ MongoDB binds only to 127.0.0.1
- ✅ Backend binds only to 127.0.0.1
- ✅ No external network access needed
- ✅ No cloud services
- ✅ No telemetry

---

### Process Isolation

```
User Process (cafe-pos.exe)
├─> Child: mongod.exe (user privileges)
└─> Child: node.exe (user privileges)
```

**Guarantees**:
- ✅ No admin privileges required
- ✅ All processes run as current user
- ✅ Data stored in user's AppData
- ✅ No system-wide changes
- ✅ Clean uninstall possible

---

## Performance Characteristics

### Startup Performance

| Phase | Time | What Happens |
|-------|------|--------------|
| Tauri Init | 0.1s | Window creation, resource loading |
| MongoDB Start | 2-5s | Database initialization |
| Backend Start | 1-3s | NestJS bootstrap, DB connection |
| Frontend Load | 0.5-1s | Static asset loading |
| **Total** | **4-10s** | First launch can be slower |

### Runtime Performance

| Metric | Value |
|--------|-------|
| Memory Usage | 150-300 MB |
| CPU Usage | 1-5% idle, 10-30% active |
| Disk Usage | 300-500 MB installed |
| Database Size | 10-100 MB (grows with data) |

### Shutdown Performance

| Phase | Time |
|-------|------|
| Backend Stop | 0.1s |
| MongoDB Stop | 2s (grace period) |
| Process Cleanup | 0.5s |
| **Total** | **~3s** |

---

## Error Handling

### Startup Failures

```rust
// MongoDB fails to start
if !wait_for_port("127.0.0.1", 27017, 30) {
    return Err("MongoDB failed to start");
    // App shows error and exits
}

// Backend fails to start
if !wait_for_port("127.0.0.1", 3001, 30) {
    // Log error but continue
    // Frontend will show "API unavailable"
}
```

### Runtime Failures

```typescript
// Frontend detects backend down
try {
    await fetch('http://localhost:3001/api/health')
} catch (error) {
    // Show "Connection Lost" UI
    // Retry logic
}

// Backend detects MongoDB down
try {
    await this.model.find()
} catch (error) {
    // Return 503 Service Unavailable
    // Attempt reconnection
}
```

---

## Deployment Model

### Build Process

```
Developer Machine
├─> Build Backend (npm run build)
├─> Build Frontend (DESKTOP_BUILD=true npm run build)
├─> Copy Resources
├─> Build Tauri (cargo build --release)
└─> Create Installer (.msi)
    │
    ▼
Distribution Server
    │
    ▼
End User Downloads
    │
    ▼
End User Installs
    │
    ▼
End User Runs cafe-pos.exe
```

### Update Model (Future)

```
App checks for updates
    ├─> Query update server
    ├─> Download new version
    ├─> Verify signature
    ├─> Install update
    └─> Restart app
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Desktop Shell** | Tauri | 1.5 |
| **Shell Language** | Rust | 2021 Edition |
| **Backend** | NestJS | 10.x |
| **Backend Runtime** | Node.js | 18+ |
| **Database** | MongoDB | 7.0 |
| **ORM** | Mongoose | 9.x |
| **Frontend** | Next.js | 14.x |
| **UI Framework** | React | 18.x |
| **Styling** | Tailwind CSS | 3.x |
| **Build Tool** | Cargo + npm | - |

---

## Extensibility Points

### Adding New Features

1. **New API Endpoint**
   - Add controller in backend
   - Add service in backend
   - Frontend calls `/api/new-feature`

2. **New Database Collection**
   - Add model in backend
   - Add schema
   - Mongoose auto-creates collection

3. **New UI Page**
   - Add page in frontend/src/app
   - Add route
   - No rebuild needed for backend

4. **Configuration Options**
   - Edit `mongod.cfg` for database
   - Edit environment variables in `main.rs`
   - Edit `tauri.conf.json` for window

---

## Comparison: Web vs Desktop

| Feature | Web Deployment | Desktop App |
|---------|----------------|-------------|
| MongoDB | External service | Bundled |
| Backend | Deployed server | Bundled |
| Frontend | Hosted | Bundled |
| Internet | Required | Not required |
| Installation | None | One-time .msi |
| Updates | Automatic | Manual/Auto-update |
| Data Location | Cloud | Local |
| Multi-user | Yes | Single user |
| Cost | Ongoing hosting | One-time build |

---

**Architecture Version**: 1.0  
**Last Updated**: December 19, 2025  
**Status**: Production Ready
