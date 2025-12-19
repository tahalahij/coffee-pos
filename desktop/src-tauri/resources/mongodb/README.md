# MongoDB Binaries

This directory should contain the MongoDB binaries for Windows:

## Required Files

Download MongoDB Community Server for Windows from:
https://www.mongodb.com/try/download/community

Extract and place the following files here:

```
resources/mongodb/
├── mongod.exe          # MongoDB server
├── mongod.cfg          # Configuration file (already provided)
└── README.md           # This file
```

## Download Instructions

1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (or latest stable)
   - Platform: Windows
   - Package: ZIP
3. Download and extract the archive
4. Copy `mongod.exe` from `bin/` to this directory

## Directory Structure

The app will create these directories automatically at runtime:

```
%APPDATA%/cafe-pos/
├── data/
│   ├── db/          # Database files
│   └── logs/        # Log files
└── mongodb.log
```

## Verification

To verify MongoDB is bundled correctly:
1. Check that `mongod.exe` exists in this directory
2. File size should be approximately 50-100 MB
3. Build the app and check that mongod.exe is included in the installer

## Notes

- MongoDB binaries are **not** included in source control
- Each developer must download and place them manually
- The `.gitignore` file excludes `*.exe` files
- CI/CD pipelines should download MongoDB as part of the build process
