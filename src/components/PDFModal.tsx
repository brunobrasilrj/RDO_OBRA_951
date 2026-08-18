import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  Moon, 
  CloudMoon,
  Loader2,
  Check
} from 'lucide-react';
import { RDOData } from '../types';
import { EQUIPMENT_GROUPS } from '../data/constants';
import { exportService } from '../services/exportService';
import { SeelLogo } from './SeelLogo';

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  rdo: RDOData;
  logoUrl: string;
  onShowToast: (msg: string) => void;
}

export const PDFModal: React.FC<PDFModalProps> = ({
  isOpen,
  onClose,
  rdo,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [isDownloading, setIsDownloading] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return d && m && y ? `${d}/${m}/${y}` : dateStr;
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    onShowToast('Processando e gerando arquivo PDF...');
    const dateStr = rdo.data || 'SemData';
    const fileName = `RDO_SEEL_ECORIOMINAS_${dateStr}.pdf`;
    
    try {
      const success = await exportService.downloadPDFElement('pdf-print-area', fileName);
      if (success) {
        onShowToast('PDF baixado com sucesso!');
      } else {
        onShowToast('Janela de impressão/PDF aberta.');
      }
    } catch (err) {
      console.error('Erro ao baixar PDF:', err);
      onShowToast('Erro ao gerar PDF. Abrindo diálogo de impressão...');
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to count equipment allocated by group
  const getEquipCountByGroup = (groupId: string) => {
    return rdo.equipments.filter(e => e.groupId === groupId).length;
  };

  // Helper to get allocated TAGs belonging to a specific family
  const getEquipTagsByGroup = (groupId: string) => {
    return rdo.equipments.filter(e => e.groupId === groupId).map(e => e.prefix);
  };

  // Calculate dynamic column count based on max tags in any family (minimum 6 columns, expands if needed)
  const maxTagsInAnyFamily = useMemo(() => {
    let max = 0;
    EQUIPMENT_GROUPS.forEach(g => {
      const count = rdo.equipments.filter(e => e.groupId === g.id).length;
      if (count > max) max = count;
    });
    return Math.max(max, 6); // At least 6 columns, or more if a family has > 6 tags
  }, [rdo.equipments]);

  // Climate match helpers
  const isSun = (val?: string) => val === 'BOM' || val === 'SOL';
  const isCloudSun = (val?: string) => val === 'NUBLADO' || val === 'SOL COM NUVENS' || val === 'INSTÁVEL';
  const isRain = (val?: string) => val === 'CHUVA' || val === 'CHUVA FRACA';
  const isHeavyRain = (val?: string) => val === 'IMPRACTICÁVEL' || val === 'CHUVA FORTE';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col my-auto border border-slate-300 print:border-none print:shadow-none print:max-h-none print:w-full">
        
        {/* Modal Topbar (hidden during print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex justify-between items-center rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 p-1.5 rounded-lg text-slate-950">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                Visualização & Emissão do PDF Oficial
              </h3>
              <p className="text-[11px] text-slate-300">
                Formulário Padrão Oficial • Contrato Terraplanagem IDCT9603
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-modal-download-pdf"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer ${
                isDownloading 
                  ? 'bg-emerald-800 text-emerald-100 cursor-wait opacity-90' 
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Baixando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              title="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Area */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-slate-200/60 print:p-0 print:bg-white" id="pdf-modal-content">
          
          <div 
            id="pdf-print-area" 
            style={{ width: '100%', maxWidth: '780px', margin: '0 auto', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}
            className="border-2 border-black p-2.5 sm:p-3 bg-white text-black shadow-md mx-auto text-[10px] leading-tight print:shadow-none print:border-2 print:p-2"
          >
            
            {/* 1. TOP HEADER TABLE */}
            <table className="w-full border-collapse border border-black text-center mb-[-1px]">
              <tbody>
                <tr>
                  {/* Left: ECORIOMINAS Logo */}
                  <td className="border border-black p-1.5 w-[28%] align-middle bg-white">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Crisp SVG Logo for ECORIOMINAS */}
                      <svg viewBox="0 0 160 45" className="h-9 w-auto max-w-[140px]">
                        <g>
                          {/* Green Eco leaves curve */}
                          <path d="M12,24 C10,12 22,6 30,10 C32,18 24,26 12,24 Z" fill="#2e7d32" />
                          <path d="M22,26 C26,16 38,14 42,20 C40,28 30,32 22,26 Z" fill="#00838f" />
                          {/* Text ecoriOMINAS */}
                          <text x="48" y="22" fontFamily="Arial, Helvetica, sans-serif" fontSize="16" fontWeight="bold" fill="#263238">
                            ecori<tspan fontWeight="900" fill="#1b5e20">OMINAS</tspan>
                          </text>
                          <text x="50" y="32" fontFamily="Arial, Helvetica, sans-serif" fontSize="8" fontWeight="bold" fill="#00838f" letterSpacing="1">
                            ecorodovias
                          </text>
                        </g>
                      </svg>
                    </div>
                  </td>

                  {/* Center: Title */}
                  <td className="border border-black p-1.5 w-[44%] font-black uppercase text-[11px] leading-tight bg-white align-middle">
                    DIÁRIO DE OBRA - CONTRATO TERRAPLANAGEM IDCT9603
                  </td>

                  {/* Right: SEEL Logo Box */}
                  <td className="border border-black p-1 w-[28%] align-middle bg-white">
                    <div className="flex items-center justify-center">
                      <SeelLogo className="h-9 w-auto max-w-[130px]" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 2. SUBHEADER: TRECHO / DATA / PÁGINA */}
            <table className="w-full border-collapse border border-black mb-[-1px] text-[9.5px]">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 w-[58%] font-semibold">
                    <span className="font-bold">TRECHO / KM / ESTACA:</span> {rdo.trecho || ''}
                  </td>
                  <td className="border border-black px-2 py-1 w-[24%] text-left font-semibold">
                    <span className="font-bold">DATA:</span> {formatDate(rdo.data)}
                  </td>
                  <td className="border border-black px-2 py-1 w-[18%] text-left font-semibold">
                    <span className="font-bold">PÁGINA:</span> {rdo.pagina || '01 / 01'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 3. SUBHEADER: CONTRATADA / OBRA / EQUIPE */}
            <table className="w-full border-collapse border border-black mb-[-1px] text-[9.5px]">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 w-[44%] font-semibold">
                    <span className="font-bold">CONTRATADA:</span> {rdo.contratada || 'SEEL - SERVIÇOS ESPECIAIS DE ENGENHARIA'}
                  </td>
                  <td className="border border-black px-2 py-1 w-[28%] font-semibold">
                    <span className="font-bold">OBRA:</span> {rdo.obra || 'ECORIOMINAS'}
                  </td>
                  <td className="border border-black px-2 py-1 w-[28%] font-semibold">
                    <span className="font-bold">EQUIPE / FRENTE:</span> {rdo.equipe || 'Equipe Principal'}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 4. JORNADA DE TRABALHO, CLIMA, SOLO & PLUVIÔMETRO */}
            <table className="w-full border-collapse border border-black text-center text-[9px] mb-[-1px]">
              <thead>
                <tr>
                  <th colSpan={8} className="border border-black py-0.5 font-bold uppercase text-[9.5px] bg-slate-100">
                    JORNADA DE TRABALHO
                  </th>
                </tr>
                <tr className="font-bold">
                  <th colSpan={2} className="border border-black py-0.5 w-[20%]">MANHÃ</th>
                  <th colSpan={2} className="border border-black py-0.5 w-[20%]">TARDE</th>
                  <th colSpan={2} className="border border-black py-0.5 w-[20%]">NOITE</th>
                  <th className="border border-black py-0.5 w-[15%]">TOTAL</th>
                  <th className="border border-black py-0.5 w-[25%]">PLUVIÔMETRO</th>
                </tr>
                <tr className="text-[8px] font-semibold">
                  <td className="border border-black py-0.5 w-[10%]">ENTRADA</td>
                  <td className="border border-black py-0.5 w-[10%]">SAÍDA</td>
                  <td className="border border-black py-0.5 w-[10%]">ENTRADA</td>
                  <td className="border border-black py-0.5 w-[10%]">SAÍDA</td>
                  <td className="border border-black py-0.5 w-[10%]">ENTRADA</td>
                  <td className="border border-black py-0.5 w-[10%]">SAÍDA</td>
                  <td className="border border-black py-0.5">h</td>
                  <td className="border border-black py-0.5">mm/m²</td>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold h-6">
                  <td className="border border-black py-0.5">{rdo.jornada?.e1 || ''}</td>
                  <td className="border border-black py-0.5">{rdo.jornada?.s1 || ''}</td>
                  <td className="border border-black py-0.5">{rdo.jornada?.e2 || ''}</td>
                  <td className="border border-black py-0.5">{rdo.jornada?.s2 || ''}</td>
                  <td className="border border-black py-0.5">{rdo.jornada?.e3 || ''}</td>
                  <td className="border border-black py-0.5">{rdo.jornada?.s3 || ''}</td>
                  <td className="border border-black py-0.5">{rdo.jornada?.totalHoras || '8.0'}</td>
                  <td className="border border-black py-0.5">{rdo.pluviometro?.mm || '0'}</td>
                </tr>

                {/* Weather Symbols Row & Soil Condition */}
                <tr>
                  {/* Climate Manhã */}
                  <td colSpan={2} className="border border-black p-1">
                    <div className="flex items-center justify-around">
                      <span title="Sol" className={`p-0.5 rounded ${isSun(rdo.clima?.manha) ? 'font-black ring-1 ring-black bg-amber-200' : 'opacity-40'}`}>
                        <Sun className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Sol com Nuvens" className={`p-0.5 rounded ${isCloudSun(rdo.clima?.manha) ? 'font-black ring-1 ring-black bg-slate-200' : 'opacity-40'}`}>
                        <CloudSun className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Chuva Fraca" className={`p-0.5 rounded ${isRain(rdo.clima?.manha) ? 'font-black ring-1 ring-black bg-blue-200' : 'opacity-40'}`}>
                        <CloudRain className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Chuva Forte" className={`p-0.5 rounded ${isHeavyRain(rdo.clima?.manha) ? 'font-black ring-1 ring-black bg-blue-400 text-white' : 'opacity-40'}`}>
                        <CloudLightning className="w-3.5 h-3.5 inline" />
                      </span>
                    </div>
                  </td>

                  {/* Climate Tarde */}
                  <td colSpan={2} className="border border-black p-1">
                    <div className="flex items-center justify-around">
                      <span title="Sol" className={`p-0.5 rounded ${isSun(rdo.clima?.tarde) ? 'font-black ring-1 ring-black bg-amber-200' : 'opacity-40'}`}>
                        <Sun className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Sol com Nuvens" className={`p-0.5 rounded ${isCloudSun(rdo.clima?.tarde) ? 'font-black ring-1 ring-black bg-slate-200' : 'opacity-40'}`}>
                        <CloudSun className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Chuva Fraca" className={`p-0.5 rounded ${isRain(rdo.clima?.tarde) ? 'font-black ring-1 ring-black bg-blue-200' : 'opacity-40'}`}>
                        <CloudRain className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Chuva Forte" className={`p-0.5 rounded ${isHeavyRain(rdo.clima?.tarde) ? 'font-black ring-1 ring-black bg-blue-400 text-white' : 'opacity-40'}`}>
                        <CloudLightning className="w-3.5 h-3.5 inline" />
                      </span>
                    </div>
                  </td>

                  {/* Climate Noite */}
                  <td colSpan={2} className="border border-black p-1">
                    <div className="flex items-center justify-around">
                      <span title="Limpo" className={`p-0.5 rounded ${rdo.clima?.noite === 'BOM' ? 'font-black ring-1 ring-black bg-slate-200' : 'opacity-40'}`}>
                        <Moon className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Nublado" className={`p-0.5 rounded ${rdo.clima?.noite === 'NUBLADO' ? 'font-black ring-1 ring-black bg-slate-200' : 'opacity-40'}`}>
                        <CloudMoon className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Chuva" className={`p-0.5 rounded ${rdo.clima?.noite === 'CHUVA' ? 'font-black ring-1 ring-black bg-blue-200' : 'opacity-40'}`}>
                        <CloudRain className="w-3.5 h-3.5 inline" />
                      </span>
                      <span title="Sem Trabalho" className={`p-0.5 rounded text-[7.5px] font-bold ${rdo.clima?.noite === 'SEM TRABALHO' ? 'font-black ring-1 ring-black bg-slate-100' : 'opacity-40'}`}>
                        S/T
                      </span>
                    </div>
                  </td>

                  {/* Soil Condition */}
                  <td colSpan={2} className="border border-black p-1 text-left text-[8px] leading-tight">
                    <div className="font-bold mb-0.5">CONDIÇÃO DO SOLO:</div>
                    <div className={rdo.solo === 'SATURADO' ? 'font-bold' : ''}>
                      ( {rdo.solo === 'SATURADO' ? 'X' : ' '} ) SATURADO:
                    </div>
                    <div className={rdo.solo === 'EM CONDIÇÕES DE TRABALHO' ? 'font-bold' : ''}>
                      ( {rdo.solo === 'EM CONDIÇÕES DE TRABALHO' ? 'X' : ' '} ) EM CONDIÇÕES DE TRABALHO
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 5. EFETIVO & ADMINISTRATIVO */}
            <table className="w-full border-collapse border border-black mb-[-1px] text-[8.5px]">
              <thead>
                <tr>
                  <th colSpan={3} className="border border-black p-0.5 text-left font-bold w-[65%] pl-2 bg-slate-100">
                    EFETIVO:
                  </th>
                  <th className="border border-black p-0.5 text-left font-bold w-[35%] pl-2 bg-slate-100">
                    ADMINISTRATIVO:
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Column 1 (Campo 1) */}
                  <td className="border-r border-black p-1.5 align-top w-[22%] leading-tight">
                    <div>( {rdo.roles?.['Armador'] ? rdo.roles['Armador'] : '  '} ) Armador</div>
                    <div>( {rdo.roles?.['Carpinteiro'] ? rdo.roles['Carpinteiro'] : '  '} ) Carpinteiro</div>
                    <div>( {rdo.roles?.['Encarregado'] ? rdo.roles['Encarregado'] : '  '} ) Encarregado</div>
                    <div>( {rdo.roles?.['Greidista'] ? rdo.roles['Greidista'] : '  '} ) Greidista</div>
                    <div>( {rdo.roles?.['Pedreiro'] ? rdo.roles['Pedreiro'] : '  '} ) Pedreiro</div>
                    <div>( {rdo.roles?.['Serventes/Ajudantes'] ? rdo.roles['Serventes/Ajudantes'] : '  '} ) Serventes/Ajudantes</div>
                  </td>

                  {/* Column 2 (Campo 2) */}
                  <td className="border-r border-black p-1.5 align-top w-[22%] leading-tight">
                    <div>( {rdo.roles?.['Alpinistas'] ? rdo.roles['Alpinistas'] : '  '} ) Alpinistas</div>
                    <div>( {rdo.roles?.['Servente/Corda'] ? rdo.roles['Servente/Corda'] : '  '} ) Servente/Corda</div>
                    <div>( {rdo.roles?.['Profissionais/Cordas'] ? rdo.roles['Profissionais/Cordas'] : '  '} ) Profissionais/Cordas</div>
                    <div>( {rdo.roles?.['Apontador'] ? rdo.roles['Apontador'] : '  '} ) Apontador</div>
                    <div>( {rdo.roles?.['Motoristas'] ? rdo.roles['Motoristas'] : '  '} ) Motoristas</div>
                    <div>( {rdo.roles?.['Op. Máquinas Pesadas'] ? rdo.roles['Op. Máquinas Pesadas'] : '  '} ) Op. Máquinas Pesadas</div>
                  </td>

                  {/* Column 3 (Blank spaces) */}
                  <td className="border-r border-black p-1.5 align-top w-[21%] leading-tight text-slate-400">
                    <div>(   ) </div>
                    <div>(   ) </div>
                    <div>(   ) </div>
                    <div>(   ) </div>
                    <div>(   ) </div>
                    <div>(   ) </div>
                  </td>

                  {/* Column 4 (ADMINISTRATIVO) */}
                  <td className="p-1.5 align-top w-[35%] leading-tight">
                    <div>( {rdo.roles?.['Coord. de Engenharia'] ? rdo.roles['Coord. de Engenharia'] : '  '} ) Coord. de Engenharia</div>
                    <div>( {rdo.roles?.['Engenheiro'] ? rdo.roles['Engenheiro'] : '  '} ) Engenheiro</div>
                    <div>( {rdo.roles?.['Analista de Engenharia'] ? rdo.roles['Analista de Engenharia'] : '  '} ) Analista de Engenharia</div>
                    <div>( {rdo.roles?.['Ass. Administrativo'] ? rdo.roles['Ass. Administrativo'] : '  '} ) Ass. Administrativo</div>
                    <div>( {rdo.roles?.['Tec. Segurança'] ? rdo.roles['Tec. Segurança'] : '  '} ) Tec. Segurança</div>
                    <div>Outros: {rdo.roles?.['Outros'] ? `(${rdo.roles['Outros']})` : ''}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 6. EQUIPAMENTOS & PLACAS / PREFIXOS DOS EQUIPAMENTOS */}
            <table className="w-full border-collapse border border-black mb-[-1px] text-[8.5px]">
              <thead>
                <tr>
                  <th className="border border-black p-0.5 text-left font-bold w-[30%] pl-2 bg-slate-100">
                    EQUIPAMENTOS:
                  </th>
                  <th colSpan={maxTagsInAnyFamily} className="border border-black p-0.5 text-left font-bold w-[70%] pl-2 bg-slate-100">
                    Placas / Prefixos dos Equipamentos ({maxTagsInAnyFamily} Colunas):
                  </th>
                </tr>
              </thead>
              <tbody>
                {EQUIPMENT_GROUPS.map((group) => {
                  const count = getEquipCountByGroup(group.id);
                  const familyTags = getEquipTagsByGroup(group.id);
                  return (
                    <tr key={group.id} className="border-b border-black/40 last:border-b-0 h-[17px]">
                      {/* Family Name & Count in this row */}
                      <td className="border-r border-black px-1.5 py-0.5 align-middle leading-tight font-medium w-[30%]">
                        ( {count > 0 ? <span className="font-black text-black">{count}</span> : '  '} ) {group.name}
                      </td>

                      {/* Dynamic tag columns matching this exact family row */}
                      {Array.from({ length: maxTagsInAnyFamily }, (_, colIdx) => {
                        const tag = familyTags[colIdx] || '';
                        return (
                          <td 
                            key={colIdx} 
                            style={{ width: `${70 / maxTagsInAnyFamily}%` }}
                            className="border-r border-black/30 last:border-r-0 px-1 py-0.5 text-center font-mono font-bold text-[8px] align-middle"
                          >
                            {tag ? (
                              <span className="text-black font-black">{tag}</span>
                            ) : (
                              <span className="text-transparent">.</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 7. RESUMO DAS ATIVIDADES REALIZADAS */}
            <table className="w-full border-collapse border border-black mb-[-1px] text-[8.5px]">
              <thead>
                <tr>
                  <th className="border border-black p-0.5 text-left font-bold uppercase text-[9px] pl-2 bg-slate-100">
                    RESUMO DAS ATIVIDADES REALIZADAS (PRODUÇÃO DO DIA):
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 align-top min-h-[75px] leading-relaxed">
                    <div className="whitespace-pre-wrap min-h-[55px] font-sans text-[8.5px]">
                      {rdo.atividades || ''}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 8. OBSERVAÇÕES DA CONTRATANTE / IMPEDITIVOS */}
            <table className="w-full border-collapse border border-black mb-[-1px] text-[8.5px]">
              <thead>
                <tr>
                  <th className="border border-black p-0.5 text-left font-bold uppercase text-[9px] pl-2 bg-slate-100">
                    OBSERVAÇÕES DA CONTRATANTE / IMPEDITIVOS:
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 align-top min-h-[45px] leading-relaxed">
                    <div className="whitespace-pre-wrap min-h-[30px] font-sans text-[8.5px]">
                      {rdo.observacoes || ''}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 9. SEGURANÇA DO TRABALHO, MEIO AMBIENTE & TEMA DO DDS */}
            <table className="w-full border-collapse border border-black mb-[-1px] text-[8.5px]">
              <thead>
                <tr>
                  <th className="border border-black p-0.5 text-left font-bold uppercase text-[9px] pl-2 bg-slate-100">
                    SEGURANÇA & DDS (DIÁLOGO DIÁRIO DE SEGURANÇA):
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 align-top min-h-[35px] leading-relaxed">
                    <div className="font-bold text-[8.5px]">
                      Tema / Assunto do DDS: <span className="font-normal">{rdo.dds || 'Realizado DDS diário de conscientização e verificação de EPIs.'}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 10. ASSINATURAS: CONTRATANTE & CONTRATADA */}
            <table className="w-full border-collapse border border-black text-[8.5px]">
              <thead>
                <tr className="text-center font-bold uppercase text-[9px] bg-slate-100">
                  <th className="border border-black p-0.5 w-1/2">CONTRATANTE</th>
                  <th className="border border-black p-0.5 w-1/2">CONTRATADA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-16">
                  {/* Contratante */}
                  <td className="border-r border-black p-1 align-top w-1/2">
                    <div className="flex justify-between items-center text-[8px] font-bold">
                      <span>DATA: {rdo.signatures?.dateContratante || ''}</span>
                      <span>VISTO:</span>
                    </div>
                    {rdo.signatures?.contratanteSignData ? (
                      <img 
                        src={rdo.signatures.contratanteSignData} 
                        alt="Visto Contratante" 
                        className="max-h-8 mx-auto mt-1"
                      />
                    ) : (
                      <div className="h-8"></div>
                    )}
                    <div className="text-[7.5px] text-center text-slate-600 truncate mt-1">
                      {rdo.signatures?.contratante || ''}
                    </div>
                  </td>

                  {/* Contratada */}
                  <td className="p-1 align-top w-1/2">
                    <div className="flex justify-between items-center text-[8px] font-bold">
                      <span>DATA: {rdo.signatures?.dateContratada || ''}</span>
                      <span>VISTO:</span>
                    </div>
                    {rdo.signatures?.contratadaSignData ? (
                      <img 
                        src={rdo.signatures.contratadaSignData} 
                        alt="Visto Contratada" 
                        className="max-h-8 mx-auto mt-1"
                      />
                    ) : (
                      <div className="h-8"></div>
                    )}
                    <div className="text-[7.5px] text-center text-slate-600 truncate mt-1">
                      {rdo.signatures?.contratada || ''}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 rounded-b-2xl print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
          >
            Fechar Visualização
          </button>
        </div>

      </div>
    </div>
  );
};
