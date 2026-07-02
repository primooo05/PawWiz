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
        <Route path="/dashboard" element={<UserDashboardView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}
