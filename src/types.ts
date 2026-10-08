export type UserRole = 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  subject?: string; // Componente curricular (ex: Matemática, Língua Portuguesa)
  assignedClassIds: string[];
  avatar?: string;
}

export interface ClassGroup {
  id: string;
  name: string; // Ex: '6º Ano A'
  shift: string; // 'Integral' | 'Manhã' | 'Tarde'
  grade: string;
  studentCount: number;
}

export interface Student {
  id: string;
  classId: string;
  name: string;
  rollNumber: number;
  isStar?: boolean;
  starReason?: string;
  starCategory?: 'academic' | 'attitude' | 'improvement' | 'creativity';
  starAddedBy?: string;
  notes?: string;
}

export interface QuestionSection {
  id: string;
  title: string;
  order: number;
}

export interface QuestionItem {
  id: string;
  sectionId: string;
  prompt: string;
  type: 'textarea' | 'text' | 'rating' | 'choice';
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[]; // for choice type
  order: number;
}

export interface Report {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subject: string; // Componente Curricular
  date: string; // YYYY-MM-DD
  period?: string; // Ex: '1º Bimestre', '2º Bimestre'
  answers: Record<string, string>; // questionId -> answer
  status: 'submitted' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  targetTeacherId?: string; // empty means all teachers
  targetClassName?: string;
  isRead: boolean;
  type: 'reminder' | 'system' | 'success';
}

export interface SchoolConfig {
  name: string;
  subtitle: string;
  documentTitle: string;
  period: string; // e.g. '1º Bimestre'
  pedagogueName: string;
  principalName: string;
}

export interface SystemBackup {
  version: string;
  exportDate: string;
  schoolConfig: SchoolConfig;
  users: User[];
  classes: ClassGroup[];
  students: Student[];
  sections: QuestionSection[];
  questions: QuestionItem[];
  reports: Report[];
  notifications: PushNotification[];
}
