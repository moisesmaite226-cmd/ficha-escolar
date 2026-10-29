import React, { useState } from 'react';
import { User, PushNotification, SchoolConfig } from '../types';
import {
  GraduationCap,
  LogOut,
  Bell,
  UserCheck,
  Shield,
  BookOpen,
  ChevronDown,
  RefreshCw,
  Download,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  schoolConfig: SchoolConfig;
  notifications: PushNotification[];
  onSelectUser: (user: User) => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  schoolConfig,
  notifications,
  onSelectUser,
  onLogout,
  onOpenNotifications,
  onResetData,
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleDownloadStandaloneHtml = () => {
    window.open('/index.html', '_blank');
  };

  return (
    <header className="bg-black border-b border-[#162c64] sticky top-0 z-40 shadow-lg print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Identidade da Escola */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0b1736] border border-[#1d397e] text-white flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="text-white">Conselho de Classe</span>
                <span>·</span>
                <span className="text-blue-300">{schoolConfig.period}</span>
              </div>
              <h1 className="text-xs sm:text-sm font-black text-white truncate tracking-tight">
                {schoolConfig.name}
              </h1>
            </div>
          </div>

          {/* Controles e Usuário */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Notificações */}
            <button
              id="header-notification-btn"
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-[#0b1736] hover:bg-[#10214c] border border-[#162c64] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Notificações e Lembretes"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-black" />
              )}
            </button>

            {/* Perfil Atual & Troca Rápida */}
            <div className="relative">
              <button
                id="header-switch-user-btn"
                type="button"
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center space-x-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-[#162c64] bg-[#0b1736] hover:bg-[#10214c] transition-colors cursor-pointer text-left"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                    currentUser.role === 'admin'
                      ? 'bg-white text-[#071026]'
                      : 'bg-black text-white border border-[#162c64]'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-black text-white leading-tight truncate max-w-36">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    {currentUser.role === 'admin' ? (
                      <span className="text-amber-300 font-bold flex items-center gap-0.5">
                        <Shield className="w-3 h-3 inline" /> Diretoria
                      </span>
                    ) : (
                      <span className="text-blue-300 font-medium flex items-center gap-0.5 truncate max-w-32">
                        <BookOpen className="w-3 h-3 inline" /> {currentUser.subject || 'Professor'}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Menu Dropdown */}
              {showSwitchMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSwitchMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-black rounded-2xl shadow-2xl border border-[#162c64] py-2 z-50">
                    <div className="px-3.5 py-2 border-b border-[#162c64]">
                      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Trocar Perfil Docente
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Alterne entre professor e direção para testar:
                      </p>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {allUsers.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              onSelectUser(u);
                              setShowSwitchMenu(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-3 transition-colors ${
                              isCurrent
                                ? 'bg-[#0b1736] text-white font-bold'
                                : 'hover:bg-[#071026] text-slate-300'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                u.role === 'admin'
                                  ? 'bg-white text-[#071026]'
                                  : 'bg-[#162c64] text-white'
                              }`}
                            >
                              {u.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold truncate leading-tight text-white">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {u.role === 'admin'
                                  ? 'Diretoria / Coordenação'
                                  : u.subject || 'Professor'}
                              </p>
                            </div>
                            {isCurrent && (
                              <UserCheck className="w-4 h-4 text-white shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-[#162c64] mt-1 pt-1 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSwitchMenu(false);
                          if (
                            confirm(
                              'Deseja redefinir os dados para o padrão original de fábrica?'
                            )
                          ) {
                            onResetData();
                          }
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs text-slate-400 hover:text-white hover:bg-[#0b1736] rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Restaurar Dados Originais
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Botão de Sair */}
            <button
              id="header-logout-btn"
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#0b1736] transition-colors cursor-pointer"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
