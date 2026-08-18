import React from 'react';
import { 
  CloudSun, 
  Mountain, 
  Clock, 
  ShieldCheck, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { ClimateCondition, RDOData, SoilCondition } from '../types';
import { QUICK_DDS_TEMPLATES } from '../data/constants';

interface ClimateSectionProps {
  rdo: RDOData;
  onChange: (field: keyof RDOData, value: any) => void;
  onClimaChange: (period: 'manha' | 'tarde' | 'noite', value: ClimateCondition) => void;
  onJornadaChange: (field: 'e1' | 's1' | 'e2' | 's2', value: string) => void;
  onPluvioChange: (value: string) => void;
}

export const ClimateSection: React.FC<ClimateSectionProps> = ({
  rdo,
  onChange,
  onClimaChange,
  onJornadaChange,
  onPluvioChange
}) => {
  const calculateWorkHours = (): string => {
    try {
      const { e1, s1, e2, s2 } = rdo.jornada;
      if (!e1 || !s1) return '0h';

      const [h1, m1] = e1.split(':').map(Number);
      const [h2, m2] = s1.split(':').map(Number);
      let mins1 = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (mins1 < 0) mins1 = 0;

      let mins2 = 0;
      if (e2 && s2) {
        const [h3, m3] = e2.split(':').map(Number);
        const [h4, m4] = s2.split(':').map(Number);
        mins2 = (h4 * 60 + m4) - (h3 * 60 + m3);
        if (mins2 < 0) mins2 = 0;
      }

      const totalMins = mins1 + mins2;
      const totalHours = Math.floor(totalMins / 60);
      const remMins = totalMins % 60;
      return `${totalHours}h${remMins > 0 ? ` ${remMins}m` : ''}`;
    } catch {
      return '8h';
    }
  };

  const climateOptions: { value: ClimateCondition; label: string }[] = [
    { value: 'BOM', label: 'BOM / CLARO' },
    { value: 'NUBLADO', label: 'NUBLADO' },
    { value: 'CHUVA LEVE', label: 'CHUVA LEVE' },
    { value: 'CHUVA FORTE', label: 'CHUVA FORTE' },
    { value: 'IMPRACTICÁVEL', label: 'IMPRACTICÁVEL' },
    { value: 'SEM TRABALHO', label: 'SEM TRABALHO' }
  ];

  const applyDdsTemplate = (template: string) => {
    const current = rdo.dds ? rdo.dds.trim() : '';
    if (!current) {
      onChange('dds', template);
    } else {
      onChange('dds', `${current}\n• ${template}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      
      {/* 1. CLIMA E TEMPO */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <CloudSun className="w-4 h-4 text-amber-500" />
            Condições Climáticas
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Manhã:</span>
                <span className="text-[11px] font-bold text-[#0f4c81]">{rdo.clima.manha}</span>
              </label>
              <select 
                value={rdo.clima.manha}
                onChange={(e) => onClimaChange('manha', e.target.value as ClimateCondition)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium focus:ring-1 focus:ring-[#0f4c81]"
              >
                {climateOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Tarde:</span>
                <span className="text-[11px] font-bold text-[#0f4c81]">{rdo.clima.tarde}</span>
              </label>
              <select 
                value={rdo.clima.tarde}
                onChange={(e) => onClimaChange('tarde', e.target.value as ClimateCondition)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium focus:ring-1 focus:ring-[#0f4c81]"
              >
                {climateOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Noite:</span>
                <span className="text-[11px] font-bold text-[#0f4c81]">{rdo.clima.noite}</span>
              </label>
              <select 
                value={rdo.clima.noite}
                onChange={(e) => onClimaChange('noite', e.target.value as ClimateCondition)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium focus:ring-1 focus:ring-[#0f4c81]"
              >
                {climateOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Weather Status Pill */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">Impacto na Obra:</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
            rdo.clima.manha.includes('CHUVA') || rdo.clima.tarde.includes('CHUVA') || rdo.clima.manha === 'IMPRACTICÁVEL' || rdo.clima.tarde === 'IMPRACTICÁVEL'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {rdo.clima.manha.includes('CHUVA') || rdo.clima.tarde.includes('CHUVA') || rdo.clima.manha === 'IMPRACTICÁVEL'
              ? 'Período Chuvoso / Alerta'
              : 'Produção Normal'}
          </span>
        </div>
      </div>

      {/* 2. SOLO, PLUVIÔMETRO & JORNADA */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <Mountain className="w-4 h-4 text-[#0f4c81]" />
          Solo, Pluviômetro & Jornada
        </h3>

        {/* Soil & Rain Box */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Condição do Solo / Praça:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChange('solo', 'EM CONDIÇÕES DE TRABALHO')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition border ${
                  rdo.solo === 'EM CONDIÇÕES DE TRABALHO'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ✓ Trabalhável
              </button>
              <button
                type="button"
                onClick={() => onChange('solo', 'SATURADO')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition border ${
                  rdo.solo === 'SATURADO'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ⚠ Saturado
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Pluviômetro (mm/m²):</label>
              <div className="flex gap-1">
                {['0 mm', '5 mm', '15 mm', '30 mm'].map(quickVal => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => onPluvioChange(`${quickVal}/m²`)}
                    className="bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                  >
                    {quickVal}
                  </button>
                ))}
              </div>
            </div>
            <input 
              type="text" 
              value={rdo.pluviometro?.mm || '0 mm/m²'}
              onChange={(e) => onPluvioChange(e.target.value)}
              placeholder="Ex: 12 mm/m² ou 0 mm/m²"
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-bold text-slate-800 focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>
        </div>

        {/* Work Shift Hours */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0f4c81]" /> Horário de Trabalho
            </span>
            <span className="text-[11px] font-bold text-[#0f4c81] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Total: {calculateWorkHours()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Entrada 1:</span>
              <input 
                type="time" 
                value={rdo.jornada.e1}
                onChange={(e) => onJornadaChange('e1', e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Saída 1 (Almoço):</span>
              <input 
                type="time" 
                value={rdo.jornada.s1}
                onChange={(e) => onJornadaChange('s1', e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Entrada 2:</span>
              <input 
                type="time" 
                value={rdo.jornada.e2}
                onChange={(e) => onJornadaChange('e2', e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 bg-white font-medium"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Saída 2:</span>
              <input 
                type="time" 
                value={rdo.jornada.s2}
                onChange={(e) => onJornadaChange('s2', e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 bg-white font-medium"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. DDS E SEGURANÇA */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Segurança & DDS
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              SMS Canteiro
            </span>
          </div>

          <div className="pt-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-600">
              Tema do Diálogo Diário de Segurança (DDS):
            </label>
            <textarea 
              rows={4}
              value={rdo.dds}
              onChange={(e) => onChange('dds', e.target.value)}
              placeholder="Digite aqui os assuntos abordados na reunião matinal de segurança..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium leading-relaxed focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>
        </div>

        {/* Quick DDS Suggestions */}
        <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 mb-1.5">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Sugestões Rápidas de DDS:
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_DDS_TEMPLATES.slice(0, 3).map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyDdsTemplate(tpl)}
                className="bg-white hover:bg-emerald-100 text-slate-700 text-[10px] font-medium px-2 py-1 rounded border border-emerald-200 transition text-left truncate max-w-full"
                title={tpl}
              >
                + {tpl.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
