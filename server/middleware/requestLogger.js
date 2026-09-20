import { logger, sanitizeData } from '../utils/logger.js';

/**
 * Request logging middleware.
 * Traces each HTTP request, records execution duration, status code, user ID,
 * and outputs structured logs with sensitive parameters redacted.
 */
export const requestLogger = (req, res, next) => {
  // Exclude high-frequency static polling endpoints from polluting logs if desired,
  // but keep all API requests tracked.
  const startTime = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationMs = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;

    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userId = req.user?.id || req.user?._id || 'anonymous';
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Sanitize request query and non-binary body summary
    const sanitizedQuery = sanitizeData(req.query);
    const sanitizedBody = req.body ? sanitizeData(req.body) : undefined;

    // Do not log entire bulky payloads (limit keys)
    let bodySummary = undefined;
    if (sanitizedBody && typeof sanitizedBody === 'object' && Object.keys(sanitizedBody).length > 0) {
      bodySummary = { ...sanitizedBody };
    }

    const logMeta = {
      method,
      url,
      status: statusCode,
      duration: durationMs,
      userId,
      ip,
      userAgent,
      query: Object.keys(sanitizedQuery || {}).length > 0 ? sanitizedQuery : undefined,
      body: bodySummary,
    };

    const message = `${method} ${url} ${statusCode} - ${durationMs}ms`;

    if (statusCode >= 500) {
      logger.error(message, logMeta);
    } else if (statusCode >= 400) {
      logger.warn(message, logMeta);
    } else {
      logger.http(message, logMeta);
    }
  });

  next();
};

export default requestLogger;
