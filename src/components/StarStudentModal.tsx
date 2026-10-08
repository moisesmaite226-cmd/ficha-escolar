import React, { useState } from 'react';
import { Student } from '../types';
import { Star, X, Check, Award, Sparkles, HeartHandshake, TrendingUp, Lightbulb } from 'lucide-react';

interface StarStudentModalProps {
  student: Student | null;
  teacherName?: string;
  onClose: () => void;
  onSaveStar: (
    studentId: string,
    details: {
      isStar: boolean;
      starCategory?: 'academic' | 'attitude' | 'improvement' | 'creativity';
      starReason?: string;
      starAddedBy?: string;
    }
  ) => void;
}

const CATEGORIES: {
  id: 'academic' | 'attitude' | 'improvement' | 'creativity';
  label: string;
  desc: string;
  icon: typeof Award;
  defaultReason: string;
}[] = [
  {
    id: 'academic',
    label: 'Desempenho Acadêmico',
    desc: 'Notas elevadas, assimilação exemplar dos conteúdos e raciocínio lógico.',
    icon: Award,
    defaultReason: 'Excelente rendimento acadêmico, notas exemplares e dedicação aos estudos.',
  },
  {
    id: 'attitude',
    label: 'Atitude & Cooperação',
    desc: 'Liderança positiva, respeito aos colegas e professores, e assiduidade.',
    icon: HeartHandshake,
    defaultReason: 'Postura respeitosa, excelente convivência, colaboração e liderança positiva.',
  },
  {
    id: 'improvement',
    label: 'Superação & Evolução',
    desc: 'Salto qualitativo no aprendizado, esforço individual e persistência.',
    icon: TrendingUp,
    defaultReason: 'Notável progresso na aprendizagem, superação de dificuldades e esforço contínuo.',
  },
  {
    id: 'creativity',
    label: 'Criatividade & Protagonismo',
    desc: 'Iniciativa em projetos, pensamento crítico, curiosidade e proatividade.',
    icon: Lightbulb,
    defaultReason: 'Protagonismo destacado, iniciativa em sala de aula e pensamento criativo.',
  },
];

export const StarStudentModal: React.FC<StarStudentModalProps> = ({
  student,
  teacherName,
  onClose,
  onSaveStar,
}) => {
  if (!student) return null;

  const [category, setCategory] = useState<'academic' | 'attitude' | 'improvement' | 'creativity'>(
    student.starCategory || 'academic'
  );
  const [reason, setReason] = useState<string>(
    student.starReason || CATEGORIES[0].defaultReason
  );
  const [isStar, setIsStar] = useState<boolean>(student.isStar ?? true);

  const handleCategorySelect = (catId: 'academic' | 'attitude' | 'improvement' | 'creativity') => {
    setCategory(catId);
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (cat && (!reason || CATEGORIES.some((c) => c.defaultReason === reason))) {
      setReason(cat.defaultReason);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStar(student.id, {
      isStar,
      starCategory: isStar ? category : undefined,
      starReason: isStar ? reason.trim() : undefined,
      starAddedBy: isStar ? (student.starAddedBy || teacherName || 'Conselho Docente') : undefined,
    });
    onClose();
  };

  const handleRemoveStar = () => {
    onSaveStar(student.id, {
      isStar: false,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                <span>Reconhecimento Pedagógico</span>
                <span aria-hidden="true">·</span>
                <span>Aluno Destaque ⭐</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {student.name}
              </h3>
              <p className="text-xs text-slate-400">Número de Chamada #{student.rollNumber}</p>
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

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
          {/* Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-950">Atribuir Estrela de Mérito</p>
                <p className="text-[11px] text-amber-800">
                  Destaca o aluno na ata oficial e no conselho de classe.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isStar}
                onChange={(e) => setIsStar(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {isStar && (
            <>
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Categoria do Destaque:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-amber-400 text-slate-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {cat.label}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Justification / Reason */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Motivo / Observação do Destaque:
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva por que o aluno merece este reconhecimento pedagógico..."
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Added By Reference */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span>Registrado por: <strong>{student.starAddedBy || teacherName || 'Conselho Docente'}</strong></span>
              </div>
            </>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {student.isStar ? (
              <button
                type="button"
                onClick={handleRemoveStar}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
              >
                Remover Estrela
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Reconhecimento</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
