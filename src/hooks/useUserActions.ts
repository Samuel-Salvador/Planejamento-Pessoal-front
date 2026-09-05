import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export interface UpdateUserDataDTO {
  income?: number;
  balance?: number;
  invoiceClosingDate?: number;
}

export function useUserActions() {
  const { user, userId, refetchUser, logout } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserDataDTO) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');
      
      const payload: Record<string, any> = {
        invoiceClosingDate: data.invoiceClosingDate ?? user.invoiceClosingDate,
      };

      if (data.income !== undefined && !isNaN(data.income)) {
        payload.income = Number(data.income);
      }
      if (data.balance !== undefined && !isNaN(data.balance)) {
        payload.balance = Number(data.balance);
      }

      const response = await api.put(`users/${userId}`, payload);
      return response.data;
    },
    onSuccess: async () => {
      toast.success('Dados salvos com sucesso!');
      await refetchUser();
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao salvar dados. Verifique os valores digitados.');
    },
  });

  const depositIncomeMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !user) throw new Error('Usuário não autenticado');
      const newBalance = Number(user.balance || 0) + Number(user.income || 0);
      await api.put(`users/${userId}`, {
        balance: newBalance,
        invoiceClosingDate: user.invoiceClosingDate,
      });
      return newBalance;
    },
    onSuccess: async () => {
      toast.success('Salário adicionado ao saldo!');
      await refetchUser();
    },
    onError: () => {
      toast.error('Erro ao adicionar salário.');
    },
  });

  const payInvoiceMutation = useMutation({
    mutationFn: async (invoiceTotal: number) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');
      const newBalance = Number(user.balance || 0) - Number(invoiceTotal);
      await api.put(`users/${userId}`, {
        balance: newBalance,
        invoiceClosingDate: user.invoiceClosingDate,
      });
      return newBalance;
    },
    onSuccess: async () => {
      toast.success('Fatura debitada do saldo!');
      await refetchUser();
    },
    onError: () => {
      toast.error('Erro ao debitar fatura.');
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: async (groupName: string) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');
      await api.put(`users/${userId}`, {
        transactionGroup: groupName.trim(),
        invoiceClosingDate: user.invoiceClosingDate,
      });
    },
    onSuccess: async () => {
      toast.success('Grupo adicionado com sucesso!');
      await refetchUser();
    },
    onError: () => {
      toast.error('Erro ao adicionar grupo.');
    },
  });

  const removeGroupMutation = useMutation({
    mutationFn: async (groupName: string) => {
      if (!userId || !user) throw new Error('Usuário não autenticado');
      if (groupName === 'Dia a dia') {
        throw new Error('Não é possível remover o grupo padrão "Dia a dia".');
      }
      await api.put(`users/${userId}`, {
        transactionGroup: `-${groupName}`,
        invoiceClosingDate: user.invoiceClosingDate,
      });
    },
    onSuccess: async () => {
      toast.success('Grupo removido com sucesso!');
      await refetchUser();
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao remover grupo.');
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Usuário não autenticado');
      await api.delete(`users/${userId}`);
    },
    onSuccess: () => {
      toast.success('Conta excluída com sucesso.');
      logout();
    },
    onError: () => {
      toast.error('Erro ao excluir conta.');
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    depositIncome: depositIncomeMutation.mutateAsync,
    isDepositing: depositIncomeMutation.isPending,
    payInvoice: payInvoiceMutation.mutateAsync,
    isPayingInvoice: payInvoiceMutation.isPending,
    addGroup: addGroupMutation.mutateAsync,
    isAddingGroup: addGroupMutation.isPending,
    removeGroup: removeGroupMutation.mutateAsync,
    isRemovingGroup: removeGroupMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
