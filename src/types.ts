export type ClimateCondition = 
  | 'BOM' 
  | 'NUBLADO' 
  | 'CHUVA LEVE' 
  | 'CHUVA FORTE' 
  | 'IMPRACTICÁVEL' 
  | 'SEM TRABALHO';

export type SoilCondition = 'EM CONDIÇÕES DE TRABALHO' | 'SATURADO';

export type EquipmentStatus = 'Operacional' | 'Em Manutenção' | 'Parado / Standby' | 'Desmobilizado';

export interface EquipmentItem {
  id: string;
  groupId: string;
  groupName: string;
  prefix: string; // e.g. ESC008, CBT001
  desc: string;   // e.g. ESCAVADEIRA HIDRÁULICA HYUNDAI R220LC
  status: EquipmentStatus;
  horimeterStart?: number;
  horimeterEnd?: number;
  hoursWorked?: number;
  notes?: string;
}

export interface EquipmentGroup {
  id: string;
  name: string;
  icon: string;
  presets: {
    prefix: string;
    desc: string;
  }[];
}

export interface FieldPhoto {
  id: string;
  url: string; // base64 or blob URL
  caption: string;
  location?: string;
  timestamp: string;
}

export interface RDOData {
  id: string; // Unique ID / Timestamp string
  userId?: string;
  userName?: string;
  contratada: string;
  obra: string;
  contrato: string;
  data: string; // YYYY-MM-DD
  pagina: string;
  trecho: string;
  equipe: string;
  clima: {
    manha: ClimateCondition;
    tarde: ClimateCondition;
    noite: ClimateCondition;
  };
  pluviometro: {
    mm: string;
  };
  solo: SoilCondition;
  jornada: {
    e1: string;
    s1: string;
    e2: string;
    s2: string;
  };
  roles: Record<string, number>;
  totalAdmin: number;
  totalCampo: number;
  totalEfetivo: number;
  equipments: EquipmentItem[];
  dds: string;
  atividades: string;
  observacoes: string;
  photos: FieldPhoto[];
  signatures: {
    contratada: string;
    contratante: string;
    contratadaSignData?: string; // canvas drawing
    contratanteSignData?: string;
    dateContratada?: string;
    dateContratante?: string;
  };
  syncStatus: 'synced' | 'pending' | 'local';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Apontador' | 'Engenheiro de Campo' | 'Fiscal de Obra' | 'Coordenador' | 'Engenheiro Gestor';
  obraDefault: string;
  trechoDefault?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: 'LOGIN' | 'CADASTRO' | 'SALVAR_RDO' | 'EXCLUIR_RDO' | 'VISUALIZAR_PDF' | 'EXPORTAR_EXCEL' | 'CLONAR_RDO';
  details?: string;
  timestamp: string; // ISO 8601 string
  date: string; // DD/MM/YYYY
  time: string; // HH:MM:SS
  userAgent?: string;
}

export interface SyncStats {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
}
