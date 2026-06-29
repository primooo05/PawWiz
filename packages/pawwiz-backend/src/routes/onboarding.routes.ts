import { Router } from 'express';
import {
  startOnboarding,
  getOnboardingSession,
  updateOnboardingStep,
  postSendOtp,
  postVerifyOtp
} from '../controllers/onboarding.controller.js';

const onboardingRouter = Router();

onboardingRouter.post('/start', startOnboarding);
onboardingRouter.get('/session/:id', getOnboardingSession);
onboardingRouter.post('/session/:id/update', updateOnboardingStep);
onboardingRouter.post('/session/:id/send-otp', postSendOtp);
onboardingRouter.post('/session/:id/verify-otp', postVerifyOtp);

export { onboardingRouter };
