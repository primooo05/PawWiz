import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { connectDatabase, disconnectDatabase } from './lib/prisma.js';
import { registerRoutes } from './routes/index.js';
import { optimizeDiet, decodeBehavior } from './services/gemini.js';

import { helmetMiddleware } from './middleware/helmet.js';
import { corsMiddleware } from './middleware/cors.js';
import { contentTypeMiddleware } from './middleware/contentType.js';
import { sanitizerMiddleware } from './middleware/sanitizer.js';

import { validate } from './middleware/validate.js';
import { dietSchema, behaviorSchema } from './schemas/index.js';

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

// Diet optimization endpoint
app.post('/api/diet', validate(dietSchema), async (req, res) => {
  try {
    const plan = await optimizeDiet(req.body);
    res.json(plan);
  } catch (error) {
    console.error("Diet endpoint failure:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Behavioral decoder endpoint
app.post('/api/behavior', validate(behaviorSchema), async (req, res) => {
  try {
    const decodeResult = await decodeBehavior(req.body);
    res.json(decodeResult);
  } catch (error) {
    console.error("Behavior endpoint failure:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

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
