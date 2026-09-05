import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useUserActions } from '../../hooks/useUserActions';
import { formatDate } from '../../utils';
import { User, FolderPlus, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'account' | 'groups' | 'delete_account';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    updateProfile,
    isUpdatingProfile,
    addGroup,
    isAddingGroup,
    removeGroup,
    isRemovingGroup,
    deleteAccount,
    isDeletingAccount,
  } = useUserActions();

  const [activeTab, setActiveTab] = useState<TabType>('account');

  // Account form state
  const [income, setIncome] = useState<string>(user?.income !== undefined ? String(user.income) : '');
  const [balance, setBalance] = useState<string>(user?.balance !== undefined ? String(user.balance) : '');
  const [closingDate, setClosingDate] = useState<number>(user?.invoiceClosingDate || 1);

  // Group form state
  const [newGroupName, setNewGroupName] = useState<string>('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        income: income !== '' ? Number(income) : undefined,
        balance: balance !== '' ? Number(balance) : undefined,
        invoiceClosingDate: Number(closingDate),
      });
    } catch {
      // Toast disparado no hook
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast.error('Informe um nome para o grupo.');
      return;
    }
    if (user?.transactionGroups?.includes(newGroupName.trim())) {
      toast.error('Este grupo já existe.');
      return;
    }
    try {
      await addGroup(newGroupName.trim());
      setNewGroupName('');
    } catch {
      // Toast disparado no hook
    }
  };

  const handleRemoveGroup = async (group: string) => {
    if (group === 'Dia a dia') {
      toast.error('O grupo padrão "Dia a dia" não pode ser removido.');
      return;
    }
    try {
      await removeGroup(group);
    } catch {
      // Toast disparado no hook
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      onClose();
    } catch {
      // Toast disparado no hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações do Usuário" maxWidth="lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <nav className="flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4 min-w-[140px]">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'account'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Dados</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'groups'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Grupos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delete_account')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === 'delete_account'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir Conta</span>
          </button>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {/* ABA DADOS DO USUÁRIO */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Input
                  label="Nome"
                  value={user?.name || ''}
                  disabled
                  className="bg-slate-950/40 text-slate-400 cursor-not-allowed"
                />
                <Input
                  label="Nome de Usuário"
                  value={user?.username || ''}
                  disabled
                  className="bg-slate-950/40 text-slate-400 cursor-not-allowed"
                />
                <Input
                  label="Data de Nascimento"
                  value={formatDate(user?.birthday || '')}
                  disabled
                  className="bg-slate-950/40 text-slate-400 cursor-not-allowed"
                />
                <Input
                  label="E-mail"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-950/40 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="h-px bg-slate-800/80 my-3" />

              <div className="space-y-3">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Configurações Financeiras
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Salário Mensal (R$)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 3500.00"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                  <Input
                    label="Saldo Atual (R$)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1250.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                  />
                </div>

                <Select
                  label="Dia de Fechamento da Fatura"
                  value={closingDate}
                  onChange={(e) => setClosingDate(Number(e.target.value))}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Dia {day}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" isLoading={isUpdatingProfile} size="sm">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}

          {/* ABA GRUPOS */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">Grupos de Transações</h4>
                <p className="text-xs text-slate-400">
                  Crie grupos para categorizar despesas específicas (ex: Viagem, Reforma, Casamento).
                </p>
              </div>

              <form onSubmit={handleAddGroup} className="flex gap-2">
                <Input
                  placeholder="Novo grupo... Ex: Viagem Rio 2025"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" isLoading={isAddingGroup} size="sm" className="whitespace-nowrap">
                  Adicionar
                </Button>
              </form>

              {/* Lista de grupos */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 max-h-52 overflow-y-auto space-y-1.5">
                {user?.transactionGroups?.map((group) => {
                  const isDefault = group === 'Dia a dia';
                  return (
                    <div
                      key={group}
                      className="flex items-center justify-between px-3 py-2 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs"
                    >
                      <span className="font-medium text-slate-200">
                        {group}{' '}
                        {isDefault && (
                          <span className="text-[10px] text-emerald-400 ml-1.5 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            Padrão
                          </span>
                        )}
                      </span>

                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGroup(group)}
                          disabled={isRemovingGroup}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/30 transition-colors"
                          title="Remover grupo"
                          aria-label={`Remover grupo ${group}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA EXCLUIR CONTA */}
          {activeTab === 'delete_account' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-rose-400 text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Zona de Perigo</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Tem certeza que deseja excluir sua conta? Esta ação é{' '}
                  <strong className="text-rose-200 underline">permanente e irreversível</strong>. Todas as
                  suas transações, grupos e dados cadastrais serão permanentemente apagados.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeleteAccount}
                  isLoading={isDeletingAccount}
                  size="sm"
                >
                  Excluir Minha Conta Definitivamente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
