import React, { useState } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Power,
  Flame,
  ChefHat,
  Percent,
  TrendingUp,
} from 'lucide-react';
import { Ingredient, Product, ProductCategory } from '../../types';
import { formatBRL, CATEGORY_LABELS } from '../../utils/formatters';
import { dataService } from '../../services/dataService';
import { ProductModal } from './ProductModal';

interface MenuViewProps {
  products: Product[];
  ingredients: Ingredient[];
}

export const MenuView: React.FC<MenuViewProps> = ({ products, ingredients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleDelete = (prod: Product) => {
    if (confirm(`Deseja realmente excluir "${prod.name}" do cardápio?`)) {
      dataService.deleteProduct(prod.id);
    }
  };

  const handleToggle = (prodId: string) => {
    dataService.toggleProductAvailability(prodId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Cardápio & Fichas Técnicas</h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              {products.length} itens cadastrados
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure preços de venda, custos de insumos, receitas e disponibilidade dos lanches.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do lanche, ingredientes ou descrição..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'todos', label: 'Todos os Itens' },
              { id: 'hamburgueres', label: 'Hambúrgueres' },
              { id: 'combos', label: 'Combos' },
              { id: 'porcoes', label: 'Porções' },
              { id: 'bebidas', label: 'Bebidas' },
              { id: 'sobremesas', label: 'Sobremesas' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl">
            Nenhum produto cadastrado nesta categoria.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const margin =
              prod.price > 0 ? Math.round(((prod.price - (prod.cost || 0)) / prod.price) * 100) : 0;
            return (
              <div
                key={prod.id}
                className={`rounded-2xl bg-zinc-900/90 border transition-all flex flex-col justify-between overflow-hidden group shadow-lg ${
                  prod.available
                    ? 'border-zinc-800 hover:border-zinc-700'
                    : 'border-zinc-800/40 opacity-70 bg-zinc-950/60'
                }`}
              >
                {/* Top Image & Category Tag */}
                <div className="relative h-44 overflow-hidden bg-zinc-950">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-amber-400 border border-amber-400/30">
                      {CATEGORY_LABELS[prod.category] || prod.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggle(prod.id)}
                      className={`p-1.5 rounded-xl backdrop-blur-md transition-colors ${
                        prod.available
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                      }`}
                      title={prod.available ? 'Pausar venda no cardápio' : 'Ativar venda'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-zinc-400">Preço de Venda:</span>
                      <div className="text-xl font-black text-white font-mono leading-none">
                        {formatBRL(prod.price)}
                      </div>
                    </div>

                    <span className="text-[11px] font-bold font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                      {margin}% margem
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  {/* Recipe and Cost Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                        Ficha Técnica:
                      </span>
                      <span className="font-semibold text-zinc-300">
                        {prod.recipe && prod.recipe.length > 0
                          ? `${prod.recipe.length} insumos vinculados`
                          : 'Sem insumos vinculados'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Custo de Produção (CMV):</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {formatBRL(prod.cost || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        prod.available
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {prod.available ? 'Disponível' : 'Pausado'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Editar Produto e Ficha Técnica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Excluir do Cardápio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Product Edit / Create Modal */}
      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          productToEdit={editingProduct}
          ingredients={ingredients}
        />
      )}
    </div>
  );
};
