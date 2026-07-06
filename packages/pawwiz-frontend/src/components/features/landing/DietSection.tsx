import { useState } from "react";
import DietModal from "../../ui/modals/DietModal";
import WizChatDemo from "./WizChatDemo/WizChatDemo";
import { useScrollReveal } from '../../../hooks/ui/useScrollReveal';

// ─── Main component ───────────────────────────────────────────────────────────
export default function DietSection({}: {}) {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      id="diet"
      className="scroll-mt-20 w-full min-h-screen flex items-center justify-center border-b border-slate-100 relative bg-gradient-to-br from-amber-50/15 via-white to-slate-50/40"
    >


      {/* Decorative glows */}
      <div className="absolute right-1/4 top-1/4 w-96 h-96 bg-[#e9c46a]/5 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute left-10 bottom-10 w-80 h-80 bg-[#2ec4b6]/3 rounded-full filter blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl w-full mx-auto px-8 md:px-16 py-20 grid md:grid-cols-[1fr_1.15fr] gap-16 lg:gap-24 items-center">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="space-y-8 text-left">
          <div className="reveal-item stagger-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#e9c46a] rotate-45 flex-shrink-0" />
            <span className="text-[10px] font-black tracking-[0.25em] text-[#e9c46a] uppercase">
              NUTRITION OPTIMIZATION
            </span>
          </div>

          <h2 className="reveal-item stagger-2 text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase">
            Your Cat's Meals,<br />Actually Measured
          </h2>

          {/* Stats */}
          <div className="reveal-item stagger-3 flex items-center gap-6 border-y border-slate-200/50 py-4 max-w-md ml-4 md:ml-6">
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">RER formula</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Vet-grade math</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">Spoon, g, cup</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Your units</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">7 food types</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">+ custom foods</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="reveal-item stagger-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-8 py-3.5 rounded-full text-xs tracking-widest transition-all duration-100 shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] cursor-pointer"
            >
              CALCULATE MY CAT'S DIET
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-900 font-extrabold px-6 py-3.5 rounded-full text-xs tracking-widest transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>How are calories calculated?</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Info & AI statement */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Most cat owners eyeball portions — and most cats are overfed. PawWiz converts your cat's weight, life stage, and food type into exact daily targets, then tracks every meal against them. Log breakfast in two taps. See exactly where your cat stands on calories and water before dinner.
            </p>
            <p className="text-xs italic text-slate-400 leading-relaxed font-medium">
              Supports dry kibble, wet food, cooked chicken, fish, egg, mixed diets, and any custom food via label kcal. Use spoons, grams, or cups — whatever is on your counter.
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Chat Demo ──────────────────────────────── */}
        <div className="reveal-item stagger-5">
          <WizChatDemo />
        </div>

      </div>

      <DietModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  );
}