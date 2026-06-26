import { useState } from 'react';
  import type { BehaviorDecodeResponse } from '../../../pawwiz-backend/src/types/shared.js';
 
  export function useBehaviorDecoder(_apiBase: string) {
    const [vocal, setVocal] = useState('');
    const [bodySigns, setBodySigns] = useState<string[]>([]);
    const [context, setContext] = useState('');
    const [decodeResult, setDecodeResult] = useState<BehaviorDecodeResponse | null>(null);
    const [decodeLoading, setDecodeLoading] = useState(false);
 
    const toggleBodySign = (sign: string) =>
      setBodySigns(prev => prev.includes(sign) ? prev.filter(s => s !== sign) : [...prev, sign]);
 
    const handleDecodeBehavior = () => {
      setDecodeLoading(true);
      setTimeout(() => {
        setDecodeResult({ 
          vocalAnalysis: 'Chirp vocalizations represent mild focus.', 
          bodyLanguageAnalysis: 'High alert tail position and blinking.', 
          decodedMeaning: 'Cat is playful and alert, comfortable in context.', 
          catState: 'Playful', 
          confidenceScore: 0.9, 
          actionPlan: ['Grab a feather toy', 'Initiate brief interactive play'] 
        });
        setDecodeLoading(false);
      }, 850);
    };
 
    return { vocal, setVocal, bodySigns, context, setContext, decodeResult, decodeLoading, toggleBodySign, handleDecodeBehavior };
  }