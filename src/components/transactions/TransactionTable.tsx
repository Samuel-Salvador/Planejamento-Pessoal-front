import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';
import { Badge } from '../common/Badge';
import { CategoryBadge } from '../common/CategoryBadge';
import { formatCurrency, formatDate } from '../../utils';
import { Trash2, ShoppingBag, Pencil, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'date' | 'price' | 'category' | 'name';
type SortDirection = 'asc' | 'desc';

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
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // Padrão natural: 'desc' para preço (mais caras) e data (mais recentes), 'asc' para categoria e nome
      setSortDirection(field === 'price' || field === 'date' ? 'desc' : 'asc');
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (sortField === 'price') {
        const diff = Number(b.price) - Number(a.price);
        if (diff !== 0) return sortDirection === 'desc' ? diff : -diff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortField === 'category') {
        const catA = (a.category || 'Sem categoria').toLowerCase();
        const catB = (b.category || 'Sem categoria').toLowerCase();
        const cmp = catA.localeCompare(catB, 'pt-BR');
        if (cmp !== 0) return sortDirection === 'desc' ? -cmp : cmp;
        // Dentro da mesma categoria, ordena pelas mais caras primeiro
        return Number(b.price) - Number(a.price);
      }
      if (sortField === 'name') {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        const cmp = nameA.localeCompare(nameB, 'pt-BR');
        if (cmp !== 0) return sortDirection === 'desc' ? -cmp : cmp;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      // Padrão: Data
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const diff = dateB - dateA;
      return sortDirection === 'desc' ? diff : -diff;
    });
  }, [transactions, sortField, sortDirection]);

  const renderSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === 'desc' ? (
        <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
      );
    }
    return (
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 group-hover/th:text-slate-400 transition-colors" />
    );
  };

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
      {/* Barra superior de controle e ordenação rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Transações
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
            {transactions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="table-sort-select"
            className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer select-none"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Ordenar por:</span>
          </label>
          <select
            id="table-sort-select"
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-') as [SortField, SortDirection];
              setSortField(field);
              setSortDirection(dir);
            }}
            className="bg-slate-900 border border-slate-700/80 text-xs rounded-xl px-2.5 py-1 text-slate-200 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="date-desc">Data (Mais recentes)</option>
            <option value="date-asc">Data (Mais antigas)</option>
            <option value="price-desc">Preço (Mais caras)</option>
            <option value="price-asc">Preço (Mais baratas)</option>
            <option value="category-asc">Categoria (A - Z)</option>
            <option value="category-desc">Categoria (Z - A)</option>
            <option value="name-asc">Nome (A - Z)</option>
            <option value="name-desc">Nome (Z - A)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {/* Nome */}
              <th
                onClick={() => handleHeaderSort('name')}
                className="py-3.5 px-4 sm:px-6 cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                aria-sort={
                  sortField === 'name'
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                title="Clique para ordenar por Nome"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nome</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* Data */}
              <th
                onClick={() => handleHeaderSort('date')}
                className="py-3.5 px-4 cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                aria-sort={
                  sortField === 'date'
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                title="Clique para ordenar por Data"
              >
                <div className="flex items-center gap-1.5">
                  <span>Data</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              {/* Tipo */}
              <th className="py-3.5 px-4">Tipo</th>

              {/* Categoria */}
              <th
                onClick={() => handleHeaderSort('category')}
                className="py-3.5 px-4 cursor-pointer select-none group/th hover:text-slate-200 transition-colors"
                aria-sort={
                  sortField === 'category'
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                title="Clique para ordenar por Categoria"
              >
                <div className="flex items-center gap-1.5">
                  <span>Categoria</span>
                  {renderSortIcon('category')}
                </div>
              </th>

              {/* Parcelas */}
              <th className="py-3.5 px-4 text-center">Parcelas</th>

              {/* Preço */}
              <th
                onClick={() => handleHeaderSort('price')}
                className="py-3.5 px-4 cursor-pointer select-none group/th hover:text-slate-200 transition-colors text-right"
                aria-sort={
                  sortField === 'price'
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                title="Clique para ordenar por Preço (Mais caras / Mais baratas)"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Preço</span>
                  {renderSortIcon('price')}
                </div>
              </th>

              {/* Ação */}
              <th className="py-3.5 px-4 sm:px-6 text-center w-16">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {sortedTransactions.map((tx) => (
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
