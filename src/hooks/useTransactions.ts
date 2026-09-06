import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Transaction, TransactionType } from '../types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export interface CreateTransactionDTO {
  name: string;
  date: string;
  price: number;
  installments: number;
  category: string;
  type: TransactionType;
  group: string;
}

export function useTransactions(month: number, year: number, group: string) {
  const { user, userId, refetchUser } = useAuth();
  const queryClient = useQueryClient();

  const isGroupFilter = group && group !== 'Dia a dia';

  const queryKey = ['transactions', userId, isGroupFilter ? group : `${month}-${year}`];

  const transactionsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) return [];
      const endpoint = isGroupFilter
        ? `transactions/${userId}/${encodeURIComponent(group)}`
        : `transactions/${userId}/${month}/${year}`;
      
      const response = await api.get<Transaction[]>(endpoint);
      return response.data || [];
    },
    enabled: !!userId,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: CreateTransactionDTO) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');

      // Se for Débito ou Pix, debitar do saldo do usuário conforme regra original
      if (data.type === 'Débito' || data.type === 'Pix') {
        const newBalance = (user.balance || 0) - Number(data.price);
        await api.put(`users/${userId}`, {
          balance: newBalance,
          invoiceClosingDate: user.invoiceClosingDate,
        });
      }

      const response = await api.post<Transaction>('transactions', {
        ...data,
        price: Number(data.price),
        installments: Number(data.installments),
        userId,
      });

      return response.data;
    },
    onSuccess: async () => {
      toast.success('Transação adicionada com sucesso!');
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await refetchUser();
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação. Verifique os dados e tente novamente.');
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');

      // Se for Débito ou Pix, estornar o valor ao saldo do usuário conforme regra original
      if (transaction.type === 'Débito' || transaction.type === 'Pix') {
        const newBalance = (user.balance || 0) + Number(transaction.price);
        await api.put(`users/${userId}`, {
          balance: newBalance,
          invoiceClosingDate: user.invoiceClosingDate,
        });
      }

      await api.delete(`transactions/${transaction.id}`);
      return transaction.id;
    },
    onSuccess: async () => {
      toast.success('Transação removida com sucesso!');
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await refetchUser();
    },
    onError: (error: any) => {
      console.error('Erro ao remover transação:', error);
      toast.error('Erro ao remover transação. Tente novamente.');
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: { id: number; name?: string; category?: string }) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');

      const response = await api.put<Transaction>(`transactions/${data.id}`, {
        name: data.name?.trim(),
        category: data.category?.trim() || 'Sem categoria',
      });

      return response.data;
    },
    onSuccess: async () => {
      toast.success('Transação atualizada com sucesso!');
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação. Tente novamente.');
    },
  });

  const importBatchMutation = useMutation({
    mutationFn: async (items: CreateTransactionDTO[]) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');

      // Se houver transações do tipo Débito ou Pix, debitar do saldo do usuário conforme regra de negócio
      const debitSum = items
        .filter((t) => t.type === 'Débito' || t.type === 'Pix')
        .reduce((acc, curr) => acc + Number(curr.price), 0);

      if (debitSum > 0) {
        const newBalance = (user.balance || 0) - debitSum;
        await api.put(`users/${userId}`, {
          balance: newBalance,
          invoiceClosingDate: user.invoiceClosingDate,
        });
      }

      const payload = items.map((item) => ({
        ...item,
        price: Number(item.price),
        installments: Number(item.installments),
        userId,
      }));

      const response = await api.post<Transaction[]>('transactions/batch', payload);
      return response.data;
    },
    onSuccess: async (data) => {
      toast.success(`${data.length} transações importadas com sucesso!`);
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await refetchUser();
    },
    onError: (error: any) => {
      console.error('Erro ao importar transações em lote:', error);
      toast.error('Erro ao importar transações. Verifique os dados e tente novamente.');
    },
  });

  // Cálculos dinâmicos
  const transactions = transactionsQuery.data || [];

  const creditTotal = transactions
    .filter((t) => t.type === 'Crédito')
    .reduce((acc, curr) => acc + Number(curr.price), 0);

  const debitTotal = transactions
    .filter((t) => t.type === 'Débito' || t.type === 'Pix')
    .reduce((acc, curr) => acc + Number(curr.price), 0);

  return {
    transactions,
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,
    addTransaction: addTransactionMutation.mutateAsync,
    isAdding: addTransactionMutation.isPending,
    updateTransaction: updateTransactionMutation.mutateAsync,
    isUpdating: updateTransactionMutation.isPending,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isDeleting: deleteTransactionMutation.isPending,
    importBatchTransactions: importBatchMutation.mutateAsync,
    isImportingBatch: importBatchMutation.isPending,
    creditTotal,
    debitTotal,
  };
}
