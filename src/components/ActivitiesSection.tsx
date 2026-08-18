import React from 'react';
import { CheckSquare, AlertTriangle, ShieldCheck, Sparkles, PlusCircle } from 'lucide-react';
import { QUICK_ACTIVITIES_TEMPLATES, QUICK_DDS_TEMPLATES } from '../data/constants';
import { RDOData } from '../types';

interface ActivitiesSectionProps {
  rdo: RDOData;
  onChange: (field: keyof RDOData, value: any) => void;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  rdo,
  onChange
}) => {
  const insertActivityTemplate = (template: string) => {
    const current = rdo.atividades ? rdo.atividades.trim() : '';
    if (!current) {
      onChange('atividades', `• ${template}`);
    } else {
      onChange('atividades', `${current}\n• ${template}`);
    }
  };

  const insertObservationTemplate = (obs: string) => {
    const current = rdo.observacoes ? rdo.observacoes.trim() : '';
    if (!current) {
      onChange('observacoes', `• ${obs}`);
    } else {
      onChange('observacoes', `${current}\n• ${obs}`);
    }
  };

  const insertDDSTemplate = (ddsText: string) => {
    onChange('dds', ddsText);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Grid com 2 colunas para Atividades e Observações / Impeditivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 1. RESUMO DAS ATIVIDADES REALIZADAS */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Resumo das Atividades Realizadas
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Produção do Dia
              </span>
            </div>

            <div className="pt-2">
              <textarea 
                rows={6}
                value={rdo.atividades}
                onChange={(e) => onChange('atividades', e.target.value)}
                placeholder="Descreva detalhadamente as etapas executadas, estacas, serviços de escavação, aterro, drenagem, contenção, etc..."
                className="w-full text-xs border border-slate-300 rounded-lg p-3 font-medium leading-relaxed focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>
          </div>

          {/* Quick templates pill tags */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Inserir Atividade Típica no Relatório:
            </div>
            <div className="flex flex-wrap gap-1">
              {QUICK_ACTIVITIES_TEMPLATES.slice(0, 4).map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertActivityTemplate(tpl)}
                  className="bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-medium px-2 py-1 rounded border border-slate-200 transition text-left truncate max-w-full cursor-pointer"
                  title={tpl}
                >
                  + {tpl.slice(0, 38)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. OBSERVAÇÕES DA CONTRATANTE / IMPEDITIVOS */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Observações da Contratante / Impeditivos
              </h3>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Ocorrências & Fiscalização
              </span>
            </div>

            <div className="pt-2">
              <textarea 
                rows={6}
                value={rdo.observacoes}
                onChange={(e) => onChange('observacoes', e.target.value)}
                placeholder="Anote ocorrências, interferências de rede, vistorias da fiscalização, impeditivos climáticos ou liberações de frente..."
                className="w-full text-xs border border-slate-300 rounded-lg p-3 font-medium leading-relaxed focus:ring-1 focus:ring-[#0f4c81]"
              />
            </div>
          </div>

          {/* Quick Obs templates */}
          <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 space-y-1.5">
            <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <PlusCircle className="w-3 h-3 text-amber-600" /> Inserir Ocorrência Rápida:
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                "Frente de serviço liberada após inspeção topográfica.",
                "Paralisação temporária das atividades devido a chuva torrencial.",
                "Aguardando liberação de acesso pelo proprietário lindeiro.",
                "Vistoria conjunta realizada com a fiscalização da ECORIOMINAS."
              ].map((obs, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertObservationTemplate(obs)}
                  className="bg-white hover:bg-amber-100 text-slate-700 text-[10px] font-medium px-2 py-1 rounded border border-amber-200 transition text-left truncate max-w-full cursor-pointer"
                >
                  + {obs.slice(0, 36)}...
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 3. SEGURANÇA DO TRABALHO & TEMA DO DDS (SEÇÃO SEPARADA) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Segurança & DDS (Diálogo Diário de Segurança)
          </h3>
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            SMS / Segurança do Trabalho
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Tema / Assunto Abordado no DDS Diário:
            </label>
            <input 
              type="text"
              value={rdo.dds || ''}
              onChange={(e) => onChange('dds', e.target.value)}
              placeholder="Ex: Uso obrigatório de EPIs, Cuidados com raio de giro de escavadeiras e caminhões, Atenção a taludes..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>

          <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 space-y-1.5">
            <div className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Sugestões Rápidas de DDS:
            </div>
            <div className="flex flex-wrap gap-1">
              {QUICK_DDS_TEMPLATES.slice(0, 3).map((ddsTpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertDDSTemplate(ddsTpl)}
                  className="bg-white hover:bg-blue-100 text-slate-700 text-[9.5px] font-medium px-2 py-0.5 rounded border border-blue-200 transition text-left truncate max-w-full cursor-pointer"
                  title={ddsTpl}
                >
                  + {ddsTpl.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

