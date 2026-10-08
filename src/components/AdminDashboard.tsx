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
  Settings,
  Database,
  Upload,
  Calendar,
  Building2,
  FolderPlus,
  Printer,
  Sparkles,
  Maximize2,
  Minimize2,
  UserPlus,
  Star,
} from 'lucide-react';
import { exportAllDataAsBackup } from '../services/storage';
import { StudentRosterPanel } from './StudentRosterPanel';

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
  onExportConsolidatedPDF?: (className: string, classReports: Report[], classStudents?: Student[]) => void;
  onSendPushReminder: (title: string, message: string, targetTeacherId?: string) => void;
  onSaveSchoolConfig?: (config: SchoolConfig) => void;
  onAddClass?: (cls: Omit<ClassGroup, 'id'>) => void;
  onDeleteClass?: (classId: string) => void;
  onAddUser?: (user: Omit<User, 'id'>) => void;
  onUpdateUser?: (id: string, updates: Partial<User>) => void;
  onDeleteUser?: (id: string) => void;
  onRestoreBackup?: (backup: any) => void;
  onToggleStudentStar?: (
    studentId: string,
    details?: {
      isStar?: boolean;
      starCategory?: 'academic' | 'attitude' | 'improvement' | 'creativity';
      starReason?: string;
      starAddedBy?: string;
    }
  ) => void;
  onAddStudent?: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  classes,
  students,
  sections,
  questions,
  reports,
  schoolConfig,
  notifications,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onResetQuestions,
  onDeleteReport,
  onViewReportModal,
  onExportExcel,
  onExportPDF,
  onExportConsolidatedPDF,
  onSendPushReminder,
  onSaveSchoolConfig,
  onAddClass,
  onDeleteClass,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onRestoreBackup,
  onToggleStudentStar,
  onAddStudent,
  onDeleteStudent,
}) => {
  const [activeTab, setActiveTab] = useState<
    'reports' | 'consolidated' | 'students' | 'questionnaire' | 'notifications' | 'school_backup'
  >('reports');

  // Selected class for students tab
  const [selectedStudentTabClassId, setSelectedStudentTabClassId] = useState<string>(
    classes[0]?.id || ''
  );

  // Filters for reports table
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Consolidated class report tab state
  const [selectedConsolidatedClassId, setSelectedConsolidatedClassId] = useState<string>(
    classes[0]?.id || ''
  );

  // School config form state
  const [schoolName, setSchoolName] = useState(schoolConfig.name);
  const [schoolSubtitle, setSchoolSubtitle] = useState(schoolConfig.subtitle);
  const [schoolDocTitle, setSchoolDocTitle] = useState(schoolConfig.documentTitle);
  const [schoolPeriod, setSchoolPeriod] = useState(schoolConfig.period);
  const [pedagogueName, setPedagogueName] = useState(schoolConfig.pedagogueName);
  const [principalName, setPrincipalName] = useState(schoolConfig.principalName);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // New Class Modal State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassShift, setNewClassShift] = useState('Integral');
  const [newClassGrade, setNewClassGrade] = useState('6º Ano');
  const [newClassStudents, setNewClassStudents] = useState<number>(25);

  // Presentation Mode for Data-Show Projection during Council Meeting
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Teacher Management State
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('');
  const [newTeacherClasses, setNewTeacherClasses] = useState<string[]>([]);

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
    if (filterPeriod !== 'all' && rep.period && rep.period !== filterPeriod) return false;

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

  // Handle Save School Configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveSchoolConfig) {
      onSaveSchoolConfig({
        name: schoolName,
        subtitle: schoolSubtitle,
        documentTitle: schoolDocTitle,
        period: schoolPeriod,
        pedagogueName,
        principalName,
      });
      setConfigSavedToast(true);
      setTimeout(() => setConfigSavedToast(false), 3000);
    }
  };

  // Handle Add Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !onAddClass) return;

    onAddClass({
      name: newClassName.trim(),
      grade: newClassGrade,
      shift: newClassShift,
      studentCount: Number(newClassStudents) || 20,
    });

    setNewClassName('');
    setShowAddClassModal(false);
  };

  // Handle Add Teacher
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !onAddUser) return;

    const cleanUsername = newTeacherName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.');

    onAddUser({
      name: newTeacherName.trim(),
      role: 'teacher',
      username: cleanUsername,
      email: `${cleanUsername}@escola.gov.br`,
      subject: newTeacherSubject.trim() || 'Multidisciplinar',
      assignedClassIds: newTeacherClasses.length > 0 ? newTeacherClasses : classes.map((c) => c.id),
    });

    setNewTeacherName('');
    setNewTeacherSubject('');
    setNewTeacherClasses([]);
    setShowAddTeacherModal(false);
  };

  // Download System JSON Backup
  const handleDownloadBackup = () => {
    const backup = exportAllDataAsBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Pre_Conselho_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleFileUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (onRestoreBackup) {
          onRestoreBackup(parsed);
        }
      } catch (err) {
        alert('O arquivo selecionado não é um arquivo JSON de backup válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  // Consolidated class calculation
  const currentConsolidatedClass = classes.find((c) => c.id === selectedConsolidatedClassId);
  const consolidatedReports = reports.filter(
    (r) => r.classId === selectedConsolidatedClassId && r.status === 'submitted'
  );
  const teachersForConsolidatedClass = activeTeachers.filter((t) =>
    t.assignedClassIds?.includes(selectedConsolidatedClassId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Title & Quick Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Coordenação Pedagógica</span>
            <span aria-hidden="true">·</span>
            <span>{schoolConfig.period}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Acompanhamento & Gestão do Pré-Conselho
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitore o envio dos pareceres, visualize atas consolidadas por turma, gerencie perguntas e backups.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Relatórios da Escola</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consolidated')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'consolidated'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Ata Consolidada por Turma</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Turmas & Alunos ⭐</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('questionnaire')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'questionnaire'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>Perguntas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4 text-slate-500" />
            <span>Lembretes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('school_backup')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'school_backup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Escola & Backup</span>
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Relatórios Enviados
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                  {totalSubmitted}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Pareceres oficiais concluídos
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Turmas com Parecer
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                  {classesWithReports} / {classes.length}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {classes.length > 0 ? Math.round((classesWithReports / classes.length) * 100) : 0}% das turmas
                  iniciadas
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Fichas Pendentes
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono tabular-nums">
                  {pendingReportsCount}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  de {totalExpectedReports} relatórios de turmas esperados
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Professores Ativos
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
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
                  Filtrar por Bimestre:
                </label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="all">Todos os Bimestres</option>
                  <option value="1º Bimestre">1º Bimestre</option>
                  <option value="2º Bimestre">2º Bimestre</option>
                  <option value="3º Bimestre">3º Bimestre</option>
                  <option value="4º Bimestre">4º Bimestre</option>
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

          {/* When a specific Class is selected in the filter: display all students of that class */}
          {filterClass !== 'all' && (() => {
            const selectedCls = classes.find((c) => c.id === filterClass);
            if (!selectedCls) return null;
            const clsStudents = students
              .filter((s) => s.classId === selectedCls.id)
              .sort((a, b) => a.rollNumber - b.rollNumber);
            const starCount = clsStudents.filter((s) => s.isStar).length;

            return (
              <div className="bg-white rounded-3xl border border-blue-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                      <Users className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">
                          Relação de Alunos: {selectedCls.name}
                        </h4>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          {clsStudents.length} matriculados
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Turno {selectedCls.shift} • {selectedCls.grade} — Clique na estrela ⭐ para conceder ou alterar o destaque
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {starCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs shadow-2xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>{starCount} Aluno{starCount > 1 ? 's' : ''} Estrela ⭐</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-slate-300" />
                        Nenhum destaque atribuído ainda
                      </span>
                    )}
                  </div>
                </div>

                {/* List of all students in this class */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {clsStudents.map((st) => (
                    <div
                      key={st.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                        st.isStar
                          ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {String(st.rollNumber).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate" title={st.name}>
                          {st.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onToggleStudentStar &&
                          onToggleStudentStar(st.id, {
                            isStar: !st.isStar,
                            starAddedBy: currentUser.name,
                            starReason: !st.isStar ? 'Destaque acadêmico e participativo reconhecido pela coordenação' : undefined,
                          })
                        }
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                          st.isStar
                            ? 'text-amber-500 hover:bg-amber-100'
                            : 'text-slate-300 hover:text-amber-400 hover:bg-slate-200/60'
                        }`}
                        title={st.isStar ? `Aluno Estrela ⭐: ${st.starReason || 'Destaque'}` : 'Conceder Estrela ao Aluno'}
                      >
                        <Star className={`w-4 h-4 ${st.isStar ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

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
                              <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-emerald-700">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Enviado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-amber-700">
                                <Clock className="w-3.5 h-3.5 text-amber-600" /> Rascunho
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
          <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xs">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-blue-400 font-medium mb-1">
                <span>Engajamento & Prazos</span>
                <span aria-hidden="true">·</span>
                <span>{schoolConfig.period}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                Lembretes de Envio Pendente
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
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
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const text = `Olá Prof. ${teacher.name}, lembramos que o prazo para preenchimento dos relatórios de Pré-Conselho de Classe (${schoolConfig.name}) está aberto. Você possui ${pendingCount} turma(s) pendente(s). Por favor, acesse o sistema escolar para concluir. Contamos com sua valiosa contribuição!`;
                              const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                              window.open(url, '_blank');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Enviar lembrete via WhatsApp"
                          >
                            <span>📲 WhatsApp</span>
                          </button>
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
                            Notificar →
                          </button>
                        </div>
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
          TAB 2: CONSOLIDATED CLASS REPORT (ATA DO CONSELHO)
          ============================================================ */}
      {activeTab === 'consolidated' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Class Selector & Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <span>Ata Oficial do Conselho de Classe</span>
                <span aria-hidden="true">·</span>
                <span>{schoolConfig.period}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Visão Unificada dos Pareceres da Turma
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Reúna todos os apontamentos dos diferentes professores da turma em um único documento pronto para a reunião colegiada.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Select class dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Selecione a Turma:
                </label>
                <select
                  value={selectedConsolidatedClassId}
                  onChange={(e) => setSelectedConsolidatedClassId(e.target.value)}
                  className="w-full sm:w-56 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.shift})
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions: Download Unified PDF and Presentation Mode */}
              {currentConsolidatedClass && (
                <div className="self-end sm:self-auto sm:pt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPresentationMode(true)}
                    className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    title="Projetar em Data Show ou TV na Reunião de Conselho"
                  >
                    <Maximize2 className="w-4 h-4 text-amber-300" />
                    <span>Modo Projeção (Data Show)</span>
                  </button>

                  <button
                    type="button"
                    disabled={consolidatedReports.length === 0}
                    onClick={() => {
                      if (onExportConsolidatedPDF && currentConsolidatedClass) {
                        const classStudents = students.filter(
                          (s) => s.classId === currentConsolidatedClass.id
                        );
                        onExportConsolidatedPDF(
                          currentConsolidatedClass.name,
                          consolidatedReports,
                          classStudents
                        );
                      }
                    }}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                      consolidatedReports.length > 0
                        ? 'bg-blue-700 hover:bg-blue-800 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Ata (PDF)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Turma Status Cards */}
          {currentConsolidatedClass && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
                  Resumo da Turma Avaliada
                </span>
                <h4 className="text-2xl font-black mt-1">
                  {currentConsolidatedClass.name} — Turno {currentConsolidatedClass.shift}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {currentConsolidatedClass.studentCount} estudantes matriculados • {schoolConfig.period}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white/10 rounded-2xl p-4 text-center min-w-28 border border-white/10">
                  <div className="text-2xl font-black text-emerald-400">
                    {consolidatedReports.length}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Fichas Entregues
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 text-center min-w-28 border border-white/10">
                  <div className="text-2xl font-black text-amber-300">
                    {Math.max(0, teachersForConsolidatedClass.length - consolidatedReports.length)}
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Pendentes
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Relação Nominal da Turma e Destaques Estrela ⭐ */}
          {currentConsolidatedClass && (
            <div className="space-y-2">
              <StudentRosterPanel
                classGroup={currentConsolidatedClass}
                students={students}
                currentTeacherName={currentUser.name}
                onToggleStar={onToggleStudentStar || (() => {})}
                onAddStudent={onAddStudent}
                onDeleteStudent={onDeleteStudent}
                canManageStudents={true}
              />
            </div>
          )}

          {/* Participating Teachers Pill Row */}
          {consolidatedReports.length > 0 ? (
            <div className="space-y-6">
              {/* Participating Teachers List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Componentes Curriculares Registrados Nesta Turma ({consolidatedReports.length})
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {consolidatedReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {rep.subject || 'Componente'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {rep.teacherName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onViewReportModal(rep)}
                        className="p-2 text-blue-700 hover:bg-blue-100/60 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Ver Ficha Individual"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consolidated Questions & Answers by Section */}
              <div className="space-y-6">
                {sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const secQuestions = questions
                      .filter((q) => q.sectionId === section.id)
                      .sort((a, b) => a.order - b.order);

                    if (secQuestions.length === 0) return null;

                    return (
                      <div
                        key={section.id}
                        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
                      >
                        <div className="border-b border-slate-200 pb-3">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                            {section.title}
                          </h4>
                        </div>

                        <div className="space-y-6">
                          {secQuestions.map((q) => (
                            <div key={q.id} className="space-y-3">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                📌 {q.prompt}
                              </p>

                              {/* Teachers answers grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-4">
                                {consolidatedReports.map((rep) => {
                                  const ans = rep.answers[q.id];
                                  return (
                                    <div
                                      key={rep.id}
                                      className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200">
                                        <span className="font-bold text-blue-700">
                                          {rep.subject}
                                        </span>
                                        <span className="text-slate-500 font-medium">
                                          {rep.teacherName}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                                        {ans && ans.trim() ? (
                                          ans
                                        ) : (
                                          <span className="text-slate-400 italic">
                                            (Sem anotações)
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-black text-slate-800">
                Nenhum relatório entregue ainda para {currentConsolidatedClass?.name}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Os professores designados para esta turma ainda não submeteram os pareceres do Pré-Conselho. Você pode disparar uma notificação com 1 clique.
              </p>
              <button
                type="button"
                onClick={handleTriggerPendingReminders}
                className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Notificar Professores Desta Turma</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 3: TURMAS & ALUNOS ESTRELA ⭐
          ============================================================ */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header & Class Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                <span>Gestão Pedagógica de Estudantes</span>
                <span aria-hidden="true">·</span>
                <span>Alunos Estrela ⭐</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Relação de Alunos & Quadro de Honra
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Consulte todos os estudantes matriculados por turma, conceda estrelas de mérito aos alunos em destaque e gerencie a lista nominal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Selecionar Turma:
                </label>
                <select
                  value={selectedStudentTabClassId}
                  onChange={(e) => setSelectedStudentTabClassId(e.target.value)}
                  className="w-full sm:w-64 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {classes.map((cls) => {
                    const count = students.filter((s) => s.classId === cls.id).length;
                    const stars = students.filter((s) => s.classId === cls.id && s.isStar).length;
                    return (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({count} alunos {stars > 0 ? `· ⭐ ${stars}` : ''})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Metrics of All Classes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total de Alunos</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums font-mono">
                {students.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Em {classes.length} turmas</div>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs bg-amber-50/30">
              <div className="text-xs text-amber-800 font-medium flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Alunos Estrela ⭐</span>
              </div>
              <div className="text-2xl font-bold text-amber-900 mt-1 tabular-nums font-mono">
                {students.filter((s) => s.isStar).length}
              </div>
              <div className="text-[11px] text-amber-700 mt-0.5">Destaques reconhecidos</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Turma Selecionada</div>
              <div className="text-xl font-bold text-slate-900 mt-1 truncate">
                {classes.find((c) => c.id === selectedStudentTabClassId)?.name || 'Turma'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {students.filter((s) => s.classId === selectedStudentTabClassId).length} matriculados
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Estrelas na Turma</div>
              <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums font-mono">
                {students.filter((s) => s.classId === selectedStudentTabClassId && s.isStar).length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Nesta turma</div>
            </div>
          </div>

          {/* Student Roster Panel for selected class */}
          {(() => {
            const currentTabClass = classes.find((c) => c.id === selectedStudentTabClassId) || classes[0];
            if (!currentTabClass) return null;
            return (
              <StudentRosterPanel
                classGroup={currentTabClass}
                students={students}
                currentTeacherName={currentUser.name}
                onToggleStar={onToggleStudentStar || (() => {})}
                onAddStudent={onAddStudent}
                onDeleteStudent={onDeleteStudent}
                canManageStudents={true}
              />
            );
          })()}
        </div>
      )}

      {/* ============================================================
          TAB 5: ESCOLA, CONFIGURAÇÕES E BACKUP
          ============================================================ */}
      {activeTab === 'school_backup' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Toast if saved */}
          {configSavedToast && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Configurações da escola salvas com sucesso!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: School Identity Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Dados Oficiais da Escola
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Personalize o nome da instituição e as assinaturas que constam nos relatórios e PDFs oficiais.
              </p>

              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome da Instituição de Ensino:
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Subtítulo / Modalidade:
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolSubtitle}
                    onChange={(e) => setSchoolSubtitle(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Título do Documento:
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolDocTitle}
                      onChange={(e) => setSchoolDocTitle(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Bimestre Atual:
                    </label>
                    <select
                      value={schoolPeriod}
                      onChange={(e) => setSchoolPeriod(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="1º Bimestre">1º Bimestre</option>
                      <option value="2º Bimestre">2º Bimestre</option>
                      <option value="3º Bimestre">3º Bimestre</option>
                      <option value="4º Bimestre">4º Bimestre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Assinatura da Pedagoga(o):
                    </label>
                    <input
                      type="text"
                      required
                      value={pedagogueName}
                      onChange={(e) => setPedagogueName(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Assinatura da Diretora(or):
                    </label>
                    <input
                      type="text"
                      required
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Salvar Dados da Escola
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Backup and Data Safety */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <Database className="w-5 h-5 text-indigo-700" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Backup e Transferência do Sistema
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Exporte cópia completa de segurança em arquivo JSON (contém todos os professores, turmas, questionários e relatórios já preenchidos).
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Backup Completo (.json)</span>
                  </button>

                  <div className="relative">
                    <label
                      htmlFor="backup-file-upload"
                      className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Restaurar Backup a partir de Arquivo (.json)</span>
                    </label>
                    <input
                      id="backup-file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileUploadBackup}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Quick Classes Management */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Turmas Cadastradas ({classes.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Turmas disponíveis para vinculação e preenchimento
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddClassModal(true)}
                    className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Turma</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900">{cls.name}</strong>
                        <span className="text-slate-500 ml-2">
                          ({cls.shift} • {cls.studentCount} estudantes)
                        </span>
                      </div>
                      {onDeleteClass && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja realmente remover a turma ${cls.name}?`)) {
                              onDeleteClass(cls.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Remover Turma"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Quick Teachers Management */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Corpo Docente ({activeTeachers.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Professores cadastrados no sistema
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddTeacherModal(true)}
                    className="py-2 px-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Novo Docente</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                  {activeTeachers.map((tch) => (
                    <div
                      key={tch.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-slate-900">{tch.name}</strong>
                        <span className="text-slate-500 ml-2">
                          ({tch.subject || 'Multidisciplinar'})
                        </span>
                      </div>
                      {onDeleteUser && tch.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja remover o(a) professor(a) ${tch.name}?`)) {
                              onDeleteUser(tch.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Remover Professor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

      {/* ============================================================
          ADD CLASS MODAL
          ============================================================ */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Cadastrar Nova Turma
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Adicione uma turma para disponibilizar aos professores:
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome da Turma * (ex: 6º Ano B)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 6º Ano B"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Turno:
                  </label>
                  <select
                    value={newClassShift}
                    onChange={(e) => setNewClassShift(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Integral">Integral</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Série / Ano:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 6º Ano"
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Número Estimado de Estudantes:
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newClassStudents}
                  onChange={(e) => setNewClassStudents(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Cadastrar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          ADD TEACHER MODAL
          ============================================================ */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Cadastrar Novo Professor(a)
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Adicione um docente e vincule às turmas sob sua responsabilidade:
            </p>

            <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome Completo do Docente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Profª. Mariana Ribeiro"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Componente Curricular / Disciplina *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Língua Portuguesa, Matemática, História"
                  value={newTeacherSubject}
                  onChange={(e) => setNewTeacherSubject(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vincular às Turmas (Selecione):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {classes.map((c) => {
                    const isChecked = newTeacherClasses.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTeacherClasses((prev) => [...prev, c.id]);
                            } else {
                              setNewTeacherClasses((prev) => prev.filter((id) => id !== c.id));
                            }
                          }}
                          className="w-3.5 h-3.5 text-blue-600 rounded-sm"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Se nenhuma turma for marcada, o professor terá acesso a todas as turmas.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Cadastrar Professor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          PRESENTATION / DATA-SHOW FULLSCREEN MODE
          ============================================================ */}
      {isPresentationMode && currentConsolidatedClass && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 overflow-y-auto p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Bar for Presentation Mode */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Modo Projeção — Reunião de Conselho de Classe
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {currentConsolidatedClass.name} ({currentConsolidatedClass.shift}) • {schoolConfig.period}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onExportConsolidatedPDF) {
                      onExportConsolidatedPDF(currentConsolidatedClass.name, consolidatedReports);
                    }
                  }}
                  className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPresentationMode(false)}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Fechar Projeção</span>
                </button>
              </div>
            </div>

            {/* Questions by Section with Large, Clear Typography for Meeting Room */}
            <div className="space-y-8">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((sec) => {
                  const secQuestions = questions
                    .filter((q) => q.sectionId === sec.id)
                    .sort((a, b) => a.order - b.order);

                  if (secQuestions.length === 0) return null;

                  return (
                    <div
                      key={sec.id}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
                    >
                      <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-3">
                        {sec.title}
                      </h3>

                      <div className="space-y-6">
                        {secQuestions.map((q) => (
                          <div key={q.id} className="space-y-3">
                            <h4 className="text-base font-bold text-white bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                              📌 {q.prompt}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {consolidatedReports.map((rep) => {
                                const ans = rep.answers[q.id];
                                return (
                                  <div
                                    key={rep.id}
                                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
                                      <span className="font-bold text-blue-400 text-sm">
                                        {rep.subject}
                                      </span>
                                      <span className="text-slate-400 font-medium">
                                        {rep.teacherName}
                                      </span>
                                    </div>
                                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
                                      {ans && ans.trim() ? (
                                        ans
                                      ) : (
                                        <span className="text-slate-600 italic">
                                          (Sem anotações)
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
