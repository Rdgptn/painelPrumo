import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { expenseCategories, incomeCategories } from '../lib/finance';
import type { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
}

function todayIso(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseAmount(value: string): number {
  const amount = value
    .trim()
    .replace(/\s/g, '')
    .replace(/[^\d.,-]/g, '');
  const lastComma = amount.lastIndexOf(',');
  const lastDot = amount.lastIndexOf('.');
  let normalized = amount;

  if (lastComma !== -1 && lastDot !== -1) {
    normalized =
      lastComma > lastDot ? amount.replace(/\./g, '').replace(',', '.') : amount.replace(/,/g, '');
  } else if (lastComma !== -1) {
    normalized = amount.replace(/\./g, '').replace(',', '.');
  }

  const number = Number(normalized);
  return Number.isFinite(number) ? Math.round(number * 100) : Number.NaN;
}

export function TransactionModal({ onClose, onAdd }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [date, setDate] = useState(todayIso);
  const [error, setError] = useState('');
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function changeType(nextType: TransactionType) {
    setType(nextType);
    setCategory(nextType === 'income' ? incomeCategories[0] : expenseCategories[0]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountInCents = parseAmount(amount);

    if (!description.trim()) {
      setError('Informe uma descrição.');
      return;
    }

    if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
      setError('Digite um valor maior que zero.');
      return;
    }

    if (!date) {
      setError('Selecione uma data.');
      return;
    }

    onAdd({
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `tx-${Date.now()}`,
      description: description.trim(),
      amount: amountInCents,
      type,
      category,
      date,
    });
    onClose();
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">NOVO LANÇAMENTO</span>
            <h2 id="modal-title">Adicionar movimentação</h2>
            <p>Preencha os detalhes para incluir no seu resumo.</p>
          </div>
          <button
            className="icon-button modal-close"
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={submit}>
          <fieldset className="type-switch">
            <legend>Tipo de lançamento</legend>
            <button
              className={
                type === 'expense' ? 'type-option selected expense-selected' : 'type-option'
              }
              type="button"
              aria-pressed={type === 'expense'}
              onClick={() => changeType('expense')}
            >
              <ArrowUpRight size={16} /> Despesa
            </button>
            <button
              className={type === 'income' ? 'type-option selected income-selected' : 'type-option'}
              type="button"
              aria-pressed={type === 'income'}
              onClick={() => changeType('income')}
            >
              <ArrowDownLeft size={16} /> Receita
            </button>
          </fieldset>

          <label className="form-field">
            <span>Descrição</span>
            <input
              autoFocus
              required
              maxLength={72}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setError('');
              }}
              placeholder="Ex.: Mercado da semana"
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Valor</span>
              <div className="amount-input-wrap">
                <span aria-hidden="true">R$</span>
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  maxLength={20}
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError('');
                  }}
                  placeholder="0,00"
                />
              </div>
            </label>
            <label className="form-field">
              <span>Data</span>
              <input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="form-field">
            <span>Categoria</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button className="button button-quiet" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="button button-primary" type="submit">
              Salvar lançamento
            </button>
          </div>
          <p className="modal-privacy">Este registro fica salvo somente neste navegador.</p>
        </form>
      </section>
    </div>
  );
}
