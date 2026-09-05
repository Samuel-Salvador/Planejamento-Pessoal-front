import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryDonutChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#e11d48', // rose
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    transactions.forEach((tx) => {
      const category = tx.category?.trim() || 'Outros';
      const price = Number(tx.price) || 0;
      categoryMap.set(category, (categoryMap.get(category) || 0) + price);
    });

    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px] text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
          <PieIcon className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Sem dados para o gráfico</p>
        <p className="text-xs text-slate-500 mt-1">Adicione despesas para visualizar os gastos por categoria.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.payload.color }}
            />
            {data.name}
          </p>
          <p className="text-emerald-400 font-bold mt-1 text-sm">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
        <PieIcon className="w-4 h-4 text-emerald-400" />
        Gastos por Categoria
      </h3>

      {/* Gráfico Donut com altura dedicada */}
      <div className="w-full h-52 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Dinâmica em HTML: cresce naturalmente e expande a altura do Card */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 items-center justify-center">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/70 px-2.5 py-1 rounded-xl text-xs hover:border-slate-700 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-200 font-medium">{item.name}</span>
            <span className="text-emerald-400 font-semibold text-[11px] ml-0.5">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
