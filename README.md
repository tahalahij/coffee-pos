# Cafe POS System

A modern, offline-capable point of sale system for cafes built with Next.js, NestJS, and PostgreSQL.

## Features

- 📱 Modern, responsive UI with minimal design
- 🛒 Cart management and receipt printing
- 📊 Comprehensive dashboard with sales analytics
- 📦 Product and category management
- 💰 Pricing and discount system
- 📈 Sales tracking and insights
- 💼 Purchase/inventory management
- 📋 Accounting features
- 🔄 Offline functionality with sync
- 🖨️ Receipt printing capability

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, PWA
- **Backend**: NestJS, TypeScript, PostgreSQL, Prisma ORM
- **Database**: PostgreSQL
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Charts**: Recharts

## Getting Started

1. Install dependencies:
```bash
npm run install:all
```

2. Set up database and run migrations:
```bash
npm run db:migrate
npm run db:seed
```

3. Start development servers:
```bash
npm run dev
```

## Project Structure

```
cafe-pos/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── shared/           # Shared types and utilities
└── docs/             # Documentation
```
