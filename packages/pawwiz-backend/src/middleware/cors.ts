import cors from 'cors';

export const corsMiddleware = cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
