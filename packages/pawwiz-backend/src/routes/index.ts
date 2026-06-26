/**
 * Route Registry
 * Central place to mount all routers onto the Express app.
 */

import type { Express } from 'express';
import { profileRouter } from './profile.routes.js';

export function registerRoutes(app: Express): void {
  app.use('/api/profile', profileRouter);
}
