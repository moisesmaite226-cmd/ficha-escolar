import React from 'react';
import { Report, QuestionSection, QuestionItem, SchoolConfig } from '../types';
import { X, Download, Printer, CheckCircle2, User, Calendar, BookOpen, GraduationCap } from 'lucide-react';

interface ReportModalProps {
  report: Report | null;
  onClose: () => void;
  sections: QuestionSection[];
  questions: QuestionItem[];
  schoolConfig: SchoolConfig;
  onExportPDF: (report: Report) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  report,
  onClose,
  sections,
  questions,
  schoolConfig,
  onExportPDF,
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = report.date
    ? report.date.split('-').reverse().join('/')
    : '__/__/____';

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        {/* Top Control Header (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full">
              Ficha Pré-Conselho
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ID: {report.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2 px-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => onExportPDF(report)}
              className="py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Physical Sheet (Exact layout from the 2 photos) */}
        <div className="p-6 sm:p-10 max-h-[78vh] overflow-y-auto print:max-h-none print:p-0">
          <div className="border-2 border-slate-800 p-6 sm:p-8 rounded-2xl bg-white shadow-2xs">
            {/* Header with School Crest & Title */}
            <div className="text-center pb-4 mb-4 border-b-2 border-slate-800">
              <div className="flex items-center justify-center gap-2 text-slate-900 font-black text-xs sm:text-sm md:text-base tracking-wide uppercase">
                <GraduationCap className="w-5 h-5 inline text-slate-800" />
                <span>{schoolConfig.name}</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {schoolConfig.subtitle}
              </p>
              <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 uppercase tracking-wider mt-3 underline decoration-slate-400 underline-offset-4">
                {schoolConfig.documentTitle}
              </h3>
            </div>

            {/* Document Details Grid (matching physical paper form: Componente, Data, Professor(a), Turma) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs pb-4 mb-5 border-b border-slate-300">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 uppercase">
                  Componente:
                </span>
                <span className="font-medium text-slate-800 underline decoration-dotted flex-1">
                  {report.subject || 'Geral'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 uppercase">Data:</span>
                <span className="font-medium text-slate-800 underline decoration-dotted">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 uppercase">
                  Professor(a):
                </span>
                <span className="font-medium text-slate-800 underline decoration-dotted flex-1">
                  {report.teacherName}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 uppercase">Turma:</span>
                <span className="font-medium text-slate-800 underline decoration-dotted">
                  {report.className}
                </span>
              </div>
            </div>

            {/* Questions by Section */}
            <div className="space-y-6">
              {sortedSections.map((sec) => {
                const secQuestions = questions
                  .filter((q) => q.sectionId === sec.id)
                  .sort((a, b) => a.order - b.order);

                if (secQuestions.length === 0) return null;

                return (
                  <div key={sec.id} className="space-y-3">
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase bg-slate-100 p-2 rounded-lg border border-slate-200">
                      {sec.title}
                    </h4>

                    <div className="space-y-3.5 pl-2">
                      {secQuestions.map((q) => {
                        const answer = report.answers[q.id];
                        return (
                          <div key={q.id} className="space-y-1 text-xs">
                            <p className="font-bold text-slate-800">
                              {q.prompt}
                            </p>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed min-h-12 whitespace-pre-wrap">
                              {answer && answer.trim() ? (
                                answer
                              ) : (
                                <span className="text-slate-400 italic">
                                  (Sem observações registradas)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Official Signatures Block (at bottom, matching physical paper form) */}
            <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-1">
                <div className="border-b border-slate-400 w-4/5 mx-auto mb-2" />
                <p className="font-bold text-slate-900">
                  Assinatura do(a) professor(a)
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {report.teacherName}
                </p>
              </div>

              <div className="space-y-1">
                <div className="border-b border-slate-400 w-4/5 mx-auto mb-2" />
                <p className="font-bold text-slate-900">Assinatura da pedagoga</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {schoolConfig.pedagogueName}
                </p>
              </div>

              <div className="space-y-1">
                <div className="border-b border-slate-400 w-4/5 mx-auto mb-2" />
                <p className="font-bold text-slate-900">Assinatura da diretora</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {schoolConfig.principalName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden text-xs text-slate-500">
          <span>
            Documento emitido pelo Sistema de Pré-Conselho de Classe.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
