import React from 'react';
import { Info, Calendar, MapPin, Users, Briefcase, FileCheck, Building2 } from 'lucide-react';
import { RDOData } from '../types';

interface GeneralInfoSectionProps {
  rdo: RDOData;
  onChange: (field: keyof RDOData, value: any) => void;
  onSignaturesChange: (field: 'contratada' | 'contratante', value: string) => void;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  rdo,
  onChange,
  onSignaturesChange
}) => {
  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    onChange('data', dateStr);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase flex items-center gap-2 tracking-wide">
          <Info className="w-4 h-4 text-[#0f4c81]" /> 
          Informações Gerais da Obra & Contrato
        </h3>
        <div className="flex items-center gap-1.5 text-xs">
          <button 
            type="button" 
            onClick={() => setQuickDate(0)} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-semibold transition"
          >
            Hoje
          </button>
          <button 
            type="button" 
            onClick={() => setQuickDate(1)} 
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[11px] font-semibold transition"
          >
            Ontem
          </button>
        </div>
      </div>

      {/* Grid 1: Contratada, Obra, Contrato, Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#0f4c81]" /> Contratada
          </label>
          <input 
            type="text" 
            value={rdo.contratada} 
            onChange={(e) => onChange('contratada', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-[#0f4c81]" /> Obra / Cliente
          </label>
          <input 
            type="text" 
            value={rdo.obra} 
            placeholder="Ex: ECORIOMINAS"
            onChange={(e) => onChange('obra', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-[#0f4c81]" /> Nº do Contrato
          </label>
          <input 
            type="text" 
            value={rdo.contrato} 
            placeholder="Ex: CONTRATO TERRAPLANAGEM IDCT9603"
            onChange={(e) => onChange('contrato', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#0f4c81]" /> Data do RDO
          </label>
          <input 
            type="date" 
            value={rdo.data} 
            onChange={(e) => onChange('data', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-bold text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>
      </div>

      {/* Grid 2: Trecho, Equipe, Responsáveis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" /> Trecho / KM / Estaca
          </label>
          <input 
            type="text" 
            value={rdo.trecho} 
            placeholder="Ex: KM 42+500 / Estaca 120 - Pista Norte"
            onChange={(e) => onChange('trecho', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#0f4c81]" /> Frente / Equipe
          </label>
          <input 
            type="text" 
            value={rdo.equipe} 
            placeholder="Ex: Equipe A - Terraplanagem"
            onChange={(e) => onChange('equipe', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Resp. Contratada (SEEL)
          </label>
          <input 
            type="text" 
            value={rdo.signatures.contratada} 
            placeholder="Engenheiro Responsável - SEEL"
            onChange={(e) => onSignaturesChange('contratada', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Fiscal / Contratante (ECO)
          </label>
          <input 
            type="text" 
            value={rdo.signatures.contratante} 
            placeholder="Fiscal de Obra - ECORIOMINAS"
            onChange={(e) => onSignaturesChange('contratante', e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
          />
        </div>
      </div>
    </div>
  );
};
