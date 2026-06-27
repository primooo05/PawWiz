/**
 * Chain of Responsibility (Middleware Pattern)
 * ASPCA plant toxicity lookup routes.
 * Public endpoints — no auth required for plant safety lookups.
 */

import { Router } from 'express';
import { lookupPlant, lookupPlantPost, listPlants } from '../controllers/aspca.controller.js';
import { validate } from '../middleware/validate.js';
import { plantLookupRequestSchema } from '../schemas/index.js';

const aspcaRouter = Router();

aspcaRouter.get('/lookup', lookupPlant);
aspcaRouter.post('/lookup', validate(plantLookupRequestSchema), lookupPlantPost);
aspcaRouter.get('/plants', listPlants);

export { aspcaRouter };
