import { usePlantScan } from '../../hooks/usePlantScan';

interface HeroProps {
  apiBase: string;
}

export default function Hero({ apiBase }: HeroProps) {
  const { plantQuery, setPlantQuery, scanResult, scanLoading, scanError, handleImageUpload, handleTextSearch } = usePlantScan(apiBase);

  return (
    <section id="home" className="w-full pt-10 pb-16 text-center bg-grid-pattern border-b border-slate-200/40" style={{ zoom: 1.25 }}>
      {/* Centered Heading */}
      <div className="max-w-4xl mx-auto px-6 space-y-5">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase max-w-3xl mx-auto">
          YOUR <span className="text-[#e9c46a] drop-shadow-[0_2px_10px_rgba(233,196,106,0.15)]">CAT</span> JUST ATE A <span className="text-[#2ec4b6] drop-shadow-[0_2px_10px_rgba(46,196,182,0.15)]">LEAF</span>. IS IT <span className="text-rose-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.15)]">DANGEROUS</span>?
        </h2>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          PawWiz will tell you immediately before it became an emergency! Plant Toxicity Checker, Feeding guide, and Pregnancy Monitoring, Health Tracker built for furparents!
        </p>
      </div>

      {/* Large Full-width-ready Green Toxicity Search Box */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-12">
        <div className="w-full bg-[#2ec4b6] py-16 md:py-20 px-6 md:px-12 rounded-3xl md:rounded-[56px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_25px_60px_-15px_rgba(46,196,182,0.3)] text-center text-white relative overflow-hidden">
          {/* Subtle graphic accent inside green card */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl pointer-events-none -mr-20 -mt-20" />

          <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 relative z-10">
            Is this Plant Safe to my Cats?
          </h3>

          <form onSubmit={handleTextSearch} className="flex gap-2 bg-white rounded-full p-2.5 shadow-lg mt-6 max-w-2xl mx-auto relative z-10 transition-all duration-300 focus-within:ring-4 focus-within:ring-white/40">
            <input
              type="text"
              placeholder="e.g., Spider Plant"
              value={plantQuery}
              onChange={(e) => setPlantQuery(e.target.value)}
              className="flex-1 text-slate-800 text-sm md:text-base px-6 focus:outline-none placeholder-slate-400 font-semibold"
            />

            <label className="p-3 text-slate-400 hover:text-[#2ec4b6] cursor-pointer rounded-full hover:bg-slate-100 transition-all flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              className="bg-[#e9c46a] hover:bg-[#e2b74c] text-slate-900 rounded-full p-3.5 transition-all duration-300 flex items-center justify-center shadow-md active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
            <div className="mt-8 bg-slate-900/95 backdrop-blur-md text-slate-100 rounded-[28px] border border-slate-800/80 p-6 shadow-2xl animate-fadeIn animate-scaleUp max-w-xl mx-auto text-left relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-50">{scanResult.identifiedPlant}</h4>
                  <span className="text-xs text-slate-400 font-mono italic">{scanResult.scientificName}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${scanResult.isToxic ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                  }`}>
                  {scanResult.isToxic ? 'TOXIC' : 'SAFE'}
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                {scanResult.isToxic && (
                  <p className="text-rose-400 font-semibold flex items-center">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-ping" />
                    Severity: {scanResult.severity}
                  </p>
                )}
                <p className="text-slate-300 font-medium leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">{scanResult.actionRequired}</p>
                {scanResult.clinicalSigns && scanResult.clinicalSigns.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-slate-500 uppercase font-black tracking-widest block mb-2">Expected Clinical Signs:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.clinicalSigns.map((s, i) => (
                        <span key={i} className="bg-slate-800/80 text-xs px-2.5 py-1 rounded-md text-slate-300 border border-slate-700/60 font-medium">{s}</span>
                      ))}
                    </div>
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
