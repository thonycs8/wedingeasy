export interface TaskTemplate {
  title: string;
  description: string;
  monthsBefore: number;
  category: 'venue' | 'attire' | 'catering' | 'decoration' | 'documentation' | 'other';
  priority: 'alta' | 'media' | 'baixa';
}

export const taskTemplates: TaskTemplate[] = [
  // 12+ meses antes
  {
    title: 'Definir orçamento total',
    description: 'Estabelecer o orçamento disponível e prioridades de gastos',
    monthsBefore: 12,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Criar lista de convidados preliminar',
    description: 'Fazer primeira versão da lista para estimar tamanho do evento',
    monthsBefore: 12,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Reservar local da cerimónia',
    description: 'Pesquisar e reservar espaço para a cerimónia',
    monthsBefore: 12,
    category: 'venue',
    priority: 'alta'
  },
  {
    title: 'Reservar local da receção',
    description: 'Pesquisar e reservar espaço para a receção',
    monthsBefore: 12,
    category: 'venue',
    priority: 'alta'
  },
  
  // 9-11 meses antes
  {
    title: 'Contratar fotógrafo',
    description: 'Pesquisar portfolios e contratar fotógrafo profissional',
    monthsBefore: 10,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Contratar videógrafo',
    description: 'Pesquisar e contratar serviço de filmagem',
    monthsBefore: 10,
    category: 'other',
    priority: 'media'
  },
  {
    title: 'Escolher tema e paleta de cores',
    description: 'Definir estilo visual e cores do casamento',
    monthsBefore: 10,
    category: 'decoration',
    priority: 'alta'
  },
  {
    title: 'Começar a procurar vestido de noiva',
    description: 'Visitar lojas e experimentar modelos',
    monthsBefore: 9,
    category: 'attire',
    priority: 'alta'
  },
  
  // 6-8 meses antes
  {
    title: 'Encomendar vestido de noiva',
    description: 'Confirmar modelo e fazer encomenda (tempo de produção)',
    monthsBefore: 8,
    category: 'attire',
    priority: 'alta'
  },
  {
    title: 'Escolher fatos/vestidos dos padrinhos',
    description: 'Definir trajes da equipa de honra',
    monthsBefore: 7,
    category: 'attire',
    priority: 'media'
  },
  {
    title: 'Contratar serviço de catering',
    description: 'Pesquisar, fazer degustações e contratar',
    monthsBefore: 8,
    category: 'catering',
    priority: 'alta'
  },
  {
    title: 'Contratar banda ou DJ',
    description: 'Pesquisar e reservar entretenimento musical',
    monthsBefore: 8,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Contratar florista',
    description: 'Definir arranjos florais e decoração',
    monthsBefore: 7,
    category: 'decoration',
    priority: 'media'
  },
  {
    title: 'Reservar alojamento para convidados',
    description: 'Negociar tarifas especiais em hotéis próximos',
    monthsBefore: 7,
    category: 'other',
    priority: 'baixa'
  },
  
  // 4-5 meses antes
  {
    title: 'Encomendar convites',
    description: 'Design, impressão e encomenda dos convites',
    monthsBefore: 5,
    category: 'documentation',
    priority: 'alta'
  },
  {
    title: 'Iniciar lista de presentes',
    description: 'Criar lista em lojas ou online',
    monthsBefore: 5,
    category: 'other',
    priority: 'media'
  },
  {
    title: 'Contratar serviço de transporte',
    description: 'Carros para noivos e convidados se necessário',
    monthsBefore: 5,
    category: 'other',
    priority: 'baixa'
  },
  {
    title: 'Planejar lua de mel',
    description: 'Pesquisar destino e fazer reservas',
    monthsBefore: 5,
    category: 'other',
    priority: 'media'
  },
  
  // 2-3 meses antes
  {
    title: 'Enviar convites',
    description: 'Enviar convites aos convidados',
    monthsBefore: 3,
    category: 'documentation',
    priority: 'alta'
  },
  {
    title: 'Primeira prova do vestido',
    description: 'Experimentar e ajustar vestido de noiva',
    monthsBefore: 3,
    category: 'attire',
    priority: 'alta'
  },
  {
    title: 'Confirmar menu final',
    description: 'Finalizar escolhas de pratos e bebidas',
    monthsBefore: 3,
    category: 'catering',
    priority: 'alta'
  },
  {
    title: 'Encomendar bolo de casamento',
    description: 'Escolher design e sabores do bolo',
    monthsBefore: 3,
    category: 'catering',
    priority: 'media'
  },
  {
    title: 'Contratar maquiagem e cabelo',
    description: 'Fazer testes e reservar profissionais',
    monthsBefore: 2,
    category: 'attire',
    priority: 'alta'
  },
  
  // 1 mês antes
  {
    title: 'Prova final do vestido',
    description: 'Ajustes finais e recolha do vestido',
    monthsBefore: 1,
    category: 'attire',
    priority: 'alta'
  },
  {
    title: 'Confirmar número final de convidados',
    description: 'Contabilizar confirmações finais',
    monthsBefore: 1,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Finalizar disposição das mesas',
    description: 'Definir onde cada convidado vai sentar',
    monthsBefore: 1,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Confirmar todos os fornecedores',
    description: 'Reconfirmar horários e detalhes com todos',
    monthsBefore: 1,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Preparar discursos e votos',
    description: 'Escrever e ensaiar votos pessoais',
    monthsBefore: 1,
    category: 'documentation',
    priority: 'media'
  },
  {
    title: 'Comprar alianças',
    description: 'Escolher e comprar alianças de casamento',
    monthsBefore: 1,
    category: 'other',
    priority: 'alta'
  },
  
  // 2-3 semanas antes
  {
    title: 'Ensaio da cerimónia',
    description: 'Fazer ensaio com equipa de honra',
    monthsBefore: 0.5,
    category: 'other',
    priority: 'media'
  },
  {
    title: 'Confirmar timeline do dia',
    description: 'Criar cronograma detalhado do dia do casamento',
    monthsBefore: 0.5,
    category: 'other',
    priority: 'alta'
  },
  {
    title: 'Preparar kit de emergência',
    description: 'Reunir items essenciais para imprevistos',
    monthsBefore: 0.5,
    category: 'other',
    priority: 'baixa'
  },
  
  // 1 semana antes
  {
    title: 'Fazer unhas e tratamentos finais',
    description: 'Tratamentos de beleza de última hora',
    monthsBefore: 0.25,
    category: 'attire',
    priority: 'baixa'
  },
  {
    title: 'Embalar para lua de mel',
    description: 'Preparar malas para viagem',
    monthsBefore: 0.25,
    category: 'other',
    priority: 'baixa'
  },
  {
    title: 'Confirmar transporte do dia',
    description: 'Reconfirmar horários de todos os carros',
    monthsBefore: 0.25,
    category: 'other',
    priority: 'alta'
  }
];

export const generateTasksFromDate = (weddingDate: Date): Array<TaskTemplate & { dueDate: Date }> => {
  const today = new Date();
  
  return taskTemplates
    .map(template => {
      const dueDate = new Date(weddingDate);
      dueDate.setMonth(dueDate.getMonth() - template.monthsBefore);
      
      return {
        ...template,
        dueDate
      };
    })
    .filter(task => task.dueDate >= today) // Only future tasks
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};
