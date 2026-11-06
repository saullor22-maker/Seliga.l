import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  PackagePlus,
  History,
  TrendingDown,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { Ingredient, StockMovement, Supplier } from '../../types';
import { formatBRL, formatDateTime } from '../../utils/formatters';
import { dataService } from '../../services/dataService';
import { IngredientModal, StockEntryModal } from './IngredientModal';

interface StockViewProps {
  ingredients: Ingredient[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
}

export const StockView: React.FC<StockViewProps> = ({
  ingredients,
  stockMovements,
  suppliers,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modals state
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryIngredient, setEntryIngredient] = useState<Ingredient | null>(null);

  // Stats
  const criticalItems = ingredients.filter((i) => i.quantity <= i.minQuantity);
  const totalStockValue = ingredients.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0);

  const filteredIngredients = ingredients.filter((ing) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      ing.name.toLowerCase().includes(term) ||
      ing.category.toLowerCase().includes(term) ||
      (ing.supplierName && ing.supplierName.toLowerCase().includes(term));

    let matchesStatus = true;
    if (filterStatus === 'critico') matchesStatus = ing.quantity <= ing.minQuantity;
    if (filterStatus === 'normal') matchesStatus = ing.quantity > ing.minQuantity;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (ing: Ingredient) => {
    if (confirm(`Deseja realmente remover o insumo "${ing.name}" do estoque?`)) {
      dataService.deleteIngredient(ing.id);
    }
  };

  const handleOpenEntry = (ing: Ingredient) => {
    setEntryIngredient(ing);
    setIsEntryModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Controle de Estoque & Insumos</h1>
            {criticalItems.length > 0 && (
              <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {criticalItems.length} crítico(s)
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão de ingredientes, custos médios, reposições e baixa automática de fichas técnicas.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingIngredient(null);
            setIsIngredientModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Insumo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Total de Itens
            </span>
            <div className="text-2xl font-black text-white">{ingredients.length} insumos</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Abaixo do Mínimo
            </span>
            <div className="text-2xl font-black text-red-400">
              {criticalItems.length} alerta(s)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Valor em Estoque
            </span>
            <div className="text-2xl font-black text-white">{formatBRL(totalStockValue)}</div>
          </div>
        </div>
      </div>

      {/* Tab Selector & Filters */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Itens em Estoque</span>
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'movements'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Movimentações ({stockMovements.length})</span>
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar insumo ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-hidden focus:border-amber-400"
              >
                <option value="todos">Todos os níveis</option>
                <option value="critico">Somente Críticos</option>
                <option value="normal">Estoque Normal</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'inventory' ? (
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Quantidade Atual</th>
                  <th className="py-3 px-4">Nível de Segurança</th>
                  <th className="py-3 px-4">Custo Unitário</th>
                  <th className="py-3 px-4">Total em Estoque</th>
                  <th className="py-3 px-4">Fornecedor</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500">
                      Nenhum insumo encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredIngredients.map((ing) => {
                    const isCritical = ing.quantity <= ing.minQuantity;
                    const stockValue = ing.quantity * ing.costPerUnit;
                    const pctOfMin = Math.min(100, (ing.quantity / (ing.minQuantity * 1.5)) * 100);

                    return (
                      <tr key={ing.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-100">
                          {ing.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {ing.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-black font-mono text-sm ${
                              isCritical ? 'text-red-400' : 'text-zinc-100'
                            }`}
                          >
                            {ing.quantity} {ing.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 w-44">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className={isCritical ? 'text-red-400 font-bold' : 'text-zinc-400'}>
                                {isCritical ? 'Estoque Crítico' : 'Estoque Saudável'}
                              </span>
                              <span className="text-zinc-500">Mín: {ing.minQuantity} {ing.unit}</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isCritical ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pctOfMin}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          {formatBRL(ing.costPerUnit)} / {ing.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {formatBRL(stockValue)}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
                          {ing.supplierName || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEntry(ing)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-colors font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Dar Entrada de Reposição"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Repor</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingIngredient(ing);
                                setIsIngredientModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Editar Insumo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(ing)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Excluir Insumo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Histórico de Movimentações */
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Auditoria de Movimentações de Estoque
            </h3>
            <span className="text-xs text-zinc-400">
              Registros automáticos por vendas e entradas de compras
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Data/Hora</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-4">Quantidade</th>
                  <th className="py-3 px-4">Motivo / Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      Nenhuma movimentação registrada até o momento. Conclua pedidos para ver baixas automáticas!
                    </td>
                  </tr>
                ) : (
                  stockMovements.map((mov) => {
                    const isOut = mov.type === 'saida_venda' || mov.type === 'ajuste_perda';
                    return (
                      <tr key={mov.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 text-zinc-400">
                          {formatDateTime(mov.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isOut
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {mov.type === 'saida_venda'
                              ? 'Baixa por Pedido'
                              : mov.type === 'entrada_compra'
                              ? 'Entrada Reposição'
                              : 'Ajuste de Perda'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-200">
                          {mov.ingredientName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={isOut ? 'text-red-400' : 'text-emerald-400'}>
                            {isOut ? '-' : '+'}
                            {mov.quantity} {mov.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {mov.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isIngredientModalOpen && (
        <IngredientModal
          isOpen={isIngredientModalOpen}
          onClose={() => {
            setIsIngredientModalOpen(false);
            setEditingIngredient(null);
          }}
          ingredientToEdit={editingIngredient}
          suppliers={suppliers}
        />
      )}

      {isEntryModalOpen && (
        <StockEntryModal
          isOpen={isEntryModalOpen}
          onClose={() => {
            setIsEntryModalOpen(false);
            setEntryIngredient(null);
          }}
          ingredient={entryIngredient}
          suppliers={suppliers}
        />
      )}
    </div>
  );
};
