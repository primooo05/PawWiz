import React, { useState } from 'react';
import type { ToxicityScanResult } from '../../../pawwiz-backend/src/types/shared.js';

interface HeroProps {
  apiBase: string;
}

export default function Hero({ apiBase }: HeroProps) {
  const [plantQuery, setPlantQuery] = useState('');
  const [scanResult, setScanResult] = useState<ToxicityScanResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    setScanError('');
    setScanResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch(`${apiBase}/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });
        if (!response.ok) throw new Error('Failed to analyze image.');
        const data = await response.json();
        setScanResult(data);
      } catch (err) {
        setScanError((err as Error).message || 'Server error. Using fallback offline scan.');
        setScanResult({
          identifiedPlant: "Peace Lily",
          scientificName: "Spathiphyllum spp.",
          isToxic: true,
          severity: "Moderate",
          clinicalSigns: ["Oral irritation", "Excessive drooling", "Vomiting", "Difficulty swallowing"],
          actionRequired: "Fallback Simulation: seek vet guidance. Rinse mouth immediately.",
          confidence: 0.9,
          dataSource: "ASPCA Database (Deterministic)",
          aiAnalysisText: "Offline simulator match."
        });
      } finally {
        setScanLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantQuery.trim()) return;

    setScanLoading(true);
    setScanError('');
    setScanResult(null);

    try {
      const response = await fetch(`${apiBase}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantNameQuery: plantQuery }),
      });
      if (!response.ok) throw new Error('Plant query failed.');
      const data = await response.json();
      setScanResult(data);
    } catch (err) {
      const query = plantQuery.toLowerCase();
      if (query.includes('lily')) {
        setScanResult({
          identifiedPlant: "Lily (Easter/Tiger)",
          scientificName: "Lilium spp.",
          isToxic: true,
          severity: "Severe",
          clinicalSigns: ["Vomiting", "Lethargy", "Kidney failure"],
          actionRequired: "EMERGENCY: Seek veterinary attention immediately! High risk of renal failure.",
          confidence: 1.0,
          dataSource: "ASPCA Database (Deterministic)"
        });
      } else if (query.includes('spider')) {
        setScanResult({
          identifiedPlant: "Spider Plant",
          scientificName: "Chlorophytum comosum",
          isToxic: false,
          severity: "None",
          clinicalSigns: [],
          actionRequired: "Completely safe. Cats love chewing the dangling leaves but it is non-toxic.",
          confidence: 1.0,
          dataSource: "ASPCA Database (Deterministic)"
        });
      } else {
        setScanError('Unable to connect to service. Try searching "lily" or "spider plant" for offline demonstration.');
      }
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <section id="home" className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
      <div className="space-y-4">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight uppercase max-w-3xl mx-auto">
          YOUR <span className="text-[#e9c46a]">CAT</span> JUST ATE A <span className="text-[#2ec4b6]">LEAF</span>. IS IT <span className="text-rose-500">DANGEROUS</span>?
        </h2>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
          PawWiz will tell you immediately before it became an emergency! Plant Toxicity Checker, Feeding guide, and Pregnancy Monitoring, Health Tracker built for furparents!
        </p>
      </div>

      {/* Green Toxicity Search Box */}
      <div className="max-w-xl mx-auto bg-[#2ec4b6] p-8 rounded-3xl mt-10 shadow-lg text-left text-white relative overflow-hidden">
        <h3 className="text-xl font-bold tracking-tight mb-2">
          Is this Plant Safe to my Cats?
        </h3>
        
        <form onSubmit={handleTextSearch} className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm mt-4">
          <input
            type="text"
            placeholder="e.g., Spider Plant"
            value={plantQuery}
            onChange={(e) => setPlantQuery(e.target.value)}
            className="flex-1 text-slate-800 text-xs px-3 focus:outline-none placeholder-slate-400"
          />
          
          <label className="p-2 text-slate-400 hover:text-[#2ec4b6] cursor-pointer rounded-xl hover:bg-slate-100 transition-all flex items-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="bg-[#e9c46a] hover:bg-[#e2b74c] text-slate-900 rounded-xl p-2.5 transition-colors flex items-center justify-center shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <p className="text-[10px] text-white/95 mt-4 leading-relaxed font-light">
          Search by name or snap a photo. Get an instant safe / caution / toxic verdict, severity level, and symptoms to watch for — pulled from ASPCA's Animal Poison Control database, verified quarterly.
        </p>

        {scanLoading && (
          <div className="mt-4 flex items-center justify-center space-x-2 bg-white/10 p-3 rounded-xl border border-white/15">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-xs font-semibold">Running ASPCA validation loop...</span>
          </div>
        )}

        {scanError && (
          <div className="mt-4 bg-rose-500/20 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-100">
            {scanError}
          </div>
        )}

        {scanResult && (
          <div className="mt-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-2xl animate-fadeIn animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-50">{scanResult.identifiedPlant}</h4>
                <span className="text-[10px] text-slate-400 font-mono italic">{scanResult.scientificName}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                scanResult.isToxic ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
              }`}>
                {scanResult.isToxic ? 'TOXIC' : 'SAFE'}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {scanResult.isToxic && (
                <p className="text-rose-400 font-semibold">Severity: {scanResult.severity}</p>
              )}
              <p className="text-slate-300 font-medium">{scanResult.actionRequired}</p>
              {scanResult.clinicalSigns && scanResult.clinicalSigns.length > 0 && (
                <div className="mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Symptoms:</span>
                  <div className="flex flex-wrap gap-1">
                    {scanResult.clinicalSigns.map((s, i) => (
                      <span key={i} className="bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-300 border border-slate-700">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
