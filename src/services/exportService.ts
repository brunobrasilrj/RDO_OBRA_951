import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toCanvas } from 'html-to-image';
import { RDOData } from '../types';
import { ADMIN_ROLES, CAMPO_ROLES } from '../data/constants';

export const exportService = {
  exportToExcel(rdos: RDOData[], fileNamePrefix = 'Relatorio_Diario_Obras_RDO'): void {
    if (!rdos || rdos.length === 0) return;

    // Sheet 1: Resumo RDOs
    const rdoRows = rdos.map(r => ({
      "Data": r.data,
      "Obra": r.obra,
      "Nº Contrato": r.contrato,
      "Trecho / Localidade": r.trecho,
      "Equipe": r.equipe || "Equipe A",
      "Clima Manhã": r.clima?.manha || "BOM",
      "Clima Tarde": r.clima?.tarde || "BOM",
      "Clima Noite": r.clima?.noite || "SEM TRABALHO",
      "Condição do Solo": r.solo,
      "Pluviômetro": r.pluviometro?.mm || "0 mm/m²",
      "Jornada Manhã": `${r.jornada?.e1 || '07:00'} às ${r.jornada?.s1 || '12:00'}`,
      "Jornada Tarde": `${r.jornada?.e2 || '13:00'} às ${r.jornada?.s2 || '17:00'}`,
      "Efetivo Admin": r.totalAdmin || 0,
      "Efetivo Campo": r.totalCampo || 0,
      "Total Geral Efetivo": r.totalEfetivo || 0,
      "Qtd Equipamentos Alocados": r.equipments?.length || 0,
      "Tema do DDS": r.dds || "",
      "Resumo Atividades Realizadas": r.atividades || "",
      "Observações da Contratante": r.observacoes || "",
      "Status Sincronização": r.syncStatus === 'synced' ? 'Sincronizado na Nuvem' : 'Pendente / Local',
      "Responsável Contratada (SEEL)": r.signatures?.contratada || "Engenheiro SEEL",
      "Fiscal Contratante": r.signatures?.contratante || "Fiscal de Obra"
    }));

    // Sheet 2: Detalhamento Mão de Obra
    const rolesRows: any[] = [];
    rdos.forEach(r => {
      ADMIN_ROLES.forEach(role => {
        const qty = r.roles ? (r.roles[role] || 0) : 0;
        if (qty > 0) {
          rolesRows.push({
            "Data": r.data,
            "Obra": r.obra,
            "Trecho": r.trecho,
            "Categoria": "Administrativo",
            "Função / Cargo": role,
            "Quantidade": qty
          });
        }
      });

      CAMPO_ROLES.forEach(role => {
        const qty = r.roles ? (r.roles[role] || 0) : 0;
        if (qty > 0) {
          rolesRows.push({
            "Data": r.data,
            "Obra": r.obra,
            "Trecho": r.trecho,
            "Categoria": "Campo",
            "Função / Cargo": role,
            "Quantidade": qty
          });
        }
      });
    });

    // Sheet 3: Alocação Equipamentos (ID / TAG)
    const equipRows: any[] = [];
    rdos.forEach(r => {
      if (r.equipments) {
        r.equipments.forEach(eq => {
          equipRows.push({
            "Data": r.data,
            "Obra": r.obra,
            "Trecho": r.trecho,
            "Família / Tipo": eq.groupName,
            "ID / TAG": eq.prefix || "S/N",
            "Status": eq.status || "Operacional",
            "Horas Trabalhadas": eq.hoursWorked !== undefined ? eq.hoursWorked : 8
          });
        });
      }
    });

    // Sheet 4: Registro Fotográfico
    const photoRows: any[] = [];
    rdos.forEach(r => {
      if (r.photos && r.photos.length > 0) {
        r.photos.forEach((ph, idx) => {
          photoRows.push({
            "Data": r.data,
            "Obra": r.obra,
            "Trecho": r.trecho,
            "Foto Nº": idx + 1,
            "Local / Estaca": ph.location || r.trecho,
            "Legenda": ph.caption || "Registro Fotográfico de Campo",
            "Data e Hora": ph.timestamp
          });
        });
      }
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(rdoRows);
    const ws2 = XLSX.utils.json_to_sheet(rolesRows);
    const ws3 = XLSX.utils.json_to_sheet(equipRows);
    const ws4 = XLSX.utils.json_to_sheet(photoRows.length > 0 ? photoRows : [{ "Status": "Sem fotos anexadas" }]);

    // Auto-size columns slightly
    const autoFit = (ws: any) => {
      ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    };
    autoFit(ws1);
    autoFit(ws2);
    autoFit(ws3);

    XLSX.utils.book_append_sheet(wb, ws1, "Resumo RDOs");
    XLSX.utils.book_append_sheet(wb, ws2, "Detalhamento Mão de Obra");
    XLSX.utils.book_append_sheet(wb, ws3, "Alocação Equipamentos");
    if (photoRows.length > 0) {
      XLSX.utils.book_append_sheet(wb, ws4, "Registro Fotográfico");
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${fileNamePrefix}_${todayStr}.xlsx`);
  },

  async downloadPDFElement(elementId: string, fileName: string): Promise<boolean> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found for PDF export.`);
      window.print();
      return false;
    }

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    try {
      let imgData = '';

      // Method 1: Try html-to-image (fast, supports modern CSS/Tailwind v4, native SVG/HTML rendering)
      try {
        imgData = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
          style: {
            margin: '0',
            transform: 'none'
          }
        });
      } catch (errHtmlToImage) {
        console.warn('html-to-image failed, falling back to html2canvas:', errHtmlToImage);
      }

      // Method 2: Fallback to html2canvas if Method 1 produced no image
      if (!imgData) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: element.scrollWidth || 800
        });
        imgData = canvas.toDataURL('image/jpeg', 0.98);
      }

      if (!imgData) {
        throw new Error('Falha ao capturar a imagem do relatório.');
      }

      // Create standard A4 portrait PDF (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297
      
      const imgProps = pdf.getImageProperties(imgData);
      
      // Calculate scaled height with a clean 4mm margin for maximum print readability
      const margin = 4;
      const printableWidth = pdfWidth - (margin * 2);
      const printableHeight = pdfHeight - (margin * 2);
      
      const imgHeight = (imgProps.height * printableWidth) / imgProps.width;

      // Fit single page if close to printable height (standard Diário de Obra)
      if (imgHeight <= printableHeight + 15) {
        // Fit single page cleanly
        const finalHeight = Math.min(imgHeight, printableHeight);
        pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, finalHeight, undefined, 'FAST');
      } else {
        // Multi-page slicing if content is long
        let heightLeft = imgHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight, undefined, 'FAST');
        heightLeft -= printableHeight;

        while (heightLeft > 5) {
          position = heightLeft - imgHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight, undefined, 'FAST');
          heightLeft -= printableHeight;
        }
      }

      // Download trigger: jsPDF save + Blob anchor click for 100% browser compatibility
      try {
        pdf.save(cleanFileName);
      } catch (saveErr) {
        console.warn('pdf.save failed, using blob link fallback:', saveErr);
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      }

      return true;
    } catch (e) {
      console.error('Error generating PDF:', e);
      // Fallback: window print
      window.print();
      return false;
    }
  }
};
