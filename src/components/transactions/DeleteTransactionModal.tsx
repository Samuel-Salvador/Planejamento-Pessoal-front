import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import { AlertTriangle } from 'lucide-react';

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirmDelete: (transaction: Transaction) => Promise<any>;
  isDeleting: boolean;
}

export const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirmDelete,
  isDeleting,
}) => {
  if (!transaction) return null;

  const isRefundable = transaction.type === 'Pix' || transaction.type === 'Débito';

  const handleConfirm = async () => {
    try {
      await onConfirmDelete(transaction);
      onClose();
    } catch {
      // erro tratado no hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir Transação" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <p className="text-xs leading-relaxed">
            Tem certeza que deseja excluir esta transação?
            {isRefundable && (
              <span className="block mt-1 font-semibold text-emerald-400">
                O valor de {formatCurrency(transaction.price)} será estornado ao seu saldo.
              </span>
            )}
          </p>
        </div>

        {/* Detalhes da transação */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Nome:</span>
            <span className="font-semibold text-slate-100 text-sm">{transaction.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Data:</span>
            <span className="text-slate-200">{formatDate(transaction.date)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Tipo:</span>
            <Badge type={transaction.type} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Categoria:</span>
            <span className="text-slate-200">{transaction.category || 'Geral'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Preço:</span>
            <span className="font-bold text-rose-400 text-sm">
              {formatCurrency(transaction.price)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
};
