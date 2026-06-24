import { useState } from 'react';
import DietModal from './modals/DietModal.js';

interface DietSectionProps {
  apiBase: string;
}

export default function DietSection({ apiBase }: DietSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="diet" className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-200/60">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/50 flex items-center justify-center order-last md:order-first shadow-sm">
          <svg className="w-48 h-48 text-[#e9c46a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
        </div>

        <div className="space-y-5 text-left">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Feeding Guide
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Personalized feeding schedules and food recommendations built around your cat's age, weight, breed, and health conditions. Updated as she grows from kitten to senior.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#e9c46a] hover:bg-[#e2b74c] text-slate-900 font-black px-6 py-3 rounded-xl text-xs tracking-wider transition-all shadow-sm"
          >
            VIEW GUIDE
          </button>
        </div>
      </div>

      <DietModal isOpen={isOpen} onClose={() => setIsOpen(false)} apiBase={apiBase} />
    </section>
  );
}
