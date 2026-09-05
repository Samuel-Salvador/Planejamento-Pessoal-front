import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { TransactionType } from '../../types';
import { CreateTransactionDTO } from '../../hooks/useTransactions';

const transactionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  installments: z.coerce.number().int().min(1, 'Mínimo de 1 parcela'),
  type: z.enum(['Crédito', 'Débito', 'Pix']),
  group: z.string().min(1, 'Grupo é obrigatório'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: string[];
  selectedGroup: string;
  onAddTransaction: (data: CreateTransactionDTO) => Promise<any>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  groups,
  selectedGroup,
  onAddTransaction,
}) => {
  const allGroups = Array.from(new Set(['Dia a dia', ...(groups || [])]));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      price: '' as any,
      installments: 1,
      type: 'Crédito',
      group: selectedGroup || 'Dia a dia',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      await onAddTransaction(data);
      reset();
      onClose();
    } catch (error) {
      // O toast de erro é disparado pelo hook
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar Transação" maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <Input
          label="Nome da Transação"
          placeholder="Ex.: Mercado, Gasolina, Netflix"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Categoria */}
        <Input
          label="Categoria"
          placeholder="Ex.: Alimentação, Transporte, Lazer"
          error={errors.category?.message}
          {...register('category')}
        />

        {/* Linha dupla: Data e Parcelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
          <Input
            label="Parcelas"
            type="number"
            min="1"
            placeholder="1"
            error={errors.installments?.message}
            {...register('installments')}
          />
        </div>

        {/* Preço */}
        <Input
          label="Preço (R$)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.price?.message}
          {...register('price')}
        />

        {/* Tipo (Crédito, Débito, Pix) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Tipo de Pagamento</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Crédito', 'Débito', 'Pix'] as TransactionType[]).map((t) => {
              const isSelected = selectedType === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setValue('type', t)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {errors.type && <p className="text-xs text-rose-400">{errors.type.message}</p>}
        </div>

        {/* Grupo */}
        <Select
          label="Grupo de Transação"
          error={errors.group?.message}
          {...register('group')}
        >
          {allGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
