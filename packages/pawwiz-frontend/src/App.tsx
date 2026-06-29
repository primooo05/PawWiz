import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReturnToTop from './components/ReturnToTop';
import { useScrollToTop } from './hooks/useScrollToTop';

export default function App() {
  useScrollToTop();
  const location = useLocation();

  const isModule = ['/pregnancy-tracker', '/diet-recommender', '/heat-tracker'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-x-hidden">
      {/* Premium background radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(233,196,106,0.07),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(46,196,182,0.07),transparent_50%)] pointer-events-none" />
      
      <div className={`relative z-10 flex flex-col min-h-screen ${!isModule ? 'pt-16' : ''}`}>
        {!isModule && <Navbar />}
        <main className="flex-grow">
          <Outlet />
        </main>
        <ReturnToTop />
        <Footer />
      </div>
    </div>
  );
}
