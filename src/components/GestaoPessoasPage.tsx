import React, { useState, useEffect } from 'react';
import { Users, User, Shield, Target, Activity, Brain, CheckCircle, Clock, Save, FileText, X, MessageSquare, Plus, Edit2, Play, Circle, Radar } from 'lucide-react';
import { Vendor, DiscResult, PDI, RaioX } from '../types';
import { Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DISC_QUESTIONS } from '../data/discQuestions';

interface GestaoPessoasPageProps {
  vendors: Vendor[];
  loggedUser: string;
  isAdmin: boolean;
}

export default function GestaoPessoasPage({ vendors, loggedUser, isAdmin }: GestaoPessoasPageProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorTab, setVendorTab] = useState<"dashboard" | "disc" | "pdi" | "raiox" | "coach">("dashboard");

  // Estados dos dados (mockados por enquanto)
  const [discResults, setDiscResults] = useState<DiscResult[]>([]);
  const [pdis, setPdis] = useState<PDI[]>([]);
  const [raioxes, setRaioxes] = useState<RaioX[]>([]);
  
  // Estado do Teste DISC
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, { mais: string, menos: string }>>({});

  // Form PDI
  const [isAddingPdi, setIsAddingPdi] = useState(false);
  const [newPdi, setNewPdi] = useState<Partial<PDI>>({});

  // If not admin, the user can only see their own profile.
  const loggedVendor = vendors.find(v => v.nome === loggedUser);
  const effectiveVendorId = isAdmin ? selectedVendorId : loggedVendor?.id;
  const selectedVendor = isAdmin ? (vendors.find(v => v.id === selectedVendorId) || vendors[0]) : loggedVendor;

  useEffect(() => {
    // Popula mocks iniciais se vazio
    if (selectedVendor && discResults.length === 0) {
      setDiscResults([{
        id: "1", vendorId: selectedVendor.id, data: new Date().toISOString(),
        d: 12, i: 18, s: 5, c: 3, perfilPrimario: "I", perfilSecundario: "D", perfilAnimal: "Águia"
      }]);
      setPdis([{
        id: "p1", vendorId: selectedVendor.id, competencia: "Fechamento de Vendas",
        situacaoAtual: 3, meta: "Chegar na taxa de conversão de 15%", acaoCombinada: "Role-play 1x por semana com o coordenador",
        prazo: "2024-12-31", status: "em_andamento", dataCriacao: new Date().toISOString(), dataAtualizacao: new Date().toISOString()
      }]);
    }
  }, [selectedVendor]);

  const vendorDisc = selectedVendor ? discResults.find(d => d.vendorId === selectedVendor.id) : null;
  const vendorPdis = selectedVendor ? pdis.filter(p => p.vendorId === selectedVendor.id) : [];
  const vendorRaiox = selectedVendor ? raioxes.filter(r => r.vendorId === selectedVendor.id) : [];

  const handleTestSubmit = () => {
    let adaptado = { D: 0, I: 0, S: 0, C: 0 };
    let intimoCounts = { D: 0, I: 0, S: 0, C: 0 };

    Object.values(testAnswers).forEach(ans => {
      if(ans.mais === "D") adaptado.D++;
      if(ans.mais === "I") adaptado.I++;
      if(ans.mais === "S") adaptado.S++;
      if(ans.mais === "C") adaptado.C++;

      if(ans.menos === "D") intimoCounts.D++;
      if(ans.menos === "I") intimoCounts.I++;
      if(ans.menos === "S") intimoCounts.S++;
      if(ans.menos === "C") intimoCounts.C++;
    });

    const intimo = {
      D: 24 - intimoCounts.D,
      I: 24 - intimoCounts.I,
      S: 24 - intimoCounts.S,
      C: 24 - intimoCounts.C
    };

    const natural = {
      D: adaptado.D - intimo.D,
      I: adaptado.I - intimo.I,
      S: adaptado.S - intimo.S,
      C: adaptado.C - intimo.C
    };

    const d = Math.round(((natural.D + 24) / 48) * 10000) / 100;
    const i = Math.round(((natural.I + 24) / 48) * 10000) / 100;
    const s = Math.round(((natural.S + 24) / 48) * 10000) / 100;
    const c = Math.round(((natural.C + 24) / 48) * 10000) / 100;

    const scores = [
      { fator: "D" as const, value: d },
      { fator: "I" as const, value: i },
      { fator: "S" as const, value: s },
      { fator: "C" as const, value: c }
    ];

    scores.sort((a, b) => b.value - a.value);

    const perfilPrimario = scores[0].fator;
    const perfilSecundario = scores[1].fator;

    const animais = {
      "D": "Tubarão",
      "I": "Águia",
      "S": "Gato",
      "C": "Lobo"
    };

    const newRes: DiscResult = {
      id: Math.random().toString(),
      vendorId: selectedVendor.id,
      data: new Date().toISOString(),
      d, i, s, c,
      perfilPrimario,
      perfilSecundario,
      perfilAnimal: animais[perfilPrimario] as any,
      rawAdaptado: { d: adaptado.D, i: adaptado.I, s: adaptado.S, c: adaptado.C },
      rawIntimo: { d: intimo.D, i: intimo.I, s: intimo.S, c: intimo.C },
      rawNatural: { d: natural.D, i: natural.I, s: natural.S, c: natural.C }
    };

    setDiscResults([...discResults, newRes]);
    setIsTakingTest(false);
  };

  const handleSavePdi = () => {
    if (!newPdi.competencia) return;
    const pdiToSave: PDI = {
      id: Math.random().toString(),
      vendorId: selectedVendor.id,
      competencia: newPdi.competencia || "",
      situacaoAtual: newPdi.situacaoAtual || 1,
      meta: newPdi.meta || "",
      acaoCombinada: newPdi.acaoCombinada || "",
      prazo: newPdi.prazo || "",
      status: "nao_iniciado",
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    setPdis([...pdis, pdiToSave]);
    setIsAddingPdi(false);
    setNewPdi({});
  };

  const generateRaioX = () => {
    const newRx: RaioX = {
      id: Math.random().toString(),
      vendorId: selectedVendor.id,
      data: new Date().toISOString(),
      resumoIa: `${selectedVendor.nome} apresenta um perfil predominantemente Dominante/Influente. Tem facilidade para iniciar conversas, mas precisa de apoio no fechamento sistemático.`,
      pontosFortes: ["Comunicação persuasiva", "Iniciativa em campo", "Resiliência a objeções iniciais"],
      pontosAtencao: [
        { ponto: "Follow-up inconsistente", sugestao: "Usar lembretes diários no CRM" },
        { ponto: "Acelera muito o fechamento", sugestao: "Praticar escuta ativa antes da oferta de valor" }
      ],
      recomendacoesPdi: "Focar em técnicas de sondagem e organização da agenda semanal."
    };
    setRaioxes([newRx, ...raioxes]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Gestão de Pessoas <span className="text-slate-400 font-medium">| RH Estratégico</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Perfil Comportamental (DISC), PDI e Raio-X com IA para desenvolvimento da equipe comercial.
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-4" : ""} gap-6`}>
        {/* Lista de Colaboradores */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col h-[calc(100vh-200px)]">
            <h3 className="text-sm font-bold text-slate-800 mb-4 px-2 uppercase tracking-wider">Colaboradores</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {vendors.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum vendedor cadastrado.</p>
              ) : (
                vendors.map(vendor => (
                  <button
                    key={vendor.id}
                    onClick={() => { setSelectedVendorId(vendor.id); setVendorTab("dashboard"); }}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      selectedVendor?.id === vendor.id
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedVendor?.id === vendor.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {vendor.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${selectedVendor?.id === vendor.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {vendor.nome}
                        </p>
                        <p className="text-xs text-slate-500 truncate">Consultor(a) de Vendas</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dashboard do Colaborador Selecionado */}
        {selectedVendor ? (
          <div className={`${isAdmin ? "lg:col-span-3" : ""} flex flex-col h-[calc(100vh-200px)]`}>
            {/* Header do Colaborador */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedVendor.nome}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      <User className="w-3 h-3" /> Vendas Porta a Porta
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      <Shield className="w-3 h-3" /> Ativo
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {(["dashboard", "disc", "pdi", "raiox", "coach"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setVendorTab(tab)}
                    className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${
                      vendorTab === tab
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === "dashboard" ? "Resumo" : 
                     tab === "disc" ? "Teste DISC" :
                     tab === "pdi" ? "PDI" :
                     tab === "raiox" ? "Raio-X (IA)" : "Coach IA"}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6">
              
              {vendorTab === "dashboard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resumo Perfil */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
                    {vendorDisc ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                          <Target className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800">Perfil Dominante</h4>
                        <p className="text-2xl font-black text-indigo-600 mt-1 mb-1">{vendorDisc.perfilAnimal}</p>
                        <p className="text-sm font-bold text-slate-500">({vendorDisc.perfilPrimario} - {vendorDisc.perfilSecundario})</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <Target className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800">Perfil Dominante</h4>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Teste DISC não realizado.</p>
                        <button onClick={() => setVendorTab("disc")} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-bold rounded-lg transition-colors border border-indigo-200">
                          Aplicar Teste
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Resumo PDI */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <FileText className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-black text-slate-800">PDI Ativo</h4>
                    {vendorPdis.length > 0 ? (
                      <>
                        <p className="text-2xl font-black text-emerald-600 mt-1 mb-1">{vendorPdis.length}</p>
                        <p className="text-sm font-bold text-slate-500">Competências em foco</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Nenhuma competência em desenvolvimento no momento.</p>
                        <button onClick={() => setVendorTab("pdi")} className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-bold rounded-lg transition-colors border border-emerald-200">
                          Criar PDI
                        </button>
                      </>
                    )}
                  </div>

                  {/* Resumo Raio-X */}
                  <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-left text-white">
                      <h4 className="text-lg font-black flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-400" />
                        Raio-X do Vendedor
                      </h4>
                      <p className="text-sm text-slate-400 mt-1 max-w-lg">
                        Gere uma análise completa cruzando o perfil comportamental e as habilidades do consultor para obter insights estratégicos de gestão.
                      </p>
                    </div>
                    <button onClick={() => { setVendorTab("raiox"); generateRaioX(); }} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shrink-0">
                      Gerar Nova Análise
                    </button>
                  </div>
                </div>
              )}

              {vendorTab === "disc" && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-500" />
                      Teste DISC & Perfil Animal
                    </h3>
                  </div>
                  
                  {isTakingTest ? (
                    <div className="p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h4 className="font-bold text-slate-800">Bloco {currentBlock + 1} de {DISC_QUESTIONS.length}</h4>
                        <span className="text-sm text-slate-500">Escolha a que MAIS e a que MENOS combina</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {DISC_QUESTIONS[currentBlock].opcoes.map((opcao, idx) => (
                          <div key={idx} className={`flex flex-col p-5 border rounded-2xl gap-4 transition-colors ${
                            testAnswers[currentBlock]?.mais === opcao.fator ? 'border-emerald-500 bg-emerald-50/50' :
                            testAnswers[currentBlock]?.menos === opcao.fator ? 'border-rose-500 bg-rose-50/50' :
                            'border-slate-200 bg-white hover:border-slate-300'
                          }`}>
                            <span className="text-base font-bold text-slate-800 text-center">{opcao.frase}</span>
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                              <button
                                onClick={() => {
                                  const current = testAnswers[currentBlock] || { mais: '', menos: '' };
                                  if (current.menos === opcao.fator) current.menos = '';
                                  setTestAnswers({...testAnswers, [currentBlock]: {...current, mais: opcao.fator}});
                                }}
                                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                  testAnswers[currentBlock]?.mais === opcao.fator
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 border-emerald-600'
                                    : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 border-slate-200'
                                }`}
                              >
                                Mais
                              </button>
                              <button
                                onClick={() => {
                                  const current = testAnswers[currentBlock] || { mais: '', menos: '' };
                                  if (current.mais === opcao.fator) current.mais = '';
                                  setTestAnswers({...testAnswers, [currentBlock]: {...current, menos: opcao.fator}});
                                }}
                                className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                  testAnswers[currentBlock]?.menos === opcao.fator
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 border-rose-600'
                                    : 'bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border-slate-200'
                                }`}
                              >
                                Menos
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-3">
                        <button onClick={() => setIsTakingTest(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
                        {currentBlock < DISC_QUESTIONS.length - 1 ? (
                          <button onClick={() => setCurrentBlock(c => c+1)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl">Próximo</button>
                        ) : (
                          <button onClick={handleTestSubmit} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl">Finalizar Teste</button>
                        )}
                      </div>
                    </div>
                  ) : vendorDisc ? (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="w-full space-y-6 pt-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Dominância</span>
                          <div className="relative w-full bg-slate-100 h-5 rounded-md mt-4">
                            <div className="bg-red-500 h-full rounded-md transition-all duration-1000" style={{ width: `${Math.max(1, vendorDisc.d)}%` }} />
                            <div className="absolute top-[-26px] bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transform -translate-x-1/2 transition-all duration-1000" style={{ left: `${Math.max(1, vendorDisc.d)}%` }}>
                              {vendorDisc.d}%
                              <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Influência</span>
                          <div className="relative w-full bg-slate-100 h-5 rounded-md mt-4">
                            <div className="bg-yellow-400 h-full rounded-md transition-all duration-1000" style={{ width: `${Math.max(1, vendorDisc.i)}%` }} />
                            <div className="absolute top-[-26px] bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transform -translate-x-1/2 transition-all duration-1000" style={{ left: `${Math.max(1, vendorDisc.i)}%` }}>
                              {vendorDisc.i}%
                              <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Estabilidade</span>
                          <div className="relative w-full bg-slate-100 h-5 rounded-md mt-4">
                            <div className="bg-green-500 h-full rounded-md transition-all duration-1000" style={{ width: `${Math.max(1, vendorDisc.s)}%` }} />
                            <div className="absolute top-[-26px] bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transform -translate-x-1/2 transition-all duration-1000" style={{ left: `${Math.max(1, vendorDisc.s)}%` }}>
                              {vendorDisc.s}%
                              <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Conformidade</span>
                          <div className="relative w-full bg-slate-100 h-5 rounded-md mt-4">
                            <div className="bg-blue-600 h-full rounded-md transition-all duration-1000" style={{ width: `${Math.max(1, vendorDisc.c)}%` }} />
                            <div className="absolute top-[-26px] bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transform -translate-x-1/2 transition-all duration-1000" style={{ left: `${Math.max(1, vendorDisc.c)}%` }}>
                              {vendorDisc.c}%
                              <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-800 mb-2">Perfil: {vendorDisc.perfilAnimal}</h4>
                        <p className="text-slate-600 text-sm mb-6">
                          Predominância em {vendorDisc.perfilPrimario} e secundário em {vendorDisc.perfilSecundario}.
                        </p>
                        <button onClick={() => setIsTakingTest(true)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold rounded-xl transition-colors">
                          Refazer Teste
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                      <Activity className="w-12 h-12 text-slate-200 mb-4" />
                      <h4 className="text-lg font-bold text-slate-700">Teste Pendente</h4>
                      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto mb-6">
                        O teste DISC mapeará o perfil dominante para facilitar a comunicação e gestão.
                      </p>
                      <button onClick={() => { setIsTakingTest(true); setCurrentBlock(0); setTestAnswers({}); }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                        Iniciar Teste (Simulação)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {vendorTab === "pdi" && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Plano de Desenvolvimento Individual
                    </h3>
                    <button onClick={() => setIsAddingPdi(!isAddingPdi)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-bold rounded-lg transition-colors">
                      {isAddingPdi ? "Cancelar" : "+ Nova Meta"}
                    </button>
                  </div>
                  
                  {isAddingPdi && (
                    <div className="p-4 bg-emerald-50/50 border-b border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Competência (ex: Fechamento)</label>
                          <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newPdi.competencia || ""} onChange={e => setNewPdi({...newPdi, competencia: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Situação Atual (1-5)</label>
                          <input type="number" min="1" max="5" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newPdi.situacaoAtual || 1} onChange={e => setNewPdi({...newPdi, situacaoAtual: parseInt(e.target.value)})} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Meta Desejada</label>
                          <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newPdi.meta || ""} onChange={e => setNewPdi({...newPdi, meta: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ação Combinada (O que vamos fazer?)</label>
                          <textarea className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newPdi.acaoCombinada || ""} onChange={e => setNewPdi({...newPdi, acaoCombinada: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Prazo</label>
                          <input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={newPdi.prazo || ""} onChange={e => setNewPdi({...newPdi, prazo: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={handleSavePdi} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm">Salvar PDI</button>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-4">
                    {vendorPdis.length === 0 ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-12 h-12 text-slate-200 mb-4" />
                        <h4 className="text-lg font-bold text-slate-700">Sem metas ativas</h4>
                      </div>
                    ) : (
                      vendorPdis.map(pdi => (
                        <div key={pdi.id} className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-slate-800 text-base">{pdi.competencia}</h4>
                              <p className="text-xs font-semibold text-slate-500">Situação atual: Nível {pdi.situacaoAtual}</p>
                            </div>
                            <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md ${
                              pdi.status === 'em_andamento' ? 'bg-amber-100 text-amber-700' :
                              pdi.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {pdi.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">Meta</span>
                              <p className="text-sm text-slate-700 font-medium">{pdi.meta}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">Ação Combinada</span>
                              <p className="text-sm text-slate-700 font-medium">{pdi.acaoCombinada}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1">
                            <Clock className="w-3 h-3" /> Prazo: {new Date(pdi.prazo).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {vendorTab === "raiox" && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Brain className="w-4 h-4 text-rose-500" />
                      Raio-X com IA
                    </h3>
                    <button onClick={generateRaioX} className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold rounded-lg transition-colors">
                      Gerar Agora
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {vendorRaiox.length === 0 ? (
                       <div className="py-8 flex flex-col items-center justify-center text-center">
                         <Brain className="w-16 h-16 text-rose-100 mb-4" />
                         <h4 className="text-lg font-bold text-slate-700">Gerar Relatório Inteligente</h4>
                         <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                           A inteligência artificial irá cruzar o perfil DISC, o PDI atual e as métricas de vendas do colaborador para sugerir pontos fortes e áreas de atenção.
                         </p>
                       </div>
                    ) : (
                      vendorRaiox.map(rx => (
                        <div key={rx.id} className="border border-slate-200 rounded-xl p-5 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-black text-slate-800 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-rose-500" />
                              Análise Gerada
                            </h4>
                            <span className="text-xs font-bold text-slate-400">{new Date(rx.data).toLocaleDateString()}</span>
                          </div>
                          
                          <p className="text-sm text-slate-700 italic mb-6">"{rx.resumoIa}"</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <h5 className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-3">Pontos Fortes</h5>
                              <ul className="space-y-2">
                                {rx.pontosFortes.map((ponto, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{ponto}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-3">Pontos de Atenção</h5>
                              <ul className="space-y-3">
                                {rx.pontosAtencao.map((ponto, i) => (
                                  <li key={i} className="text-sm text-slate-700">
                                    <div className="font-bold flex items-center gap-1.5"><Circle className="w-1.5 h-1.5 fill-amber-500 text-amber-500" /> {ponto.ponto}</div>
                                    <div className="text-slate-500 text-xs ml-3 mt-0.5 pl-2 border-l border-slate-200">{ponto.sugestao}</div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-slate-100">
                            <h5 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">Sugestão PDI</h5>
                            <p className="text-sm text-slate-700">{rx.recomendacoesPdi}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {vendorTab === "coach" && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-sky-500" />
                      Coach IA Contínuo
                    </h3>
                  </div>
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-16 h-16 text-sky-100 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700">Histórico de Coach</h4>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto mb-6">
                      O agente virtual do vendedor. Aqui ficarão salvas as interações, dicas motivacionais baseadas no perfil e alertas de performance disparados via n8n/WhatsApp.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className={`${isAdmin ? "lg:col-span-3" : ""} bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)]`}>
            <Users className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Selecione um Colaborador</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Selecione um membro da equipe comercial na lista ao lado para visualizar e gerenciar seu perfil comportamental, PDI e avaliações.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
