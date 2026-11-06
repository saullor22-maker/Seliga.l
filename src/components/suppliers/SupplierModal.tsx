import React, { useState } from 'react';
import { X, Truck, Phone, Mail } from 'lucide-react';
import { Supplier } from '../../types';
import { dataService } from '../../services/dataService';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(supplierToEdit?.name || '');
  const [contactName, setContactName] = useState(supplierToEdit?.contactName || '');
  const [phone, setPhone] = useState(supplierToEdit?.phone || '');
  const [email, setEmail] = useState(supplierToEdit?.email || '');
  const [cnpj, setCnpj] = useState(supplierToEdit?.cnpj || '');
  const [category, setCategory] = useState(supplierToEdit?.category || 'Carnes e Blends');
  const [deliveryLeadDays, setDeliveryLeadDays] = useState<number>(supplierToEdit?.deliveryLeadDays || 2);
  const [notes, setNotes] = useState(supplierToEdit?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe a Razão Social ou Nome Fantasia do fornecedor.');
      return;
    }
    if (!phone.trim()) {
      alert('Informe o telefone do fornecedor.');
      return;
    }

    dataService.saveSupplier({
      id: supplierToEdit?.id,
      name: name.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      cnpj: cnpj.trim(),
      category: category.trim(),
      deliveryLeadDays,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {supplierToEdit ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
              </h2>
              <p className="text-xs text-zinc-400">Controle contatos, produtos fornecidos e prazos de entrega</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Razão Social / Nome Fantasia *</label>
            <input
              type="text"
              required
              placeholder="Ex: Frigorífico Boi Dourado LTDA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Pessoa de Contato</label>
              <input
                type="text"
                placeholder="Ex: Carlos Representante"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Telefone / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="(11) 98888-7777"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">E-mail para Pedidos</label>
              <input
                type="email"
                placeholder="pedidos@fornecedor.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">CNPJ</label>
              <input
                type="text"
                placeholder="00.000.000/0001-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Categoria de Produtos</label>
              <input
                type="text"
                placeholder="Ex: Carnes, Pães, Embalagens, Bebidas"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Prazo Médio de Entrega (Dias)</label>
              <input
                type="number"
                min="0"
                value={deliveryLeadDays}
                onChange={(e) => setDeliveryLeadDays(parseInt(e.target.value) || 1)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Observações e Condições Comerciais</label>
            <textarea
              rows={2}
              placeholder="Ex: Faturamento 28 dias via boleto, entrega terças e sextas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
            />
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black uppercase tracking-wider shadow-md"
            >
              Salvar Fornecedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
