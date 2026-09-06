import React from 'react';
import { cn } from '../../utils';
import { Pencil } from 'lucide-react';

interface CategoryBadgeProps {
  category?: string;
  onClick?: () => void;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  onClick,
  className,
}) => {
  const isUncategorized = !category || category.trim() === '' || category.trim().toLowerCase() === 'sem categoria';
  const displayName = isUncategorized ? 'Sem categoria' : category.trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap group select-none',
        'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/60 hover:text-slate-200 hover:border-slate-600',
        onClick && 'cursor-pointer',
        className
      )}
      title={onClick ? 'Clique para editar a categoria' : undefined}
    >
      <span className="truncate max-w-[150px]">{displayName}</span>
      {onClick && (
        <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0 text-slate-400" />
      )}
    </button>
  );
};
