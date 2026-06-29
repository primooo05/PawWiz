import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase, disconnectDatabase } from './lib/prisma.js';
import { registerRoutes } from './routes/index.js';
import { lookupPlantToxicity } from './data/aspca.js';
import { scanPlantWithVision, optimizeDiet, decodeBehavior } from './services/gemini.js';
import { ToxicityScanRequest, ToxicityScanResult } from './types/shared.js';

import { helmetMiddleware } from './middleware/helmet.js';
import { corsMiddleware } from './middleware/cors.js';
import { contentTypeMiddleware } from './middleware/contentType.js';
import { sanitizerMiddleware } from './middleware/sanitizer.js';

import { validate } from './middleware/validate.js';
import { scanSchema, dietSchema, behaviorSchema } from './schemas/index.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// Security Middleware Pipeline
app.use(helmetMiddleware);
app.use(corsMiddleware);

// JSON body parser with 10mb limit. Throws 413 if exceeded (handled by express internally).
app.use(express.json({ limit: '10mb' }));

// Mutation constraints
app.use(contentTypeMiddleware);
app.use(sanitizerMiddleware);


// Register MRSC routes (profile, etc.)
registerRoutes(app);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Plant scan & ASPCA verification loop
app.post('/api/scan', validate(scanSchema), async (req, res) => {
  const payload = req.body as ToxicityScanRequest;
  
  try {
    let plantName = '';
    let confidence = 1.0;
    let aiExplanation = '';
    let isAiIdentified = false;

    // 1. If an image is provided, run Gemini Vision identification first
    if (payload.image) {
      const visionResult = await scanPlantWithVision(payload.image);
      plantName = visionResult.plantName;
      confidence = visionResult.confidence;
      aiExplanation = visionResult.details;
      isAiIdentified = true;
    } else if (payload.plantNameQuery) {
      plantName = payload.plantNameQuery;
    } else {
      res.status(400).json({ error: 'Either image or plantNameQuery must be provided.' });
      return;
    }

    // 2. Query ASPCA database deterministically to prevent hallucination
    const aspcaRecord = lookupPlantToxicity(plantName);

    let result: ToxicityScanResult;

    if (aspcaRecord) {
      // Overwrite/enrich with deterministic ASPCA data
      result = {
        identifiedPlant: aspcaRecord.plantName,
        scientificName: aspcaRecord.scientificName,
        isToxic: aspcaRecord.isToxic,
        severity: aspcaRecord.severity,
        clinicalSigns: aspcaRecord.clinicalSigns,
        actionRequired: aspcaRecord.actionRequired,
        confidence: isAiIdentified ? confidence : 1.0,
        dataSource: "ASPCA Database (Deterministic)",
        aiAnalysisText: isAiIdentified ? aiExplanation : 'Retrieved directly from database index.'
      };
    } else {
      // If not in database, handle safely
      result = {
        identifiedPlant: plantName,
        scientificName: 'Unknown (Not in ASPCA Index)',
        isToxic: false,
        severity: 'None',
        clinicalSigns: ['Unknown - Plant not registered in ASPCA library.'],
        actionRequired: 'CAUTION: Plant is not in our local ASPCA index. We cannot guarantee safety. Treat as toxic/avoid contact, and consult a veterinary professional.',
        confidence: isAiIdentified ? confidence : 0.5,
        dataSource: "Gemini Vision (AI Model Verified)",
        aiAnalysisText: isAiIdentified ? aiExplanation : 'Plant searched by text but not found in ASPCA reference indices.'
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Scan endpoint failure:", error);
    res.status(500).json({ error: (error as Error).message });
  }
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
