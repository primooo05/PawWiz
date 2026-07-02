import { useBehaviorDecoder } from '../../hooks/useBehaviorDecoder';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface BehaviorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export default function BehaviorModal({ isOpen, onClose, apiBase }: BehaviorModalProps) {
  useBodyScrollLock(isOpen);
  const { form, decodeResult, decodeLoading, toggleBodySign, handleDecodeBehavior } = useBehaviorDecoder(apiBase);

  if (!isOpen) return null;

  // Map signs to cute icons/emojis
  const signEmojis: Record<string, string> = {
    'Ears pinned back': '😾 Ears pinned back',
    'Tail twitching': '🪶 Tail twitching',
    'Tail high': '🐾 Tail high',
    'Pupils dilated': '👁️ Pupils dilated',
    'Slow blinking': '😉 Slow blinking',
    'Making biscuits': '🍞 Making biscuits'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-sm w-full border border-slate-200/60 shadow-2xl p-5 md:p-6 relative animate-scaleUp max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <span>🐱</span> Behavior Decoder
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1">Vocalizations:</label>
            <input
              type="text"
              placeholder="e.g. Hiss, chirp, trill..."
              value={form.values.vocal}
              onChange={(e) => form.handleChange('vocal', e.target.value)}
              onBlur={() => form.handleBlur('vocal')}
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#30c290]/40 font-semibold text-slate-800 placeholder-slate-400 ${form.errors.vocal ? 'border-red-400' : 'border-slate-200'}`}
            />
            {form.errors.vocal && <p className="text-red-500 text-xs mt-1">{form.errors.vocal}</p>}
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1">Context:</label>
            <input
              type="text"
              placeholder="e.g. Petting, before dinner..."
              value={form.values.context}
              onChange={(e) => form.handleChange('context', e.target.value)}
              onBlur={() => form.handleBlur('context')}
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#30c290]/40 font-semibold text-slate-800 placeholder-slate-400 ${form.errors.context ? 'border-red-400' : 'border-slate-200'}`}
            />
            {form.errors.context && <p className="text-red-500 text-xs mt-1">{form.errors.context}</p>}
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1.5">Observe body language:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Ears pinned back', 'Tail twitching', 'Tail high', 'Pupils dilated', 'Slow blinking', 'Making biscuits'].map((sign) => (
                <button
                  key={sign}
                  type="button"
                  onClick={() => toggleBodySign(sign)}
                  className={`text-[9px] font-black py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                    form.values.bodySigns.includes(sign)
                      ? 'bg-[#30c290]/10 border-[#30c290] text-[#30c290] shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {signEmojis[sign] || sign}
                </button>
              ))}
            </div>
            {form.errors.bodySigns && <p className="text-red-500 text-xs mt-1">{form.errors.bodySigns}</p>}
          </div>

          <button
            type="button"
            onClick={handleDecodeBehavior}
            disabled={decodeLoading || !form.isValid}
            className="w-full bg-[#30c290] hover:bg-[#259b90] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-colors shadow-sm cursor-pointer mt-1"
          >
            {decodeLoading ? 'Decoding...' : '🔑 Decode Behavior'}
          </button>
        </div>

        {decodeResult && (
          <div className="mt-4 relative overflow-hidden rounded-2xl">
            {/* Blurred Content */}
            <div className="filter blur-sm pointer-events-none select-none opacity-20 bg-slate-950 text-slate-100 p-4 rounded-2xl border border-slate-850/80 text-[11px] space-y-3">
              <div className="flex justify-between border-b border-slate-900 pb-1.5 text-xs font-black">
                <span className="text-slate-400">Analysis State:</span>
                <span className="text-violet-400 uppercase">{decodeResult.catState}</span>
              </div>
              <p className="leading-relaxed">
                <strong className="text-slate-400 uppercase tracking-widest text-[9px] block mb-0.5">Decoded Meaning:</strong>
                <span className="text-slate-200 font-medium">{decodeResult.decodedMeaning}</span>
              </p>
              <div className="space-y-1">
                <span className="text-slate-400 uppercase tracking-widest text-[9px] block">Handler Actions:</span>
                <ul className="list-disc pl-3.5 space-y-0.5 font-medium text-slate-300">
                  {decodeResult.actionPlan.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>

            {/* Authentication Nudge Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-[1px]">
              <div className="text-center space-y-2 w-full max-w-[280px]">
                <h4 className="text-[10px] font-black text-[#e9c46a] uppercase tracking-wider">🐾 Save to Cat's Diary?</h4>
                <p className="text-[9px] text-slate-200 leading-normal">
                  Keep a history of your cat's moods & build a behavioral timeline! Sign in to save this analysis.
                </p>
                <button 
                  onClick={() => {
                    alert("Sign Up or Sign In to start saving logs!");
                  }}
                  className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-3 py-1.5 rounded-lg text-[9px] tracking-wider transition-colors w-full cursor-pointer"
                >
                  CREATE PROFILE / SIGN IN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
