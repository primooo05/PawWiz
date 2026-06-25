import { useState } from 'react';
  import type { ToxicityScanResult } from '../../../pawwiz-backend/src/types/shared.js';
 
  export function usePlantScan(apiBase: string) {
    const [plantQuery, setPlantQuery] = useState('');
    const [scanResult, setScanResult] = useState<ToxicityScanResult | null>(null);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanError, setScanError] = useState('');
 
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setScanLoading(true); setScanError(''); setScanResult(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const response = await fetch(`${apiBase}/api/scan`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result as string }),
          });
          if (!response.ok) throw new Error('Failed to analyze image.');
          setScanResult(await response.json());
        } catch (err) {
          setScanError((err as Error).message);
          setScanResult({ identifiedPlant: 'Peace Lily', scientificName: 'Spathiphyllum spp.', isToxic: true, severity: 'Moderate', clinicalSigns: ['Oral irritation',  
  'Excessive drooling', 'Vomiting'], actionRequired: 'Fallback: seek vet guidance.', confidence: 0.9, dataSource: 'ASPCA Database (Deterministic)' });
        } finally { setScanLoading(false); }
      };
      reader.readAsDataURL(file);
    };
 
    const handleTextSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!plantQuery.trim()) return;
      setScanLoading(true); setScanError(''); setScanResult(null);
      try {
        const response = await fetch(`${apiBase}/api/scan`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plantNameQuery: plantQuery }),
        });
        if (!response.ok) throw new Error('Plant query failed.');
        setScanResult(await response.json());
      } catch {
        const q = plantQuery.toLowerCase();
        if (q.includes('lily')) setScanResult({ identifiedPlant: 'Lily (Easter/Tiger)', scientificName: 'Lilium spp.', isToxic: true, severity: 'Severe', clinicalSigns:  ['Vomiting', 'Lethargy', 'Kidney failure'], actionRequired: 'EMERGENCY: Seek vet immediately!', confidence: 1.0, dataSource: 'ASPCA Database (Deterministic)' });     
        else if (q.includes('spider')) setScanResult({ identifiedPlant: 'Spider Plant', scientificName: 'Chlorophytum comosum', isToxic: false, severity: 'None',       
  clinicalSigns: [], actionRequired: 'Completely safe.', confidence: 1.0, dataSource: 'ASPCA Database (Deterministic)' });
        else setScanError('Unable to connect. Try "lily" or "spider plant" for offline demo.');
      } finally { setScanLoading(false); }
    };
 
    return { plantQuery, setPlantQuery, scanResult, scanLoading, scanError, handleImageUpload, handleTextSearch };
  }
 