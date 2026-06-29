import { Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import CatPregnancyTracker from './components/pregnancy-tracker/PregnancyTracker';
import CatHeatTracker from './components/heat-tracker/CatHeatTracker';
import DietRecommender from './components/diet-recommender/DietRecommender';

export function Router() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pregnancy-tracker" element={<CatPregnancyTracker />} />
        <Route path="/heat-tracker" element={<CatHeatTracker />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/diet-recommender" element={<DietRecommender />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  );
}
