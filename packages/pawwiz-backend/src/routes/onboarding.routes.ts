import { Router } from 'express';
import {
  startOnboarding,
  getOnboardingSession,
  updateOnboardingStep,
  postSendOtp,
  postVerifyOtp,
  postCheckEmail,
} from '../controllers/onboarding.controller.js';
import { emailCheckLimiter } from '../middleware/rateLimiter.js';

const onboardingRouter = Router();

onboardingRouter.post('/check-email', emailCheckLimiter, postCheckEmail);
onboardingRouter.post('/start', startOnboarding);
onboardingRouter.get('/session/:id', getOnboardingSession);
onboardingRouter.post('/session/:id/update', updateOnboardingStep);
onboardingRouter.post('/session/:id/send-otp', postSendOtp);
onboardingRouter.post('/session/:id/verify-otp', postVerifyOtp);

export { onboardingRouter };
