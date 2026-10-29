import React, { useState } from 'react';
import { User, SchoolConfig } from '../types';
import {
  GraduationCap,
  KeyRound,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
  Shield,
  Lock,
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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cleanId = identifier.trim().toLowerCase();
  const matchedUser = cleanId
    ? allUsers.find(
        (u) =>
          u.username.toLowerCase() === cleanId ||
          u.email.toLowerCase() === cleanId ||
          u.name.toLowerCase() === cleanId ||
          u.name.toLowerCase().includes(cleanId)
      )
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = identifier.trim().toLowerCase();
    if (!cleanInput) {
      setError('Por favor, informe seu usuário ou e-mail institucional.');
      return;
    }

    if (!password.trim()) {
      setError('Senha obrigatória! Digite sua senha de acesso.');
      return;
    }

    const found = allUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanInput ||
        u.email.toLowerCase() === cleanInput ||
        u.name.toLowerCase() === cleanInput ||
        u.name.toLowerCase().includes(cleanInput)
    );

    if (!found) {
      setError('Usuário não localizado no quadro docente ou diretivo.');
      return;
    }

    const expectedPass = found.password || '123456';
    if (password !== expectedPass) {
      setError('Senha incorreta! A senha cadastrada é 123456.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin(found);
    }, 100);
  };

  const handlePickUser = (u: User) => {
    setIdentifier(u.username);
    setPassword('');
    setError('');
    const passInput = document.getElementById('ts-login-password-field');
    if (passInput) {
      passInput.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-4 py-8 bg-[#071026] text-slate-100">
      {/* Barra Superior */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <div className="w-7 h-7 rounded-lg bg-black border border-[#162c64] flex items-center justify-center shadow-xs">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span>SIGEC · Sistema Integrado de Pré-Conselho</span>
        </div>
      </div>

      {/* Card Principal de Login */}
      <div className="w-full max-w-xl space-y-4">
        <div className="bg-black rounded-2xl shadow-2xl border border-[#162c64] p-6 sm:p-8 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-white to-blue-600" />

          {/* Cabeçalho */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#0b1736] border border-[#1d397e] text-white shadow-md mb-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
              {schoolConfig.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
              {schoolConfig.subtitle} · <strong className="text-blue-300">{schoolConfig.period}</strong>
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-[#0b1736] border border-[#162c64] text-xs font-bold text-slate-200">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>Votação Sigilosa e Auditoria Panóptica</span>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed flex-1">{error}</div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo 1: Identificador */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Usuário ou E-mail do Docente / Diretor
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError('');
                }}
                placeholder="Ex: carlos, ana, mariana ou admin"
                className="w-full text-sm font-medium rounded-xl border border-[#162c64] px-4 py-3 bg-[#071026] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all"
              />

              {/* Chips de seleção rápida */}
              <div className="mt-2.5">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Selecione um perfil docente para testar:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allUsers.map((u) => {
                    const isSelected = matchedUser?.id === u.id;
                    const isAdmin = u.role === 'admin';
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handlePickUser(u)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-white text-[#071026] border-white shadow-sm'
                            : isAdmin
                            ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-[#0b1736] text-slate-300 border-[#162c64] hover:bg-[#10214c] hover:text-white'
                        }`}
                      >
                        {u.name.split(' ')[0]} {isAdmin ? '(Direção)' : `(${u.subject?.split(' ')[0] || 'Prof.'})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Campo 2: Senha */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  id="ts-login-password-field"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Digite sua senha cadastrada..."
                  className="w-full text-sm font-medium rounded-xl border border-[#162c64] pl-4 pr-11 py-3 bg-[#071026] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs bg-[#071026] border border-[#162c64] px-3 py-2 rounded-xl text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-white">🔒 Senha padrão:</span>
                  <code className="font-mono font-black text-amber-300 bg-black px-2 py-0.5 rounded border border-[#162c64]">123456</code>
                </span>
                <span className="text-[11px] text-slate-400">Obrigatória para todos</span>
              </div>
            </div>

            {/* Botão de Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-white hover:bg-slate-200 active:bg-slate-300 text-[#071026] font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-[#071026]" />
              <span>{isLoading ? 'Autenticando...' : 'Acessar Pré-Conselho'}</span>
            </button>
          </form>
        </div>

        {/* Quadro de Contas Cadastradas */}
        <div className="bg-black rounded-2xl border border-[#162c64] p-4 shadow-xl">
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#162c64]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Quadro de Acesso Institucional
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              Senha de todos: <strong className="text-white font-mono">123456</strong>
            </span>
          </div>

          <div className="divide-y divide-[#162c64]">
            {allUsers.map((u) => {
              const isAdmin = u.role === 'admin';
              return (
                <div key={u.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isAdmin
                          ? 'bg-white text-[#071026]'
                          : 'bg-[#0b1736] border border-[#162c64] text-white'
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-white truncate flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {isAdmin && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/40 px-1.5 py-0.2 rounded font-black">
                            Diretoria
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {isAdmin ? 'Auditoria Panóptica & Atas' : u.subject} · Login:{' '}
                        <strong className="font-mono text-white">{u.username}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePickUser(u)}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-[#0b1736] hover:bg-[#10214c] border border-[#162c64] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Selecionar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="text-center mt-6 text-xs text-slate-500 font-medium">
        SIGEC · {schoolConfig.name} • Votação Confidencial e Deliberação Coletiva
      </div>
    </div>
  );
};
