import { useState } from 'react';
import BehaviorModal from '../modals/BehaviorModal';

interface BehaviorSectionProps {
  apiBase: string;
}

export default function BehaviorSection({ apiBase }: BehaviorSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="behavior" className="w-full min-h-screen flex items-center justify-center border-b border-slate-100 relative bg-gradient-to-br from-slate-50/50 via-white to-amber-50/10">
      <div className="max-w-4xl w-full mx-auto px-6 py-12">
        <style>{`
        @keyframes catSway {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        .cat-mascot {
          animation: catSway 4s ease-in-out infinite;
        }
      `}</style>

      {/* Main Title & Subtitle styled to match other sections */}
      <div className="space-y-5 text-center mb-10">
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#2ec4b6] rotate-45 flex-shrink-0" />
          <span className="text-[10px] font-black tracking-[0.25em] text-[#2ec4b6] uppercase">
            Cognitive Translation
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase max-w-3xl mx-auto">
          WHY IS MY CAT LIKE THIS?
        </h2>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          Ask "why does my cat do X?" — get a vet-informed explanation tailored to your cat's age, breed, and profile. From dead mouse gifts to 3 AM zoomies.
        </p>
      </div>

      <div className="bg-[#2ec4b6] p-8 md:p-12 rounded-3xl md:rounded-[40px] text-left text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_50px_rgba(46,196,182,0.18)] relative overflow-hidden group">
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

          <div className="flex justify-center md:justify-end items-center cat-mascot select-none pointer-events-none pr-2">
            <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-36 md:h-36 drop-shadow-lg">
              {/* Ears */}
              <path d="M 20 40 L 10 15 L 40 30 Z" fill="#e9c46a" />
              <path d="M 25 38 L 17 20 L 37 31 Z" fill="#f4a261" />
              <path d="M 80 40 L 90 15 L 60 30 Z" fill="#e9c46a" />
              <path d="M 75 38 L 83 20 L 63 31 Z" fill="#f4a261" />
              {/* Head */}
              <ellipse cx="50" cy="55" rx="38" ry="32" fill="#e9c46a" />
              {/* Inner face details: Eyes */}
              <circle cx="38" cy="50" r="5" fill="#2d3748" />
              <circle cx="38" cy="48" r="1.5" fill="white" />
              <circle cx="62" cy="50" r="5" fill="#2d3748" />
              <circle cx="62" cy="48" r="1.5" fill="white" />
              {/* Blush */}
              <ellipse cx="28" cy="58" rx="5" ry="3" fill="#f4a261" opacity="0.6" />
              <ellipse cx="72" cy="58" rx="5" ry="3" fill="#f4a261" opacity="0.6" />
              {/* Nose */}
              <polygon points="48,58 52,58 50,60" fill="#2d3748" />
              {/* Mouth */}
              <path d="M 46 63 Q 48 65 50 63 Q 52 65 54 63" stroke="#2d3748" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Whiskers */}
              <line x1="15" y1="56" x2="3" y2="54" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="15" y1="60" x2="2" y2="60" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="85" y1="56" x2="97" y2="54" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="85" y1="60" x2="98" y2="60" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
        </div>
      </div>
      </div>

      <BehaviorModal isOpen={isOpen} onClose={() => setIsOpen(false)} apiBase={apiBase} />
    </section>
  );
}

