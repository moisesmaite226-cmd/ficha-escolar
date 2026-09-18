import React, { useState, useEffect } from 'react';
import { PushNotification, User } from '../types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Send,
  Volume2,
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  currentUser: User;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSendNotification?: (
    title: string,
    message: string,
    targetTeacherId?: string
  ) => void;
  teachers?: User[];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onMarkAsRead,
  onMarkAllAsRead,
  onSendNotification,
  teachers = [],
}) => {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [activeTab, setActiveTab] = useState<'inbox' | 'send'>('inbox');
  const [newTitle, setNewTitle] = useState('Lembrete de Envio do Pré-Conselho');
  const [newMessage, setNewMessage] = useState(
    'Favor verificar as turmas e alunos pendentes. A reunião colegiada acontecerá em breve!'
  );
  const [targetTeacher, setTargetTeacher] = useState<string>('');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações de desktop.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        new Notification('Notificações Ativadas!', {
          body: 'Você receberá avisos sobre prazos e pendências do Pré-Conselho escolar.',
          icon: '/favicon.ico',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSendNotification || !newTitle.trim() || !newMessage.trim()) return;

    onSendNotification(newTitle, newMessage, targetTeacher || undefined);

    // Also trigger desktop notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`[Escola] ${newTitle}`, {
          body: newMessage,
        });
      } catch (e) {
        console.log(e);
      }
    }

    setTestSent(true);
    setTimeout(() => {
      setTestSent(false);
      setActiveTab('inbox');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Lembretes & Notificações
              </h2>
              <p className="text-xs text-slate-500">
                Acompanhamento e prazos do Pré-Conselho de Classe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector for Admin */}
        {currentUser.role === 'admin' && (
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('inbox')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'inbox'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Mural de Avisos ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('send')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'send'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Disparar Novo Lembrete
            </button>
          </div>
        )}

        {/* Browser Permission Banner */}
        <div className="px-6 py-3 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-blue-900">
            <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {browserPermission === 'granted'
                ? 'Notificações do navegador estão ativadas.'
                : 'Ative notificações no seu dispositivo para não perder prazos.'}
            </span>
          </div>
          {browserPermission !== 'granted' && (
            <button
              type="button"
              onClick={requestBrowserPermission}
              className="font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              Ativar
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'inbox' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Histórico de Mensagens
                </span>
                {notifications.some((n) => !n.isRead) && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">Nenhum aviso no momento</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Você receberá lembretes conforme os prazos se aproximem.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isUnread = !notif.isRead;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => onMarkAsRead(notif.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isUnread
                          ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                          : 'bg-white border-slate-200 opacity-90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5">
                          {notif.type === 'reminder' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4
                              className={`text-xs sm:text-sm font-bold ${
                                isUnread ? 'text-slate-900' : 'text-slate-700'
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-2 block">
                              {new Date(notif.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                        {isUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Admin Send Reminder Form */
            <form onSubmit={handleSendReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destinatário
                </label>
                <select
                  value={targetTeacher}
                  onChange={(e) => setTargetTeacher(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Todos os Professores da Escola</option>
                  {teachers
                    .filter((t) => t.role === 'teacher')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.subject || 'Professor'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título do Lembrete
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mensagem / Instrução Pedagógica
                </label>
                <textarea
                  rows={3}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={testSent}
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {testSent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      Lembrete Enviado com Sucesso!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Disparar Notificação para os Professores
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
