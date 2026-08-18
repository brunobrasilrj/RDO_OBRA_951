import React from 'react';
import { 
  Save, 
  FileText, 
  FileSpreadsheet, 
  History, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  PlusCircle,
  Copy,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile, SyncStats } from '../types';

interface HeaderProps {
  logoUrl: string;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  syncStats: SyncStats;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onNewRDO: () => void;
  onClonePreviousRDO?: () => void;
  onSaveRDO: () => void;
  onPreviewPDF: () => void;
  onExportExcel: () => void;
  onOpenAutoExport?: () => void;
  onOpenHistory: () => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  logoUrl,
  onLogoUpload,
  syncStats,
  currentUser,
  onOpenAuth,
  onNewRDO,
  onClonePreviousRDO,
  onSaveRDO,
  onPreviewPDF,
  onExportExcel,
  onOpenAutoExport,
  onOpenHistory,
  onSyncNow,
  isSyncing,
  historyCount
}) => {
  return (
    <header className="bg-[#0f4c81] text-white shadow-lg sticky top-0 z-40 print:hidden border-b border-[#0a3459]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <label className="relative group cursor-pointer" title="Logomarca SEEL - Serviços Especiais de Engenharia">
            <div className="bg-[#06477d] p-0.5 rounded-lg border border-amber-400/40 flex items-center justify-center min-w-[64px] h-[44px] overflow-hidden shadow-sm transition group-hover:ring-2 group-hover:ring-amber-400">
              <img 
                src={logoUrl} 
                alt="SEEL - Serviços Especiais de Engenharia" 
                className="h-full w-auto object-contain rounded-xs"
              />
            </div>
            <div className="hidden group-hover:flex absolute inset-0 bg-black/60 rounded-lg items-center justify-center text-[10px] text-white font-bold">
              <ImageIcon className="w-3.5 h-3.5 mr-1 text-amber-400" /> Trocar
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={onLogoUpload}
            />
          </label>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight text-white">
                SEEL Engenharia
              </h1>
              <span className="bg-[#f59e0b] text-[#0a3459] text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                RDO Field
              </span>
            </div>
            <p className="text-[11px] text-blue-200 hidden sm:block">
              Sistema de Relatório Diário de Obra • Contrato Terraplanagem
            </p>
          </div>
        </div>

        {/* Sync & Connectivity Status */}
        <div className="flex items-center gap-2">
          <div 
            onClick={onSyncNow}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition border ${
              syncStats.isOnline 
                ? syncStats.pendingCount > 0 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-400/40 hover:bg-rose-500/30'
            }`}
            title="Clique para sincronizar os dados com a nuvem"
          >
            {syncStats.isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}

            <span className="hidden md:inline">
              {syncStats.isOnline 
                ? syncStats.pendingCount > 0 
                  ? `${syncStats.pendingCount} pendente(s)` 
                  : 'Nuvem Sincronizada'
                : 'Modo Offline (Salvo Local)'}
            </span>

            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-300' : 'text-slate-300'}`} />
          </div>

          {/* User profile button */}
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-[#0a3459] hover:bg-[#07243e] text-white text-xs px-2.5 py-1.5 rounded-lg border border-blue-400/30 transition shadow-sm cursor-pointer"
              title="Usuário conectado - Clique para trocar ou configurar"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <span className="font-medium hidden lg:inline max-w-[120px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
              title="Acessar com e-mail e senha"
            >
              <span>Identificar / Entrar</span>
            </button>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-blue-800/60">
          
          <button 
            id="btn-new-rdo"
            onClick={onNewRDO}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-2.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition border border-blue-400/30"
            title="Iniciar novo RDO em branco"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-200" />
            <span className="hidden sm:inline">Novo RDO</span>
          </button>

          {onClonePreviousRDO && (
            <button 
              id="btn-clone-previous-rdo"
              onClick={onClonePreviousRDO}
              className="bg-[#1e4976] hover:bg-[#255b94] active:scale-95 text-blue-100 hover:text-white text-xs font-semibold px-2.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition border border-blue-400/30"
              title="Clonar o RDO anterior (preenche equipes, efetivos, equipamentos e dados da obra)"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden md:inline">Clonar Anterior</span>
            </button>
          )}

          <button 
            id="btn-save-rdo"
            onClick={onSaveRDO}
            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm shadow-emerald-900/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar RDO</span>
          </button>

          <button 
            id="btn-preview-pdf"
            onClick={onPreviewPDF}
            className="flex-1 sm:flex-initial bg-[#f59e0b] hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm shadow-amber-900/20"
          >
            <FileText className="w-3.5 h-3.5 text-slate-950" />
            <span>Visualizar / PDF</span>
          </button>

          <button 
            id="btn-export-excel"
            onClick={onExportExcel}
            className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white text-xs font-semibold px-2.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition hidden sm:flex cursor-pointer"
            title="Exportar base completa para planilha Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline">Excel</span>
          </button>

          {onOpenAutoExport && (
            <button 
              id="btn-auto-export"
              onClick={onOpenAutoExport}
              className="bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-semibold px-2.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-teal-500/40"
              title="Configuração de Exportação Automática Diária às 07:00 para o OneDrive"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Auto 07h</span>
            </button>
          )}

          <button 
            id="btn-history"
            onClick={onOpenHistory}
            className="bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-semibold px-2.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition relative"
            title="Histórico de RDOs salvos"
          >
            <History className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden sm:inline">Histórico</span>
            {historyCount > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
