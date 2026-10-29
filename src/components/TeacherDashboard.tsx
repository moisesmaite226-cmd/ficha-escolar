import React, { useState, useEffect } from 'react';
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
  Lock,
  Check,
  Zap,
  Star,
  Download,
} from 'lucide-react';

export const OBJECTIVE_QUESTIONS = [
  {
    key: 'rendimento',
    label: '1. Desempenho / Rendimento',
    short: 'Rendimento',
    options: [
      { id: 'critico', text: 'Crítico (< 5.0)', isRisk: true },
      { id: 'regular', text: 'Regular (5.0 a 6.9)', isWarning: true },
      { id: 'adequado', text: 'Adequado (7.0 a 8.9)' },
      { id: 'excelente', text: 'Excelente (9.0 a 10)', isStar: true },
    ],
  },
  {
    key: 'comportamento',
    label: '2. Postura e Engajamento em Aula',
    short: 'Comportamento',
    options: [
      { id: 'indisciplinado', text: 'Indisciplinado / Conflituoso', isRisk: true },
      { id: 'disperso', text: 'Disperso / Desatento', isWarning: true },
      { id: 'focado', text: 'Focado e Respeitoso' },
      { id: 'lider', text: 'Liderança Positiva / Exemplar', isStar: true },
    ],
  },
  {
    key: 'frequencia',
    label: '3. Frequência e Pontualidade',
    short: 'Assiduidade',
    options: [
      { id: 'faltas_criticas', text: 'Faltas Críticas (> 25%)', isRisk: true },
      { id: 'faltas_esporadicas', text: 'Faltas Esporádicas', isWarning: true },
      { id: 'assiduo', text: 'Assíduo e Pontual' },
      { id: 'exemplar', text: '100% Presente (Sem Faltas)', isStar: true },
    ],
  },
  {
    key: 'tarefas',
    label: '4. Cumprimento de Atividades e Trabalhos',
    short: 'Tarefas',
    options: [
      { id: 'nao_entrega', text: 'Não Realiza Tarefas', isRisk: true },
      { id: 'atrasos', text: 'Entrega Parcial / Atrasos', isWarning: true },
      { id: 'em_dia', text: 'Sempre em Dia no Prazo' },
      { id: 'caprichoso', text: 'Caprichoso e Completo', isStar: true },
    ],
  },
  {
    key: 'encaminhamento',
    label: '5. Parecer / Encaminhamento do Conselho',
    short: 'Encaminhamento',
    options: [
      { id: 'recuperacao', text: 'Recuperação Imediata', isRisk: true },
      { id: 'convocar_pais', text: 'Convocar Pais / Responsáveis', isWarning: true },
      { id: 'apoio', text: 'Apoio Pedagógico / Monitoria' },
      { id: 'elogio', text: 'Elogio em Ata (Destaque ⭐)', isStar: true },
    ],
  },
];

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
  reports,
  schoolConfig,
  onSaveReport,
  onToggleStudentStar,
}) => {
  const teacherClasses = classes.filter((c) =>
    currentUser.assignedClassIds.includes(c.id)
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(
    teacherClasses[0]?.id || classes[0]?.id || ''
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const selectedClass =
    classes.find((c) => c.id === selectedClassId) || teacherClasses[0];
  const classStudents = students.filter((st) => st.classId === selectedClass?.id);

  // Carrega respostas apenas do próprio professor para a turma selecionada
  useEffect(() => {
    if (!selectedClass) return;
    const myReport = reports.find(
      (r) => r.classId === selectedClass.id && r.teacherId === currentUser.id
    );
    setAnswers(myReport?.answers || {});
  }, [selectedClassId, reports, currentUser.id, selectedClass]);

  const handleSelectOption = (
    studentId: string,
    questionKey: string,
    optionId: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [`st_${studentId}_${questionKey}`]: optionId,
    }));
  };

  const handleFillStandardAdequate = () => {
    const updated = { ...answers };
    classStudents.forEach((st) => {
      if (!updated[`st_${st.id}_rendimento`])
        updated[`st_${st.id}_rendimento`] = 'adequado';
      if (!updated[`st_${st.id}_comportamento`])
        updated[`st_${st.id}_comportamento`] = 'focado';
      if (!updated[`st_${st.id}_frequencia`])
        updated[`st_${st.id}_frequencia`] = 'assiduo';
      if (!updated[`st_${st.id}_tarefas`])
        updated[`st_${st.id}_tarefas`] = 'em_dia';
      if (!updated[`st_${st.id}_encaminhamento`])
        updated[`st_${st.id}_encaminhamento`] = 'apoio';
    });
    setAnswers(updated);
    setSavedMessage(
      'Padrão "Adequado" preenchido para todos os estudantes da turma! Agora ajuste apenas os casos de destaque ou com dificuldades.'
    );
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleSave = () => {
    if (!selectedClass) return;
    const payload = {
      classId: selectedClass.id,
      className: selectedClass.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      subject: currentUser.subject || 'Componente Curricular',
      period: schoolConfig.period,
      date: new Date().toISOString().split('T')[0],
      status: 'submitted' as const,
      answers,
    };
    onSaveReport(payload);
    setSavedMessage('Votação confidencial gravada com sucesso no sistema do conselho!');
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const answeredStudentsCount = classStudents.filter((st) =>
    OBJECTIVE_QUESTIONS.every((q) => !!answers[`st_${st.id}_${q.key}`])
  ).length;

  const isAlreadySubmitted = reports.some(
    (r) =>
      r.classId === selectedClass?.id &&
      r.teacherId === currentUser.id &&
      r.status === 'submitted'
  );

  return (
    <div className="space-y-6">
      {/* Aviso de Sigilo e Voto Cego */}
      <div className="bg-black border border-[#162c64] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0b1736] border border-[#1d397e] text-white flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Votação Sigilosa / Voto Cego
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-200 border border-blue-500/30">
                Docente Autônomo
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Suas marcações são estritamente confidenciais. Você{' '}
              <strong>não visualiza</strong> os votos de outros professores, e nenhum colega tem acesso às suas escolhas. A análise integrada é de exclusividade da Direção.
            </p>
          </div>
        </div>

        {/* Status do Professor na Turma */}
        <div className="shrink-0 flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 ${
              isAlreadySubmitted
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAlreadySubmitted ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              {isAlreadySubmitted
                ? 'Sua Avaliação: Entregue Oficialmente'
                : 'Sua Avaliação: Pendente'}
            </span>
          </div>
        </div>
      </div>

      {/* Mensagem de Feedback */}
      {savedMessage && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs font-bold text-emerald-100 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedMessage(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Seletor de Turma do Professor */}
      <div className="bg-black border border-[#162c64] rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162c64]">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Suas Turmas Atribuídas ({currentUser.subject})
            </h2>
            <p className="text-xs text-slate-400">
              Selecione a turma para responder as perguntas de cada aluno:
            </p>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillStandardAdequate}
              className="px-3 py-2 bg-[#0b1736] hover:bg-[#10214c] border border-[#162c64] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
              title="Preencher todos os estudantes da turma como 'Adequado' para você só ajustar as exceções"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Preencher Turma com Padrão Adequado</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-[#071026] rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <Check className="w-3.5 h-3.5 text-[#071026]" />
              <span>Gravar Minha Avaliação</span>
            </button>
          </div>
        </div>

        {/* Tabs de Turmas */}
        <div className="flex flex-wrap gap-2 mt-3">
          {teacherClasses.map((cls) => {
            const isSelected = cls.id === selectedClass?.id;
            const rep = reports.find(
              (r) => r.classId === cls.id && r.teacherId === currentUser.id
            );
            const isSubmitted = rep?.status === 'submitted';

            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-[#071026] border-white shadow-md'
                    : 'bg-[#0b1736] text-slate-300 border-[#162c64] hover:bg-[#10214c] hover:text-white'
                }`}
              >
                <span>{cls.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                    isSelected
                      ? 'bg-[#071026] text-white'
                      : isSubmitted
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {isSubmitted ? 'Gravado' : 'Pendente'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Indicador de progresso */}
        <div className="mt-4 pt-3 border-t border-[#162c64] flex items-center justify-between text-xs text-slate-400">
          <span>
            Progresso na turma <strong>{selectedClass?.name}</strong>:{' '}
            <strong className="text-white">
              {answeredStudentsCount} de {classStudents.length} alunos avaliados
            </strong>
          </span>
          <span className="font-mono text-white font-bold">
            {classStudents.length > 0
              ? Math.round((answeredStudentsCount / classStudents.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      {/* Listagem de Alunos com Perguntas 100% Objetivas */}
      <div className="space-y-4">
        {classStudents.map((student, idx) => {
          const isStar = student.isStar;

          return (
            <div
              key={student.id}
              className="bg-black border border-[#162c64] rounded-2xl p-4 sm:p-5 shadow-xl hover:border-[#1d397e] transition-all"
            >
              {/* Linha do Aluno */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162c64]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0b1736] border border-[#162c64] flex items-center justify-center font-black text-xs text-white shrink-0">
                    {student.rollNumber || idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{student.name}</h3>
                      {isStar && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-200 border border-amber-400/40">
                          <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                          <span>Destaque Estrela</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {selectedClass?.name} · Chamada #{student.rollNumber}
                    </div>
                  </div>
                </div>

                {/* Botão de Estrela Rápido */}
                <button
                  type="button"
                  onClick={() =>
                    onToggleStudentStar &&
                    onToggleStudentStar(student.id, {
                      isStar: !isStar,
                      starCategory: 'academic',
                      starReason: 'Destaque acadêmico e comportamental reconhecido pelo docente.',
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isStar
                      ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                      : 'bg-[#0b1736] text-slate-300 border-[#162c64] hover:text-white hover:bg-[#10214c]'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 text-amber-300 ${isStar ? 'fill-amber-300' : ''}`}
                  />
                  <span>{isStar ? 'Aluno Destaque ⭐' : 'Indicar Destaque'}</span>
                </button>
              </div>

              {/* Grade de Perguntas 100% Objetivas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3.5">
                {OBJECTIVE_QUESTIONS.map((question) => {
                  const currentVal = answers[`st_${student.id}_${question.key}`];

                  return (
                    <div
                      key={question.key}
                      className="bg-[#071026] border border-[#162c64] rounded-xl p-3"
                    >
                      <span className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-2">
                        {question.label}
                      </span>

                      <div className="grid grid-cols-2 gap-1.5">
                        {question.options.map((opt) => {
                          const isSelected = currentVal === opt.id;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                handleSelectOption(
                                  student.id,
                                  question.key,
                                  opt.id
                                )
                              }
                              className={`px-2 py-2 rounded-lg text-xs font-extrabold transition-all border text-left flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-white text-[#071026] border-white shadow-sm ring-2 ring-white/50'
                                  : 'bg-[#0b1736] text-slate-300 border-[#162c64] hover:bg-[#10214c] hover:text-white'
                              }`}
                            >
                              <span className="truncate">{opt.text}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#071026] shrink-0 ml-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão Flutuante / Fim de Página para Gravar */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3.5 bg-white hover:bg-slate-200 text-[#071026] font-black text-sm rounded-2xl shadow-2xl flex items-center gap-2 cursor-pointer transition-all border-2 border-white"
        >
          <Check className="w-5 h-5 text-[#071026]" />
          <span>Gravar Minhas Respostas da Turma {selectedClass?.name}</span>
        </button>
      </div>
    </div>
  );
};
