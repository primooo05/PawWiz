import { useState } from 'react';
import type { BehaviorDecodeResponse } from '../../../pawwiz-backend/src/types/shared.js';
import { useFormValidation } from './useFormValidation';
import { behaviorSchema } from '../schemas/features';

export function useBehaviorDecoder(_apiBase: string) {
  const form = useFormValidation(behaviorSchema, {
    vocal: '',
    context: '',
    bodySigns: [] as string[],
  });

  const [decodeResult, setDecodeResult] = useState<BehaviorDecodeResponse | null>(null);
  const [decodeLoading, setDecodeLoading] = useState(false);

  const toggleBodySign = (sign: string) => {
    const current = form.values.bodySigns;
    const newSigns = current.includes(sign) 
      ? current.filter(s => s !== sign) 
      : [...current, sign];
    form.handleChange('bodySigns', newSigns);
  };

  const handleDecodeBehavior = () => {
    if (!form.validateAll()) return;
    
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

  return { form, decodeResult, decodeLoading, toggleBodySign, handleDecodeBehavior };
}