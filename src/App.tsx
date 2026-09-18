import React, { useState, useEffect } from 'react';
import {
  User,
  ClassGroup,
  Student,
  QuestionSection,
  QuestionItem,
  Report,
  PushNotification,
  SchoolConfig,
} from './types';
import {
  getUsers,
  getCurrentUser,
  setCurrentUser,
  getClasses,
  getStudents,
  getQuestionSections,
  getQuestions,
  saveQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getReports,
  saveReport,
  deleteReport,
  getNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getSchoolConfig,
  resetAllData,
} from './services/storage';
import { INITIAL_QUESTIONS } from './data/initialData';
import { exportToExcel, exportSingleReportToPDF } from './utils/exportUtils';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportModal } from './components/ReportModal';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<QuestionSection[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(getSchoolConfig());

  // Modals
  const [activeReportModal, setActiveReportModal] = useState<Report | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Initialize data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setUsers(getUsers());
    const storedUser = getCurrentUser();
    setCurrentUserState(storedUser);
    setClasses(getClasses());
    setStudents(getStudents());
    setSections(getQuestionSections());
    setQuestions(getQuestions());
    setReports(getReports());
    setNotifications(getNotifications());
    setSchoolConfig(getSchoolConfig());
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  const handleSaveReport = (
    reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    const saved = saveReport(reportData);
    setReports(getReports());
    return saved;
  };

  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    setReports(getReports());
  };

  const handleAddQuestion = (q: Omit<QuestionItem, 'id' | 'order'>) => {
    addQuestion(q);
    setQuestions(getQuestions());
  };

  const handleUpdateQuestion = (id: string, updates: Partial<QuestionItem>) => {
    updateQuestion(id, updates);
    setQuestions(getQuestions());
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion(id);
    setQuestions(getQuestions());
  };

  const handleResetQuestions = () => {
    saveQuestions(INITIAL_QUESTIONS);
    setQuestions(INITIAL_QUESTIONS);
  };

  const handleSendNotification = (
    title: string,
    message: string,
    targetTeacherId?: string
  ) => {
    addNotification({
      title,
      message,
      targetTeacherId,
      type: 'reminder',
    });
    setNotifications(getNotifications());

    // Native browser push notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.log('Notification API dispatch:', err);
      }
    }
  };

  const handleMarkNotificationAsRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getNotifications());
  };

  const handleMarkAllNotificationsAsRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getNotifications());
  };

  const handleExportExcel = (reportsToExport: Report[]) => {
    exportToExcel(reportsToExport, questions);
  };

  const handleExportPDF = (report: Report) => {
    exportSingleReportToPDF(report, sections, questions, schoolConfig);
  };

  const handleResetAllData = () => {
    resetAllData();
    loadAllData();
  };

  // If no user is logged in, display the Login View
  if (!currentUser) {
    return (
      <LoginView
        allUsers={users.length > 0 ? users : getUsers()}
        schoolConfig={schoolConfig}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Universal Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        schoolConfig={schoolConfig}
        notifications={notifications}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onResetData={handleResetAllData}
      />

      {/* Main Body: Teacher vs Admin View */}
      <main className="flex-1">
        {currentUser.role === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            classes={classes}
            students={students}
            sections={sections}
            questions={questions}
            reports={reports}
            schoolConfig={schoolConfig}
            notifications={notifications}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onResetQuestions={handleResetQuestions}
            onDeleteReport={handleDeleteReport}
            onViewReportModal={(rep) => setActiveReportModal(rep)}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            onSendPushReminder={handleSendNotification}
          />
        ) : (
          <TeacherDashboard
            currentUser={currentUser}
            classes={classes}
            students={students}
            sections={sections}
            questions={questions}
            reports={reports}
            schoolConfig={schoolConfig}
            onSaveReport={handleSaveReport}
            onViewReportModal={(rep) => setActiveReportModal(rep)}
            onExportPDF={handleExportPDF}
          />
        )}
      </main>

      {/* Official Report Modal (Print / PDF) */}
      <ReportModal
        report={activeReportModal}
        onClose={() => setActiveReportModal(null)}
        sections={sections}
        questions={questions}
        schoolConfig={schoolConfig}
        onExportPDF={handleExportPDF}
      />

      {/* Notifications & Push Reminders Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        currentUser={currentUser}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onSendNotification={handleSendNotification}
        teachers={users}
      />

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500 print:hidden">
        <p>
          {schoolConfig.name} • {schoolConfig.subtitle} — Sistema de Gestão do
          Pré-Conselho de Classe
        </p>
      </footer>
    </div>
  );
}
