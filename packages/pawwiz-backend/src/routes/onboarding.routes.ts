import { Router } from 'express';
import {
  startOnboarding,
  getOnboardingSession,
  updateOnboardingStep,
  postSendOtp,
  postVerifyOtp,
  postCheckEmail,
  postSaveCat,
} from '../controllers/onboarding.controller.js';
import {
  emailCheckLimiter,
  otpVerifyLimiter,
  onboardingStartLimiter,
} from '../middleware/rateLimiter.js';

const onboardingRouter = Router();

onboardingRouter.post('/check-email', emailCheckLimiter, postCheckEmail);
onboardingRouter.post('/start', onboardingStartLimiter, startOnboarding);
onboardingRouter.get('/session/:id', getOnboardingSession);
onboardingRouter.post('/session/:id/update', updateOnboardingStep);
onboardingRouter.post('/session/:id/send-otp', postSendOtp);
onboardingRouter.post('/session/:id/verify-otp', otpVerifyLimiter, postVerifyOtp);
onboardingRouter.post('/session/:id/save-cat', postSaveCat);

export { onboardingRouter };
