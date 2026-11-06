import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Edit2,
  Trash2,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { Customer } from '../../types';
import { formatBRL, formatDate, formatPhone } from '../../utils/formatters';
import { dataService } from '../../services/dataService';
import { CustomerModal } from './CustomerModal';

interface CustomersViewProps {
  customers: Customer[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      (c.neighborhood && c.neighborhood.toLowerCase().includes(term))
    );
  });

  const handleDelete = (c: Customer) => {
    if (confirm(`Deseja remover o cadastro de "${c.name}"?`)) {
      dataService.deleteCustomer(c.id);
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const raw = phone.replace(/\D/g, '');
    const clean = raw.startsWith('55') ? raw : `55${raw}`;
    const text = encodeURIComponent(
      `Olá ${name}! Tudo bem? Passando para desejar um ótimo dia da equipe do Se Liga Lanche! Hoje tem promoção no cardápio! 🍔🍟`
    );
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Base de Clientes</h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              {customers.length} cadastrados
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Histórico de pedidos, fidelização, contato direto via WhatsApp e proteção de dados (LGPD).
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all cursor-pointer hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Search and LGPD Notice */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone, bairro ou endereço..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dados protegidos &bull; Conformidade LGPD</span>
          </div>
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl">
            Nenhum cliente encontrado.
          </div>
        ) : (
          filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400 font-black text-sm">
                      {cust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {cust.name}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        {formatPhone(cust.phone)}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold">
                    {cust.orderCount} {cust.orderCount === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </div>

                {cust.address && (
                  <p className="text-xs text-zinc-400 flex items-start gap-1.5 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      {cust.neighborhood ? <strong>{cust.neighborhood} - </strong> : ''}
                      {cust.address}
                    </span>
                  </p>
                )}

                {cust.notes && (
                  <p className="text-[11px] text-amber-400/90 italic bg-amber-500/10 px-2 py-1 rounded-lg">
                    {cust.notes}
                  </p>
                )}
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase">Total Gasto:</span>
                  <div className="font-mono font-bold text-white text-sm">
                    {formatBRL(cust.totalSpent)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleWhatsApp(cust.phone, cust.name)}
                    className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                    title="Chamar no WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCustomer(cust);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Editar Cadastro"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cust)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Excluir Cliente"
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
        <CustomerModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          customerToEdit={editingCustomer}
        />
      )}
    </div>
  );
};
