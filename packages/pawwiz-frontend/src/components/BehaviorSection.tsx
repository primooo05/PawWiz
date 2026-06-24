import { useState } from 'react';
import BehaviorModal from './modals/BehaviorModal.js';

interface BehaviorSectionProps {
  apiBase: string;
}

export default function BehaviorSection({ apiBase }: BehaviorSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-[#2ec4b6] p-10 rounded-3xl text-left text-white shadow-lg space-y-6 relative overflow-hidden">
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          WHY IS MY CAT LIKE THIS?
        </h3>
        <p className="text-xs md:text-sm text-white/95 leading-relaxed max-w-xl font-light">
          Ask "why does my cat do X?" — get a vet-informed explanation tailored to your cat's age, breed, and profile. From dead mouse gifts to 3 AM zoomies.
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#e9c46a] hover:bg-[#e2b74c] text-slate-900 font-black px-6 py-3 rounded-xl text-xs tracking-wider transition-all shadow-sm block"
        >
          GET TO KNOW YOUR CAT BETTER
        </button>
      </div>

      <BehaviorModal isOpen={isOpen} onClose={() => setIsOpen(false)} apiBase={apiBase} />
    </section>
  );
}
