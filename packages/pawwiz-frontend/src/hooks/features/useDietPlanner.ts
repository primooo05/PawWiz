import { useState } from 'react';
import type { DietPlan } from '../../../../pawwiz-backend/src/types/shared.js';
import { useFormValidation } from '../ui/useFormValidation';
import { dietSchema } from '../../schemas/features';

interface DietPlanPreview {
  dailyCalories: number;
  macronutrientSplit: { proteinPercent: number; fatPercent: number; carbsPercent: number };
  requiresAuth: true;
}

export function useDietPlanner() {
  const form = useFormValidation(dietSchema, {
    weight: 4.5,
    age: 3,
    activity: '',
    selectedConditions: [] as string[],
    customCondition: ''
  });

  const [isKg, setIsKg] = useState(true);
  const [dietPlan, setDietPlan] = useState<DietPlan | DietPlanPreview | null>(null);
  const [dietLoading, setDietLoading] = useState(false);

  const toggleCondition = (cond: string) => {
    const current = form.values.selectedConditions;
    const newConds = current.includes(cond) 
      ? current.filter(c => c !== cond) 
      : [...current, cond];
    form.handleChange('selectedConditions', newConds);
  };

  const toggleUnit = (toKg: boolean) => {
    if (isKg === toKg) return;
    setIsKg(toKg);
    const w = form.values.weight;
    form.handleChange('weight', toKg ? parseFloat((w / 2.205).toFixed(1)) : parseFloat((w * 2.205).toFixed(1)));
  };

  const handleCalculateDiet = () => {
    if (!form.values.activity) return;
    setDietLoading(true);
    setTimeout(() => {
      const weightInKg = isKg ? form.values.weight : form.values.weight / 2.2;
      setDietPlan({
        dailyCalories: Math.round(70 * Math.pow(weightInKg, 0.75) * (form.values.activity === 'active' ? 1.4 : form.values.activity === 'sedentary' ? 0.9 : 1.1)),
        macronutrientSplit: { proteinPercent: 45, fatPercent: 35, carbsPercent: 20 },
        requiresAuth: true,
      });
      setDietLoading(false);
    }, 850);
  };

  const isPreviewMode = dietPlan !== null && 'requiresAuth' in dietPlan;

  return { form, isKg, dietPlan, dietLoading, isPreviewMode, toggleCondition, toggleUnit, handleCalculateDiet };
}