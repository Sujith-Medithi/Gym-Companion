import app from '../server/server.js';
import connectDB from '../server/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error in Vercel function:', error);
  }
  return app(req, res);
}
