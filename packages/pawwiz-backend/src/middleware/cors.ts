import cors from 'cors';

const getOrigin = () => {
  const origin = process.env.FRONTEND_ORIGIN;
  if (!origin) return 'http://localhost:5173';
  if (origin.includes(',')) {
    return origin.split(',').map((item) => item.trim());
  }
  return origin;
};

export const corsMiddleware = cors({
  origin: getOrigin(),
  credentials: true,
});

