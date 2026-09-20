# 🏋️ Gym Companion

> An AI-powered personal fitness companion featuring real-time computer vision pose detection, automatic repetition counting, posture correction alerts, voice audio feedback, daily habit tracking, and comprehensive progress analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Supported-5A0FC8?logo=pwa&logoColor=white)

---

## 📌 Overview

**Gym Companion** is a full-stack fitness application designed to help users perform exercises with proper form, maintain consistency with workout routines, track daily habits, and visualize long-term fitness progress. Using MediaPipe Pose detection directly in the browser via your webcam, Gym Companion monitors joint angles, counts exercise repetitions automatically, detects improper posture in real-time, and provides immediate voice audio feedback.

---

## ✨ Key Features

### 📷 1. Real-Time Computer Vision & Pose Detection
- **MediaPipe Pose Integration**: Browser-based pose estimation for low-latency joint tracking with zero video uploads to any cloud server (100% private).
- **Automatic Repetition Counting**: Dynamically calculates key biomechanical joint angles (knees, hips, elbows) to detect repetition cycles for squats, push-ups, bicep curls, and isometric holds (plank timer).
- **Live Form Warnings**: Analyzes posture geometry in real time to flag errors (e.g., knees caving inward during squats, inadequate squat depth, back curvature during planks).
- **Voice Feedback (Web Speech API)**: Spoken audio alerts notify you of form corrections in real time during active workout sessions.

### 📊 2. Performance Analytics & Progress Dashboard
- **Visual Performance Trends**: Interactive charts powered by `Chart.js` track completed workouts, total volume, duration, and estimated calories burned.
- **Streak & Consistency Metrics**: Track current workout streaks, weekly activity rings, and historical completion patterns.
- **Body Metrics Tracking**: Record weight, body fat %, and strength milestones over time.

### 🗓️ 3. Daily Habit Tracker
- **Habit Formation**: Build custom daily habits (e.g., hydration, stretching, sleep targets, protein intake).
- **Streak Counter & Status Toggles**: Check off daily habits and track current completion streaks.

### 🔒 4. Authentication & User Security
- **Secure Token Auth**: JWT (JSON Web Tokens) with HTTP-Only cookie support and password hashing via `bcryptjs`.
- **Google OAuth**: Fast single sign-on integration via `@react-oauth/google`.
- **Protected Routes & User Profiles**: Personal stats, workouts, habits, and preferences are isolated per user.

### 📝 5. Production-Ready Backend Logging System
- **Winston & Daily File Rotation**: Dual transports logging to colorized console in development and rotating files in `logs/` (`app-%DATE%.log` and `error-%DATE%.log`) with 14-day retention and 10MB file caps.
- **Request Tracing Middleware**: Traces every incoming HTTP request with duration (`ms`), status code, IP, user ID, route, and sanitized parameters.
- **Sensitive Data Redaction**: Automatically scrubs passwords, tokens, cookies, secrets, and API keys before writing to logs.
- **Global Error Handling**: Production error middleware and process-level monitors capturing uncaught exceptions and rejections with full stack traces.

### 📱 6. Modern UI / UX & PWA Support
- **Responsive Dark/Light Theme**: Built with React 19, Tailwind CSS v4, and custom design tokens.
- **Sleek Retractable Sidebar**: Space-optimized 240px (`w-60`) navigation with pin state and smooth hover expansion.
- **Progressive Web App (PWA)**: Installable on mobile and desktop devices with offline caching capabilities (`vite-plugin-pwa`).

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Core**: React 19, React Router DOM v7, Vite 6
- **Styling**: Tailwind CSS v4, Custom CSS variables
- **Computer Vision & Math**: MediaPipe Pose (`@mediapipe/pose`), Custom Pose Geometry Engine
- **Data Visualization**: Chart.js, `react-chartjs-2`
- **PWA & Audio**: `vite-plugin-pwa`, Web Speech Synthesis API
- **Auth**: `@react-oauth/google`

### Backend (`/server` & `/api`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4
- **Database**: MongoDB with Mongoose 8 ODM
- **Logging**: Winston 3, `winston-daily-rotate-file`
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, Google Auth Library
- **Security**: CORS origin whitelist, security headers (`X-Frame-Options`, `nosniff`, `XSS-Protection`), request body size limits
- **Serverless**: Ready for Vercel Serverless Functions (`/api/index.js`)

---

## 📁 Project Architecture

```
Gym-Companion/
├── api/                       # Vercel serverless function entrypoint
│   └── index.js               # Express app adapter for Vercel deployment
├── client/                    # React Frontend (Vite + Tailwind CSS v4)
│   ├── public/                # Static assets & PWA manifest
│   ├── src/
│   │   ├── components/        # UI components & layouts (Nav, Sidebar, ProtectedRoute)
│   │   ├── context/           # React Context (AuthContext, WorkoutContext, HabitContext)
│   │   ├── hooks/             # Custom hooks (usePoseDetection, etc.)
│   │   ├── pages/             # App pages (Dashboard, Workouts, Habits, Progress, Settings)
│   │   ├── routes/            # App routing definitions (AppRoutes.jsx)
│   │   ├── services/          # Axios API client modules
│   │   └── utils/             # Pose geometry, posture checker, notification manager
│   ├── package.json
│   ├── vercel.json            # Vercel frontend rewrite configuration
│   └── vite.config.js         # Vite configuration with PWA plugin
├── logs/                      # Backend log files (git-ignored, auto-rotated)
└── server/                    # Node.js + Express Backend API
    ├── config/                # Database connection setup (MongoDB)
    ├── controllers/           # Route logic handlers (Auth, Workout, Habit)
    ├── middleware/            # Auth & Winston request logging middleware
    ├── models/                # Mongoose Schema definitions (User, Workout, Habit)
    ├── routes/                # API router endpoints
    ├── utils/                 # Winston logger service & sensitive data sanitizer
    ├── server.js              # Standalone Express server & global error handlers
    ├── package.json
    └── vercel.json            # Vercel backend rewrite configuration
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- **MongoDB Database** (Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

---

### Installation & Local Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Sujith-Medithi/Gym-Companion.git
cd Gym-Companion
```

#### 2. Configure Backend (`/server`)
```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
```

Start the backend server in development mode:
```bash
npm run dev
# Server running on http://localhost:5000
```

#### 3. Configure Frontend (`/client`)
Open a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file inside the `client/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
# Application running at http://localhost:5173
```

---

## ⚙️ Environment Variables Reference

### Backend (`/server/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for local Express server | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGO_URI` | Connection URI for MongoDB database | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | `your_secret_key` |
| `JWT_EXPIRES_IN` | Validity period for authentication tokens | `7d` |
| `CLIENT_URL` | Frontend client origin URL for CORS policy | `http://localhost:5173` |
| `LOG_LEVEL` | Minimum logging level (`error`, `warn`, `info`, `http`, `debug`) | `info` |

### Frontend (`/client/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API URL pointing to the backend | `http://localhost:5000/api` |

---

## 📡 API Endpoints Summary

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user and issue JWT cookie/token
- `POST /api/auth/google` - Authenticate via Google OAuth
- `POST /api/auth/logout` - Clear user session and cookies
- `GET  /api/auth/me` - Retrieve authenticated user profile *(Protected)*
- `PUT  /api/auth/settings` - Update user preferences & targets *(Protected)*

### Workout Routes (`/api/workouts`)
- `GET    /api/workouts` - Fetch user's recorded workouts *(Protected)*
- `POST   /api/workouts` - Log a completed workout session *(Protected)*
- `GET    /api/workouts/report` - Get aggregate workout statistics & analytics *(Protected)*
- `PUT    /api/workouts/:id` - Update workout entry *(Protected)*
- `DELETE /api/workouts/:id` - Delete workout entry *(Protected)*

### Habit Routes (`/api/habits`)
- `GET    /api/habits` - List all active user habits *(Protected)*
- `POST   /api/habits` - Create a new habit *(Protected)*
- `POST   /api/habits/:id/toggle` - Toggle habit completion status for today *(Protected)*
- `PUT    /api/habits/:id` - Edit habit details *(Protected)*
- `DELETE /api/habits/:id` - Remove habit entry *(Protected)*

---

## 🌐 Deployment Guide

### Deploying to Vercel

#### Backend Deployment
1. Import the target repository root into Vercel.
2. In Vercel Project Settings, configure root directory or serverless rewrites and add Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (URL of deployed frontend)
   - `NODE_ENV=production`
   - `LOG_LEVEL=info`

#### Frontend Deployment
1. Import the `/client` folder as a separate Vercel project.
2. In Vercel Project Settings, add the environment variable:
   - `VITE_API_URL` (URL of deployed backend, e.g. `https://your-backend.vercel.app/api`)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
