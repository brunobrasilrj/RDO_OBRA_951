import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Shield, 
  LogIn, 
  Save, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  Copy, 
  Filter, 
  RefreshCw,
  Eye,
  CheckCircle2,
  Smartphone,
  Monitor
} from 'lucide-react';
import { AccessLog } from '../types';
import { authService } from '../services/authService';

interface AccessLogsViewProps {
  onRefresh?: () => void;
}

export const AccessLogsView: React.FC<AccessLogsViewProps> = () => {
  const [logs, setLogs] = useState<AccessLog[]>(() => authService.getLocalLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = authService.subscribeToAccessLogs((cloudLogs) => {
      setLogs(cloudLogs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (dateFilter && !log.date.includes(dateFilter) && !log.timestamp.includes(dateFilter)) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.userName.toLowerCase().includes(term) ||
      log.userEmail.toLowerCase().includes(term) ||
      log.userRole.toLowerCase().includes(term) ||
      (log.details && log.details.toLowerCase().includes(term))
    );
  });

  const getActionBadge = (action: AccessLog['action']) => {
    switch (action) {
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <LogIn className="w-3 h-3" /> Login / Acesso
          </span>
        );
      case 'CADASTRO':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <User className="w-3 h-3" /> Cadastro de Usuário
          </span>
        );
      case 'SALVAR_RDO':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-[#0f4c81] border border-blue-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <Save className="w-3 h-3" /> Salvar RDO
          </span>
        );
      case 'EXCLUIR_RDO':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <Trash2 className="w-3 h-3" /> Excluir RDO
          </span>
        );
      case 'VISUALIZAR_PDF':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <FileText className="w-3 h-3" /> Gerar PDF
          </span>
        );
      case 'EXPORTAR_EXCEL':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 border border-teal-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <FileSpreadsheet className="w-3 h-3" /> Exportar Excel
          </span>
        );
      case 'CLONAR_RDO':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <Copy className="w-3 h-3" /> Clonar RDO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
            <Activity className="w-3 h-3" /> {action}
          </span>
        );
    }
  };

  // Distinct users in logs
  const distinctUsers = new Set(logs.map(l => l.userEmail)).size;
  const todayLogs = logs.filter(l => {
    const today = new Date().toLocaleDateString('pt-BR');
    return l.date === today;
  }).length;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      
      {/* Title & Summary Cards */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#0f4c81] p-2 rounded-lg text-white">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
              Auditoria de Uso & Registro de Acesso ({logs.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Rastreamento em tempo real de acessos, login, e-mails, horários e ações executadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#0f4c81]" />
            <span className="font-bold text-slate-700">{distinctUsers} Usuário(s) Ativo(s)</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-bold text-emerald-800">{todayLogs} Eventos Hoje</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar por nome, e-mail, função ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md text-xs font-semibold"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="LOGIN">Apenas Logins</option>
            <option value="CADASTRO">Novos Cadastros</option>
            <option value="SALVAR_RDO">RDOs Salvos</option>
            <option value="VISUALIZAR_PDF">PDFs Gerados</option>
            <option value="EXPORTAR_EXCEL">Exportações Excel</option>
            <option value="EXCLUIR_RDO">Exclusões</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <input 
            type="text"
            placeholder="Data (DD/MM/AAAA)"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md text-xs font-medium"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="bg-slate-200 text-slate-700 px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <Activity className="w-10 h-10 mx-auto text-slate-300" />
          <div className="font-bold text-sm text-slate-600">Nenhum registro de acesso encontrado</div>
          <p className="text-xs text-slate-400">
            {searchTerm || actionFilter !== 'ALL' || dateFilter
              ? 'Nenhum evento corresponde aos filtros aplicados.'
              : 'Os acessos e ações dos usuários aparecerão aqui automaticamente.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-3 border-b border-slate-200">Data & Hora</th>
                <th className="p-3 border-b border-slate-200">Usuário Identificado</th>
                <th className="p-3 border-b border-slate-200">E-mail</th>
                <th className="p-3 border-b border-slate-200 text-center">Função</th>
                <th className="p-3 border-b border-slate-200 text-center">Ação Realizada</th>
                <th className="p-3 border-b border-slate-200">Detalhes / Telemetria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition">
                  <td className="p-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[#0f4c81]" />
                      <span>{item.date}</span>
                      <span className="text-slate-400">•</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[#0f4c81]">{item.time}</span>
                    </div>
                  </td>

                  <td className="p-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0f4c81] text-white flex items-center justify-center font-black text-[10px]">
                        {item.userName.charAt(0)}
                      </div>
                      <span>{item.userName}</span>
                    </div>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    {item.userEmail}
                  </td>

                  <td className="p-3 text-center">
                    <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                      {item.userRole}
                    </span>
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {getActionBadge(item.action)}
                  </td>

                  <td className="p-3 max-w-[280px] truncate text-[11px] text-slate-600">
                    {item.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
