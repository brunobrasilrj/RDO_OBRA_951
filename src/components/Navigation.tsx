import React from 'react';
import { 
  FileEdit, 
  History, 
  Camera, 
  PenTool, 
  BarChart3, 
  Layers,
  Activity
} from 'lucide-react';

export type TabType = 'form' | 'history' | 'photos' | 'signatures' | 'dashboard' | 'audit_logs';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  photoCount: number;
  totalEfetivo: number;
  totalEquip: number;
  logsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  photoCount,
  totalEfetivo,
  totalEquip,
  logsCount
}) => {
  const tabs = [
    {
      id: 'form' as TabType,
      label: 'Preenchimento RDO',
      shortLabel: 'RDO',
      icon: FileEdit,
      badge: `${totalEfetivo} pess. / ${totalEquip} eq.`
    },
    {
      id: 'photos' as TabType,
      label: 'Fotos de Campo',
      shortLabel: 'Fotos',
      icon: Camera,
      badge: photoCount > 0 ? `${photoCount}` : undefined
    },
    {
      id: 'signatures' as TabType,
      label: 'Assinaturas & Visto',
      shortLabel: 'Assinaturas',
      icon: PenTool
    },
    {
      id: 'history' as TabType,
      label: 'Histórico de Obras',
      shortLabel: 'Histórico',
      icon: History
    },
    {
      id: 'dashboard' as TabType,
      label: 'Painel & Métricas',
      shortLabel: 'Métricas',
      icon: BarChart3
    },
    {
      id: 'audit_logs' as TabType,
      label: 'Auditoria & Acessos',
      shortLabel: 'Acessos',
      icon: Activity,
      badge: logsCount ? `${logsCount}` : undefined
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 print:hidden shadow-2xs sticky top-[57px] z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#0f4c81] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>

              {tab.badge && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
