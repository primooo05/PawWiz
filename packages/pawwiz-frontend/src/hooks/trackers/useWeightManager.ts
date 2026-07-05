import { useState } from 'react';

export const useWeightManager = (initialWeightKg?: number) => {
    const [intVal, setIntVal] = useState(initialWeightKg ? Math.floor(initialWeightKg) : 4);
    const [decVal, setDecVal] = useState(initialWeightKg ? Math.round((initialWeightKg % 1) * 10) : 0);
    const [unitVal, setUnitVal] = useState<'kg' | 'lbs'>('kg');

    const convertWeight = (val: number, to: 'kg' | 'lbs') => {
        return to === 'lbs' ? val / 0.45359237 : val * 0.45359237;
    };

    const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
        const currentKg = unitVal === 'kg' ? (intVal + decVal / 10) : (intVal + decVal / 10) * 0.45359237;
        const converted = convertWeight(currentKg, newUnit);
        setIntVal(Math.floor(converted));
        setDecVal(Math.round((converted % 1) * 10));
        setUnitVal(newUnit);
    };

    return { intVal, setIntVal, decVal, setDecVal, unitVal, setUnitVal, handleUnitChange };
};
