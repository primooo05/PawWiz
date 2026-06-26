import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Landing Page Imports
import Navbar from './components/Navbar';
import Hero from './components/landing/Hero';
import PregnancySection from './components/landing/PregnancySection';
import DietSection from './components/landing/DietSection';
import BehaviorSection from './components/landing/BehaviorSection';
import ContactSection from './components/landing/ContactSection';
import Footer from './components/Footer';
import ReturnToTop from './components/ReturnToTop';

// Tracker Imports
import CatPregnancyTracker from './components/pregnancy-tracker/PregnancyTracker';
import CatHeatTracker from './components/pregnancy-tracker/CatHeatTracker';

const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';

const LandingPage = () => (
    <div className="relative z-10 pt-16">
        <Navbar />
        <Hero apiBase={API_BASE} />
        <PregnancySection />
        <DietSection />
        <BehaviorSection apiBase={API_BASE} />
        <ContactSection />
        <ReturnToTop />
        <Footer />
    </div>
);

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-white text-slate-800 relative overflow-x-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(233,196,106,0.07),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(46,196,182,0.07),transparent_50%)] pointer-events-none" />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/pregnancy-tracker" element={<CatPregnancyTracker />} />
                    <Route path="/heat-tracker" element={<CatHeatTracker />} />
                    <Route path="/pregnancy-tracker" element={<CatPregnancyTracker />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}