import {
  User,
  ClassGroup,
  Student,
  QuestionSection,
  QuestionItem,
  Report,
  PushNotification,
  SchoolConfig,
  SystemBackup,
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

export function saveUsers(users: User[]): void {
  setStored(STORAGE_KEYS.USERS, users);
}

export function addUser(user: Omit<User, 'id'>): User {
  const current = getUsers();
  const newUser: User = {
    ...user,
    id: `teacher-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
  };
  saveUsers([...current, newUser]);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): void {
  const current = getUsers();
  const updated = current.map((u) => (u.id === id ? { ...u, ...updates } : u));
  saveUsers(updated);
}

export function deleteUser(id: string): void {
  const current = getUsers();
  saveUsers(current.filter((u) => u.id !== id));
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

export function saveClasses(classes: ClassGroup[]): void {
  setStored(STORAGE_KEYS.CLASSES, classes);
}

export function addClass(newCls: Omit<ClassGroup, 'id'>): ClassGroup {
  const current = getClasses();
  const id = `turma-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`;
  const created: ClassGroup = {
    ...newCls,
    id,
  };
  saveClasses([...current, created]);
  return created;
}

export function deleteClass(classId: string): void {
  const current = getClasses();
  saveClasses(current.filter((c) => c.id !== classId));
}

export function getStudents(): Student[] {
  return getStored<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
}

export function saveStudents(students: Student[]): void {
  setStored(STORAGE_KEYS.STUDENTS, students);
}

export function getStudentsByClass(classId: string): Student[] {
  const students = getStudents();
  return students.filter((s) => s.classId === classId);
}

export function addStudent(newSt: Omit<Student, 'id'>): Student {
  const current = getStudents();
  const id = `st-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 4)}`;
  const created: Student = {
    ...newSt,
    id,
  };
  saveStudents([...current, created]);
  return created;
}

export function updateStudent(id: string, updates: Partial<Student>): void {
  const current = getStudents();
  const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveStudents(updated);
}

export function deleteStudent(id: string): void {
  const current = getStudents();
  saveStudents(current.filter((s) => s.id !== id));
}

export function toggleStudentStar(
  id: string,
  details?: {
    isStar?: boolean;
    starCategory?: 'academic' | 'attitude' | 'improvement' | 'creativity';
    starReason?: string;
    starAddedBy?: string;
  }
): Student | null {
  const current = getStudents();
  const student = current.find((s) => s.id === id);
  if (!student) return null;

  const newIsStar = details?.isStar !== undefined ? details.isStar : !student.isStar;
  const updatedStudent: Student = {
    ...student,
    isStar: newIsStar,
    starCategory: newIsStar ? details?.starCategory || student.starCategory || 'academic' : undefined,
    starReason: newIsStar ? details?.starReason || student.starReason || 'Aluno destaque da turma no bimestre' : undefined,
    starAddedBy: newIsStar ? details?.starAddedBy || student.starAddedBy || 'Conselho Docente' : undefined,
  };

  const updatedList = current.map((s) => (s.id === id ? updatedStudent : s));
  saveStudents(updatedList);
  return updatedStudent;
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

// Full System Backup and Restore
export function exportAllDataAsBackup(): SystemBackup {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    schoolConfig: getSchoolConfig(),
    users: getUsers(),
    classes: getClasses(),
    students: getStudents(),
    sections: getQuestionSections(),
    questions: getQuestions(),
    reports: getReports(),
    notifications: getNotifications(),
  };
}

export function importDataBackup(backup: Partial<SystemBackup>): boolean {
  try {
    if (backup.schoolConfig) setStored(STORAGE_KEYS.CONFIG, backup.schoolConfig);
    if (backup.users && Array.isArray(backup.users)) setStored(STORAGE_KEYS.USERS, backup.users);
    if (backup.classes && Array.isArray(backup.classes)) setStored(STORAGE_KEYS.CLASSES, backup.classes);
    if (backup.students && Array.isArray(backup.students)) setStored(STORAGE_KEYS.STUDENTS, backup.students);
    if (backup.sections && Array.isArray(backup.sections)) setStored(STORAGE_KEYS.SECTIONS, backup.sections);
    if (backup.questions && Array.isArray(backup.questions)) setStored(STORAGE_KEYS.QUESTIONS, backup.questions);
    if (backup.reports && Array.isArray(backup.reports)) setStored(STORAGE_KEYS.REPORTS, backup.reports);
    if (backup.notifications && Array.isArray(backup.notifications)) setStored(STORAGE_KEYS.NOTIFICATIONS, backup.notifications);
    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
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
