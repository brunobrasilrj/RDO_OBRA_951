import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  FileText, 
  Trash2, 
  Copy, 
  FileSpreadsheet, 
  Wifi, 
  Clock, 
  Calendar, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { RDOData } from '../types';

interface HistoryViewProps {
  history: RDOData[];
  onLoadRDO: (rdo: RDOData) => void;
  onDuplicateRDO: (rdo: RDOData) => void;
  onDeleteRDO: (id: string) => void;
  onExportExcel: () => void;
  onPreviewRDO: (rdo: RDOData) => void;
  onNewRDO: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onLoadRDO,
  onDuplicateRDO,
  onDeleteRDO,
  onExportExcel,
  onPreviewRDO,
  onNewRDO
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredHistory = history.filter(item => {
    if (dateFilter && item.data !== dateFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.data && item.data.includes(term)) ||
      (item.obra && item.obra.toLowerCase().includes(term)) ||
      (item.trecho && item.trecho.toLowerCase().includes(term)) ||
      (item.equipe && item.equipe.toLowerCase().includes(term)) ||
      (item.atividades && item.atividades.toLowerCase().includes(term))
    );
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return d && m && y ? `${d}/${m}/${y}` : dateStr;
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      
      {/* Header and Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#0f4c81] p-1.5 rounded-lg text-white">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
              Histórico de RDOs Salvos ({history.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Consulte, duplique, edite ou exporte relatórios diários de obras anteriores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewRDO}
            className="bg-[#0f4c81] hover:bg-[#0a3459] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
          >
            <span>+ Novo RDO em Branco</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Todos para Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por trecho, obra, atividades ou equipe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md text-xs font-medium"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="bg-slate-200 text-slate-700 px-2 py-1.5 rounded text-[11px] font-bold"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <History className="w-10 h-10 mx-auto text-slate-300" />
          <div className="font-bold text-sm text-slate-600">Nenhum RDO encontrado</div>
          <p className="text-xs text-slate-400">
            {searchTerm || dateFilter ? 'Nenhum resultado corresponde aos filtros aplicados.' : 'Preencha o formulário e clique em "Salvar RDO" para arquivar relatórios.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-3 border-b border-slate-200">Data</th>
                  <th className="p-3 border-b border-slate-200">Obra / Trecho</th>
                  <th className="p-3 border-b border-slate-200 text-center">Efetivo</th>
                  <th className="p-3 border-b border-slate-200 text-center">Equipamentos</th>
                  <th className="p-3 border-b border-slate-200 text-center">Clima</th>
                  <th className="p-3 border-b border-slate-200 text-center">Status Nuvem</th>
                  <th className="p-3 border-b border-slate-200 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition">
                    <td className="p-3 font-bold text-[#0f4c81] whitespace-nowrap">
                      {formatDate(item.data)}
                    </td>
                    <td className="p-3 max-w-[220px]">
                      <div className="font-semibold text-slate-900 truncate">{item.obra}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.trecho || 'Sem trecho especificado'}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                        {item.totalEfetivo || 0} pess.
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-50 text-[#0f4c81] font-semibold px-2 py-0.5 rounded border border-blue-100">
                        {item.equipments ? item.equipments.length : 0} maq.
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[10px] font-bold text-slate-600">
                        {item.clima?.manha} / {item.clima?.tarde}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {item.syncStatus === 'synced' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Sincronizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onLoadRDO(item)}
                          className="bg-[#0f4c81] hover:bg-[#0a3459] text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs transition"
                          title="Carregar no formulário para edição"
                        >
                          Carregar
                        </button>
                        <button
                          type="button"
                          onClick={() => onPreviewRDO(item)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2 py-1.5 rounded-lg text-xs transition"
                          title="Visualizar PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateRDO(item)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition"
                          title="Duplicar RDO para hoje"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRDO(item.id)}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                          title="Excluir RDO"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredHistory.map((item) => (
              <div 
                key={item.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0f4c81]" />
                    <span className="font-bold text-sm text-[#0f4c81]">{formatDate(item.data)}</span>
                  </div>
                  {item.syncStatus === 'synced' ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Sincronizado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Pendente Local
                    </span>
                  )}
                </div>

                <div>
                  <div className="font-bold text-xs text-slate-900">{item.obra}</div>
                  <div className="text-[11px] text-slate-600">{item.trecho || 'Sem trecho especificado'}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-600">
                    Efetivo: <b>{item.totalEfetivo}</b> • Maq: <b>{item.equipments?.length || 0}</b>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Solo: {item.solo === 'SATURADO' ? 'Saturado' : 'Trabalhável'}
                  </span>
                </div>

                {/* Mobile Actions */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onLoadRDO(item)}
                    className="bg-[#0f4c81] text-white py-1.5 rounded-lg text-xs font-semibold text-center"
                  >
                    Carregar
                  </button>
                  <button
                    type="button"
                    onClick={() => onPreviewRDO(item)}
                    className="bg-amber-500 text-slate-950 py-1.5 rounded-lg text-xs font-bold text-center"
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRDO(item.id)}
                    className="bg-rose-50 text-rose-700 py-1.5 rounded-lg text-xs font-semibold text-center"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};
