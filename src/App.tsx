import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MetricCard } from './components/MetricCard';
import { TransactionModal } from './components/TransactionModal';
import {
  buildCategoryTotals,
  buildMonthlyTotals,
  exportTransactionsCsv,
  filterByPeriod,
  formatDate,
  formatMoney,
  readLedger,
  saveLedger,
  summarize,
} from './lib/finance';
import type { Ledger, PeriodKey, Transaction } from './types';

const periodOptions: { value: PeriodKey; label: string }[] = [
  { value: 'month', label: 'Este mês' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: 'year', label: 'Este ano' },
];

function chartAxisMoney(value: number): string {
  const reais = value / 100;
  if (Math.abs(reais) >= 1000)
    return `R$ ${(reais / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  return `R$ ${Math.round(reais).toLocaleString('pt-BR')}`;
}

export default function App() {
  const [ledger, setLedger] = useState<Ledger>(() => readLedger());
  const [period, setPeriod] = useState<PeriodKey>('6m');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => saveLedger(ledger), [ledger]);

  const periodTransactions = useMemo(
    () => filterByPeriod(ledger.transactions, period),
    [ledger.transactions, period],
  );
  const summary = useMemo(() => summarize(periodTransactions), [periodTransactions]);
  const monthlyTotals = useMemo(
    () => buildMonthlyTotals(periodTransactions, period),
    [periodTransactions, period],
  );
  const categoryTotals = useMemo(
    () => buildCategoryTotals(periodTransactions),
    [periodTransactions],
  );
  const categorySpend = categoryTotals.reduce((sum, item) => sum + item.amount, 0);
  const visibleTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    return [...periodTransactions]
      .filter(
        (item) =>
          !normalizedQuery ||
          `${item.description} ${item.category}`
            .toLocaleLowerCase('pt-BR')
            .includes(normalizedQuery),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [periodTransactions, query]);

  function addTransaction(transaction: Transaction) {
    setLedger((current) => ({
      transactions: [transaction, ...current.transactions],
      isDemo: false,
    }));
  }

  function removeTransaction(id: string) {
    setLedger((current) => ({
      transactions: current.transactions.filter((item) => item.id !== id),
      isDemo: false,
    }));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Prumo, início">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#brandGradient)" />
              <path
                d="M11 27.5V21m9 6.5V15m9 12.5V11"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="m10.5 17.5 8-5 7 3 5-6"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity=".72"
              />
              <defs>
                <linearGradient
                  id="brandGradient"
                  x1="4"
                  y1="38"
                  x2="36"
                  y2="2"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#102B56" />
                  <stop offset="1" stopColor="#37689F" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="brand-copy">
            <strong>prumo</strong>
            <small>FINANÇAS PESSOAIS</small>
          </span>
        </a>

        <div className="sidebar-rule" />
        <span className="nav-caption">NAVEGAÇÃO</span>
        <nav className="side-nav" aria-label="Navegação principal">
          <a className="nav-link active" href="#overview">
            <LayoutDashboard size={18} />
            <span>Visão geral</span>
          </a>
          <a className="nav-link" href="#analysis">
            <BarChart3 size={18} />
            <span>Análises</span>
          </a>
          <a className="nav-link" href="#transactions">
            <ReceiptText size={18} />
            <span>Lançamentos</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span className="privacy-icon">
              <ShieldCheck size={17} />
            </span>
            <div>
              <strong>Privacidade</strong>
              <p>Seus registros ficam neste navegador.</p>
            </div>
          </div>
          <div className="sidebar-copyright">
            PRUMO <span>•</span> CONTROLE COM CLAREZA
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="page-header">
          <div className="page-title-block">
            <span className="eyebrow">RESUMO DO PERÍODO</span>
            <h1>Visão geral</h1>
            <p>Confira receitas, despesas e saldo no período selecionado.</p>
          </div>
          <div className="header-actions">
            <label className="period-select-wrap">
              <CalendarDays size={16} aria-hidden="true" />
              <span className="sr-only">Selecionar período</span>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as PeriodKey)}
              >
                {periodOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button button-primary add-button"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={17} strokeWidth={2.4} /> <span>Novo lançamento</span>
            </button>
          </div>
        </header>

        <section className="metrics-grid" aria-label="Resumo do período">
          <MetricCard
            label="Saldo do período"
            value={formatMoney(summary.balance)}
            context="Receitas menos despesas"
            icon={Wallet}
            tone="navy"
            featured
          />
          <MetricCard
            label="Receitas"
            value={formatMoney(summary.income)}
            context="Entradas no período"
            icon={ArrowDownLeft}
            tone="green"
          />
          <MetricCard
            label="Despesas"
            value={formatMoney(summary.expense)}
            context="Saídas no período"
            icon={ArrowUpRight}
            tone="rose"
          />
          <MetricCard
            label="Lançamentos"
            value={String(periodTransactions.length)}
            context="Registros no período"
            icon={ReceiptText}
            tone="slate"
          />
        </section>

        <section className="charts-grid" id="analysis" aria-label="Análises financeiras">
          <article className="panel cashflow-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">ACOMPANHAMENTO</span>
                <h2>Entradas e saídas</h2>
                <p>Movimentação mês a mês</p>
              </div>
              <span className="panel-icon">
                <BarChart3 size={18} />
              </span>
            </div>
            <div className="chart-legend" aria-label="Legenda do gráfico">
              <span>
                <i className="legend-dot legend-income" /> Receitas
              </span>
              <span>
                <i className="legend-dot legend-expense" /> Despesas
              </span>
            </div>
            {periodTransactions.length ? (
              <div
                className="cashflow-chart"
                role="img"
                aria-label="Gráfico de área com receitas e despesas por mês"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyTotals}
                    margin={{ top: 8, right: 8, left: -14, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#254e82" stopOpacity={0.18} />
                        <stop offset="96%" stopColor="#254e82" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a97873" stopOpacity={0.15} />
                        <stop offset="96%" stopColor="#a97873" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#edf1f5" strokeDasharray="3 5" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8591a2', fontSize: 11 }}
                      dy={9}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8591a2', fontSize: 10 }}
                      tickFormatter={chartAxisMoney}
                      width={67}
                    />
                    <Tooltip
                      formatter={(value) => formatMoney(Number(value))}
                      contentStyle={{
                        border: '1px solid #e6ebf1',
                        borderRadius: 10,
                        boxShadow: '0 8px 25px rgba(20, 40, 70, .09)',
                        fontSize: 12,
                      }}
                      labelStyle={{ color: '#506074', fontWeight: 650, marginBottom: 4 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Receitas"
                      stroke="#254e82"
                      strokeWidth={2.3}
                      fill="url(#incomeFill)"
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Despesas"
                      stroke="#ad7771"
                      strokeWidth={2.1}
                      fill="url(#expenseFill)"
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-empty">
                Adicione lançamentos para acompanhar sua movimentação.
              </div>
            )}
          </article>

          <article className="panel category-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">DISTRIBUIÇÃO</span>
                <h2>Despesas por categoria</h2>
                <p>Onde o dinheiro foi utilizado</p>
              </div>
              <span className="panel-icon">
                <Tag size={17} />
              </span>
            </div>
            {categoryTotals.length ? (
              <div className="category-content">
                <div
                  className="donut-wrap"
                  role="img"
                  aria-label="Gráfico de despesas por categoria"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryTotals}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={57}
                        outerRadius={78}
                        paddingAngle={3}
                        stroke="none"
                        cornerRadius={3}
                      >
                        {categoryTotals.map((item) => (
                          <Cell key={item.category} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatMoney(Number(value))}
                        contentStyle={{
                          border: '1px solid #e6ebf1',
                          borderRadius: 10,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center">
                    <strong>{formatMoney(categorySpend)}</strong>
                    <span>total em despesas</span>
                  </div>
                </div>
                <div className="category-list">
                  {categoryTotals.map((item) => {
                    const share = categorySpend
                      ? Math.round((item.amount / categorySpend) * 100)
                      : 0;
                    return (
                      <div className="category-row" key={item.category}>
                        <div className="category-row-top">
                          <span>
                            <i style={{ backgroundColor: item.color }} />
                            {item.category}
                          </span>
                          <strong>{share}%</strong>
                        </div>
                        <div className="category-track">
                          <span style={{ width: `${share}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="chart-empty">Sem despesas registradas neste período.</div>
            )}
          </article>
        </section>

        <section className="panel transactions-panel" id="transactions">
          <div className="transactions-heading">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">MOVIMENTAÇÕES</span>
                <h2>Lançamentos</h2>
                <p>
                  {visibleTransactions.length} de {periodTransactions.length} registros no período
                </p>
              </div>
            </div>
            <div className="transaction-tools">
              <label className="search-box">
                <Search size={16} aria-hidden="true" />
                <span className="sr-only">Buscar por descrição ou categoria</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar lançamento"
                />
              </label>
              <button
                className="button button-outline export-button"
                onClick={() => exportTransactionsCsv(visibleTransactions)}
                disabled={!visibleTransactions.length}
              >
                <Download size={16} />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {ledger.isDemo && (
            <div className="demo-notice">
              <span className="demo-dot" />
              Exemplos para demonstração <span className="demo-separator">—</span> personalize os
              lançamentos para começar.
            </div>
          )}

          <div className="table-scroll">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>DESCRIÇÃO</th>
                  <th>CATEGORIA</th>
                  <th>DATA</th>
                  <th className="amount-column">VALOR</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="transaction-name">
                        <span className={`transaction-type-icon ${item.type}`} aria-hidden="true">
                          {item.type === 'income' ? (
                            <ArrowDownLeft size={15} />
                          ) : (
                            <ArrowUpRight size={15} />
                          )}
                        </span>
                        <span className="transaction-description">{item.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-label">
                        <i />
                        {item.category}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(item.date)}</td>
                    <td className={`amount-column amount-value ${item.type}`}>
                      {item.type === 'income' ? '+' : '−'} {formatMoney(item.amount)}
                    </td>
                    <td className="action-cell">
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => removeTransaction(item.id)}
                        aria-label={`Remover ${item.description}`}
                        title="Remover lançamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visibleTransactions.length && (
              <div className="table-empty">
                <span>
                  <Search size={20} />
                </span>
                <strong>
                  {periodTransactions.length
                    ? 'Nenhum lançamento encontrado'
                    : 'Nenhum lançamento neste período'}
                </strong>
                <p>
                  {periodTransactions.length
                    ? 'Tente buscar outro termo.'
                    : 'Adicione uma receita ou despesa para começar.'}
                </p>
                {!periodTransactions.length && (
                  <button className="button button-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} /> Adicionar lançamento
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="page-footer">
          <span>
            <ShieldCheck size={14} /> Seus dados permanecem neste dispositivo.
          </span>
          <span>
            PRUMO <i>•</i> CONTROLE COM CLAREZA
          </span>
        </footer>
      </main>

      {isModalOpen && (
        <TransactionModal onClose={() => setIsModalOpen(false)} onAdd={addTransaction} />
      )}
    </div>
  );
}
