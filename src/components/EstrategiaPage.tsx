import React, { useState } from "react";
import { BrainCircuit, X, MessageSquare, RefreshCw, Send, Target, Compass, Activity, CheckSquare, RefreshCcw, TrendingUp, AlertTriangle, Layers, KanbanSquare, Zap, Clock, Filter, ArrowLeft, Plus, Trash2, PanelRightClose, PanelRightOpen, Printer, Download, Share2, FileText, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  summary: string;
  objective: string;
}

const STRATEGIC_TOOLS: Tool[] = [
  {
    id: "SWOT",
    name: "Análise SWOT",
    icon: <Compass className="w-5 h-5" />,
    summary: "Avaliação de Forças, Fraquezas, Oportunidades e Ameaças.",
    objective: "Mapear o cenário estratégico interno e externo da unidade para priorizar ações com base em vantagens e riscos."
  },
  {
    id: "5W2H",
    name: "5W2H (Plano de Ação)",
    icon: <CheckSquare className="w-5 h-5" />,
    summary: "Framework estruturado: O quê, Por quê, Onde, Quem, Quando, Como, Quanto.",
    objective: "Garantir clareza total na execução de planos de ação, eliminando ambiguidades sobre responsabilidades e prazos."
  },
  {
    id: "OKR",
    name: "OKR",
    icon: <Target className="w-5 h-5" />,
    summary: "Objetivos (qualitativos) e Resultados-Chave (quantitativos).",
    objective: "Definir metas ambiciosas e mensuráveis para alinhar e engajar o time em um ciclo específico."
  },
  {
    id: "GUT",
    name: "Matriz GUT",
    icon: <AlertTriangle className="w-5 h-5" />,
    summary: "Priorização de problemas por Gravidade, Urgência e Tendência.",
    objective: "Ajudar o gestor a decidir quais problemas devem ser resolvidos primeiro com base no score G×U×T."
  },
  {
    id: "PDCA",
    name: "Ciclo PDCA",
    icon: <RefreshCcw className="w-5 h-5" />,
    summary: "Metodologia iterativa: Planejar, Executar, Verificar e Agir.",
    objective: "Promover a melhoria contínua de processos, testando soluções e padronizando o que funciona."
  },
  {
    id: "BSC",
    name: "Balanced Scorecard",
    icon: <Activity className="w-5 h-5" />,
    summary: "Gestão em 4 perspectivas: Financeira, Clientes, Processos e Aprendizado.",
    objective: "Equilibrar o desempenho da unidade para não focar apenas em vendas, mas na saúde geral da operação."
  },
  {
    id: "Ishikawa",
    name: "Diagrama de Ishikawa",
    icon: <Layers className="w-5 h-5" />,
    summary: "Análise de causa raiz usando o método dos 6M (Mão de obra, Máquina, etc).",
    objective: "Identificar as causas reais de um problema crônico ao invés de tratar apenas os sintomas."
  },
  {
    id: "BCG",
    name: "Matriz BCG",
    icon: <TrendingUp className="w-5 h-5" />,
    summary: "Gestão do portfólio de planos: Estrela, Vaca Leiteira, Interrogação, Abacaxi.",
    objective: "Definir a estratégia comercial e os investimentos adequados para cada plano de internet."
  },
  {
    id: "Kanban",
    name: "Kanban de Metas",
    icon: <KanbanSquare className="w-5 h-5" />,
    summary: "Organização visual em colunas: A Fazer, Em Progresso, Concluído.",
    objective: "Manter o controle visual sobre o status de todas as iniciativas estratégicas da equipe."
  },
  {
    id: "Kaizen",
    name: "Kaizen / Kaikaku",
    icon: <Zap className="w-5 h-5" />,
    summary: "Filosofia de melhoria de processos: incremental (Kaizen) ou radical (Kaikaku).",
    objective: "Estruturar o planejamento de mudanças para processos lentos ou ineficientes (como ativações ou cadastros)."
  },
  {
    id: "Eisenhower",
    name: "Matriz de Eisenhower",
    icon: <Clock className="w-5 h-5" />,
    summary: "Classificação de tarefas entre Urgente e Importante.",
    objective: "Aumentar a produtividade do gestor, ajudando a focar, agendar, delegar ou eliminar demandas."
  },
  {
    id: "Funil",
    name: "Funil de Vendas",
    icon: <Filter className="w-5 h-5" />,
    summary: "Estágios: Prospecção, Abordagem, Apresentação, Adesão, Ativação.",
    objective: "Mapear as taxas de conversão entre etapas para identificar gargalos na operação porta a porta."
  }
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ---- Subcomponentes das Ferramentas ----

function SwotManager() {
  const [swot, setSwot] = useState({
    forcas: ["Equipe de vendas bem treinada", "Cobertura de fibra no bairro X"],
    fraquezas: ["Alto índice de cancelamento", "Processo lento de ativação"],
    oportunidades: ["Novo loteamento na zona sul"],
    ameacas: ["Concorrente Y com promoção agressiva"]
  });

  const updateItem = (category: keyof typeof swot, index: number, value: string) => {
    const newArr = [...swot[category]];
    newArr[index] = value;
    setSwot({ ...swot, [category]: newArr });
  }

  const addItem = (category: keyof typeof swot) => {
    setSwot({ ...swot, [category]: [...swot[category], ""] });
  }

  const removeItem = (category: keyof typeof swot, index: number) => {
    const newArr = swot[category].filter((_, i) => i !== index);
    setSwot({ ...swot, [category]: newArr });
  }

  const Quadrante = ({ title, type, colorClass, items }: { title: string, type: keyof typeof swot, colorClass: string, items: string[] }) => (
    <div className={`p-5 rounded-2xl border ${colorClass} bg-slate-50/50 shadow-sm flex flex-col h-[300px]`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button onClick={() => addItem(type)} className="w-8 h-8 flex items-center justify-center card-modern border border-slate-200 hover:border-blue-300 hover:text-blue-900 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <input 
              value={item}
              onChange={e => updateItem(type, idx, e.target.value)}
              className="flex-1 text-sm card-modern border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
              placeholder="Descreva o item..."
            />
            <button onClick={() => removeItem(type, idx)} className="mt-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-400 italic text-center mt-4">Nenhum item adicionado.</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrante title="Forças (Strengths)" type="forcas" colorClass="border-emerald-200" items={swot.forcas} />
        <Quadrante title="Fraquezas (Weaknesses)" type="fraquezas" colorClass="border-rose-200" items={swot.fraquezas} />
        <Quadrante title="Oportunidades (Opportunities)" type="oportunidades" colorClass="border-blue-200" items={swot.oportunidades} />
        <Quadrante title="Ameaças (Threats)" type="ameacas" colorClass="border-amber-200" items={swot.ameacas} />
      </div>
    </div>
  )
}

function ActionPlanManager() {
  const [plans, setPlans] = useState(() => {
    try {
      const saved = localStorage.getItem("5w2h_plans");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading 5w2h_plans", e);
    }
    return [
      {
        id: 1,
        what: "Treinamento de vendas para novos consultores",
        why: "Melhorar a conversão de porta a porta",
        where: "Sede Regional",
        who: "Carlos (Gerente Comercial)",
        when: "Ate 15/07",
        how: "Workshop de 4 horas",
        howMuch: "R$ 0,00"
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem("5w2h_plans", JSON.stringify(plans));
  }, [plans]);

  const addPlan = () => {
    setPlans([...plans, {
      id: Date.now(),
      what: "", why: "", where: "", who: "", when: "", how: "", howMuch: ""
    }]);
  };

  const updatePlan = (id: number, field: string, value: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePlan = (id: number) => {
    setPlans(plans.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Cadastre e acompanhe seus planos de ação.</p>
        <button onClick={addPlan} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm text-sm font-bold">
          <Plus className="w-4 h-4" />
          Novo Plano
        </button>
      </div>

      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div key={plan.id} className="card-modern border border-slate-200 rounded-2xl p-5 shadow-sm relative group">
            <button onClick={() => removePlan(plan.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                {index + 1}
              </div>
              <input 
                value={plan.what}
                onChange={e => updatePlan(plan.id, "what", e.target.value)}
                placeholder="O quê? (What)"
                className="text-lg font-bold text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-300 flex-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Por quê? (Why)</label>
                <input 
                  value={plan.why}
                  onChange={e => updatePlan(plan.id, "why", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="Motivo..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Quem? (Who)</label>
                <input 
                  value={plan.who}
                  onChange={e => updatePlan(plan.id, "who", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="Responsável..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Quando? (When)</label>
                <input 
                  value={plan.when}
                  onChange={e => updatePlan(plan.id, "when", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="Prazo..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Onde? (Where)</label>
                <input 
                  value={plan.where}
                  onChange={e => updatePlan(plan.id, "where", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="Local..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Como? (How)</label>
                <input 
                  value={plan.how}
                  onChange={e => updatePlan(plan.id, "how", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="Método..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Quanto? (How Much)</label>
                <input 
                  value={plan.howMuch}
                  onChange={e => updatePlan(plan.id, "howMuch", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  placeholder="Custo/Meta..."
                />
              </div>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-center py-12 text-slate-400 card-modern border border-slate-200 border-dashed rounded-2xl">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum plano de ação cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OkrManager() {
  const [okrs, setOkrs] = useState([
    {
      id: 1,
      objective: "Expandir a base de clientes com alta rentabilidade",
      krs: [
        { id: 101, title: "Aumentar ativações de planos premium de 20 para 50/mês", progress: 40 },
        { id: 102, title: "Reduzir o churn precoce de 8% para 4%", progress: 75 }
      ]
    }
  ]);

  const addOkr = () => {
    setOkrs([...okrs, { id: Date.now(), objective: "", krs: [] }]);
  };

  const updateObjective = (id: number, value: string) => {
    setOkrs(okrs.map(o => o.id === id ? { ...o, objective: value } : o));
  };

  const removeOkr = (id: number) => {
    setOkrs(okrs.filter(o => o.id !== id));
  };

  const addKr = (okrId: number) => {
    setOkrs(okrs.map(o => {
      if (o.id === okrId) {
        return { ...o, krs: [...o.krs, { id: Date.now(), title: "", progress: 0 }] };
      }
      return o;
    }));
  };

  const updateKr = (okrId: number, krId: number, field: string, value: string | number) => {
    setOkrs(okrs.map(o => {
      if (o.id === okrId) {
        return { ...o, krs: o.krs.map(kr => kr.id === krId ? { ...kr, [field]: value } : kr) };
      }
      return o;
    }));
  };

  const removeKr = (okrId: number, krId: number) => {
    setOkrs(okrs.map(o => {
      if (o.id === okrId) {
        return { ...o, krs: o.krs.filter(kr => kr.id !== krId) };
      }
      return o;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Defina e acompanhe seus Objetivos e Resultados-Chave.</p>
        <button onClick={addOkr} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm text-sm font-bold">
          <Plus className="w-4 h-4" />
          Novo OKR
        </button>
      </div>

      <div className="space-y-6">
        {okrs.map((okr, index) => (
          <div key={okr.id} className="card-modern border border-slate-200 rounded-2xl p-6 shadow-sm relative group">
            <button onClick={() => removeOkr(okr.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-black text-lg border border-blue-100 shrink-0">
                O{index + 1}
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Objetivo (Inspiracional e Qualitativo)</label>
                <input 
                  value={okr.objective}
                  onChange={e => updateObjective(okr.id, e.target.value)}
                  placeholder="Ex: Dominar o mercado no bairro Centro..."
                  className="w-full text-lg font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none placeholder:text-slate-300 py-1"
                />
              </div>
            </div>
            
            <div className="pl-14 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Key Results (Mensuráveis)</label>
                <button onClick={() => addKr(okr.id)} className="text-xs font-bold text-blue-900 hover:text-blue-900 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Adicionar KR
                </button>
              </div>
              
              {okr.krs.map((kr, krIndex) => (
                <div key={kr.id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl group/kr">
                  <div className="font-bold text-slate-400 text-xs w-8">KR {krIndex + 1}</div>
                  <input 
                    value={kr.title}
                    onChange={e => updateKr(okr.id, kr.id, "title", e.target.value)}
                    placeholder="Ex: Aumentar vendas de X para Y..."
                    className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300"
                  />
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={kr.progress}
                      onChange={e => updateKr(okr.id, kr.id, "progress", parseInt(e.target.value))}
                      className="w-full accent-blue-900"
                    />
                    <span className="text-xs font-bold text-slate-600 w-8 text-right">{kr.progress}%</span>
                  </div>
                  <button onClick={() => removeKr(okr.id, kr.id)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded hover:bg-white opacity-0 group-hover/kr:opacity-100 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {okr.krs.length === 0 && (
                <p className="text-xs text-slate-400 italic">Nenhum Key Result adicionado.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const GUT_SCALE = {
  G: [
    { value: 5, label: "5 - Extremamente grave" },
    { value: 4, label: "4 - Muito grave" },
    { value: 3, label: "3 - Grave" },
    { value: 2, label: "2 - Pouco grave" },
    { value: 1, label: "1 - Sem gravidade" }
  ],
  U: [
    { value: 5, label: "5 - Ação imediata" },
    { value: 4, label: "4 - É urgente" },
    { value: 3, label: "3 - O mais rápido possível" },
    { value: 2, label: "2 - Pouco urgente" },
    { value: 1, label: "1 - Pode esperar" }
  ],
  T: [
    { value: 5, label: "5 - Piora rapidamente" },
    { value: 4, label: "4 - Piora em pouco tempo" },
    { value: 3, label: "3 - Irá piorar" },
    { value: 2, label: "2 - Piora a longo prazo" },
    { value: 1, label: "1 - Não irá piorar" }
  ]
};

function GutManager() {
  const [problems, setProblems] = useState([
    { id: 1, title: "Alta taxa de cancelamento no bairro Sul", g: 5, u: 4, t: 4 },
    { id: 2, title: "Falta de materiais no estoque", g: 4, u: 4, t: 3 }
  ]);

  const addProblem = () => {
    setProblems([...problems, { id: Date.now(), title: "", g: 1, u: 1, t: 1 }]);
  };

  const updateProblem = (id: number, field: string, value: string | number) => {
    setProblems(problems.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProblem = (id: number) => {
    setProblems(problems.filter(p => p.id !== id));
  };

  const sortedProblems = [...problems].sort((a, b) => (b.g * b.u * b.t) - (a.g * a.u * a.t));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-rose-100 text-rose-700 border-rose-200";
    if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
    if (score >= 20) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Priorize problemas usando Gravidade, Urgência e Tendência.</p>
        <button onClick={addProblem} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm text-sm font-bold">
          <Plus className="w-4 h-4" />
          Novo Problema
        </button>
      </div>

      <div className="space-y-4">
        {sortedProblems.map((problem, index) => {
          const score = problem.g * problem.u * problem.t;
          return (
            <div key={problem.id} className="card-modern border border-slate-200 rounded-2xl p-5 shadow-sm relative group flex flex-col md:flex-row md:items-center gap-6">
              <button onClick={() => removeProblem(problem.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all z-10 md:static md:order-last">
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <input 
                    value={problem.title}
                    onChange={e => updateProblem(problem.id, "title", e.target.value)}
                    placeholder="Descreva o problema..."
                    className="text-lg font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none placeholder:text-slate-300 flex-1 py-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-11">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Gravidade (G)</label>
                    <select 
                      value={problem.g}
                      onChange={e => updateProblem(problem.id, "g", parseInt(e.target.value))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-blue-400 bg-slate-50"
                    >
                      {GUT_SCALE.G.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Urgência (U)</label>
                    <select 
                      value={problem.u}
                      onChange={e => updateProblem(problem.id, "u", parseInt(e.target.value))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-blue-400 bg-slate-50"
                    >
                      {GUT_SCALE.U.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tendência (T)</label>
                    <select 
                      value={problem.t}
                      onChange={e => updateProblem(problem.id, "t", parseInt(e.target.value))}
                      className="w-full text-sm border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-blue-400 bg-slate-50"
                    >
                      {GUT_SCALE.T.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center justify-between md:justify-center shrink-0 w-full md:w-32 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Score GUT</span>
                <div className={`mt-1 px-4 py-2 rounded-xl border text-2xl font-black text-center w-full md:w-auto shadow-sm ${getScoreColor(score)}`}>
                  {score}
                </div>
              </div>
            </div>
          );
        })}
        {sortedProblems.length === 0 && (
          <div className="text-center py-12 text-slate-400 card-modern border border-slate-200 border-dashed rounded-2xl">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum problema cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PdcaManager() {
  const [cycles, setCycles] = useState([
    {
      id: 1,
      title: "Redução do Tempo de Instalação",
      plan: "Mapear processos de instalação. Definir meta: reduzir de 4h para 2h. Criar checklist.",
      do: "Treinamento com equipe. Executar piloto com nova ferramenta por 2 semanas.",
      check: "Tempo médio reduziu para 2h30. 2 técnicos tiveram dificuldade com app.",
      act: "Ajustar app para modo offline. Estender uso para todos e padronizar manuais."
    }
  ]);

  const addCycle = () => {
    setCycles([...cycles, { id: Date.now(), title: "", plan: "", do: "", check: "", act: "" }]);
  };

  const updateCycle = (id: number, field: string, value: string) => {
    setCycles(cycles.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCycle = (id: number) => {
    setCycles(cycles.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Gerencie ciclos de melhoria contínua na metodologia PDCA.</p>
        <button onClick={addCycle} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm text-sm font-bold">
          <Plus className="w-4 h-4" />
          Novo Ciclo
        </button>
      </div>

      <div className="space-y-6">
        {cycles.map((cycle, index) => (
          <div key={cycle.id} className="card-modern border border-slate-200 rounded-2xl p-6 shadow-sm relative group">
            <button onClick={() => removeCycle(cycle.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all z-10">
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm shrink-0 mt-1">
                {index + 1}
              </div>
              <input 
                value={cycle.title}
                onChange={e => updateCycle(cycle.id, "title", e.target.value)}
                placeholder="Título da melhoria..."
                className="text-lg font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 outline-none placeholder:text-slate-300 flex-1 py-1"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">P</div>
                  <h4 className="font-bold text-blue-900 text-sm">Plan (Planejar)</h4>
                </div>
                <textarea 
                  value={cycle.plan}
                  onChange={e => updateCycle(cycle.id, "plan", e.target.value)}
                  placeholder="Defina o problema, objetivos e o plano de ação..."
                  className="w-full h-24 text-sm bg-white/50 border border-blue-200/50 rounded-lg p-2 outline-none focus:border-blue-400 focus:bg-white resize-none text-slate-700"
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">D</div>
                  <h4 className="font-bold text-amber-900 text-sm">Do (Executar)</h4>
                </div>
                <textarea 
                  value={cycle.do}
                  onChange={e => updateCycle(cycle.id, "do", e.target.value)}
                  placeholder="Treine e execute o plano (preferencialmente em pequena escala)..."
                  className="w-full h-24 text-sm bg-white/50 border border-amber-200/50 rounded-lg p-2 outline-none focus:border-amber-400 focus:bg-white resize-none text-slate-700"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs">C</div>
                  <h4 className="font-bold text-blue-950 text-sm">Check (Verificar)</h4>
                </div>
                <textarea 
                  value={cycle.check}
                  onChange={e => updateCycle(cycle.id, "check", e.target.value)}
                  placeholder="Verifique os resultados, compare com a meta..."
                  className="w-full h-24 text-sm bg-white/50 border border-blue-200/50 rounded-lg p-2 outline-none focus:border-blue-400 focus:bg-white resize-none text-slate-700"
                />
              </div>

              <div className="bg-[#E6FAF1] border border-[#00A86B]/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">A</div>
                  <h4 className="font-bold text-emerald-900 text-sm">Act (Agir)</h4>
                </div>
                <textarea 
                  value={cycle.act}
                  onChange={e => updateCycle(cycle.id, "act", e.target.value)}
                  placeholder="Padronize o que deu certo ou ajuste para um novo ciclo..."
                  className="w-full h-24 text-sm bg-white/50 border border-emerald-200/50 rounded-lg p-2 outline-none focus:border-emerald-400 focus:bg-white resize-none text-slate-700"
                />
              </div>
            </div>
          </div>
        ))}
        {cycles.length === 0 && (
          <div className="text-center py-12 text-slate-400 card-modern border border-slate-200 border-dashed rounded-2xl">
            <RefreshCcw className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum ciclo PDCA cadastrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UnifiedReportManager() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Relatório Executivo Integrado</h2>
          <p className="text-slate-500 max-w-lg mx-auto mt-2">Visão consolidada das principais análises e planos de ação para suporte à tomada de decisão.</p>
        </div>
      </div>

      <div className="card-modern border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-900" /> 1. Síntese SWOT
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#E6FAF1] rounded-xl p-4 border border-[#00A86B]/20">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Pontos Fortes Principais</h4>
            <ul className="text-sm text-emerald-900 space-y-1 list-disc pl-4">
              <li>Equipe de vendas bem treinada e engajada</li>
              <li>Cobertura de rede de fibra na região foco</li>
            </ul>
          </div>
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">Pontos de Atenção (Fraquezas/Ameaças)</h4>
            <ul className="text-sm text-rose-900 space-y-1 list-disc pl-4">
              <li>Sistema de faturamento instável</li>
              <li>Entrada agressiva de novo concorrente</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card-modern border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-900" /> 2. OKRs e Objetivos Atuais
        </h3>
        <div className="space-y-4">
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
            <h4 className="font-bold text-slate-800 text-sm">Objetivo: Dominar o mercado de fibra na Zona Sul</h4>
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-blue-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Aumentar market share para 35%</span>
                <span className="font-bold text-slate-800">Progresso: 15%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Reduzir churn no bairro em 10%</span>
                <span className="font-bold text-slate-800">Progresso: 5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-modern border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-900" /> 3. Priorização de Problemas (GUT)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">Problema Crítico</th>
                <th className="px-4 py-2">Score GUT</th>
                <th className="px-4 py-2 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">Alta taxa de cancelamento no bairro Sul</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-rose-100 text-rose-700 rounded font-bold">80</span></td>
                <td className="px-4 py-3 text-rose-600 font-medium">Ação Imediata Necessária</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">Falta de materiais no estoque</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-bold">48</span></td>
                <td className="px-4 py-3 text-amber-600 font-medium">Em Andamento</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Removed Mock Banner */}
    </div>
  );
}

function BscManager() {
  const [bsc, setBsc] = useState({
    financeira: ["Aumentar receita em 15%", "Reduzir custos operacionais em 5%"],
    clientes: ["Melhorar NPS para 75", "Reduzir churn para 2%"],
    processos: ["Automatizar onboarding de clientes", "Reduzir tempo de reparo"],
    aprendizado: ["Treinamento mensal da equipe", "Implantar nova cultura ágil"]
  });

  const updateItem = (category: keyof typeof bsc, index: number, value: string) => {
    const newArr = [...bsc[category]];
    newArr[index] = value;
    setBsc({ ...bsc, [category]: newArr });
  }
  const addItem = (category: keyof typeof bsc) => setBsc({ ...bsc, [category]: [...bsc[category], ""] });
  const removeItem = (category: keyof typeof bsc, index: number) => setBsc({ ...bsc, [category]: bsc[category].filter((_, i) => i !== index) });

  const Quadrante = ({ title, type, colorClass, items }: { title: string, type: keyof typeof bsc, colorClass: string, items: string[] }) => (
    <div className={`p-5 rounded-2xl border ${colorClass} bg-slate-50/50 shadow-sm flex flex-col h-[300px]`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button onClick={() => addItem(type)} className="w-8 h-8 flex items-center justify-center card-modern border border-slate-200 hover:border-blue-300 hover:text-blue-900 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <input value={item} onChange={e => updateItem(type, idx, e.target.value)} className="flex-1 text-sm card-modern border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm" placeholder="Descreva o objetivo..." />
            <button onClick={() => removeItem(type, idx)} className="mt-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrante title="Perspectiva Financeira" type="financeira" colorClass="border-emerald-200" items={bsc.financeira} />
        <Quadrante title="Perspectiva do Cliente" type="clientes" colorClass="border-blue-200" items={bsc.clientes} />
        <Quadrante title="Processos Internos" type="processos" colorClass="border-amber-200" items={bsc.processos} />
        <Quadrante title="Aprendizado & Crescimento" type="aprendizado" colorClass="border-sky-200" items={bsc.aprendizado} />
      </div>
    </div>
  );
}

function BcgManager() {
  const [bcg, setBcg] = useState({
    estrela: ["Plano Fibra 1 Giga"],
    vaca: ["Plano Fibra 300 Mega"],
    interrogacao: ["Combo Casa Inteligente"],
    abacaxi: ["Plano Cobre Antigo"]
  });

  const updateItem = (category: keyof typeof bcg, index: number, value: string) => {
    const newArr = [...bcg[category]];
    newArr[index] = value;
    setBcg({ ...bcg, [category]: newArr });
  }
  const addItem = (category: keyof typeof bcg) => setBcg({ ...bcg, [category]: [...bcg[category], ""] });
  const removeItem = (category: keyof typeof bcg, index: number) => setBcg({ ...bcg, [category]: bcg[category].filter((_, i) => i !== index) });

  const Quadrante = ({ title, desc, type, colorClass, items }: { title: string, desc: string, type: keyof typeof bcg, colorClass: string, items: string[] }) => (
    <div className={`p-5 rounded-2xl border ${colorClass} bg-slate-50/50 shadow-sm flex flex-col h-[300px]`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button onClick={() => addItem(type)} className="w-8 h-8 flex items-center justify-center card-modern border border-slate-200 hover:border-blue-300 hover:text-blue-900 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mb-4">{desc}</p>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <input value={item} onChange={e => updateItem(type, idx, e.target.value)} className="flex-1 text-sm card-modern border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm" placeholder="Nome do produto/plano..." />
            <button onClick={() => removeItem(type, idx)} className="mt-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrante title="Estrela" desc="Alta Participação | Alto Crescimento" type="estrela" colorClass="border-yellow-300" items={bcg.estrela} />
        <Quadrante title="Interrogação" desc="Baixa Participação | Alto Crescimento" type="interrogacao" colorClass="border-blue-200" items={bcg.interrogacao} />
        <Quadrante title="Vaca Leiteira" desc="Alta Participação | Baixo Crescimento" type="vaca" colorClass="border-emerald-200" items={bcg.vaca} />
        <Quadrante title="Abacaxi" desc="Baixa Participação | Baixo Crescimento" type="abacaxi" colorClass="border-rose-200" items={bcg.abacaxi} />
      </div>
    </div>
  );
}

function EisenhowerManager() {
  const [matrix, setMatrix] = useState({
    q1: ["Ligar para cliente insatisfeito VIP", "Resolver falha no sistema"],
    q2: ["Planejar treinamento da equipe", "Revisar metas trimestrais"],
    q3: ["Responder e-mails rotineiros", "Reunião de alinhamento desnecessária"],
    q4: ["Navegar em redes sociais", "Perfeccionismo em relatório interno"]
  });

  const updateItem = (category: keyof typeof matrix, index: number, value: string) => {
    const newArr = [...matrix[category]];
    newArr[index] = value;
    setMatrix({ ...matrix, [category]: newArr });
  }
  const addItem = (category: keyof typeof matrix) => setMatrix({ ...matrix, [category]: [...matrix[category], ""] });
  const removeItem = (category: keyof typeof matrix, index: number) => setMatrix({ ...matrix, [category]: matrix[category].filter((_, i) => i !== index) });

  const Quadrante = ({ title, desc, type, colorClass, items }: { title: string, desc: string, type: keyof typeof matrix, colorClass: string, items: string[] }) => (
    <div className={`p-5 rounded-2xl border ${colorClass} bg-slate-50/50 shadow-sm flex flex-col h-[300px]`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <button onClick={() => addItem(type)} className="w-8 h-8 flex items-center justify-center card-modern border border-slate-200 hover:border-blue-300 hover:text-blue-900 rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-slate-500 mb-4">{desc}</p>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <input value={item} onChange={e => updateItem(type, idx, e.target.value)} className="flex-1 text-sm card-modern border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm" placeholder="Tarefa..." />
            <button onClick={() => removeItem(type, idx)} className="mt-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Quadrante title="Faça Agora" desc="Importante & Urgente" type="q1" colorClass="border-rose-300 bg-rose-50/20" items={matrix.q1} />
        <Quadrante title="Agende" desc="Importante & Não Urgente" type="q2" colorClass="border-emerald-200" items={matrix.q2} />
        <Quadrante title="Delegue" desc="Não Importante & Urgente" type="q3" colorClass="border-amber-200" items={matrix.q3} />
        <Quadrante title="Elimine" desc="Não Importante & Não Urgente" type="q4" colorClass="border-slate-300 bg-slate-100/50" items={matrix.q4} />
      </div>
    </div>
  );
}

function IshikawaManager() {
  const [problem, setProblem] = useState("Alto índice de churn nos 3 primeiros meses");
  const [ishikawa, setIshikawa] = useState({
    metodo: ["Falta de follow-up", "Onboarding ineficiente"],
    maquina: ["Sistema de CRM lento"],
    material: ["Contratos confusos"],
    maoDeObra: ["Consultores sem treinamento em retenção"],
    medida: ["Falta de KPI de engajamento"],
    meioAmbiente: ["Concorrência forte no local"]
  });

  const updateItem = (category: keyof typeof ishikawa, index: number, value: string) => {
    const newArr = [...ishikawa[category]];
    newArr[index] = value;
    setIshikawa({ ...ishikawa, [category]: newArr });
  }
  const addItem = (category: keyof typeof ishikawa) => setIshikawa({ ...ishikawa, [category]: [...ishikawa[category], ""] });
  const removeItem = (category: keyof typeof ishikawa, index: number) => setIshikawa({ ...ishikawa, [category]: ishikawa[category].filter((_, i) => i !== index) });

  const Categoria = ({ title, type }: { title: string, type: keyof typeof ishikawa }) => (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm text-slate-700">{title}</h4>
        <button onClick={() => addItem(type)} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"><Plus className="w-3.5 h-3.5" /></button>
      </div>
      <div className="space-y-2">
        {ishikawa[type].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <input value={item} onChange={e => updateItem(type, idx, e.target.value)} className="flex-1 text-xs bg-slate-50 border border-slate-100 rounded px-2 py-1.5 outline-none focus:border-blue-300" placeholder="Causa..." />
            <button onClick={() => removeItem(type, idx)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center gap-4">
        <div className="font-black uppercase tracking-wider text-rose-800 text-xs w-24 shrink-0 text-right">O Efeito (Problema)</div>
        <div className="h-8 w-px bg-rose-200"></div>
        <input 
          value={problem} 
          onChange={e => setProblem(e.target.value)}
          className="flex-1 card-modern border border-rose-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Categoria title="Método (Method)" type="metodo" />
        <Categoria title="Máquina (Machine)" type="maquina" />
        <Categoria title="Material (Material)" type="material" />
        <Categoria title="Mão de Obra (Manpower)" type="maoDeObra" />
        <Categoria title="Medida (Measurement)" type="medida" />
        <Categoria title="Meio Ambiente (Mother Nature)" type="meioAmbiente" />
      </div>
    </div>
  );
}

function KaizenManager() {
  const [items, setItems] = useState([
    { id: 1, opportunity: "Demora na validação de crédito", before: "Processo manual", after: "Integração via API com Serasa", status: "Em Análise" }
  ]);

  const addItem = () => setItems([...items, { id: Date.now(), opportunity: "", before: "", after: "", status: "Pendente" }]);
  const updateItem = (id: number, field: string, value: string) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm font-bold">
          <Plus className="w-4 h-4" />
          Nova Melhoria
        </button>
      </div>
      <div className="card-modern rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th className="p-3 w-1/4">Oportunidade</th>
              <th className="p-3 w-1/4">Como Era (Antes)</th>
              <th className="p-3 w-1/4">Como Ficará (Depois)</th>
              <th className="p-3 w-32">Status</th>
              <th className="p-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="p-2"><input value={item.opportunity} onChange={e => updateItem(item.id, "opportunity", e.target.value)} className="w-full bg-transparent border border-transparent focus:border-blue-200 rounded px-2 py-1 outline-none" /></td>
                <td className="p-2"><input value={item.before} onChange={e => updateItem(item.id, "before", e.target.value)} className="w-full bg-transparent border border-transparent focus:border-rose-200 rounded px-2 py-1 outline-none" /></td>
                <td className="p-2"><input value={item.after} onChange={e => updateItem(item.id, "after", e.target.value)} className="w-full bg-transparent border border-transparent focus:border-emerald-200 rounded px-2 py-1 outline-none" /></td>
                <td className="p-2">
                  <select value={item.status} onChange={e => updateItem(item.id, "status", e.target.value)} className="w-full bg-transparent border border-slate-200 rounded px-2 py-1 outline-none text-xs font-semibold">
                    <option value="Pendente">Pendente</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Implementado">Implementado</option>
                  </select>
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4 mx-auto" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FunilManager() {
  const [funnel, setFunnel] = useState([
    { stage: "Leads (Topo)", value: 500 },
    { stage: "Qualificados", value: 120 },
    { stage: "Propostas Abertas", value: 60 },
    { stage: "Negociação", value: 20 },
    { stage: "Vendas (Fundo)", value: 15 }
  ]);

  const updateStage = (index: number, val: string) => {
    const newFunnel = [...funnel];
    newFunnel[index].value = parseInt(val) || 0;
    setFunnel(newFunnel);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {funnel.map((item, idx) => {
          const maxWidth = funnel[0].value || 1;
          const widthPct = Math.max(10, (item.value / maxWidth) * 100);
          return (
            <div key={idx} className="flex flex-col items-center">
              <div 
                className="bg-blue-600 rounded-lg text-white flex items-center justify-between px-4 py-2 shadow-sm transition-all"
                style={{ width: `${widthPct}%`, minWidth: '200px' }}
              >
                <span className="font-bold text-sm truncate pr-2">{item.stage}</span>
                <input 
                  type="number" 
                  value={item.value} 
                  onChange={e => updateStage(idx, e.target.value)}
                  className="w-16 bg-blue-700 border-none rounded px-2 py-1 text-center font-black outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              {idx < funnel.length - 1 && (
                <div className="h-4 w-px bg-slate-300 my-1"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanManager() {
  const [cards, setCards] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("kanban_cards");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Sync with 5W2H
  React.useEffect(() => {
    try {
      const savedW2h = localStorage.getItem("5w2h_plans");
      const w2hPlans = savedW2h ? JSON.parse(savedW2h) : [];
      
      setCards(prevCards => {
        let updated = [...prevCards];
        w2hPlans.forEach((plan: any) => {
          const existingIdx = updated.findIndex(c => c.id === plan.id && c.source === "5w2h");
          if (existingIdx === -1) {
            updated.push({
              id: plan.id,
              title: plan.what || "Sem título (5W2H)",
              description: `O Porquê: ${plan.why || "-"}\nQuem: ${plan.who || "-"}\nQuando: ${plan.when || "-"}`,
              status: "A Fazer",
              source: "5w2h"
            });
          } else {
            updated[existingIdx].title = plan.what || "Sem título (5W2H)";
            updated[existingIdx].description = `O Porquê: ${plan.why || "-"}\nQuem: ${plan.who || "-"}\nQuando: ${plan.when || "-"}`;
          }
        });
        
        updated = updated.filter(c => {
          if (c.source === "5w2h") {
            return w2hPlans.some((p: any) => p.id === c.id);
          }
          return true;
        });

        return updated;
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("kanban_cards", JSON.stringify(cards));
  }, [cards]);

  const addManualCard = () => {
    setCards([...cards, {
      id: Date.now(),
      title: "Nova Meta (Manual)",
      description: "Descreva a sua meta manual...",
      status: "A Fazer",
      source: "manual"
    }]);
  };

  const updateCard = (id: number, field: string, value: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteCard = (id: number) => {
    if(window.confirm("Deseja realmente remover esta meta?")) {
       setCards(cards.filter(c => c.id !== id));
    }
  };

  const moveCard = (id: number, newStatus: string) => {
    setCards(cards.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const cols = ["A Fazer", "Em Progresso", "Concluído"];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Gerencie e acompanhe metas. Metas do 5W2H são sincronizadas automaticamente.</p>
        <button onClick={addManualCard} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm font-bold">
          <Plus className="w-4 h-4" />
          Nova Meta Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cols.map(col => (
          <div key={col} className="bg-slate-100 rounded-2xl p-4 flex flex-col h-full min-h-[400px]">
            <h3 className="font-black text-slate-700 uppercase tracking-wider text-sm mb-4 border-b border-slate-200 pb-2 flex items-center justify-between">
              {col}
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{cards.filter(c => c.status === col).length}</span>
            </h3>
            
            <div className="space-y-3 flex-1">
              {cards.filter(c => c.status === col).map(card => (
                <div key={card.id} className="card-modern p-3 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-2 relative group">
                  {card.source === "5w2h" && (
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl uppercase">
                      5W2H
                    </div>
                  )}
                  {card.source === "manual" ? (
                    <input 
                      type="text" 
                      value={card.title} 
                      onChange={e => updateCard(card.id, "title", e.target.value)}
                      className="font-bold text-sm text-slate-800 outline-none w-full bg-transparent border-b border-transparent focus:border-blue-200"
                    />
                  ) : (
                    <div className="font-bold text-sm text-slate-800 pr-10 leading-snug">{card.title}</div>
                  )}

                  {card.source === "manual" ? (
                    <textarea 
                      value={card.description} 
                      onChange={e => updateCard(card.id, "description", e.target.value)}
                      className="text-xs text-slate-600 outline-none w-full bg-transparent resize-none h-16 border border-transparent focus:border-blue-200 rounded p-1"
                    />
                  ) : (
                    <div className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">{card.description}</div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <div className="flex gap-1">
                      {col !== "A Fazer" && (
                        <button onClick={() => moveCard(card.id, cols[cols.indexOf(col)-1])} className="text-slate-400 hover:text-blue-600 p-1 bg-slate-50 hover:bg-blue-50 rounded" title="Mover para trás">
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {col !== "Concluído" && (
                        <button onClick={() => moveCard(card.id, cols[cols.indexOf(col)+1])} className="text-slate-400 hover:text-blue-600 p-1 bg-slate-50 hover:bg-blue-50 rounded" title="Mover para frente">
                          <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      )}
                    </div>
                    {card.source === "manual" && (
                      <button onClick={() => deleteCard(card.id)} className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {cards.filter(c => c.status === col).length === 0 && (
                <div className="text-center text-xs text-slate-400 italic py-6">Vazio</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultToolManager({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
        {tool.icon}
      </div>
      <p className="font-medium text-slate-500">Em desenvolvimento</p>
      <p className="text-sm mt-2 max-w-md text-center">
        A tela de gestão dedicada para <strong>{tool.name}</strong> está sendo construída. 
        Em breve você poderá gerenciar as informações diretamente por aqui.
      </p>
    </div>
  );
}

// ---- Workspace Wrapper ----

function ToolWorkspace({ tool, onBack, loggedUser }: { tool: Tool, onBack: () => void, loggedUser: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const sessionId = `gestor-${loggedUser || "default"}-${tool.id}`;

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/agente/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          mensagem: userMessage,
          ferramenta: tool.name
        })
      });

      const data = await res.json();
      if (data.resposta) {
        setMessages(prev => [...prev, { role: "assistant", content: data.resposta }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Ocorreu um erro ao consultar o agente." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro de conexão com o servidor." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = async () => {
    setMessages([]);
    try {
      await fetch("/api/agente/nova-sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const renderToolSpecificUI = () => {
    switch (tool.id) {
      case "SWOT":
        return <SwotManager />;
      case "5W2H":
        return <ActionPlanManager />;
      case "OKR":
        return <OkrManager />;
      case "GUT":
        return <GutManager />;
      case "PDCA":
        return <PdcaManager />;
      case "BSC":
        return <BscManager />;
      case "Ishikawa":
        return <IshikawaManager />;
      case "BCG":
        return <BcgManager />;
      case "Kaizen":
        return <KaizenManager />;
      case "Eisenhower":
        return <EisenhowerManager />;
      case "Funil":
        return <FunilManager />;
      case "REPORT":
        return <UnifiedReportManager />;
      case "Kanban":
        return <KanbanManager />;
      default:
        return <DefaultToolManager tool={tool} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-36px)] -m-4 md:-m-6 overflow-hidden bg-slate-50">
      {/* Área da Ferramenta */}
      <div className="flex-1 flex flex-col min-w-0 bg-white lg:border-r border-slate-200 relative overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors print:hidden">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-100 shrink-0">
                {tool.icon}
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{tool.name}</h2>
                <p className="text-xs text-slate-500 hidden md:block">{tool.summary}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                 alert(`Sincronizando ${tool.name} com a aba correspondente da planilha...`);
              }}
              className="px-3 py-1.5 flex items-center gap-1.5 bg-[#E6FAF1] text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors text-xs font-bold border border-emerald-200 print:hidden shadow-sm"
              title="Sincronizar com Planilha"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sincronizar Aba</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 print:hidden"></div>
            <button 
              onClick={async () => {
                const element = document.getElementById('report-content');
                if (element) {
                  const html2pdf = (await import('html2pdf.js')).default;
                  const opt = {
                    margin:       10,
                    filename:     `relatorio-${tool.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                    image:        { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas:  { scale: 2 },
                    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
                  };
                  html2pdf().set(opt).from(element).save();
                }
              }}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-blue-900 print:hidden"
              title="Exportar / Salvar PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.print()}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-blue-900 print:hidden"
              title="Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('report-content');
                let content = "";
                if (element) {
                  content = element.innerText.substring(0, 500) + (element.innerText.length > 500 ? "..." : "");
                }
                const text = `Confira a análise estratégica gerada na ferramenta ${tool.name}:\n\nObjetivo: ${tool.objective}\n\n${content ? 'Resumo da Análise:\n' + content + '\n\n' : ''}Acesse a plataforma para ver os detalhes completos.`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="p-2 hover:bg-[#E6FAF1] rounded-xl transition-colors text-slate-500 hover:text-[#00A86B] print:hidden"
              title="Compartilhar via WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 print:hidden"></div>
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} 
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 text-slate-500 hover:text-blue-900 print:hidden"
              title={isSidebarExpanded ? "Recolher Assistente IA" : "Expandir Assistente IA"}
            >
              {isSidebarExpanded ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/30">
          <div id="report-content" className="max-w-4xl mx-auto">
            {renderToolSpecificUI()}
          </div>
        </div>
      </div>

      {/* Assistente IA (Sidebar) */}
      {isSidebarExpanded && (
        <div className="w-full lg:w-[400px] flex flex-col bg-white border-t lg:border-t-0 border-slate-200 z-20 h-[400px] lg:h-auto shrink-0 animate-slide-left print:hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/50">
             <div className="flex items-center gap-2">
               <BrainCircuit className="w-5 h-5 text-blue-900" />
               <div>
                 <h3 className="font-bold text-slate-800 text-sm">Assistente IA</h3>
                 <p className="text-[10px] text-blue-900 font-medium uppercase tracking-wider">Modo Contexto: {tool.name}</p>
               </div>
             </div>
             <button onClick={resetSession} className="p-2 hover:card-modern rounded-lg text-slate-500 transition-colors shadow-sm border border-transparent hover:border-slate-200" title="Limpar Histórico">
               <RefreshCw className="w-4 h-4" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-600">Assistente para {tool.name}</p>
                  <p className="text-xs text-slate-500 max-w-[250px] mt-1 mx-auto">Peça para a IA analisar os dados da ferramenta ou gerar insights baseados neles.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === "user" 
                      ? "bg-blue-900 text-white rounded-br-none" 
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-slate max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="card-modern border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite aqui sua dúvida ou comando..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="w-12 h-12 shrink-0 bg-blue-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main Component ----

export default function EstrategiaPage({ loggedUser }: { loggedUser: string }) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  if (selectedTool) {
    return <ToolWorkspace tool={selectedTool} onBack={() => setSelectedTool(null)} loggedUser={loggedUser} />;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-fade-in pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
            <BrainCircuit className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">Gestão Estratégica</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 tracking-widest uppercase">Assistente de IA & Ferramentas</p>
          </div>
        </div>
        <button 
          onClick={() => setSelectedTool({
            id: "REPORT",
            name: "Relatório Integrado",
            icon: <FileText className="w-5 h-5" />,
            summary: "Visão consolidada das principais análises e planos de ação da unidade.",
            objective: "Fornecer um relatório executivo formatado para impressão ou envio por WhatsApp."
          })}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-900 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden md:inline">Relatório Integrado</span>
          <span className="md:hidden">Relatório</span>
        </button>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {STRATEGIC_TOOLS.map(tool => (
          <div 
            key={tool.id}
            onClick={() => setSelectedTool(tool)}
            className="group cursor-pointer card-modern rounded-2xl border border-slate-200 p-5 hover:border-blue-500 hover:shadow-lg transition-colors duration-200 flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-900 group-hover:border-blue-200 transition-colors">
                {tool.icon}
              </div>
              <h3 className="font-bold text-slate-800 group-hover:text-blue-900 transition-colors">{tool.name}</h3>
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Resumo</span>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">{tool.summary}</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Objetivo</span>
                <p className="text-xs text-slate-500 leading-relaxed">{tool.objective}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity">Abrir Ferramenta</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
