import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

// Each section is lazy-loaded so only the visible one is parsed on first render.
// The Docs page is judge/dev-facing and not on the critical path, so aggressive
// splitting here is fine — each section is a self-contained card.
const OverviewSection  = lazy(() => import('./docs/OverviewSection').then(m => ({ default: m.OverviewSection })));
const EnvironmentSection = lazy(() => import('./docs/EnvironmentSection').then(m => ({ default: m.EnvironmentSection })));
const SecuritySection  = lazy(() => import('./docs/SecuritySection').then(m => ({ default: m.SecuritySection })));
const TestingSection   = lazy(() => import('./docs/TestingSection').then(m => ({ default: m.TestingSection })));
const DiagramsSection  = lazy(() => import('./docs/DiagramsSection').then(m => ({ default: m.DiagramsSection })));
const DatabaseSection  = lazy(() => import('./docs/DatabaseSection').then(m => ({ default: m.DatabaseSection })));

function SectionFallback() {
  return (
    <div className="border-2 border-slate-900 rounded-2xl bg-white p-8 animate-pulse">
      <div className="h-3 bg-slate-200 rounded w-24 mb-4" />
      <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
      <div className="space-y-3">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-4/6" />
      </div>
    </div>
  );
}

/**
 * PawWiz — Judge-facing documentation page (/docs).
 *
 * Neo-Brutalism design system:
 *  - White cards with 2px slate-900 borders + hard offset shadows
 *  - Teal accent (#2ec4b6), uppercase black headings, tight tracking
 */

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'environment', label: 'Environment' },
  { id: 'security', label: 'Security' },
  { id: 'testing', label: 'Testing' },
  { id: 'diagrams', label: 'Diagrams' },
  { id: 'database', label: 'Database' },
];

export default function Docs() {
  const [activeId, setActiveId] = useState<string>('overview');

  // Track which section is in view using IntersectionObserver
  useEffect(() => {
    const sectionEls = NAV.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the first intersecting entry that is visible — topmost wins
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Fire when the top 20% of each section enters the viewport
        rootMargin: '-10% 0px -80% 0px',
        threshold: 0,
      }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-200 pb-24">
      {/* Fixed in-page nav — sticky doesn't work here because App.tsx has
          overflow-x-hidden on the root, which creates a new scroll container
          and breaks position:sticky. Fixed + pt offset on content is reliable. */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-slate-200/95 backdrop-blur-md border-b-2 border-slate-900 shadow-[0_2px_0_0_rgba(15,23,42,1)]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Link
            to="/"
            className="flex-shrink-0 font-black uppercase tracking-tight text-slate-900 text-sm mr-3 hover:opacity-70 transition-opacity"
          >
            🐾 PawWiz
          </Link>

          {/* Divider */}
          <span className="flex-shrink-0 w-px h-4 bg-slate-400 mr-1" />

          {NAV.map((n) => {
            const isActive = activeId === n.id;
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={[
                  'flex-shrink-0 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-full transition-all',
                  isActive
                    ? 'bg-slate-900 text-white border-2 border-slate-900'
                    : 'text-slate-600 border-2 border-transparent hover:border-slate-900 hover:text-slate-900',
                ].join(' ')}
              >
                {n.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* pt-[57px] matches the nav height (py-3 × 2 + text line ≈ 57px) */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-[72px] space-y-10">
        {/* SECTION 1 — HERO & OVERVIEW */}
        <Suspense fallback={<SectionFallback />}>
          <OverviewSection />
        </Suspense>

        {/* SECTION 2 — ENVIRONMENT */}
        <Suspense fallback={<SectionFallback />}>
          <EnvironmentSection />
        </Suspense>

        {/* SECTION 3 — SECURITY */}
        <Suspense fallback={<SectionFallback />}>
          <SecuritySection />
        </Suspense>

        {/* SECTION 4 — TESTING & API */}
        <Suspense fallback={<SectionFallback />}>
          <TestingSection />
        </Suspense>

        {/* SECTION 5 — INTERACTIVE DIAGRAMS */}
        <Suspense fallback={<SectionFallback />}>
          <DiagramsSection />
        </Suspense>

        {/* SECTION 6 — DATABASE SCHEMA */}
        <Suspense fallback={<SectionFallback />}>
          <DatabaseSection />
        </Suspense>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
