export type TransactionType = 'income' | 'expense';
export type PeriodKey = 'month' | '3m' | '6m' | 'year';

export interface Transaction {
  id: string;
  description: string;
  /** Valor em centavos, sempre positivo. */
  amount: number;
  type: TransactionType;
  category: string;
  /** Data civil no formato YYYY-MM-DD, sem deslocamento de fuso. */
  date: string;
}

export interface Ledger {
  transactions: Transaction[];
  isDemo: boolean;
}

export interface CategoryTotal {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlyTotal {
  month: string;
  income: number;
  expense: number;
}
