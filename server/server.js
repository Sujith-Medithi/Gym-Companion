import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { logger } from './utils/logger.js';
import requestLogger from './middleware/requestLogger.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy headers (Required for reverse proxies like Render / Heroku / Vercel for HTTPS cookies)
app.set('trust proxy', 1);

// Security & Header Configuration
app.disable('x-powered-by');

// Dynamic CORS Policy (supports multiple origins, Vercel preview domains, and strips trailing slashes)
const rawClientUrl = process.env.CLIENT_URL || 'https://gym-companion-tau.vercel.app';
const allowedOrigins = [
  'https://gym-companion-tau.vercel.app',
  'https://gym-companion.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...rawClientUrl
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      const isAllowed = 
        allowedOrigins.includes(origin) || 
        origin.endsWith('.vercel.app') || 
        process.env.NODE_ENV !== 'production';
        
      if (isAllowed) {
        callback(null, origin);
      } else {
        callback(null, origin);
      }
    },
    credentials: true,
  })
);

// Restricted Body Limits (Prevents Denial-of-Service resource exhaustion)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));
app.use(cookieParser());

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request Logging Middleware (traces all incoming HTTP requests)
app.use(requestLogger);

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Gym Companion API is running' });
});

// Global error handling middleware (production-ready with Winston stack trace logging)
app.use((err, req, res, _next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error(`Unhandled Error: ${err.message || 'Internal Server Error'}`, {
    status: statusCode,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'anonymous',
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: isProd && statusCode === 500 ? 'An internal server error occurred' : err.message || 'Internal Server Error',
    ...(isProd ? {} : { stack: err.stack }),
  });
});

// Process-level unhandled exception monitors
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack,
  });
});

// Start server (only when not running on Vercel)
if (!process.env.VERCEL) {
  connectDB();
  app.listen(PORT, () => {
    logger.info(`Gym Companion server listening on port ${PORT}`, {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
    });
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
