
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReturnToTop from './components/ReturnToTop';
import { Outlet } from 'react-router-dom';
import { useScrollToTop } from './hooks/useScrollToTop';

export default function App() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-white text-slate-800 relative">
      {/* Premium background radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(233,196,106,0.07),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(46,196,182,0.07),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 pt-16 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
        <ReturnToTop />
      </div>
    </div>
  );
}
