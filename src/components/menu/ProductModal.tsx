import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  BookOpen,
  Image as ImageIcon,
  ChefHat,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { Ingredient, Product, ProductCategory, RecipeItem, UnitOfMeasure } from '../../types';
import { formatBRL } from '../../utils/formatters';
import { dataService } from '../../services/dataService';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  ingredients: Ingredient[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  ingredients,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [category, setCategory] = useState<ProductCategory>(productToEdit?.category || 'hamburgueres');
  const [price, setPrice] = useState<number>(productToEdit?.price || 0);
  const [imageUrl, setImageUrl] = useState(
    productToEdit?.imageUrl ||
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  );
  const [available, setAvailable] = useState(productToEdit ? productToEdit.available : true);

  // Ficha técnica (ingredientes consumidos)
  const [recipe, setRecipe] = useState<RecipeItem[]>(productToEdit?.recipe || []);

  // Novo item para ficha técnica
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Calcula custo da ficha técnica em tempo real
  const computedRecipeCost = recipe.reduce((acc, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    if (!ing) return acc;
    return acc + ing.costPerUnit * item.quantity;
  }, 0);

  const cost = computedRecipeCost > 0 ? Number(computedRecipeCost.toFixed(2)) : (productToEdit?.cost || 0);
  const profitMargin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

  const handleAddRecipeItem = () => {
    if (!selectedIngredientId || selectedQuantity <= 0) return;
    const ing = ingredients.find((i) => i.id === selectedIngredientId);
    if (!ing) return;

    setRecipe((prev) => {
      const existing = prev.find((r) => r.ingredientId === ing.id);
      if (existing) {
        return prev.map((r) =>
          r.ingredientId === ing.id
            ? { ...r, quantity: Number((r.quantity + selectedQuantity).toFixed(3)) }
            : r
        );
      }
      return [
        ...prev,
        {
          ingredientId: ing.id,
          ingredientName: ing.name,
          quantity: selectedQuantity,
          unit: ing.unit,
        },
      ];
    });

    setSelectedIngredientId('');
    setSelectedQuantity(1);
  };

  const handleRemoveRecipeItem = (ingredientId: string) => {
    setRecipe((prev) => prev.filter((r) => r.ingredientId !== ingredientId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do produto.');
      return;
    }
    if (price <= 0) {
      alert('Informe um preço de venda válido.');
      return;
    }

    dataService.saveProduct({
      id: productToEdit?.id,
      name: name.trim(),
      description: description.trim(),
      category,
      price,
      cost,
      imageUrl: imageUrl.trim(),
      available,
      recipe,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {productToEdit ? 'Editar Produto do Cardápio' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-zinc-400">Configure preço, categoria e ficha técnica de insumos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-zinc-300">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: X-Tudo Se Liga Especial"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Categoria *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="hamburgueres">Hambúrgueres Artesanais</option>
                  <option value="combos">Combos & Promoções</option>
                  <option value="porcoes">Batatas & Porções</option>
                  <option value="bebidas">Bebidas & Sucos</option>
                  <option value="sobremesas">Sobremesas</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Descrição Comercial</label>
              <textarea
                rows={2}
                placeholder="Ingredientes deliciosos, modo de preparo, acompanhamentos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Preço de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.10"
                  required
                  placeholder="0.00"
                  value={price || ''}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Custo Estimado (R$)</label>
                <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono">
                  {formatBRL(cost)}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Margem Bruta</label>
                <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold font-mono text-emerald-400">
                  {profitMargin}% lucro
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                URL da Foto
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="availableCheck"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-zinc-900 border-zinc-700"
              />
              <label htmlFor="availableCheck" className="text-xs font-medium text-zinc-300">
                Produto disponível para venda no cardápio
              </label>
            </div>
          </div>

          {/* Ficha Técnica (BOM - Bill of Materials) */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="font-bold text-xs text-white">Ficha Técnica & Consumo de Insumos</h4>
                  <p className="text-[11px] text-zinc-400">
                    Ao concluir pedidos deste lanche, esses insumos serão baixados automaticamente do estoque.
                  </p>
                </div>
              </div>
            </div>

            {/* Add ingredient row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <div className="sm:col-span-7">
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-300 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="">Selecione o insumo do estoque...</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit}) — Custo {formatBRL(ing.costPerUnit)}/{ing.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Qtd consumida"
                  value={selectedQuantity || ''}
                  onChange={(e) => setSelectedQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddRecipeItem}
                  disabled={!selectedIngredientId}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" /> Incluir
                </button>
              </div>
            </div>

            {/* Recipe list */}
            {recipe.length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic py-2">
                Nenhum insumo vinculado ainda. Você pode adicionar pães, carnes, queijos, embalagens, etc.
              </p>
            ) : (
              <div className="divide-y divide-zinc-800/80 rounded-xl bg-zinc-950/80 border border-zinc-800 overflow-hidden">
                {recipe.map((item) => {
                  const ing = ingredients.find((i) => i.id === item.ingredientId);
                  const itemCost = ing ? ing.costPerUnit * item.quantity : 0;
                  return (
                    <div
                      key={item.ingredientId}
                      className="p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200">{item.ingredientName}</span>
                        <span className="text-[11px] text-amber-400 font-mono">
                          {item.quantity} {item.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {formatBRL(itemCost)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipeItem(item.ingredientId)}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer"
            >
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
