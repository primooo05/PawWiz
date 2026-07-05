import { useState } from 'react';
import BehaviorModal from '../../ui/modals/BehaviorModal';
import naughtyCat from '../../../assets/Naughty_Cat.svg';
import catScratch from '../../../assets/Cat_Scratch.svg';
import { useScrollReveal } from '../../../hooks/ui/useScrollReveal';

interface BehaviorSectionProps {
  apiBase: string;
}

export default function BehaviorSection({ apiBase }: BehaviorSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section ref={sectionRef} id="behavior" className="scroll-mt-20 w-full min-h-screen flex items-center justify-center border-b border-slate-100 relative bg-gradient-to-br from-slate-50/50 via-white to-amber-50/10">
      <div className="max-w-4xl w-full mx-auto px-6 py-12">
        <style>{`
        @keyframes naughtyCatFall {
          0% { transform: translateY(-130%) rotate(-5deg); opacity: 0; }
          10% { transform: translateY(-130%) rotate(-5deg); opacity: 1; }
          35% { transform: translateY(15%) rotate(10deg); opacity: 1; }
          48% { transform: translateY(140%) rotate(25deg); opacity: 0; }
          100% { transform: translateY(140%) rotate(25deg); opacity: 0; }
        }
        @keyframes scratchReveal {
          0%, 22% { clip-path: inset(0 0 100% 0); opacity: 0; }
          35% { clip-path: inset(0 0 0 0); opacity: 1; }
          75% { opacity: 1; }
          85% { opacity: 0; }
          100% { opacity: 0; }
        }
        .naughty-cat {
          animation: naughtyCatFall 5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .scratch-mark {
          animation: scratchReveal 5s ease-out infinite;
          transform: translateY(-85px) scaleX(0.22);
        }
      `}</style>

      {/* Main Title & Subtitle styled to match other sections */}
      <div className="space-y-5 text-center mb-10">
        <div className="reveal-item stagger-1 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#2ec4b6] rotate-45 flex-shrink-0" />
          <span className="text-[10px] font-black tracking-[0.25em] text-[#2ec4b6] uppercase">
            Cognitive Translation
          </span>
        </div>
        <h2 className="reveal-item stagger-2 text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase max-w-3xl mx-auto">
          WHY IS MY CAT LIKE THIS?
        </h2>
        <p className="reveal-item stagger-3 text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          Ask "why does my cat do X?" — get a vet-informed explanation tailored to your cat's age, breed, and profile. From dead mouse gifts to 3 AM zoomies.
        </p>
      </div>

      <div className="reveal-item stagger-4 bg-[#2ec4b6] p-8 md:p-12 rounded-3xl md:rounded-[40px] text-left text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_50px_rgba(46,196,182,0.18)] relative overflow-hidden group">
        {/* Decorative inner background halo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl pointer-events-none -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-110" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 md:space-y-6 max-w-md">
            <span className="inline-block text-[10px] font-black tracking-widest text-[#e9c46a] uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Behavior Decoder Tool
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-tight">
              Decode Actions Instantly
            </h3>
            <p className="text-xs md:text-sm text-white/90 leading-relaxed font-light">
              Submit vocalizations, body posture, and context to get a vet-informed analysis of your pet's state.
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-5 py-3 rounded-xl text-xs tracking-wider transition-all duration-100
                shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] cursor-pointer"
            >
              GET TO KNOW YOUR CAT BETTER
            </button>
          </div>

          <div className="flex justify-center md:justify-end items-center select-none pointer-events-none pr-2">
            <div className="relative w-32 h-32 md:w-44 md:h-44 overflow-hidden flex items-center justify-center">
              <img 
                src={catScratch} 
                alt="Scratch mark" 
                className="absolute inset-0 w-full h-full object-contain scratch-mark" 
              />
              <img 
                src={naughtyCat} 
                alt="Naughty cat" 
                className="absolute inset-0 w-full h-full object-contain naughty-cat" 
              />
            </div>
          </div>
        </div>
      </div>
      </div>

      <BehaviorModal isOpen={isOpen} onClose={() => setIsOpen(false)} apiBase={apiBase} />
    </section>
  );
}

