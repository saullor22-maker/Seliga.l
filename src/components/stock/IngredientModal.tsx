import React, { useState } from 'react';
import { X, Boxes, AlertTriangle } from 'lucide-react';
import { Ingredient, Supplier, UnitOfMeasure } from '../../types';
import { UNIT_LABELS } from '../../utils/formatters';
import { dataService } from '../../services/dataService';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredientToEdit?: Ingredient | null;
  suppliers: Supplier[];
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  ingredientToEdit,
  suppliers,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(ingredientToEdit?.name || '');
  const [category, setCategory] = useState(ingredientToEdit?.category || 'Carnes');
  const [quantity, setQuantity] = useState<number>(ingredientToEdit?.quantity || 0);
  const [minQuantity, setMinQuantity] = useState<number>(ingredientToEdit?.minQuantity || 10);
  const [unit, setUnit] = useState<UnitOfMeasure>(ingredientToEdit?.unit || 'un');
  const [costPerUnit, setCostPerUnit] = useState<number>(ingredientToEdit?.costPerUnit || 0);
  const [supplierId, setSupplierId] = useState(ingredientToEdit?.supplierId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do insumo.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);

    dataService.saveIngredient({
      id: ingredientToEdit?.id,
      name: name.trim(),
      category: category.trim(),
      quantity,
      minQuantity,
      unit,
      costPerUnit,
      supplierId: supplier?.id,
      supplierName: supplier?.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {ingredientToEdit ? 'Editar Insumo de Estoque' : 'Cadastrar Novo Insumo'}
              </h2>
              <p className="text-xs text-zinc-400">Controle quantidades e limite mínimo para alertas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Nome do Insumo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Blend Bovino 180g, Pão Brioche..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Categoria</label>
              <input
                type="text"
                placeholder="Ex: Carnes, Pães, Laticínios..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Unidade de Medida *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-hidden focus:border-amber-400"
              >
                {Object.entries(UNIT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Quantidade Atual *</label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Estoque Mínimo *</label>
              <input
                type="number"
                step="any"
                required
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Fornecedor Principal</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-hidden focus:border-amber-400"
            >
              <option value="">Selecione um fornecedor (opcional)...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black uppercase tracking-wider shadow-md"
            >
              Salvar Insumo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  suppliers: Supplier[];
}

export const StockEntryModal: React.FC<StockEntryModalProps> = ({
  isOpen,
  onClose,
  ingredient,
  suppliers,
}) => {
  if (!isOpen || !ingredient) return null;

  const [quantityToAdd, setQuantityToAdd] = useState<number>(10);
  const [costPerUnit, setCostPerUnit] = useState<number>(ingredient.costPerUnit || 0);
  const [supplierName, setSupplierName] = useState(ingredient.supplierName || '');
  const [createExpense, setCreateExpense] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityToAdd <= 0) {
      alert('Informe uma quantidade válida.');
      return;
    }

    dataService.addStockEntry(
      ingredient.id,
      quantityToAdd,
      costPerUnit,
      createExpense,
      supplierName
    );

    onClose();
  };

  const totalCost = Number((quantityToAdd * costPerUnit).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div>
            <h2 className="text-base font-bold text-white">Entrada de Mercadoria / Reposição</h2>
            <p className="text-xs text-amber-400 font-semibold">{ingredient.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            Estoque Atual: <strong className="text-white">{ingredient.quantity} {ingredient.unit}</strong> (Mínimo: {ingredient.minQuantity} {ingredient.unit})
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Quantidade a Adicionar ({ingredient.unit}) *</label>
              <input
                type="number"
                step="any"
                required
                min="0.1"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Fornecedor da Compra</label>
            <input
              type="text"
              placeholder="Ex: Frigorífico Boi Dourado"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="expenseCheck"
                checked={createExpense}
                onChange={(e) => setCreateExpense(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 bg-zinc-950 border-zinc-700"
              />
              <label htmlFor="expenseCheck" className="font-semibold text-zinc-200">
                Lançar despesa de R$ {totalCost.toFixed(2)} no Financeiro
              </label>
            </div>
            <p className="text-[11px] text-zinc-400">
              Registra automaticamente a saída no fluxo de caixa da hamburgueria.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider shadow-md cursor-pointer"
            >
              Confirmar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
