import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlantScan } from '../../hooks/usePlantScan';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface HeroProps {
  apiBase: string;
}

export default function Hero({ apiBase }: HeroProps) {
  const { plantQuery, setPlantQuery, scanResult, scanLoading, scanError, handleImageUpload, handleTextSearch } = usePlantScan(apiBase);
  const sectionRef = useScrollReveal<HTMLElement>(0.08);
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateOut?: boolean })?.animateOut
  );

  useEffect(() => {
    if ((location.state as { animateOut?: boolean })?.animateOut) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <section ref={sectionRef} id="home" className="scroll-mt-20 w-full pt-24 md:pt-28 pb-16 text-center bg-grid-pattern border-b border-slate-200/40 relative">
      {/* Transition circles scaling down on landing entry */}
      <div className={`fixed inset-0 pointer-events-none z-[9999] overflow-hidden transition-opacity duration-300 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`w-64 h-64 md:w-80 md:h-80 bg-[#2ec4b6] rounded-full absolute -top-16 -left-16 transition-transform duration-[2000ms] ease-in-out origin-top-left ${isTransitioning ? 'scale-[8]' : 'scale-0'}`} />
        <div className={`w-24 h-24 md:w-32 md:h-32 bg-[#2ec4b6] rounded-full absolute -top-8 -right-8 transition-transform duration-[2000ms] ease-in-out origin-top-right ${isTransitioning ? 'scale-[12]' : 'scale-0'}`} />
        <div className={`w-72 h-72 md:w-96 md:h-96 bg-[#2ec4b6] rounded-full absolute -bottom-24 -right-24 transition-transform duration-[2000ms] ease-in-out origin-bottom-right ${isTransitioning ? 'scale-[8]' : 'scale-0'}`} />
      </div>
      {/* Centered Heading */}
      <div className="max-w-4xl mx-auto px-6 space-y-5">
        <h2 className="reveal-item stagger-1 text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase max-w-3xl mx-auto">
          YOUR <span className="text-[#e9c46a] drop-shadow-[0_2px_10px_rgba(233,196,106,0.15)]">CAT</span> JUST ATE A <span className="text-[#2ec4b6] drop-shadow-[0_2px_10px_rgba(46,196,182,0.15)]">LEAF</span>. IS IT <span className="text-rose-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.15)]">DANGEROUS</span>?
        </h2>
        <p className="reveal-item stagger-2 text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          PawWiz will tell you immediately before it became an emergency! Plant Toxicity Checker, Feeding guide, and Pregnancy Monitoring, Health Tracker built for furparents!
        </p>
      </div>

      {/* Large Full-width-ready Green Toxicity Search Box */}
      <div className="reveal-item stagger-3 max-w-5xl mx-auto px-4 md:px-6 mt-12">
        <div className="w-full bg-[#2ec4b6] py-16 md:py-20 px-6 md:px-12 rounded-3xl md:rounded-[56px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_25px_60px_-15px_rgba(46,196,182,0.3)] text-center text-white relative overflow-hidden">
          {/* Subtle graphic accent inside green card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl pointer-events-none -mr-20 -mt-20" />

          <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 relative z-10">
            Is this Plant Safe to my Cats?
          </h3>

          <form onSubmit={handleTextSearch} className="mt-6 max-w-2xl mx-auto relative z-10 flex flex-col sm:flex-row gap-3">
            {/* Input + icon row */}
            <div className="flex-1 flex gap-2 bg-white rounded-full p-2 shadow-lg transition-all duration-300 focus-within:ring-4 focus-within:ring-white/40">
              <input
                type="text"
                placeholder="e.g., Spider Plant"
                value={plantQuery}
                onChange={(e) => setPlantQuery(e.target.value)}
                className="flex-1 text-slate-800 text-sm px-4 focus:outline-none placeholder-slate-400 font-semibold min-w-0"
              />
              <label className="shrink-0 p-2.5 text-slate-400 hover:text-[#2ec4b6] cursor-pointer rounded-full hover:bg-slate-100 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {/* Submit button — full width on mobile, icon-only on sm+ */}
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#e9c46a] text-slate-900 rounded-full py-3.5 px-6 sm:p-3.5 flex items-center justify-center gap-2 font-extrabold text-xs tracking-wider
                shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px]
                hover:bg-[#f0cc74] transition-all duration-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="sm:hidden">SEARCH</span>
            </button>
          </form>

          <p className="text-xs md:text-sm text-white/95 mt-6 leading-relaxed font-light max-w-3xl mx-auto relative z-10">
            Search by name or snap a photo. Get an instant safe / caution / toxic verdict, severity level, and symptoms to watch for — pulled from ASPCA's Animal Poison Control database, verified quarterly.
          </p>

          {scanLoading && (
            <div className="mt-8 flex items-center justify-center space-x-3 bg-white/10 p-4 rounded-full max-w-md mx-auto border border-white/15 backdrop-blur-sm animate-pulse relative z-10">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-sm font-semibold">Running ASPCA validation loop...</span>
            </div>
          )}

          {scanError && (
            <div className="mt-8 bg-rose-500/20 border border-rose-500/30 p-4 rounded-2xl text-xs text-rose-100 max-w-md mx-auto relative z-10">
              {scanError}
            </div>
          )}

          {scanResult && (
            <div className="mt-6 relative z-10 max-w-2xl mx-auto w-full animate-fadeIn px-1">
              <div className={`rounded-2xl border backdrop-blur-md overflow-hidden ${
                scanResult.isToxic
                  ? 'bg-rose-950/90 border-rose-700/50'
                  : 'bg-emerald-950/90 border-emerald-700/50'
              }`}>
                {/* Row 1: badge + plant name + severity */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
                  <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    scanResult.isToxic ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                  }`}>
                    {scanResult.isToxic ? '⚠ TOXIC' : '✓ SAFE'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-white text-sm leading-tight truncate">{scanResult.identifiedPlant}</p>
                    {scanResult.scientificName && (
                      <p className="text-[10px] text-white/50 font-mono italic truncate">{scanResult.scientificName}</p>
                    )}
                  </div>
                  {scanResult.isToxic && scanResult.severity && (
                    <span className="shrink-0 text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded-md border border-rose-700/40">
                      {scanResult.severity}
                    </span>
                  )}
                </div>

                {/* Row 2: action text */}
                <div className="px-4 py-3">
                  <p className="text-xs text-white/85 leading-relaxed">{scanResult.actionRequired}</p>
                </div>

                {/* Row 3: clinical signs */}
                {scanResult.clinicalSigns && scanResult.clinicalSigns.length > 0 && (
                  <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                    {scanResult.clinicalSigns.slice(0, 5).map((s, i) => (
                      <span key={i} className="bg-white/10 text-white/75 text-[10px] px-2 py-0.5 rounded-full border border-white/10 font-medium">{s}</span>
                    ))}
                    {scanResult.clinicalSigns.length > 5 && (
                      <span className="text-[10px] text-white/40 self-center">+{scanResult.clinicalSigns.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
