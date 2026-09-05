import React from 'react';
import { cn } from '../../utils';
import { TransactionType } from '../../types';

export interface BadgeProps {
  type?: TransactionType | string;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ type, className, children }) => {
  let badgeStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'Crédito') {
    badgeStyles = 'bg-purple-950/60 text-purple-300 border-purple-800/60';
  } else if (type === 'Débito') {
    badgeStyles = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
  } else if (type === 'Pix') {
    badgeStyles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide',
        badgeStyles,
        className
      )}
    >
      {children || type}
    </span>
  );
};
