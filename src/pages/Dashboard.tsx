import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useUserActions } from '../hooks/useUserActions';
import { Header } from '../components/layout/Header';
import { MonthNavigator } from '../components/transactions/MonthNavigator';
import { GroupSelector } from '../components/transactions/GroupSelector';
import { TotalsSummary } from '../components/transactions/TotalsSummary';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { AddTransactionModal } from '../components/transactions/AddTransactionModal';
import { EditTransactionModal } from '../components/transactions/EditTransactionModal';
import { DeleteTransactionModal } from '../components/transactions/DeleteTransactionModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { Button } from '../components/common/Button';
import { Transaction } from '../types';
import { Plus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Cálculo inicial do mês/ano baseado no dia de fechamento da fatura
  const [currentDate] = useState(() => {
    const now = new Date();
    const day = now.getDate();
    const closingDate = user?.invoiceClosingDate || 1;
    let month = now.getMonth() + 1; // 1-12
    let year = now.getFullYear();

    if (day >= closingDate) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return { month, year };
  });

  const [month, setMonth] = useState<number>(currentDate.month);
  const [year, setYear] = useState<number>(currentDate.year);
  const [selectedGroup, setSelectedGroup] = useState<string>('Dia a dia');

  // Controle de Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Hooks de Dados e Ações
  const {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isDeleting,
    creditTotal,
    debitTotal,
  } = useTransactions(month, year, selectedGroup);

  const {
    depositIncome,
    isDepositing,
    payInvoice,
    isPayingInvoice,
  } = useUserActions();

  // Navegação de Mês
  const handlePrevMonth = () => {
    if (month > 1) {
      setMonth(month - 1);
    } else {
      setMonth(12);
      setYear(year - 1);
    }
  };

  const handleNextMonth = () => {
    if (month < 12) {
      setMonth(month + 1);
    } else {
      setMonth(1);
      setYear(year + 1);
    }
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header com Saldo e Menu */}
      <Header
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onDepositIncome={() => depositIncome()}
        onPayInvoice={() => payInvoice(creditTotal)}
        isDepositing={isDepositing}
        isPaying={isPayingInvoice}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Barra Superior: Filtro de Grupo, Navegação de Mês e Botão de Adição */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <GroupSelector
              groups={user?.transactionGroups || []}
              selectedGroup={selectedGroup}
              onSelectGroup={(grp) => setSelectedGroup(grp)}
            />
          </div>

          <div className="flex-1 max-w-md mx-auto w-full">
            <MonthNavigator
              month={month}
              year={year}
              selectedGroup={selectedGroup}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Transação</span>
            </Button>
          </div>
        </div>

        {/* Resumo de Totais: Fatura e Débitos */}
        <TotalsSummary creditTotal={creditTotal} debitTotal={debitTotal} />

        {/* Grid Principal: Tabela de Transações e Gráfico de Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Tabela de Transações (Ocupa 2 colunas no desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <TransactionTable
              transactions={transactions}
              isLoading={isLoading}
              onDeleteClick={handleDeleteClick}
              onEditClick={(tx) => setTransactionToEdit(tx)}
            />
          </div>

          {/* Gráfico Donut de Categorias (Ocupa 1 coluna no desktop) */}
          <div className="lg:col-span-1">
            <CategoryDonutChart transactions={transactions} />
          </div>
        </div>
      </main>

      {/* Modal Adicionar Transação */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        groups={user?.transactionGroups || []}
        selectedGroup={selectedGroup}
        onAddTransaction={addTransaction}
      />

      {/* Modal Editar Transação */}
      <EditTransactionModal
        isOpen={!!transactionToEdit}
        onClose={() => setTransactionToEdit(null)}
        transaction={transactionToEdit}
        onUpdateTransaction={updateTransaction}
      />

      {/* Modal Confirmar Exclusão */}
      <DeleteTransactionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTransactionToDelete(null);
        }}
        transaction={transactionToDelete}
        onConfirmDelete={deleteTransaction}
        isDeleting={isDeleting}
      />

      {/* Modal de Configurações do Usuário */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
