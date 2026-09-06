import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import { Tag, FileText } from 'lucide-react';

const editSchema = z.object({
  name: z.string().min(1, 'Informe o nome da transação'),
  category: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onUpdateTransaction: (data: { id: number; name: string; category: string }) => Promise<any>;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdateTransaction,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      category: '',
    },
  });

  useEffect(() => {
    if (transaction) {
      reset({
        name: transaction.name,
        category: transaction.category === 'Sem categoria' ? '' : transaction.category,
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data: EditFormValues) => {
    if (!transaction) return;

    const formattedCategory = data.category?.trim() ? data.category.trim() : 'Sem categoria';

    try {
      await onUpdateTransaction({
        id: transaction.id,
        name: data.name.trim(),
        category: formattedCategory,
      });
      onClose();
    } catch (error) {
      // Toast já tratado no hook
    }
  };

  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Transação" maxWidth="md">
      {/* Resumo da Transação */}
      <div className="mb-5 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge type={transaction.type} />
          <span className="text-xs text-slate-400 font-medium">{formatDate(transaction.date)}</span>
          {transaction.installments > 1 && (
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              {transaction.currentInstallment ? `${transaction.currentInstallment}/${transaction.installments}` : `${transaction.installments}x`}
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-slate-100">
          {formatCurrency(transaction.price)}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <Input
          label="Nome da Transação"
          placeholder="Ex.: Supermercado, Aluguel"
          leftIcon={<FileText className="w-4 h-4 text-slate-400" />}
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Categoria */}
        <Input
          label="Categoria"
          placeholder="Ex.: Alimentação, Moradia (ou deixe vazio para Sem categoria)"
          leftIcon={<Tag className="w-4 h-4 text-slate-400" />}
          error={errors.category?.message}
          {...register('category')}
        />

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
};
