import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getDietProfiles,
  createDietProfile,
  updateDietProfile,
  deleteDietProfile,
  updateDietMealLog,
  updateWaterIntake,
} from '../controllers/diet.controller.js';

const dietRouter = Router();

// Secure all diet recommender endpoints using Supabase JWT
dietRouter.use(authMiddleware);

dietRouter.get('/profiles', getDietProfiles);
dietRouter.post('/profiles', createDietProfile);
dietRouter.put('/profiles/:id', updateDietProfile);
dietRouter.delete('/profiles/:id', deleteDietProfile);
dietRouter.put('/profiles/:id/meals/:mealId', updateDietMealLog);
dietRouter.put('/profiles/:id/water', updateWaterIntake);

export { dietRouter };
