import { Router } from 'express';
import {
  startOnboarding,
  getOnboardingSession,
  updateOnboardingStep
} from '../controllers/onboarding.controller.js';

const onboardingRouter = Router();

onboardingRouter.post('/start', startOnboarding);
onboardingRouter.get('/session/:id', getOnboardingSession);
onboardingRouter.post('/session/:id/update', updateOnboardingStep);

export { onboardingRouter };
