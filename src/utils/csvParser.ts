import { TransactionType } from '../types';

export interface ParsedCsvTransaction {
  id: string;
  name: string;
  date: string;
  price: number;
  installments: number;
  category: string;
  type: TransactionType;
  group: string;
  selected: boolean;
}

export interface IgnoredCsvRow {
  date: string;
  title: string;
  amount: string;
  reason: string;
}

export interface CsvParseResult {
  validItems: ParsedCsvTransaction[];
  ignoredItems: IgnoredCsvRow[];
  totalAmount: number;
}

/**
 * Faz o parse seguro de uma linha CSV respeitando aspas
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === ',' && !inQuote) {
      fields.push(currentField.trim().replace(/^"|"$/g, ''));
      currentField = '';
    } else {
      currentField += char;
    }
  }

  fields.push(currentField.trim().replace(/^"|"$/g, ''));
  return fields;
}

/**
 * Converte valor em formato string brasileiro ou padrão para número float
 * Ex: "1.249,50" -> 1249.50 | "- 3.372,60" -> -3372.60
 */
function parseCurrencyAmount(rawAmount: string): number {
  if (!rawAmount) return NaN;

  const isNegative = rawAmount.includes('-');
  // Remove tudo que não for dígito, ponto ou vírgula
  const cleaned = rawAmount.replace(/[^0-9,.]/g, '');

  let numericValue: number;

  if (cleaned.includes(',')) {
    // Formato brasileiro: 1.249,50 -> 1249.50
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    numericValue = parseFloat(normalized);
  } else {
    // Formato numérico direto com ponto: 1249.50
    numericValue = parseFloat(cleaned);
  }

  if (isNaN(numericValue)) return NaN;
  return isNegative ? -Math.abs(numericValue) : Math.abs(numericValue);
}

/**
 * Lê e processa um arquivo CSV de fatura do Nubank
 */
export function parseNubankCsv(
  csvContent: string,
  defaultGroup: string = 'Dia a dia'
): CsvParseResult {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { validItems: [], ignoredItems: [], totalAmount: 0 };
  }

  const validItems: ParsedCsvTransaction[] = [];
  const ignoredItems: IgnoredCsvRow[] = [];

  // Mapeamento dos cabeçalhos
  const headerFields = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const dateIdx = headerFields.findIndex((h) => h.includes('date') || h.includes('data'));
  const titleIdx = headerFields.findIndex(
    (h) => h.includes('title') || h.includes('titulo') || h.includes('descri')
  );
  const amountIdx = headerFields.findIndex(
    (h) => h.includes('amount') || h.includes('valor') || h.includes('preco')
  );

  const fallbackDateIdx = dateIdx !== -1 ? dateIdx : 0;
  const fallbackTitleIdx = titleIdx !== -1 ? titleIdx : 1;
  const fallbackAmountIdx = amountIdx !== -1 ? amountIdx : 2;

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < 2) continue;

    const date = fields[fallbackDateIdx] || new Date().toISOString().split('T')[0];
    const title = fields[fallbackTitleIdx] || 'Sem descrição';
    const rawAmount = fields[fallbackAmountIdx] || '0';

    const parsedPrice = parseCurrencyAmount(rawAmount);

    // 1. Filtro de pagamentos de fatura e valores negativos
    if (
      parsedPrice <= 0 ||
      /pagamento recebido/i.test(title) ||
      /pagamento efetuado/i.test(title)
    ) {
      ignoredItems.push({
        date,
        title,
        amount: rawAmount,
        reason: 'Pagamento recebido / estorno',
      });
      continue;
    }

    // 2. Filtro e detecção de parcelas (ex: "Mag*Magalu - Parcela 1/2")
    const installmentMatch = title.match(/^(.*?)\s*-\s*Parcela\s+(\d+)\/(\d+)\s*$/i);

    if (installmentMatch) {
      const cleanTitle = installmentMatch[1].trim();
      const currentInstallment = parseInt(installmentMatch[2], 10);
      const totalInstallments = parseInt(installmentMatch[3], 10);

      if (currentInstallment === 1) {
        // Primeira parcela: multiplica pelo total de parcelas para o backend dividir corretamente
        const totalPrice = Math.round(parsedPrice * totalInstallments * 100) / 100;

        validItems.push({
          id: `csv_${i}_${Date.now()}`,
          name: cleanTitle,
          date,
          price: totalPrice,
          installments: totalInstallments,
          category: 'Sem categoria',
          type: 'Crédito',
          group: defaultGroup,
          selected: true,
        });
      } else {
        // Parcelas 2, 3, etc: ignoradas pois pertencem a faturas anteriores
        ignoredItems.push({
          date,
          title,
          amount: rawAmount,
          reason: `Parcela ${currentInstallment}/${totalInstallments} (não é a 1ª parcela)`,
        });
      }
    } else {
      // Transação à vista (1x)
      validItems.push({
        id: `csv_${i}_${Date.now()}`,
        name: title.trim(),
        date,
        price: parsedPrice,
        installments: 1,
        category: 'Sem categoria',
        type: 'Crédito',
        group: defaultGroup,
        selected: true,
      });
    }
  }

  const totalAmount = validItems.reduce((acc, curr) => acc + curr.price, 0);

  return {
    validItems,
    ignoredItems,
    totalAmount,
  };
}
