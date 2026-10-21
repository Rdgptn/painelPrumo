import { createSeedTransactions } from '../data/seed';
import type { CategoryTotal, Ledger, MonthlyTotal, PeriodKey, Transaction } from '../types';

const STORAGE_KEY = 'prumo.ledger.v1';

export const expenseCategories = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Contas',
  'Outros',
];

export const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'];

const categoryColors: Record<string, string> = {
  Moradia: '#203f70',
  Alimentação: '#4c6f9e',
  Transporte: '#8298b5',
  Saúde: '#6c9b87',
  Lazer: '#c09a59',
  Educação: '#8d7da8',
  Contas: '#b97974',
  Salário: '#1c568d',
  Freelance: '#4d82b5',
  Investimentos: '#5e9273',
  Vendas: '#b48a50',
  Outros: '#9aa7b8',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' });

export function formatMoney(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
}

function formatDateForCsv(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Transaction>;
  return (
    typeof item.id === 'string' &&
    typeof item.description === 'string' &&
    item.description.trim().length > 0 &&
    typeof item.amount === 'number' &&
    Number.isSafeInteger(item.amount) &&
    item.amount > 0 &&
    (item.type === 'income' || item.type === 'expense') &&
    typeof item.category === 'string' &&
    isValidIsoDate(item.date)
  );
}

function cleanTransactions(value: unknown): Transaction[] {
  return Array.isArray(value) ? value.filter(isTransaction) : [];
}

export function readLedger(): Ledger {
  if (typeof window === 'undefined') {
    return { transactions: createSeedTransactions(), isDemo: true };
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { transactions: createSeedTransactions(), isDemo: true };

    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(parsed)) return { transactions: cleanTransactions(parsed), isDemo: false };

    if (parsed && typeof parsed === 'object' && 'transactions' in parsed) {
      const stored = parsed as { transactions: unknown; isDemo?: unknown };
      return {
        transactions: cleanTransactions(stored.transactions),
        isDemo: stored.isDemo === true,
      };
    }
  } catch {
    return { transactions: [], isDemo: false };
  }

  return { transactions: [], isDemo: false };
}

export function saveLedger(ledger: Ledger): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ledger));
  } catch {
    // Alguns navegadores limitam o armazenamento no modo privado.
  }
}

export function getPeriodStart(period: PeriodKey, now = new Date()): Date {
  if (period === 'year') return new Date(now.getFullYear(), 0, 1);
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);

  const months = period === '3m' ? 3 : 6;
  return new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
}

function dateFromIso(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function filterByPeriod(
  transactions: Transaction[],
  period: PeriodKey,
  now = new Date(),
): Transaction[] {
  const start = getPeriodStart(period, now);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return transactions.filter((item) => {
    const date = dateFromIso(item.date);
    return date >= start && date <= end;
  });
}

export function summarize(transactions: Transaction[]) {
  const totals = transactions.reduce(
    (result, item) => {
      result[item.type] += item.amount;
      return result;
    },
    { income: 0, expense: 0 },
  );

  return {
    ...totals,
    balance: totals.income - totals.expense,
  };
}

function monthKey(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

export function buildMonthlyTotals(
  transactions: Transaction[],
  period: PeriodKey,
  now = new Date(),
): MonthlyTotal[] {
  const start = getPeriodStart(period, now);
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totals = new Map<number, MonthlyTotal>();

  for (
    let date = new Date(start.getFullYear(), start.getMonth(), 1);
    date <= currentMonth;
    date = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  ) {
    totals.set(monthKey(date), {
      month:
        period === 'year'
          ? monthYearFormatter.format(date).replace('.', '')
          : monthFormatter.format(date).replace('.', ''),
      income: 0,
      expense: 0,
    });
  }

  for (const item of transactions) {
    const date = dateFromIso(item.date);
    const monthlyTotal = totals.get(monthKey(date));
    if (monthlyTotal) monthlyTotal[item.type] += item.amount;
  }

  return [...totals.values()];
}

export function buildCategoryTotals(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>();

  for (const item of transactions) {
    if (item.type === 'expense') {
      totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
    }
  }

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] ?? categoryColors.Outros,
    }))
    .sort((first, second) => second.amount - first.amount);
}

function csvCell(value: string): string {
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

function localDateStamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function exportTransactionsCsv(transactions: Transaction[]): void {
  const rows = [
    ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor (R$)'],
    ...transactions.map((item) => [
      formatDateForCsv(item.date),
      item.description,
      item.type === 'income' ? 'Receita' : 'Despesa',
      item.category,
      (item.amount / 100).toFixed(2).replace('.', ','),
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `prumo-lancamentos-${localDateStamp(new Date())}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
