# MongoDB Binaries for Cafe POS Desktop

This directory contains MongoDB binaries that are bundled with the desktop application.

## 🚀 Quick Setup (Automated)

Run the setup script from the `desktop` folder:

```bat
cd desktop
setup-mongodb.bat
```

This will automatically download and configure MongoDB binaries.

## 📥 Manual Setup

If the automated setup doesn't work, follow these steps:

### 1. Download MongoDB

Visit: https://www.mongodb.com/try/download/community

**Select:**
- **Version:** 7.0.x (latest stable)
- **Platform:** Windows x64
- **Package:** ZIP archive

### 2. Extract and Copy

1. Extract the downloaded ZIP file
2. Navigate to the `bin` folder inside the extracted directory
3. Copy **only** `mongod.exe` to this directory:
   ```
   desktop/src-tauri/resources/mongodb/mongod.exe
   ```

### 3. Verify

- File should be approximately 50-100 MB
- Full path: `desktop/src-tauri/resources/mongodb/mongod.exe`
- Run `verify-build.bat` from the desktop folder to confirm

## 📁 Runtime Structure

When the application runs, it creates the following structure in the user's AppData folder:

```
%APPDATA%\Cafe POS\
├── startup.log          # Application startup logs
└── data\
    ├── db\             # MongoDB database files
    └── logs\
        └── mongodb.log  # MongoDB logs
```

## ⚙️ Configuration

The `mongod.cfg` file in this directory contains the default MongoDB configuration. The application overrides these settings at runtime with:

- **Port:** 27017
- **Bind IP:** 127.0.0.1 (localhost only)
- **Database Path:** `%APPDATA%\Cafe POS\data\db`
- **Log Path:** `%APPDATA%\Cafe POS\data\logs\mongodb.log`

## 🔍 Troubleshooting

### mongod.exe not found error

If you get this error when running the app:
1. Check if `mongod.exe` exists in this directory
2. Verify the file size is reasonable (50-100 MB)
3. Try re-downloading from the official MongoDB website

### Permission errors

Run the application as Administrator on first launch to allow MongoDB to create necessary directories.

### Port already in use

If port 27017 is already taken:
1. Close any other MongoDB instances
2. Check Task Manager for `mongod.exe` processes
3. Restart your computer if needed

## 📝 Notes

- **MongoDB binaries are NOT included in version control** (ignored by .gitignore)
- Each developer/builder must download MongoDB separately
- The application includes MongoDB 7.0.x compatibility
- MongoDB runs only while the application is open
- All data is stored locally on the user's machine

## 🔗 Resources

- [MongoDB Downloads](https://www.mongodb.com/try/download/community)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tauri Documentation](https://tauri.app/)
