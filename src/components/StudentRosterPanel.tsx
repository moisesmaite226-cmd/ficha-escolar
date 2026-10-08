import React, { useState } from 'react';
import { Student, ClassGroup } from '../types';
import {
  Users,
  Star,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit2,
  Award,
  HeartHandshake,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  FileDown,
  ArrowRight,
} from 'lucide-react';
import { StarStudentModal } from './StarStudentModal';

interface StudentRosterPanelProps {
  classGroup: ClassGroup;
  students: Student[];
  currentTeacherName?: string;
  onToggleStar: (
    studentId: string,
    details?: {
      isStar?: boolean;
      starCategory?: 'academic' | 'attitude' | 'improvement' | 'creativity';
      starReason?: string;
      starAddedBy?: string;
    }
  ) => void;
  onInsertStudentToQuestion?: (studentName: string) => void;
  onAddStudent?: (student: Omit<Student, 'id'>) => void;
  onDeleteStudent?: (studentId: string) => void;
  canManageStudents?: boolean;
  compact?: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof Award; color: string }> = {
  academic: { label: 'Acadêmico', icon: Award, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  attitude: { label: 'Atitude & Cooperação', icon: HeartHandshake, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  improvement: { label: 'Superação', icon: TrendingUp, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  creativity: { label: 'Criatividade', icon: Lightbulb, color: 'text-amber-800 bg-amber-50 border-amber-200' },
};

export const StudentRosterPanel: React.FC<StudentRosterPanelProps> = ({
  classGroup,
  students,
  currentTeacherName,
  onToggleStar,
  onInsertStudentToQuestion,
  onAddStudent,
  onDeleteStudent,
  canManageStudents = false,
  compact = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStarOnly, setFilterStarOnly] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);

  const classStudents = students
    .filter((s) => s.classId === classGroup.id)
    .sort((a, b) => a.rollNumber - b.rollNumber);

  const starCount = classStudents.filter((s) => s.isStar).length;

  const filteredStudents = classStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStar = filterStarOnly ? s.isStar : true;
    return matchesSearch && matchesStar;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !onAddStudent) return;
    const nextRollNumber = classStudents.length > 0
      ? Math.max(...classStudents.map((s) => s.rollNumber)) + 1
      : 1;

    onAddStudent({
      classId: classGroup.id,
      name: newStudentName.trim(),
      rollNumber: nextRollNumber,
    });
    setNewStudentName('');
    setIsAddingStudent(false);
  };

  const handleQuickStarToggle = (student: Student) => {
    if (!student.isStar) {
      // Open modal so they can customize, or quickly star with default
      setSelectedStudentForModal(student);
    } else {
      // Toggle off directly or open modal
      onToggleStar(student.id, { isStar: false });
    }
  };

  const handleInsertClick = (student: Student) => {
    if (onInsertStudentToQuestion) {
      onInsertStudentToQuestion(student.name);
      setCopiedStudentId(student.id);
      setTimeout(() => setCopiedStudentId(null), 1500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Relação Nominal dos Estudantes
                </h4>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  ({classStudents.length} matriculados)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Turma: <strong>{classGroup.name}</strong> • Turno {classGroup.shift}
              </p>
            </div>
          </div>

          {/* Quick Stats & Star Highlight */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {starCount > 0 ? (
              <button
                type="button"
                onClick={() => setFilterStarOnly(!filterStarOnly)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterStarOnly
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
                title="Filtrar Alunos Estrela"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{starCount} Aluno{starCount > 1 ? 's' : ''} Estrela ⭐</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-slate-300" />
                Nenhum destaque atribuído ainda
              </span>
            )}

            {canManageStudents && onAddStudent && !isAddingStudent && (
              <button
                type="button"
                onClick={() => setIsAddingStudent(true)}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Aluno</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Student Form */}
        {isAddingStudent && (
          <form
            onSubmit={handleCreateStudent}
            className="mt-4 p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-2 animate-in fade-in"
          >
            <input
              type="text"
              autoFocus
              placeholder="Nome completo do novo estudante..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="flex-1 text-xs sm:text-sm font-medium px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAddingStudent(false);
                  setNewStudentName('');
                }}
                className="py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Salvar Aluno
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Bar */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar aluno por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Exibindo:</span>
            <button
              type="button"
              onClick={() => setFilterStarOnly(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                !filterStarOnly
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({classStudents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStarOnly(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filterStarOnly
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>Estrelas ({starCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {searchTerm ? 'Nenhum estudante encontrado com este nome.' : 'Nenhum estudante nesta turma.'}
          </div>
        ) : (
          filteredStudents.map((st) => {
            const catInfo = st.starCategory ? CATEGORY_LABELS[st.starCategory] : null;

            return (
              <div
                key={st.id}
                className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                  st.isStar ? 'bg-amber-50/20' : ''
                }`}
              >
                {/* Roll Number & Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {String(st.rollNumber).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {st.name}
                      </span>

                      {/* Star Badge if starred */}
                      {st.isStar && (
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForModal(st)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md hover:bg-amber-200 transition-colors cursor-pointer shrink-0"
                          title={st.starReason || 'Aluno Destaque'}
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                          <span>Destaque ⭐</span>
                          {catInfo && (
                            <span className="text-amber-800 font-normal">
                              ({catInfo.label})
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Star Reason excerpt if present */}
                    {st.isStar && st.starReason && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 max-w-xl">
                        💡 {st.starReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: Toggle Star, Insert into Question, or Manage */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Star Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickStarToggle(st)}
                    className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      st.isStar
                        ? 'bg-amber-400 text-slate-950 hover:bg-amber-500 font-bold shadow-2xs'
                        : 'border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50'
                    }`}
                    title={st.isStar ? 'Editar ou remover estrela' : 'Conceder estrela de destaque a este aluno'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        st.isStar ? 'fill-slate-950 text-slate-950' : 'text-slate-400'
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {st.isStar ? 'Estrela Ativa' : 'Destacar ⭐'}
                    </span>
                  </button>

                  {/* Insert Name Button (for teachers filling report questions) */}
                  {onInsertStudentToQuestion && (
                    <button
                      type="button"
                      onClick={() => handleInsertClick(st)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        copiedStudentId === st.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                      }`}
                      title="Inserir nome deste aluno no campo de resposta"
                    >
                      {copiedStudentId === st.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Inserido</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="hidden sm:inline">Inserir</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Admin Delete Action */}
                  {canManageStudents && onDeleteStudent && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remover aluno "${st.name}" da turma?`)) {
                          onDeleteStudent(st.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir estudante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Star Student Modal for Category & Reason editing */}
      <StarStudentModal
        student={selectedStudentForModal}
        teacherName={currentTeacherName}
        onClose={() => setSelectedStudentForModal(null)}
        onSaveStar={(studentId, details) => {
          onToggleStar(studentId, details);
          setSelectedStudentForModal(null);
        }}
      />
    </div>
  );
};
