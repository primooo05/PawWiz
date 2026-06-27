import { useState } from 'react';
import { z } from 'zod';

export interface UseFormValidationReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  validateAll: () => boolean;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  initialValues: T
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof T) => {
    if (schema instanceof z.ZodObject) {
      const fieldSchema = schema.shape[field as string];
      if (fieldSchema) {
        const result = fieldSchema.safeParse(values[field]);
        if (!result.success) {
          setErrors(prev => ({ ...prev, [field]: result.error.issues[0].message }));
        } else {
          setErrors(prev => {
            if (!prev[field]) return prev;
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      }
    }
  };

  const validateAll = () => {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Partial<Record<keyof T, string>> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof T;
        if (!newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const isValid = schema.safeParse(values).success;

  return {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
  };
}
