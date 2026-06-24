import React, { useState } from 'react';

interface PregnancyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PregnancyModal({ isOpen, onClose }: PregnancyModalProps) {
  const [matingDate, setMatingDate] = useState(new Date().toISOString().split('T')[0]);
  const [gestationResult, setGestationResult] = useState<{
    dueDate: string;
    daysGested: number;
    daysLeft: number;
    milestone: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCalculateGestation = (e: React.FormEvent) => {
    e.preventDefault();
    const mating = new Date(matingDate);
    const due = new Date(mating);
    due.setDate(mating.getDate() + 65); // Average gestation 65 days

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - mating.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let milestone = "Initial stage. Ensure mother receives high-quality kitten formula kibble for nutrition.";
    if (diffDays >= 14 && diffDays < 28) milestone = "Nipples will begin to swell and turn pink ('pinking up'). Schedule first prenatal vet check.";
    if (diffDays >= 28 && diffDays < 42) milestone = "Kittens start forming shapes. Avoid rough play. Mother's abdomen will noticeably swell.";
    if (diffDays >= 42) milestone = "Nearing birth. Set up a nesting box in a warm, quiet, draft-free location.";

    setGestationResult({
      dueDate: due.toDateString(),
      daysGested: Math.min(diffDays, 65),
      daysLeft: Math.max(65 - diffDays, 0),
      milestone
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <span className="mr-2">🤰</span> Gestation Calculator
        </h3>
        
        <form onSubmit={handleCalculateGestation} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Mating Date / Conception Date:</label>
            <input
              type="date"
              value={matingDate}
              onChange={(e) => setMatingDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2ec4b6]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#2ec4b6] hover:bg-[#259b90] text-white font-bold py-2.5 rounded-xl text-xs uppercase"
          >
            Compute Milestones
          </button>
        </form>

        {gestationResult && (
          <div className="mt-5 space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Due Date:</span>
              <span className="font-bold text-[#2ec4b6]">{gestationResult.dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Days Gested:</span>
              <span className="font-bold">{gestationResult.daysGested} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Days Remaining:</span>
              <span className="font-bold">{gestationResult.daysLeft} days</span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <strong className="text-slate-700 block mb-1">Current Milestone:</strong>
              <p className="text-slate-500 leading-relaxed">{gestationResult.milestone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
