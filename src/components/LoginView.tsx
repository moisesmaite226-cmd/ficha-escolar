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
  Search,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Users,
  CheckCircle2,
  X,
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
  // Tabs: 'quick' (1-click profiles) or 'credentials' (traditional login)
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');

  // Quick profile filtering
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'admin'>('all');
  const [quickSearch, setQuickSearch] = useState('');

  // Credentials form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Google SSO Modal / Account Picker
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Helper lists
  const teachers = allUsers.filter((u) => u.role === 'teacher');
  const admins = allUsers.filter((u) => u.role === 'admin');

  // Filtered list for Quick Login
  const filteredUsers = allUsers.filter((u) => {
    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'teacher'
        ? u.role === 'teacher'
        : u.role === 'admin';

    const searchLower = quickSearch.trim().toLowerCase();
    if (!searchLower) return matchesRole;

    const matchesName = u.name.toLowerCase().includes(searchLower);
    const matchesSubject = (u.subject || '').toLowerCase().includes(searchLower);
    const matchesUsername = u.username.toLowerCase().includes(searchLower);
    const matchesEmail = u.email.toLowerCase().includes(searchLower);

    return matchesRole && (matchesName || matchesSubject || matchesUsername || matchesEmail);
  });

  // Intelligent matching for typed identifier
  const cleanId = identifier.trim().toLowerCase();
  const matchedUser = cleanId
    ? allUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanId ||
          u.email.toLowerCase() === cleanId ||
          u.name.toLowerCase() === cleanId ||
          u.name.toLowerCase().startsWith(cleanId) ||
          u.username.toLowerCase().startsWith(cleanId)
      )
    : null;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cleanId) {
      setError('Por favor, digite seu nome, usuário ou e-mail.');
      return;
    }

    // Try finding exact match or starting match
    const found =
      allUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanId ||
          u.email.toLowerCase() === cleanId ||
          u.name.toLowerCase() === cleanId
      ) ||
      allUsers.find(
        (u) =>
          u.username.toLowerCase().includes(cleanId) ||
          u.name.toLowerCase().includes(cleanId) ||
          u.email.toLowerCase().includes(cleanId)
      );

    if (found) {
      onLogin(found);
    } else {
      setError(
        'Perfil não localizado com esse nome ou e-mail. Utilize o modo "Acesso Rápido" ao lado para entrar com 1 clique.'
      );
    }
  };

  const handleQuickSelect = (user: User) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-slate-100 to-blue-50/40">
      <div className="w-full max-w-4xl">
        {/* School Header Identity */}
        <div className="text-center mb-6 sm:mb-8 animate-in fade-in duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-900 text-white shadow-md mb-3 ring-4 ring-blue-100">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-blue-800 font-semibold mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100/80 border border-blue-200">
              Ambiente Pedagógico Digital
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-600 font-medium">{schoolConfig.period}</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight tracking-tight">
            {schoolConfig.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            {schoolConfig.subtitle || 'Sistema Integrado do Pré-Conselho de Classe e Atas Pedagógicas'}
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          {/* Top Switcher Tabs */}
          <div className="bg-slate-50/80 border-b border-slate-200 p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                id="login-tab-quick"
                onClick={() => {
                  setActiveTab('quick');
                  setError('');
                }}
                className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Acesso Rápido (1 Clique)</span>
                <span className="hidden sm:inline text-[11px] font-normal text-slate-500">
                  · Recomendado
                </span>
              </button>

              <button
                type="button"
                id="login-tab-credentials"
                onClick={() => {
                  setActiveTab('credentials');
                  setError('');
                }}
                className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'credentials'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Digitar Usuário ou E-mail</span>
              </button>
            </div>

            {/* Google Escolar Button */}
            <button
              type="button"
              id="login-google-btn"
              onClick={() => setShowGoogleModal(true)}
              className="w-full sm:w-auto py-2 px-3.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Entrar com Google Escolar</span>
            </button>
          </div>

          {/* TAB 1: QUICK ACCESS CARDS (EASY & FAST) */}
          {activeTab === 'quick' && (
            <div className="p-5 sm:p-7 space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Selecione seu Perfil para Entrar
                  </h2>
                  <p className="text-xs text-slate-500">
                    Basta 1 clique para entrar no sistema como professor ou coordenação pedagógica:
                  </p>
                </div>

                {/* Sub-filters by Role */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      roleFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({allUsers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('teacher')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      roleFilter === 'teacher'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Professores ({teachers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      roleFilter === 'admin'
                        ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Coordenação ({admins.length})
                  </button>
                </div>
              </div>

              {/* Search filter for profiles */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Filtrar por nome ou disciplina (ex: Carlos, Matemática, Português, Diretoria)..."
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {quickSearch && (
                  <button
                    type="button"
                    onClick={() => setQuickSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* User Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-slate-400 text-xs sm:text-sm">
                    Nenhum perfil encontrado com o termo &quot;{quickSearch}&quot;.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdmin = u.role === 'admin';

                    return (
                      <div
                        key={u.id}
                        onClick={() => handleQuickSelect(u)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleQuickSelect(u);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex items-center justify-between gap-3 group hover:shadow-md ${
                          isAdmin
                            ? 'bg-gradient-to-r from-emerald-50/50 to-slate-50 border-emerald-200/80 hover:border-emerald-400'
                            : 'bg-white hover:bg-blue-50/40 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {/* Avatar */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-xs ${
                              isAdmin
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
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

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 truncate">
                                {u.name}
                              </h3>
                              {isAdmin && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Coordenação
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                              {isAdmin ? (
                                <span className="text-emerald-700 flex items-center gap-1">
                                  <Shield className="w-3 h-3" /> Gestão Escolar & Atas
                                </span>
                              ) : (
                                <span className="text-slate-600 flex items-center gap-1 truncate">
                                  <BookOpen className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span className="truncate">{u.subject || 'Professor'}</span>
                                </span>
                              )}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          <span
                            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-2xs ${
                              isAdmin
                                ? 'bg-emerald-700 group-hover:bg-emerald-800 text-white'
                                : 'bg-slate-900 group-hover:bg-blue-700 text-white'
                            }`}
                          >
                            <span>Entrar</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Informative footer */}
              <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  Ambiente de avaliação pedagógica: clique em qualquer perfil para acessar imediatamente o painel.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS LOGIN (FOR FLEXIBLE / FORM ACCESS) */}
          {activeTab === 'credentials' && (
            <div className="p-6 sm:p-8 max-w-lg mx-auto animate-in fade-in duration-200">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Acesso com E-mail ou Nome de Usuário
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Digite seu usuário escolar, e-mail institucional ou selecione seu nome:
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">⚠️</div>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
                  >
                    Usuário, Nome ou E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      id="username-input"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setError('');
                      }}
                      placeholder="Ex: Carlos, Ana, Roberto, ou admin..."
                      className="w-full text-sm rounded-xl border border-slate-300 pl-11 pr-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                    />
                  </div>

                  {/* Active detection badge */}
                  {matchedUser && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Perfil identificado: <strong>{matchedUser.name}</strong> ({matchedUser.role === 'admin' ? 'Coordenação' : matchedUser.subject})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onLogin(matchedUser)}
                        className="text-xs font-bold underline hover:text-emerald-900 cursor-pointer ml-2"
                      >
                        Entrar agora →
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password-input"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Senha
                    </label>
                    <span className="text-[11px] text-blue-600 font-medium">
                      Demonstração ativa (qualquer senha é aceita)
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm rounded-xl border border-slate-300 pl-11 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 hover:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                    />
                    <span>Lembrar meu usuário neste dispositivo</span>
                  </label>
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

              {/* Fast fill chips */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Preenchimento Automático Rápido:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {allUsers.slice(0, 5).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setIdentifier(u.username);
                        onLogin(u);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {u.name.split(' ')[0]} ({u.role === 'admin' ? 'Coord.' : u.subject?.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          {schoolConfig.name} • Sistema de Gestão e Avaliação Docente do Pré-Conselho
        </p>
      </div>

      {/* Google Sign In Account Chooser Modal */}
      {showGoogleModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <h3 className="text-sm font-bold text-slate-900">
                  Google Workspace Escolar (SSO)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 text-left">
              Escolha uma conta institucional vinculada à Secretaria de Educação para entrar diretamente:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto mb-4 text-left">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setShowGoogleModal(false);
                    onLogin(u);
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 group-hover:text-blue-800">
                    Conectar →
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
