import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  FolderPlus, 
  Layers,
  CheckCheck,
  Tag,
  LayoutGrid,
  Zap,
  Disc,
  Hammer,
  Droplet,
  Fuel,
  Bus,
  Boxes,
  Tractor,
  Wrench,
  Sparkles
} from 'lucide-react';
import { EQUIPMENT_GROUPS } from '../data/constants';
import { EquipmentItem, EquipmentStatus, RDOData } from '../types';

interface EquipmentSectionProps {
  rdo: RDOData;
  onAddEquipment: (groupId: string, prefix?: string, desc?: string, status?: EquipmentStatus) => void;
  onUpdateEquipment: (id: string, updates: Partial<EquipmentItem>) => void;
  onRemoveEquipment: (id: string) => void;
  onClearAllEquipments?: () => void;
  onShowToast: (msg: string) => void;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  rdo,
  onAddEquipment,
  onUpdateEquipment,
  onRemoveEquipment,
  onClearAllEquipments,
  onShowToast
}) => {
  // 'all' means view all families at once, or specific family ID
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customModalFamilyId, setCustomModalFamilyId] = useState<string>(EQUIPMENT_GROUPS[0].id);

  // Active family when not 'all'
  const activeFamily = EQUIPMENT_GROUPS.find(g => g.id === selectedFamilyId) || EQUIPMENT_GROUPS[0];

  // Helper icon mapper for families
  const getFamilyIcon = (groupId: string) => {
    switch (groupId) {
      case 'escavadeiras': return <Wrench className="w-4 h-4" />;
      case 'retroescavadeiras': return <Tractor className="w-4 h-4" />;
      case 'rolo': return <Disc className="w-4 h-4" />;
      case 'pacarregadeira': return <Truck className="w-4 h-4" />;
      case 'compactador_manual': return <Hammer className="w-4 h-4" />;
      case 'caminhoes_basculantes': return <Truck className="w-4 h-4" />;
      case 'caminhao_pipa': return <Droplet className="w-4 h-4" />;
      case 'caminhao_prancha': return <Truck className="w-4 h-4" />;
      case 'caminhao_munck': return <Wrench className="w-4 h-4" />;
      case 'comboio': return <Fuel className="w-4 h-4" />;
      case 'onibus': return <Bus className="w-4 h-4" />;
      case 'gerador': return <Zap className="w-4 h-4" />;
      case 'betoneira': return <Boxes className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  // Search filter
  const searchLower = searchTerm.toLowerCase().trim();
  const isSearching = searchLower.length > 0;

  // Check if a specific prefix is already added in the RDO
  const isTagAdded = (prefix: string) => {
    return rdo.equipments.some(e => e.prefix.toUpperCase() === prefix.toUpperCase());
  };

  // Count by Family for allocated equipments
  const familyCounts = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    EQUIPMENT_GROUPS.forEach(g => {
      counts[g.id] = { name: g.name, count: 0 };
    });

    rdo.equipments.forEach(eq => {
      if (counts[eq.groupId]) {
        counts[eq.groupId].count += 1;
      } else {
        counts[eq.groupId] = { name: eq.groupName || 'Outros', count: (counts[eq.groupId]?.count || 0) + 1 };
      }
    });

    return Object.entries(counts).filter(([_, data]) => data.count > 0);
  }, [rdo.equipments]);

  // Add a specific preset (using ONLY the ID / TAG)
  const handleAddPreset = (groupId: string, prefix: string) => {
    if (isTagAdded(prefix)) {
      onShowToast(`O equipamento ${prefix} já está alocado neste RDO.`);
      return;
    }
    onAddEquipment(groupId, prefix, prefix, 'Operacional');
    onShowToast(`TAG ${prefix} adicionada!`);
  };

  // Add all from a specific family
  const handleAddAllFromFamily = (family: typeof EQUIPMENT_GROUPS[0]) => {
    let addedCount = 0;
    family.presets.forEach(p => {
      if (!isTagAdded(p.prefix)) {
        onAddEquipment(family.id, p.prefix, p.prefix, 'Operacional');
        addedCount++;
      }
    });

    if (addedCount > 0) {
      onShowToast(`${addedCount} equipamento(s) da família "${family.name}" adicionados!`);
    } else {
      onShowToast(`Todos os equipamentos da família "${family.name}" já estão no RDO.`);
    }
  };

  // Add custom equipment by TAG only
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTag.trim()) {
      onShowToast('Informe a ID / TAG do equipamento.');
      return;
    }
    const tagUpper = customTag.trim().toUpperCase();
    if (isTagAdded(tagUpper)) {
      onShowToast(`A TAG "${tagUpper}" já está cadastrada neste RDO.`);
      return;
    }

    const targetFamily = EQUIPMENT_GROUPS.find(g => g.id === customModalFamilyId) || EQUIPMENT_GROUPS[0];

    onAddEquipment(
      targetFamily.id,
      tagUpper,
      tagUpper,
      'Operacional'
    );
    setCustomTag('');
    setShowCustomModal(false);
    onShowToast(`TAG ${tagUpper} adicionada à família ${targetFamily.name}!`);
  };

  // Open custom tag modal with specific family
  const openCustomModal = (familyId?: string) => {
    if (familyId && familyId !== 'all') {
      setCustomModalFamilyId(familyId);
    } else if (selectedFamilyId !== 'all') {
      setCustomModalFamilyId(selectedFamilyId);
    } else {
      setCustomModalFamilyId(EQUIPMENT_GROUPS[0].id);
    }
    setShowCustomModal(true);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
      
      {/* 1. Header with Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#0f4c81] p-2 rounded-lg text-white shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight">
              Equipamentos & Frota no Canteiro
            </h3>
            <p className="text-xs text-slate-500">
              Todas as 13 Famílias de Equipamentos disponíveis para seleção rápida por ID / TAG
            </p>
          </div>
        </div>

        {/* Total & Family Count Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#0f4c81] text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs flex items-center gap-1.5">
            <span>Total Alocado no RDO:</span>
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-xs">
              {rdo.equipments.length}
            </span>
          </span>
        </div>
      </div>

      {/* 2. Contagem Detalhada por Família no RDO Atual */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
            <Tag className="w-3.5 h-3.5 text-[#0f4c81]" />
            Resumo de Alocação por Família ({familyCounts.length} de {EQUIPMENT_GROUPS.length} famílias em campo)
          </span>
          <span className="text-[11px] font-bold text-[#0f4c81]">
            Total: {rdo.equipments.length} equipamento(s)
          </span>
        </div>

        {familyCounts.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-1">
            Nenhum equipamento alocado ainda. Clique nas TAGs das famílias abaixo para inserir no RDO.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {familyCounts.map(([id, data]) => (
              <div 
                key={id}
                className="bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 shadow-2xs"
              >
                <span className="text-slate-700 font-semibold">{data.name}:</span>
                <span className="bg-blue-100 text-[#0f4c81] font-black px-1.5 py-0.2 rounded text-[11px]">
                  {data.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Painel Completo de Famílias de Equipamento (VISÍVEIS A TODOS) */}
      <div className="bg-slate-50/90 rounded-xl p-3.5 sm:p-4 border border-slate-200 space-y-4">
        
        {/* Title Bar & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0f4c81]" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-tight">
                Famílias de Equipamento ({EQUIPMENT_GROUPS.length} Disponíveis)
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visualize todas as famílias abaixo ou filtre por categoria
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por TAG ou Família (ex: ESC008, CBT)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#0f4c81]"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-[10px] bg-slate-200 hover:bg-slate-300 rounded-full w-4 h-4 flex items-center justify-center font-bold text-slate-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 13 FAMILIES GRID SELECTOR - ALL FAMILIES VISIBLE IN WRAPPED GRID (NO HIDDEN SCROLL) */}
        {!isSearching && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>Selecione a visualização:</span>
              <button
                type="button"
                onClick={() => openCustomModal()}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" /> + Cadastrar Nova TAG
              </button>
            </div>

            {/* Grid displaying all 13 families simultaneously */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
              
              {/* Option to show ALL families at once */}
              <button
                type="button"
                onClick={() => setSelectedFamilyId('all')}
                className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 text-left cursor-pointer border ${
                  selectedFamilyId === 'all'
                    ? 'bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs ring-2 ring-blue-300'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${selectedFamilyId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0f4c81]'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] truncate leading-tight">Todas as 13 Famílias</div>
                  <div className={`text-[10px] ${selectedFamilyId === 'all' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Visão Geral
                  </div>
                </div>
              </button>

              {/* 13 Specific Families */}
              {EQUIPMENT_GROUPS.map((family) => {
                const isSelected = selectedFamilyId === family.id;
                const countInRDO = rdo.equipments.filter(e => e.groupId === family.id).length;
                const totalPresets = family.presets.length;

                return (
                  <button
                    key={family.id}
                    type="button"
                    onClick={() => setSelectedFamilyId(family.id)}
                    className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 text-left cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0f4c81] text-white border-[#0f4c81] shadow-xs ring-2 ring-blue-300'
                        : countInRDO > 0
                        ? 'bg-blue-50/80 border-blue-200 text-slate-800 hover:bg-blue-100/60'
                        : 'bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : countInRDO > 0
                        ? 'bg-blue-100 text-[#0f4c81]'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {getFamilyIcon(family.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[11px] truncate leading-tight" title={family.name}>
                        {family.name}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : countInRDO > 0
                            ? 'bg-[#0f4c81] text-white font-bold'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {countInRDO > 0 ? `${countInRDO} alocado(s)` : `${totalPresets} TAGs`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. CATALOG DISPLAY - VIEW ALL FAMILIES OR ACTIVE FAMILY */}
        <div className="pt-2">
          
          {/* A. Searching across all items */}
          {isSearching && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Resultados da busca para "{searchTerm}":</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {EQUIPMENT_GROUPS.flatMap(g => 
                  g.presets
                    .filter(p => p.prefix.toLowerCase().includes(searchLower) || g.name.toLowerCase().includes(searchLower))
                    .map(p => {
                      const added = isTagAdded(p.prefix);
                      return (
                        <button
                          key={p.prefix}
                          type="button"
                          disabled={added}
                          onClick={() => handleAddPreset(g.id, p.prefix)}
                          className={`p-2.5 rounded-lg border transition text-center flex flex-col items-center justify-center gap-1 ${
                            added
                              ? 'bg-blue-50/80 border-blue-200 text-slate-500 cursor-not-allowed'
                              : 'bg-white border-slate-200 hover:border-[#0f4c81] hover:bg-blue-50/50 hover:shadow-xs cursor-pointer active:scale-95'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-slate-500 truncate w-full">{g.name}</span>
                          <span className="font-mono font-black text-xs text-[#0f4c81]">{p.prefix}</span>
                          {added ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Alocado
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                              <Plus className="w-2.5 h-2.5" /> Inserir
                            </span>
                          )}
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* B. View Mode: "Todas as 13 Famílias" (Categorized cards for all 13 groups) */}
          {!isSearching && selectedFamilyId === 'all' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50/70 p-2.5 rounded-lg border border-blue-200">
                <span className="text-xs font-bold text-[#0f4c81] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Exibindo Todas as 13 Famílias e suas TAGs disponíveis:
                </span>
                <span className="text-[11px] text-slate-600">
                  Clique na TAG para alocar no RDO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {EQUIPMENT_GROUPS.map((group) => {
                  const countInRDO = rdo.equipments.filter(e => e.groupId === group.id).length;
                  return (
                    <div 
                      key={group.id}
                      className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2.5 hover:border-slate-300 transition"
                    >
                      {/* Family Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#0f4c81]">{getFamilyIcon(group.id)}</span>
                          <span className="font-bold text-xs text-slate-800">{group.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            countInRDO > 0 ? 'bg-blue-100 text-[#0f4c81]' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {countInRDO > 0 ? `${countInRDO}/${group.presets.length} no RDO` : `${group.presets.length} TAGs`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddAllFromFamily(group)}
                            title="Adicionar todas as TAGs desta família"
                            className="text-[10px] text-[#0f4c81] hover:bg-blue-50 p-1 rounded font-bold transition cursor-pointer"
                          >
                            + Todas
                          </button>
                        </div>
                      </div>

                      {/* TAG Buttons */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {group.presets.map((preset) => {
                          const added = isTagAdded(preset.prefix);
                          return (
                            <button
                              key={preset.prefix}
                              type="button"
                              disabled={added}
                              onClick={() => handleAddPreset(group.id, preset.prefix)}
                              className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                                added
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 cursor-not-allowed'
                                  : 'bg-slate-50/80 border-slate-200 hover:bg-blue-50 hover:border-[#0f4c81] text-slate-800 cursor-pointer active:scale-95'
                              }`}
                            >
                              <span className="font-mono font-black text-[11px]">
                                {preset.prefix}
                              </span>
                              <span className="text-[8px] font-bold mt-0.5">
                                {added ? '✓ Alocado' : '+ Inserir'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. View Mode: Single Active Family */}
          {!isSearching && selectedFamilyId !== 'all' && (
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 text-[#0f4c81] p-1.5 rounded-lg">
                    {getFamilyIcon(activeFamily.id)}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-800">
                      Família: {activeFamily.name}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {activeFamily.presets.length} TAGs cadastradas • {rdo.equipments.filter(e => e.groupId === activeFamily.id).length} alocada(s) no RDO
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeFamily.presets.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAddAllFromFamily(activeFamily)}
                      className="text-[11px] font-bold text-[#0f4c81] hover:text-[#0a3459] bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Adicionar Todas as {activeFamily.presets.length} TAGs
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openCustomModal(activeFamily.id)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" /> + Nova TAG nesta Família
                  </button>
                </div>
              </div>

              {/* TAGs Grid for Active Family */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {activeFamily.presets.map((preset) => {
                  const added = isTagAdded(preset.prefix);
                  return (
                    <button
                      key={preset.prefix}
                      type="button"
                      disabled={added}
                      onClick={() => handleAddPreset(activeFamily.id, preset.prefix)}
                      className={`p-2.5 rounded-xl border transition text-center flex flex-col items-center justify-center gap-1 ${
                        added
                          ? 'bg-blue-50/70 border-blue-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 hover:border-[#0f4c81] hover:bg-blue-50/40 hover:shadow-xs cursor-pointer active:scale-95'
                      }`}
                    >
                      <span className="font-mono font-black text-xs text-[#0f4c81]">
                        {preset.prefix}
                      </span>

                      {added ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Alocado no RDO
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                          <Plus className="w-2.5 h-2.5" /> Alocar TAG
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 4. Modal / Form to Add Custom TAG */}
      {showCustomModal && (
        <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200 animate-in fade-in duration-150 space-y-2.5">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-emerald-700" />
              Cadastrar Nova TAG de Equipamento
            </span>
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              ✕ Cancelar
            </button>
          </div>

          <form onSubmit={handleAddCustom} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Selecione a Família:
                </label>
                <select
                  value={customModalFamilyId}
                  onChange={(e) => setCustomModalFamilyId(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  {EQUIPMENT_GROUPS.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Identificador / TAG do Equipamento:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: CBT099 ou RTT015"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#0f4c81]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shrink-0 transition cursor-pointer"
                  >
                    Salvar & Alocar
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 5. Lista de Equipamentos Alocados no RDO Atual */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
              TAGs Alocadas neste RDO ({rdo.equipments.length})
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {rdo.equipments.length > 0 && (
              <button
                id="btn-clear-all-equipments"
                type="button"
                onClick={() => {
                  if (onClearAllEquipments) {
                    onClearAllEquipments();
                  } else {
                    rdo.equipments.forEach(eq => onRemoveEquipment(eq.id));
                    onShowToast('Todos os equipamentos foram removidos.');
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 font-semibold cursor-pointer transition active:scale-95 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar Todos</span>
              </button>
            )}
          </div>
        </div>

        {rdo.equipments.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-1">
            <Truck className="w-8 h-8 mx-auto text-slate-400 mb-1" />
            <p className="text-xs font-bold text-slate-700">Nenhum equipamento alocado no momento</p>
            <p className="text-[11px] text-slate-500">
              Clique em qualquer TAG das famílias acima para alocar o equipamento no RDO.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Tabela Matriz Alocada por Família com Colunas Dinâmicas */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#0f4c81]" />
                  Matriz de TAGs Alocadas por Família (Colunas ajustadas automaticamente)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {familyCounts.length} famílias com TAGs ativas
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {EQUIPMENT_GROUPS.filter(g => rdo.equipments.some(e => e.groupId === g.id)).map(group => {
                  const itemsInFamily = rdo.equipments.filter(e => e.groupId === group.id);
                  return (
                    <div key={group.id} className="p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center gap-2.5 hover:bg-slate-50/70 transition">
                      {/* Family Label */}
                      <div className="w-full md:w-56 shrink-0 flex items-center justify-between md:justify-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[#0f4c81]">{getFamilyIcon(group.id)}</span>
                          <span className="font-bold text-xs text-slate-800">{group.name}</span>
                        </div>
                        <span className="bg-blue-100 text-[#0f4c81] font-black text-[10px] px-2 py-0.5 rounded-full">
                          {itemsInFamily.length} {itemsInFamily.length === 1 ? 'TAG' : 'TAGs'}
                        </span>
                      </div>

                      {/* Dynamic Columns of Allocated Tags */}
                      <div className="flex-1 flex flex-wrap gap-2 items-center">
                        {itemsInFamily.map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-lg p-1.5 pl-2 flex items-center gap-2 text-xs shadow-2xs"
                          >
                            <span className="font-mono font-black text-[#0f4c81] text-[11px]">
                              {item.prefix}
                            </span>

                            <select
                              value={item.status}
                              onChange={(e) => onUpdateEquipment(item.id, { status: e.target.value as EquipmentStatus })}
                              className={`text-[10px] font-bold rounded px-1.5 py-0.5 border cursor-pointer ${
                                item.status === 'Operacional'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : item.status === 'Em Manutenção'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="Operacional">Operacional</option>
                              <option value="Em Manutenção">Manut.</option>
                              <option value="Parado / Standby">Standby</option>
                              <option value="Desmobilizado">Desmob.</option>
                            </select>

                            <div className="flex items-center gap-0.5">
                              <input
                                type="number"
                                min="0"
                                max="24"
                                value={item.hoursWorked ?? 8}
                                onChange={(e) => onUpdateEquipment(item.id, { hoursWorked: Number(e.target.value) })}
                                className="w-10 border border-slate-200 rounded text-center text-[10px] font-bold bg-white py-0.5"
                              />
                              <span className="text-[9px] text-slate-400">h</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveEquipment(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                              title={`Remover ${item.prefix}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
