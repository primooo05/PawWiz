import { useState } from 'react';
 
  interface GestationResult {
    dueDate: string;
    daysGested: number;
    daysLeft: number;
    milestone: string;
  }
 
  export function useGestationCalculator() {
    const [matingDate, setMatingDate] = useState(new Date().toISOString().split('T')[0]);
    const [gestationResult, setGestationResult] = useState<GestationResult | null>(null);
 
    const handleCalculateGestation = (e: React.FormEvent) => {
      e.preventDefault();
      const mating = new Date(matingDate);
      const due = new Date(mating);
      due.setDate(mating.getDate() + 65);
      const diffDays = Math.ceil(Math.abs(new Date().getTime() - mating.getTime()) / (1000 * 60 * 60 * 24));
 
      let milestone = 'Initial stage. Ensure high-quality kitten formula kibble.';
      if (diffDays >= 14 && diffDays < 28) milestone = "Nipples begin pinking up. Schedule first prenatal vet check.";
      if (diffDays >= 28 && diffDays < 42) milestone = 'Kittens forming shapes. Avoid rough play. Abdomen will swell.';
      if (diffDays >= 42) milestone = 'Nearing birth. Set up nesting box in warm, quiet location.';
 
      setGestationResult({ dueDate: due.toDateString(), daysGested: Math.min(diffDays, 65), daysLeft: Math.max(65 - diffDays, 0), milestone });
    };
 
    return { matingDate, setMatingDate, gestationResult, handleCalculateGestation };
  }