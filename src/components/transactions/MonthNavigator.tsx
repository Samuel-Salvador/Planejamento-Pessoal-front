import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTH_NAMES } from '../../utils';

interface MonthNavigatorProps {
  month: number;
  year: number;
  selectedGroup: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  month,
  year,
  selectedGroup,
  onPrevMonth,
  onNextMonth,
}) => {
  const isGroupFilter = selectedGroup && selectedGroup !== 'Dia a dia';

  return (
    <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 px-4 py-3 rounded-2xl shadow-md">
      {!isGroupFilter ? (
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Mês anterior"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-9" />
      )}

      <div className="text-center">
        <h2 className="text-base sm:text-lg font-semibold text-slate-100">
          Gastos{' '}
          {isGroupFilter ? (
            <span className="text-emerald-400 font-bold">{selectedGroup}</span>
          ) : (
            <>
              <span className="text-emerald-400 capitalize">{MONTH_NAMES[month - 1]}</span>{' '}
              de <span className="text-slate-300">{year}</span>
            </>
          )}
        </h2>
        {isGroupFilter && (
          <p className="text-xs text-slate-400 mt-0.5">Filtrando por grupo personalizado</p>
        )}
      </div>

      {!isGroupFilter ? (
        <button
          onClick={onNextMonth}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Próximo mês"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-9" />
      )}
    </div>
  );
};
