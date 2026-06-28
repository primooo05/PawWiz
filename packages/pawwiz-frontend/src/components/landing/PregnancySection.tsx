import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PregnancyModal from '../modals/PregnancyModal';
import { useModalToggle } from '../../hooks/useModalToggle';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useProfilePanel, type ProfileData } from '../../hooks/useProfilePanel';

interface GestationWeekDetail {
  week: number;
  phase: string;
  summary: string;
  checklist: string[];
}

// Custom plain paw SVG icon layout
const PlainPawIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6.5" cy="11.5" r="2" />
    <circle cx="10" cy="7.5" r="2" />
    <circle cx="14" cy="7.5" r="2" />
    <circle cx="17.5" cy="11.5" r="2" />
    <path d="M7.5 17c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4c0 1.5-1.5 2.5-4.5 2.5s-4.5-1-4.5-2.5z" />
  </svg>
);

const WEEKS: GestationWeekDetail[] = [
  {
    week: 1,
    phase: "Fertilization",
    summary: "Fertilization occurs. Blastocysts begin traveling to the uterine horns.",
    checklist: ["Maintain standard nutrient intake", "Minimize sudden environment shifts", "Avoid any vaccinations/medications"]
  },
  {
    week: 2,
    phase: "Migration",
    summary: "Embryos migrate into the uterine horns. Maintain peaceful routine.",
    checklist: ["Gentle handling only", "Monitor regular behavior patterns", "Stable meal schedules"]
  },
  {
    week: 3,
    phase: "Implantation",
    summary: "Embryos implant in uterine wall. Look for nipple pinking-up.",
    checklist: ["Check nipples for pinking-up", "Monitor for minor morning sickness", "Ensure warm, cozy sleep zones"]
  },
  {
    week: 4,
    phase: "Organogenesis",
    summary: "Embryos limbs and face forming. Ultrasonic heartbeat is detectable.",
    checklist: ["Palpation window open (vets)", "Hear heartbeat via ultrasound scan", "Begin adding nutrient dense food"]
  },
  {
    week: 5,
    phase: "Fetal Swell",
    summary: "Belly visibly rounding. Time to switch to kitten food.",
    checklist: ["Switch to calcium-rich kitten food", "Feed smaller, frequent portions", "Provide comfortable floor mats"]
  },
  {
    week: 6,
    phase: "Rapid Growth",
    summary: "Kittens double size. Avoid lifting queen by the abdomen.",
    checklist: ["Do not lift cat by abdomen", "Double clean the litterbox daily", "Provide comfortable rest spaces"]
  },
  {
    week: 7,
    phase: "Calcification",
    summary: "Cartilage turns to bone structure. Milk glands enlarging.",
    checklist: ["Restrict high jumping/climbing", "Keep nesting area quiet", "Ensure optimal calcium levels"]
  },
  {
    week: 8,
    phase: "Nesting Search",
    summary: "Milk gland development. The queen searches for nest spots.",
    checklist: ["Introduce the queening box", "Add clean dry towels in nest box", "Confirm vet emergency numbers"]
  },
  {
    week: 9,
    phase: "Kittening Near",
    summary: "Labor readiness. Drop in temperature suggests birth within 24h.",
    checklist: ["Track core temperature drops", "Allow total nesting privacy", "Have delivery dry-kits ready"]
  }
];

export default function PregnancySection() {
  const { isOpen, open, close } = useModalToggle();
  const [activeWeek, setActiveWeek] = useState<number>(5);
  const sectionRef = useScrollReveal<HTMLElement>();
  const location = useLocation();
  const locationState = location.state as { displayName?: string; catName?: string } | null;
  const optimisticData = locationState?.displayName && locationState?.catName
    ? { displayName: locationState.displayName, catName: locationState.catName }
    : undefined;
  const { profile, isLoading, isAuthenticated } = useProfilePanel(optimisticData);

  const currentWeekData = WEEKS.find(w => w.week === activeWeek) || WEEKS[4];

  return (
    <section ref={sectionRef} id="monitoring" className="scroll-mt-20 w-full min-h-screen flex items-center justify-center border-b border-slate-100 relative bg-[#faf9f6] overflow-hidden">
      
      <div className="max-w-5xl w-full mx-auto px-8 py-16 grid md:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Typography, Indented Stats, and Buttons */}
        <div className="space-y-8 text-left">
          {/* Eyebrow tag (Editorial Japanese-minimalist style) */}
          <div className="reveal-item stagger-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#2ec4b6] rotate-45 flex-shrink-0" />
            <span className="text-[10px] font-black tracking-[0.25em] text-[#2ec4b6] uppercase">
              LIFECYCLE TRACKING
            </span>
          </div>

          {/* Heading with inline custom SVG paw icon */}
          <h3 className="reveal-item stagger-2 text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
            <span>Monitor your Cat Pregnancy</span>
            <PlainPawIcon className="w-6 h-6 text-[#2ec4b6] flex-shrink-0 align-middle inline" />
          </h3>

          {/* Paragraph description */}
          <p className="reveal-item stagger-3 text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
            From mating to kittening, monitor and track every stage of your cat's pregnancy with a prep guide! Calculate progress, track milestones, and receive tailored warnings.
          </p>

          {/* Horizontal stat row (Indented slightly for genuine asymmetry) */}
          <div className="reveal-item stagger-4 flex items-center gap-6 border-y border-slate-200/50 py-4 max-w-md ml-4 md:ml-6">
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">63–67 days</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Gestation Period</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">9 weeks total</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Total Time</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="flex-1">
              <span className="text-lg md:text-xl font-sans font-black text-slate-900 tracking-tight tabular-nums block">1–6 kittens avg</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Average Litter</span>
            </div>
          </div>

          {/* Profile Panel */}
          <ProfilePanel profile={profile} isLoading={isLoading} isAuthenticated={isAuthenticated} />

          {/* Button Row */}
          <div className="reveal-item stagger-5 flex flex-wrap items-center gap-4">
            <button
              onClick={open}
              className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-8 py-3.5 rounded-full text-xs tracking-widest transition-all duration-100
                shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px] cursor-pointer"
            >
              GET STARTED
            </button>
            <button
              onClick={open}
              className="bg-transparent hover:bg-slate-100 border border-slate-200 text-slate-900 font-extrabold px-6 py-3.5 rounded-full text-xs tracking-widest transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>See weekly milestones</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column: WEEK PROGRESS PREVIEW Card (Clean journal dashboard format without visual box) */}
        <div className="reveal-item stagger-6 relative w-full max-w-sm mx-auto transform rotate-1 md:-rotate-2 md:translate-y-12 z-20 transition-all duration-500 hover:rotate-0 hover:scale-[1.02]">
          {/* Behind/around the card: one soft blurred color blob (teal, 15% opacity, ~200px, bottom-right) */}
          <div className="absolute -right-16 -bottom-16 w-[200px] h-[200px] bg-[#2ec4b6]/15 rounded-full filter blur-3xl pointer-events-none -z-10" />

          {/* Main Card (Pale Teal Tint Background) */}
          <div className="bg-[#f0faf9] rounded-3xl border border-[#2ec4b6]/15 p-6 md:p-8 shadow-[0_10px_30px_rgba(46,196,182,0.04)] flex flex-col justify-between min-h-[380px] text-left relative z-10">
            
            {/* Header: Selected state info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-[#2ec4b6]/10 pb-3">
                <span>Gestation Track</span>
                <span className="text-[#2ec4b6]">WEEK {activeWeek}/9</span>
              </div>
              
              <div className="pt-2">
                <span className="text-[9px] font-black text-[#2ec4b6] uppercase tracking-wider block">Active Development Phase</span>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-1">{currentWeekData.phase}</h4>
              </div>
            </div>

            {/* Horizontal progress track with custom illustrated paw-print tick markers */}
            <div className="border-t border-[#2ec4b6]/10 pt-6 my-6 relative">
              <div className="relative flex justify-between items-center w-full px-1 z-10">
                {/* Horizontal Background Line (Rectangular Progress Bar) */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-slate-200/60 -z-10" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-[#2ec4b6] -z-10 transition-all duration-300"
                  style={{ width: `${((activeWeek - 1) / 8) * 100}%` }}
                />

                {/* 9 Tick Markers (Custom Illustrated Paw Prints) */}
                {Array.from({ length: 9 }).map((_, idx) => {
                  const weekNum = idx + 1;
                  
                  const isHighlighted = activeWeek === weekNum;
                  const isBefore = weekNum < activeWeek;

                  return (
                    <div key={weekNum} className="relative flex flex-col items-center">
                      <button
                        onClick={() => setActiveWeek(weekNum)}
                        className={`flex items-center justify-center focus:outline-none transition-all duration-300 ${
                          isHighlighted
                            ? 'scale-130 z-20 text-[#2ec4b6] drop-shadow-[0_2px_6px_rgba(46,196,182,0.3)]'
                            : isBefore
                            ? 'text-[#2ec4b6]/80 scale-100 z-10'
                            : 'text-slate-300 hover:text-slate-400 scale-90 z-10'
                        }`}
                        title={`Week ${weekNum}`}
                      >
                        <PlainPawIcon className="w-4 h-4" />
                      </button>
                      
                      {isHighlighted && (
                        <span className="absolute top-6 whitespace-nowrap text-[9px] font-black text-[#e9c46a] uppercase tracking-wider bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">
                          You are here
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Below the track: a small text block showing what's happening at the highlighted week */}
            <div className="pt-2">
              <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                <span className="font-extrabold text-slate-900 mr-1.5">Week {activeWeek} –</span>
                {currentWeekData.summary}
              </p>
            </div>

            {/* Care Guide checklist tailored to the active week */}
            <div className="mt-6 pt-4 border-t border-[#2ec4b6]/10 space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Action Guide Checklist</span>
              <div className="space-y-2">
                {currentWeekData.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-bold leading-normal">
                    <PlainPawIcon className="w-3.5 h-3.5 text-[#2ec4b6] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      <PregnancyModal isOpen={isOpen} onClose={close} />
    </section>
  );
}

function ProfilePanel({ profile, isLoading, isAuthenticated }: {
  profile: ProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}) {
  if (isLoading) {
    return <div className="w-full h-20 rounded-xl bg-slate-100 animate-pulse" />;
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="rounded-xl border border-[#2ec4b6]/20 bg-[#f0faf9] p-4 text-sm">
        <p className="font-bold text-slate-700">Track your cat's pregnancy journey</p>
        <a href="/register" className="mt-2 inline-block text-[#2ec4b6] font-extrabold underline text-xs">
          Create your free profile →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#2ec4b6]/20 bg-[#f0faf9] p-4 space-y-1">
      <p className="text-xs font-black text-[#2ec4b6] uppercase tracking-wider">Your Cat's Profile</p>
      <p className="font-extrabold text-slate-900">{profile.catName}</p>
      {profile.catBreed && <p className="text-sm text-slate-600">{profile.catBreed}</p>}
      <p className="text-xs text-slate-500">{profile.catLifeStage} · owned by {profile.displayName}</p>
    </div>
  );
}
