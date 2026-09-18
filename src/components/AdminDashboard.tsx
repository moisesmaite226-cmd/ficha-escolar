import React, { useState } from 'react';
import {
  User,
  ClassGroup,
  Student,
  QuestionSection,
  QuestionItem,
  Report,
  SchoolConfig,
  PushNotification,
} from '../types';
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Search,
  Trash2,
  Eye,
  Plus,
  Edit2,
  Sliders,
  Send,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  Check,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  classes: ClassGroup[];
  students: Student[];
  sections: QuestionSection[];
  questions: QuestionItem[];
  reports: Report[];
  schoolConfig: SchoolConfig;
  notifications: PushNotification[];
  onAddQuestion: (q: Omit<QuestionItem, 'id' | 'order'>) => void;
  onUpdateQuestion: (id: string, updates: Partial<QuestionItem>) => void;
  onDeleteQuestion: (id: string) => void;
  onResetQuestions: () => void;
  onDeleteReport: (id: string) => void;
  onViewReportModal: (report: Report) => void;
  onExportExcel: (reportsToExport: Report[]) => void;
  onExportPDF: (report: Report) => void;
  onSendPushReminder: (title: string, message: string, targetTeacherId?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  classes,
  students,
  sections,
  questions,
  reports,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onResetQuestions,
  onDeleteReport,
  onViewReportModal,
  onExportExcel,
  onExportPDF,
  onSendPushReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'questionnaire' | 'notifications'>(
    'reports'
  );

  // Filters for reports table
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Questionnaire editor state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [newPrompt, setNewPrompt] = useState('');
  const [newSectionId, setNewSectionId] = useState(sections[0]?.id || 'sec-1');
  const [newType, setNewType] = useState<'textarea' | 'text' | 'choice'>('textarea');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newHelpText, setNewHelpText] = useState('');
  const [newRequired, setNewRequired] = useState(true);

  // Quick reminder feedback state
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);

  // Calculate Metrics
  const totalSubmitted = reports.filter((r) => r.status === 'submitted').length;
  const classesWithReports = new Set(
    reports.filter((r) => r.status === 'submitted').map((r) => r.classId)
  ).size;

  const activeTeachers = users.filter((u) => u.role === 'teacher');
  // Total expected reports across all teachers' assigned classes
  const totalExpectedReports = activeTeachers.reduce(
    (acc, t) => acc + (t.assignedClassIds ? t.assignedClassIds.length : 0),
    0
  );
  const pendingReportsCount = Math.max(0, totalExpectedReports - totalSubmitted);

  // Filtered reports
  const filteredReports = reports.filter((rep) => {
    if (filterClass !== 'all' && rep.classId !== filterClass) return false;
    if (filterTeacher !== 'all' && rep.teacherId !== filterTeacher) return false;
    if (filterStatus !== 'all' && rep.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeacher = rep.teacherName.toLowerCase().includes(q);
      const matchClass = rep.className.toLowerCase().includes(q);
      const matchSubject = (rep.subject || '').toLowerCase().includes(q);
      return matchTeacher || matchClass || matchSubject;
    }

    return true;
  });

  // Handle Add or Edit Question
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    if (editingQuestion) {
      onUpdateQuestion(editingQuestion.id, {
        prompt: newPrompt,
        sectionId: newSectionId,
        type: newType,
        placeholder: newPlaceholder,
        helpText: newHelpText,
        required: newRequired,
      });
      setEditingQuestion(null);
    } else {
      onAddQuestion({
        prompt: newPrompt,
        sectionId: newSectionId,
        type: newType,
        placeholder: newPlaceholder,
        helpText: newHelpText,
        required: newRequired,
      });
    }

    setShowAddQuestionModal(false);
    setNewPrompt('');
    setNewPlaceholder('');
    setNewHelpText('');
  };

  const startEditQuestion = (q: QuestionItem) => {
    setEditingQuestion(q);
    setNewPrompt(q.prompt);
    setNewSectionId(q.sectionId);
    setNewType(q.type === 'choice' ? 'choice' : q.type === 'text' ? 'text' : 'textarea');
    setNewPlaceholder(q.placeholder || '');
    setNewHelpText(q.helpText || '');
    setNewRequired(q.required);
    setShowAddQuestionModal(true);
  };

  // Quick Dispatch Reminder to Teachers with pending reports
  const handleTriggerPendingReminders = () => {
    onSendPushReminder(
      'Aviso Urgente: Pré-Conselho de Classe',
      'Prezado(a) professor(a), solicitamos a conclusão do preenchimento das fichas dos estudantes pendentes antes da reunião de conselho.',
      undefined
    );
    setReminderFeedback('Notificação enviada para todos os professores com pendências!');
    setTimeout(() => setReminderFeedback(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Title & Quick Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Painel da Coordenação Pedagógica
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5">
            Acompanhamento & Gestão do Pré-Conselho
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitore o envio dos relatórios, gerencie perguntas dinâmicas e envie
            lembretes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Relatórios & Pareceres</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('questionnaire')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'questionnaire'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Personalizar Perguntas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Lembretes Push</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB 1: REPORTS TABLE & METRICS
          ============================================================ */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Relatórios Enviados
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900">
                  {totalSubmitted}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Pareceres oficiais concluídos
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Turmas com Parecer
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900">
                  {classesWithReports} / {classes.length}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.round((classesWithReports / classes.length) * 100)}% das turmas
                  iniciadas
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Fichas Pendentes
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-amber-600">
                  {pendingReportsCount}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  de {totalExpectedReports} relatórios de turmas esperados
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">
                  Professores Ativos
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-slate-900">
                  {activeTeachers.length}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Responsáveis pelo conselho
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Export Toolbar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por turma, professor ou componente curricular..."
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Action Buttons: Export to Excel */}
              <div className="flex items-center gap-2.5 self-end lg:self-auto">
                <button
                  type="button"
                  onClick={() => onExportExcel(filteredReports)}
                  className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar para Excel (.csv)</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Filtrar por Turma:
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="all">Todas as Turmas ({classes.length})</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Filtrar por Professor:
                </label>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="all">Todos os Professores</option>
                  {activeTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Filtrar por Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="submitted">Enviados Oficialmente</option>
                  <option value="draft">Rascunhos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Reports */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Fichas de Turma Registradas ({filteredReports.length})
              </h3>
              <span className="text-xs text-slate-500">
                Exibindo relatórios de Pré-Conselho por turma
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Turma</th>
                    <th className="py-3.5 px-4">Componente Curricular</th>
                    <th className="py-3.5 px-4">Professor(a) Responsável</th>
                    <th className="py-3.5 px-4">Data de Envio</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-sm">
                          Nenhum relatório de turma encontrado
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tente redefinir os filtros ou buscar por outro termo.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => {
                      const isSubmitted = rep.status === 'submitted';
                      const formattedDate = rep.date
                        ? rep.date.split('-').reverse().join('/')
                        : '-';

                      return (
                        <tr
                          key={rep.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-4 sm:px-6 font-black text-slate-900 text-sm">
                            {rep.className}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {rep.subject || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {rep.teacherName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                            {formattedDate}
                          </td>
                          <td className="py-3.5 px-4">
                            {isSubmitted ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                                <Check className="w-3 h-3" /> Enviado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-[11px] text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-full">
                                <Clock className="w-3 h-3" /> Rascunho
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onViewReportModal(rep)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Visualizar Ficha Oficial da Turma"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onExportPDF(rep)}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Baixar PDF da Turma"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Excluir o relatório da turma ${rep.className} preenchido por ${rep.teacherName}?`
                                    )
                                  ) {
                                    onDeleteReport(rep.id);
                                  }
                                }}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Relatório"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: DYNAMIC QUESTIONNAIRE CUSTOMIZATION
          ============================================================ */}
      {activeTab === 'questionnaire' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Personalização Dinâmica do Formulário
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Adicione, altere enunciados ou remova perguntas do Pré-Conselho.
                As alterações são refletidas instantaneamente para todos os
                professores.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      'Deseja restaurar o questionário original da Escola Frei Graciano Droessler?'
                    )
                  ) {
                    onResetQuestions();
                  }
                }}
                className="py-2.5 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Perguntas Padrão</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setNewPrompt('');
                  setNewPlaceholder('');
                  setNewHelpText('');
                  setNewRequired(true);
                  setShowAddQuestionModal(true);
                }}
                className="py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Pergunta</span>
              </button>
            </div>
          </div>

          {/* List of Sections & Questions */}
          <div className="space-y-6">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((sec) => {
                const secQuestions = questions
                  .filter((q) => q.sectionId === sec.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <div
                    key={sec.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900">
                          {sec.title}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {secQuestions.length} perguntas nesta seção
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 p-2 sm:p-4">
                      {secQuestions.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">
                          Nenhuma pergunta cadastrada nesta seção.
                        </p>
                      ) : (
                        secQuestions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="p-4 hover:bg-slate-50/50 rounded-2xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                  {q.prompt}
                                </p>
                                {q.helpText && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    {q.helpText}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    Tipo: {q.type === 'textarea' ? 'Texto Longo' : 'Texto Curto'}
                                  </span>
                                  {q.required ? (
                                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                                      Obrigatória
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      Opcional
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditQuestion(q)}
                                className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                title="Editar Pergunta"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Deseja excluir esta pergunta do formulário?')) {
                                    onDeleteQuestion(q.id);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title="Excluir Pergunta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: PUSH NOTIFICATIONS & REMINDERS
          ============================================================ */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-blue-800/60 px-3 py-1 rounded-full border border-blue-600/30">
                Engajamento & Prazos
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-2">
                Lembretes Push de Envio Pendente
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
                Envie avisos automáticos e personalizados para alertar professores
                sobre fichas pendentes antes da data de reunião do conselho.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleTriggerPendingReminders}
                  className="py-3 px-5 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-blue-700" />
                  <span>Disparar Lembrete Geral de Pendências</span>
                </button>
              </div>

              {reminderFeedback && (
                <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{reminderFeedback}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pending Status by Teacher Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Status de Entrega por Professor
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTeachers.map((teacher) => {
                const teacherReports = reports.filter(
                  (r) => r.teacherId === teacher.id && r.status === 'submitted'
                );

                // calculate how many students this teacher is responsible for
                const teacherAssignedClasses = classes.filter((c) =>
                  teacher.assignedClassIds.includes(c.id)
                );
                const totalAssignedClasses = teacherAssignedClasses.length;

                const completedCount = teacherReports.filter(
                  (r) => r.status === 'submitted'
                ).length;
                const pendingCount = Math.max(0, totalAssignedClasses - completedCount);
                const percent =
                  totalAssignedClasses > 0
                    ? Math.round((completedCount / totalAssignedClasses) * 100)
                    : 0;

                return (
                  <div
                    key={teacher.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-black text-slate-900">
                            {teacher.name}
                          </h5>
                          <p className="text-xs text-slate-500">
                            {teacher.subject}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            pendingCount === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pendingCount === 0
                            ? '100% Concluído'
                            : `${pendingCount} Turmas Pendentes`}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-500">
                            Turmas: {teacherAssignedClasses.map((c) => c.name).join(', ')}
                          </span>
                          <span className="text-slate-800">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent === 100 ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {completedCount} de {totalAssignedClasses} turmas preenchidas
                      </span>
                      {pendingCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onSendPushReminder(
                              `Lembrete para ${teacher.name}`,
                              `Você possui ${pendingCount} relatórios de turmas pendentes para entrega do Pré-Conselho.`,
                              teacher.id
                            );
                            alert(`Lembrete enviado especificamente para ${teacher.name}!`);
                          }}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                        >
                          Notificar este Professor →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ADD / EDIT QUESTION MODAL
          ============================================================ */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta para o Formulário'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Personalize o questionário do Pré-Conselho de Classe:
            </p>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seção do Documento
                </label>
                <select
                  value={newSectionId}
                  onChange={(e) => setNewSectionId(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enunciado da Pergunta *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Ex: Como o estudante lida com tarefas em grupo e regras escolares?"
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto de Ajuda / Orientação Pedagógica
                </label>
                <input
                  type="text"
                  value={newHelpText}
                  onChange={(e) => setNewHelpText(e.target.value)}
                  placeholder="Ex: Observe a convivência e cooperação mútua."
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Resposta
                  </label>
                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(e.target.value as 'textarea' | 'text' | 'choice')
                    }
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="textarea">Texto Longo (Parecer)</option>
                    <option value="text">Texto Curto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Obrigatoriedade
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="required-checkbox"
                      checked={newRequired}
                      onChange={(e) => setNewRequired(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                    <label
                      htmlFor="required-checkbox"
                      className="text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Preenchimento Obrigatório
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingQuestion ? 'Salvar Alterações' : 'Adicionar Pergunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
