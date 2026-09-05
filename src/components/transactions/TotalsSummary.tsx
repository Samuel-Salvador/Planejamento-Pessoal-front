import React from 'react';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils';
import { CreditCard, Wallet } from 'lucide-react';

interface TotalsSummaryProps {
  creditTotal: number;
  debitTotal: number;
}

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({
  creditTotal,
  debitTotal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Total Fatura */}
      <Card className="flex items-center gap-4 border-purple-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/20">
        <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs uppercase font-semibold tracking-wider text-purple-300/80">
            Total Fatura (Crédito)
          </p>
          <p className="text-xl sm:text-2xl font-bold text-purple-100">
            {formatCurrency(creditTotal)}
          </p>
        </div>
      </Card>

      {/* Total Débitos */}
      <Card className="flex items-center gap-4 border-amber-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20">
        <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs uppercase font-semibold tracking-wider text-amber-300/80">
            Total Débitos (Débito + Pix)
          </p>
          <p className="text-xl sm:text-2xl font-bold text-amber-100">
            {formatCurrency(debitTotal)}
          </p>
        </div>
      </Card>
    </div>
  );
};
