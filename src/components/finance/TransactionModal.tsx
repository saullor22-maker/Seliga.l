import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Transaction } from '../../types';
import { dataService } from '../../services/dataService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [description, setDescription] = useState('');
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');
  const [category, setCategory] = useState('Insumos e Matéria-Prima');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Informe a descrição da movimentação.');
      return;
    }
    if (amount <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    dataService.addTransaction({
      description: description.trim(),
      type,
      category: category.trim(),
      amount,
      date: new Date().toISOString(),
      paymentMethod,
      status,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lançar Movimentação Financeira</h2>
              <p className="text-xs text-zinc-400">Registre receitas avulsas ou despesas operacionais</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('despesa');
                setCategory('Despesas Operacionais');
              }}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                type === 'despesa'
                  ? 'bg-red-600 border-red-500 text-white shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Despesa (Saída)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('receita');
                setCategory('Receitas Avulsas');
              }}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                type === 'receita'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Receita (Entrada)
            </button>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Descrição do Lançamento *</label>
            <input
              type="text"
              required
              placeholder="Ex: Conta de Energia Enel, Aluguel do Ponto, Gás GLP..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-hidden focus:border-amber-400"
              >
                {type === 'despesa' ? (
                  <>
                    <option value="Insumos e Matéria-Prima">Insumos e Carnes</option>
                    <option value="Embalagens Delivery">Embalagens Delivery</option>
                    <option value="Despesas Fixas">Despesas Fixas (Aluguel, Água, Luz)</option>
                    <option value="Despesas Operacionais">Despesas Operacionais (Gás, Limpeza)</option>
                    <option value="Folha de Pagamento">Folha de Pagamento / Diárias</option>
                    <option value="Taxas de Entrega">Taxas de Entrega Motoboys</option>
                    <option value="Manutenção">Manutenção de Equipamentos</option>
                  </>
                ) : (
                  <>
                    <option value="Vendas Balcão / Retirada">Vendas Balcão / Retirada</option>
                    <option value="Vendas Delivery">Vendas Delivery</option>
                    <option value="Receitas Avulsas">Receitas Avulsas</option>
                    <option value="Aporte de Capital">Aporte de Capital</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-hidden focus:border-amber-400 uppercase"
              >
                <option value="pix">PIX</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="transferencia">Transferência TED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pago' | 'pendente')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-hidden focus:border-amber-400"
              >
                <option value="pago">Liquidado / Pago</option>
                <option value="pendente">A Pagar / Pendente</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-zinc-300">Observações (Opcional)</label>
            <input
              type="text"
              placeholder="Número de nota fiscal, fornecedor, etc."
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
              Lançar no Caixa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
