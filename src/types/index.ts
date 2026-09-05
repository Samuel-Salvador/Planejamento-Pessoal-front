export type TransactionType = 'Crédito' | 'Débito' | 'Pix';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  birthday: string;
  password?: string;
  balance: number;
  income: number;
  invoiceClosingDate: number;
  transactionGroups: string[];
}

export interface Transaction {
  id: number;
  name: string;
  date: string;
  price: number;
  installments: number;
  currentInstallment?: number;
  category: string;
  type: TransactionType;
  group: string;
  userId: number;
}

export interface LoginResponse {
  token: string;
}

export interface DecodedToken {
  id: number;
  iat?: number;
  exp?: number;
}
