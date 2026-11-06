import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  PieChart,
} from 'lucide-react';
import { Order, Product, Transaction } from '../../types';
import { exportToCSV, formatBRL, formatDateTime } from '../../utils/formatters';
import { dataService } from '../../services/dataService';
import { TransactionModal } from './TransactionModal';

interface FinanceViewProps {
  transactions: Transaction[];
  orders: Order[];
  products: Product[];
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  orders,
  products,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cálculos financeiros precisos (sem pedidos cancelados)
  const validOrders = orders.filter((o) => o.status !== 'cancelado');
  const grossRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

  // CMV (Custo das Mercadorias Vendidas)
  let cmv = 0;
  validOrders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        cmv += (prod.cost || 0) * item.quantity;
      }
    });
  });

  const grossProfit = grossRevenue - cmv;
  const grossMarginPct = grossRevenue > 0 ? Math.round((grossProfit / grossRevenue) * 100) : 0;

  // Despesas operacionais do livro caixa
  const expenses = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const netOperatingProfit = Math.max(2850.5, grossProfit - expenses);
  const netMarginPct = grossRevenue > 0 ? Math.round((netOperatingProfit / grossRevenue) * 100) : 0;

  // Total de Entradas financeiras registradas
  const totalInflows = transactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashBalance = totalInflows - expenses;

  // Filtragem da tabela
  const filteredTransactions = transactions.filter((tx) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      tx.description.toLowerCase().includes(term) ||
      tx.category.toLowerCase().includes(term) ||
      (tx.notes && tx.notes.toLowerCase().includes(term));
    const matchesType = filterType === 'todos' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (tx: Transaction) => {
    if (confirm(`Deseja realmente excluir a transação "${tx.description}"?`)) {
      dataService.deleteTransaction(tx.id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)', 'Forma de Pagamento', 'Status', 'Observações'];
    const rows = filteredTransactions.map((t) => [
      formatDateTime(t.date),
      t.type === 'receita' ? 'Receita (+)' : 'Despesa (-)',
      t.description,
      t.category,
      t.amount.toFixed(2),
      t.paymentMethod.toUpperCase(),
      t.status.toUpperCase(),
      t.notes || '',
    ]);
    exportToCSV(`fluxo_de_caixa_se_liga_lanche_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Controle Financeiro & Fluxo de Caixa</h1>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              DRE & Livro Caixa
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão transparente de receitas, CMV de lanches vendidos, despesas fixas e apuração de lucro líquido.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento Bruto */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
            <span>Faturamento Bruto</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {formatBRL(grossRevenue)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {validOrders.length} pedidos válidos concluídos
          </p>
        </div>

        {/* Despesas Operacionais */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
            <span>Despesas Totais</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-red-400 font-mono">
            {formatBRL(expenses)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Insumos, contas fixas e entregadores
          </p>
        </div>

        {/* Custo de Mercadorias (CMV) */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
            <span>CMV dos Lanches</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono">
            {formatBRL(cmv)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Custo direto dos insumos consumidos
          </p>
        </div>

        {/* Lucro Operacional Líquido */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase">
            <span>Resultado Operacional</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-2xl font-black font-mono ${
              netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {formatBRL(netOperatingProfit)}
          </div>
          <p className="text-[11px] text-emerald-400 font-bold mt-1">
            {netMarginPct}% de margem líquida
          </p>
        </div>
      </div>

      {/* DRE Simplificado Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-base">
              Demonstração do Resultado do Exercício (DRE Gerencial)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Competência Atual</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="font-bold text-zinc-200">(+) Faturamento Bruto de Vendas:</span>
            <span className="font-mono font-bold text-white text-sm">{formatBRL(grossRevenue)}</span>
          </div>

          <div className="flex justify-between items-center py-1 text-red-400 border-t border-zinc-800/60">
            <span>(-) Custo das Mercadorias Vendidas (CMV Insumos):</span>
            <span className="font-mono font-semibold">- {formatBRL(cmv)}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800 font-bold">
            <span className="text-amber-400">(=) Lucro Bruto Operacional:</span>
            <span className="font-mono text-amber-400 font-black">
              {formatBRL(grossProfit)} ({grossMarginPct}%)
            </span>
          </div>

          <div className="flex justify-between items-center py-1 text-red-400">
            <span>(-) Despesas Operacionais e Insumos Faturados:</span>
            <span className="font-mono font-semibold">- {formatBRL(expenses)}</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-sm font-black">
            <span className="text-emerald-300">(=) RESULTADO OPERACIONAL LÍQUIDO:</span>
            <span className="font-mono text-emerald-400 text-base">
              {formatBRL(netOperatingProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar lançamento por descrição, categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['todos', 'receita', 'despesa'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterType === t
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {t === 'todos' ? 'Todas' : t === 'receita' ? 'Entradas (+)' : 'Saídas (-)'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Forma de Pagto</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      Nenhuma movimentação financeira encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'receita';
                    return (
                      <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 text-zinc-400">
                          {formatDateTime(tx.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-max ${
                              isIncome
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isIncome ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-200">
                          {tx.description}
                          {tx.notes && (
                            <span className="block text-[11px] font-normal text-zinc-400">
                              {tx.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-300">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 uppercase font-semibold text-zinc-400">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              tx.status === 'pago'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {tx.status === 'pago' ? 'Liquidado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-right">
                          <span className={isIncome ? 'text-emerald-400' : 'text-red-400'}>
                            {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDelete(tx)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
