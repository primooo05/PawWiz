import { useState } from 'react';
import { API_BASE } from '../lib/config';
import { useFormValidation } from './useFormValidation';
import { recoverySchema } from '../schemas/auth';

export function useForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const form = useFormValidation(recoverySchema, { email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!form.validateAll()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.values.email }),
      });

      // Always treat 200 and rate-limit (429) distinctly; surface only 429 to user.
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error || 'Too many requests. Please wait a moment and try again.');
        return;
      }

      // All other responses (200, 4xx from validation) collapse to the same
      // confirmation message to prevent email enumeration.
      setSubmitted(true);
    } catch {
      setServerError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, isSubmitting, serverError, submitted, handleSubmit };
}
