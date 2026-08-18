import React from 'react';
import { Users, Briefcase, HardHat, Copy, RotateCcw, Plus, Minus } from 'lucide-react';
import { ADMIN_ROLES, CAMPO_ROLES } from '../data/constants';
import { RDOData } from '../types';

interface WorkforceSectionProps {
  rdo: RDOData;
  onRoleChange: (role: string, qty: number) => void;
  onCopyPreviousWorkforce?: () => void;
  onClearWorkforce?: () => void;
}

export const WorkforceSection: React.FC<WorkforceSectionProps> = ({
  rdo,
  onRoleChange,
  onCopyPreviousWorkforce,
  onClearWorkforce
}) => {
  const adjustCounter = (role: string, delta: number) => {
    const current = rdo.roles[role] || 0;
    const newVal = Math.max(0, current + delta);
    onRoleChange(role, newVal);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      
      {/* Header and Summary Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#f59e0b] p-1.5 rounded-lg text-slate-950">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
              Efetivo de Mão de Obra
            </h3>
            <p className="text-[11px] text-slate-500">
              Apontamento diário de pessoal administrativo e operacional de campo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onCopyPreviousWorkforce && (
            <button
              type="button"
              onClick={onCopyPreviousWorkforce}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
              title="Copiar números de efetivo do último RDO salvo"
            >
              <Copy className="w-3.5 h-3.5 text-[#0f4c81]" />
              <span className="hidden sm:inline">Repetir Efetivo Anterior</span>
            </button>
          )}

          {onClearWorkforce && (
            <button
              type="button"
              onClick={onClearWorkforce}
              className="bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs px-2 py-1.5 rounded-lg transition"
              title="Zerar todos os contadores"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            <span className="bg-blue-50 text-[#0f4c81] font-bold px-2.5 py-1 rounded-md border border-blue-200">
              Admin: {rdo.totalAdmin}
            </span>
            <span className="bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-md border border-amber-200">
              Campo: {rdo.totalCampo}
            </span>
            <span className="bg-slate-900 text-white font-black px-3 py-1 rounded-md shadow-xs">
              Total: {rdo.totalEfetivo}
            </span>
          </div>
        </div>
      </div>

      {/* EFETIVO ADMINISTRATIVO */}
      <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-[#0f4c81] uppercase flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Efetivo Administrativo & Técnico
          </span>
          <span className="text-xs font-semibold text-[#0f4c81]">
            Subtotal: {rdo.totalAdmin} pessoa{rdo.totalAdmin !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
          {ADMIN_ROLES.map((role) => {
            const count = rdo.roles[role] || 0;
            const hasValue = count > 0;
            return (
              <div 
                key={role}
                className={`p-2 rounded-lg border transition flex flex-col justify-between ${
                  hasValue 
                    ? 'bg-white border-[#0f4c81]/40 shadow-xs ring-1 ring-[#0f4c81]/20' 
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <label className="text-[11px] font-semibold text-slate-700 leading-tight mb-1 truncate" title={role}>
                  {role}
                </label>
                <div className="flex items-center space-x-1">
                  <button 
                    type="button" 
                    onClick={() => adjustCounter(role, -1)}
                    className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-xs flex items-center justify-center select-none"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  
                  <input 
                    type="number" 
                    min="0" 
                    value={count} 
                    onChange={(e) => onRoleChange(role, Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full text-center text-xs font-bold border rounded py-1 focus:ring-1 focus:ring-[#0f4c81] ${
                      hasValue ? 'text-[#0f4c81] bg-blue-50/50 border-blue-300' : 'text-slate-700 border-slate-200'
                    }`}
                  />

                  <button 
                    type="button" 
                    onClick={() => adjustCounter(role, 1)}
                    className="w-7 h-7 rounded bg-blue-100 hover:bg-blue-200 active:scale-95 text-[#0f4c81] font-black text-xs flex items-center justify-center select-none"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EFETIVO DE CAMPO */}
      <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-100/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-amber-900 uppercase flex items-center gap-1.5">
            <HardHat className="w-3.5 h-3.5 text-amber-600" /> Efetivo Operacional de Campo
          </span>
          <span className="text-xs font-semibold text-amber-900">
            Subtotal: {rdo.totalCampo} pessoa{rdo.totalCampo !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {CAMPO_ROLES.map((role) => {
            const count = rdo.roles[role] || 0;
            const hasValue = count > 0;
            return (
              <div 
                key={role}
                className={`p-2 rounded-lg border transition flex flex-col justify-between ${
                  hasValue 
                    ? 'bg-white border-amber-400 shadow-xs ring-1 ring-amber-400/30' 
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <label className="text-[11px] font-semibold text-slate-700 leading-tight mb-1 truncate" title={role}>
                  {role}
                </label>
                <div className="flex items-center space-x-1">
                  <button 
                    type="button" 
                    onClick={() => adjustCounter(role, -1)}
                    className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-black text-xs flex items-center justify-center select-none"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  
                  <input 
                    type="number" 
                    min="0" 
                    value={count} 
                    onChange={(e) => onRoleChange(role, Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full text-center text-xs font-bold border rounded py-1 focus:ring-1 focus:ring-[#0f4c81] ${
                      hasValue ? 'text-amber-900 bg-amber-50/50 border-amber-300' : 'text-slate-700 border-slate-200'
                    }`}
                  />

                  <button 
                    type="button" 
                    onClick={() => adjustCounter(role, 1)}
                    className="w-7 h-7 rounded bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-black text-xs flex items-center justify-center select-none"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
