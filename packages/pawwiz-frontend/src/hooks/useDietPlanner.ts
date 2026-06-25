import { useState } from 'react';
  import type { DietPlan } from '../../../pawwiz-backend/src/types/shared.js';
 
  interface DietPlanPreview {
    dailyCalories: number;
    macronutrientSplit: { proteinPercent: number; fatPercent: number; carbsPercent: number };
    requiresAuth: true;
  }
 
  export function useDietPlanner() {
    const [isKg, setIsKg] = useState(true);
    const [weight, setWeight] = useState(4.5);
    const [age, setAge] = useState(3);
    const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active' | null>(null);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [customCondition, setCustomCondition] = useState('');
    const [dietPlan, setDietPlan] = useState<DietPlan | DietPlanPreview | null>(null);
    const [dietLoading, setDietLoading] = useState(false);
 
    const toggleCondition = (cond: string) =>
      setSelectedConditions(prev => prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]);
 
    const toggleUnit = (toKg: boolean) => {
      setIsKg(toKg);
      setWeight(prev => parseFloat((toKg ? prev / 2.2 : prev * 2.2).toFixed(1)));
    };
 
    const handleCalculateDiet = () => {
      if (!activity) return;
      setDietLoading(true);
      setTimeout(() => {
        const weightInKg = isKg ? weight : weight / 2.2;
        setDietPlan({
          dailyCalories: Math.round(70 * Math.pow(weightInKg, 0.75) * (activity === 'active' ? 1.4 : activity === 'sedentary' ? 0.9 : 1.1)),
          macronutrientSplit: { proteinPercent: 45, fatPercent: 35, carbsPercent: 20 },
          requiresAuth: true,
        });
        setDietLoading(false);
      }, 850);
    };
 
    const isPreviewMode = dietPlan !== null && 'requiresAuth' in dietPlan;
 
    return { isKg, weight, setWeight, age, setAge, activity, setActivity, selectedConditions, customCondition, setCustomCondition, dietPlan, dietLoading, isPreviewMode,  toggleCondition, toggleUnit, handleCalculateDiet };
  }