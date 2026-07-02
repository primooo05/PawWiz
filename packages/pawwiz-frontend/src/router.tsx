import { Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import CatPregnancyTracker from './components/pregnancy-tracker/PregnancyTracker';
import CatHeatTracker from './components/heat-tracker/CatHeatTracker';
import DietRecommender from './components/diet-recommender/DietRecommender';
import BehaviorChat from './components/behavior-chat/BehaviorChat';
import BehaviorDashboard from './pages/BehaviorDashboard';
import UserDashboardView from './components/user-dashboard/UserDashboardView';

export function Router() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pregnancy-tracker" element={<CatPregnancyTracker />} />
        <Route path="/heat-tracker" element={<CatHeatTracker />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/diet-recommender" element={<DietRecommender />} />
        <Route path="/behavior" element={<BehaviorChat />} />
        <Route path="/behavior-insights" element={<BehaviorDashboard />} />
        <Route path="/dashboard" element={<UserDashboardView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}
