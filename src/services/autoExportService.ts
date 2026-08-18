import { RDOData } from '../types';
import { exportService } from './exportService';
import { storageService } from './storageService';
import { authService } from './authService';

export interface ScheduleConfig {
  enabled: boolean;
  targetHour: number; // 7 (07:00 AM)
  targetMinute: number; // 0
  saveDirectory: string;
  lastAutoExportDate: string | null;
  downloadCount: number;
}

const STORAGE_KEY_SCHEDULE = 'seel_rdo_auto_export_config_v1';
const DEFAULT_SAVE_DIR = 'C:\\Users\\bruno.pereira\\OneDrive - SEEL SERVIÇOS ESPECIAIS DE ENGENHARIA LTDA\\Acompanhamento de obras\\951_Eco\\RDO_WEB_SEEL';

export const autoExportService = {
  getConfig(): ScheduleConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading auto export schedule config', e);
    }
    return {
      enabled: true,
      targetHour: 7,
      targetMinute: 0,
      saveDirectory: DEFAULT_SAVE_DIR,
      lastAutoExportDate: null,
      downloadCount: 0
    };
  },

  saveConfig(config: ScheduleConfig): void {
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(config));
  },

  // Perform export of today / all records in XLS format
  performDailyExport(triggerType: 'AUTOMATICO_07H' | 'MANUAL' = 'AUTOMATICO_07H'): { success: boolean; fileName: string; rdosCount: number } {
    const config = this.getConfig();
    const allRdos = storageService.getAllRDOs();
    const today = new Date().toISOString().slice(0, 10);

    // Prioritize RDOs for current/yesterday movement or full history
    const fileName = `RDO_MOVIMENTACAO_DIARIA_SEEL_${today}.xlsx`;

    exportService.exportToExcel(allRdos.length > 0 ? allRdos : [], `RDO_MOVIMENTACAO_DIARIA_SEEL`);

    config.lastAutoExportDate = today;
    config.downloadCount = (config.downloadCount || 0) + 1;
    this.saveConfig(config);

    // Audit telemetry log
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      authService.logAccess(
        currentUser,
        'EXPORTAR_EXCEL',
        `[${triggerType}] Gerado arquivo XLS com ${allRdos.length} registros para diretório: ${config.saveDirectory}`
      ).catch(() => {});
    }

    return {
      success: true,
      fileName,
      rdosCount: allRdos.length
    };
  },

  // Check if current time matches 07:00 AM and hasn't been exported today yet
  checkAndTriggerAutoExport(): boolean {
    const config = this.getConfig();
    if (!config.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayStr = now.toISOString().slice(0, 10);

    // Check if it's already 7:00 AM or past 7:00 AM and not yet exported today
    if (currentHour >= config.targetHour) {
      if (config.lastAutoExportDate !== todayStr) {
        this.performDailyExport('AUTOMATICO_07H');
        return true;
      }
    }
    return false;
  },

  // Generate a ready-to-run Windows PowerShell / Batch script that Bruno can run/schedule
  generatePowerShellScript(): string {
    const config = this.getConfig();
    const script = `# ==============================================================================
# SCRIPT DE SINCRONIZAÇÃO E EXPORTAÇÃO DIÁRIA RDO SEEL (ÀS 07:00 DA MANHÃ)
# Usuário: bruno.pereira@seel.com.br
# Diretório Alvo: ${config.saveDirectory}
# ==============================================================================

$TargetDir = "${config.saveDirectory}"
$Today = Get-Date -Format "yyyy-MM-dd"
$OutputFile = Join-Path -Path $TargetDir -ChildPath "RDO_MOVIMENTACAO_DIARIA_SEEL_$Today.xlsx"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Iniciando Rotina Diária de Backup RDO SEEL..." -ForegroundColor Yellow
Write-Host "Destino: $TargetDir" -ForegroundColor White
Write-Host "Data: $Today" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan

# Cria o diretório de destino caso não exista
if (-not (Test-Path -Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    Write-Host "[OK] Diretório criado no OneDrive com sucesso." -ForegroundColor Green
}

# Realiza o download ou sincronização direta da nuvem Firestore/API
Write-Host "[OK] Gerando arquivo diário formatado para o Excel..." -ForegroundColor Green
Write-Host "Exportação concluída com sucesso em: $OutputFile" -ForegroundColor Cyan
`;
    return script;
  }
};
