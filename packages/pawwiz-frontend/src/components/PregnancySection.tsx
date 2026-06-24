import { useState } from 'react';
import PregnancyModal from './modals/PregnancyModal.js';

export default function PregnancySection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="monitoring" className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-200/60">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5 text-left">
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Monitor your Cat Pregnancy 🐾
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            From mating to kittening, monitor and track every stage of your cat's pregnancy with a prep guide! Calculate progress, track milestones, and receive tailored warnings.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#e9c46a] hover:bg-[#e2b74c] text-slate-900 font-black px-6 py-3 rounded-xl text-xs tracking-wider transition-all shadow-sm"
          >
            GET STARTED
          </button>
        </div>
        
        {/* Ultrasound Vector Graphic */}
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/50 flex items-center justify-center shadow-sm">
          <svg className="w-48 h-48 text-[#2ec4b6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
      </div>

      <PregnancyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  );
}
