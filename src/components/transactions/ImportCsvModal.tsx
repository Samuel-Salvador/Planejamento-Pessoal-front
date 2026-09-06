import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Layers,
  Info,
} from 'lucide-react';
import {
  parseNubankCsv,
  ParsedCsvTransaction,
  IgnoredCsvRow,
} from '../../utils/csvParser';
import { formatCurrency, formatDate, MONTH_NAMES } from '../../utils';
import { TransactionType } from '../../types';
import { CreateTransactionDTO } from '../../hooks/useTransactions';
import { toast } from 'sonner';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: string[];
  selectedGroup: string;
  month: number;
  year: number;
  existingCount: number;
  onImportBatch: (params: {
    items: CreateTransactionDTO[];
    replaceMonth?: boolean;
    month?: number;
    year?: number;
  }) => Promise<any>;
  isImporting: boolean;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  groups,
  selectedGroup,
  month,
  year,
  existingCount,
  onImportBatch,
  isImporting,
}) => {
  const allGroups = useMemo(
    () => Array.from(new Set(['Dia a dia', ...(groups || [])])),
    [groups]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<ParsedCsvTransaction[]>([]);
  const [ignoredItems, setIgnoredItems] = useState<IgnoredCsvRow[]>([]);
  const [showIgnored, setShowIgnored] = useState(false);

  // Filtros em lote para aplicar a todos os selecionados
  const [bulkType, setBulkType] = useState<TransactionType | ''>('');
  const [bulkGroup, setBulkGroup] = useState<string>('');

  const resetState = () => {
    setFile(null);
    setItems([]);
    setIgnoredItems([]);
    setShowIgnored(false);
    setBulkType('');
    setBulkGroup('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileProcess = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo válido com extensão .csv');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        toast.error('O arquivo selecionado está vazio.');
        return;
      }

      try {
        const { validItems, ignoredItems: ignored } = parseNubankCsv(
          content,
          selectedGroup || 'Dia a dia'
        );

        if (validItems.length === 0 && ignored.length === 0) {
          toast.error('Nenhuma transação foi identificada no arquivo.');
          return;
        }

        setFile(selectedFile);
        setItems(validItems);
        setIgnoredItems(ignored);

        if (validItems.length > 0) {
          toast.success(
            `${validItems.length} transações prontas para revisão!`
          );
        } else {
          toast.warning('Nenhuma transação válida para importar.');
        }
      } catch (err) {
        console.error('Erro ao processar CSV:', err);
        toast.error('Falha ao processar o arquivo CSV.');
      }
    };

    reader.readAsText(selectedFile, 'UTF-8');
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileProcess(droppedFile);
    }
  };

  // Seleção e edição de linhas
  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items]);
  const isAllSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleSelectAll = () => {
    const nextState = !isAllSelected;
    setItems((prev) => prev.map((item) => ({ ...item, selected: nextState })));
  };

  const toggleSelectItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateItemField = <K extends keyof ParsedCsvTransaction>(
    id: string,
    field: K,
    value: ParsedCsvTransaction[K]
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Aplicação em lote
  const handleApplyBulkType = (type: TransactionType) => {
    if (!type) return;
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, type } : item))
    );
    toast.success(`Tipo alterado para "${type}" nos selecionados.`);
    setBulkType('');
  };

  const handleApplyBulkGroup = (group: string) => {
    if (!group) return;
    setItems((prev) =>
      prev.map((item) => (item.selected ? { ...item, group } : item))
    );
    toast.success(`Grupo alterado para "${group}" nos selecionados.`);
    setBulkGroup('');
  };

  // Somatório das transações selecionadas
  const totalSelectedAmount = useMemo(
    () => selectedItems.reduce((acc, curr) => acc + curr.price, 0),
    [selectedItems]
  );

  const handleImport = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Selecione pelo menos uma transação para importar.');
      return;
    }

    const payload: CreateTransactionDTO[] = selectedItems.map((item) => ({
      name: item.name.trim() || 'Transação sem nome',
      date: item.date,
      price: item.price,
      installments: item.installments,
      category: item.category.trim() || 'Sem categoria',
      type: item.type,
      group: item.group,
    }));

    try {
      await onImportBatch({
        items: payload,
        replaceMonth: true,
        month,
        year,
      });
      handleClose();
    } catch {
      // toast de erro gerenciado pelo hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Fatura via CSV (Nubank)"
      maxWidth="5xl"
    >
      <div className="space-y-5">
        {/* Passo 1: Seleção do arquivo (se nenhum arquivo carregado) */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-950/20'
                : 'border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) handleFileProcess(picked);
              }}
            />

            <div className="mx-auto w-16 h-16 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Upload className="w-8 h-8" />
            </div>

            <h4 className="text-base font-medium text-slate-100 mb-1">
              Arraste e solte seu arquivo .csv do Nubank aqui
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              ou clique para selecionar do seu computador
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Arquivo modelo: Nubank (Data, Descrição, Valor)</span>
            </div>

            <div className="mt-4 max-w-md mx-auto text-left text-xs text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1">
              <p className="font-semibold text-slate-300">Regras de negócio automáticas:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Ignora automaticamente pagamentos de fatura e estornos.</li>
                <li>Importa compras parceladas <strong>somente na 1ª parcela</strong> (ex: Parcela 1/10).</li>
                <li>Parcelas seguintes (ex: 2/10, 3/10) são ignoradas para evitar duplicidade.</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Passo 2: Pré-visualização e Configuração em Lote */
          <div className="space-y-4">
            {/* Barra de resumo do arquivo e métricas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">
                      {file.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {items.length} encontradas
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium">
                      {selectedItems.length} selecionadas
                    </span>{' '}
                    • Soma total:{' '}
                    <span className="text-slate-100 font-semibold">
                      {formatCurrency(totalSelectedAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetState}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Trocar arquivo</span>
                </button>
              </div>
            </div>

            {/* Aviso de substituição do mês quando já existem transações */}
            {existingCount > 0 && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-blue-300">
                    Substituição de Fatura ({MONTH_NAMES[month - 1]} de {year}):
                  </span>{' '}
                  <span>
                    Existem {existingCount} transações cadastradas neste mês. Ao confirmar, as despesas de cartão deste mês serão substituídas pelas do CSV. Parcelas de compras de meses anteriores e transações em Débito/Pix serão preservadas.
                  </span>
                </div>
              </div>
            )}

            {/* Alerta de Itens Ignorados (se houver) */}
            {ignoredItems.length > 0 && (
              <div className="border border-amber-900/40 bg-amber-950/20 rounded-xl p-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowIgnored(!showIgnored)}
                  className="w-full flex items-center justify-between text-left text-amber-300 font-medium hover:text-amber-200"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>
                      {ignoredItems.length} {ignoredItems.length === 1 ? 'item ignorado' : 'itens ignorados'}{' '}
                      (pagamentos de fatura ou parcelas posteriores)
                    </span>
                  </div>
                  {showIgnored ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showIgnored && (
                  <div className="mt-3 pt-3 border-t border-amber-900/30 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {ignoredItems.map((ign, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800/60"
                      >
                        <div>
                          <span className="text-slate-300 font-medium">{ign.title}</span>
                          <span className="text-slate-500 ml-2">({formatDate(ign.date)})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-amber-400/90 mr-2">{ign.reason}</span>
                          <span className="text-slate-400 font-mono">{ign.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Barra de Ações em Massa */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <label
                  htmlFor="select-all"
                  className="text-xs font-medium text-slate-300 cursor-pointer select-none"
                >
                  Selecionar todas ({items.length})
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Aplicar aos selecionados:
                </span>

                {/* Bulk Type */}
                <select
                  value={bulkType}
                  onChange={(e) => {
                    const val = e.target.value as TransactionType;
                    if (val) handleApplyBulkType(val);
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Alterar Tipo...</option>
                  <option value="Crédito">Crédito</option>
                  <option value="Débito">Débito</option>
                  <option value="Pix">Pix</option>
                </select>

                {/* Bulk Group */}
                <select
                  value={bulkGroup}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) handleApplyBulkGroup(val);
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Alterar Grupo...</option>
                  {allGroups.map((grp) => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabela de Revisão das Transações */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <div className="max-h-[380px] overflow-y-auto overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10 text-slate-400 font-medium">
                    <tr>
                      <th className="p-2.5 w-8 text-center"></th>
                      <th className="p-2.5 w-24">Data</th>
                      <th className="p-2.5 min-w-[180px]">Descrição</th>
                      <th className="p-2.5 w-32">Valor Total</th>
                      <th className="p-2.5 w-24">Tipo</th>
                      <th className="p-2.5 w-28">Grupo</th>
                      <th className="p-2.5 min-w-[140px]">Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.selected
                            ? 'hover:bg-slate-900/60'
                            : 'opacity-50 bg-slate-950/60 hover:bg-slate-900/30'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                          />
                        </td>

                        {/* Data */}
                        <td className="p-2.5 text-slate-300 whitespace-nowrap font-mono">
                          {formatDate(item.date)}
                        </td>

                        {/* Descrição (Editável) */}
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateItemField(item.id, 'name', e.target.value)
                            }
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </td>

                        {/* Valor e Parcelas */}
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="font-medium text-slate-200">
                            {formatCurrency(item.price)}
                          </div>
                          {item.installments > 1 && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 mt-0.5">
                              {item.installments}x de {formatCurrency(item.price / item.installments)}
                            </span>
                          )}
                        </td>

                        {/* Tipo */}
                        <td className="p-2.5">
                          <select
                            value={item.type}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                'type',
                                e.target.value as TransactionType
                              )
                            }
                            className="bg-slate-900/80 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="Crédito">Crédito</option>
                            <option value="Débito">Débito</option>
                            <option value="Pix">Pix</option>
                          </select>
                        </td>

                        {/* Grupo */}
                        <td className="p-2.5">
                          <select
                            value={item.group}
                            onChange={(e) =>
                              updateItemField(item.id, 'group', e.target.value)
                            }
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
                          >
                            {allGroups.map((grp) => (
                              <option key={grp} value={grp}>
                                {grp}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Categoria (Editável) */}
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) =>
                              updateItemField(item.id, 'category', e.target.value)
                            }
                            placeholder="Sem categoria"
                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {file && (
              <span>
                {selectedItems.length} de {items.length} selecionadas para envio
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              Cancelar
            </Button>

            {file && (
              <Button
                type="button"
                onClick={handleImport}
                isLoading={isImporting}
                disabled={selectedItems.length === 0}
              >
                <Check className="w-4 h-4 mr-1" />
                <span>
                  {existingCount > 0 ? 'Substituir e Importar' : 'Importar'} ({selectedItems.length})
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
