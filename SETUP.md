# Cafe POS System - Setup Instructions

## 🏗️ Complete Setup Guide

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### 1. Environment Setup

#### Backend Setup
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/cafe_pos?schema=public"
JWT_SECRET="your-super-secure-jwt-secret-key-here"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

#### Frontend Setup
```bash
cd frontend
cp .env.example .env.local
```

### 2. Installation & Database Setup

From the root directory:
```bash
# Install all dependencies
npm run install:all

# Setup database
cd backend
npx prisma migrate dev --name init
npm run db:seed

# Return to root
cd ..
```

### 3. Development

Start both frontend and backend:
```bash
npm run dev
```

Or start them separately:
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 4. Access the Application

- **Frontend (POS Interface)**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Database Studio**: `npx prisma studio` (from backend directory)

## 🚀 Production Deployment

### Build Commands
```bash
npm run build
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Update `DATABASE_URL` with production database
- Update `FRONTEND_URL` with production domain
- Generate secure `JWT_SECRET`

## 📱 PWA Features

The app includes offline functionality:
- Install as desktop/mobile app
- Works offline with cached data
- Background sync when online
- Push notifications ready

## 🔧 Development Tools

- **Database Management**: Prisma Studio
- **API Testing**: Swagger UI at `/api/docs`
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint + Prettier configured

## 📊 Features Included

✅ **POS Interface**
- Product grid with categories
- Shopping cart with quantity controls
- Multiple payment methods (Cash, Card, Digital)
- Receipt generation and printing
- Real-time stock updates

✅ **Dashboard & Analytics**
- Daily/monthly sales overview
- Hourly sales charts
- Top-selling products
- Recent transactions
- Key performance indicators

✅ **Product Management**
- CRUD operations for products
- Category management
- Stock level tracking
- Low stock alerts
- Inventory valuation

✅ **Sales Management**
- Transaction history
- Receipt reprinting
- Refund processing
- Sales filtering and search
- Payment method tracking

✅ **Purchase Management**
- Supplier order creation
- Inventory receiving
- Purchase tracking
- Stock adjustment

✅ **Discount System**
- Percentage and fixed amount discounts
- Date-based discount validity
- Minimum amount requirements
- Active/inactive status

✅ **Offline Functionality**
- PWA with offline capabilities
- Local data caching
- Sync when online
- Works without internet

## 🏪 Business Features

- **Accounting**: Full transaction tracking
- **Inventory**: Real-time stock management
- **Analytics**: Comprehensive sales insights
- **Multi-payment**: Cash, Card, Digital payments
- **Receipt Printing**: Professional receipt generation
- **Responsive Design**: Works on tablets and desktops

## 🔐 Security Features

- Input validation with class-validator
- SQL injection prevention with Prisma
- CORS configuration
- Environment variable protection
- Type-safe API endpoints

## 📱 Mobile & Offline Support

- Progressive Web App (PWA)
- Installable on devices
- Offline transaction processing
- Background data synchronization
- Touch-friendly interface
