import { SectionCard, TEAL } from './shared';

const PALETTE = [
  { name: 'Teal Accent', hex: '#2ec4b6', text: 'text-white' },
  { name: 'Ink / Border', hex: '#0f172a', text: 'text-white' },
  { name: 'Slate Surface', hex: '#e2e8f0', text: 'text-slate-900' },
  { name: 'Teal Wash', hex: '#EEF9F8', text: 'text-teal-900' },
  { name: 'Sand CTA', hex: '#e9c46a', text: 'text-slate-900' },
  { name: 'Paper', hex: '#ffffff', text: 'text-slate-900' },
];

export function OverviewSection() {
  return (
    <SectionCard id="overview" eyebrow="PawWiz Engineering" title="Documentation">
      <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mb-8">
        A judge-ready reference for the PawWiz AI cat-health assistant: the visual system,
        architecture, security posture, test strategy, and everything needed to stand the
        project up locally.
      </p>

      {/* Palette */}
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Palette</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
        {PALETTE.map((c) => (
          <div key={c.hex} className="border-2 border-slate-900 rounded-2xl overflow-hidden">
            <div className={`h-16 flex items-end p-2 ${c.text}`} style={{ backgroundColor: c.hex }}>
              <span className="text-[10px] font-black uppercase tracking-wider">{c.hex}</span>
            </div>
            <div className="px-2 py-1.5 bg-white text-[10px] font-black uppercase tracking-wide text-slate-700">
              {c.name}
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Typography</h3>
      <div className="grid gap-3 md:grid-cols-2 mb-10">
        <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white">
          <p className="text-3xl font-black uppercase tracking-tight text-slate-900">Heading</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            font-black · uppercase · tracking-tight
          </p>
        </div>
        <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white">
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: TEAL }}>
            Eyebrow Label
          </p>
          <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            Body copy uses medium slate for readable rhythm across cards.
          </p>
        </div>
      </div>

      {/* UI design tokens */}
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">UI Design Language</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
          <p className="text-xs font-black uppercase text-slate-900">Card</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">border-2 · hard shadow · rounded-[2.5rem]</p>
        </div>
        <button className="p-4 bg-teal-500 text-white border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0_0_rgba(15,23,42,1)] font-black uppercase text-xs cursor-default">
          Primary Button
        </button>
        <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl">
          <p className="text-xs font-black uppercase text-slate-400">Dashed Slot</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">optional / add states</p>
        </div>
      </div>
    </SectionCard>
  );
}
