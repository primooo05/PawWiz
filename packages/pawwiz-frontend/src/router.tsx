import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';

// Minimal inline fallback — no extra HTTP request, no loading GIF overhead on route transitions.
// Keeps the viewport stable while the chunk downloads.
function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
      <div className="w-8 h-8 rounded-full border-4 border-slate-900 border-t-[#15AFB4] animate-spin" />
    </div>
  );
}

// Every non-home route is lazy-loaded.
// This means none of these chunks are downloaded unless the user navigates to that route.
// On the landing page (the primary entry point), only Home + App are parsed —
// cutting the initial JS parse burden by ~90%.
const Login            = lazy(() => import('./pages/Login'));
const NotFound         = lazy(() => import('./pages/NotFound'));
const Onboarding       = lazy(() => import('./pages/Onboarding'));
const Settings         = lazy(() => import('./pages/Settings'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));
const Docs             = lazy(() => import('./pages/Docs'));
const CatPregnancyTracker = lazy(() => import('./components/features/pregnancy/PregnancyTracker'));
const DietRecommender  = lazy(() => import('./components/features/diet/DietRecommender'));
const BehaviorChat     = lazy(() => import('./components/features/behavior/BehaviorChat'));
const BehaviorDashboard = lazy(() => import('./components/features/behavior/BehaviorDashboard'));
const Dashboard        = lazy(() => import('./components/features/dashboard/Dashboard'));
const HealthTimelinePage = lazy(() => import('./components/features/timeline/HealthTimelinePage'));

export function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-dashboard" element={<Dashboard />} />
          <Route path="/pregnancy-tracker" element={<CatPregnancyTracker />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/diet-recommender" element={<DietRecommender />} />
          <Route path="/behavior-chat" element={<BehaviorChat />} />
          <Route path="/behavior-dashboard" element={<BehaviorDashboard />} />
          <Route path="/health-timeline/:catId" element={<HealthTimelinePage />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </Suspense>
  );
}
