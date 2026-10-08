import React from 'react';
import { ClassGroup, Student } from '../types';
import { X, Users, Star } from 'lucide-react';
import { StudentRosterPanel } from './StudentRosterPanel';

interface ClassRosterModalProps {
  classGroup: ClassGroup | null;
  students: Student[];
  currentTeacherName?: string;
  onClose: () => void;
  onToggleStar: (
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
  canManageStudents?: boolean;
}

export const ClassRosterModal: React.FC<ClassRosterModalProps> = ({
  classGroup,
  students,
  currentTeacherName,
  onClose,
  onToggleStar,
  onAddStudent,
  onDeleteStudent,
  canManageStudents = false,
}) => {
  if (!classGroup) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-300 font-medium">
                <span>Relação Oficial de Estudantes</span>
                <span aria-hidden="true">·</span>
                <span>Turno {classGroup.shift}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Turma: {classGroup.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <StudentRosterPanel
            classGroup={classGroup}
            students={students}
            currentTeacherName={currentTeacherName}
            onToggleStar={onToggleStar}
            onAddStudent={onAddStudent}
            onDeleteStudent={onDeleteStudent}
            canManageStudents={canManageStudents}
          />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
