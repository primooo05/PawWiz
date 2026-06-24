import React, { useState } from 'react';
import type { ToxicityScanResult, DietPlan, BehaviorDecodeResponse } from '../../pawwiz-backend/src/types/shared.js';

// Smart api base detection
const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'diet' | 'behavior'>('scan');

  // Scanner States
  const [plantQuery, setPlantQuery] = useState('');
  const [scanResult, setScanResult] = useState<ToxicityScanResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  // Diet Optimizer States
  const [weight, setWeight] = useState<number>(4.5);
  const [age, setAge] = useState<number>(3);
  const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [dietLoading, setDietLoading] = useState(false);

  // Behavioral Decoder States
  const [vocal, setVocal] = useState('');
  const [bodySigns, setBodySigns] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [decodeResult, setDecodeResult] = useState<BehaviorDecodeResponse | null>(null);
  const [decodeLoading, setDecodeLoading] = useState(false);

  // Handle Plant Image Upload
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
        const response = await fetch(`${API_BASE}/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });
        if (!response.ok) throw new Error('Failed to analyze image.');
        const data = await response.json();
        setScanResult(data);
      } catch (err) {
        setScanError((err as Error).message || 'Server error. Is the backend running?');
      } finally {
        setScanLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Plant Text Search
  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantQuery.trim()) return;

    setScanLoading(true);
    setScanError('');
    setScanResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantNameQuery: plantQuery }),
      });
      if (!response.ok) throw new Error('Plant query failed.');
      const data = await response.json();
      setScanResult(data);
    } catch (err) {
      setScanError((err as Error).message || 'Server connection error.');
    } finally {
      setScanLoading(false);
    }
  };

  // Handle Diet Optimization
  const handleCalculateDiet = async () => {
    setDietLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: weight,
          ageYears: age,
          activityLevel: activity,
          healthConditions: selectedConditions.length > 0 ? selectedConditions : ['none'],
        }),
      });
      if (!response.ok) throw new Error('Diet calculation failed.');
      const data = await response.json();
      setDietPlan(data);
    } catch (err) {
      alert('Error calculating diet: ' + (err as Error).message);
    } finally {
      setDietLoading(false);
    }
  };

  // Handle Behavior Decoding
  const handleDecodeBehavior = async () => {
    setDecodeLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/behavior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocalDescription: vocal || 'Quiet / No sound',
          bodyLanguageSigns: bodySigns.length > 0 ? bodySigns : ['Relaxed tail posture'],
          context: context || 'General rest',
        }),
      });
      if (!response.ok) throw new Error('Decoding failed.');
      const data = await response.json();
      setDecodeResult(data);
    } catch (err) {
      alert('Error decoding behavior: ' + (err as Error).message);
    } finally {
      setDecodeLoading(false);
    }
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const toggleBodySign = (sign: string) => {
    setBodySigns(prev =>
      prev.includes(sign) ? prev.filter(s => s !== sign) : [...prev, sign]
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased pb-12">
      {/* Header Banner */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐾</span>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400">
              PawWiz
            </h1>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full animate-pulse">
            EMERGENCY READY
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 mt-6">
        {/* Quick Intro */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-50">Feline Utility Engine</h2>
          <p className="text-sm text-slate-400 mt-1">High-precision tools for toxicity, diet, & behavior</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800/80">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'scan'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚨 Toxicity Scan
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'diet'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🥗 Diet Optimize
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'behavior'
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💬 Behavior Decode
          </button>
        </div>

        {/* =================== TOXICITY SCAN TAB =================== */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {/* Control Panel */}
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl shadow-xl">
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center">
                <span className="mr-1.5">📷</span> Scan or Search Plant
              </h3>
              
              {/* Photo Upload */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 hover:border-rose-500 bg-slate-900/60 cursor-pointer p-6 rounded-xl transition-all group">
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📸</span>
                <span className="text-xs font-semibold text-rose-400 group-hover:text-rose-300">Take Photo / Upload Plant Image</span>
                <span className="text-[10px] text-slate-500 mt-1">Identifies with Gemini Pro Vision</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-700 w-full"></div>
                <span className="absolute bg-slate-800 px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500">OR</span>
              </div>

              {/* Text Search Form */}
              <form onSubmit={handleTextSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter plant name (e.g. Sago Palm, Lily)..."
                  value={plantQuery}
                  onChange={(e) => setPlantQuery(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={scanLoading}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold px-4 rounded-xl text-xs transition-colors"
                >
                  Lookup
                </button>
              </form>
            </div>

            {/* Loading Indicator */}
            {scanLoading && (
              <div className="flex flex-col items-center py-10 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                <span className="text-xs text-slate-400 mt-3 font-medium">Analyzing plant attributes...</span>
              </div>
            )}

            {/* Error Message */}
            {scanError && (
              <div className="bg-red-900/30 border border-red-500/40 p-4 rounded-xl text-xs text-red-300">
                <strong>Error:</strong> {scanError}
              </div>
            )}

            {/* Toxicity Results Panel */}
            {scanResult && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                {/* Header Banner depending on toxicity */}
                <div className={`p-4 flex items-center justify-between ${
                  scanResult.isToxic ? 'bg-rose-500/10 border-b border-rose-500/20' : 'bg-emerald-500/10 border-b border-emerald-500/20'
                }`}>
                  <div>
                    <h4 className="font-bold text-base text-slate-50">{scanResult.identifiedPlant}</h4>
                    <span className="text-xs text-slate-400 italic font-mono">{scanResult.scientificName}</span>
                  </div>
                  <span className={`px-3 py-1 text-xs font-black tracking-wider uppercase rounded-full ${
                    scanResult.isToxic 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {scanResult.isToxic ? 'TOXIC ⚠️' : 'SAFE ✅'}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Severity Badge */}
                  {scanResult.isToxic && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-400">Severity:</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        scanResult.severity === 'Severe' ? 'bg-red-500 text-white' :
                        scanResult.severity === 'Moderate' ? 'bg-amber-500 text-slate-900' :
                        'bg-yellow-500 text-slate-900'
                      }`}>
                        {scanResult.severity}
                      </span>
                    </div>
                  )}

                  {/* Immediate Action Needed */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">IMMEDIATE ACTION PLAN</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{scanResult.actionRequired}</p>
                  </div>

                  {/* Clinical Signs */}
                  {scanResult.clinicalSigns && scanResult.clinicalSigns.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">EXPECTED CLINICAL SIGNS</span>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.clinicalSigns.map((sign, idx) => (
                          <span key={idx} className="bg-slate-900 text-slate-300 border border-slate-800 text-[11px] px-2.5 py-1 rounded-md">
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Metadata and Confidence */}
                  <div className="border-t border-slate-700/60 pt-4 flex flex-col space-y-2 text-[10px] text-slate-500">
                    <div className="flex justify-between">
                      <span>Source Authority:</span>
                      <span className="font-semibold text-slate-300">{scanResult.dataSource}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Match Confidence:</span>
                      <span className="font-semibold text-slate-300">{Math.round(scanResult.confidence * 100)}%</span>
                    </div>
                    {scanResult.aiAnalysisText && (
                      <div className="bg-slate-900/40 p-2.5 rounded-lg mt-2 text-slate-400 italic">
                        &ldquo;{scanResult.aiAnalysisText}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== DIET OPTIMIZER TAB =================== */}
        {activeTab === 'diet' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl shadow-xl space-y-5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center">
                <span className="mr-1.5">🥗</span> Configure Feline Profile
              </h3>

              {/* Weight Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Weight:</span>
                  <span className="font-bold text-teal-400">{weight.toFixed(1)} kg</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              {/* Age Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-bold text-teal-400">{age} years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
              </div>

              {/* Activity Level */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 block">Activity Level:</span>
                <div className="flex gap-2">
                  {(['sedentary', 'moderate', 'active'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setActivity(lvl)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all ${
                        activity === lvl
                          ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                          : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Conditions */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 block">Health Conditions (Select all that apply):</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Renal Disease', 'Obesity', 'Diabetes', 'Urinary Crystals', 'Sensitive Stomach'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`py-1.5 px-2.5 text-left text-[11px] font-medium rounded-lg border transition-all truncate ${
                        selectedConditions.includes(cond)
                          ? 'bg-slate-900 border-teal-500 text-teal-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {selectedConditions.includes(cond) ? '✓ ' : '+ '} {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleCalculateDiet}
                disabled={dietLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all uppercase tracking-wider"
              >
                {dietLoading ? 'Computing Feline Diet Matrix...' : 'Generate Customized Diet Plan'}
              </button>
            </div>

            {/* Diet Plan Results */}
            {dietPlan && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
                <div className="border-b border-slate-700 pb-3 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-200">Custom Feline Diet Report</h4>
                  <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 font-semibold px-2 py-0.5 rounded text-[10px]">
                    OPTIMIZED
                  </span>
                </div>

                {/* Energy & Macros */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">DAILY ENERGY</span>
                    <p className="text-xl font-extrabold text-teal-400 mt-1">{dietPlan.dailyCalories} kcal</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">MACRO TARGETS</span>
                    <p className="text-xs font-semibold text-slate-200 mt-1.5">
                      P: {dietPlan.macronutrientSplit.proteinPercent}% / F: {dietPlan.macronutrientSplit.fatPercent}% / C: {dietPlan.macronutrientSplit.carbsPercent}%
                    </p>
                  </div>
                </div>

                {/* Rationale */}
                <div className="bg-teal-950/20 border border-teal-500/20 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <strong className="text-teal-400 font-bold block mb-1">Nutrition Rationale:</strong>
                  {dietPlan.dietRationale}
                </div>

                {/* Recommended / Avoid */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">RECOMMENDED LIST</span>
                    <ul className="space-y-1">
                      {dietPlan.recommendedFoods.map((f, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start">
                          <span className="text-teal-400 mr-1.5">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">ITEMS TO STRICTLY AVOID</span>
                    <ul className="space-y-1">
                      {dietPlan.avoidFoods.map((f, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start">
                          <span className="text-rose-400 mr-1.5">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Schedule */}
                <div className="border-t border-slate-700/60 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">RECOMMENDED FEEDING REGIMEN</span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">{dietPlan.feedingSchedule}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== BEHAVIORAL DECODER TAB =================== */}
        {activeTab === 'behavior' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 p-5 rounded-2xl shadow-xl space-y-5">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center">
                <span className="mr-1.5">💬</span> Decode Vocal & Body Ticks
              </h3>

              {/* Vocal input */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block">Vocal Sounds:</label>
                <input
                  type="text"
                  placeholder="e.g. Chirp, low hiss, long plaintive meow..."
                  value={vocal}
                  onChange={(e) => setVocal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Body Ticks */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 block">Observe Body Language (Select all matching):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Ears pinned back',
                    'Tail twitching back & forth',
                    'Tail held high / upright',
                    'Pupils heavily dilated',
                    'Slow blinking',
                    'Making biscuits / kneading',
                    'Arched back / fur raised',
                    'Licking lips',
                    'Tucked tail under body'
                  ].map((sign) => (
                    <button
                      key={sign}
                      type="button"
                      onClick={() => toggleBodySign(sign)}
                      className={`text-[10px] font-semibold py-1.5 px-2.5 rounded-lg border transition-all ${
                        bodySigns.includes(sign)
                          ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {sign}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 block">Context (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. During pet session, right before dinner, after active play..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleDecodeBehavior}
                disabled={decodeLoading}
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-black py-2.5 rounded-xl text-xs transition-all uppercase tracking-wider shadow-lg shadow-violet-500/20"
              >
                {decodeLoading ? 'Deconstructing Behavioral Matrix...' : 'Decode Feline Intent'}
              </button>
            </div>

            {/* Behavioral Decoding Results */}
            {decodeResult && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
                <div className="border-b border-slate-700 pb-3 flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-200">Behavior Decode Analysis</h4>
                  <span className="bg-violet-500/20 text-violet-400 border border-violet-500/30 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                    {decodeResult.catState}
                  </span>
                </div>

                {/* Primary Meaning Summary */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1">DECODED COGNITIVE INTENT</span>
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold">{decodeResult.decodedMeaning}</p>
                </div>

                {/* Details list */}
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div>
                    <strong className="text-violet-400 block mb-1">Vocal Auditory Feed:</strong>
                    <p className="leading-relaxed text-slate-400">{decodeResult.vocalAnalysis}</p>
                  </div>
                  <div>
                    <strong className="text-violet-400 block mb-1">Somatic & Body Signatures:</strong>
                    <p className="leading-relaxed text-slate-400">{decodeResult.bodyLanguageAnalysis}</p>
                  </div>
                </div>

                {/* Action Plan */}
                <div className="border-t border-slate-700/60 pt-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">RECOMMENDED HANDLER ACTIONS</span>
                  <ul className="space-y-1.5">
                    {decodeResult.actionPlan.map((act, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start">
                        <span className="text-violet-400 mr-2">➜</span> {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
