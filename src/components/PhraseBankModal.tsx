import React, { useState } from 'react';
import { PEDAGOGICAL_PHRASES } from '../data/pedagogicalPhrases';
import {
  Lightbulb,
  Search,
  X,
  Plus,
  Check,
  TrendingUp,
  Users,
  AlertCircle,
  Calendar,
  CheckSquare,
  FileText,
} from 'lucide-react';

interface PhraseBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhrase: (phrase: string, append: boolean) => void;
  questionPrompt?: string;
}

export const PhraseBankModal: React.FC<PhraseBankModalProps> = ({
  isOpen,
  onClose,
  onSelectPhrase,
  questionPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentlyInserted, setRecentlyInserted] = useState<string | null>(null);

  if (!isOpen) return null;

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'desenvolvimento':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'participacao':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'dificuldades':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'frequencia':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'encaminhamentos':
        return <CheckSquare className="w-4 h-4 text-indigo-600" />;
      case 'sintese':
        return <FileText className="w-4 h-4 text-rose-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
    }
  };

  const filteredCategories = PEDAGOGICAL_PHRASES.filter(
    (cat) => selectedCategory === 'all' || cat.id === selectedCategory
  );

  const handleInsert = (phrase: string) => {
    onSelectPhrase(phrase, true);
    setRecentlyInserted(phrase);
    setTimeout(() => setRecentlyInserted(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-blue-700 to-indigo-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 shadow-inner">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Banco de Sugestões Pedagógicas
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Clique para inserir pareceres padronizados e agilizar seu preenchimento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Context Banner */}
        {questionPrompt && (
          <div className="bg-blue-50/80 px-5 py-2.5 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900">
            <span className="font-bold shrink-0">Campo atual:</span>
            <span className="line-clamp-1 italic text-blue-800">
              "{questionPrompt}"
            </span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por palavra-chave (ex: leitura, rural, foco, reforço, transporte)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-700 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todas as Frases
            </button>
            {PEDAGOGICAL_PHRASES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-700 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phrases List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredCategories.map((category) => {
            const phrasesToShow = category.phrases.filter((phrase) =>
              phrase.toLowerCase().includes(searchQuery.toLowerCase().trim())
            );

            if (phrasesToShow.length === 0) return null;

            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                  {getCategoryIcon(category.id)}
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {category.name}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    ({phrasesToShow.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {phrasesToShow.map((phrase, idx) => {
                    const isJustAdded = recentlyInserted === phrase;

                    return (
                      <div
                        key={idx}
                        className="group bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-2xl p-3.5 transition-all flex items-start justify-between gap-3 text-left"
                      >
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed group-hover:text-blue-950 flex-1">
                          {phrase}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPhrase(phrase, false);
                              setRecentlyInserted(phrase);
                              setTimeout(() => setRecentlyInserted(null), 2000);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                            title="Substituir todo o texto do campo por esta sugestão"
                          >
                            Substituir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsert(phrase)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              isJustAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-blue-700 border border-slate-200 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Inserido!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Inserir</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Você pode inserir múltiplas frases e editá-las livremente no campo de texto.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
