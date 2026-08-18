/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { GeneralInfoSection } from './components/GeneralInfoSection';
import { ClimateSection } from './components/ClimateSection';
import { WorkforceSection } from './components/WorkforceSection';
import { EquipmentSection } from './components/EquipmentSection';
import { ActivitiesSection } from './components/ActivitiesSection';
import { PhotosSection } from './components/PhotosSection';
import { SignaturesSection } from './components/SignaturesSection';
import { HistoryView } from './components/HistoryView';
import { DashboardView } from './components/DashboardView';
import { AccessLogsView } from './components/AccessLogsView';
import { AutoExportModal } from './components/AutoExportModal';
import { PDFModal } from './components/PDFModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';

import { RDOData, UserProfile, SyncStats, ClimateCondition, EquipmentStatus, EquipmentItem, FieldPhoto } from './types';
import { createEmptyRDO, EQUIPMENT_GROUPS, ADMIN_ROLES, CAMPO_ROLES } from './data/constants';
import { storageService, DEFAULT_LOGO_URL } from './services/storageService';
import { authService } from './services/authService';
import { exportService } from './services/exportService';
import { autoExportService } from './services/autoExportService';

export default function App() {
  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAutoExportModalOpen, setIsAutoExportModalOpen] = useState(false);

  // Logo State
  const [logoUrl, setLogoUrl] = useState<string>(() => storageService.getSavedLogo());

  // RDO History & Current Active Form State
  const [history, setHistory] = useState<RDOData[]>(() => storageService.getAllRDOs());
  const [currentRDO, setCurrentRDO] = useState<RDOData>(() => createEmptyRDO());

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<TabType>('form');

  // Sync & Connection State
  const [syncStats, setSyncStats] = useState<SyncStats>(() => storageService.getSyncStats());
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals & Feedback State
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Create New Blank RDO
  const handleCreateNewRDO = () => {
    const fresh = createEmptyRDO(
      currentUser?.obraDefault || "ECORIOMINAS", 
      currentUser?.trechoDefault || ""
    );
    setCurrentRDO(fresh);
    setActiveTab('form');
    showToast('Novo RDO em branco pronto para preenchimento!');
  };

  // Online / Offline Connectivity Listeners & Collaborative Cloud Sync
  useEffect(() => {
    const updateOnlineStatus = () => {
      const stats = storageService.getSyncStats();
      setSyncStats(stats);
      if (stats.isOnline && stats.pendingCount > 0) {
        handleAutoSync();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial cloud fetch
    storageService.fetchCloudRDOs().then((rdos) => {
      if (rdos && rdos.length > 0) {
        setHistory(rdos);
        setSyncStats(storageService.getSyncStats());
      }
    });

    // Real-time collaborative subscription across all users/field engineers
    const unsubscribe = storageService.subscribeToAllRDOs((cloudRdos) => {
      setHistory(cloudRdos);
      setSyncStats(storageService.getSyncStats());
    });

    // Check for daily 07:00 AM automatic export trigger
    autoExportService.checkAndTriggerAutoExport();
    const intervalTimer = setInterval(() => {
      autoExportService.checkAndTriggerAutoExport();
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      unsubscribe();
      clearInterval(intervalTimer);
    };
  }, []);

  const handleAutoSync = async () => {
    setIsSyncing(true);
    const result = await storageService.syncAllPending();
    setIsSyncing(false);
    setHistory(storageService.getAllRDOs());
    setSyncStats(storageService.getSyncStats());
    if (result.syncedCount > 0) {
      showToast(`${result.syncedCount} RDO(s) sincronizado(s) com a nuvem!`);
    }
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          storageService.saveLogo(base64);
          setLogoUrl(base64);
          showToast('Logomarca personalizada salva com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Field Updates for General Info & Activities
  const handleFieldChange = (field: keyof RDOData, value: any) => {
    setCurrentRDO((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Climate Changes
  const handleClimaChange = (period: 'manha' | 'tarde' | 'noite', value: ClimateCondition) => {
    setCurrentRDO((prev) => ({
      ...prev,
      clima: {
        ...prev.clima,
        [period]: value
      }
    }));
  };

  // Shift changes
  const handleJornadaChange = (field: 'e1' | 's1' | 'e2' | 's2', value: string) => {
    setCurrentRDO((prev) => ({
      ...prev,
      jornada: {
        ...prev.jornada,
        [field]: value
      }
    }));
  };

  // Pluviometer change
  const handlePluvioChange = (value: string) => {
    setCurrentRDO((prev) => ({
      ...prev,
      pluviometro: {
        mm: value
      }
    }));
  };

  // Workforce Role Count Updates
  const handleRoleChange = (role: string, qty: number) => {
    setCurrentRDO((prev) => {
      const updatedRoles = { ...prev.roles, [role]: qty };
      
      let totalAdmin = 0;
      let totalCampo = 0;

      ADMIN_ROLES.forEach((r) => {
        totalAdmin += updatedRoles[r] || 0;
      });

      CAMPO_ROLES.forEach((r) => {
        totalCampo += updatedRoles[r] || 0;
      });

      return {
        ...prev,
        roles: updatedRoles,
        totalAdmin,
        totalCampo,
        totalEfetivo: totalAdmin + totalCampo
      };
    });
  };

  // Copy workforce from previous RDO
  const handleCopyPreviousWorkforce = () => {
    if (history.length > 0) {
      const prevRDO = history[0];
      if (prevRDO.roles) {
        setCurrentRDO((current) => ({
          ...current,
          roles: { ...prevRDO.roles },
          totalAdmin: prevRDO.totalAdmin || 0,
          totalCampo: prevRDO.totalCampo || 0,
          totalEfetivo: prevRDO.totalEfetivo || 0
        }));
        showToast('Efetivo copiado do último RDO salvo!');
      }
    } else {
      showToast('Nenhum RDO anterior disponível no histórico.');
    }
  };

  const handleClearWorkforce = () => {
    const zeroRoles: Record<string, number> = {};
    ADMIN_ROLES.forEach((r) => { zeroRoles[r] = 0; });
    CAMPO_ROLES.forEach((r) => { zeroRoles[r] = 0; });

    setCurrentRDO((prev) => ({
      ...prev,
      roles: zeroRoles,
      totalAdmin: 0,
      totalCampo: 0,
      totalEfetivo: 0
    }));
    showToast('Contadores de mão de obra zerados.');
  };

  // Equipment Handlers
  const handleAddEquipment = (
    groupId: string, 
    prefix = '', 
    desc = '', 
    status: EquipmentStatus = 'Operacional'
  ) => {
    const groupObj = EQUIPMENT_GROUPS.find((g) => g.id === groupId);
    const groupName = groupObj ? groupObj.name : groupId;

    // Pick first available preset if prefix is empty
    let initialPrefix = prefix;
    let initialDesc = desc;
    if (!initialPrefix && groupObj && groupObj.presets.length > 0) {
      const unusedPreset = groupObj.presets.find(
        (p) => !currentRDO.equipments.some((e) => e.prefix.toUpperCase() === p.prefix.toUpperCase())
      );
      if (unusedPreset) {
        initialPrefix = unusedPreset.prefix;
        initialDesc = unusedPreset.desc;
      } else {
        initialPrefix = groupObj.presets[0].prefix;
        initialDesc = groupObj.presets[0].desc;
      }
    }

    const newItem: EquipmentItem = {
      id: `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      groupId,
      groupName,
      prefix: initialPrefix,
      desc: initialDesc,
      status,
      hoursWorked: 8
    };

    setCurrentRDO((prev) => ({
      ...prev,
      equipments: [...prev.equipments, newItem]
    }));
    showToast(`Equipamento adicionado em ${groupName}.`);
  };

  const handleUpdateEquipment = (id: string, updates: Partial<EquipmentItem>) => {
    setCurrentRDO((prev) => ({
      ...prev,
      equipments: prev.equipments.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq))
    }));
  };

  const handleRemoveEquipment = (id: string) => {
    setCurrentRDO((prev) => ({
      ...prev,
      equipments: prev.equipments.filter((eq) => eq.id !== id)
    }));
    showToast('Equipamento removido.');
  };

  const handleClearAllEquipments = () => {
    setCurrentRDO((prev) => ({
      ...prev,
      equipments: []
    }));
    showToast('Todos os equipamentos foram removidos do RDO.');
  };

  // Photo Handlers
  const handleAddPhoto = (photo: FieldPhoto) => {
    setCurrentRDO((prev) => ({
      ...prev,
      photos: [...prev.photos, photo]
    }));
  };

  const handleUpdatePhoto = (id: string, updates: Partial<FieldPhoto>) => {
    setCurrentRDO((prev) => ({
      ...prev,
      photos: prev.photos.map((ph) => (ph.id === id ? { ...ph, ...updates } : ph))
    }));
  };

  const handleRemovePhoto = (id: string) => {
    setCurrentRDO((prev) => ({
      ...prev,
      photos: prev.photos.filter((ph) => ph.id !== id)
    }));
    showToast('Foto excluída.');
  };

  // Signatures
  const handleSignaturesChange = (field: keyof RDOData['signatures'], value: string) => {
    setCurrentRDO((prev) => ({
      ...prev,
      signatures: {
        ...prev.signatures,
        [field]: value
      }
    }));
  };

  // Save RDO Action
  const handleSaveRDO = () => {
    const { success, isOnline } = storageService.saveRDO(currentRDO);
    if (success) {
      const updatedHistory = storageService.getAllRDOs();
      setHistory(updatedHistory);
      setSyncStats(storageService.getSyncStats());
      
      // Log usage telemetry
      if (currentUser) {
        authService.logAccess(
          currentUser, 
          'SALVAR_RDO', 
          `Salvo RDO Data: ${currentRDO.data} | Obra: ${currentRDO.obra} | Efetivo: ${currentRDO.totalEfetivo} pess. | Equip.: ${currentRDO.equipments?.length || 0}`
        ).catch(() => {});
      }

      if (isOnline) {
        showToast('✓ RDO salvo e sincronizado na nuvem com sucesso!');
      } else {
        showToast('✓ RDO salvo localmente! Sincronização ocorrerá quando houver internet.');
      }
    }
  };

  // Load from History
  const handleLoadRDO = (rdo: RDOData) => {
    setCurrentRDO(rdo);
    setActiveTab('form');
    showToast(`RDO do dia ${rdo.data} carregado no formulário!`);
  };

  // Duplicate for Today
  const handleDuplicateRDO = (rdo: RDOData) => {
    const today = new Date().toISOString().split('T')[0];
    const cloned: RDOData = {
      ...rdo,
      id: `rdo_${Date.now()}`,
      data: today,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local',
      signatures: {
        ...rdo.signatures,
        contratadaSignData: undefined,
        contratanteSignData: undefined,
        dateContratada: undefined,
        dateContratante: undefined
      }
    };

    setCurrentRDO(cloned);
    setActiveTab('form');

    if (currentUser) {
      authService.logAccess(
        currentUser,
        'CLONAR_RDO',
        `RDO do dia ${rdo.data} clonado para hoje (${today}) por ${currentUser.name}`
      ).catch(() => {});
    }

    showToast('RDO duplicado com data de hoje! Pronto para preenchimento.');
  };

  // Clone Immediately Previous RDO into Current Form
  const handleClonePreviousRDO = () => {
    const allRdos = storageService.getAllRDOs();
    if (allRdos.length === 0) {
      showToast('Nenhum RDO anterior disponível no histórico para clonar.');
      return;
    }
    // Find the latest saved RDO (or the one before current)
    const prev = allRdos.find((r) => r.id !== currentRDO.id) || allRdos[0];
    handleDuplicateRDO(prev);
    showToast(`RDO do dia ${prev.data} clonado com sucesso! Dados mantidos com a data de hoje.`);
  };

  // Delete from History
  const handleDeleteRDO = (id: string) => {
    const toDelete = history.find(r => r.id === id);
    storageService.deleteRDO(id);
    setHistory(storageService.getAllRDOs());
    setSyncStats(storageService.getSyncStats());

    if (currentUser) {
      authService.logAccess(
        currentUser,
        'EXCLUIR_RDO',
        `Excluído RDO ${toDelete?.data || id} | Obra: ${toDelete?.obra || ''}`
      ).catch(() => {});
    }

    showToast('RDO excluído do histórico.');
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportService.exportToExcel(history.length > 0 ? history : [currentRDO]);
    if (currentUser) {
      authService.logAccess(
        currentUser,
        'EXPORTAR_EXCEL',
        `Exportados ${history.length || 1} RDO(s) para arquivo Excel (.xlsx)`
      ).catch(() => {});
    }
    showToast('Planilha Excel (.xlsx) gerada e baixada com sucesso!');
  };

  // Open PDF Preview Handler
  const handleOpenPDF = (rdoToPreview?: RDOData) => {
    const target = rdoToPreview || currentRDO;
    if (rdoToPreview) setCurrentRDO(rdoToPreview);
    setIsPDFModalOpen(true);

    if (currentUser) {
      authService.logAccess(
        currentUser,
        'VISUALIZAR_PDF',
        `Visualizada e gerada folha de RDO Data: ${target.data} | Obra: ${target.obra}`
      ).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col selection:bg-[#0f4c81] selection:text-white">
      
      {/* Header */}
      <Header 
        logoUrl={logoUrl}
        onLogoUpload={handleLogoUpload}
        syncStats={syncStats}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNewRDO={handleCreateNewRDO}
        onClonePreviousRDO={handleClonePreviousRDO}
        onSaveRDO={handleSaveRDO}
        onPreviewPDF={() => handleOpenPDF()}
        onExportExcel={handleExportExcel}
        onOpenAutoExport={() => setIsAutoExportModalOpen(true)}
        onOpenHistory={() => setActiveTab('history')}
        onSyncNow={handleAutoSync}
        isSyncing={isSyncing}
        historyCount={history.length}
      />

      {/* Tabs Navigation */}
      <Navigation 
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        photoCount={currentRDO.photos?.length || 0}
        totalEfetivo={currentRDO.totalEfetivo || 0}
        totalEquip={currentRDO.equipments?.length || 0}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 space-y-4 sm:space-y-6">
        
        {/* Tab 1: Form Preenchimento */}
        {activeTab === 'form' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
            
            {/* General Info */}
            <GeneralInfoSection 
              rdo={currentRDO}
              onChange={handleFieldChange}
              onSignaturesChange={(field, val) => handleSignaturesChange(field, val)}
            />

            {/* Weather & Soil & Shift & DDS */}
            <ClimateSection 
              rdo={currentRDO}
              onChange={handleFieldChange}
              onClimaChange={handleClimaChange}
              onJornadaChange={handleJornadaChange}
              onPluvioChange={handlePluvioChange}
            />

            {/* Workforce (Mão de Obra) */}
            <WorkforceSection 
              rdo={currentRDO}
              onRoleChange={handleRoleChange}
              onCopyPreviousWorkforce={handleCopyPreviousWorkforce}
              onClearWorkforce={handleClearWorkforce}
            />

            {/* Equipment Allocation */}
            <EquipmentSection 
              rdo={currentRDO}
              onAddEquipment={handleAddEquipment}
              onUpdateEquipment={handleUpdateEquipment}
              onRemoveEquipment={handleRemoveEquipment}
              onClearAllEquipments={handleClearAllEquipments}
              onShowToast={showToast}
            />

            {/* Activities & Observations */}
            <ActivitiesSection 
              rdo={currentRDO}
              onChange={handleFieldChange}
            />

            {/* Quick Action Bar at bottom */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Dados salvos em cache local contínuo</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPDF()}
                  className="bg-[#f59e0b] hover:bg-amber-600 active:scale-95 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
                >
                  Visualizar Folha de RDO / PDF
                </button>
                <button
                  type="button"
                  onClick={handleSaveRDO}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-5 py-2 rounded-lg text-xs transition shadow-sm cursor-pointer"
                >
                  Salvar Relatório
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Fotos de Campo */}
        {activeTab === 'photos' && (
          <div className="animate-in fade-in duration-150">
            <PhotosSection 
              photos={currentRDO.photos || []}
              trechoDefault={currentRDO.trecho}
              onAddPhoto={handleAddPhoto}
              onUpdatePhoto={handleUpdatePhoto}
              onRemovePhoto={handleRemovePhoto}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* Tab 3: Assinaturas & Visto */}
        {activeTab === 'signatures' && (
          <div className="animate-in fade-in duration-150">
            <SignaturesSection 
              rdo={currentRDO}
              onSignaturesChange={handleSignaturesChange}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* Tab 4: Histórico de RDOs */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-150">
            <HistoryView 
              history={history}
              onLoadRDO={handleLoadRDO}
              onDuplicateRDO={handleDuplicateRDO}
              onDeleteRDO={handleDeleteRDO}
              onExportExcel={handleExportExcel}
              onNewRDO={handleCreateNewRDO}
              onPreviewRDO={(rdo) => handleOpenPDF(rdo)}
            />
          </div>
        )}

        {/* Tab 5: Painel & Métricas */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-150">
            <DashboardView history={history} />
          </div>
        )}

        {/* Tab 6: Auditoria de Uso & Registro de Acessos */}
        {activeTab === 'audit_logs' && (
          <div className="animate-in fade-in duration-150">
            <AccessLogsView />
          </div>
        )}

      </main>

      {/* PDF Modal */}
      <PDFModal 
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        rdo={currentRDO}
        logoUrl={logoUrl}
        onShowToast={showToast}
      />

      {/* Auto Export 07:00 Modal */}
      <AutoExportModal 
        isOpen={isAutoExportModalOpen}
        onClose={() => setIsAutoExportModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          authService.setCurrentUser(user);
          setCurrentRDO((prev) => ({
            ...prev,
            obra: user.obraDefault || prev.obra,
            trecho: user.trechoDefault || prev.trecho
          }));
        }}
        onLogout={() => {
          authService.logout(currentUser);
          setCurrentUser(null);
        }}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 print:hidden">
        SEEL Engenharia • Serviços Especiais de Engenharia • Relatório Diário de Obra (RDO)
      </footer>

    </div>
  );
}
