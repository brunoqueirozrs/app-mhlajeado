export interface CompetenciaPergunta {
  id: string;
  enunciado: string;
  opcoes?: string[];
  tipo: 'autoavaliacao' | 'situacional' | 'caso_pratico' | 'desafio';
}

export interface Competencia {
  id: string;
  nome: string;
  categoria: 'Administrativa' | 'Comercial';
  canal: 'Loja' | 'Externa' | 'Ambos';
  perguntas: CompetenciaPergunta[];
}

export const COMPETENCIAS_DATA: Competencia[] = [
  {
    id: "COMP_ADM_01",
    nome: "Organização e Planejamento",
    categoria: "Administrativa",
    canal: "Ambos",
    perguntas: [
      { id: "COMP_ADM_01_AUTO_01", tipo: "autoavaliacao", enunciado: "Quando tenho várias tarefas para executar, organizo prioridades antes de começar." },
      { id: "COMP_ADM_01_AUTO_02", tipo: "autoavaliacao", enunciado: "Utilizo ferramentas de organização (agenda, aplicativos, lista de tarefas) para planejar minha semana." },
      { id: "COMP_ADM_01_AUTO_03", tipo: "autoavaliacao", enunciado: "Cumpro prazos estabelecidos sem necessidade de lembretes." },
      { id: "COMP_ADM_01_AUTO_04", tipo: "autoavaliacao", enunciado: "Consigo reorganizar minhas prioridades quando surge um imprevisto sem comprometer outras entregas." },
      { id: "COMP_ADM_01_AUTO_05", tipo: "autoavaliacao", enunciado: "Planejo minha semana incluindo tempo para imprevistos." }
    ]
  },
  {
    id: "COMP_ADM_02",
    nome: "Comunicação Clara e Eficaz",
    categoria: "Administrativa",
    canal: "Ambos",
    perguntas: [
      { id: "COMP_ADM_02_AUTO_01", tipo: "autoavaliacao", enunciado: "Quando alguém não entende minha orientação, busco explicar de forma diferente." },
      { id: "COMP_ADM_02_AUTO_02", tipo: "autoavaliacao", enunciado: "Confirmo se o interlocutor compreendeu a mensagem antes de encerrar a comunicação." },
      { id: "COMP_ADM_02_AUTO_03", tipo: "autoavaliacao", enunciado: "Adapto meu tom e vocabulário conforme a pessoa com quem estou falando." },
      { id: "COMP_ADM_02_AUTO_04", tipo: "autoavaliacao", enunciado: "Consigo comunicar informações complexas de forma simples e compreensível." },
      { id: "COMP_ADM_02_AUTO_05", tipo: "autoavaliacao", enunciado: "Em situações de pressão, mantenho clareza e objetividade na comunicação." }
    ]
  },
  {
    id: "COMP_ADM_03",
    nome: "Resolução de Problemas",
    categoria: "Administrativa",
    canal: "Ambos",
    perguntas: [
      { id: "COMP_ADM_03_AUTO_01", tipo: "autoavaliacao", enunciado: "Diante de um problema novo, pesquiso e tento resolver antes de pedir ajuda." },
      { id: "COMP_ADM_03_AUTO_02", tipo: "autoavaliacao", enunciado: "Identifico a causa raiz dos problemas em vez de tratar apenas os sintomas." },
      { id: "COMP_ADM_03_AUTO_03", tipo: "autoavaliacao", enunciado: "Documento soluções encontradas para evitar que o problema se repita." },
      { id: "COMP_ADM_03_AUTO_04", tipo: "autoavaliacao", enunciado: "Consigo tomar decisões mesmo com informações incompletas." },
      { id: "COMP_ADM_03_AUTO_05", tipo: "autoavaliacao", enunciado: "Quando uma solução não funciona, mudo rapidamente de abordagem." }
    ]
  },
  {
    id: "COMP_ADM_04",
    nome: "Trabalho em Equipe",
    categoria: "Administrativa",
    canal: "Ambos",
    perguntas: [
      { id: "COMP_ADM_04_AUTO_01", tipo: "autoavaliacao", enunciado: "Ofereço ajuda a colegas mesmo quando não sou solicitado." },
      { id: "COMP_ADM_04_AUTO_02", tipo: "autoavaliacao", enunciado: "Compartilho informações e aprendizados com a equipe." },
      { id: "COMP_ADM_04_AUTO_03", tipo: "autoavaliacao", enunciado: "Em conflitos, busco resolver diretamente com a pessoa envolvida de forma respeitosa." },
      { id: "COMP_ADM_04_AUTO_04", tipo: "autoavaliacao", enunciado: "Reconheço publicamente as contribuições de colegas." },
      { id: "COMP_ADM_04_AUTO_05", tipo: "autoavaliacao", enunciado: "Coloco os objetivos da equipe acima dos meus interesses individuais." }
    ]
  },
  {
    id: "COMP_ADM_05",
    nome: "Atenção aos Detalhes",
    categoria: "Administrativa",
    canal: "Ambos",
    perguntas: [
      { id: "COMP_ADM_05_AUTO_01", tipo: "autoavaliacao", enunciado: "Confiro contratos e cadastros antes de finalizar." },
      { id: "COMP_ADM_05_AUTO_02", tipo: "autoavaliacao", enunciado: "Identifico inconsistências em documentos e processos." },
      { id: "COMP_ADM_05_AUTO_03", tipo: "autoavaliacao", enunciado: "Mantenho registro organizado de todas as minhas atividades." },
      { id: "COMP_ADM_05_AUTO_04", tipo: "autoavaliacao", enunciado: "Percebo quando algo está fora do padrão mesmo sem estar procurando ativamente." },
      { id: "COMP_ADM_05_AUTO_05", tipo: "autoavaliacao", enunciado: "Crio verificações para garantir que nenhum passo importante seja esquecido." }
    ]
  },
  {
    id: "COMP_ADM_06",
    nome: "Adaptabilidade",
    categoria: "Administrativa",
    canal: "Ambos",
    perguntas: [
      { id: "COMP_ADM_06_AUTO_01", tipo: "autoavaliacao", enunciado: "Adapto-me rapidamente a novos sistemas e ferramentas de trabalho." },
      { id: "COMP_ADM_06_AUTO_02", tipo: "autoavaliacao", enunciado: "Mantenho produtividade durante períodos de mudança." },
      { id: "COMP_ADM_06_AUTO_03", tipo: "autoavaliacao", enunciado: "Vejo mudanças como oportunidades de aprendizado." },
      { id: "COMP_ADM_06_AUTO_04", tipo: "autoavaliacao", enunciado: "Ajusto meu estilo de trabalho conforme o contexto e as pessoas envolvidas." },
      { id: "COMP_ADM_06_AUTO_05", tipo: "autoavaliacao", enunciado: "Contribuo positivamente para o clima da equipe durante transições." }
    ]
  },
  {
    id: "COMP_LJ_01",
    nome: "Abordagem no Ponto de Venda",
    categoria: "Comercial",
    canal: "Loja",
    perguntas: [
      { id: "COMP_LJ_01_AUTO_01", tipo: "autoavaliacao", enunciado: "Personalizo minha abordagem conforme o perfil do cliente que entra na loja." },
      { id: "COMP_LJ_01_AUTO_02", tipo: "autoavaliacao", enunciado: "Consigo criar rapport com o cliente nos primeiros segundos de atendimento." },
      { id: "COMP_LJ_01_AUTO_03", tipo: "autoavaliacao", enunciado: "Clientes que atendo costumam elogiar o atendimento." },
      { id: "COMP_LJ_01_AUTO_04", tipo: "autoavaliacao", enunciado: "Identifico rapidamente se o cliente está com pressa ou disponível para uma conversa mais longa." },
      { id: "COMP_LJ_01_AUTO_05", tipo: "autoavaliacao", enunciado: "Mesmo em dias de muito movimento, mantenho a qualidade da abordagem inicial." }
    ]
  },
  {
    id: "COMP_LJ_02",
    nome: "Gestão de Fila e Tempo de Atendimento",
    categoria: "Comercial",
    canal: "Loja",
    perguntas: [
      { id: "COMP_LJ_02_AUTO_01", tipo: "autoavaliacao", enunciado: "Faço triagem rápida para identificar demandas simples que podem ser resolvidas rapidamente." },
      { id: "COMP_LJ_02_AUTO_02", tipo: "autoavaliacao", enunciado: "Comunico aos clientes na fila sobre o tempo estimado de espera." },
      { id: "COMP_LJ_02_AUTO_03", tipo: "autoavaliacao", enunciado: "Mantenho qualidade de atendimento mesmo com fila grande." },
      { id: "COMP_LJ_02_AUTO_04", tipo: "autoavaliacao", enunciado: "Consigo agilizar atendimentos sem comprometer a precisão das informações." },
      { id: "COMP_LJ_02_AUTO_05", tipo: "autoavaliacao", enunciado: "Organizo a ordem de atendimento considerando complexidade e urgência, não apenas ordem de chegada." }
    ]
  },
  {
    id: "COMP_LJ_03",
    nome: "Upsell e Cross-sell Presencial",
    categoria: "Comercial",
    canal: "Loja",
    perguntas: [
      { id: "COMP_LJ_03_AUTO_01", tipo: "autoavaliacao", enunciado: "Identifico necessidades não declaradas do cliente durante o atendimento." },
      { id: "COMP_LJ_03_AUTO_02", tipo: "autoavaliacao", enunciado: "Ofereço planos superiores ou serviços adicionais de forma natural e consultiva." },
      { id: "COMP_LJ_03_AUTO_03", tipo: "autoavaliacao", enunciado: "Construo valor antes de apresentar o preço do upgrade." },
      { id: "COMP_LJ_03_AUTO_04", tipo: "autoavaliacao", enunciado: "Clientes raramente percebem o upsell como \"empurrar\" produto." },
      { id: "COMP_LJ_03_AUTO_05", tipo: "autoavaliacao", enunciado: "Conheço profundamente todos os produtos para identificar qual upgrade faz sentido para cada perfil." }
    ]
  },
  {
    id: "COMP_LJ_04",
    nome: "Fechamento em Ambiente Controlado",
    categoria: "Comercial",
    canal: "Loja",
    perguntas: [
      { id: "COMP_LJ_04_AUTO_01", tipo: "autoavaliacao", enunciado: "Identifico sinais de que o cliente está pronto para comprar." },
      { id: "COMP_LJ_04_AUTO_02", tipo: "autoavaliacao", enunciado: "Contorno objeções comuns sem pressionar o cliente." },
      { id: "COMP_LJ_04_AUTO_03", tipo: "autoavaliacao", enunciado: "Utilizo técnicas de fechamento adequadas ao perfil do cliente." },
      { id: "COMP_LJ_04_AUTO_04", tipo: "autoavaliacao", enunciado: "Consigo converter clientes que inicialmente diziam \"estou só pesquisando\"." },
      { id: "COMP_LJ_04_AUTO_05", tipo: "autoavaliacao", enunciado: "Minha taxa de conversão de atendimentos em vendas está acima da média da equipe." }
    ]
  },
  {
    id: "COMP_LJ_05",
    nome: "Pós-venda e Retenção Presencial",
    categoria: "Comercial",
    canal: "Loja",
    perguntas: [
      { id: "COMP_LJ_05_AUTO_01", tipo: "autoavaliacao", enunciado: "Atendo clientes insatisfeitos com empatia, mesmo quando a reclamação não é minha responsabilidade." },
      { id: "COMP_LJ_05_AUTO_02", tipo: "autoavaliacao", enunciado: "Consigo acalmar clientes nervosos e conduzir para uma solução." },
      { id: "COMP_LJ_05_AUTO_03", tipo: "autoavaliacao", enunciado: "Identifico risco de cancelamento e tomo ações preventivas." },
      { id: "COMP_LJ_05_AUTO_04", tipo: "autoavaliacao", enunciado: "Transformo reclamações em oportunidades de fidelização." },
      { id: "COMP_LJ_05_AUTO_05", tipo: "autoavaliacao", enunciado: "Clientes que voltam com problemas saem satisfeitos após meu atendimento." }
    ]
  },
  {
    id: "COMP_EXT_01",
    nome: "Prospecção de Rua",
    categoria: "Comercial",
    canal: "Externa",
    perguntas: [
      { id: "COMP_EXT_01_AUTO_01", tipo: "autoavaliacao", enunciado: "Analiso o ambiente (casa, comércio, movimentação) antes de bater na porta." },
      { id: "COMP_EXT_01_AUTO_02", tipo: "autoavaliacao", enunciado: "Adapto minha abordagem conforme o perfil visível do morador." },
      { id: "COMP_EXT_01_AUTO_03", tipo: "autoavaliacao", enunciado: "Consigo gerar interesse do morador nos primeiros 15 segundos de conversa." },
      { id: "COMP_EXT_01_AUTO_04", tipo: "autoavaliacao", enunciado: "Minha taxa de conversão de portas batidas para apresentações é consistente." },
      { id: "COMP_EXT_01_AUTO_05", tipo: "autoavaliacao", enunciado: "Mesmo em dias ruins, mantenho a qualidade da abordagem na próxima porta." }
    ]
  },
  {
    id: "COMP_EXT_02",
    nome: "Gestão de Rota e Agenda de Visitas",
    categoria: "Comercial",
    canal: "Externa",
    perguntas: [
      { id: "COMP_EXT_02_AUTO_01", tipo: "autoavaliacao", enunciado: "Planejo minha rota do dia antes de sair a campo." },
      { id: "COMP_EXT_02_AUTO_02", tipo: "autoavaliacao", enunciado: "Registro todas as visitas no aplicativo ou sistema da empresa." },
      { id: "COMP_EXT_02_AUTO_03", tipo: "autoavaliacao", enunciado: "Reorganizo minha rota conforme resultados do dia." },
      { id: "COMP_EXT_02_AUTO_04", tipo: "autoavaliacao", enunciado: "Priorizo retornos quentes sobre novas visitas frias." },
      { id: "COMP_EXT_02_AUTO_05", tipo: "autoavaliacao", enunciado: "Conheço os melhores horários para cada bairro da minha região." }
    ]
  },
  {
    id: "COMP_EXT_03",
    nome: "Abordagem Fria e Quebra de Objeções na Porta",
    categoria: "Comercial",
    canal: "Externa",
    perguntas: [
      { id: "COMP_EXT_03_AUTO_01", tipo: "autoavaliacao", enunciado: "Quando o morador diz \"já tenho internet\", consigo manter a conversa." },
      { id: "COMP_EXT_03_AUTO_02", tipo: "autoavaliacao", enunciado: "Tenho argumentos preparados para as principais objeções." },
      { id: "COMP_EXT_03_AUTO_03", tipo: "autoavaliacao", enunciado: "Sei identificar quando devo insistir e quando devo recuar." },
      { id: "COMP_EXT_03_AUTO_04", tipo: "autoavaliacao", enunciado: "Transformo objeções em perguntas para entender melhor a necessidade." },
      { id: "COMP_EXT_03_AUTO_05", tipo: "autoavaliacao", enunciado: "Mesmo quando não vendo, o morador guarda uma impressão positiva da empresa." }
    ]
  },
  {
    id: "COMP_EXT_04",
    nome: "Persistência e Resiliência em Campo",
    categoria: "Comercial",
    canal: "Externa",
    perguntas: [
      { id: "COMP_EXT_04_AUTO_01", tipo: "autoavaliacao", enunciado: "Após 5 recusas seguidas, mantenho a mesma energia da primeira abordagem." },
      { id: "COMP_EXT_04_AUTO_02", tipo: "autoavaliacao", enunciado: "Recusas me motivam a melhorar minha abordagem, não a desistir." },
      { id: "COMP_EXT_04_AUTO_03", tipo: "autoavaliacao", enunciado: "Consigo separar meu valor pessoal dos resultados de vendas." },
      { id: "COMP_EXT_04_AUTO_04", tipo: "autoavaliacao", enunciado: "Em condições adversas (calor, chuva), mantenho consistência." },
      { id: "COMP_EXT_04_AUTO_05", tipo: "autoavaliacao", enunciado: "Termino o dia com a mesma disposição com que comecei." }
    ]
  },
  {
    id: "COMP_EXT_05",
    nome: "Segurança e Conduta em Campo",
    categoria: "Comercial",
    canal: "Externa",
    perguntas: [
      { id: "COMP_EXT_05_AUTO_01", tipo: "autoavaliacao", enunciado: "Utilizo uniforme e crachá completos durante todo o expediente." },
      { id: "COMP_EXT_05_AUTO_02", tipo: "autoavaliacao", enunciado: "Faço check-in no aplicativo em todas as visitas." },
      { id: "COMP_EXT_05_AUTO_03", tipo: "autoavaliacao", enunciado: "Evito áreas de risco e reporto incidentes ao gestor." },
      { id: "COMP_EXT_05_AUTO_04", tipo: "autoavaliacao", enunciado: "Minha postura e linguagem representam bem a empresa em campo." },
      { id: "COMP_EXT_05_AUTO_05", tipo: "autoavaliacao", enunciado: "Sigo todos os protocolos de segurança mesmo quando ninguém está supervisionando." }
    ]
  },
  {
    id: "COMP_EXT_06",
    nome: "Fechamento em Campo e Autonomia",
    categoria: "Comercial",
    canal: "Externa",
    perguntas: [
      { id: "COMP_EXT_06_AUTO_01", tipo: "autoavaliacao", enunciado: "Fecho vendas sem precisar consultar o gestor durante a negociação." },
      { id: "COMP_EXT_06_AUTO_02", tipo: "autoavaliacao", enunciado: "Conheço os limites de negociação e tomo decisões dentro deles." },
      { id: "COMP_EXT_06_AUTO_03", tipo: "autoavaliacao", enunciado: "Utilizo o aplicativo mobile para formalizar vendas no momento." },
      { id: "COMP_EXT_06_AUTO_04", tipo: "autoavaliacao", enunciado: "Consigo negociar objeções de preço sem depender de aprovação externa." },
      { id: "COMP_EXT_06_AUTO_05", tipo: "autoavaliacao", enunciado: "Minhas decisões em campo estão alinhadas com a estratégia comercial da empresa." }
    ]
  }
];
