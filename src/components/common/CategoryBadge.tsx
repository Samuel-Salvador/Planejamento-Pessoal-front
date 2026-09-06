import React from 'react';
import { cn } from '../../utils';
import { Pencil } from 'lucide-react';

interface CategoryBadgeProps {
  category?: string;
  onClick?: () => void;
  className?: string;
}

interface CategoryStyle {
  container: string;
  dot: string;
}

const PALETTES: CategoryStyle[] = [
  {
    container: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50 hover:border-emerald-700/80',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  },
  {
    container: 'bg-cyan-950/50 text-cyan-300 border-cyan-800/60 hover:bg-cyan-900/50 hover:border-cyan-700/80',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
  },
  {
    container: 'bg-purple-950/50 text-purple-300 border-purple-800/60 hover:bg-purple-900/50 hover:border-purple-700/80',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
  },
  {
    container: 'bg-blue-950/50 text-blue-300 border-blue-800/60 hover:bg-blue-900/50 hover:border-blue-700/80',
    dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]',
  },
  {
    container: 'bg-rose-950/50 text-rose-300 border-rose-800/60 hover:bg-rose-900/50 hover:border-rose-700/80',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]',
  },
  {
    container: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/60 hover:bg-indigo-900/50 hover:border-indigo-700/80',
    dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]',
  },
  {
    container: 'bg-teal-950/50 text-teal-300 border-teal-800/60 hover:bg-teal-900/50 hover:border-teal-700/80',
    dot: 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]',
  },
  {
    container: 'bg-pink-950/50 text-pink-300 border-pink-800/60 hover:bg-pink-900/50 hover:border-pink-700/80',
    dot: 'bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]',
  },
];

function getCategoryStyle(categoryName: string, isUncategorized: boolean): CategoryStyle {
  if (isUncategorized) {
    return {
      container: 'bg-amber-950/40 text-amber-300 border-amber-800/60 border-dashed hover:bg-amber-900/40 hover:border-amber-700/80',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
    };
  }

  const normalized = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Regras semânticas para categorias frequentes
  if (/ifood|aliment|comida|mercado|restaurante|refeicao|lanche|almoco|jantar/.test(normalized)) {
    return PALETTES[0]; // Emerald
  }
  if (/uber|transporte|combustivel|gasolina|gas|posto|corrida|carro|onibus|metro/.test(normalized)) {
    return PALETTES[1]; // Cyan
  }
  if (/lazer|viagem|streaming|netflix|cinema|jogo|festa|bar|show/.test(normalized)) {
    return PALETTES[2]; // Purple
  }
  if (/casa|moradia|aluguel|condominio|luz|agua|energia|internet|reforma/.test(normalized)) {
    return PALETTES[3]; // Blue
  }
  if (/saude|farmacia|medico|remedio|dentista|hospital|exame|academia/.test(normalized)) {
    return PALETTES[4]; // Rose
  }
  if (/educacao|curso|livro|escola|faculdade|estudo/.test(normalized)) {
    return PALETTES[5]; // Indigo
  }
  if (/diversos|outro|geral|compras/.test(normalized)) {
    return {
      container: 'bg-slate-800/70 text-slate-200 border-slate-700/80 hover:bg-slate-700/70 hover:border-slate-600/80',
      dot: 'bg-slate-400',
    };
  }

  // Hash determinístico para outras categorias personalizadas
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  onClick,
  className,
}) => {
  const isUncategorized = !category || category.trim() === '' || category.trim().toLowerCase() === 'sem categoria';
  const displayName = isUncategorized ? 'Sem categoria' : category.trim();
  const style = getCategoryStyle(displayName, isUncategorized);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 whitespace-nowrap group select-none',
        style.container,
        onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
      title={onClick ? 'Clique para alterar a categoria' : undefined}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
      <span className="truncate max-w-[150px]">{displayName}</span>
      {onClick && (
        <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 shrink-0" />
      )}
    </button>
  );
};
