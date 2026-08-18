import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  FolderCheck, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Calendar, 
  Settings, 
  Play, 
  Copy, 
  Info,
  FolderOpen,
  Sparkles,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { autoExportService, ScheduleConfig } from '../services/autoExportService';

interface AutoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AutoExportModal: React.FC<AutoExportModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [config, setConfig] = useState<ScheduleConfig>(() => autoExportService.getConfig());
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [isExportingNow, setIsExportingNow] = useState(false);

  const handleToggleEnabled = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    autoExportService.saveConfig(updated);
    onShowToast(updated.enabled ? 'Exportação automática diária das 07:00 ativada!' : 'Exportação automática desativada.');
  };

  const handleUpdateHour = (hour: number) => {
    const updated = { ...config, targetHour: hour };
    setConfig(updated);
    autoExportService.saveConfig(updated);
    onShowToast(`Horário de exportação ajustado para as ${String(hour).padStart(2, '0')}:00.`);
  };

  const handleUpdateDirectory = (newDir: string) => {
    const updated = { ...config, saveDirectory: newDir };
    setConfig(updated);
    autoExportService.saveConfig(updated);
  };

  const handleExportNow = () => {
    setIsExportingNow(true);
    const result = autoExportService.performDailyExport('MANUAL');
    setIsExportingNow(false);
    setConfig(autoExportService.getConfig());
    onShowToast(`✓ Arquivo "${result.fileName}" gerado com sucesso com ${result.rdosCount} registros!`);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(config.saveDirectory);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2500);
    onShowToast('Caminho do diretório copiado!');
  };

  const handleCopyScript = () => {
    const script = autoExportService.generatePowerShellScript();
    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
    onShowToast('Script PowerShell copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0f4c81] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-slate-950 font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight flex items-center gap-2">
                Exportação Automática Diária (.XLSX)
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  07:00 AM
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Geração periódica e backup diário da movimentação de obras SEEL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-2">
                  <span>Rotina Automática Diária das 07:00</span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {config.enabled ? 'Ativa' : 'Pausada'}
                  </span>
                </div>
                <div className="text-xs text-emerald-800">
                  {config.lastAutoExportDate 
                    ? `Última exportação executada em: ${config.lastAutoExportDate}`
                    : 'Aguardando primeiro ciclo automático'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleEnabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  config.enabled 
                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                {config.enabled ? 'Desativar Rotina' : 'Ativar Rotina'}
              </button>

              <button
                type="button"
                onClick={handleExportNow}
                disabled={isExportingNow}
                className="bg-[#0f4c81] hover:bg-[#0a3459] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingNow ? 'Gerando...' : 'Exportar XLS Agora'}</span>
              </button>
            </div>
          </div>

          {/* Directory Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-[#0f4c81]" />
                Diretório Alvo do OneDrive / Servidor:
              </label>
              <button
                type="button"
                onClick={handleCopyPath}
                className="text-xs text-[#0f4c81] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedPath ? 'Copiado!' : 'Copiar Caminho'}
              </button>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={config.saveDirectory}
                onChange={(e) => handleUpdateDirectory(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              * Quando o navegador efetuar o download automático às 07:00, configure o navegador para salvar por padrão na sua pasta do OneDrive acima ou utilize o script de automação.
            </p>
          </div>

          {/* Schedule Configuration Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Horário do Disparo Automático:
              </label>
              <select
                value={config.targetHour}
                onChange={(e) => handleUpdateHour(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2"
              >
                <option value={6}>06:00 AM</option>
                <option value={7}>07:00 AM (Padrão Solicitado)</option>
                <option value={8}>08:00 AM</option>
                <option value={18}>18:00 PM (Fechamento do Dia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Formato das Planilhas:
              </label>
              <div className="text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between">
                <span>Excel (.xlsx) Multi-Abas</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  4 Abas Completas
                </span>
              </div>
            </div>
          </div>

          {/* Script Automation helper for Windows Task Scheduler */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">
                  Automação com o Agendador de Tarefas do Windows (Task Scheduler)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyScript}
                className="text-xs bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3 h-3 text-[#0f4c81]" />
                {copiedScript ? 'Script Copiado!' : 'Copiar Script (.ps1)'}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Você pode deixar esta janela do navegador aberta para download direto às 07:00, ou agendar uma rotina no Windows para salvar o arquivo diário diretamente na pasta:
              <br />
              <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[#0f4c81] text-[10px] font-mono mt-1 inline-block">
                {config.saveDirectory}
              </code>
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configuração salva automaticamente</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#0f4c81] hover:bg-[#0a3459] text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer shadow-xs"
          >
            Concluir & Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
