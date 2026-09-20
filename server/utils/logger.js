import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../logs');

// Ensure log directory exists
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch {
  // Gracefully handle read-only environments like Vercel serverless
}

// ─── Sensitive Field Redaction ──────────────────────────────────────────
const SENSITIVE_KEYS = new Set([
  'password',
  'confirmpassword',
  'token',
  'authtoken',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'cookie',
  'credential',
  'secret',
  'jwt_secret',
  'apikey',
  'smtp_pass',
]);

export const sanitizeData = (data, depth = 0) => {
  if (depth > 6 || !data) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// ─── Format Definitions ─────────────────────────────────────────────────
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    // Sanitize any extra meta parameters without stripping Winston internal Symbol properties
    for (const key of Object.keys(info)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
      if (SENSITIVE_KEYS.has(lowerKey)) {
        info[key] = '[REDACTED]';
      } else if (typeof info[key] === 'object' && info[key] !== null) {
        info[key] = sanitizeData(info[key]);
      }
    }
    return info;
  })(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, method, url, status, duration, userId, stack, ...meta }) => {
    let extra = '';
    if (method && url) {
      extra += ` [${method} ${url}${status ? ` -> ${status}` : ''}${duration !== undefined ? ` ${duration}ms` : ''}${userId ? ` User:${userId}` : ''}]`;
    }
    const filteredMeta = { ...meta };
    delete filteredMeta.service;
    const metaStr = Object.keys(filteredMeta).length > 0 ? ` ${JSON.stringify(filteredMeta)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level}: ${message}${extra}${metaStr}${stackStr}`;
  })
);

// ─── Configure Transports ───────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// File transports (enabled when filesystem is writable)
try {
  const appFileRotate = new DailyRotateFile({
    filename: path.join(logDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '10m',
    maxFiles: '14d',
    format: customFormat,
    level: 'debug',
  });

  const errorFileRotate = new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '10m',
    maxFiles: '14d',
    format: customFormat,
    level: 'error',
  });

  transports.push(appFileRotate, errorFileRotate);
} catch (err) {
  console.warn('File logging disabled due to filesystem restrictions:', err.message);
}

// ─── Create Winston Logger ──────────────────────────────────────────────
export const logger = winston.createLogger({
  level: (process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')).toLowerCase(),
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  format: customFormat,
  defaultMeta: { service: 'gym-companion-backend' },
  transports,
  exitOnError: false,
});

export default logger;
