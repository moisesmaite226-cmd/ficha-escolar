import React, { useState } from 'react';
import { User, SchoolConfig } from '../types';
import {
  GraduationCap,
  LogIn,
  KeyRound,
  User as UserIcon,
  Shield,
  BookOpen,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';

interface LoginViewProps {
  allUsers: User[];
  schoolConfig: SchoolConfig;
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  allUsers,
  schoolConfig,
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const found = allUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        u.email.toLowerCase() === cleanUser
    );

    if (found) {
      onLogin(found);
    } else {
      setError(
        'Usuário ou senha não encontrados. Selecione um dos perfis rápidos abaixo para entrar.'
      );
    }
  };

  const handleQuickLogin = (user: User) => {
    onLogin(user);
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-slate-100 to-blue-50/40">
      <div className="w-full max-w-md">
        {/* School Header Identity */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-700 text-white shadow-xl shadow-blue-700/25 mb-3">
            <GraduationCap className="w-9 h-9" />
          </div>
          <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200 mb-2">
            Ambiente Pedagógico Digital
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {schoolConfig.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {schoolConfig.subtitle} • {schoolConfig.documentTitle}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Acesso ao Sistema
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Digite seu usuário escolar ou clique em seu nome abaixo:
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username-input"
                className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
              >
                Usuário ou E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: carlos, ana, ou admin"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-11 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-11 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ambiente de demonstração (qualquer senha é aceita).
              </p>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Entrar no Pré-Conselho
            </button>
          </form>

          {/* Google Login Option */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              id="login-google-btn"
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Continuar com Google Escolar
            </button>
          </div>

          {/* Quick Access Profiles for Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Acesso Rápido de Teste (1 Clique)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="space-y-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 flex items-center justify-between transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {u.role === 'admin'
                          ? 'Coordenação Pedagógica'
                          : u.subject || 'Professor'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-white group-hover:bg-blue-600 group-hover:text-white px-2 py-1 rounded-lg border border-slate-200 transition-colors">
                    Entrar
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Interface adaptada para navegação simples e intuitiva de professores.
        </p>
      </div>

      {/* Google Sign In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Integração Google Workspace / Google Classroom
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              O módulo de autenticação Google SSO escolar está pronto para ser
              vinculado ao domínio da Secretaria de Educação.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mb-4 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-800">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Sincronização com e-mail institucional
              </div>
              <p className="text-[11px] text-slate-500">
                Permite login direto com contas @escola.gov.br ou
                @escola.pr.gov.br.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowGoogleModal(false);
                onLogin(allUsers[0]); // log in with first teacher
              }}
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mb-2"
            >
              Simular Entrada com Google (Prof. Carlos)
            </button>
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
