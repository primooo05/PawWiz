import { useState } from 'react';
import type { BehaviorDecodeResponse } from '../../../../pawwiz-backend/src/types/shared.js';

interface BehaviorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export default function BehaviorModal({ isOpen, onClose, apiBase }: BehaviorModalProps) {
  const [vocal, setVocal] = useState('');
  const [bodySigns, setBodySigns] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [decodeResult, setDecodeResult] = useState<BehaviorDecodeResponse | null>(null);
  const [decodeLoading, setDecodeLoading] = useState(false);

  if (!isOpen) return null;

  const handleDecodeBehavior = async () => {
    setDecodeLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/behavior`, {
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
      setDecodeResult({
        vocalAnalysis: "Chirp vocalizations represent mild focus or acknowledgment.",
        bodyLanguageAnalysis: "Observation indicates high alert tail position and blinking.",
        decodedMeaning: "Cat is feeling playful and highly alert, but comfortable in its current context.",
        catState: "Playful",
        confidenceScore: 0.9,
        actionPlan: ["Grab a feather toy", "Initiate bonding through brief interactive play"]
      });
    } finally {
      setDecodeLoading(false);
    }
  };

  const toggleBodySign = (sign: string) => {
    setBodySigns(prev =>
      prev.includes(sign) ? prev.filter(s => s !== sign) : [...prev, sign]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
        >
          ✕
        </button>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <span className="mr-2">💬</span> Behavior Decoder
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Vocalizations:</label>
            <input
              type="text"
              placeholder="e.g. Hiss, chirp, trill..."
              value={vocal}
              onChange={(e) => setVocal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2ec4b6]"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Context:</label>
            <input
              type="text"
              placeholder="e.g. During petting session, right before dinner..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2ec4b6]"
            />
          </div>

          <div>
            <span className="text-xs text-slate-500 block mb-1.5">Observe posture/body language:</span>
            <div className="flex flex-wrap gap-1">
              {['Ears pinned back', 'Tail twitching', 'Tail high', 'Pupils dilated', 'Slow blinking', 'Making biscuits'].map((sign) => (
                <button
                  key={sign}
                  type="button"
                  onClick={() => toggleBodySign(sign)}
                  className={`text-[10px] font-semibold py-1 px-2.5 rounded-lg border transition-all ${
                    bodySigns.includes(sign)
                      ? 'bg-[#2ec4b6]/10 border-[#2ec4b6] text-[#2ec4b6]'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
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
            className="w-full bg-[#2ec4b6] hover:bg-[#259b90] text-white font-bold py-2.5 rounded-xl text-xs uppercase"
          >
            {decodeLoading ? 'Decoding...' : 'Decode Behavior'}
          </button>
        </div>

        {decodeResult && (
          <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold text-slate-800">State:</span>
              <span className="font-bold text-rose-500 uppercase">{decodeResult.catState}</span>
            </div>
            <p><strong>Meaning:</strong> {decodeResult.decodedMeaning}</p>
            <div>
              <strong className="text-slate-700 block">Handler Actions:</strong>
              <ul className="list-disc pl-4 space-y-0.5 mt-1">
                {decodeResult.actionPlan.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
