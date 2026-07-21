import React, { useState, useEffect } from 'react';
import Markdown from "react-markdown";
import { Users, User, Shield, Target, Activity, Brain, CheckCircle, Clock, Save, FileText, X, MessageSquare, Plus, Edit2, Play, Circle, Radar, TrendingUp, Printer, LayoutGrid, BarChart2, Heart, GraduationCap, ArrowLeft, ClipboardList } from 'lucide-react';
import { Vendor, DiscResult, PDI, RaioX, CompetenciaAvaliacao, PerfilComercial } from '../types';
import { Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DISC_QUESTIONS } from '../data/discQuestions';

interface GestaoPessoasPageProps {
  vendors: Vendor[];
  loggedUser: string;
  isAdmin: boolean;
}

export default function GestaoPessoasPage({ vendors, loggedUser, isAdmin }: GestaoPessoasPageProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorTab, setVendorTab] = useState<"modulos" | "dashboard" | "disc" | "pdi" | "raiox" | "coach" | "competencias" | "perfil_comercial" | "fit_cargo" | "indices" | "clima" | "pulse" | "aval_360" | "inteligencia_emocional" | "teste_conhecimento" | "big_five">("modulos");

  // Estados dos dados (mockados por enquanto)
  const [discResults, setDiscResults] = useState<DiscResult[]>([]);
  const [pdis, setPdis] = useState<PDI[]>([]);
  const [raioxes, setRaioxes] = useState<RaioX[]>([]);
  const [competencias, setCompetencias] = useState<CompetenciaAvaliacao[]>([]);
  const [perfilComerciais, setPerfilComerciais] = useState<PerfilComercial[]>([]);
  
  // Estado do Teste DISC
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [isGeneratingRaiox, setIsGeneratingRaiox] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, { mais: string, menos: string }>>({});

  // Form PDI
  const [isAddingPdi, setIsAddingPdi] = useState(false);
  const [newPdi, setNewPdi] = useState<Partial<PDI>>({});
  const [isGeneratingDiscAnalysis, setIsGeneratingDiscAnalysis] = useState(false);
  const [discAnalysisResult, setDiscAnalysisResult] = useState<string | null>(null);


  // If not admin, the user can only see their own profile.
  const loggedVendor = vendors.find(v => v.nome === loggedUser);
  const effectiveVendorId = isAdmin ? selectedVendorId : loggedVendor?.id;
  const selectedVendor = isAdmin ? (vendors.find(v => v.id === selectedVendorId) || vendors[0]) : loggedVendor;

    useEffect(() => {
    if (!isAdmin && !selectedVendorId && vendors.length > 0) {
      const myVendor = vendors.find(v => v.nome === loggedUser);
      if (myVendor) {
        setSelectedVendorId(myVendor.id);
      } else {
        setSelectedVendorId(vendors[0].id); // fallback
      }
    }
  }, [isAdmin, vendors, loggedUser, selectedVendorId]);

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
      setCompetencias([{
        id: "c1", vendorId: selectedVendor.id, data: new Date().toISOString(),
        competencias: [
          { nome: "Comunicação", autoavaliacao: 5, gestor: 4, ia: 4, baseline: 4 },
          { nome: "Resiliência", autoavaliacao: 4, gestor: 3, ia: 3, baseline: 4 },
          { nome: "Fechamento", autoavaliacao: 3, gestor: 2, ia: 2, baseline: 4 },
          { nome: "Organização", autoavaliacao: 4, gestor: 4, ia: 5, baseline: 4 },
          { nome: "Prospecção", autoavaliacao: 5, gestor: 5, ia: 4, baseline: 4 },
        ]
      }]);
      setPerfilComerciais([{
        id: "pc1", vendorId: selectedVendor.id, data: new Date().toISOString(),
        gargaloPrincipal: "Conversão na etapa de Quebra de Objeções",
        taxaConversaoMedia: 8.5,
        ticketMedio: 120,
        pontosFortesCampo: ["Abertura carismática", "Conhecimento técnico do plano"],
        areasMelhoriaCampo: ["Contorno de objeção sobre preço", "Urgência de fechamento"]
      }]);
    }
  }, [selectedVendor]);

  const vendorDisc = selectedVendor ? discResults.find(d => d.vendorId === selectedVendor.id) : null;
  const vendorPdis = selectedVendor ? pdis.filter(p => p.vendorId === selectedVendor.id) : [];
  const vendorRaiox = selectedVendor ? raioxes.filter(r => r.vendorId === selectedVendor.id) : [];
  const vendorCompetencias = selectedVendor ? competencias.find(c => c.vendorId === selectedVendor.id) : null;
  const vendorPerfilComercial = selectedVendor ? perfilComerciais.find(pc => pc.vendorId === selectedVendor.id) : null;

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

    setDiscResults([...discResults.filter(d => d.vendorId !== selectedVendor.id), newRes]);
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

  
  const generateDiscAnalysis = async () => {
    setIsGeneratingDiscAnalysis(true);
    try {
      const dataPayload = {
        colaborador: selectedVendor,
        disc: vendorDisc
      };
      
      const response = await fetch("/api/ai/raiox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataPayload })
      });
      
      const json = await response.json();
      if (json.analysis) {
        setDiscAnalysisResult(json.analysis);
      }
    } catch (e) {
      console.error("Erro ao gerar análise do DISC", e);
    } finally {
      setIsGeneratingDiscAnalysis(false);
    }
  };

  const generateRaioX = async () => {
    setIsGeneratingRaiox(true);
    try {
      const dataPayload = {
        colaborador: selectedVendor,
        disc: vendorDisc,
        pdi: vendorPdis,
        competencias: vendorCompetencias,
        perfilComercial: vendorPerfilComercial
      };
      
      const response = await fetch("/api/ai/raiox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataPayload })
      });
      
      const json = await response.json();
      
      if (json.analysis) {
        const newRx: RaioX = {
          id: Math.random().toString(),
          vendorId: selectedVendor.id,
          data: new Date().toISOString(),
          resumoIa: json.analysis,
          pontosFortes: [],
          pontosAtencao: [],
          recomendacoesPdi: ""
        };
        setRaioxes([newRx, ...raioxes]);
      }
    } catch (e) {
      console.error("Erro ao gerar Raio-X", e);
    } finally {
      setIsGeneratingRaiox(false);
    }
  };

  
  const renderDisc = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
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
                              <button 
                                onClick={() => setCurrentBlock(c => c+1)} 
                                disabled={!testAnswers[currentBlock]?.mais || !testAnswers[currentBlock]?.menos}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Próximo
                              </button>
                            ) : (
                              <button 
                                onClick={handleTestSubmit} 
                                disabled={!testAnswers[currentBlock]?.mais || !testAnswers[currentBlock]?.menos}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Finalizar Teste
                              </button>
                            )}
                          </div>
                        </div>
                      ) : vendorDisc ? (<>
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

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
                            <h5 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Radar Comportamental</h5>
                            <div className="w-full h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                  { subject: 'Dominância (D)', value: vendorDisc.d, baseline: 50 },
                                  { subject: 'Influência (I)', value: vendorDisc.i, baseline: 50 },
                                  { subject: 'Estabilidade (S)', value: vendorDisc.s, baseline: 50 },
                                  { subject: 'Conformidade (C)', value: vendorDisc.c, baseline: 50 },
                                ]}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                                  <RechartsRadar name="Baseline (Ideal)" dataKey="baseline" stroke="#94a3b8" fill="none" strokeDasharray="3 3" />
                                  <RechartsRadar name="Perfil" dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          
                          <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                                <Brain className="w-4 h-4 text-indigo-500" />
                                Análise do Agente IA
                              </h5>
                              <button
                                onClick={generateDiscAnalysis}
                                disabled={isGeneratingDiscAnalysis}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors print:hidden"
                              >
                                {isGeneratingDiscAnalysis ? "Analisando..." : "Gerar/Atualizar Parecer"}
                              </button>
                            </div>
                            
                            {discAnalysisResult ? (
                              <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-h2:text-indigo-900 prose-h2:text-sm prose-h2:mt-4 prose-h2:mb-2 prose-h2:uppercase prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900">
                                <Markdown>{discAnalysisResult}</Markdown>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-400">
                                <Brain className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">Clique em Gerar Parecer para a IA analisar este perfil.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>) : (
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
  );

  const renderPdi = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
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
  );

  const renderCompetencias = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          Radar de Competências
                        </h3>
                      </div>
                      
                      {vendorCompetencias ? (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                          <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={vendorCompetencias.competencias}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="nome" tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                                <RechartsRadar name="Baseline (Ideal)" dataKey="baseline" stroke="#94a3b8" fill="none" strokeDasharray="3 3" />
                                <RechartsRadar name="Autoavaliação" dataKey="autoavaliacao" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <RechartsRadar name="Gestor" dataKey="gestor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                <RechartsRadar name="IA" dataKey="ia" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full border-2 border-slate-400 border-dashed"></div>
                              <span className="text-sm font-bold text-slate-700">Baseline (Meta/Ideal)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm font-bold text-slate-700">Autoavaliação (Visão do Vendedor)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <span className="text-sm font-bold text-slate-700">Avaliação do Gestor</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              <span className="text-sm font-bold text-slate-700">Predição da IA (via conversas Coach)</span>
                            </div>
                            
                            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100">
                              <h4 className="text-sm font-bold text-orange-800 mb-2">Análise de Gap</h4>
                              <p className="text-sm text-orange-700">
                                A autoavaliação em <strong>Fechamento</strong> é maior que a percepção do Gestor e da IA. Recomenda-se alinhar expectativas e aplicar Role-play para calibrar a visão de performance em campo.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                          <Activity className="w-12 h-12 text-slate-200 mb-4" />
                          <h4 className="text-lg font-bold text-slate-700">Sem avaliação cadastrada</h4>
                        </div>
                      )}
                    </div>
  );

  const renderPerfilComercial = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          Perfil Comercial & Gargalos de Campo
                        </h3>
                      </div>
                      
                      {vendorPerfilComercial ? (
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Gargalo Principal em Campo</span>
                              <span className="text-xl font-black text-blue-900">{vendorPerfilComercial.gargaloPrincipal}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Conversão Média</span>
                                  <span className="text-2xl font-black text-slate-800">{vendorPerfilComercial.taxaConversaoMedia}%</span>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ticket Médio</span>
                                  <span className="text-2xl font-black text-slate-800">R$ {vendorPerfilComercial.ticketMedio}</span>
                               </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="flex items-center gap-2 font-bold text-emerald-700 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                Pontos Fortes (Atendimento)
                              </h4>
                              <ul className="space-y-3">
                                {vendorPerfilComercial.pontosFortesCampo.map((p, i) => (
                                   <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                     {p}
                                   </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="flex items-center gap-2 font-bold text-rose-700 mb-4">
                                <Activity className="w-5 h-5" />
                                Áreas de Melhoria (Atendimento)
                              </h4>
                              <ul className="space-y-3">
                                {vendorPerfilComercial.areasMelhoriaCampo.map((p, i) => (
                                   <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                     <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                     {p}
                                   </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                          <TrendingUp className="w-12 h-12 text-slate-200 mb-4" />
                          <h4 className="text-lg font-bold text-slate-700">Sem dados comerciais</h4>
                        </div>
                      )}
                    </div>
  );

  const renderRaiox = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Brain className="w-4 h-4 text-rose-500" />
                          Raio-X com IA
                        </h3>
                        <button onClick={generateRaioX} disabled={isGeneratingRaiox} className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors print:hidden">
                          {isGeneratingRaiox ? "Gerando..." : "Gerar Agora"}
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
                              
                              <div className="prose prose-sm prose-slate max-w-none prose-headings:font-black prose-h2:text-indigo-900 prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-ul:my-2">
                              <Markdown>{rx.resumoIa}</Markdown>
                            </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
  );

  const renderPlaceholder = (title: string, desc: string) => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          {title}
        </h3>
      </div>
      <div className="p-12 flex flex-col items-center justify-center text-center">
        <Activity className="w-12 h-12 text-slate-200 mb-4" />
        <h4 className="text-lg font-bold text-slate-700">Módulo em Desenvolvimento</h4>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          {desc}
        </p>
      </div>
    </div>
  );

  const renderFitCargo = () => renderPlaceholder("Fit de Cargo", "Módulo de alocação automática calculando a distância entre o perfil natural do colaborador e o perfil ideal.");
  const renderIndices = () => renderPlaceholder("Índices Preditivos (Risco/Potencial)", "Predição de desligamento e alto potencial baseado no cruzamento de dados de engajamento, PDI e testes.");
  const renderClima = () => renderPlaceholder("Clima Organizacional", "Módulo semanal/mensal para medir o clima geral e engajamento da equipe.");
  const renderPulse = () => renderPlaceholder("Pulse Survey", "Pesquisas rápidas de engajamento focadas em micro-interações semanais.");
  const renderAval360 = () => renderPlaceholder("Avaliação 360°", "Avaliação anual de liderança cruzando autoavaliação, pares, liderados e gestores.");
  const renderInteligenciaEmocional = () => renderPlaceholder("Inteligência Emocional", "Teste anual de inteligência emocional para mapear o comportamento interpessoal.");
  const renderTesteConhecimento = () => renderPlaceholder("Teste de Conhecimento", "Teste pós-treinamento focado em capacitação técnica.");
  const renderBigFive = () => renderPlaceholder("Big Five (OCEAN)", "Avaliação anual de personalidade Big Five, aplicada a líderes para alinhar perfil de gestão.");


  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 print:p-0 print:m-0 print:max-w-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
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

      <div className="space-y-6">
        
        {/* Dashboard do Colaborador Selecionado */}
        {selectedVendor ? (
          <div className="flex flex-col h-[calc(100vh-200px)] print:h-auto print:block">
            {/* Header do Colaborador */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:shadow-none print:border-slate-300 print:mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex flex-col">
                  {isAdmin ? (
                    <div className="relative inline-flex items-center print:hidden">
                      <select
                        className="appearance-none bg-transparent font-black text-lg text-slate-800 pr-8 py-0 focus:outline-none cursor-pointer border-none p-0 hover:text-indigo-600 transition-colors"
                        value={selectedVendorId || ""}
                        onChange={(e) => {
                          setSelectedVendorId(e.target.value);
                          setVendorTab("modulos");
                        }}
                      >
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.nome}</option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 text-slate-400 absolute right-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  ) : (
                    <h3 className="text-lg font-black text-slate-800">{selectedVendor.nome}</h3>
                  )}
                  <h3 className="text-lg font-black text-slate-800 hidden print:block">{selectedVendor.nome}</h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <User className="w-3 h-3" /> PAP
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Shield className="w-3 h-3" /> Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 print:overflow-visible print:pr-0">

              {vendorTab === "modulos" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between print:hidden">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Catálogo de Módulos</h3>
                      <p className="text-sm text-slate-500">Selecione um módulo para visualizar ou aplicar avaliações.</p>
                    </div>
                    <button onClick={() => setVendorTab("dashboard")} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors">
                      <Printer className="w-4 h-4" /> Resumo Geral (Impressão)
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: "disc", nome: "DISC & Perfil Animal", icon: Target, desc: "Avaliação comportamental semestral", color: "text-indigo-600", bg: "bg-indigo-50" },
                      { id: "pdi", nome: "PDI", icon: FileText, desc: "Plano de desenvolvimento contínuo", color: "text-emerald-600", bg: "bg-emerald-50" },
                      { id: "competencias", nome: "Competências", icon: Target, desc: "Avaliação trimestral", color: "text-orange-500", bg: "bg-orange-50" },
                      { id: "perfil_comercial", nome: "Perfil Comercial", icon: TrendingUp, desc: "Análise de campo semestral", color: "text-blue-500", bg: "bg-blue-50" },
                      { id: "raiox", nome: "Raio-X (IA)", icon: Brain, desc: "Análise preditiva sob demanda", color: "text-rose-500", bg: "bg-rose-50" },
                      { id: "coach", nome: "Coach IA", icon: MessageSquare, desc: "Suporte e gestão diária", color: "text-sky-500", bg: "bg-sky-50" },
                      { id: "fit_cargo", nome: "Fit de Cargo", icon: User, desc: "Alocação automática", color: "text-teal-500", bg: "bg-teal-50" },
                      { id: "indices", nome: "Índices (Risco/Potencial)", icon: Activity, desc: "Predição mensal automática", color: "text-red-500", bg: "bg-red-50" },
                      { id: "clima", nome: "Clima Organizacional", icon: Heart, desc: "Engajamento semanal/mensal", color: "text-pink-500", bg: "bg-pink-50" },
                      { id: "pulse", nome: "Pulse Survey", icon: BarChart2, desc: "Engajamento semanal", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
                      { id: "aval_360", nome: "Avaliação 360°", icon: Users, desc: "Avaliação de liderança anual", color: "text-purple-500", bg: "bg-purple-50" },
                      { id: "inteligencia_emocional", nome: "Inteligência Emocional", icon: Brain, desc: "Comportamento anual", color: "text-violet-500", bg: "bg-violet-50" },
                      { id: "teste_conhecimento", nome: "Teste de Conhecimento", icon: GraduationCap, desc: "Capacitação pós-treinamento", color: "text-cyan-500", bg: "bg-cyan-50" },
                      { id: "big_five", nome: "Big Five (OCEAN)", icon: ClipboardList, desc: "Comportamento anual (Líderes)", color: "text-amber-500", bg: "bg-amber-50" }
                    ].map(mod => (
                      <button 
                        key={mod.id} 
                        onClick={() => setVendorTab(mod.id as any)}
                        className="flex flex-col items-start p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${mod.bg}`}>
                          <mod.icon className={`w-5 h-5 ${mod.color}`} />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{mod.nome}</h4>
                        <p className="text-xs text-slate-500">{mod.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              
              {vendorTab === "dashboard" && (
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center print:hidden mb-6">
                    <h3 className="text-xl font-black text-slate-800">Resumo Geral (Completo)</h3>
                    <button onClick={() => window.print()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors">
                      <Printer className="w-4 h-4" /> Imprimir
                    </button>
                  </div>

                  {renderDisc()}
                  {renderPdi()}
                  {renderCompetencias()}
                  {renderPerfilComercial()}
                  {renderFitCargo()}
                  {renderIndices()}
                  {renderClima()}
                  {renderPulse()}
                  {renderAval360()}
                  {renderInteligenciaEmocional()}
                  {renderTesteConhecimento()}
                  {renderBigFive()}
                  {renderRaiox()}
                </div>
              )}

              {vendorTab === "disc" && renderDisc()}

              {vendorTab === "pdi" && renderPdi()}

              {vendorTab === "competencias" && renderCompetencias()}

              {vendorTab === "perfil_comercial" && renderPerfilComercial()}

              {vendorTab === "fit_cargo" && renderFitCargo()}
              {vendorTab === "indices" && renderIndices()}
              {vendorTab === "clima" && renderClima()}
              {vendorTab === "pulse" && renderPulse()}
              {vendorTab === "aval_360" && renderAval360()}
              {vendorTab === "inteligencia_emocional" && renderInteligenciaEmocional()}
              {vendorTab === "teste_conhecimento" && renderTesteConhecimento()}
              {vendorTab === "big_five" && renderBigFive()}
              {vendorTab === "raiox" && renderRaiox()}

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
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] print:h-auto">
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
