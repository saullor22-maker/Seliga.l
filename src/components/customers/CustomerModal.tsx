import React, { useState } from 'react';
import { X, User, Phone, MapPin } from 'lucide-react';
import { Customer } from '../../types';
import { dataService } from '../../services/dataService';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(customerToEdit?.name || '');
  const [phone, setPhone] = useState(customerToEdit?.phone || '');
  const [address, setAddress] = useState(customerToEdit?.address || '');
  const [neighborhood, setNeighborhood] = useState(customerToEdit?.neighborhood || '');
  const [notes, setNotes] = useState(customerToEdit?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }
    if (!phone.trim()) {
      alert('Informe o telefone do cliente.');
      return;
    }

    dataService.saveCustomer({
      id: customerToEdit?.id,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {customerToEdit ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </h2>
              <p className="text-xs text-zinc-400">Dados cadastrais para entregas e contato</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Telefone / WhatsApp *</label>
            <input
              type="text"
              required
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Bairro</label>
              <input
                type="text"
                placeholder="Ex: Pinheiros"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="font-bold text-zinc-300">Endereço de Entrega</label>
              <input
                type="text"
                placeholder="Rua, número, apto / bloco"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Preferências / Observações</label>
            <textarea
              rows={2}
              placeholder="Ex: Pede sempre sem picles, tocar interfone 42..."
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
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
