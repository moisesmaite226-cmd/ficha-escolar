export interface PhraseCategory {
  id: string;
  name: string;
  icon?: string;
  description: string;
  phrases: string[];
}

export const PEDAGOGICAL_PHRASES: PhraseCategory[] = [
  {
    id: 'desenvolvimento',
    name: 'Desenvolvimento e Rendimento',
    icon: 'TrendingUp',
    description: 'Frases para avaliar o ritmo de aprendizagem e assimilação',
    phrases: [
      'A turma demonstra bom ritmo de aprendizagem, com assimilação satisfatória dos conteúdos essenciais propostos para o período.',
      'Apresenta ritmo heterogêneo; uma parcela dos estudantes avança com plena autonomia enquanto outro grupo demanda retomada constante e apoio individualizado.',
      'Houve evolução significativa em relação ao início do período letivo, principalmente no raciocínio e na capacidade de argumentação.',
      'A turma apresenta dificuldades na fixação de conteúdos conceituais, necessitando de mediação contínua e recursos visuais complementares.',
      'A maioria dos estudantes atinge os objetivos de aprendizagem previstos, demonstrando maturidade e interesse pelas temáticas abordadas.',
    ],
  },
  {
    id: 'participacao',
    name: 'Participação e Convivência',
    icon: 'Users',
    description: 'Postura, cooperação, entrega de atividades e engajamento',
    phrases: [
      'Turma participativa, receptiva às metodologias ativas e pontual na entrega das atividades solicitadas.',
      'O envolvimento nas atividades em equipe é produtivo, mantendo clima de respeito mútuo e colaboração nas aulas.',
      'Apresenta bom engajamento nas aulas expositivas, porém com momentos de dispersão coletiva e conversas paralelas após o intervalo.',
      'Necessita de intervenções pontuais para manutenção do foco, cumprimento de combinados de convivência e organização do material.',
      'Estudantes demonstram protagonismo e iniciativa ao tirarem dúvidas e proporem soluções para os desafios propostos.',
    ],
  },
  {
    id: 'dificuldades',
    name: 'Dificuldades e Habilidades Críticas',
    icon: 'AlertCircle',
    description: 'Tópicos curriculares que demandam reforço ou nivelamento',
    phrases: [
      'Maior dificuldade concentrada na interpretação de enunciados extensos e na leitura crítica de textos interdisciplinares.',
      'Apresenta defasagem na escrita formal, pontuação e estrutura de parágrafos em produções textuais.',
      'Necessidade de retomada das operações matemáticas fundamentais e resolução de situações-problema do cotidiano.',
      'Dificuldade na autonomia para realização de tarefas extraclasse e no cumprimento dos prazos estabelecidos.',
      'Alguns estudantes apresentam dificuldades na transição do pensamento concreto para o abstrato nas teorias científicas.',
    ],
  },
  {
    id: 'frequencia',
    name: 'Frequência e Assiduidade',
    icon: 'Calendar',
    description: 'Apontamento de infrequência, transporte e busca ativa',
    phrases: [
      'Frequência regular e satisfatória da grande maioria dos estudantes, sem casos críticos de evasão no período.',
      'Estudantes dependentes de transporte escolar rural registraram faltas em dias chuvosos, mas estão em processo de reposição de atividades.',
      'Identificados estudantes com infrequência reiterada; caso sugerido para atuação imediata da coordenação pedagógica e Busca Ativa.',
      'A infrequência pontual de alguns estudantes tem impactado diretamente na continuidade e fixação das avaliações formativas.',
      'Contatos com as famílias já foram realizados pela equipe escolar para alinhamento sobre assiduidade e justificativas médicas.',
    ],
  },
  {
    id: 'encaminhamentos',
    name: 'Encaminhamentos e Ações Pedagógicas',
    icon: 'CheckSquare',
    description: 'Propostas de intervenção para o próximo período ou conselho',
    phrases: [
      'Proposta de aulas de nivelamento, monitoria voluntária entre pares e listas direcionadas de exercícios no início do próximo período.',
      'Aplicação de instrumentos avaliativos diversificados (trabalhos práticos, seminários e autoavaliação) para contemplar diferentes estilos de aprendizagem.',
      'Encaminhamento de estudantes com defasagem acentuada para o atendimento pedagógico complementar no contraturno escolar.',
      'Adaptação curricular e alinhamento conjunto com a Sala de Recursos / Professor de Apoio Especializado (AEE).',
      'Reunião individual com os responsáveis dos estudantes com baixo rendimento para pactuar acompanhamento diário da rotina de estudos em casa.',
    ],
  },
  {
    id: 'sintese',
    name: 'Síntese para o Conselho de Classe',
    icon: 'FileText',
    description: 'Parecer final do professor para compor a ata oficial',
    phrases: [
      'Turma com excelente potencial formativo e humano; com intervenções direcionadas nas habilidades defasadas alcançará ótimos resultados ao fim do ano letivo.',
      'Recomenda-se acompanhamento conjunto de todo o corpo docente nas regras de convivência para manter o foco e o rendimento acadêmico.',
      'O trabalho pedagógico continuará focado na recuperação paralela e no estímulo ao protagonismo juvenil e autonomia dos estudantes.',
      'Agradeço o apoio da equipe pedagógica e destaco a evolução visível na maturidade coletiva deste grupo ao longo do bimestre.',
    ],
  },
];
