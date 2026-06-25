import { useState } from 'react';
import DietModal from '../modals/DietModal';

interface DietSectionProps {
  apiBase: string;
}

export default function DietSection({ apiBase }: DietSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="diet" className="w-full min-h-screen flex items-center justify-center border-b border-slate-100 relative bg-gradient-to-br from-amber-50/15 via-white to-slate-50/40 bg-grid-pattern">
      {/* Decorative radial halos and background glows */}
      <div className="absolute right-1/4 top-1/4 w-96 h-96 bg-[#e9c46a]/5 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute left-10 bottom-10 w-80 h-80 bg-[#2ec4b6]/3 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl w-full mx-auto px-8 md:px-16 py-16 grid md:grid-cols-2 gap-16 items-center">
        {/* Left Illustration Column: Smart Diet Scale Dashboard */}
        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200/60 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(233,196,106,0.08)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative overflow-hidden group">
          <svg className="w-full max-w-[320px] aspect-[4/3] rounded-2xl shadow-inner bg-slate-950 p-2" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" rx="12" fill="#030712"/>
            
            {/* Round Portions Dial */}
            <circle cx="280" cy="150" r="70" fill="none" stroke="#1f2937" strokeWidth="12" />
            {/* Protein portion (Teal arc, 45%) */}
            <circle cx="280" cy="150" r="70" fill="none" stroke="#2ec4b6" strokeWidth="12" strokeDasharray="440" strokeDashoffset="242" strokeLinecap="round" transform="rotate(-90, 280, 150)" />
            {/* Fat portion (Yellow arc, 35%) */}
            <circle cx="280" cy="150" r="70" fill="none" stroke="#e9c46a" strokeWidth="12" strokeDasharray="440" strokeDashoffset="330" strokeLinecap="round" transform="rotate(72, 280, 150)" />
            
            {/* Paw print center icon */}
            <g transform="translate(262, 130) scale(1.5)" fill="#1f2937">
              <circle cx="8" cy="19" r="5"/>
              <circle cx="16" cy="19" r="5"/>
              <circle cx="12" cy="10" r="4.5"/>
              <ellipse cx="12" cy="27" rx="9" ry="6"/>
            </g>

            {/* Readout Telemetry on Left Panel */}
            <text x="30" y="55" fill="#e9c46a" fontFamily="monospace" fontSize="14" fontWeight="bold">DIET PLANNER V1.2</text>
            <rect x="30" y="80" width="160" height="42" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1"/>
            <text x="40" y="98" fill="#9ca3af" fontFamily="monospace" fontSize="9">DAILY TARGET</text>
            <text x="40" y="115" fill="#f3f4f6" fontFamily="monospace" fontSize="14" fontWeight="bold">240 KCAL</text>

            <rect x="30" y="138" width="160" height="100" rx="8" fill="#111827" stroke="#1f2937" strokeWidth="1"/>
            <text x="40" y="158" fill="#2ec4b6" fontFamily="monospace" fontSize="10" fontWeight="bold">■ PROTEIN: 45%</text>
            <text x="40" y="178" fill="#e9c46a" fontFamily="monospace" fontSize="10" fontWeight="bold">■ LIPIDS: 35%</text>
            <text x="40" y="198" fill="#9ca3af" fontFamily="monospace" fontSize="10" fontWeight="bold">■ CARBS: 20%</text>
            <text x="40" y="222" fill="#10b981" fontFamily="monospace" fontSize="9" fontWeight="bold">PORTION CALIBRATED</text>

            <text x="235" y="250" fill="#9ca3af" fontFamily="monospace" fontSize="10">MACRONUTRIENT BALANCE</text>
          </svg>
        </div>

        {/* Right Copy Column */}
        <div className="space-y-6 text-left">
          <span className="text-xs font-black tracking-widest text-[#e9c46a] uppercase bg-[#e9c46a]/15 px-3 py-1 rounded-full">
            Nutrition Optimization
          </span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Feeding Guide
          </h3>
          <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
            Personalized feeding schedules and food recommendations built around your cat's age, weight, breed, and health conditions. Updated as she grows from kitten to senior.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#e9c46a] hover:bg-[#e2b74c] active:scale-95 text-slate-900 font-extrabold px-6 py-3.5 rounded-xl text-xs tracking-wider transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(233,196,106,0.25)] hover:-translate-y-0.5"
          >
            VIEW GUIDE
          </button>
        </div>
      </div>

      <DietModal isOpen={isOpen} onClose={() => setIsOpen(false)} apiBase={apiBase} />
    </section>
  );
}
