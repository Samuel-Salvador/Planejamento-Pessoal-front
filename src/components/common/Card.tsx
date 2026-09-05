import React from 'react';
import { cn } from '../../utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm p-5 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
