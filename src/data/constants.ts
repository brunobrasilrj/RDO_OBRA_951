import { EquipmentGroup, RDOData } from '../types';

export const ADMIN_ROLES: string[] = [
  "Coord. de Engenharia",
  "Engenheiro",
  "Analista de Engenharia",
  "Ass. Administrativo",
  "Tec. Segurança",
  "Apontador"
];

export const CAMPO_ROLES: string[] = [
  "Encarregado",
  "Greidista",
  "Armador",
  "Carpinteiro",
  "Pedreiro",
  "Serventes/Ajudantes",
  "Alpinistas",
  "Servente/Corda",
  "Profissionais/Cordas",
  "Motoristas",
  "Op. Máquinas Pesadas",
  "Outros"
];export const EQUIPMENT_GROUPS: EquipmentGroup[] = [
  { 
    id: "escavadeiras", 
    name: "Escavadeiras Hidraulicas", 
    icon: "Shovel", 
    presets: [
      { prefix: "ESC002", desc: "ESC002" },
      { prefix: "ESC008", desc: "ESC008" },
      { prefix: "ESC009", desc: "ESC009" },
      { prefix: "ESC010", desc: "ESC010" },
      { prefix: "ESC011", desc: "ESC011" },
      { prefix: "EST001", desc: "EST001" },
      { prefix: "EST002", desc: "EST002" },
      { prefix: "EST005", desc: "EST005" },
      { prefix: "EST006", desc: "EST006" },
      { prefix: "EST007", desc: "EST007" }
    ] 
  },
  { 
    id: "retroescavadeiras", 
    name: "Retroescavadeiras", 
    icon: "Tractor", 
    presets: [
      { prefix: "RTT001", desc: "RTT001" },
      { prefix: "RTT002", desc: "RTT002" },
      { prefix: "RET005", desc: "RET005" },
      { prefix: "RET008", desc: "RET008" },
      { prefix: "RET009", desc: "RET009" },
      { prefix: "RET011", desc: "RET011" },
      { prefix: "RET012", desc: "RET012" }
    ] 
  },
  { 
    id: "rolo", 
    name: "Rolo Compactador", 
    icon: "Disc", 
    presets: [
      { prefix: "RCT001", desc: "RCT001" },
      { prefix: "RCT002", desc: "RCT002" },
      { prefix: "RCT003", desc: "RCT003" },
      { prefix: "RCT004", desc: "RCT004" },
      { prefix: "RCX001", desc: "RCX001" },
      { prefix: "RCX002", desc: "RCX002" }
    ] 
  },
  { 
    id: "pacarregadeira", 
    name: "Pá Carregadeira", 
    icon: "Truck", 
    presets: [
      { prefix: "PCT001", desc: "PCT001" },
      { prefix: "PCT002", desc: "PCT002" },
      { prefix: "PCT003", desc: "PCT003" },
      { prefix: "PCT004", desc: "PCT004" }
    ] 
  },
  { 
    id: "compactador_manual", 
    name: "Compactador Manual", 
    icon: "Hammer", 
    presets: [
      { prefix: "CMP001", desc: "CMP001" },
      { prefix: "CMP002", desc: "CMP002" },
      { prefix: "CMP003", desc: "CMP003" }
    ] 
  },
  { 
    id: "caminhoes_basculantes", 
    name: "Caminhões Basculantes", 
    icon: "Truck", 
    presets: [
      { prefix: "CAT001", desc: "CAT001" },
      { prefix: "CAT002", desc: "CAT002" },
      { prefix: "CAT004", desc: "CAT004" },
      { prefix: "CAT005", desc: "CAT005" },
      { prefix: "CBT001", desc: "CBT001" },
      { prefix: "CBT002", desc: "CBT002" },
      { prefix: "CBT003", desc: "CBT003" },
      { prefix: "CBT004", desc: "CBT004" },
      { prefix: "CBT005", desc: "CBT005" },
      { prefix: "CBT006", desc: "CBT006" },
      { prefix: "CBT007", desc: "CBT007" },
      { prefix: "CBT012", desc: "CBT012" },
      { prefix: "CBT013", desc: "CBT013" },
      { prefix: "CBT016", desc: "CBT016" },
      { prefix: "CBT017", desc: "CBT017" },
      { prefix: "CBT018", desc: "CBT018" },
      { prefix: "CBT019", desc: "CBT019" },
      { prefix: "CBT020", desc: "CBT020" },
      { prefix: "CBT022", desc: "CBT022" },
      { prefix: "CBT023", desc: "CBT023" },
      { prefix: "CBT025", desc: "CBT025" },
      { prefix: "CBX001", desc: "CBX001" },
      { prefix: "CBX002", desc: "CBX002" },
      { prefix: "CBX003", desc: "CBX003" },
      { prefix: "CBX004", desc: "CBX004" },
      { prefix: "CBX005", desc: "CBX005" },
      { prefix: "CBX006", desc: "CBX006" },
      { prefix: "CBX007", desc: "CBX007" },
      { prefix: "CBX008", desc: "CBX008" },
      { prefix: "CBX009", desc: "CBX009" },
      { prefix: "CBX010", desc: "CBX010" },
      { prefix: "CBX011", desc: "CBX011" },
      { prefix: "CBX012", desc: "CBX012" },
      { prefix: "CBX013", desc: "CBX013" }
    ] 
  },
  { 
    id: "caminhao_pipa", 
    name: "Caminhão Pipa", 
    icon: "Droplet", 
    presets: [
      { prefix: "CPT001", desc: "CPT001" },
      { prefix: "CPT002", desc: "CPT002" },
      { prefix: "CPT003", desc: "CPT003" },
      { prefix: "CPT005", desc: "CPT005" }
    ] 
  },
  { 
    id: "caminhao_prancha", 
    name: "Caminhão Prancha", 
    icon: "Trailer", 
    presets: [
      { prefix: "CVT001", desc: "CVT001" },
      { prefix: "CVX001", desc: "CVX001" },
      { prefix: "PRX001", desc: "PRX001" },
      { prefix: "PRT001", desc: "PRT001" }
    ] 
  },
  { 
    id: "caminhao_munck", 
    name: "Caminhão Munck", 
    icon: "Crane", 
    presets: [
      { prefix: "CGX004", desc: "CGX004" },
      { prefix: "CGX005", desc: "CGX005" }
    ] 
  },
  { 
    id: "comboio", 
    name: "Comboio", 
    icon: "Fuel", 
    presets: [
      { prefix: "CCX001", desc: "CCX001" },
      { prefix: "CCT002", desc: "CCT002" }
    ] 
  },
  { 
    id: "onibus", 
    name: "Ônibus", 
    icon: "Bus", 
    presets: [
      { prefix: "ONT007", desc: "ONT007" },
      { prefix: "ONT008", desc: "ONT008" },
      { prefix: "ONT009", desc: "ONT009" },
      { prefix: "ONT010", desc: "ONT010" },
      { prefix: "ONT011", desc: "ONT011" },
      { prefix: "ONT012", desc: "ONT012" },
      { prefix: "ONT014", desc: "ONT014" }
    ] 
  },
  { 
    id: "gerador", 
    name: "Gerador", 
    icon: "Zap", 
    presets: [
      { prefix: "GER001", desc: "GER001" },
      { prefix: "GER002", desc: "GER002" }
    ] 
  },
  { 
    id: "betoneira", 
    name: "Betoneira", 
    icon: "Boxes", 
    presets: [
      { prefix: "BET001", desc: "BET001" },
      { prefix: "BET002", desc: "BET002" }
    ] 
  }
];

export const QUICK_ACTIVITIES_TEMPLATES = [
  "Escavação de material de 1ª categoria e carga com escavadeira hidráulica.",
  "Transporte de material escavado para área de bota-fora autorizado.",
  "Espalhamento, homogeneização e compactação de camadas de aterro.",
  "Regularização e conformação de taludes de corte e aterro.",
  "Execução de drenagem superficial (valetas, descidas d'água e sarjetas).",
  "Umedecimento de pista e controle de poeira com caminhão pipa.",
  "Perfuração e contenção com perfuratrizes e injeção de calda.",
  "Serviços de topografia, marcação de greide e nivelamento.",
  "Instalação de telas de contenção e proteção contra queda de blocos em encostas."
];

export const QUICK_DDS_TEMPLATES = [
  "Uso obrigatório e correto dos EPIs (Capacete, Óculos, Botina, Protetor auricular, Colete reflexivo).",
  "Atenção com máquinas pesadas em movimento, raio de giro e pontos cegos.",
  "Segurança em trabalhos em encostas, taludes e trabalho em altura.",
  "Hidratação constante e proteção solar na jornada de trabalho.",
  "Procedimento de bloqueio e etiquetagem na manutenção de equipamentos (LOTO).",
  "Cuidados na movimentação de cargas suspensas e cabos de aço."
];

export const createEmptyRDO = (defaultObra = "ECORIOMINAS", defaultTrecho = ""): RDOData => {
  const today = new Date().toISOString().split('T')[0];
  const initialRoles: Record<string, number> = {};
  
  ADMIN_ROLES.forEach(r => { initialRoles[r] = 0; });
  CAMPO_ROLES.forEach(r => { initialRoles[r] = 0; });

  return {
    id: `rdo_${Date.now()}`,
    contratada: "SEEL - SERVIÇOS ESPECIAIS DE ENGENHARIA",
    obra: defaultObra,
    contrato: "",
    data: today,
    pagina: "01 / 01",
    trecho: defaultTrecho,
    equipe: "",
    clima: {
      manha: "BOM",
      tarde: "BOM",
      noite: "SEM TRABALHO"
    },
    pluviometro: {
      mm: ""
    },
    solo: "EM CONDIÇÕES DE TRABALHO",
    jornada: {
      e1: "",
      s1: "",
      e2: "",
      s2: ""
    },
    roles: initialRoles,
    totalAdmin: 0,
    totalCampo: 0,
    totalEfetivo: 0,
    equipments: [],
    dds: "",
    atividades: "",
    observacoes: "",
    photos: [],
    signatures: {
      contratada: "",
      contratante: ""
    },
    syncStatus: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
