import React, { forwardRef } from 'react';
import { cn } from '../../utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 transition-all duration-150',
            'focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-rose-400 font-medium pl-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
