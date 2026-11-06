import React, { useState } from 'react';
import {
  Settings,
  Building,
  Phone,
  Clock,
  Truck,
  ShieldCheck,
  RefreshCw,
  Save,
  CheckCircle2,
  Sparkles,
  Database,
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { dataService } from '../../services/dataService';
import { isConfigured, testConnection } from '../../services/firebase';

interface SettingsViewProps {
  settings: CompanySettings;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings }) => {
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDemoData = () => {
    if (
      confirm(
        'ATENÇÃO: Deseja restaurar os dados de fábrica da hamburgueria? Todos os pedidos e cadastros de teste serão restaurados para a demonstração original do Se Liga Lanche.'
      )
    ) {
      dataService.resetToFactoryDefaults();
      alert('Dados de fábrica restaurados com sucesso!');
      window.location.reload();
    }
  };

  const handleTestFirebase = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    try {
      const ok = await testConnection();
      if (ok) {
        setConnectionStatus('Conexão com Cloud Firestore estabelecida com sucesso!');
      } else {
        setConnectionStatus(
          'Firebase não provisionado ainda. O sistema está operando perfeitamente no Modo Demonstração com persistência local.'
        );
      }
    } catch {
      setConnectionStatus(
        'Modo Demonstração Local ativo com dados salvos no navegador (LocalStorage).'
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Configurações da Empresa</h1>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              Se Liga Lanche
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Altere dados cadastrais da hamburgueria, endereço, taxas, horários e sincronização.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados da Empresa */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Building className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Identificação & Dados Cadastrais</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Nome Fantasia *</label>
              <input
                type="text"
                required
                value={formData.fantasyName}
                onChange={(e) => handleChange('fantasyName', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Razão Social *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">CNPJ *</label>
              <input
                type="text"
                required
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Telefone Fixo / Balcão</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">WhatsApp para Pedidos & Notificações</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Horário de Atendimento Comercial</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Localização e Delivery */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Truck className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Endereço & Parâmetros de Entrega</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-zinc-300">Logradouro e Número</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Bairro</label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-zinc-300">Cidade / UF</label>
              <input
                type="text"
                value={`${formData.city} - ${formData.state}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  handleChange('city', parts[0]?.trim() || '');
                  if (parts[1]) handleChange('state', parts[1]?.trim() || '');
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-zinc-300">Taxa Padrão de Entrega Delivery (R$)</label>
              <input
                type="number"
                step="0.50"
                value={formData.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-zinc-300">Tempo Médio de Preparo Estimado (Minutos)</label>
              <input
                type="number"
                value={formData.avgPrepTimeMinutes}
                onChange={(e) => handleChange('avgPrepTimeMinutes', parseInt(e.target.value) || 30)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Integração Firebase & Armazenamento */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Database className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Integração com Banco de Dados & Nuvem</h3>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200">
                    Modo Demonstração Local Ativo (Com Persistência)
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Todos os pedidos, estoque, receitas e relatórios são salvos de forma persistente e imediata.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestFirebase}
                disabled={isTestingConnection}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-700 transition-colors cursor-pointer"
              >
                {isTestingConnection ? 'Verificando...' : 'Verificar Conexão Cloud'}
              </button>
            </div>

            {connectionStatus && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-amber-300">
                {connectionStatus}
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <p>
                &bull; Arquitetura preparada com <code>firebase-blueprint.json</code> e regras de segurança <code>firestore.rules</code>.
              </p>
              <p>
                &bull; Tratamento de erros certificado com <code>handleFirestoreError</code> para auditoria e controle de acesso.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restaurar Demonstração de Fábrica</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
