import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useFormValidation } from './useFormValidation';
import { registrationSchema } from '../schemas/auth';

const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';

export function useRegister() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const form = useFormValidation(registrationSchema, {
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    honeypot: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    if (!form.validateAll()) return;
    
    // Honeypot check
    if (form.values.honeypot) {
      console.warn('Bot detected');
      return; // Silent fail for bots
    }

    setIsSubmitting(true);
    
    try {
      // 1. Supabase Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.values.email,
        password: form.values.password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create account');

      // 2. Post to backend Profile API
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseUserId: authData.user.id,
          displayName: form.values.displayName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create profile');
      }

      // Success, redirect to dashboard or login
      navigate('/login?registered=true');
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    serverError,
    handleRegister,
  };
}
