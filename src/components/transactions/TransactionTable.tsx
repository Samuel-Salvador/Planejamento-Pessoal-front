import React from 'react';
import { Transaction } from '../../types';
import { Badge } from '../common/Badge';
import { CategoryBadge } from '../common/CategoryBadge';
import { formatCurrency, formatDate } from '../../utils';
import { Trash2, ShoppingBag, Pencil } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDeleteClick: (transaction: Transaction) => void;
  onEditClick: (transaction: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  onDeleteClick,
  onEditClick,
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Carregando transações...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-4">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h4 className="text-base font-semibold text-slate-200 mb-1">Nenhuma transação encontrada</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Não há transações cadastradas para este período ou grupo. Clique no botão "+" para adicionar sua primeira despesa!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 sm:px-6">Nome</th>
              <th className="py-3.5 px-4">Data</th>
              <th className="py-3.5 px-4">Tipo</th>
              <th className="py-3.5 px-4">Categoria</th>
              <th className="py-3.5 px-4 text-center">Parcelas</th>
              <th className="py-3.5 px-4 text-right">Preço</th>
              <th className="py-3.5 px-4 sm:px-6 text-center w-16">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-slate-800/30 transition-colors group"
              >
                <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-100">
                  {tx.name}
                </td>
                <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge type={tx.type} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <CategoryBadge category={tx.category} />
                </td>
                <td className="py-3.5 px-4 text-slate-300 text-center whitespace-nowrap text-xs">
                  {tx.currentInstallment ? `${tx.currentInstallment}/${tx.installments}` : `${tx.installments || 1}x`}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-slate-100 whitespace-nowrap">
                  {formatCurrency(tx.price)}
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEditClick(tx)}
                      className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors"
                      title="Editar transação (nome e categoria)"
                      aria-label={`Editar transação ${tx.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClick(tx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Excluir transação"
                      aria-label={`Excluir transação ${tx.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
