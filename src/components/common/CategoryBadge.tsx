import React from 'react';
import { cn } from '../../utils';

interface CategoryBadgeProps {
  category?: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className,
}) => {
  const isUncategorized = !category || category.trim() === '' || category.trim().toLowerCase() === 'sem categoria';
  const displayName = isUncategorized ? 'Sem categoria' : category.trim();

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap select-none',
        'bg-slate-800/60 text-slate-300 border-slate-700/60',
        className
      )}
    >
      <span className="truncate max-w-[150px]">{displayName}</span>
    </span>
  );
};
