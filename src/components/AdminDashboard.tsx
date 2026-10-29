import React, { useState, useMemo } from 'react';
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
  Users,
  Eye,
  Printer,
  Check,
  Bell,
  Star,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { OBJECTIVE_QUESTIONS } from './TeacherDashboard';

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
  onExportConsolidatedPDF?: (
    className: string,
    classReports: Report[],
    classStudents?: Student[]
  ) => void;
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
  reports,
  schoolConfig,
  onSendPushReminder,
  onToggleStudentStar,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'matrix' | 'minutes'>('audit');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const selectedClass =
    classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((st) => st.classId === selectedClass?.id);

  // Professores atribuídos a esta turma
  const classTeachers = users.filter(
    (u) => u.role === 'teacher' && u.assignedClassIds.includes(selectedClass?.id)
  );

  // Relatórios entregues para esta turma
  const classReports = reports.filter((r) => r.classId === selectedClass?.id);

  // Quórum de votação
  const votedTeacherIds = classReports
    .filter((r) => r.status === 'submitted')
    .map((r) => r.teacherId);
  const quorumPercentage =
    classTeachers.length > 0
      ? Math.round((votedTeacherIds.length / classTeachers.length) * 100)
      : 0;

  // Análise consolidada por aluno (calcula alertas de risco com base nas respostas dos professores)
  const studentsAnalysis = useMemo(() => {
    return classStudents.map((st) => {
      const votes: Array<{
        teacherId: string;
        teacherName: string;
        subject: string;
        rendimento?: string;
        comportamento?: string;
        frequencia?: string;
        tarefas?: string;
        encaminhamento?: string;
      }> = [];

      classReports.forEach((rep) => {
        const rRendimento = rep.answers[`st_${st.id}_rendimento`];
        const rComportamento = rep.answers[`st_${st.id}_comportamento`];
        const rFrequencia = rep.answers[`st_${st.id}_frequencia`];
        const rTarefas = rep.answers[`st_${st.id}_tarefas`];
        const rEncaminhamento = rep.answers[`st_${st.id}_encaminhamento`];

        if (
          rRendimento ||
          rComportamento ||
          rFrequencia ||
          rTarefas ||
          rEncaminhamento
        ) {
          votes.push({
            teacherId: rep.teacherId,
            teacherName: rep.teacherName,
            subject: rep.subject,
            rendimento: rRendimento,
            comportamento: rComportamento,
            frequencia: rFrequencia,
            tarefas: rTarefas,
            encaminhamento: rEncaminhamento,
          });
        }
      });

      const criticalCount = votes.filter(
        (v) =>
          v.rendimento === 'critico' ||
          v.comportamento === 'indisciplinado' ||
          v.frequencia === 'faltas_criticas' ||
          v.tarefas === 'nao_entrega' ||
          v.encaminhamento === 'recuperacao' ||
          v.encaminhamento === 'convocar_pais'
      ).length;

      const starVotesCount = votes.filter(
        (v) =>
          v.rendimento === 'excelente' ||
          v.comportamento === 'lider' ||
          v.encaminhamento === 'elogio'
      ).length;

      let riskLevel: 'critico' | 'atencao' | 'adequado' | 'destaque' = 'adequado';
      if (criticalCount >= 2) riskLevel = 'critico';
      else if (criticalCount === 1) riskLevel = 'atencao';
      else if (starVotesCount >= 2 || st.isStar) riskLevel = 'destaque';

      return {
        student: st,
        votes,
        criticalCount,
        starVotesCount,
        riskLevel,
      };
    });
  }, [classStudents, classReports]);

  const criticalStudents = studentsAnalysis.filter((s) => s.riskLevel === 'critico');
  const attentionStudents = studentsAnalysis.filter((s) => s.riskLevel === 'atencao');
  const starStudents = studentsAnalysis.filter(
    (s) => s.riskLevel === 'destaque' || s.student.isStar
  );

  const formatOptionText = (questionKey: string, optionId?: string) => {
    if (!optionId) return '—';
    const q = OBJECTIVE_QUESTIONS.find((item) => item.key === questionKey);
    const opt = q?.options.find((o) => o.id === optionId);
    return opt ? opt.text : optionId;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadStandaloneHtml = () => {
    window.open('/index.html', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header da Diretoria / Seletor de Turma e Abas */}
      <div className="bg-black border border-[#162c64] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#162c64]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                Painel Panóptico da Diretoria & Coordenação
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white text-[#071026]">
                Acesso Total Irrestrito
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              Análise Coletiva e Auditoria de Votação do Conselho
            </h2>
          </div>

          {/* Seletor de Turma */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Turma Analisada:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-[#071026] border border-[#162c64] text-white font-extrabold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.shift})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra de Abas do Diretor */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-[#071026] border-white shadow-md'
                : 'bg-[#0b1736] text-slate-300 border-[#162c64] hover:bg-[#10214c] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Auditoria de Votação (Quem já votou)</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-200">
              {votedTeacherIds.length}/{classTeachers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white text-[#071026] border-white shadow-md'
                : 'bg-[#0b1736] text-slate-300 border-[#162c64] hover:bg-[#10214c] hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. Matriz Analítica (O que cada professor marcou)</span>
            {criticalStudents.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500 text-white font-black">
                {criticalStudents.length} Alertas
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('minutes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2 cursor-pointer ${
              activeTab === 'minutes'
                ? 'bg-white text-[#071026] border-white shadow-md'
                : 'bg-[#0b1736] text-slate-300 border-[#162c64] hover:bg-[#10214c] hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>3. Ata Oficial Consolidada & Impressão</span>
          </button>
        </div>
      </div>

      {/* ABA 1: AUDITORIA DE PARTICIPAÇÃO (QUEM JÁ VOTOU E QUEM FALTA) */}
      {activeTab === 'audit' && (
        <div className="space-y-5">
          {/* Métricas de Quórum */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black border border-[#162c64] rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quórum de Votação
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {quorumPercentage}%
              </div>
              <div className="w-full bg-[#071026] h-2 rounded-full mt-2 overflow-hidden border border-[#162c64]">
                <div
                  className="bg-white h-full transition-all duration-500"
                  style={{ width: `${quorumPercentage}%` }}
                />
              </div>
            </div>

            <div className="bg-black border border-[#162c64] rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Professores que Votaram
              </span>
              <div className="text-2xl font-black text-emerald-300 mt-1">
                {votedTeacherIds.length}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  de {classTeachers.length}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Avaliações gravadas no banco
              </span>
            </div>

            <div className="bg-black border border-[#162c64] rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Professores Pendentes
              </span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {classTeachers.length - votedTeacherIds.length}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Aguardando preenchimento
              </span>
            </div>
          </div>

          {/* Tabela de Auditoria dos Professores */}
          <div className="bg-black border border-[#162c64] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#162c64]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Quadro de Professores da Turma: {selectedClass?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Auditoria de quem já votou e data/hora de envio:
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const pendings = classTeachers.filter(
                    (t) => !votedTeacherIds.includes(t.id)
                  );
                  pendings.forEach((t) =>
                    onSendPushReminder(
                      'Lembrete de Votação',
                      `Prezado(a) ${t.name}, solicitamos a conclusão do pré-conselho da turma ${selectedClass?.name}.`,
                      t.id
                    )
                  );
                  alert(
                    `Notificação de cobrança enviada para os ${pendings.length} professores pendentes!`
                  );
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0b1736] hover:bg-[#10214c] border border-[#162c64] text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300" />
                <span>Cobrar Todos os Pendentes</span>
              </button>
            </div>

            <div className="divide-y divide-[#162c64]">
              {classTeachers.map((teacher) => {
                const rep = classReports.find(
                  (r) => r.teacherId === teacher.id && r.status === 'submitted'
                );
                const hasVoted = !!rep;

                return (
                  <div
                    key={teacher.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          hasVoted
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                            : 'bg-[#0b1736] text-slate-300 border border-[#162c64]'
                        }`}
                      >
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-sm flex items-center gap-2">
                          <span>{teacher.name}</span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            ({teacher.subject})
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5">
                          E-mail institucional: {teacher.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasVoted ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 text-xs font-black">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Votou com Sucesso</span>
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Data do voto: {rep.updatedAt ? new Date(rep.updatedAt).toLocaleDateString('pt-BR') : rep.date}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-black">
                            <span>⏳ Pendente de Voto</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onSendPushReminder(
                                'Lembrete de Votação',
                                `Prezado(a) ${teacher.name}, o pré-conselho da turma ${selectedClass?.name} está aguardando seu preenchimento.`,
                                teacher.id
                              );
                              alert(
                                `Lembrete enviado com sucesso para ${teacher.name}!`
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#0b1736] hover:bg-[#10214c] border border-[#162c64] text-xs font-bold text-white transition-colors cursor-pointer"
                          >
                            Lembrar
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

      {/* ABA 2: MATRIZ ANALÍTICA DO CONSELHO (O QUE CADA PROFESSOR MARCOU) */}
      {activeTab === 'matrix' && (
        <div className="space-y-5">
          {/* Cards de Resumo de Risco */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-black border border-red-500/30 rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider block">
                Risco Crítico (Alerta Vermelho)
              </span>
              <div className="text-2xl font-black text-red-400 mt-1">
                {criticalStudents.length} Alunos
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                2+ votos de nota baixa ou infrequência
              </span>
            </div>

            <div className="bg-black border border-amber-500/30 rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                Atenção Pedagógica (Alerta Amarelo)
              </span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {attentionStudents.length} Alunos
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Dificuldades pontuais apontadas
              </span>
            </div>

            <div className="bg-black border border-emerald-500/30 rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                Rendimento Adequado
              </span>
              <div className="text-2xl font-black text-emerald-300 mt-1">
                {
                  studentsAnalysis.filter((s) => s.riskLevel === 'adequado')
                    .length
                }{' '}
                Alunos
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Dentro do esperado para o ciclo
              </span>
            </div>

            <div className="bg-black border border-blue-400/30 rounded-2xl p-4 shadow-lg">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                Destaques do Conselho ⭐
              </span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {starStudents.length} Alunos
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Elogio em ata deliberado
              </span>
            </div>
          </div>

          {/* Lista Detalhada de Alunos com Expansão de Respostas dos Professores */}
          <div className="bg-black border border-[#162c64] rounded-2xl p-5 shadow-xl">
            <div className="pb-3 mb-4 border-b border-[#162c64]">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Detalhamento por Aluno e Votação Individual de Cada Professor
              </h3>
              <p className="text-xs text-slate-400">
                Clique no aluno para inspecionar exatamente o que cada docente marcou para cada critério objetivo:
              </p>
            </div>

            <div className="space-y-3">
              {studentsAnalysis.map(({ student, votes, riskLevel }) => {
                const isExpanded = expandedStudentId === student.id;

                let badgeClass =
                  'bg-emerald-500/20 text-emerald-200 border-emerald-500/40';
                let badgeText = 'Adequado';
                if (riskLevel === 'critico') {
                  badgeClass = 'bg-red-500/20 text-red-200 border-red-500/40';
                  badgeText = '🔴 Risco Crítico';
                } else if (riskLevel === 'atencao') {
                  badgeClass =
                    'bg-amber-500/20 text-amber-200 border-amber-500/40';
                  badgeText = '🟡 Atenção';
                } else if (riskLevel === 'destaque') {
                  badgeClass =
                    'bg-amber-400/20 text-amber-200 border-amber-400/40';
                  badgeText = '⭐ Destaque do Conselho';
                }

                return (
                  <div
                    key={student.id}
                    className="bg-[#071026] border border-[#162c64] rounded-xl overflow-hidden transition-all"
                  >
                    {/* Barra do Aluno */}
                    <div
                      onClick={() =>
                        setExpandedStudentId(isExpanded ? null : student.id)
                      }
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#0b1736] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0b1736] border border-[#162c64] flex items-center justify-center font-black text-xs text-white">
                          {student.rollNumber}
                        </div>
                        <div>
                          <div className="font-black text-white text-sm flex items-center gap-2">
                            <span>{student.name}</span>
                            <span
                              className={
                                'px-2 py-0.5 rounded text-[10px] font-black border ' +
                                badgeClass
                              }
                            >
                              {badgeText}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {votes.length} de {classTeachers.length} professores já avaliaram este aluno
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                          {isExpanded
                            ? 'Ocultar Detalhes'
                            : 'Ver Votos dos Professores'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Área Expandida com a Comparação Entre Professores */}
                    {isExpanded && (
                      <div className="p-4 bg-black border-t border-[#162c64]">
                        {votes.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            Nenhum professor gravou avaliação para este estudante ainda.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-[#162c64] text-slate-400 uppercase tracking-wider text-[10px]">
                                  <th className="py-2 pr-3">Professor / Disciplina</th>
                                  <th className="py-2 px-3">Rendimento</th>
                                  <th className="py-2 px-3">Comportamento</th>
                                  <th className="py-2 px-3">Assiduidade</th>
                                  <th className="py-2 px-3">Tarefas</th>
                                  <th className="py-2 pl-3">Encaminhamento</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#10214c]">
                                {votes.map((v, vIdx) => {
                                  return (
                                    <tr
                                      key={vIdx}
                                      className="hover:bg-[#071026]/50"
                                    >
                                      <td className="py-2.5 pr-3 font-extrabold text-white">
                                        <div>{v.teacherName}</div>
                                        <div className="text-[10px] text-slate-400">
                                          {v.subject}
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className="font-semibold text-slate-200">
                                          {formatOptionText(
                                            'rendimento',
                                            v.rendimento
                                          )}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className="font-semibold text-slate-200">
                                          {formatOptionText(
                                            'comportamento',
                                            v.comportamento
                                          )}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className="font-semibold text-slate-200">
                                          {formatOptionText(
                                            'frequencia',
                                            v.frequencia
                                          )}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className="font-semibold text-slate-200">
                                          {formatOptionText(
                                            'tarefas',
                                            v.tarefas
                                          )}
                                        </span>
                                      </td>
                                      <td className="py-2.5 pl-3">
                                        <span
                                          className={
                                            'px-2 py-1 rounded text-[11px] font-bold border ' +
                                            (v.encaminhamento === 'recuperacao'
                                              ? 'bg-red-500/20 text-red-200 border-red-500/40'
                                              : v.encaminhamento ===
                                                'convocar_pais'
                                              ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                                              : v.encaminhamento === 'elogio'
                                              ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                                              : 'bg-blue-500/20 text-blue-200 border-blue-500/40')
                                          }
                                        >
                                          {formatOptionText(
                                            'encaminhamento',
                                            v.encaminhamento
                                          )}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: ATA OFICIAL CONSOLIDADA & IMPRESSÃO */}
      {activeTab === 'minutes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-black border border-[#162c64] p-4 rounded-2xl shadow-lg">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Ata Oficial do Conselho de Classe — Turma: {selectedClass?.name}
              </h3>
              <p className="text-xs text-slate-400">
                Documento institucional formal para deliberação coletiva e arquivamento em pasta.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white hover:bg-slate-200 text-[#071026] font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-[#071026]" />
              <span>Imprimir Ata Oficial / Salvar PDF</span>
            </button>
          </div>

          {/* Folha Oficial da Ata (Executiva e perfeita para print) */}
          <div className="bg-white text-slate-950 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0">
            {/* Cabeçalho da Escola */}
            <div className="text-center pb-6 border-b-2 border-slate-900">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                {schoolConfig.name}
              </h1>
              <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">
                {schoolConfig.subtitle}
              </p>
              <div className="mt-2 inline-block px-4 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded">
                ATA OFICIAL DE DELIBERAÇÃO DO CONSELHO DE CLASSE — {schoolConfig.period}
              </div>
            </div>

            {/* Metadados da Reunião */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs border-b border-slate-300">
              <div>
                <span className="font-bold text-slate-500 block">Turma:</span>
                <strong className="text-slate-900 text-sm">
                  {selectedClass?.name}
                </strong>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">Turno:</span>
                <strong className="text-slate-900">{selectedClass?.shift}</strong>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">
                  Quórum Docente:
                </span>
                <strong className="text-slate-900">
                  {votedTeacherIds.length} de {classTeachers.length} professores
                </strong>
              </div>
              <div>
                <span className="font-bold text-slate-500 block">
                  Data de Emissão:
                </span>
                <strong className="text-slate-900">
                  {new Date().toLocaleDateString('pt-BR')}
                </strong>
              </div>
            </div>

            {/* Resumo Deliberativo */}
            <div className="my-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                1. Quadro Consolidado de Encaminhamentos por Aluno
              </h2>
              <table className="print-table w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 font-black text-slate-900">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-12 text-center">
                      Nº
                    </th>
                    <th className="p-2 border-r border-slate-300">
                      Nome do Estudante
                    </th>
                    <th className="p-2 border-r border-slate-300">
                      Classificação
                    </th>
                    <th className="p-2 border-r border-slate-300">
                      Votos Docentes
                    </th>
                    <th className="p-2">Deliberação Coletiva do Conselho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentsAnalysis.map(({ student, votes, riskLevel }) => (
                    <tr key={student.id}>
                      <td className="p-2 border-r border-slate-300 text-center font-bold">
                        {student.rollNumber}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-extrabold text-slate-900">
                        {student.name}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-bold">
                        {riskLevel === 'critico' && (
                          <span className="text-red-700">🔴 Risco Crítico</span>
                        )}
                        {riskLevel === 'atencao' && (
                          <span className="text-amber-700">🟡 Atenção</span>
                        )}
                        {riskLevel === 'adequado' && (
                          <span className="text-emerald-700">🟢 Adequado</span>
                        )}
                        {riskLevel === 'destaque' && (
                          <span className="text-blue-800">⭐ Destaque</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-[11px] text-slate-600">
                        {votes.length} pareceres gravados
                      </td>
                      <td className="p-2 font-bold text-slate-800 text-xs">
                        {riskLevel === 'critico' &&
                          'Convocação urgente de responsáveis e plano de recuperação.'}
                        {riskLevel === 'atencao' &&
                          'Encaminhamento para apoio pedagógico e monitoria.'}
                        {riskLevel === 'adequado' &&
                          'Manutenção das rotinas regulares de aprendizagem.'}
                        {riskLevel === 'destaque' &&
                          'Registro formal de elogio em ata e menção honrosa.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Assinaturas da Direção */}
            <div className="mt-12 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 mb-2 w-3/4 mx-auto pb-6" />
                <div className="font-extrabold text-slate-900">
                  {schoolConfig.pedagogueName}
                </div>
                <div className="text-slate-500">Coordenação Pedagógica</div>
              </div>
              <div>
                <div className="border-b border-slate-400 mb-2 w-3/4 mx-auto pb-6" />
                <div className="font-extrabold text-slate-900">
                  {schoolConfig.principalName}
                </div>
                <div className="text-slate-500">Direção Geral</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
