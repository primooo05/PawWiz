import { useBehaviorDecoder } from '../../hooks/useBehaviorDecoder';

interface BehaviorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export default function BehaviorModal({ isOpen, onClose, apiBase }: BehaviorModalProps) {
  const { vocal, setVocal, bodySigns, context, setContext, decodeResult, decodeLoading, toggleBodySign, handleDecodeBehavior } = useBehaviorDecoder(apiBase);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full border border-slate-200/60 shadow-2xl p-6 md:p-8 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-lg font-bold transition-colors"
        >
          ✕
        </button>
        <h3 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center">
          <span className="mr-2">💬</span> Behavior Decoder
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Vocalizations:</label>
            <input
              type="text"
              placeholder="e.g. Hiss, chirp, trill..."
              value={vocal}
              onChange={(e) => setVocal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ec4b6]/40 font-semibold text-slate-800 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Context:</label>
            <input
              type="text"
              placeholder="e.g. During petting session, right before dinner..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ec4b6]/40 font-semibold text-slate-800 placeholder-slate-400"
            />
          </div>

          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2">Observe posture/body language:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Ears pinned back', 'Tail twitching', 'Tail high', 'Pupils dilated', 'Slow blinking', 'Making biscuits'].map((sign) => (
                <button
                  key={sign}
                  type="button"
                  onClick={() => toggleBodySign(sign)}
                  className={`text-[10px] font-extrabold py-2 px-3.5 rounded-xl border transition-all cursor-pointer ${
                    bodySigns.includes(sign)
                      ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6] shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {sign}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDecodeBehavior}
            disabled={decodeLoading}
            className="w-full bg-[#2ec4b6] hover:bg-[#259b90] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer mt-2"
          >
            {decodeLoading ? 'Decoding...' : 'Decode Behavior'}
          </button>
        </div>

        {decodeResult && (
          <div className="mt-6 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800/80 text-xs animate-fadeIn space-y-3.5">
            <div className="flex justify-between border-b border-slate-800 pb-2 text-sm font-extrabold">
              <span className="text-slate-400">Analysis State:</span>
              <span className="text-violet-400 uppercase">{decodeResult.catState}</span>
            </div>
            <p className="leading-relaxed">
              <strong className="text-slate-400 uppercase tracking-widest text-[10px] block mb-1">Decoded Meaning:</strong>
              <span className="text-slate-200 font-medium">{decodeResult.decodedMeaning}</span>
            </p>
            <div className="space-y-1.5">
              <span className="text-slate-400 uppercase tracking-widest text-[10px] block">Handler Actions:</span>
              <ul className="list-disc pl-4 space-y-1 font-medium text-slate-300">
                {decodeResult.actionPlan.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
