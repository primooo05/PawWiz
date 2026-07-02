import { useGestationCalculator } from '../../hooks/useGestationCalculator';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface PregnancyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PregnancyModal({ isOpen, onClose }: PregnancyModalProps) {
  useBodyScrollLock(isOpen);
  const { form, gestationResult, handleCalculateGestation } = useGestationCalculator();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full border border-slate-200/60 shadow-2xl p-6 md:p-8 relative animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-lg font-bold transition-colors"
        >
          ✕
        </button>
        <h3 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center">
          <span className="mr-2">🤰</span> Gestation Calculator
        </h3>
        
        <form onSubmit={handleCalculateGestation} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Mating / Conception Date:</label>
            <input
              type="date"
              value={form.values.matingDate}
              onChange={(e) => form.handleChange('matingDate', e.target.value)}
              onBlur={() => form.handleBlur('matingDate')}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#30c290]/40 font-semibold text-slate-800 ${form.errors.matingDate ? 'border-red-400' : 'border-slate-200'}`}
            />
            {form.errors.matingDate && <p className="text-red-500 text-xs mt-1">{form.errors.matingDate}</p>}
          </div>
          <button
            type="submit"
            disabled={!form.isValid}
            className="w-full bg-[#30c290] hover:bg-[#259b90] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
          >
            Compute Milestones
          </button>
        </form>

        {gestationResult && (
          <div className="mt-6 space-y-4 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800/80 text-xs animate-fadeIn">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Estimated Due Date:</span>
              <span className="font-extrabold text-[#30c290]">{gestationResult.dueDate}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Days Gested:</span>
              <span className="font-bold">{gestationResult.daysGested} days</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Days Remaining:</span>
              <span className="font-bold text-[#e9c46a]">{gestationResult.daysLeft} days</span>
            </div>
            <div className="pt-2">
              <strong className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Current Milestone:</strong>
              <p className="text-slate-200 leading-relaxed font-medium">{gestationResult.milestone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
