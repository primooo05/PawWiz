import { useState } from 'react';
import DietModal from '../modals/DietModal';
import BehaviorModal from '../modals/BehaviorModal';
import PregnancyModal from '../modals/PregnancyModal';

interface ActivitySectionProps {
  apiBase: string;
}

export default function ActivitySection({ apiBase }: ActivitySectionProps) {
  const [isDietOpen, setIsDietOpen] = useState(false);
  const [isBehaviorOpen, setIsBehaviorOpen] = useState(false);
  const [isPregnancyOpen, setIsPregnancyOpen] = useState(false);

  return (
    <section id="activities" className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-200/40 relative">
      {/* Decorative radial halo behind illustration */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#2ec4b6]/5 rounded-full filter blur-3xl pointer-events-none -z-10" />

      <div className="text-center mb-16">
        <span className="text-xs font-black tracking-widest text-[#2ec4b6] uppercase bg-[#2ec4b6]/10 px-3 py-1 rounded-full">
          Wellness & Play
        </span>
        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
          Enhance Your Cat's Active Life
        </h3>
        <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto mt-2 leading-relaxed font-medium">
          Discover how to pair daily feline activities with PawWiz's computational engines to ensure safety, tracking, and communication.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Card 1: Safe Botanical Exploration */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-[#2ec4b6]/40 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(46,196,182,0.06)] hover:-translate-y-1 text-left flex flex-col justify-between group shadow-sm">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#2ec4b6]/10 rounded-2xl flex items-center justify-center text-xl text-[#2ec4b6] group-hover:scale-110 transition-transform duration-300">
              🌿
            </div>
            <h4 className="text-lg font-bold text-slate-900">Safe Botanical Exploring</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              Curate a stimulating home garden. Scan any house plants before play sessions so your cat can explore a safe green environment free of toxic hazards.
            </p>
          </div>
          <a
            href="#home"
            className="text-xs font-black text-[#2ec4b6] hover:text-[#259b90] mt-8 inline-flex items-center transition-colors"
          >
            Scan Plants Now <span className="ml-1 transition-transform group-hover:translate-x-1 duration-300">➜</span>
          </a>
        </div>

        {/* Card 2: Interactive Food Puzzles */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-[#e9c46a]/40 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(233,196,106,0.06)] hover:-translate-y-1 text-left flex flex-col justify-between group shadow-sm">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#e9c46a]/15 rounded-2xl flex items-center justify-center text-xl text-[#e9c46a] group-hover:scale-110 transition-transform duration-300">
              🧩
            </div>
            <h4 className="text-lg font-bold text-slate-900">Food Puzzle Optimization</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              Pair active play with calorie tracking. Calculate the perfect daily caloric matrix to stuff into interactive food puzzles and trigger their hunting instincts.
            </p>
          </div>
          <button
            onClick={() => setIsDietOpen(true)}
            className="text-xs font-black text-[#e9c46a] hover:text-[#d4af37] mt-8 text-left inline-flex items-center transition-colors cursor-pointer"
          >
            Optimize Calories <span className="ml-1 transition-transform group-hover:translate-x-1 duration-300">➜</span>
          </button>
        </div>

        {/* Card 3: Decoding Zoomies & Moods */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-[#2ec4b6]/40 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(46,196,182,0.06)] hover:-translate-y-1 text-left flex flex-col justify-between group shadow-sm">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#2ec4b6]/10 rounded-2xl flex items-center justify-center text-xl text-[#2ec4b6] group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
            <h4 className="text-lg font-bold text-slate-900">Decode Play Boundaries</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              Understand the difference between playful zoomies and boundary warnings. Translate somatic postures and tail twitches during play in real-time.
            </p>
          </div>
          <button
            onClick={() => setIsBehaviorOpen(true)}
            className="text-xs font-black text-[#2ec4b6] hover:text-[#259b90] mt-8 text-left inline-flex items-center transition-colors cursor-pointer"
          >
            Translate Posture <span className="ml-1 transition-transform group-hover:translate-x-1 duration-300">➜</span>
          </button>
        </div>

        {/* Card 4: Gentle Prenatal Play */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-violet-300 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(167,139,250,0.06)] hover:-translate-y-1 text-left flex flex-col justify-between group shadow-sm">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-xl text-violet-400 group-hover:scale-110 transition-transform duration-300">
              🧶
            </div>
            <h4 className="text-lg font-bold text-slate-900">Gentle Prenatal Care</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              Scale down high-intensity jump play to low-impact nesting and grooming routines as your queen approaches her calculated gestational due date.
            </p>
          </div>
          <button
            onClick={() => setIsPregnancyOpen(true)}
            className="text-xs font-black text-violet-400 hover:text-violet-500 mt-8 text-left inline-flex items-center transition-colors cursor-pointer"
          >
            Calculate Milestones <span className="ml-1 transition-transform group-hover:translate-x-1 duration-300">➜</span>
          </button>
        </div>
      </div>

      {/* Modal overlays triggered by these cards */}
      <DietModal isOpen={isDietOpen} onClose={() => setIsDietOpen(false)} apiBase={apiBase} />
      <BehaviorModal isOpen={isBehaviorOpen} onClose={() => setIsBehaviorOpen(false)} apiBase={apiBase} />
      <PregnancyModal isOpen={isPregnancyOpen} onClose={() => setIsPregnancyOpen(false)} />
    </section>
  );
}
