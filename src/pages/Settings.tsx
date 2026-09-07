import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Sliders,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Save,
} from 'lucide-react';
import { db } from '../services/db';
import { StoreSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>(() => db.getSettings());
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSettings(settings);
    setSuccessMsg('Configurações salvas com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(db.exportBackup())}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `backup_perfumaria_elegance_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg('Backup exportado com sucesso no formato JSON!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = db.importBackup(text);
        if (res.success) {
          setSuccessMsg('Dados restaurados com sucesso! Recarregando sistema...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setErrorMsg(res.error || 'Erro ao processar arquivo de backup.');
        }
      } catch (err) {
        setErrorMsg('Arquivo JSON inválido ou corrompido.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial demo database
  const handleResetDemo = () => {
    if (
      confirm(
        'ATENÇÃO: Deseja redefinir todo o sistema para os dados de demonstração iniciais da Perfumaria Elegance? Todas as alterações manuais serão resetadas.'
      )
    ) {
      db.resetToFactory();
      setSuccessMsg('Banco de dados redefinido para padrão de demonstração. Recarregando...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <SettingsIcon className="w-3.5 h-3.5 text-stone-700" />
            <span>Painel de Controle do Sistema</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            Configurações Gerais
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Personalize dados cadastrais da loja, regras fiscais do cupom de venda, travas de estoque e backup.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex items-center space-x-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-medium flex items-center space-x-2.5 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-100 text-stone-900 font-serif font-bold text-base">
            <Store className="w-4 h-4 text-amber-700" />
            <span>Dados da Loja de Perfumaria</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Nome Fantasia da Loja *</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">CNPJ da Empresa *</label>
              <input
                type="text"
                required
                value={settings.cnpj}
                onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                className="w-full px-3 py-2 font-mono bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Telefone de Contato</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">WhatsApp Comercial</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Estado</label>
                <input
                  type="text"
                  maxLength={2}
                  value={settings.state}
                  onChange={(e) => setSettings({ ...settings, state: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 uppercase font-mono text-center bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operational & POS Rules */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-100 text-stone-900 font-serif font-bold text-base">
            <Sliders className="w-4 h-4 text-amber-700" />
            <span>Regras Operacionais &amp; Parâmetros de Venda</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Estoque Mínimo Padrão para Novos Produtos
              </label>
              <input
                type="number"
                min="1"
                value={settings.defaultMinStock}
                onChange={(e) => setSettings({ ...settings, defaultMinStock: Number(e.target.value) })}
                className="w-full px-3 py-2 font-mono bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Gera alerta amarelo quando o perfume atingir este saldo
              </span>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Desconto Máximo Permitido no PDV (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.maxDiscountPercent}
                onChange={(e) => setSettings({ ...settings, maxDiscountPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 font-mono bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Limite de segurança para operadores de caixa
              </span>
            </div>

            <div className="sm:col-span-2 pt-1 space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer p-3.5 bg-stone-50/60 rounded-xl border border-stone-200/80 hover:bg-stone-50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.allowNegativeStock}
                  onChange={(e) => setSettings({ ...settings, allowNegativeStock: e.target.checked })}
                  className="rounded text-stone-900 focus:ring-stone-500 mt-0.5"
                />
                <div>
                  <span className="font-medium text-stone-900 block text-xs sm:text-sm">
                    Permitir Venda Sem Estoque (Estoque Negativo)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Se desmarcado, o sistema trava vendas de perfumes com saldo zero no PDV.
                  </span>
                </div>
              </label>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Mensagem no Rodapé do Comprovante / Cupom Não Fiscal
                </label>
                <textarea
                  rows={2}
                  value={settings.receiptFooterMessage}
                  onChange={(e) => setSettings({ ...settings, receiptFooterMessage: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50/60 border border-stone-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </form>

      {/* Backup & Factory Reset */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-stone-100 text-stone-900 font-serif font-bold text-base">
          <Database className="w-4 h-4 text-stone-700" />
          <span>Manutenção de Dados, Backup &amp; Restauração</span>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          Gere cópias de segurança de todo o banco de dados da loja (produtos, estoque, vendas, caixas e auditoria) em
          formato JSON para preservação ou migração para outro computador.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Export */}
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center space-x-2 p-3 bg-stone-50/80 hover:bg-stone-100/80 border border-stone-200/80 rounded-xl text-xs font-medium text-stone-800 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar Backup (JSON)</span>
          </button>

          {/* Import */}
          <label className="flex items-center justify-center space-x-2 p-3 bg-stone-50/80 hover:bg-stone-100/80 border border-stone-200/80 rounded-xl text-xs font-medium text-stone-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-stone-700" />
            <span>Restaurar Backup</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          {/* Reset Demo */}
          <button
            onClick={handleResetDemo}
            className="flex items-center justify-center space-x-2 p-3 bg-stone-50/80 hover:bg-rose-50/80 border border-stone-200/80 hover:border-rose-200 rounded-xl text-xs font-medium text-stone-700 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Restaurar Padrão de Loja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
