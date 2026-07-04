import React from 'react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, name, ...props }: FormFieldProps) {
  const inputId = id || name;
  const errorId = inputId ? `${inputId}-error` : undefined;

  return (
    <div className="mb-4 text-left">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
          error ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'
        }`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
