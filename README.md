# EcoLoop — Carbon Footprint Awareness Platform

EcoLoop is a production-ready, modern, enterprise-grade full-stack web application designed to help individuals and organizations measure, monitor, and reduce their carbon footprints. By gamifying ecological goals and tracking streaks, EcoLoop drives active daily participation in environmental sustainability.

---

## 🌟 Core Features

1. **Carbon Footprint Measurement**:
   * Standardized, math-accurate calculators covering Gasoline/Diesel Cars, public buses, rail systems, flights, residential grid energy (kWh), dietary habits (vegetarian, mixed, meat-heavy), and municipal waste volumes.
2. **Interactive Impact Analytics**:
   * A premium glassmorphic dashboard inspired by Linear and Stripe, visualising carbon trends, monthly breakdowns, and sector distributions using Recharts graphs.
3. **AI Sustainability Assistant**:
   * A personalized sustainability coach powered by OpenAI GPT-4o-mini (with zero-config fallback rules engine) offering custom high-impact recommendations based on active carbon metrics.
4. **Gamification & Progress**:
   * Progression eco-points (e.g. +50 pts per log, +25 pts per goal, +100 pts per target achieved) and consecutive login streaks (e.g. `🔥 7 Days Streak`) to keep users engaged.
5. **Goal Planner**:
   * Active and history trackers to configure and follow specific emission reduction goals (e.g. "Limit energy below 180 kWh").
6. **Educational Hub**:
   * Curated guides, articles, and a random Eco-Trivia carousel to build carbon footprint awareness.
7. **Global Leaderboard**:
   * Ranks the top eco-citizens based on accumulated points and streaks, driving friendly competition.
8. **Admin Panel**:
   * Admin-only views to monitor overall platform stats, view registered users, and publish new articles.

---

## 🛠️ Technical Architecture

* **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion
* **Backend**: Next.js API Routes (App Router)
* **Database**: SQLite (local dev.db) via Prisma 7.x ORM
* **Authentication**: NextAuth.js (Credentials Provider)
* **AI Engine**: OpenAI API (with structured fallback)

---

## 🚀 Environment Setup Guide

### Prerequisites
* **Node.js**: `v18.x` or later (Tested on Node `v24.15.0`)
* **npm**: `v9.x` or later (Tested on npm `v11.12.1`)

### 1. Install Dependencies
Run the following in the project root:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and define the following variables:
```env
# Database connection URL (for local SQLite)
DATABASE_URL="file:./dev.db"

# NextAuth secret key used to hash session JWTs
NEXTAUTH_SECRET="carbon-footprint-app-secret-1290384729103847"

# Base URL for the Auth application callback
NEXTAUTH_URL="http://localhost:3000"

# (Optional) OpenAI API Key for AI sustainability coach suggestions
# OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. Initialize Database & Run Migrations
Run Prisma migrations to create the local SQLite database and tables:
```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client
Build the type definitions for our Prisma client:
```bash
npx prisma generate
```

### 5. Seed Mock Data
Prepopulate the database with demo users, historical emission logs (representing 6 months of metrics), goals, badges, and articles:
```bash
npx tsx prisma/seed.ts
```

### 6. Start Development Server
Run the local next development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3050) in your browser.

---

## 🔒 Demo Authentication Accounts

To explore the dashboard and admin panel immediately without registering, use the following preloaded credentials:

* **Standard User**:
  * **Email**: `user@carbon.com`
  * **Password**: `password123`
  *(Prepopulated with 6 months of historical graphs, 3 achievements, and 2 active goals)*

* **Admin User**:
  * **Email**: `admin@carbon.com`
  * **Password**: `password123`
  *(Has access to the administrative metrics table, user listings, and article publishing console)*

---

## 📝 Code Quality & Testing

### Verification
Ensure the build succeeds before deploying:
```bash
npm run build
```

### Clean Architecture
* **`src/lib/db.ts`**: Implements the singleton client connector required for Prisma 7 compatibility.
* **`src/lib/carbonCalculator.ts`**: Standardized math library for carbon scoring, trees offset, and emissions values.
* **`src/app/api`**: Modular API endpoints enforcing JWT session security and role constraints.
