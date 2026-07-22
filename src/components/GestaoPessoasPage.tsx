import React, { useState, useEffect } from 'react';
import Markdown from "react-markdown";
import { Users, AlertCircle, User, Bot, Shield, Target, Activity, Brain, CheckCircle, Clock, Save, FileText, X, MessageSquare, Plus, Edit2, Play, Circle, Radar, TrendingUp, Printer, LayoutGrid, BarChart2, Heart, GraduationCap, ArrowLeft, ClipboardList } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc } from 'firebase/firestore';
import { Vendor, DiscResult, PDI, RaioX, CompetenciaAvaliacao, PerfilComercial } from '../types';
import { Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DISC_QUESTIONS } from '../data/discQuestions';
import CompetenciasQuestionnaire from './CompetenciasQuestionnaire';
import PerfilComercialForm from './PerfilComercialForm';
import RolePlayIA from './RolePlayIA';


interface GestaoPessoasPageProps {
  vendors: Vendor[];
  loggedUser: string;
  isAdmin: boolean;
}

export default function GestaoPessoasPage({ vendors, loggedUser, isAdmin }: GestaoPessoasPageProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorTab, setVendorTab] = useState<"modulos" | "dashboard" | "disc" | "pdi" | "raiox" | "coach" | "competencias" | "perfil_comercial" | "fit_cargo" | "indices" | "clima" | "pulse" | "aval_360" | "inteligencia_emocional" | "teste_conhecimento" | "big_five" | "roleplay">("modulos");

  // Estados dos dados (mockados por enquanto)
  const [discResults, setDiscResults] = useState<DiscResult[]>([]);
  const [pdis, setPdis] = useState<PDI[]>([]);
  const [raioxes, setRaioxes] = useState<RaioX[]>([]);
  const [competencias, setCompetencias] = useState<CompetenciaAvaliacao[]>([]);
  const [perfilComerciais, setPerfilComerciais] = useState<PerfilComercial[]>([]);

  useEffect(() => {
    const unsubDisc = onSnapshot(collection(db, 'disc_results'), (snapshot) => {
      setDiscResults(snapshot.docs.map(doc => doc.data() as DiscResult));
    });
    const unsubPdi = onSnapshot(collection(db, 'pdis'), (snapshot) => {
      setPdis(snapshot.docs.map(doc => doc.data() as PDI));
    });
    const unsubRaiox = onSnapshot(collection(db, 'raioxes'), (snapshot) => {
      setRaioxes(snapshot.docs.map(doc => doc.data() as RaioX));
    });
    const unsubComp = onSnapshot(collection(db, 'competencias'), (snapshot) => {
      setCompetencias(snapshot.docs.map(doc => doc.data() as CompetenciaAvaliacao));
    });
    const unsubPerfil = onSnapshot(collection(db, 'perfil_comerciais'), (snapshot) => {
      setPerfilComerciais(snapshot.docs.map(doc => doc.data() as PerfilComercial));
    });

    return () => {
      unsubDisc();
      unsubPdi();
      unsubRaiox();
      unsubComp();
      unsubPerfil();
    };
  }, []);
  
  // Estado do Teste DISC
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [isTakingCompetenciasTest, setIsTakingCompetenciasTest] = useState(false);
  const [isEditingPerfilComercial, setIsEditingPerfilComercial] = useState(false);
  const [isGeneratingRaiox, setIsGeneratingRaiox] = useState(false);
  const [isSavingSync, setIsSavingSync] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const showSyncSuccess = (msg: string) => {
    setSyncSuccessMsg(msg);
    setTimeout(() => setSyncSuccessMsg(null), 3000);
  };

  const [currentBlock, setCurrentBlock] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, { mais: string, menos: string }>>({});

  // Form PDI
  const [isAddingPdi, setIsAddingPdi] = useState(false);
  const [newPdi, setNewPdi] = useState<Partial<PDI>>({});
  const [isGeneratingDiscAnalysis, setIsGeneratingDiscAnalysis] = useState(false);
  const [discAnalysisResult, setDiscAnalysisResult] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


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
    if (vendors.length > 0 && discResults.length === 0) {
      setDiscResults(vendors.map((v, i) => ({
        id: `disc_${i}`, vendorId: v.id, data: new Date().toISOString(),
        d: 20 + (i * 5) % 80, i: 30 + (i * 7) % 70, s: 15 + (i * 3) % 85, c: 25 + (i * 11) % 75, perfilPrimario: "I", perfilSecundario: "D", perfilAnimal: "Águia"
      })));
      setPdis(vendors.map((v, i) => ({
        id: `pdi_${i}`, vendorId: v.id, competencia: "Fechamento de Vendas",
        situacaoAtual: 3, meta: "Chegar na taxa de conversão de 15%", acaoCombinada: "Role-play 1x por semana com o coordenador",
        prazo: "2024-12-31", status: "em_andamento", dataCriacao: new Date().toISOString(), dataAtualizacao: new Date().toISOString()
      })));
      setCompetencias([]);
      setPerfilComerciais(vendors.map((v, i) => ({
        id: `pc_${i}`, vendorId: v.id, data: new Date().toISOString(),
        gargaloPrincipal: "Conversão na etapa de Quebra de Objeções",
        taxaConversaoMedia: 8.5,
        ticketMedio: 120,
        pontosFortesCampo: ["Abertura carismática", "Conhecimento técnico do plano"],
        areasMelhoriaCampo: ["Contorno de objeção sobre preço", "Urgência de fechamento"]
      })));
    }
  }, [vendors]);

  const vendorDisc = selectedVendor ? discResults.find(d => d.vendorId === selectedVendor.id) : null;
  const vendorPdis = selectedVendor ? pdis.filter(p => p.vendorId === selectedVendor.id) : [];
  const vendorRaiox = selectedVendor ? raioxes.filter(r => r.vendorId === selectedVendor.id) : [];
  const vendorCompetencias = selectedVendor ? competencias.find(c => c.vendorId === selectedVendor.id) : null;
  const vendorPerfilComercial = selectedVendor ? perfilComerciais.find(pc => pc.vendorId === selectedVendor.id) : null;


  const handlePerfilComercialComplete = async (data: Omit<PerfilComercial, 'id' | 'vendorId' | 'data'>) => {
    if (!selectedVendor) return;
    
    const newRecord: PerfilComercial = {
      id: `pc_${Date.now()}`,
      vendorId: selectedVendor.id,
      data: new Date().toISOString(),
      ...data
    };

    const existingIndex = perfilComerciais.findIndex(pc => pc.vendorId === selectedVendor.id);
    if (existingIndex >= 0) {
      const updated = [...perfilComerciais];
      updated[existingIndex] = newRecord;
      setIsSavingSync(true);
      await Promise.all(updated.map(pc => setDoc(doc(db, 'perfil_comerciais', pc.id), pc)));
      await addDoc(collection(db, 'test_results'), {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.nome,
        type: 'perfil_comercial',
        date: new Date().toISOString(),
        summary: 'Perfil Comercial atualizado',
        details: updated
      });
      setIsSavingSync(false);
      showSyncSuccess('Perfil Comercial salvo com sucesso!');
    } else {
      setIsSavingSync(true);
      await setDoc(doc(db, 'perfil_comerciais', newRecord.id), newRecord);
      await addDoc(collection(db, 'test_results'), {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.nome,
        type: 'perfil_comercial',
        date: new Date().toISOString(),
        summary: 'Novo Perfil Comercial',
        details: newRecord
      });
      setIsSavingSync(false);
      showSyncSuccess('Perfil Comercial salvo com sucesso!');
    }
    setIsEditingPerfilComercial(false);
  };

  const handleCompetenciasComplete = async (resultados: Record<string, number>) => {
    if (!selectedVendor) return;
    
    // Transform the results into the expected shape
    const newCompetencias = Object.entries(resultados).map(([nome, val]) => ({
      nome,
      autoavaliacao: val,
      gestor: 0,
      ia: 0,
      baseline: 4
    }));

    const existingIndex = competencias.findIndex(c => c.vendorId === selectedVendor.id);
    if (existingIndex >= 0) {
      const updated = [...competencias];
      updated[existingIndex] = {
        ...updated[existingIndex],
        competencias: newCompetencias
      };
      setIsSavingSync(true);
      await Promise.all(updated.map(c => setDoc(doc(db, 'competencias', c.id), c)));
      await addDoc(collection(db, 'test_results'), {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.nome,
        type: 'competencias',
        date: new Date().toISOString(),
        summary: 'Avaliação de Competências atualizada',
        details: updated
      });
      setIsSavingSync(false);
      showSyncSuccess('Competências salvas com sucesso!');
    } else {
      
    const newComp: CompetenciaAvaliacao = {
  
        id: `comp_${Date.now()}`,
        vendorId: selectedVendor.id,
        data: new Date().toISOString(),
        competencias: newCompetencias
      };
    setIsSavingSync(true);
    await setDoc(doc(db, 'competencias', newComp.id), newComp);
    await addDoc(collection(db, 'test_results'), {
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.nome,
      type: 'competencias',
      date: new Date().toISOString(),
      summary: 'Nova Avaliação de Competências',
      details: newComp
    });
    setIsSavingSync(false);
    showSyncSuccess('Competências salvas com sucesso!');
    }
    
    setIsTakingCompetenciasTest(false);
  };

  const handleTestSubmit = async () => {
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

    setIsSavingSync(true);
    await setDoc(doc(db, 'disc_results', newRes.id), newRes);
    await addDoc(collection(db, 'test_results'), {
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.nome,
      type: 'disc',
      date: new Date().toISOString(),
      summary: `Perfil: ${newRes.perfilAnimal}`,
      details: newRes
    });
    setIsSavingSync(false);
    showSyncSuccess('Teste DISC salvo com sucesso!');
    setIsTakingTest(false);
  };

  const handleSavePdi = async () => {
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
        setIsSavingSync(true);
        await setDoc(doc(db, 'raioxes', newRx.id), newRx);
        await addDoc(collection(db, 'test_results'), {
          vendorId: selectedVendor.id,
          vendorName: selectedVendor.nome,
          type: 'raiox',
          date: new Date().toISOString(),
          summary: 'Análise de Raio-X com IA concluída',
          details: newRx
        });
        setIsSavingSync(false);
        showSyncSuccess('Raio-X salvo com sucesso!');
      }
    } catch (e) {
      console.error("Erro ao gerar Raio-X", e);
    } finally {
      setIsGeneratingRaiox(false);
    }
  };

  const handlePrintReport = () => {
    if (window.self !== window.top) {
      alert("Para imprimir ou salvar em PDF, abra o sistema em uma nova guia clicando no ícone de 'Nova Guia' (canto superior direito do painel de preview).");
    } else {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const renderRolePlay = () => {
    if (!selectedVendor) return null;
    return <RolePlayIA vendorId={selectedVendor.id} vendorName={selectedVendor.nome} />;
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
                        <div className="p-6 border-b border-slate-100 flex flex-col gap-8">
                          {/* PERFIL E AÇÕES */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-2xl font-black text-slate-800 mb-1">Perfil: {vendorDisc.perfilAnimal}</h4>
                              <p className="text-slate-600 text-sm">
                                Predominância em {vendorDisc.perfilPrimario} e secundário em {vendorDisc.perfilSecundario}.
                              </p>
                            </div>
                            <button onClick={() => setIsTakingTest(true)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-bold rounded-xl transition-colors">
                              Refazer Teste
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
                                  <div className="bg-emerald-500 h-full rounded-md transition-all duration-1000" style={{ width: `${Math.max(1, vendorDisc.s)}%` }} />
                                  <div className="absolute top-[-26px] bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transform -translate-x-1/2 transition-all duration-1000" style={{ left: `${Math.max(1, vendorDisc.s)}%` }}>
                                    {vendorDisc.s}%
                                    <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800" />
                                  </div>
                                </div>
                              </div>
    
                              <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Conformidade</span>
                                <div className="relative w-full bg-slate-100 h-5 rounded-md mt-4">
                                  <div className="bg-blue-500 h-full rounded-md transition-all duration-1000" style={{ width: `${Math.max(1, vendorDisc.c)}%` }} />
                                  <div className="absolute top-[-26px] bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transform -translate-x-1/2 transition-all duration-1000" style={{ left: `${Math.max(1, vendorDisc.c)}%` }}>
                                    {vendorDisc.c}%
                                    <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* RADAR COMPORTAMENTAL */}
                            <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
                              <h5 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Radar Comportamental</h5>
                              <div className="w-full h-64">
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
                          </div>
                        </div>

                        {/* QUADRANTE INFERIOR: IA */}
                        <div className="p-6 bg-slate-50 flex flex-col gap-6">
                          <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden">
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


  const renderCompetencias = () => {
    if (isTakingCompetenciasTest && selectedVendor) {
      return (
        <CompetenciasQuestionnaire
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.nome}
          onComplete={handleCompetenciasComplete}
          onCancel={() => setIsTakingCompetenciasTest(false)}
        />
      );
    }

    return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-500" />
                          Radar de Competências
                        </h3>
                        {selectedVendor?.id === effectiveVendorId && (
                          <button 
                            onClick={() => setIsTakingCompetenciasTest(true)}
                            className="px-3 py-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" /> {vendorCompetencias ? "Refazer Autoavaliação" : "Iniciar Autoavaliação"}
                          </button>
                        )}
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
  };

  const renderPerfilComercial = () => {
    if (isEditingPerfilComercial && selectedVendor) {
      return (
        <PerfilComercialForm
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.nome}
          existingData={vendorPerfilComercial || undefined}
          onComplete={handlePerfilComercialComplete}
          onCancel={() => setIsEditingPerfilComercial(false)}
        />
      );
    }
    
    return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          Perfil Comercial & Gargalos de Campo
                        </h3>
                        <button 
                          onClick={() => setIsEditingPerfilComercial(true)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> {vendorPerfilComercial ? "Atualizar Perfil" : "Preencher Perfil"}
                        </button>
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
  };

  
  const renderRaiox = () => {
    let fitCargo = 75;
    if (vendorDisc) {
      const ideal = { d: 70, i: 80, s: 40, c: 30 };
      const natural = vendorDisc.rawNatural || { d: 50, i: 50, s: 50, c: 50 };
      const diffTotal = Math.abs(natural.d - ideal.d) + Math.abs(natural.i - ideal.i) + Math.abs(natural.s - ideal.s) + Math.abs(natural.c - ideal.c);
      fitCargo = Math.max(0, Math.round(100 - ((diffTotal / 400) * 100 * 2)));
    }

    let scoreCompetencias = 80;
    if (vendorCompetencias && vendorCompetencias.competencias) {
      const autoArr = vendorCompetencias.competencias.map((c: any) => c.autoavaliacao);
      if (autoArr.length) scoreCompetencias = Math.round((autoArr.reduce((a: number, b: number)=>a+b,0)/autoArr.length) * 20);
    }

    let scoreComercial = 82;
    if (vendorPerfilComercial) {
       scoreComercial = Math.round(vendorPerfilComercial.taxaConversaoMedia * 5); 
       if (scoreComercial > 100) scoreComercial = 100;
    }

    const scoreAval360 = 85; 
    const scoreConhecimento = 78;

    const w1 = 0.15, w2 = 0.25, w3 = 0.25, w4 = 0.20, w5 = 0.15;
    const scoreFinal = Math.round((fitCargo * w1) + (scoreCompetencias * w2) + (scoreComercial * w3) + (scoreAval360 * w4) + (scoreConhecimento * w5));

    const values = [fitCargo, scoreCompetencias, scoreComercial, scoreAval360, scoreConhecimento];
    const avg = values.reduce((a,b) => a+b, 0) / values.length;
    const variance = values.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const confiabilidade = Math.max(0, Math.round(100 - (stdDev * 2.5)));

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-rose-500" />
            Raio-X Consolidado & People Analytics
          </h3>
          <button onClick={generateRaioX} disabled={isGeneratingRaiox} className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors print:hidden">
            {isGeneratingRaiox ? "Gerando Resumo..." : "Recalcular com IA"}
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Header Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24" />
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Score Final Ponderado</span>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-5xl font-black text-emerald-400">{scoreFinal}</span>
                <span className="text-lg text-slate-500 font-bold mb-1">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 relative z-10">Agrega DISC, Competências, Comercial, 360 e Conhecimento.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Índice de Confiabilidade</span>
                <Activity className={`w-5 h-5 ${confiabilidade > 80 ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-800">{confiabilidade}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full ${confiabilidade > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${confiabilidade}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Calculado pelo desvio padrão ({stdDev.toFixed(1)}) entre as múltiplas avaliações.</p>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-rose-800 uppercase tracking-wider">Maior GAP Mapeado</span>
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-xl font-black text-rose-900 leading-tight">
                {vendorPerfilComercial && vendorPerfilComercial.areasMelhoriaCampo.length > 0 ? vendorPerfilComercial.areasMelhoriaCampo[0] : "Técnicas de Fechamento"}
              </span>
              <p className="text-xs text-rose-700 mt-2">Impacto Direto: Perda de 15% na conversão final de rota.</p>
            </div>
          </div>

          {/* Breakdown / Radar Equivalente */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" /> Detalhamento Multimétodo
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{fitCargo}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Fit Cargo (15%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreCompetencias}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Competências (25%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreComercial}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Comercial (25%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreAval360}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Aval 360° (20%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreConhecimento}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Conhecimento (15%)</span>
              </div>
            </div>
          </div>

          {/* Texto de IA gerado (O Raio-X original) */}
          {vendorRaiox.length > 0 ? (
            <div>
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-rose-500" /> Análise Qualitativa da IA
              </h4>
              {vendorRaiox.map(rx => (
                <div key={rx.id} className="border border-slate-200 rounded-xl p-5 relative overflow-hidden bg-white shadow-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <div className="prose prose-sm prose-slate max-w-none prose-headings:font-black prose-h2:text-indigo-900 prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-ul:my-2">
                    <Markdown>{rx.resumoIa}</Markdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
               <p className="text-sm text-slate-600">Gere a análise da IA para obter insights qualitativos detalhados sobre o colaborador.</p>
            </div>
          )}

          {/* PDI Automático */}
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
             <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Plano de Desenvolvimento Recomendado (Automático)
             </h4>
             <ul className="space-y-3">
               <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                 <div>
                   <span className="block text-sm font-bold text-emerald-900">Treinamento de Role-Play Focado</span>
                   <span className="block text-xs text-emerald-700 mt-1">Utilizar o simulador IA (Persona: Indeciso) 3x na semana para calibrar a conversão na fase de objeções.</span>
                 </div>
               </li>
               <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                 <div>
                   <span className="block text-sm font-bold text-emerald-900">Reciclagem de Conhecimento Técnico</span>
                   <span className="block text-xs text-emerald-700 mt-1">Revisão do portfólio de planos empresariais e uso avançado do CRM Mobile.</span>
                 </div>
               </li>
               <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                 <div>
                   <span className="block text-sm font-bold text-emerald-900">Acompanhamento de Campo (Rota Dupla)</span>
                   <span className="block text-xs text-emerald-700 mt-1">O supervisor deve focar no controle emocional do vendedor diante de negativas consecutivas.</span>
                 </div>
               </li>
             </ul>
          </div>
        </div>
      </div>
    );
  };


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

  const renderFitCargo = () => {
    if (!vendorDisc) return renderPlaceholder("Fit de Cargo", "Realize o Teste DISC para visualizar o Fit de Cargo.");
    
    // Simulação do Perfil Ideal (PAP - Vendedor Externo)
    const ideal = { d: 70, i: 80, s: 40, c: 30 };
    
    // Perfil Natural do colaborador
    const natural = vendorDisc.rawNatural || { d: 50, i: 50, s: 50, c: 50 };
    
    const diffD = Math.abs(natural.d - ideal.d);
    const diffI = Math.abs(natural.i - ideal.i);
    const diffS = Math.abs(natural.s - ideal.s);
    const diffC = Math.abs(natural.c - ideal.c);
    
    const totalDiff = diffD + diffI + diffS + diffC;
    const maxDiff = 400; // max possible difference
    
    const fitPercentage = Math.max(0, Math.round(100 - ((totalDiff / maxDiff) * 100 * 2)));

    return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          Fit de Cargo (PAP)
        </h3>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 border border-emerald-100 rounded-full w-48 h-48">
            <span className="text-4xl font-black text-emerald-700">{fitPercentage}%</span>
            <span className="text-xs font-bold text-emerald-600 uppercase mt-1">Aderência Ideal</span>
          </div>
          <div className="flex-1 space-y-4">
            <h4 className="font-bold text-slate-800">Análise de Distância Comportamental</h4>
            <p className="text-sm text-slate-600">
              Com base no perfil DISC natural do colaborador em relação à função exigida de <strong>Porta a Porta (PAP)</strong>, que demanda alta influência (I) e alta dominância (D).
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="block text-xs font-bold text-slate-500 uppercase">Perfil Natural</span>
                <span className="block font-bold text-slate-800 mt-1">
                  D: {natural.d}% | I: {natural.i}% | S: {natural.s}% | C: {natural.c}%
                </span>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                <span className="block text-xs font-bold text-indigo-500 uppercase">Perfil Ideal (PAP)</span>
                <span className="block font-bold text-indigo-800 mt-1">
                  D: {ideal.d}% | I: {ideal.i}% | S: {ideal.s}% | C: {ideal.c}%
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-slate-100 rounded-xl">
               <h4 className="text-sm font-bold text-slate-800 mb-2">Recomendação</h4>
               <p className="text-sm text-slate-600">
                 {fitPercentage > 80 
                    ? "Excelente aderência ao cargo. Colaborador possui as características ideais para atuar com alta performance em campo."
                    : fitPercentage > 60
                    ? "Aderência moderada. O colaborador pode precisar de apoio específico e PDI para compensar certas características naturais em campo."
                    : "Baixa aderência. O esforço comportamental exigido em campo pode gerar desgaste rápido. Recomenda-se alinhamento de expectativas ou considerar realocação para Inside Sales."}
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };
  
  const renderIndices = () => {
    // Fake prediction data
    const turnoverRisk = 15; // 15%
    const highPotential = 85; // 85%
    
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            Índices Preditivos (Risco & Potencial)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turnover Risk */}
            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex flex-col items-center text-center">
              <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-2">Risco de Turnover</h4>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-rose-200"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500"
                    strokeDasharray={`${turnoverRisk}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-rose-700">{turnoverRisk}%</span>
                </div>
              </div>
              <p className="text-xs text-rose-600 mt-4 font-medium">Baixo risco de saída nos próximos 6 meses.</p>
            </div>

            {/* High Potential */}
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
              <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2">Potencial de Liderança</h4>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-emerald-200"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${highPotential}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-emerald-700">{highPotential}%</span>
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-4 font-medium">Alto potencial para assumir supervisão.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

    const renderClima = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Clima Organizacional
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <span className="text-4xl font-black text-slate-800 mb-2">82 / 100</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">eNPS (Net Promoter Score Interno)</span>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800">Dimensões do Clima</h4>
            
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Comunicação</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Reconhecimento</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Relacionamento com Gestor</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Ferramentas de Trabalho</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderPulse = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Pulse Survey (Termômetro de Engajamento)
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6 w-full">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700">Satisfação com o Clima</span>
                  <span className="text-sm font-bold text-slate-900">8.5/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700">Alinhamento com a Liderança</span>
                  <span className="text-sm font-bold text-slate-900">7.2/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700">Carga de Trabalho</span>
                  <span className="text-sm font-bold text-slate-900">6.0/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 bg-rose-50 p-5 rounded-xl border border-rose-100">
               <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Alerta de Carga
               </h4>
               <p className="text-sm text-rose-700">
                 O indicador de <strong>Carga de Trabalho</strong> caiu 15% nas últimas 2 semanas. Sugere-se uma conversa 1:1 para priorização de demandas de campo.
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  const renderAval360 = () => {
    const data = [
      { name: "Comunicação", auto: 4.5, pares: 4.2, liderados: 4.8, gestor: 4.0 },
      { name: "Liderança", auto: 4.0, pares: 3.8, liderados: 4.5, gestor: 3.5 },
      { name: "Foco em Resultados", auto: 5.0, pares: 4.5, liderados: 4.2, gestor: 4.8 },
      { name: "Trabalho em Equipe", auto: 4.2, pares: 4.6, liderados: 4.4, gestor: 4.5 },
      { name: "Inteligência Emocional", auto: 3.8, pares: 3.5, liderados: 4.0, gestor: 3.2 },
    ];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Avaliação 360°
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                <RechartsRadar name="Autoavaliação" dataKey="auto" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <RechartsRadar name="Pares" dataKey="pares" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <RechartsRadar name="Gestor" dataKey="gestor" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                <RechartsRadar name="Liderados" dataKey="liderados" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 mb-2">Resumo da Avaliação</h4>
            <p className="text-sm text-slate-600">
              O colaborador possui uma percepção de si mesmo muito alinhada com a equipe em <strong>Foco em Resultados</strong>, porém há um gap de percepção na área de <strong>Inteligência Emocional</strong>, onde o gestor e pares avaliaram com notas mais baixas.
            </p>
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h5 className="text-xs font-bold text-indigo-800 uppercase mb-2">Plano de Ação Recomendado</h5>
              <ul className="text-sm text-indigo-700 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  Realizar treinamento de feedback não-violento.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  Mentoria quinzenal focada em gestão de conflitos.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  const renderInteligenciaEmocional = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-500" />
            Inteligência Emocional
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Autoconhecimento</span>
              <span className="text-2xl font-black text-slate-800">82%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Autocontrole</span>
              <span className="text-2xl font-black text-slate-800">75%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Automotivação</span>
              <span className="text-2xl font-black text-slate-800">90%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Empatia</span>
              <span className="text-2xl font-black text-slate-800">68%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 bg-violet-50 p-4 rounded-lg border border-violet-100 text-violet-800">
            <strong>Resumo:</strong> O colaborador apresenta excelente nível de automotivação, lidando bem com metas desafiadoras. O ponto de desenvolvimento encontra-se na <strong>Empatia</strong>, podendo gerar atritos em interações com clientes mais sensíveis.
          </p>
        </div>
      </div>
    );
  };

    const renderTesteConhecimento = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-sky-500" />
            Teste de Conhecimento (Capacitação)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">Planos e Serviços</span>
                  <span className="font-black text-sky-600">95%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">Técnicas de Vendas PAP</span>
                  <span className="font-black text-sky-600">80%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">Sistemas (App/CRM)</span>
                  <span className="font-black text-rose-600">60%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-sky-50 p-6 rounded-xl border border-sky-100 flex flex-col justify-center">
              <h4 className="font-bold text-sky-900 mb-2">Plano de Treinamento</h4>
              <p className="text-sm text-sky-800 mb-4">
                O colaborador apresenta domínio excepcional no portfólio de planos, mas necessita de reciclagem no uso do aplicativo de vendas.
              </p>
              <button className="self-start px-4 py-2 bg-sky-600 text-white font-bold rounded-lg text-sm shadow-sm hover:bg-sky-700">
                Agendar Reciclagem CRM
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
    const renderBigFive = () => {
    const oceanData = [
      { name: "Abertura à Experiência", value: 75, color: "#3b82f6" },
      { name: "Conscienciosidade", value: 85, color: "#10b981" },
      { name: "Extroversão", value: 90, color: "#f59e0b" },
      { name: "Amabilidade", value: 65, color: "#8b5cf6" },
      { name: "Neuroticismo", value: 30, color: "#ef4444" },
    ];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Big Five (OCEAN)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              {oceanData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" style={{ width: item.value + "%", backgroundColor: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-3">Análise de Personalidade</h4>
              <p className="text-sm text-indigo-800">
                Perfil altamente <strong>Extrovertido e Consciencioso</strong>, com baixo índice de Neuroticismo (alta estabilidade emocional). Excelente alinhamento para trabalho externo sob pressão (PAP). O nível mediano de Amabilidade o torna um bom negociador, não cedendo facilmente em descontos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };


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
            {/* Cabecalho de Impressao Fixo */}
            <div className="hidden print:flex flex-col mb-8 border-b-2 border-slate-800 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900">Relatório de Gestão de Pessoas</h1>
                  <p className="text-slate-500 mt-1">Análise de Desempenho e Comportamento</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 font-medium">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="text-slate-600 font-medium text-sm">Gerado por: {loggedUser}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Colaborador: {selectedVendor.nome}</h2>
                  <p className="text-slate-600 mt-1">Cargo: Consultor Comercial (PAP) | Status: Ativo</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Header do Colaborador (Web) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex flex-col">
                  {isAdmin ? (
                    <div className="relative inline-flex items-center">
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

              <div className="flex items-center gap-2 print:hidden">
                {isAdmin && (
                  <button onClick={() => alert("Protocolo adicionado na fila de monitoramento!")} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors">
                    <ClipboardList className="w-4 h-4" /> Monitoramento
                  </button>
                )}
                {vendorTab !== "modulos" ? (
                  <button
                    onClick={() => setVendorTab("modulos")}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar aos Cards
                  </button>
                ) : (
                  isAdmin && (
                    <button
                      onClick={() => setSelectedVendorId(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Voltar à Equipe
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 print:overflow-visible print:pr-0">

              {/* Rodapé de Impressão Fixo (Aparece em todas as páginas) */}
              <div className="hidden print:flex fixed bottom-0 left-0 right-0 w-full justify-between items-center text-[10px] text-slate-500 bg-white pt-2 pb-2 border-t border-slate-200 z-50">
                <span>MHNET Telecom - Gestão de Pessoas</span>
                <span>Página impressa em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                <span>Documento Confidencial de Uso Interno</span>
              </div>

              {/* Sync feedback */}
              {isSavingSync && (
                <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold">Sincronizando com Firestore...</span>
                </div>
              )}
              {syncSuccessMsg && (
                <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">{syncSuccessMsg}</span>
                </div>
              )}

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
                      { id: "roleplay", nome: "Role Play IA", icon: Bot, desc: "Simulador de Vendas", color: "text-blue-600", bg: "bg-blue-50" },
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

              
              {vendorTab === 'roleplay' && renderRolePlay()}
                            {vendorTab === "dashboard" && (
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center print:hidden mb-6">
                    <h3 className="text-xl font-black text-slate-800">Resumo Geral (Completo)</h3>
                    <button 
                      onClick={handlePrintReport} 
                      disabled={isGeneratingPdf}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> {isGeneratingPdf ? "Gerando PDF..." : "Imprimir / Salvar PDF"}
                    </button>
                  </div>

                  <div id="pdf-dashboard-content" className="space-y-6 print:space-y-4">
                    {/* Tabela de Resumo de Indicadores (Apenas Impressão) */}
                    <div className="hidden print:block mb-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Quadro Resumo de Indicadores</h3>
                      <table className="w-full border-collapse border border-slate-200 text-sm text-left">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="border border-slate-200 p-2 font-bold text-slate-800 uppercase text-xs tracking-wider">Módulo / Avaliação</th>
                            <th className="border border-slate-200 p-2 font-bold text-slate-800 uppercase text-xs tracking-wider text-center">Score / Resultado</th>
                            <th className="border border-slate-200 p-2 font-bold text-slate-800 uppercase text-xs tracking-wider">Status / Nível</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Fit de Cargo</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">75%</td>
                            <td className="border border-slate-200 p-2 text-emerald-600 font-bold">Adequado</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Competências</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">80%</td>
                            <td className="border border-slate-200 p-2 text-emerald-600 font-bold">Desenvolvido</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Perfil Comercial (Tx. Conversão)</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">82%</td>
                            <td className="border border-slate-200 p-2 text-blue-600 font-bold">Alta Performance</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Avaliação 360°</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">85%</td>
                            <td className="border border-slate-200 p-2 text-blue-600 font-bold">Destaque</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Teste de Conhecimento</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">78%</td>
                            <td className="border border-slate-200 p-2 text-emerald-600 font-bold">Aprovado</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium border-t-2 border-t-slate-400">Raio-X (IA) Score Final</td>
                            <td className="border border-slate-200 p-2 text-slate-900 font-black text-center border-t-2 border-t-slate-400">80%</td>
                            <td className="border border-slate-200 p-2 text-slate-900 font-black border-t-2 border-t-slate-400">Excelente Perfil</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {renderRaiox()}
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
                  </div>
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
