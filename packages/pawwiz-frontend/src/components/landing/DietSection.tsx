import { useState } from "react";
import DietModal from "../modals/DietModal";

interface DietSectionProps {
}

export default function DietSection({ }: DietSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="diet" className="w-full min-h-screen flex items-center justify-center border-b border-slate-100 relative bg-gradient-to-br from-amber-50/15 via-white  to-slate-50/40">
      {/* Decorative background glows */}
      <div className="absolute right-1/4 top-1/4 w-96 h-96 bg-[#e9c46a]/5 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute left-10 bottom-10 w-80 h-80 bg-[#2ec4b6]/3 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl w-full mx-auto px-8 md:px-16 py-20 grid md:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-center">

        {/* Left Column: Typography, Stats, and Buttons */}
        <div className="space-y-8 text-left">
          {/* Eyebrow tag matching PregnancySection style */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#e9c46a] rotate-45 flex-shrink-0" />
            <span className="text-[10px] font-black tracking-[0.25em] text-[#e9c46a] uppercase">
              NUTRITION OPTIMIZATION
            </span>
          </div>

          {/* Main heading */}
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase max-w-3xl mx-auto">
            Precision Diet Calculator
          </h2>

          {/* Description */}
          <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
            Science-backed meal planning tailored to your cat'\''s weight, age, activity level, and health conditions. Get calorie targets, macro splits, and food
            recommendations.
          </p>

          {/* Stats row matching PregnancySection format */}
          <div className="flex items-center gap-6 border-y border-slate-200/50 py-4 max-w-md ml-4 md:ml-6">
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">45% Protein</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Optimal Ratio</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">3-4x Daily</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Meal Portions</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">Life Stage</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Adaptive</span>
            </div>
          </div>

          {/* Dual button row matching PregnancySection */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-8 py-3.5 rounded-full text-xs tracking-widest transition-all duration-100
                shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] cursor-pointer"
            >
              CALCULATE DIET
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-900 font-extrabold px-6 py-3.5 rounded-full text-xs tracking-widest     
  transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>See meal examples</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Dashboard */}
        <div className="relative w-full max-w-xl mx-auto transform-gpu rotate-1 md:-rotate-1 md:translate-y-4 z-20 transition-all duration-500 hover:rotate-0 hover:scale-[1.005] [will-change:transform]">
          {/* Background blur blob */}
          <div className="absolute -right-16 -bottom-16 w-[200px] h-[200px] bg-[#e9c46a]/15 rounded-full filter blur-3xl pointer-events-none -z-10" />

          {/* Main dashboard card */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.03)]
  hover:shadow-[0_20px_45px_rgba(233,196,106,0.08)] transition-all duration-300 relative overflow-hidden group">

            <svg className="w-full aspect-[4/3] rounded-2xl bg-slate-950 p-3 group-hover:bg-slate-900 transition-colors duration-300" viewBox="0 0 400 300"
              fill="none" xmlns="http://www.w3.org/2000/svg" textRendering="geometricPrecision" shapeRendering="geometricPrecision">
              <rect width="400" height="300" rx="12" fill="currentColor" />

              {/* Interactive dial with hover animations */}
              <circle cx="280" cy="150" r="70" fill="none" stroke="#1f2937" strokeWidth="12" className="group-hover:stroke-slate-600 transition-colors duration-300"
              />

              {/* Protein arc - animates on hover */}
              <circle cx="280" cy="150" r="70" fill="none" stroke="#2ec4b6" strokeWidth="12" strokeDasharray="440" strokeDashoffset="242" strokeLinecap="round"
                transform="rotate(-90, 280, 150)"
                className="group-hover:stroke-[#34d4c7] transition-all duration-500 group-hover:animate-pulse" />

              {/* Fat arc - animates on hover */}
              <circle cx="280" cy="150" r="70" fill="none" stroke="#e9c46a" strokeWidth="12" strokeDasharray="440" strokeDashoffset="330" strokeLinecap="round"
                transform="rotate(72, 280, 150)"
                className="group-hover:stroke-[#f1d071] transition-all duration-500 group-hover:animate-pulse" style={{ animationDelay: "150ms" }} />

              {/* Carb arc - subtle, appears on hover */}
              <circle cx="280" cy="150" r="70" fill="none" stroke="#9ca3af" strokeWidth="8" strokeDasharray="440" strokeDashoffset="396" strokeLinecap="round"
                transform="rotate(198, 280, 150)"
                className="opacity-50 group-hover:opacity-100 group-hover:stroke-slate-300 transition-all duration-500" style={{ animationDelay: "300ms" }} />

              {/* Paw center - scales on hover */}
              <g transform="translate(275, 140) scale(1.5)" fill="#1f2937" className="group-hover:fill-slate-600 group-hover:scale-130 transition-all duration-300    
  origin-center">
                <circle cx="6.5" cy="11.5" r="2" />
                <circle cx="10" cy="7.5" r="2" />
                <circle cx="14" cy="7.5" r="2" />
                <circle cx="17.5" cy="11.5" r="2" />
                <path d="M7.5 17c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4c0 1.5-1.5 2.5-4.5 2.5s-4.5-1-4.5-2.5z" />
              </g>

              {/* Left panel with enhanced interactivity */}
              <text x="30" y="45" fill="#e9c46a" fontFamily="monospace" fontSize="12" fontWeight="bold" className="group-hover:fill-[#f1d071] transition-colors       
  duration-300">DIET OPTIMIZER v2.1</text>

              {/* Daily target display */}
              <rect x="30" y="70" width="160" height="38" rx="6" fill="#111827" stroke="#1f2937" strokeWidth="1" className="group-hover:fill-slate-800
  group-hover:stroke-slate-600 transition-colors duration-300"/>
              <text x="38" y="86" fill="#9ca3af" fontFamily="monospace" fontSize="8" className="group-hover:fill-slate-400 transition-colors duration-300">DAILY
                TARGET</text>
              <text x="38" y="100" fill="#f3f4f6" fontFamily="monospace" fontSize="13" fontWeight="bold" className="group-hover:fill-white transition-colors
  duration-300">285 KCAL</text>

              {/* Macro breakdown */}
              <rect x="30" y="120" width="160" height="90" rx="6" fill="#111827" stroke="#1f2937" strokeWidth="1" className="group-hover:fill-slate-800
  group-hover:stroke-slate-600 transition-colors duration-300"/>
              <text x="38" y="140" fill="#2ec4b6" fontFamily="monospace" fontSize="9" fontWeight="bold" className="group-hover:fill-[#34d4c7] transition-colors       
  duration-300">■ PROTEIN: 45%</text>
              <text x="38" y="155" fill="#e9c46a" fontFamily="monospace" fontSize="9" fontWeight="bold" className="group-hover:fill-[#f1d071] transition-colors       
  duration-300">■ LIPIDS: 35%</text>
              <text x="38" y="170" fill="#9ca3af" fontFamily="monospace" fontSize="9" fontWeight="bold" className="group-hover:fill-slate-400 transition-colors       
  duration-300">■ CARBS: 20%</text>
              <text x="38" y="190" fill="#10b981" fontFamily="monospace" fontSize="8" fontWeight="bold" className="group-hover:fill-[#34d399] transition-colors       
  duration-300">OPTIMIZED</text>
              <text x="38" y="202" fill="#10b981" fontFamily="monospace" fontSize="8" fontWeight="bold" className="group-hover:fill-[#34d399] transition-colors       
  duration-300">FOR HEALTH</text>

              {/* Bottom label */}
              <text x="235" y="265" fill="#9ca3af" fontFamily="monospace" fontSize="9" className="group-hover:fill-slate-400 transition-colors duration-300">MACRO
                BALANCE</text>

              {/* Subtle scan line animation on hover */}
              <line x1="30" y1="240" x2="370" y2="240" stroke="#e9c46a" strokeWidth="1" opacity="0" className="group-hover:opacity-30 group-hover:animate-pulse       
  transition-opacity duration-500"/>
            </svg>
          </div>
        </div>

      </div>

      <DietModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  );
} 