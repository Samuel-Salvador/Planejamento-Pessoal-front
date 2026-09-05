import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Settings, 
  LogOut, 
  TrendingUp, 
  CreditCard,
  User as UserIcon 
} from 'lucide-react';
import logoImg from '../../assets/Logo.png';

interface HeaderProps {
  onOpenSettings: () => void;
  onDepositIncome: () => void;
  onPayInvoice: () => void;
  isDepositing?: boolean;
  isPaying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onDepositIncome,
  onPayInvoice,
  isDepositing,
  isPaying,
}) => {
  const { user, logout } = useAuth();
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 select-none">
          <img
            src={logoImg}
            alt="Planejamento Pessoal"
            className="w-10 h-10 object-contain drop-shadow"
          />
          <div>
            <h1 className="font-brand text-lg sm:text-xl font-bold leading-tight tracking-wide text-slate-100">
              Planejamento <span className="text-emerald-400">Pessoal</span>
            </h1>
          </div>
        </div>

        {/* Right Section: Balance & User Menu */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Balance Widget */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-800/90 px-3.5 py-1.5 rounded-2xl shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Saldo
              </span>
              <span className="text-sm sm:text-base font-semibold text-emerald-400 min-w-[5.5rem]">
                {showBalance ? formatCurrency(user?.balance) : '•••••••••'}
              </span>
            </div>

            {/* Toggle Balance Visibility */}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
              aria-label="Alternar visibilidade do saldo"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* Quick Actions (+ Salário / - Fatura) */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onDepositIncome}
                disabled={isDepositing}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/60 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                title="Depositar salário no saldo"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>+Salário</span>
              </button>

              <button
                onClick={onPayInvoice}
                disabled={isPaying}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-rose-950/60 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                title="Debitar valor da fatura do saldo"
              >
                <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                <span>-Fatura</span>
              </button>
            </div>
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-900 text-slate-200 transition-colors border border-transparent hover:border-slate-800"
              aria-expanded={isDropdownOpen}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-semibold text-xs">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium hidden md:inline-block max-w-[120px] truncate">
                {user?.username}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs text-slate-400">Conectado como</p>
                  <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || user?.username}</p>
                </div>

                {/* Mobile Quick Actions */}
                <div className="sm:hidden px-2 py-1 space-y-1 border-b border-slate-800/80 mb-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onDepositIncome();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-950/40 rounded-xl"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>+ Adicionar Salário</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onPayInvoice();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-xl"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>- Pagar Fatura</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Configurações</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
