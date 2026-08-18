import React, { useRef, useState, useEffect } from 'react';
import { PenTool, CheckCircle2, RotateCcw, ShieldCheck, UserCheck } from 'lucide-react';
import { RDOData } from '../types';

interface SignaturesSectionProps {
  rdo: RDOData;
  onSignaturesChange: (field: keyof RDOData['signatures'], value: string) => void;
  onShowToast: (msg: string) => void;
}

export const SignaturesSection: React.FC<SignaturesSectionProps> = ({
  rdo,
  onSignaturesChange,
  onShowToast
}) => {
  const canvasContratadaRef = useRef<HTMLCanvasElement>(null);
  const canvasContratanteRef = useRef<HTMLCanvasElement>(null);

  const [isDrawingContratada, setIsDrawingContratada] = useState(false);
  const [isDrawingContratante, setIsDrawingContratante] = useState(false);

  // Initialize canvas drawing listeners
  const setupCanvas = (
    canvas: HTMLCanvasElement | null, 
    setIsDrawing: (val: boolean) => void,
    onSave: (dataUrl: string) => void
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f4c81';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const startDraw = (e: any) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: any) => {
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDraw = () => {
      setIsDrawing(false);
      onSave(canvas.toDataURL());
    };

    canvas.onmousedown = startDraw;
    canvas.onmousemove = (e) => { if (e.buttons === 1) draw(e); };
    canvas.onmouseup = stopDraw;

    canvas.ontouchstart = startDraw;
    canvas.ontouchmove = draw;
    canvas.ontouchend = stopDraw;
  };

  useEffect(() => {
    setupCanvas(
      canvasContratadaRef.current, 
      setIsDrawingContratada, 
      (dataUrl) => {
        onSignaturesChange('contratadaSignData', dataUrl);
        onSignaturesChange('dateContratada', new Date().toLocaleDateString('pt-BR'));
      }
    );

    setupCanvas(
      canvasContratanteRef.current, 
      setIsDrawingContratante, 
      (dataUrl) => {
        onSignaturesChange('contratanteSignData', dataUrl);
        onSignaturesChange('dateContratante', new Date().toLocaleDateString('pt-BR'));
      }
    );
  }, []);

  const clearCanvas = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>, 
    type: 'contratadaSignData' | 'contratanteSignData'
  ) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    onSignaturesChange(type, '');
    onShowToast('Assinatura limpa.');
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#0f4c81] p-1.5 rounded-lg text-white">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
              Assinaturas Digitais & Visto de Campo
            </h3>
            <p className="text-[11px] text-slate-500">
              Assinatura na tela do celular ou computador para validação do diário de obra
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CONTRATADA (SEEL) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-xs text-[#0f4c81] uppercase flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> CONTRATADA (SEEL ENGENHARIA)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {rdo.signatures.dateContratada ? `Visto: ${rdo.signatures.dateContratada}` : 'Pendente de visto'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nome do Responsável Técnico / Engenheiro:
            </label>
            <input 
              type="text" 
              value={rdo.signatures.contratada} 
              onChange={(e) => onSignaturesChange('contratada', e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Assinatura na tela (Desenhe com o dedo ou mouse):
              </label>
              <button
                type="button"
                onClick={() => clearCanvas(canvasContratadaRef, 'contratadaSignData')}
                className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Limpar
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden relative">
              <canvas 
                ref={canvasContratadaRef} 
                width={360} 
                height={120} 
                className="w-full h-[120px] touch-none cursor-crosshair"
              />
              {!rdo.signatures.contratadaSignData && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs italic">
                  Toque e deslize aqui para assinar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTRATANTE (ECORIOMINAS) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-xs text-amber-900 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> CONTRATANTE / FISCALIZAÇÃO (ECO)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {rdo.signatures.dateContratante ? `Visto: ${rdo.signatures.dateContratante}` : 'Pendente de visto'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nome do Fiscal da Obra / Contratante:
            </label>
            <input 
              type="text" 
              value={rdo.signatures.contratante} 
              onChange={(e) => onSignaturesChange('contratante', e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white font-medium focus:ring-1 focus:ring-[#0f4c81]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Assinatura na tela (Desenhe com o dedo ou mouse):
              </label>
              <button
                type="button"
                onClick={() => clearCanvas(canvasContratanteRef, 'contratanteSignData')}
                className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Limpar
              </button>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-white overflow-hidden relative">
              <canvas 
                ref={canvasContratanteRef} 
                width={360} 
                height={120} 
                className="w-full h-[120px] touch-none cursor-crosshair"
              />
              {!rdo.signatures.contratanteSignData && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs italic">
                  Toque e deslize aqui para assinar
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
