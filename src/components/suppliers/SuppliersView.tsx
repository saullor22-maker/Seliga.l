import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  MessageSquare,
  Building,
} from 'lucide-react';
import { Supplier } from '../../types';
import { formatPhone } from '../../utils/formatters';
import { dataService } from '../../services/dataService';
import { SupplierModal } from './SupplierModal';

interface SuppliersViewProps {
  suppliers: Supplier[];
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ suppliers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      s.contactName.toLowerCase().includes(term) ||
      s.phone.includes(term)
    );
  });

  const handleDelete = (s: Supplier) => {
    if (confirm(`Deseja realmente remover o fornecedor "${s.name}"?`)) {
      dataService.deleteSupplier(s.id);
    }
  };

  const handleWhatsApp = (phone: string, supplierName: string) => {
    const raw = phone.replace(/\D/g, '');
    const clean = raw.startsWith('55') ? raw : `55${raw}`;
    const text = encodeURIComponent(
      `Olá! Aqui é da hamburgueria Se Liga Lanche. Gostaríamos de verificar cotação e fazer um pedido de reposição.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Fornecedores & Parceiros</h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              {suppliers.length} parceiros
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Controle de contatos de compras, produtos fornecidos, preços, prazos e reposições.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSupplier(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por fornecedor, insumo, contato ou telefone..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl">
            Nenhum fornecedor encontrado.
          </div>
        ) : (
          filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {sup.name}
                      </h3>
                      <p className="text-xs text-amber-400/90 font-medium">{sup.category}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-400 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <p className="flex items-center gap-2 text-zinc-300">
                    <span className="text-zinc-500 font-semibold">Contato:</span> {sup.contactName || 'Representante'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formatPhone(sup.phone)}</span>
                  </p>
                  {sup.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate">{sup.email}</span>
                    </p>
                  )}
                  {sup.cnpj && (
                    <p className="flex items-center gap-2 font-mono text-[11px]">
                      <Building className="w-3.5 h-3.5 text-zinc-500" />
                      <span>CNPJ: {sup.cnpj}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1 border-t border-zinc-800">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Prazo de entrega: <strong>{sup.deliveryLeadDays} dias</strong></span>
                  </p>
                </div>

                {sup.notes && (
                  <p className="text-[11px] text-zinc-400 italic bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                    {sup.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleWhatsApp(sup.phone, sup.name)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingSupplier(sup);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Editar Fornecedor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sup)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Excluir Fornecedor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <SupplierModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSupplier(null);
          }}
          supplierToEdit={editingSupplier}
        />
      )}
    </div>
  );
};
