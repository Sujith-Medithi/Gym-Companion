import jwt from 'jsonwebtoken';

/**
 * Middleware to protect routes.
 * Reads JWT from httpOnly cookie, verifies it, and attaches user ID to req.user.
 */
const protect = (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Bearer token header if cookie is missing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

export default protect;
