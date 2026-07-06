import { Link } from 'react-router-dom';
import { OverviewSection } from './docs/OverviewSection';
import { EnvironmentSection } from './docs/EnvironmentSection';
import { SecuritySection } from './docs/SecuritySection';
import { TestingSection } from './docs/TestingSection';
import { DiagramsSection } from './docs/DiagramsSection';
import { DatabaseSection } from './docs/DatabaseSection';

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
  return (
    <div className="min-h-screen bg-slate-200 pb-24">
      {/* Sticky in-page nav */}
      <nav className="sticky top-0 z-30 bg-slate-200/90 backdrop-blur-sm border-b-2 border-slate-900">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <Link
            to="/"
            className="flex-shrink-0 font-black uppercase tracking-tight text-slate-900 text-sm mr-2"
          >
            🐾 PawWiz
          </Link>
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="flex-shrink-0 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 border-2 border-transparent hover:border-slate-900 rounded-full transition-colors"
            >
              {n.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-10 space-y-10">
        {/* SECTION 1 — HERO & OVERVIEW */}
        <OverviewSection />

        {/* SECTION 2 — ENVIRONMENT */}
        <EnvironmentSection />

        {/* SECTION 3 — SECURITY */}
        <SecuritySection />

        {/* SECTION 4 — TESTING & API */}
        <TestingSection />

        {/* SECTION 5 — INTERACTIVE DIAGRAMS */}
        <DiagramsSection />

        {/* SECTION 6 — DATABASE SCHEMA */}
        <DatabaseSection />

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
