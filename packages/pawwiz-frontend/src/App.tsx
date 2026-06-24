
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PregnancySection from './components/PregnancySection';
import DietSection from './components/DietSection';
import BehaviorSection from './components/BehaviorSection';
import Footer from './components/Footer';

// Smart api base detection
const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-800 bg-grid-pattern relative">
      <Navbar />
      <Hero apiBase={API_BASE} />
      <PregnancySection />
      <DietSection apiBase={API_BASE} />
      <BehaviorSection apiBase={API_BASE} />
      <Footer />
    </div>
  );
}
