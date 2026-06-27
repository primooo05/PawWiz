/**
 * Controller Layer — ASPCA Plant Toxicity
 * Thin layer: extracts request data, delegates to service, formats response.
 * Uses Template Method (withErrorHandling) for standardized try/catch flow.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { aspcaService } from '../services/aspca.service.js';

/**
 * GET /api/aspca/lookup?plantName=lily
 * Looks up a plant in the ASPCA toxicity database by name (fuzzy match).
 */
export const lookupPlant = withErrorHandling(async (req: Request, res: Response) => {
  const { plantName } = req.query as { plantName: string };

  const result = await aspcaService.lookupPlant(plantName);

  res.json(result);
});

/**
 * POST /api/aspca/lookup
 * Looks up a plant in the ASPCA toxicity database by name (fuzzy match).
 * Body: { plantName: string }
 */
export const lookupPlantPost = withErrorHandling(async (req: Request, res: Response) => {
  const { plantName } = req.body;

  const result = await aspcaService.lookupPlant(plantName);

  res.json(result);
});

/**
 * GET /api/aspca/plants
 * Lists all plants in the ASPCA toxicity database.
 */
export const listPlants = withErrorHandling(async (req: Request, res: Response) => {
  const results = await aspcaService.listAll();

  res.json(results);
});
