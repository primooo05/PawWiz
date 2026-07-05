import './lib/env.js';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { connectDatabase, disconnectDatabase } from './lib/prisma.js';
import { registerRoutes } from './routes/index.js';

import { helmetMiddleware } from './middleware/helmet.js';
import { corsMiddleware } from './middleware/cors.js';
import { contentTypeMiddleware } from './middleware/contentType.js';
import { sanitizerMiddleware } from './middleware/sanitizer.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// Configure multer for in-memory file uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

// Make upload middleware available globally
(app as any).upload = upload;

// Security Middleware Pipeline
app.use(helmetMiddleware);
app.use(corsMiddleware);

// JSON body parser with 10mb limit. Throws 413 if exceeded (handled by express internally).
app.use(express.json({ limit: '10mb' }));

// Multipart form-data parser (for file uploads)
app.use(express.raw({ type: 'application/octet-stream', limit: '5mb' }));

// Mutation constraints
app.use(contentTypeMiddleware);
app.use(sanitizerMiddleware);


// Register MRSC routes (profile, etc.)
registerRoutes(app);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Legacy scan route — redirects to the new toxicity pipeline for backward compatibility.
// The old POST /api/scan endpoint has been migrated to POST /api/toxicity/scan as part
// of the plant-toxicity-caching feature (Req 9.2, 9.3).
// Clients should update their API calls to use /api/toxicity/scan directly.
app.post('/api/scan', (req, res) => {
  res.redirect(308, '/api/toxicity/scan');
});

// NOTE: The legacy inline `POST /api/diet` and `POST /api/behavior` handlers were
// removed. They were unauthenticated duplicates that bypassed the MRSC layer and
// relied on coincidental mount ordering. The authenticated, service-layered
// equivalents live in geminiRouter: `POST /api/gemini/diet/optimize` and
// `POST /api/gemini/behavior/decode`.

/**
 * Startup sequence:
 * 1. Verify database connectivity (fail-fast if unreachable)
 * 2. Start HTTP server
 * 3. Register graceful shutdown hooks
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`[Server] ✓ Running on http://localhost:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

bootstrap();
