import {
  User,
  ClassGroup,
  Student,
  QuestionSection,
  QuestionItem,
  Report,
  PushNotification,
  SchoolConfig,
} from '../types';
import {
  INITIAL_SCHOOL_CONFIG,
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_SECTIONS,
  INITIAL_QUESTIONS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'portal_escolar_users_v1',
  CURRENT_USER: 'portal_escolar_current_user_v1',
  CLASSES: 'portal_escolar_classes_v1',
  STUDENTS: 'portal_escolar_students_v1',
  SECTIONS: 'portal_escolar_sections_v1',
  QUESTIONS: 'portal_escolar_questions_v1',
  REPORTS: 'portal_escolar_reports_v1',
  NOTIFICATIONS: 'portal_escolar_notifications_v1',
  CONFIG: 'portal_escolar_config_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

// User Services
export function getUsers(): User[] {
  return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser(): User | null {
  return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // default to Carlos Silva for easy start
}

export function setCurrentUser(user: User | null): void {
  setStored<User | null>(STORAGE_KEYS.CURRENT_USER, user);
}

// Class & Student Services
export function getClasses(): ClassGroup[] {
  return getStored<ClassGroup[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
}

export function getStudents(): Student[] {
  return getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
}

export function getStudentsByClass(classId: string): Student[] {
  const students = getStudents();
  return students.filter((s) => s.classId === classId);
}

// Questionnaire Structure Services (Dynamic questionnaire edited by Admin)
export function getQuestionSections(): QuestionSection[] {
  return getStored<QuestionSection[]>(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
}

export function saveQuestionSections(sections: QuestionSection[]): void {
  setStored(STORAGE_KEYS.SECTIONS, sections);
}

export function getQuestions(): QuestionItem[] {
  const questions = getStored<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  return questions.sort((a, b) => a.order - b.order);
}

export function saveQuestions(questions: QuestionItem[]): void {
  setStored(STORAGE_KEYS.QUESTIONS, questions);
}

export function addQuestion(question: Omit<QuestionItem, 'id' | 'order'>): QuestionItem {
  const current = getQuestions();
  const newQuestion: QuestionItem = {
    ...question,
    id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    order: current.length + 1,
  };
  saveQuestions([...current, newQuestion]);
  return newQuestion;
}

export function updateQuestion(id: string, updates: Partial<QuestionItem>): void {
  const current = getQuestions();
  const updated = current.map((q) => (q.id === id ? { ...q, ...updates } : q));
  saveQuestions(updated);
}

export function deleteQuestion(id: string): void {
  const current = getQuestions();
  const filtered = current.filter((q) => q.id !== id);
  saveQuestions(filtered);
}

// Report Services
export function getReports(): Report[] {
  return getStored<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
}

export function saveReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Report {
  const reports = getReports();
  const now = new Date().toISOString();

  if (report.id) {
    const existingIndex = reports.findIndex((r) => r.id === report.id);
    if (existingIndex !== -1) {
      const updated: Report = {
        ...reports[existingIndex],
        ...report,
        id: report.id,
        updatedAt: now,
      };
      reports[existingIndex] = updated;
      setStored(STORAGE_KEYS.REPORTS, reports);
      return updated;
    }
  }

  const newReport: Report = {
    ...report,
    id: report.id || `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  reports.unshift(newReport);
  setStored(STORAGE_KEYS.REPORTS, reports);
  return newReport;
}

export function deleteReport(id: string): void {
  const reports = getReports();
  const filtered = reports.filter((r) => r.id !== id);
  setStored(STORAGE_KEYS.REPORTS, filtered);
}

// Push Notifications & Reminders
export function getNotifications(): PushNotification[] {
  return getStored<PushNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

export function addNotification(notif: Omit<PushNotification, 'id' | 'date' | 'isRead'>): PushNotification {
  const list = getNotifications();
  const newNotif: PushNotification = {
    ...notif,
    id: `notif-${Date.now()}`,
    date: new Date().toISOString(),
    isRead: false,
  };
  list.unshift(newNotif);
  setStored(STORAGE_KEYS.NOTIFICATIONS, list);
  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const list = getNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
}

export function markAllNotificationsAsRead(): void {
  const list = getNotifications();
  const updated = list.map((n) => ({ ...n, isRead: true }));
  setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
}

// School Config
export function getSchoolConfig(): SchoolConfig {
  return getStored<SchoolConfig>(STORAGE_KEYS.CONFIG, INITIAL_SCHOOL_CONFIG);
}

export function saveSchoolConfig(config: SchoolConfig): void {
  setStored(STORAGE_KEYS.CONFIG, config);
}

// Reset data
export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.CLASSES);
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.SECTIONS);
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.REPORTS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
}
