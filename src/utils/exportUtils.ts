import { jsPDF } from 'jspdf';
import { Report, QuestionItem, QuestionSection, SchoolConfig } from '../types';

/**
 * Exports reports to CSV/Excel format compatible with Microsoft Excel and Google Sheets
 */
export function exportToExcel(
  reports: Report[],
  questions: QuestionItem[],
  filename = 'Relatorios_Pre_Conselho_Escola_Frei_Graciano.csv'
): void {
  if (!reports || reports.length === 0) {
    alert('Nenhum relatório selecionado para exportar.');
    return;
  }

  // Header row
  const staticHeaders = [
    'ID do Relatório',
    'Turma',
    'Componente Curricular',
    'Professor Responsável',
    'Data de Envio',
    'Status',
  ];

  const questionHeaders = questions.map((q) => `"${q.prompt.replace(/"/g, '""')}"`);
  const allHeaders = [...staticHeaders, ...questionHeaders].join(';');

  // Data rows
  const rows = reports.map((rep) => {
    const statusLabel = rep.status === 'submitted' ? 'Enviado' : 'Rascunho';

    const staticCols = [
      `"${rep.id}"`,
      `"${rep.className}"`,
      `"${rep.subject || ''}"`,
      `"${rep.teacherName}"`,
      `"${rep.date}"`,
      `"${statusLabel}"`,
    ];

    const answerCols = questions.map((q) => {
      const ans = rep.answers[q.id] || '';
      return `"${ans.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    });

    return [...staticCols, ...answerCols].join(';');
  });

  // BOM for UTF-8 in Excel
  const csvContent = '\uFEFF' + [allHeaders, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official PDF document for a single report matching the school physical form
 */
export function exportSingleReportToPDF(
  report: Report,
  sections: QuestionSection[],
  questions: QuestionItem[],
  schoolConfig: SchoolConfig
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  function checkPageBreak(requiredHeight: number) {
    if (cursorY + requiredHeight > pageHeight - margin - 20) {
      doc.addPage();
      cursorY = margin;
      drawHeader(true);
    }
  }

  function drawHeader(isContinuation = false) {
    // School border
    doc.setDrawColor(70, 70, 70);
    doc.setLineWidth(0.6);
    doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin - 4) * 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(schoolConfig.name, pageWidth / 2, cursorY + 4, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolConfig.subtitle, pageWidth / 2, cursorY + 9, { align: 'center' });

    cursorY += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(schoolConfig.documentTitle + (isContinuation ? ' (Continuação)' : ''), pageWidth / 2, cursorY, {
      align: 'center',
    });

    cursorY += 6;
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 4;
  }

  // Draw Initial Header
  drawHeader();

  // Document metadata box
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Componente:', margin, cursorY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(report.subject || 'Não especificado', margin + 25, cursorY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text('Data:', pageWidth - margin - 35, cursorY + 4);
  doc.setFont('helvetica', 'normal');
  const formattedDate = report.date ? report.date.split('-').reverse().join('/') : '__/__/____';
  doc.text(formattedDate, pageWidth - margin - 22, cursorY + 4);

  cursorY += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Professor(a):', margin, cursorY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(report.teacherName, margin + 25, cursorY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text('Turma:', pageWidth - margin - 35, cursorY + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(report.className, pageWidth - margin - 22, cursorY + 4);

  cursorY += 8;
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  // Render Sections and Questions
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  sortedSections.forEach((section) => {
    const sectionQuestions = questions
      .filter((q) => q.sectionId === section.id)
      .sort((a, b) => a.order - b.order);

    if (sectionQuestions.length === 0) return;

    checkPageBreak(18);

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(section.title, margin, cursorY + 3);
    cursorY += 7;

    sectionQuestions.forEach((q) => {
      const answerText = report.answers[q.id] || '(Não informado)';

      // Question Prompt
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 50);

      const promptLines = doc.splitTextToSize(q.prompt, contentWidth);
      checkPageBreak(promptLines.length * 4 + 14);

      doc.text(promptLines, margin, cursorY + 3);
      cursorY += promptLines.length * 3.8 + 2;

      // Answer Box
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      const answerLines = doc.splitTextToSize(answerText, contentWidth - 4);
      const boxHeight = Math.max(10, answerLines.length * 4 + 4);

      checkPageBreak(boxHeight + 4);

      // Light box background for answer
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, cursorY, contentWidth, boxHeight, 'FD');

      doc.text(answerLines, margin + 2, cursorY + 4.5);
      cursorY += boxHeight + 4;
    });

    cursorY += 2;
  });

  // Signature Block
  checkPageBreak(35);
  cursorY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  const sigWidth = (contentWidth - 10) / 3;

  // Teacher signature line
  const x1 = margin;
  doc.line(x1, cursorY + 12, x1 + sigWidth, cursorY + 12);
  doc.text('Assinatura do(a) Professor(a)', x1 + sigWidth / 2, cursorY + 16, { align: 'center' });
  doc.setFontSize(7);
  doc.text(report.teacherName, x1 + sigWidth / 2, cursorY + 20, { align: 'center' });

  // Pedagogue signature line
  const x2 = margin + sigWidth + 5;
  doc.setFontSize(8);
  doc.line(x2, cursorY + 12, x2 + sigWidth, cursorY + 12);
  doc.text('Assinatura da Pedagoga', x2 + sigWidth / 2, cursorY + 16, { align: 'center' });
  doc.setFontSize(7);
  doc.text(schoolConfig.pedagogueName, x2 + sigWidth / 2, cursorY + 20, { align: 'center' });

  // Principal signature line
  const x3 = margin + (sigWidth + 5) * 2;
  doc.setFontSize(8);
  doc.line(x3, cursorY + 12, x3 + sigWidth, cursorY + 12);
  doc.text('Assinatura da Diretora', x3 + sigWidth / 2, cursorY + 16, { align: 'center' });
  doc.setFontSize(7);
  doc.text(schoolConfig.principalName, x3 + sigWidth / 2, cursorY + 20, { align: 'center' });

  const safeClassName = report.className.replace(/[^a-zA-Z0-9]/g, '_');
  const safeTeacherName = report.teacherName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Ficha_PreConselho_${safeClassName}_${safeTeacherName}.pdf`);
}
