// Auth hooks
export { useLogin } from './auth/useLogin';
export { useForgotPassword } from './auth/useForgotPassword';
export { useResetPassword } from './auth/useResetPassword';

// Onboarding hooks
export { useOnboarding } from './onboarding/useOnboarding';
export { useOnboardingState } from './onboarding/useOnboardingState';
export * from './onboarding/useOnboardingValidation';

// Tracker hooks
export { usePregnancyTracker } from './trackers/usePregnancyTracker';
export { useWeightManager } from './trackers/useWeightManager';
export { useGestationCalculator } from './trackers/useGestationCalculator';

// Feature hooks
export { useBehaviorChat } from './features/useBehaviorChat';
export { useBehaviorDecoder } from './features/useBehaviorDecoder';
export { useDietAdvisorChat } from './features/useDietAdvisorChat';
export { useDietPlanner } from './features/useDietPlanner';
export { useDietRecommender } from './features/useDietRecommender';
export { usePlantScan } from './features/usePlantScan';
export { useCatAvatarUpload } from './features/useCatAvatarUpload';
export { useProfilePanel } from './features/useProfilePanel';
export { useQuickLog } from './features/useQuickLog';
export { useHealthTimeline } from './features/useHealthTimeline';
export { useTimelineInsights } from './features/useTimelineInsights';
export { useHealthExport } from './features/useHealthExport';
export { useCatPregnancy } from './features/useCatPregnancy';
export type { DailyLogPayload } from './features/useCatPregnancy';

// UI hooks
export { useFormValidation } from './ui/useFormValidation';
export { useBodyScrollLock } from './ui/useBodyScrollLock';
export { useHashScroll } from './ui/useHashScroll';
export { useModalToggle } from './ui/useModalToggle';
export { useScrollReveal } from './ui/useScrollReveal';
export { useScrollToTop } from './ui/useScrollToTop';
export { useTypewriter } from './ui/useTypewriter';
