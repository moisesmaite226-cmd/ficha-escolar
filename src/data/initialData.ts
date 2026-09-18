import { User, ClassGroup, Student, QuestionSection, QuestionItem, Report, PushNotification, SchoolConfig } from '../types';

export const INITIAL_SCHOOL_CONFIG: SchoolConfig = {
  name: 'ESCOLA ESTADUAL DO CAMPO FREI GRACIANO DROESSLER',
  subtitle: 'ENSINO FUNDAMENTAL EM TEMPO INTEGRAL',
  documentTitle: 'FICHA - PRÉ-CONSELHO DE CLASSE',
  period: '1º Bimestre - Ano Letivo',
  pedagogueName: 'Profª. Cláudia Mendonça (Pedagoga)',
  principalName: 'Profª. Maria Aparecida Ribeiro (Diretora)',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'teacher-1',
    username: 'carlos',
    name: 'Prof. Carlos Silva',
    email: 'carlos.silva@escola.gov.br',
    role: 'teacher',
    subject: 'Matemática e Raciocínio Lógico',
    assignedClassIds: ['turma-6a', 'turma-8a'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'teacher-2',
    username: 'ana',
    name: 'Profª. Ana Paula Souza',
    email: 'ana.souza@escola.gov.br',
    role: 'teacher',
    subject: 'Língua Portuguesa e Redação',
    assignedClassIds: ['turma-7b', 'turma-9a'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'teacher-3',
    username: 'mariana',
    name: 'Profª. Mariana Lima',
    email: 'mariana.lima@escola.gov.br',
    role: 'teacher',
    subject: 'Ciências da Natureza',
    assignedClassIds: ['turma-6a', 'turma-7b'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'teacher-4',
    username: 'roberto',
    name: 'Prof. Roberto Mendes',
    email: 'roberto.mendes@escola.gov.br',
    role: 'teacher',
    subject: 'História e Geografia',
    assignedClassIds: ['turma-8a', 'turma-9a'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin-1',
    username: 'admin',
    name: 'Coordenação Pedagógica / Direção',
    email: 'pedagogico@freigraciano.seed.pr.gov.br',
    role: 'admin',
    assignedClassIds: ['turma-6a', 'turma-7b', 'turma-8a', 'turma-9a'],
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_CLASSES: ClassGroup[] = [
  {
    id: 'turma-6a',
    name: '6º Ano A',
    shift: 'Integral',
    grade: '6º Ano',
    studentCount: 8,
  },
  {
    id: 'turma-7b',
    name: '7º Ano B',
    shift: 'Integral',
    grade: '7º Ano',
    studentCount: 8,
  },
  {
    id: 'turma-8a',
    name: '8º Ano A',
    shift: 'Integral',
    grade: '8º Ano',
    studentCount: 7,
  },
  {
    id: 'turma-9a',
    name: '9º Ano A',
    shift: 'Integral',
    grade: '9º Ano',
    studentCount: 7,
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // 6º Ano A
  { id: 'st-6a-1', classId: 'turma-6a', name: 'Alana Beatriz Costa', rollNumber: 1 },
  { id: 'st-6a-2', classId: 'turma-6a', name: 'Bernardo Ramos Dias', rollNumber: 2 },
  { id: 'st-6a-3', classId: 'turma-6a', name: 'Cauã Henrique Oliveira', rollNumber: 3 },
  { id: 'st-6a-4', classId: 'turma-6a', name: 'Davi Lucca Moreira', rollNumber: 4 },
  { id: 'st-6a-5', classId: 'turma-6a', name: 'Emanuelle Fagundes', rollNumber: 5 },
  { id: 'st-6a-6', classId: 'turma-6a', name: 'Gabriel Pires dos Santos', rollNumber: 6 },
  { id: 'st-6a-7', classId: 'turma-6a', name: 'Heloísa Rodrigues Neves', rollNumber: 7 },
  { id: 'st-6a-8', classId: 'turma-6a', name: 'Igor Matheus Camargo', rollNumber: 8 },

  // 7º Ano B
  { id: 'st-7b-1', classId: 'turma-7b', name: 'Alice Vitória Guimarães', rollNumber: 1 },
  { id: 'st-7b-2', classId: 'turma-7b', name: 'Arthur Fernando Prado', rollNumber: 2 },
  { id: 'st-7b-3', classId: 'turma-7b', name: 'Beatriz Vasconcelos', rollNumber: 3 },
  { id: 'st-7b-4', classId: 'turma-7b', name: 'Enzo Gabriel Nogueira', rollNumber: 4 },
  { id: 'st-7b-5', classId: 'turma-7b', name: 'Isadora Castilho Lopes', rollNumber: 5 },
  { id: 'st-7b-6', classId: 'turma-7b', name: 'Lucas Eduardo Farias', rollNumber: 6 },
  { id: 'st-7b-7', classId: 'turma-7b', name: 'Manuela Silveira Paz', rollNumber: 7 },
  { id: 'st-7b-8', classId: 'turma-7b', name: 'Rafael Teixeira Rocha', rollNumber: 8 },

  // 8º Ano A
  { id: 'st-8a-1', classId: 'turma-8a', name: 'Caio Vinícius Barbosa', rollNumber: 1 },
  { id: 'st-8a-2', classId: 'turma-8a', name: 'Eduarda Cristina Nunes', rollNumber: 2 },
  { id: 'st-8a-3', classId: 'turma-8a', name: 'Felipe Augusto Antunes', rollNumber: 3 },
  { id: 'st-8a-4', classId: 'turma-8a', name: 'Giovanna Meireles Rosa', rollNumber: 4 },
  { id: 'st-8a-5', classId: 'turma-8a', name: 'Gustavo Henrique Borges', rollNumber: 5 },
  { id: 'st-8a-6', classId: 'turma-8a', name: 'Larissa Monteiro Castro', rollNumber: 6 },
  { id: 'st-8a-7', classId: 'turma-8a', name: 'Murilo Sanches Vidal', rollNumber: 7 },

  // 9º Ano A
  { id: 'st-9a-1', classId: 'turma-9a', name: 'Ana Clara Albuquerque', rollNumber: 1 },
  { id: 'st-9a-2', classId: 'turma-9a', name: 'Breno Ribeiro Soares', rollNumber: 2 },
  { id: 'st-9a-3', classId: 'turma-9a', name: 'Daniela Cristina Vargas', rollNumber: 3 },
  { id: 'st-9a-4', classId: 'turma-9a', name: 'Henrique Garcia Toledo', rollNumber: 4 },
  { id: 'st-9a-5', classId: 'turma-9a', name: 'Júlia Gabriela Rezende', rollNumber: 5 },
  { id: 'st-9a-6', classId: 'turma-9a', name: 'Matheus Henrique Correa', rollNumber: 6 },
  { id: 'st-9a-7', classId: 'turma-9a', name: 'Yasmin Stephany Viana', rollNumber: 7 },
];

export const INITIAL_SECTIONS: QuestionSection[] = [
  { id: 'sec-1', title: '1. PANORAMA DA TURMA', order: 1 },
  { id: 'sec-2', title: '2. APRENDIZAGEM E FREQUÊNCIA', order: 2 },
  { id: 'sec-3', title: '3. DESTAQUES E SITUAÇÕES QUE MERECEM ATENÇÃO', order: 3 },
  { id: 'sec-4', title: '4. ENCAMINHAMENTOS', order: 4 },
  { id: 'sec-5', title: '5. SÍNTESE DO PROFESSOR', order: 5 },
];

export const INITIAL_QUESTIONS: QuestionItem[] = [
  // Seção 1
  {
    id: 'q-1',
    sectionId: 'sec-1',
    prompt: 'Como você avalia o desenvolvimento geral da turma em relação à aprendizagem?',
    type: 'textarea',
    placeholder: 'Descreva a evolução do grupo, assimilação dos conteúdos essenciais e ritmo coletivo...',
    required: true,
    helpText: 'Considere o rendimento geral e alcance dos objetivos propostos no período.',
    order: 1,
  },
  {
    id: 'q-2',
    sectionId: 'sec-1',
    prompt: 'Como está a participação, o envolvimento e a postura dos estudantes nas aulas?',
    type: 'textarea',
    placeholder: 'Comente sobre o engajamento nas atividades, cumprimento de prazos, colaboração e convivência...',
    required: true,
    helpText: 'Destaque o clima pedagógico e a cooperação durante os momentos de estudo.',
    order: 2,
  },

  // Seção 2
  {
    id: 'q-3',
    sectionId: 'sec-2',
    prompt: 'Quais habilidades/conteúdos apresentam maior dificuldade para a turma?',
    type: 'textarea',
    placeholder: 'Aponte os tópicos ou competências curriculares que demandaram retomada pedagógica...',
    required: true,
    helpText: 'Foque nos descritores ou conceitos basilares que precisam de reforço.',
    order: 3,
  },
  {
    id: 'q-4',
    sectionId: 'sec-2',
    prompt: 'Há estudantes com baixa frequência ou que necessitam de acompanhamento mais próximo? Quais e por quê?',
    type: 'textarea',
    placeholder: 'Indique os nomes dos estudantes infrequentes e motivos observados (saúde, transporte, desmotivação)...',
    required: true,
    helpText: 'Informação fundamental para atuação da equipe pedagógica e busca ativa.',
    order: 4,
  },

  // Seção 3
  {
    id: 'q-5',
    sectionId: 'sec-3',
    prompt: 'Estudantes que se destacaram positivamente (aprendizagem, participação e responsabilidade ou protagonismo):',
    type: 'textarea',
    placeholder: 'Cite os estudantes que demonstraram excelência, liderança positiva ou salto significativo no aprendizado...',
    required: true,
    helpText: 'Reconhecimento do protagonismo juvenil e atitudes colaborativas.',
    order: 5,
  },
  {
    id: 'q-6',
    sectionId: 'sec-3',
    prompt: 'Estudantes que apresentam dificuldades significativas ou necessitam de intervenção/encaminhamento:',
    type: 'textarea',
    placeholder: 'Especifique os alunos que precisam de apoio pedagógico especializado, reforço no contraturno ou atendimento psicológico...',
    required: true,
    helpText: 'Registro determinante para o plano de recuperação e intervenção pedagógica.',
    order: 6,
  },

  // Seção 4
  {
    id: 'q-7',
    sectionId: 'sec-4',
    prompt: 'Quais estratégias já foram realizadas e quais ações você sugere para o próximo período?',
    type: 'textarea',
    placeholder: 'Aulas práticas, monitoria entre pares, listas direcionadas, atendimento individualizado...',
    required: true,
    helpText: 'Propostas concretas que podem ser acordadas no Pré-Conselho e Conselho.',
    order: 7,
  },
  {
    id: 'q-8',
    sectionId: 'sec-4',
    prompt: 'Há alguma observação importante que deve ser registrada no Pré-Conselho?',
    type: 'textarea',
    placeholder: 'Observações sobre material didático, dinâmica de sala, interlocução com as famílias ou infraestrutura...',
    required: false,
    helpText: 'Campo opcional para considerações complementares relevantes.',
    order: 8,
  },

  // Seção 5
  {
    id: 'q-9',
    sectionId: 'sec-5',
    prompt: 'Deixe aqui uma observação geral sobre a turma e/ou sobre algum estudante que considere relevante para o Conselho de Classe:',
    type: 'textarea',
    placeholder: 'Parecer final do professor para compor a ata e o diálogo do Conselho de Classe...',
    required: true,
    helpText: 'Este texto será lido e considerado diretamente na reunião colegiada.',
    order: 9,
  },
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    classId: 'turma-6a',
    className: '6º Ano A',
    teacherId: 'teacher-1',
    teacherName: 'Prof. Carlos Silva',
    subject: 'Matemática e Raciocínio Lógico',
    date: '2026-09-12',
    status: 'submitted',
    answers: {
      'q-1': 'A turma demonstra bom ritmo de aprendizagem nas quatro operações básicas e frações. Há interesse geral por desafios de raciocínio lógico.',
      'q-2': 'Participação ativa e colaborativa nos trabalhos em grupo. O envolvimento nas aulas é produtivo, mantendo os cadernos organizados.',
      'q-3': 'Geometria espacial e interpretação de problemas com enunciados extensos ainda demandam maior atenção.',
      'q-4': 'Bernardo e Igor apresentaram faltas nas semanas de chuvas fortes por dependerem de transporte rural, mas estão repondo o conteúdo.',
      'q-5': 'Alana Beatriz e Cauã Henrique destacam-se pela liderança positiva e apoio aos colegas nas resoluções.',
      'q-6': 'Bernardo Ramos necessita de acompanhamento pontual para fixação de algoritmos de multiplicação e divisão.',
      'q-7': 'Atividades práticas com jogos matemáticos e listas direcionadas de exercícios em duplas.',
      'q-8': 'A turma respondeu muito bem ao laboratório de matemática.',
      'q-9': 'Turma promissora e participativa; com o reforço contínuo alcançará excelente rendimento geral.',
    },
    createdAt: '2026-09-12T14:32:00Z',
    updatedAt: '2026-09-12T14:32:00Z',
  },
  {
    id: 'rep-2',
    classId: 'turma-7b',
    className: '7º Ano B',
    teacherId: 'teacher-2',
    teacherName: 'Profª. Ana Paula Souza',
    subject: 'Língua Portuguesa e Redação',
    date: '2026-09-15',
    status: 'submitted',
    answers: {
      'q-1': 'Desenvolvimento satisfatório na leitura e interpretação de textos literários. A produção textual está evoluindo.',
      'q-2': 'Excelente participação oral nos debates e saraus. Postura respeitosa e engajada.',
      'q-3': 'Concordância verbal, nominal e pontuação em parágrafos narrativos.',
      'q-4': 'Frequência regular de 95%, sem casos críticos de infrequência no período.',
      'q-5': 'Arthur Fernando e Beatriz Vasconcelos demonstraram brilhantismo na apresentação poética da escola.',
      'q-6': 'Lucas Eduardo necessita de oficina complementar de escrita e pontuação.',
      'q-7': 'Reescrita orientada quinzenal e incentivo ao clube de leitura da biblioteca escolar.',
      'q-8': 'Famílias compareceram ao plantão pedagógico e demonstraram apoio aos estudos.',
      'q-9': 'Turma muito sensível e criativa nas produções literárias.',
    },
    createdAt: '2026-09-15T11:40:00Z',
    updatedAt: '2026-09-15T11:40:00Z',
  },
  {
    id: 'rep-3',
    classId: 'turma-6a',
    className: '6º Ano A',
    teacherId: 'teacher-3',
    teacherName: 'Profª. Mariana Lima',
    subject: 'Ciências da Natureza',
    date: '2026-09-13',
    status: 'submitted',
    answers: {
      'q-1': 'Grupo muito curioso e com facilidade de compreensão dos ciclos da natureza e ecossistemas.',
      'q-2': 'Entusiasmo elevado nas aulas práticas e visitas à horta escolar. Requer mediação nos momentos de transição.',
      'q-3': 'Sistematização de relatórios de experimentos científicos e vocabulário técnico.',
      'q-4': 'Três estudantes com faltas frequentes por questões de transporte escolar rural.',
      'q-5': 'Alana e Cauã lideram as pesquisas de campo com grande responsabilidade.',
      'q-6': 'Davi Lucca necessita de intervenção pedagógica e apoio no registro escrito dos experimentos.',
      'q-7': 'Uso contínuo de cadernos de campo ilustrados e metodologias ativas.',
      'q-8': 'A aula prática de compostagem foi um sucesso e gerou alto engajamento da turma.',
      'q-9': 'Turma com imensa energia e potencial; o foco em projetos práticos tem dado excelente resultado.',
    },
    createdAt: '2026-09-13T16:00:00Z',
    updatedAt: '2026-09-13T16:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'notif-1',
    title: 'Lembrete do Pré-Conselho de Classe',
    message: 'Prezados professores: o prazo para preenchimento dos relatórios das turmas encerra em 3 dias. Favor atualizar as pendências.',
    date: '2026-09-15T08:00:00Z',
    isRead: false,
    type: 'reminder',
  },
  {
    id: 'notif-2',
    title: 'Atualização de Formulário',
    message: 'A coordenação pedagógica revisou os quesitos de acompanhamento de frequência no formulário digital.',
    date: '2026-09-14T10:30:00Z',
    isRead: true,
    type: 'system',
  },
];
