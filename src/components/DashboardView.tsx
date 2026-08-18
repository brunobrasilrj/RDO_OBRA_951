import React from 'react';
import { 
  BarChart3, 
  Users, 
  Truck, 
  CloudRain, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  HardHat,
  TrendingUp
} from 'lucide-react';
import { RDOData } from '../types';

interface DashboardViewProps {
  history: RDOData[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ history }) => {
  const totalRDOs = history.length;
  
  const totalEfetivoSum = history.reduce((acc, r) => acc + (r.totalEfetivo || 0), 0);
  const avgEfetivo = totalRDOs > 0 ? (totalEfetivoSum / totalRDOs).toFixed(1) : '0';

  const totalAdminSum = history.reduce((acc, r) => acc + (r.totalAdmin || 0), 0);
  const totalCampoSum = history.reduce((acc, r) => acc + (r.totalCampo || 0), 0);

  const totalEquipmentsAlocated = history.reduce((acc, r) => acc + (r.equipments ? r.equipments.length : 0), 0);
  const avgEquip = totalRDOs > 0 ? (totalEquipmentsAlocated / totalRDOs).toFixed(1) : '0';

  // Rain days count
  const rainDays = history.filter(r => 
    r.clima && (r.clima.manha.includes('CHUVA') || r.clima.tarde.includes('CHUVA') || r.solo === 'SATURADO')
  ).length;

  const estimatedManHours = totalEfetivoSum * 8;

  // Equipment breakdown by group
  const equipGroupCounts: Record<string, number> = {};
  history.forEach(r => {
    if (r.equipments) {
      r.equipments.forEach(eq => {
        equipGroupCounts[eq.groupName] = (equipGroupCounts[eq.groupName] || 0) + 1;
      });
    }
  });

  const sortedEquipGroups = Object.entries(equipGroupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#0f4c81] p-1.5 rounded-lg text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
              Painel de Métricas & Produção do Canteiro
            </h3>
            <p className="text-[11px] text-slate-500">
              Consolidado dos dados de mão de obra, maquinário e índices climáticos
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1 */}
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-1">
          <div className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0f4c81]" /> Relatórios Emitidos
          </div>
          <div className="text-2xl font-black text-[#0f4c81]">{totalRDOs}</div>
          <div className="text-[10px] text-slate-500">Total de diários registrados</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-1">
          <div className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
            <HardHat className="w-4 h-4 text-amber-600" /> Média de Mão de Obra
          </div>
          <div className="text-2xl font-black text-amber-900">{avgEfetivo} <span className="text-xs font-normal">pess/dia</span></div>
          <div className="text-[10px] text-slate-500">{totalCampoSum} campo • {totalAdminSum} admin</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-1">
          <div className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" /> Homens-Hora (HH)
          </div>
          <div className="text-2xl font-black text-emerald-900">{estimatedManHours} <span className="text-xs font-normal">HH</span></div>
          <div className="text-[10px] text-slate-500">Estimado a 8h/jornada</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-1">
          <div className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-rose-600" /> Dias com Chuva / Solo
          </div>
          <div className="text-2xl font-black text-rose-900">{rainDays} <span className="text-xs font-normal">dias</span></div>
          <div className="text-[10px] text-slate-500">{totalRDOs > 0 ? `${((rainDays / totalRDOs) * 100).toFixed(0)}% do período` : '0%'}</div>
        </div>

      </div>

      {/* Equipment allocation breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* Top Maquinários */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-xs text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Truck className="w-4 h-4 text-[#0f4c81]" /> Top Famílias de Equipamentos Alocados
          </h4>

          {sortedEquipGroups.length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">Nenhum equipamento registrado ainda.</div>
          ) : (
            <div className="space-y-2">
              {sortedEquipGroups.map(([name, count]) => {
                const pct = totalEquipmentsAlocated > 0 ? Math.round((count / totalEquipmentsAlocated) * 100) : 0;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="truncate">{name}</span>
                      <span>{count} alocações ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0f4c81] rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informações da Equipe de Campo */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-xs text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Conformidade & Segurança da Obra
          </h4>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
              <span className="font-medium">Índice de DDS Realizados:</span>
              <span className="font-bold text-emerald-700">100% dos dias</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
              <span className="font-medium">Total de Fotos de Campo:</span>
              <span className="font-bold text-[#0f4c81]">
                {history.reduce((acc, r) => acc + (r.photos ? r.photos.length : 0), 0)} fotos arquivadas
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
              <span className="font-medium">Vistos Digitais Registrados:</span>
              <span className="font-bold text-slate-800">
                {history.filter(r => r.signatures?.contratadaSignData).length} de {totalRDOs} RDOs
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
