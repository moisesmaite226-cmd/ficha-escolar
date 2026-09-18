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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* School Brand / Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Pré-Conselho Digital
                </span>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                  {schoolConfig.period}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                {schoolConfig.name}
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">
                {schoolConfig.subtitle}
              </p>
            </div>
          </div>

          {/* User Controls & Quick Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Push Notifications Bell */}
            <button
              id="header-notification-btn"
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              title="Notificações e Lembretes"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-600 rounded-full ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Switch User (Demonstration Utility) */}
            <div className="relative">
              <button
                id="header-switch-user-btn"
                type="button"
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center space-x-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    {currentUser.role === 'admin' ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                        <Shield className="w-3 h-3 inline" /> Coordenação / Admin
                      </span>
                    ) : (
                      <span className="text-blue-700 font-medium flex items-center gap-0.5">
                        <BookOpen className="w-3 h-3 inline" /> Professor
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showSwitchMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSwitchMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Trocar Perfil de Acesso
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Selecione um professor ou coordenação para testar:
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
                                ? 'bg-blue-50 text-blue-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
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
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate leading-tight">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {u.role === 'admin'
                                  ? 'Painel Administrativo'
                                  : u.subject || 'Professor'}
                              </p>
                            </div>
                            {isCurrent && (
                              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSwitchMenu(false);
                          if (
                            confirm(
                              'Deseja redefinir todos os relatórios e perguntas para os dados de demonstração originais?'
                            )
                          ) {
                            onResetData();
                          }
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Restaurar Dados de Demonstração
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              type="button"
              onClick={onLogout}
              className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              title="Sair do Sistema"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
