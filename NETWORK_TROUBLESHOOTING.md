# Network Error Troubleshooting Guide

## Issue: Frontend to Backend Network Errors (v1.7.1)

### Root Cause
The network errors between frontend and backend were caused by:
1. **CORS misconfiguration** - Backend only allowed single origin
2. **Missing FRONTEND_URL** environment variable in backend
3. **Restrictive CORS policy** that didn't handle all development scenarios

### Fixes Applied (v1.8.0)

#### 1. Backend CORS Configuration (`backend/src/main.ts`)
✅ **Enhanced CORS to support multiple origins:**
- Allows `http://localhost:3000` (Next.js dev server)
- Allows `http://localhost:3001` (alternative port)
- Allows `127.0.0.1` variants
- Allows requests with no origin (API testing tools)
- Supports all standard HTTP methods
- Properly handles credentials

```typescript
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
```

#### 2. Environment Configuration
✅ **Added to `backend/.env`:**
```env
FRONTEND_URL=http://localhost:3000
PORT=3004
```

✅ **Updated `backend/.env.example`:**
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/cafe_pos?authSource=admin
FRONTEND_URL=http://localhost:3000
PORT=3004
```

### How to Verify the Fix

#### 1. Check Backend is Running
```bash
cd backend
npm run start:dev

# Should see:
# 🚀 Server running on http://localhost:3004
# 📚 API Documentation: http://localhost:3004/api/docs
```

#### 2. Check Frontend Configuration
```bash
# Check frontend/.env.local has:
NEXT_PUBLIC_API_URL=http://localhost:3004/api
```

#### 3. Test API Connection
```bash
# Test backend is responding:
curl http://localhost:3004/api

# Test CORS headers:
curl -i -H "Origin: http://localhost:3000" http://localhost:3004/api
```

#### 4. Run E2E Tests
```bash
cd frontend
npm test  # Runs all 69 Playwright tests

# All tests should pass - they validate API connectivity
```

### Common Network Issues & Solutions

#### Issue: "ERR_CONNECTION_REFUSED"
**Solution:**
1. Ensure backend is running: `cd backend && npm run start:dev`
2. Check backend port matches frontend config
3. Verify MongoDB is running: `brew services list | grep mongodb`

#### Issue: "CORS policy: No 'Access-Control-Allow-Origin'"
**Solution:**
1. Check `FRONTEND_URL` is set in `backend/.env`
2. Verify frontend origin matches allowed origins
3. Restart backend after changing CORS config

#### Issue: "Network Error" or "Request failed with status code 0"
**Solution:**
1. Check firewall isn't blocking localhost connections
2. Verify correct ports: Backend=3004, Frontend=3000
3. Check if ports are already in use: `lsof -i :3004`

#### Issue: "404 Not Found" on API endpoints
**Solution:**
1. Check API prefix is `api`: `http://localhost:3004/api/...`
2. Verify endpoint exists: `http://localhost:3004/api/docs`
3. Check backend routes are properly registered

### Port Configuration Summary

| Service | Port | Environment Variable | Config File |
|---------|------|---------------------|-------------|
| Backend API | 3004 | `PORT` | `backend/.env` |
| Frontend Dev | 3000 | - | Next.js default |
| Frontend Prod | 3000 | - | `npm start` |
| MongoDB | 27017 | `MONGODB_URI` | `backend/.env` |

### For Production Deployment

When deploying to production:

1. **Update FRONTEND_URL** to your production domain:
```env
FRONTEND_URL=https://your-domain.com
```

2. **Update frontend .env.production:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

3. **Configure CORS** to include production domains in `backend/src/main.ts`

4. **Enable HTTPS** for both frontend and backend

5. **Set secure environment variables** on your hosting platform

### Testing After Fix

Run the comprehensive test suite to verify all API calls work:
```bash
cd frontend
npm test

# Expected: 69/69 tests passing ✓
# - 7 category tests
# - 9 product tests
# - 9 POS tests
# - 9 sales tests
# - 9 customer tests
# - 12 dashboard tests
# - 6 operator tests
# - 8 display tests
```

### Additional Resources

- **Swagger API Docs**: http://localhost:3004/api/docs
- **Next.js Config**: `frontend/next.config.js`
- **Axios Config**: `frontend/src/lib/api.ts`
- **CORS Documentation**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

### Quick Start Checklist

- [ ] MongoDB is running
- [ ] Backend `.env` has `FRONTEND_URL` and correct `PORT`
- [ ] Backend is running on port 3004
- [ ] Frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Frontend is running on port 3000
- [ ] CORS allows frontend origin
- [ ] E2E tests pass (69/69)

---

**Version**: 1.8.0  
**Last Updated**: January 7, 2026  
**Status**: ✅ Fixed and Tested
