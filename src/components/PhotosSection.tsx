import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, Plus, MapPin, Tag } from 'lucide-react';
import { FieldPhoto } from '../types';

interface PhotosSectionProps {
  photos: FieldPhoto[];
  trechoDefault: string;
  onAddPhoto: (photo: FieldPhoto) => void;
  onUpdatePhoto: (id: string, updates: Partial<FieldPhoto>) => void;
  onRemovePhoto: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const PhotosSection: React.FC<PhotosSectionProps> = ({
  photos,
  trechoDefault,
  onAddPhoto,
  onUpdatePhoto,
  onRemovePhoto,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          const newPhoto: FieldPhoto = {
            id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            url: base64Url,
            caption: 'Registro fotográfico das atividades na frente de serviço',
            location: trechoDefault || 'KM 42',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          onAddPhoto(newPhoto);
        }
      };
      reader.readAsDataURL(file);
    });

    onShowToast(`${files.length} foto(s) adicionada(s) com sucesso!`);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#0f4c81] p-1.5 rounded-lg text-white">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
              Registro Fotográfico de Campo
            </h3>
            <p className="text-[11px] text-slate-500">
              Anexe fotos das frentes de serviço, escavações, aterros e equipamentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            capture="environment" // triggers back camera on mobile!
            multiple
            className="hidden" 
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tirar Foto / Anexar</span>
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#0f4c81] rounded-xl p-8 text-center cursor-pointer transition bg-slate-50/60 flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0f4c81] flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="font-bold text-sm text-slate-700">
            Nenhuma foto anexada a este RDO
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Clique aqui ou use o botão acima para capturar fotos com a câmera do celular ou escolher imagens da galeria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={photo.id}
              className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between group"
            >
              {/* Photo Preview Container */}
              <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center">
                <img 
                  src={photo.url} 
                  alt={photo.caption} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                
                <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Foto #{index + 1} • {photo.timestamp}
                </span>

                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition active:scale-90"
                  title="Excluir foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Photo metadata inputs */}
              <div className="p-3 space-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3 h-3 text-amber-600" /> Local / Estaca
                  </label>
                  <input 
                    type="text" 
                    value={photo.location || ''} 
                    onChange={(e) => onUpdatePhoto(photo.id, { location: e.target.value })}
                    placeholder="Ex: KM 42 / Estaca 120"
                    className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-0.5">
                    <Tag className="w-3 h-3 text-[#0f4c81]" /> Legenda da Foto
                  </label>
                  <textarea 
                    rows={2}
                    value={photo.caption} 
                    onChange={(e) => onUpdatePhoto(photo.id, { caption: e.target.value })}
                    placeholder="Descreva a atividade ou o elemento fotografado..."
                    className="w-full border border-slate-300 rounded p-1.5 text-xs bg-white leading-tight font-medium"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
