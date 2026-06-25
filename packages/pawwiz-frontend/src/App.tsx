
import Navbar from './components/Navbar';
import Hero from './components/landing/Hero';
import PregnancySection from './components/landing/PregnancySection';
import DietSection from './components/landing/DietSection';
import BehaviorSection from './components/landing/BehaviorSection';
import Footer from './components/Footer';

// Smart api base detection
const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-x-hidden">
      {/* Premium background radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(233,196,106,0.07),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(46,196,182,0.07),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10">
        <Navbar />
        <Hero apiBase={API_BASE} />
        <PregnancySection />
        <DietSection apiBase={API_BASE} />
        <BehaviorSection apiBase={API_BASE} />
        <Footer />
      </div>
    </div>
  );
}
