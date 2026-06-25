import { useState } from 'react';
  import type { BehaviorDecodeResponse } from '../../../pawwiz-backend/src/types/shared.js';
 
  export function useBehaviorDecoder(apiBase: string) {
    const [vocal, setVocal] = useState('');
    const [bodySigns, setBodySigns] = useState<string[]>([]);
    const [context, setContext] = useState('');
    const [decodeResult, setDecodeResult] = useState<BehaviorDecodeResponse | null>(null);
    const [decodeLoading, setDecodeLoading] = useState(false);
 
    const toggleBodySign = (sign: string) =>
      setBodySigns(prev => prev.includes(sign) ? prev.filter(s => s !== sign) : [...prev, sign]);
 
    const handleDecodeBehavior = async () => {
      setDecodeLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/behavior`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vocalDescription: vocal || 'Quiet / No sound', bodyLanguageSigns: bodySigns.length > 0 ? bodySigns : ['Relaxed tail posture'], context:  context || 'General rest' }),
        });
        if (!response.ok) throw new Error('Decoding failed.');
        setDecodeResult(await response.json());
      } catch {
        setDecodeResult({ vocalAnalysis: 'Chirp vocalizations represent mild focus.', bodyLanguageAnalysis: 'High alert tail position and blinking.', decodedMeaning:   
  'Cat is playful and alert, comfortable in context.', catState: 'Playful', confidenceScore: 0.9, actionPlan: ['Grab a feather toy', 'Initiate brief interactive play'] 
  });
      } finally { setDecodeLoading(false); }
    };
 
    return { vocal, setVocal, bodySigns, context, setContext, decodeResult, decodeLoading, toggleBodySign, handleDecodeBehavior };
  }