import React, { useState, useEffect } from 'react';
import {
  User,
  ClassGroup,
  QuestionSection,
  QuestionItem,
  Report,
  SchoolConfig,
} from '../types';
import {
  Users,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Save,
  FileText,
  FileCheck,
  HelpCircle,
  Eye,
  Download,
  Calendar,
  BookOpen,
} from 'lucide-react';

interface TeacherDashboardProps {
  currentUser: User;
  classes: ClassGroup[];
  students?: any[];
  sections: QuestionSection[];
  questions: QuestionItem[];
  reports: Report[];
  schoolConfig: SchoolConfig;
  onSaveReport: (
    report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Report;
  onViewReportModal: (report: Report) => void;
  onExportPDF: (report: Report) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  classes,
  sections,
  questions,
  reports,
  schoolConfig,
  onSaveReport,
  onViewReportModal,
  onExportPDF,
}) => {
  // Direct requested flow:
  // Step 1: select_class -> Step 2: fill_form
  const [currentStep, setCurrentStep] = useState<'select_class' | 'fill_form'>('select_class');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Form State
  const [currentReportId, setCurrentReportId] = useState<string | undefined>(undefined);
  const [componenteSubject, setComponenteSubject] = useState(
    currentUser.subject || 'Componente Curricular'
  );
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draftSavedMessage, setDraftSavedMessage] = useState<string | null>(null);
  const [submissionSuccessModal, setSubmissionSuccessModal] = useState<Report | null>(null);

  // Filter only classes assigned to this teacher
  const teacherClasses = classes.filter((c) =>
    currentUser.assignedClassIds.includes(c.id)
  );

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Load existing report for this class and teacher
  useEffect(() => {
    if (!selectedClassId) return;

    const existingReport = reports.find(
      (r) => r.classId === selectedClassId && r.teacherId === currentUser.id
    );

    if (existingReport) {
      setCurrentReportId(existingReport.id);
      setComponenteSubject(existingReport.subject || currentUser.subject || '');
      setReportDate(existingReport.date || new Date().toISOString().split('T')[0]);
      setAnswers({ ...existingReport.answers });
    } else {
      setCurrentReportId(undefined);
      setComponenteSubject(currentUser.subject || 'Componente Curricular');
      setReportDate(new Date().toISOString().split('T')[0]);
      setAnswers({});
    }
  }, [selectedClassId, currentUser.id, reports, currentUser.subject]);

  // Handler for class select
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentStep('fill_form');
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Save as Draft
  const handleSaveDraft = () => {
    if (!selectedClass) return;

    const saved = onSaveReport({
      id: currentReportId,
      classId: selectedClass.id,
      className: selectedClass.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      subject: componenteSubject,
      date: reportDate,
      answers,
      status: 'draft',
    });

    setCurrentReportId(saved.id);
    setDraftSavedMessage('Rascunho salvo com sucesso!');
    setTimeout(() => setDraftSavedMessage(null), 3000);
  };

  // Submit Final Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    const saved = onSaveReport({
      id: currentReportId,
      classId: selectedClass.id,
      className: selectedClass.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      subject: componenteSubject,
      date: reportDate,
      answers,
      status: 'submitted',
    });

    setSubmissionSuccessModal(saved);
  };

  // Count answered questions
  const totalQuestionsCount = questions.length;
  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id].trim().length > 0
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Teacher Welcome Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-600/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-3 border border-blue-400/30">
            <Users className="w-3.5 h-3.5" />
            <span>Espaço do Professor(a)</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
            Olá, {currentUser.name}
          </h2>
          <p className="text-sm text-blue-100 mt-1 leading-relaxed">
            {currentUser.subject} • Preenchimento do relatório geral de cada
            turma para o Pré-Conselho de Classe.
          </p>

          {/* Simple step guide */}
          <div className="mt-5 flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setCurrentStep('select_class')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentStep === 'select_class'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'bg-blue-900/50 text-blue-200 hover:bg-blue-900/80'
              }`}
            >
              1. Escolher Turma
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
            <span
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 ${
                currentStep === 'fill_form'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-400/70'
              }`}
            >
              2. Preencher Relatório da Turma & Enviar
            </span>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-4 -bottom-8 opacity-10 pointer-events-none hidden md:block">
          <FileCheck className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* ============================================================
          STEP 1: SELECT CLASS (ONE REPORT PER CLASS)
          ============================================================ */}
      {currentStep === 'select_class' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Suas Turmas Atribuídas
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Cada turma possui 1 relatório de Pré-Conselho. Escolha a turma
                para preencher ou revisar:
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start">
              {teacherClasses.length}{' '}
              {teacherClasses.length === 1 ? 'Turma atribuída' : 'Turmas atribuídas'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teacherClasses.map((cls) => {
              const classReport = reports.find(
                (r) => r.classId === cls.id && r.teacherId === currentUser.id
              );
              const isSubmitted = classReport?.status === 'submitted';
              const isDraft = classReport?.status === 'draft';

              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    isSubmitted
                      ? 'border-emerald-200/90 hover:border-emerald-300'
                      : isDraft
                      ? 'border-amber-200/90 hover:border-amber-300'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          {cls.shift} • {cls.grade}
                        </span>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">
                          {cls.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {cls.studentCount} estudantes matriculados
                        </p>
                      </div>

                      {/* Status pill */}
                      {isSubmitted ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Enviado</span>
                        </div>
                      ) : isDraft ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-full">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Rascunho Salvo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                          <span>Pendente</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5 text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Componente:</span>
                        <strong className="text-slate-900">
                          {currentUser.subject}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Situação da Ficha:</span>
                        <span
                          className={`font-bold ${
                            isSubmitted
                              ? 'text-emerald-700'
                              : isDraft
                              ? 'text-amber-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {isSubmitted
                            ? `Entregue em ${classReport?.date.split('-').reverse().join('/')}`
                            : isDraft
                            ? 'Em andamento (Rascunho)'
                            : 'Aguardando preenchimento'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSubmitted && classReport && (
                      <button
                        type="button"
                        onClick={() => onViewReportModal(classReport)}
                        className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                        title="Visualizar Ficha"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      id={`open-class-${cls.id}`}
                      type="button"
                      onClick={() => handleSelectClass(cls.id)}
                      className={`flex-1 py-3.5 px-4 font-bold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSubmitted
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          : 'bg-blue-700 hover:bg-blue-800 text-white'
                      }`}
                    >
                      <span>
                        {isSubmitted
                          ? 'Revisar / Editar Ficha da Turma'
                          : isDraft
                          ? 'Continuar Preenchimento'
                          : 'Preencher Ficha da Turma'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          STEP 2: DIGITAL CLASS REPORT (Direct 1 report per class)
          ============================================================ */}
      {currentStep === 'fill_form' && selectedClass && (
        <form onSubmit={handleSubmitReport} className="space-y-6">
          {/* Top Bar with Back, Progress and Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-20 z-20">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCurrentStep('select_class')}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Voltar para a Lista de Turmas"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Relatório do Pré-Conselho de Classe
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Turma: {selectedClass.name} ({selectedClass.shift})
                </h3>
              </div>
            </div>

            {/* Actions: Save Draft and Submit */}
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Salvar Rascunho</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Concluir e Enviar Ficha</span>
              </button>
            </div>
          </div>

          {/* Draft Notification Toast if saved */}
          {draftSavedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{draftSavedMessage}</span>
            </div>
          )}

          {/* Document Header Box (matching official paper sheet) */}
          <div className="bg-white rounded-3xl border-2 border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="text-center border-b pb-4 mb-6 border-slate-200">
              <h4 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                {schoolConfig.name}
              </h4>
              <p className="text-xs font-semibold text-slate-600">
                {schoolConfig.subtitle}
              </p>
              <h5 className="text-base sm:text-lg font-black text-blue-900 mt-2">
                {schoolConfig.documentTitle}
              </h5>
            </div>

            {/* Header Metadata Inputs (Componente, Professor, Turma, Data) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Componente:
                </label>
                <input
                  type="text"
                  required
                  value={componenteSubject}
                  onChange={(e) => setComponenteSubject(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Professor(a):
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentUser.name}
                  className="w-full text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-100 text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Turma:
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedClass.name}
                  className="w-full text-xs sm:text-sm font-semibold rounded-lg border border-slate-200 px-3 py-1.5 bg-slate-100 text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Data:
                </label>
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Ficha Geral da Turma: <strong>{selectedClass.name}</strong>
              </span>
              <span>
                {answeredCount} de {totalQuestionsCount} quesitos preenchidos
              </span>
            </div>
          </div>

          {/* Render Sections & Questions */}
          <div className="space-y-6">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const sectionQuestions = questions
                  .filter((q) => q.sectionId === section.id)
                  .sort((a, b) => a.order - b.order);

                if (sectionQuestions.length === 0) return null;

                return (
                  <div
                    key={section.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8"
                  >
                    <div className="border-b border-slate-200 pb-3 mb-6">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
                        {section.title}
                      </h4>
                    </div>

                    <div className="space-y-6">
                      {sectionQuestions.map((q) => {
                        const val = answers[q.id] || '';
                        return (
                          <div key={q.id} className="space-y-2">
                            <label className="block text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                              {q.prompt}{' '}
                              {q.required && (
                                <span className="text-red-500 font-bold">*</span>
                              )}
                            </label>

                            {q.helpText && (
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{q.helpText}</span>
                              </p>
                            )}

                            {q.type === 'textarea' ? (
                              <textarea
                                rows={4}
                                required={q.required}
                                value={val}
                                onChange={(e) =>
                                  handleAnswerChange(q.id, e.target.value)
                                }
                                placeholder={
                                  q.placeholder ||
                                  'Digite as observações sobre a turma...'
                                }
                                className="w-full text-xs sm:text-sm rounded-2xl border border-slate-300 p-3.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors leading-relaxed"
                              />
                            ) : q.type === 'choice' && q.options ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                {q.options.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, opt)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-colors cursor-pointer ${
                                      val === opt
                                        ? 'bg-blue-700 text-white border-blue-700'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <input
                                type="text"
                                required={q.required}
                                value={val}
                                onChange={(e) =>
                                  handleAnswerChange(q.id, e.target.value)
                                }
                                placeholder={q.placeholder || 'Digite a resposta...'}
                                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Bottom Action Footer */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Pronto para enviar o relatório da turma?
              </p>
              <p className="text-xs text-slate-500">
                O envio registrará seu nome ({currentUser.name}) e a data de
                entrega automaticamente.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none py-3 px-5 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Salvar Rascunho</span>
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none py-3.5 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Relatório Oficial</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================
          SUBMISSION SUCCESS MODAL
          ============================================================ */}
      {submissionSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Relatório Registrado!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              A ficha de Pré-Conselho da turma{' '}
              <strong>{submissionSuccessModal.className}</strong> foi enviada com
              sucesso por <strong>{submissionSuccessModal.teacherName}</strong>.
            </p>

            <div className="my-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <div>
                Turma: <strong>{submissionSuccessModal.className}</strong>
              </div>
              <div>
                Componente: <strong>{submissionSuccessModal.subject}</strong>
              </div>
              <div>
                Data do Registro: <strong>{submissionSuccessModal.date}</strong>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onExportPDF(submissionSuccessModal);
                }}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF Oficial desta Ficha</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccessModal(null);
                  setCurrentStep('select_class');
                }}
                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Voltar para Minhas Turmas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
