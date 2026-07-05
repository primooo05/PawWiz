import React from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label. Rendered above the field and wired to the input via htmlFor. */
  label?: string;
  /** Inline error message. When present, applies error styling + aria-invalid. */
  error?: string;
  /**
   * Reserve vertical space for the error line so the layout doesn't shift when an
   * error appears/disappears. Set to false on flows that surface errors elsewhere
   * (e.g. the onboarding mascot speech bubble).
   */
  reserveErrorSpace?: boolean;
  /** Extra classes merged onto the <input>. */
  className?: string;
  /**
   * Theme classes for the <label>. Defaults to the onboarding subtle style; pass
   * a value to fully override the label's text styling (e.g. Login's bold italic).
   */
  labelClassName?: string;
  /**
   * Optional adornment rendered on the right edge of the field (e.g. a password
   * show/hide toggle). Rendered inside a relative wrapper around the input, so it
   * stays vertically centered on the input regardless of label/error height.
   * Position it with `absolute right-4 top-1/2 -translate-y-1/2`.
   */
  trailing?: React.ReactNode;
}

/**
 * Neo-brutalist text input — the single source of truth for text fields across
 * Login and the Onboarding flow. Visual base is the OTP screen's teal field,
 * hardened into a neo-brutalist treatment that matches the app's speech bubbles
 * and buttons (thick dark border + hard offset shadow).
 *
 * Design tokens:
 * - `bg-[#2ec4b6]` teal, white semibold text, consistent placeholder styling.
 * - `border-2 border-slate-900` + `shadow-[4px_4px_0_0_...]` hard offset shadow.
 * - `rounded-2xl`, `min-h-[44px]` (WCAG 2.5.5 minimum touch target).
 * - Gold focus ring `#e9c46a`; red border/ring on error.
 *
 * Accessibility:
 * - Label associated via htmlFor/id; when no visible label is used, pass
 *   `aria-label` through props instead.
 * - Errors announced via aria-invalid + aria-describedby.
 */
export function TextField({
  label,
  error,
  id,
  name,
  className = '',
  labelClassName = 'text-sm text-slate-500 font-semibold pl-1',
  reserveErrorSpace = true,
  trailing,
  ...props
}: TextFieldProps) {
  const inputId = id || name;
  const errorId = inputId ? `${inputId}-error` : undefined;

  const input = (
    <input
      id={inputId}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      className={`w-full px-5 py-3.5 min-h-[44px] bg-[#2ec4b6] text-white font-semibold placeholder:text-teal-100/70 placeholder:font-medium rounded-2xl border-2 outline-none transition-all shadow-[4px_4px_0_0_rgba(15,23,42,0.2)] focus:ring-2 focus:ring-[#e9c46a] focus:shadow-[4px_4px_0_0_rgba(15,23,42,0.35)] disabled:opacity-60 disabled:cursor-not-allowed ${
        error ? 'border-red-500 focus:ring-red-400' : 'border-slate-900'
      } ${trailing ? 'pr-14' : ''} ${className}`}
      {...props}
    />
  );

  return (
    <div className="flex flex-col text-left w-full">
      {label && (
        <label htmlFor={inputId} className={`mb-2 block ${labelClassName}`}>
          {label}
        </label>
      )}
      {trailing ? (
        <div className="relative">
          {input}
          {trailing}
        </div>
      ) : (
        input
      )}
      {(error || reserveErrorSpace) && (
        <p
          id={errorId}
          className={`mt-1 text-sm text-red-500 ml-4 min-h-[20px] transition-opacity duration-200 ${
            error ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {error || '\u00A0'}
        </p>
      )}
    </div>
  );
}
