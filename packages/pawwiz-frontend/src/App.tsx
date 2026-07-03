import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReturnToTop from './components/ReturnToTop';
import { useScrollToTop } from './hooks/useScrollToTop';
import pawWizText from './assets/PawWiz_Text_logo.png';

export default function App() {
  useScrollToTop();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const hideHeader = location.pathname === '/diet-recommender' || 
                     location.pathname === '/behavior' || 
                     location.pathname === '/behavior-chat' ||
                     location.pathname === '/behavior-dashboard' ||
                     location.pathname === '/dashboard' || 
                     location.pathname === '/user-dashboard' ||
                     location.pathname === '/pregnancy-tracker' || 
                     location.pathname === '/settings' ||
                     location.pathname === '/reset-password';

  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-x-hidden">
      {/* Premium background radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(233,196,106,0.07),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(46,196,182,0.07),transparent_50%)] pointer-events-none" />

      <div className={`relative z-10 flex flex-col min-h-screen ${hideHeader ? 'pt-0' : 'pt-16'}`}>
        {!isLandingPage && !isLoginPage && !hideHeader ? (
          <header className="border-b border-slate-200/40 bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
            <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-start justify-start">
              <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
                <img src={pawWizText} alt="PawWiz" className="h-6 w-auto object-contain ml-1" />
              </Link>
            </div>
          </header>
        ) : isLandingPage ? (
          <Navbar />
        ) : null}
        <main className={hideHeader ? 'flex-grow pt-0' : 'flex-grow'}>
          <Outlet />
        </main>
        <ReturnToTop />
        {isLandingPage && <Footer />}
      </div>
    </div>
  );
}
