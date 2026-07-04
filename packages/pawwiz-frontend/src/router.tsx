import { Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import ResetPassword from './pages/ResetPassword';
import CatPregnancyTracker from './components/features/pregnancy/PregnancyTracker';
import CatHeatTracker from './components/features/heat/CatHeatTracker';
import DietRecommender from './components/features/diet/DietRecommender';
import BehaviorChat from './components/features/behavior/BehaviorChat';
import BehaviorDashboard from './components/features/behavior/BehaviorDashboard';
import Dashboard from './components/features/dashboard/Dashboard';

export function Router() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-dashboard" element={<Dashboard />} />
        <Route path="/pregnancy-tracker" element={<CatPregnancyTracker />} />
        <Route path="/heat-tracker" element={<CatHeatTracker />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/diet-recommender" element={<DietRecommender />} />
        <Route path="/behavior-chat" element={<BehaviorChat />} />
        <Route path="/behavior-dashboard" element={<BehaviorDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}
