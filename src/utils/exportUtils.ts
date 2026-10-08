import { jsPDF } from 'jspdf';
import { Report, QuestionItem, QuestionSection, SchoolConfig, Student } from '../types';

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

  // Official Page Footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Página ${i} de ${totalPages} • Documento Oficial do Pré-Conselho de Classe • ${schoolConfig.name}`,
      pageWidth / 2,
      pageHeight - margin + 2.5,
      { align: 'center' }
    );
  }

  const safeClassName = report.className.replace(/[^a-zA-Z0-9]/g, '_');
  const safeTeacherName = report.teacherName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Ficha_PreConselho_${safeClassName}_${safeTeacherName}.pdf`);
}

/**
 * Generates an official consolidated PDF report for a class containing all teachers' feedback
 */
export function exportConsolidatedClassToPDF(
  className: string,
  classReports: Report[],
  sections: QuestionSection[],
  questions: QuestionItem[],
  schoolConfig: SchoolConfig,
  classStudents?: Student[]
): void {
  if (!classReports || classReports.length === 0) {
    alert('Nenhum relatório encontrado para consolidar nesta turma.');
    return;
  }

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
    if (cursorY + requiredHeight > pageHeight - margin - 22) {
      doc.addPage();
      cursorY = margin;
      drawHeader(true);
    }
  }

  function drawHeader(isContinuation = false) {
    // School border
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.6);
    doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin - 4) * 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(schoolConfig.name, pageWidth / 2, cursorY + 4, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolConfig.subtitle, pageWidth / 2, cursorY + 8.5, { align: 'center' });

    cursorY += 13;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text(
      `ATA CONSOLIDADA - CONSELHO DE CLASSE (${className.toUpperCase()})` +
        (isContinuation ? ' (Continuação)' : ''),
      pageWidth / 2,
      cursorY,
      { align: 'center' }
    );

    cursorY += 5;
    doc.setLineWidth(0.4);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 4;
  }

  // Draw Initial Header
  drawHeader();

  // Summary box of teachers and subjects
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Turma: ${className}`, margin, cursorY + 3);
  doc.text(`Período / Bimestre: ${schoolConfig.period}`, pageWidth - margin - 50, cursorY + 3);

  cursorY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Docentes e Componentes Participantes:', margin, cursorY + 2);
  cursorY += 5;

  classReports.forEach((rep) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, cursorY, contentWidth, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${rep.subject || 'Geral'}:`, margin + 2, cursorY + 3.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`${rep.teacherName} (Enviado em: ${rep.date || 'Data não inf.'})`, margin + 45, cursorY + 3.8);
    cursorY += 6.5;
  });

  // Render Star Students & Class Roster if provided
  if (classStudents && classStudents.length > 0) {
    const starStudents = classStudents.filter((s) => s.isStar);
    if (starStudents.length > 0) {
      cursorY += 2;
      checkPageBreak(starStudents.length * 7 + 12);
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(margin, cursorY, contentWidth, 6, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(146, 64, 14);
      doc.text(`QUADRO DE HONRA - ESTUDANTES DESTAQUE (ALUNOS ESTRELA ⭐) [${starStudents.length}]`, margin + 2, cursorY + 4.2);
      cursorY += 7.5;

      starStudents.forEach((st) => {
        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        const catText = st.starCategory ? ` [${st.starCategory.toUpperCase()}]` : '';
        doc.text(`⭐ #${st.rollNumber} ${st.name}${catText}:`, margin + 2, cursorY + 3.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const reasonText = doc.splitTextToSize(st.starReason || 'Destaque no bimestre', contentWidth - 10);
        doc.text(reasonText, margin + 4, cursorY + 7);
        cursorY += 8 + (reasonText.length > 1 ? (reasonText.length - 1) * 3 : 0);
      });
      cursorY += 2;
    }

    // Nominal Roster Summary
    checkPageBreak(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Relação Nominal dos Estudantes (${classStudents.length} matriculados):`, margin, cursorY + 2);
    cursorY += 4.5;
    const namesList = classStudents.map((s) => `${s.rollNumber}. ${s.name}${s.isStar ? ' ⭐' : ''}`).join('  •  ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const splitNames = doc.splitTextToSize(namesList, contentWidth);
    doc.text(splitNames, margin, cursorY + 2);
    cursorY += splitNames.length * 3.2 + 3;
  }

  cursorY += 2;
  doc.setLineWidth(0.3);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 4;

  // Render Sections and Questions with consolidated teachers' answers
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  sortedSections.forEach((section) => {
    const sectionQuestions = questions
      .filter((q) => q.sectionId === section.id)
      .sort((a, b) => a.order - b.order);

    if (sectionQuestions.length === 0) return;

    checkPageBreak(16);

    // Section title
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(section.title, margin + 2, cursorY + 4.2);
    cursorY += 8;

    sectionQuestions.forEach((q) => {
      // Question Prompt
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      const promptLines = doc.splitTextToSize(`Quesito: ${q.prompt}`, contentWidth);
      checkPageBreak(promptLines.length * 4 + 10);

      doc.text(promptLines, margin, cursorY + 3);
      cursorY += promptLines.length * 3.8 + 2;

      // Render each teacher's answer for this question
      classReports.forEach((rep) => {
        const ans = rep.answers[q.id] || '(Sem apontamentos específicos)';
        const teacherTag = `${rep.subject || 'Componente'} (${rep.teacherName}): `;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(29, 78, 216);

        const answerLines = doc.splitTextToSize(`${teacherTag}${ans}`, contentWidth - 4);
        const boxHeight = Math.max(7, answerLines.length * 3.8 + 3);

        checkPageBreak(boxHeight + 2);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, cursorY, contentWidth, boxHeight, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(answerLines, margin + 2, cursorY + 3.8);

        cursorY += boxHeight + 2;
      });

      cursorY += 2;
    });

    cursorY += 3;
  });

  // Consolidated Council Signatures Block
  checkPageBreak(36);
  cursorY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  const sigWidth = (contentWidth - 10) / 2;

  // Pedagogue signature line
  const x1 = margin;
  doc.line(x1, cursorY + 12, x1 + sigWidth, cursorY + 12);
  doc.text('Coordenação Pedagógica', x1 + sigWidth / 2, cursorY + 16, { align: 'center' });
  doc.setFontSize(7);
  doc.text(schoolConfig.pedagogueName, x1 + sigWidth / 2, cursorY + 20, { align: 'center' });

  // Principal signature line
  const x2 = margin + sigWidth + 10;
  doc.setFontSize(8);
  doc.line(x2, cursorY + 12, x2 + sigWidth, cursorY + 12);
  doc.text('Direção Escolar', x2 + sigWidth / 2, cursorY + 16, { align: 'center' });
  doc.setFontSize(7);
  doc.text(schoolConfig.principalName, x2 + sigWidth / 2, cursorY + 20, { align: 'center' });

  // Official Page Footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Página ${i} de ${totalPages} • Ata Consolidada do Conselho de Classe (${className}) • ${schoolConfig.name}`,
      pageWidth / 2,
      pageHeight - margin + 2.5,
      { align: 'center' }
    );
  }

  const safeClassName = className.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Ata_Conselho_${safeClassName}_Consolidada.pdf`);
}
