import { useState } from 'react';
import BehaviorModal from '../modals/BehaviorModal';

interface BehaviorSectionProps {
  apiBase: string;
}

export default function BehaviorSection({ apiBase }: BehaviorSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-[#2ec4b6] p-10 md:p-14 rounded-3xl md:rounded-[40px] text-left text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_50px_rgba(46,196,182,0.18)] relative overflow-hidden group">
        {/* Decorative inner background halo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl pointer-events-none -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-110" />

        <div className="relative z-10 space-y-6">
          <span className="text-[10px] font-black tracking-widest text-[#e9c46a] uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Cognitive Translation
          </span>
          <h3 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight leading-tight">
            WHY IS MY CAT LIKE THIS?
          </h3>
          <p className="text-xs md:text-sm text-white/90 leading-relaxed max-w-xl font-light">
            Ask "why does my cat do X?" — get a vet-informed explanation tailored to your cat's age, breed, and profile. From dead mouse gifts to 3 AM zoomies.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#e9c46a] hover:bg-[#e2b74c] active:scale-95 text-slate-900 font-extrabold px-6 py-3.5 rounded-xl text-xs tracking-wider transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(233,196,106,0.3)] hover:-translate-y-0.5 cursor-pointer"
          >
            GET TO KNOW YOUR CAT BETTER
          </button>
        </div>
      </div>

      <BehaviorModal isOpen={isOpen} onClose={() => setIsOpen(false)} apiBase={apiBase} />
    </section>
  );
}
