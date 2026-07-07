import { lazy, Suspense } from 'react';
import { useHashScroll } from '../hooks/ui/useHashScroll.js';
import Hero from '../components/features/landing/Hero';
import { API_BASE } from '../lib/config.js';

// Below-fold landing sections: lazy-loaded so they don't bloat the initial
// bundle. Hero is above-fold and stays eager — it must render immediately.
// Each section loads when React begins rendering it (scroll is not required
// to trigger the fetch — the browser prefetches during idle time).
const PregnancySection = lazy(() => import('../components/features/landing/PregnancySection'));
const DietSection      = lazy(() => import('../components/features/landing/DietSection'));
const BehaviorSection  = lazy(() => import('../components/features/landing/BehaviorSection'));
const ContactSection   = lazy(() => import('../components/features/landing/ContactSection'));

// Minimal skeleton that matches each section's rough height so the page
// doesn't jump as sections load in.
function SectionSkeleton() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center border-b border-slate-100 bg-[#faf9f6]">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#2ec4b6] animate-spin" />
    </div>
  );
}

export default function Home() {
  useHashScroll();

  return (
    <>
      <Hero apiBase={API_BASE} />
      <Suspense fallback={<SectionSkeleton />}>
        <PregnancySection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <DietSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <BehaviorSection apiBase={API_BASE} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ContactSection />
      </Suspense>
    </>
  );
}
