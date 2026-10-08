import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  ClassGroup,
  Student,
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
  Mic,
  MicOff,
  Lightbulb,
  Sparkles,
  AlertCircle,
  Radio,
  Star,
} from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { PhraseBankModal } from './PhraseBankModal';
import { StudentRosterPanel } from './StudentRosterPanel';
import { ClassRosterModal } from './ClassRosterModal';

interface TeacherDashboardProps {
  currentUser: User;
  classes: ClassGroup[];
  students?: Student[];
  sections: QuestionSection[];
  questions: QuestionItem[];
  reports: Report[];
  schoolConfig: SchoolConfig;
  onSaveReport: (
    report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Report;
  onViewReportModal: (report: Report) => void;
  onExportPDF: (report: Report) => void;
  onToggleStudentStar?: (
    studentId: string,
    details?: {
      isStar?: boolean;
      starCategory?: 'academic' | 'attitude' | 'improvement' | 'creativity';
      starReason?: string;
      starAddedBy?: string;
    }
  ) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  classes,
  students = [],
  sections,
  questions,
  reports,
  schoolConfig,
  onSaveReport,
  onViewReportModal,
  onExportPDF,
  onToggleStudentStar,
}) => {
  // Direct requested flow:
  // Step 1: select_class -> Step 2: fill_form
  const [currentStep, setCurrentStep] = useState<'select_class' | 'fill_form'>('select_class');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Student roster state & active question target
  const [rosterClassForModal, setRosterClassForModal] = useState<ClassGroup | null>(null);
  const [showRosterInForm, setShowRosterInForm] = useState(true);
  const [lastFocusedQuestionId, setLastFocusedQuestionId] = useState<string | null>(null);

  // Form State
  const [currentReportId, setCurrentReportId] = useState<string | undefined>(undefined);
  const [componenteSubject, setComponenteSubject] = useState(
    currentUser.subject || 'Componente Curricular'
  );
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reportPeriod, setReportPeriod] = useState<string>(
    schoolConfig.period || '1º Bimestre'
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draftSavedMessage, setDraftSavedMessage] = useState<string | null>(null);
  const [submissionSuccessModal, setSubmissionSuccessModal] = useState<Report | null>(null);

  // Auto-save state
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const isInitialLoad = useRef(true);

  // Font size accessibility mode for teachers
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'large' | 'extralarge'>('normal');

  // Phrase Bank Modal state
  const [activePhraseQuestion, setActivePhraseQuestion] = useState<QuestionItem | null>(null);

  // Voice Dictation (Web Speech API)
  const {
    isListening,
    activeTargetId,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition();

  // Filter only classes assigned to this teacher
  const teacherClasses = classes.filter((c) =>
    currentUser.assignedClassIds.includes(c.id)
  );

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Load existing report for this class and teacher
  useEffect(() => {
    if (!selectedClassId) return;

    isInitialLoad.current = true;
    const existingReport = reports.find(
      (r) => r.classId === selectedClassId && r.teacherId === currentUser.id
    );

    if (existingReport) {
      setCurrentReportId(existingReport.id);
      setComponenteSubject(existingReport.subject || currentUser.subject || '');
      setReportDate(existingReport.date || new Date().toISOString().split('T')[0]);
      setReportPeriod(existingReport.period || schoolConfig.period || '1º Bimestre');
      setAnswers({ ...existingReport.answers });
      if (existingReport.updatedAt) {
        const time = new Date(existingReport.updatedAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLastAutoSavedTime(time);
      }
    } else {
      setCurrentReportId(undefined);
      setComponenteSubject(currentUser.subject || 'Componente Curricular');
      setReportDate(new Date().toISOString().split('T')[0]);
      setReportPeriod(schoolConfig.period || '1º Bimestre');
      setAnswers({});
      setLastAutoSavedTime(null);
    }

    setTimeout(() => {
      isInitialLoad.current = false;
    }, 400);
  }, [selectedClassId, currentUser.id, reports, currentUser.subject, schoolConfig.period]);

  // Debounced Auto-Save in background
  useEffect(() => {
    if (isInitialLoad.current || currentStep !== 'fill_form' || !selectedClass) {
      return;
    }

    // Only auto-save if at least one question has been filled or subject customized
    const hasAnyContent = Object.values(answers).some((val) => typeof val === 'string' && val.trim().length > 0);
    if (!hasAnyContent) return;

    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      try {
        const saved = onSaveReport({
          id: currentReportId,
          classId: selectedClass.id,
          className: selectedClass.name,
          teacherId: currentUser.id,
          teacherName: currentUser.name,
          subject: componenteSubject,
          date: reportDate,
          period: reportPeriod,
          answers,
          status: 'draft',
        });
        setCurrentReportId(saved.id);
        const timeNow = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastAutoSavedTime(timeNow);
      } catch (err) {
        console.warn('Auto-save error:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [answers, componenteSubject, reportDate, reportPeriod, selectedClass, currentStep]);

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

  // Voice dictation toggle for a specific question
  const handleToggleVoiceDictation = (questionId: string) => {
    if (isListening && activeTargetId === questionId) {
      stopListening();
    } else {
      startListening(questionId, (transcriptChunk) => {
        setAnswers((prev) => {
          const currentText = prev[questionId] || '';
          const space = currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '';
          return {
            ...prev,
            [questionId]: currentText + space + transcriptChunk,
          };
        });
      });
    }
  };

  // Phrase bank insertion
  const handleInsertPhrase = (phrase: string, append: boolean) => {
    if (!activePhraseQuestion) return;
    const qId = activePhraseQuestion.id;

    setAnswers((prev) => {
      const currentText = prev[qId] || '';
      if (!append || !currentText.trim()) {
        return { ...prev, [qId]: phrase };
      }
      const separator = currentText.trim().endsWith('.') || currentText.trim().endsWith(';') ? ' ' : '. ';
      return {
        ...prev,
        [qId]: currentText.trim() + separator + phrase,
      };
    });
  };

  // Quick insertion of student name into question textarea
  const handleInsertStudentName = (studentName: string, targetQuestionId?: string) => {
    const qId = targetQuestionId || lastFocusedQuestionId || questions[0]?.id;
    if (!qId) return;

    setAnswers((prev) => {
      const currentText = prev[qId] || '';
      if (!currentText.trim()) {
        return { ...prev, [qId]: studentName };
      }
      if (currentText.includes(studentName)) {
        return prev;
      }
      const separator = currentText.trim().endsWith(',') || currentText.trim().endsWith(';') ? ' ' : ', ';
      return {
        ...prev,
        [qId]: currentText.trim() + separator + studentName,
      };
    });
  };

  // Save as Draft manually
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
      period: reportPeriod,
      answers,
      status: 'draft',
    });

    setCurrentReportId(saved.id);
    const timeNow = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setLastAutoSavedTime(timeNow);
    setDraftSavedMessage('Rascunho salvo com sucesso no sistema!');
    setTimeout(() => setDraftSavedMessage(null), 3500);
  };

  // Submit Final Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    if (isListening) {
      stopListening();
    }

    const saved = onSaveReport({
      id: currentReportId,
      classId: selectedClass.id,
      className: selectedClass.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      subject: componenteSubject,
      date: reportDate,
      period: reportPeriod,
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
      <div className="mb-8 bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-medium mb-2">
            <span>Espaço do Docente</span>
            <span aria-hidden="true">·</span>
            <span>{schoolConfig.period}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Olá, {currentUser.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">
            {currentUser.subject} — Preenchimento do parecer descritivo de cada turma para o Pré-Conselho de Classe.
          </p>

          {/* Clean Segmented Step Guide */}
          <div className="mt-5 inline-flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-xl text-xs border border-slate-700/60">
            <button
              type="button"
              onClick={() => setCurrentStep('select_class')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                currentStep === 'select_class'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              1. Selecionar Turma
            </button>
            <span className="text-slate-500">/</span>
            <span
              className={`px-3 py-1.5 rounded-lg font-medium ${
                currentStep === 'fill_form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400'
              }`}
            >
              2. Preencher Relatório & Enviar
            </span>
          </div>
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
              const clsStudents = students.filter((s) => s.classId === cls.id);
              const clsStarCount = clsStudents.filter((s) => s.isStar).length;

              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between ${
                    isSubmitted
                      ? 'border-emerald-200'
                      : isDraft
                      ? 'border-amber-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <span>{cls.shift}</span>
                          <span aria-hidden="true">·</span>
                          <span>{cls.grade}</span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mt-1">
                          {cls.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500 tabular-nums">
                            {clsStudents.length > 0 ? clsStudents.length : cls.studentCount} estudantes
                          </span>
                          {clsStarCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/80">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                              <span>{clsStarCount} Aluno{clsStarCount > 1 ? 's' : ''} Estrela ⭐</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status indicator */}
                      {isSubmitted ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Entregue</span>
                        </div>
                      ) : isDraft ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Rascunho</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">
                          Pendente
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-5 text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-500">Componente:</span>
                        <strong className="text-slate-900 font-semibold">
                          {currentUser.subject}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-500">Situação:</span>
                        <span
                          className={`font-semibold ${
                            isSubmitted
                              ? 'text-emerald-700'
                              : isDraft
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {isSubmitted
                            ? `Entregue em ${classReport?.date.split('-').reverse().join('/')}`
                            : isDraft
                            ? 'Rascunho em andamento'
                            : 'Aguardando preenchimento'}
                        </span>
                      </div>
                    </div>

                    {/* Alunos desta Turma */}
                    <div className="mb-4 p-3 bg-slate-50/90 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>Alunos da Turma ({clsStudents.length}):</span>
                        </span>
                        {clsStarCount > 0 ? (
                          <span className="text-amber-900 font-bold flex items-center gap-1 text-[11px]">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{clsStarCount} Estrela{clsStarCount > 1 ? 's' : ''} ⭐</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-[10px]">
                            Nenhum destaque
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-0.5">
                        {clsStudents.map((st) => (
                          <span
                            key={st.id}
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${
                              st.isStar
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {st.isStar && <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />}
                            <span>#{st.rollNumber} {st.name.split(' ')[0]} {st.name.split(' ')[1] || ''}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRosterClassForModal(cls)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                      title="Ver relação completa de alunos desta turma"
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">Ver Alunos ({clsStudents.length})</span>
                    </button>

                    {isSubmitted && classReport && (
                      <button
                        type="button"
                        onClick={() => onViewReportModal(classReport)}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="Visualizar Ficha"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      id={`open-class-${cls.id}`}
                      type="button"
                      onClick={() => handleSelectClass(cls.id)}
                      className={`flex-1 py-2.5 px-4 font-semibold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSubmitted
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>
                        {isSubmitted
                          ? 'Revisar Parecer da Turma'
                          : isDraft
                          ? 'Continuar Preenchimento'
                          : 'Preencher Parecer da Turma'}
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
          {/* Speech Error Banner if any */}
          {speechError && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-amber-900 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={clearSpeechError}
                className="font-bold underline text-amber-800 hover:text-amber-950 ml-3 text-xs cursor-pointer"
              >
                Entendi
              </button>
            </div>
          )}

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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Relatório do Pré-Conselho de Classe
                  </span>
                  {/* Real-time Auto-save status */}
                  {isAutoSaving ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md animate-pulse">
                      <Clock className="w-3 h-3" /> Salvando...
                    </span>
                  ) : lastAutoSavedTime ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Salvo às {lastAutoSavedTime}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Turma: {selectedClass.name} ({selectedClass.shift})
                </h3>
              </div>
            </div>

            {/* Actions: Save Draft, Preview and Submit */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const currentDraftReport: Report = {
                    id: currentReportId || 'preview-draft',
                    classId: selectedClass.id,
                    className: selectedClass.name,
                    teacherId: currentUser.id,
                    teacherName: currentUser.name,
                    subject: componenteSubject,
                    date: reportDate,
                    period: reportPeriod,
                    answers,
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  onViewReportModal(currentDraftReport);
                }}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Visualizar formato oficial de impressão"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Pré-visualizar Ficha</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Salvar Rascunho</span>
              </button>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Concluir e Enviar Ficha</span>
              </button>
            </div>
          </div>

          {/* Progress and Accessibility Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Progresso dos Quesitos:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                    answeredCount === totalQuestionsCount
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {answeredCount} de {totalQuestionsCount} preenchidos (
                  {totalQuestionsCount > 0
                    ? Math.round((answeredCount / totalQuestionsCount) * 100)
                    : 0}
                  %)
                </span>
                {answeredCount === totalQuestionsCount && (
                  <span className="text-emerald-700 font-bold hidden md:inline">
                    🎉 Todas as perguntas respondidas!
                  </span>
                )}
              </div>

              {/* Font Sizing Accessibility Control */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 px-2 py-1 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">
                  Tamanho da Letra:
                </span>
                <button
                  type="button"
                  onClick={() => setFontSizeMode('normal')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    fontSizeMode === 'normal'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tamanho Normal"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeMode('large')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    fontSizeMode === 'large'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Letra Maior"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizeMode('extralarge')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    fontSizeMode === 'extralarge'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Letra Extra Grande"
                >
                  A++
                </button>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  answeredCount === totalQuestionsCount
                    ? 'bg-emerald-500'
                    : 'bg-blue-600'
                }`}
                style={{
                  width: `${
                    totalQuestionsCount > 0
                      ? (answeredCount / totalQuestionsCount) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Draft Notification Toast if manually clicked */}
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

            {/* Header Metadata Inputs (Componente, Professor, Turma, Data, Bimestre) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
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
                  Período / Bimestre:
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="1º Bimestre">1º Bimestre</option>
                  <option value="2º Bimestre">2º Bimestre</option>
                  <option value="3º Bimestre">3º Bimestre</option>
                  <option value="4º Bimestre">4º Bimestre</option>
                </select>
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

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Ficha Geral da Turma: <strong>{selectedClass.name}</strong> • {reportPeriod}
              </span>
              <span>
                {answeredCount} de {totalQuestionsCount} quesitos preenchidos
              </span>
            </div>
          </div>

          {/* Relação Nominal Completa da Turma com Alunos Estrela ⭐ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Relação de Alunos: {selectedClass.name}
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                  ({students.filter((s) => s.classId === selectedClass.id).length} estudantes)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowRosterInForm(!showRosterInForm)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1"
              >
                <span>{showRosterInForm ? 'Ocultar Relação' : 'Exibir Relação Completa'}</span>
              </button>
            </div>

            {showRosterInForm && (
              <StudentRosterPanel
                classGroup={selectedClass}
                students={students}
                currentTeacherName={currentUser.name}
                onToggleStar={onToggleStudentStar || (() => {})}
                onInsertStudentToQuestion={(name) => handleInsertStudentName(name, lastFocusedQuestionId || undefined)}
              />
            )}
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
                        const isThisListening = isListening && activeTargetId === q.id;
                        const isStarQuestion = q.prompt.toLowerCase().includes('destac') || q.id === 'q-5';
                        const isStudentRelated =
                          isStarQuestion ||
                          q.prompt.toLowerCase().includes('estudante') ||
                          q.prompt.toLowerCase().includes('aluno') ||
                          q.id === 'q-4' ||
                          q.id === 'q-6' ||
                          q.id === 'q-9';
                        const classStudents = students.filter((s) => s.classId === selectedClass.id);

                        return (
                          <div key={q.id} className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label className="block text-xs sm:text-sm font-bold text-slate-800 leading-snug flex-1">
                                {q.prompt}{' '}
                                {q.required && (
                                  <span className="text-red-500 font-bold">*</span>
                                )}
                              </label>

                              {/* Action Tools for Teacher: Voice Dictation & Pedagogical Phrase Bank */}
                              {q.type === 'textarea' && (
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Speech to Text Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleVoiceDictation(q.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                      isThisListening
                                        ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                    }`}
                                    title={
                                      isThisListening
                                        ? 'Clique para concluir o ditado'
                                        : 'Falar ao microfone para ditar parecer por voz'
                                    }
                                  >
                                    {isThisListening ? (
                                      <>
                                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                        <span>Gravando voz (Parar)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Mic className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Falar Parecer</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Phrase Bank Suggestion Button */}
                                  <button
                                    type="button"
                                    onClick={() => setActivePhraseQuestion(q)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    title="Inserir parecer pedagógico sugerido"
                                  >
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Sugestões</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Quick Student Chip Selector */}
                            {isStudentRelated && classStudents.length > 0 && (
                              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 animate-in fade-in">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                                  <span className="flex items-center gap-1.5">
                                    {isStarQuestion ? (
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                    ) : (
                                      <Users className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                    <span>
                                      {isStarQuestion
                                        ? 'Alunos da Turma (clique para inserir e conceder Estrela ⭐):'
                                        : 'Alunos da Turma (clique para inserir o nome na resposta):'}
                                    </span>
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {classStudents.length} matriculados
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-0.5">
                                  {classStudents.map((st) => (
                                    <button
                                      key={st.id}
                                      type="button"
                                      onClick={() => {
                                        handleInsertStudentName(st.name, q.id);
                                        if (isStarQuestion && !st.isStar && onToggleStudentStar) {
                                          onToggleStudentStar(st.id, {
                                            isStar: true,
                                            starAddedBy: currentUser.name,
                                            starCategory: 'academic',
                                            starReason: 'Destaque positivo apontado no parecer docente.',
                                          });
                                        }
                                      }}
                                      className={`py-1 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                                        st.isStar
                                          ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold hover:bg-amber-200 shadow-2xs'
                                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                                      }`}
                                      title={
                                        st.isStar
                                          ? `Aluno Estrela ⭐: ${st.starReason || 'Destaque'}`
                                          : `Inserir nome de ${st.name}`
                                      }
                                    >
                                      {st.isStar && (
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-600 shrink-0" />
                                      )}
                                      <span>#{st.rollNumber} {st.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {q.helpText && (
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{q.helpText}</span>
                              </p>
                            )}

                            {q.type === 'textarea' ? (
                              <div className="space-y-1.5">
                                <div className="relative">
                                  <textarea
                                    rows={4}
                                    required={q.required}
                                    value={val}
                                    onFocus={() => setLastFocusedQuestionId(q.id)}
                                    onChange={(e) =>
                                      handleAnswerChange(q.id, e.target.value)
                                    }
                                    placeholder={
                                      isThisListening
                                        ? '🎙️ Fale agora... O texto será digitado automaticamente aqui.'
                                        : q.placeholder ||
                                          'Digite as observações sobre a turma (ou use o botão "Falar Parecer")...'
                                    }
                                    className={`w-full rounded-2xl border p-3.5 transition-all leading-relaxed ${
                                      fontSizeMode === 'extralarge'
                                        ? 'text-base sm:text-lg font-medium'
                                        : fontSizeMode === 'large'
                                        ? 'text-sm sm:text-base'
                                        : 'text-xs sm:text-sm'
                                    } ${
                                      isThisListening
                                        ? 'border-red-500 bg-red-50/30 ring-2 ring-red-200'
                                        : 'border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none'
                                    }`}
                                  />
                                  {isThisListening && (
                                    <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-white/90 px-2 py-0.5 rounded-lg border border-red-200 shadow-xs">
                                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                                      <span>Ditado ativo</span>
                                    </div>
                                  )}
                                </div>

                                {/* Text feedback: Word & Character count + Quick clear */}
                                <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                                  <span>
                                    {val.trim() ? val.trim().split(/\s+/).length : 0} palavras • {val.length} caracteres
                                  </span>
                                  {val.trim().length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm('Deseja limpar este parecer?')) {
                                          handleAnswerChange(q.id, '');
                                        }
                                      }}
                                      className="text-slate-400 hover:text-red-500 hover:underline cursor-pointer"
                                    >
                                      Limpar campo
                                    </button>
                                  )}
                                </div>
                              </div>
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

      {/* Phrase Bank Modal */}
      <PhraseBankModal
        isOpen={activePhraseQuestion !== null}
        onClose={() => setActivePhraseQuestion(null)}
        questionPrompt={activePhraseQuestion?.prompt}
        onSelectPhrase={handleInsertPhrase}
      />

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

      {/* Class Roster Modal (from Step 1 preview) */}
      <ClassRosterModal
        classGroup={rosterClassForModal}
        students={students}
        currentTeacherName={currentUser.name}
        onClose={() => setRosterClassForModal(null)}
        onToggleStar={onToggleStudentStar || (() => {})}
      />
    </div>
  );
};
