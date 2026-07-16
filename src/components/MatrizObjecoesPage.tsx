import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/db";
import { MessageSquare, RefreshCw, Send, Sparkles, BookOpen, Plus, X , Download } from 'lucide-react';
import ReactMarkdown from "react-markdown";

interface Objecao {
  id: string;
  objecao: string;
  etapa: string;
  categoria: string;
  resposta_ideal: string;
  vendedor?: string;
  dataCriacao?: string;
}

export default function MatrizObjecoesPage({ loggedUser, isAdmin }: { loggedUser?: string, isAdmin?: boolean }) {
  const [objections, setObjections] = useState<Objecao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Suggest Objection State
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newObjection, setNewObjection] = useState("");
  const [isSavingObj, setIsSavingObj] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/matriz-objecoes");
      if (resp.ok) {
        const data = await resp.json();
        setObjections(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const resp = await fetch("/api/gemini/copilot-objecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: aiInput, objecoes: objections })
      });
      const data = await resp.json();
      if (data.status === "success") {
        setAiResponse(data.text);
      } else {
        setAiResponse("Erro ao gerar resposta. Verifique a API Key.");
      }
    } catch (err) {
      console.error(err);
      setAiResponse("Erro de comunicação com o assistente.");
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleSuggestObjection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjection.trim()) return;
    
    setIsSavingObj(true);
    try {
      const resp = await fetch("/api/matriz-objecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          objecao: newObjection,
          vendedor: loggedUser 
        })
      });
      if (resp.ok) {
        setNewObjection("");
        setIsSuggesting(false);
        fetchData();
      }
    } catch (e) {
      console.error("Erro ao salvar objeção", e);
    } finally {
      setIsSavingObj(false);
    }
  };

    const handleSaveAiResponse = async () => {
    if (!aiInput.trim() || !aiResponse.trim()) return;
    
    setIsSavingObj(true);
    try {
      // Salvar no Firebase
      await addDoc(collection(db, "logs_treinamento"), {
        objecao: aiInput,
        resposta_ia: aiResponse,
        vendedor: loggedUser || "Desconhecido",
        timestamp: serverTimestamp(),
        data_registro: new Date().toISOString()
      });

      setAiInput("");
      setAiResponse("");
      alert("Objeção salva com sucesso no Log de Treinamento!");
    } catch (e) {
      console.error("Erro ao salvar log de treinamento", e);
      alert("Erro ao salvar o log no Firebase.");
    } finally {
      setIsSavingObj(false);
    }
  };

  const filteredObjecoes = objections.filter(o => 
    o.objecao.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.categoria.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.etapa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: objections.length,
    etapas: Array.from(new Set(objections.map(o => o.etapa).filter(Boolean))),
    categorias: Array.from(new Set(objections.map(o => o.categoria).filter(Boolean)))
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-sky-600" />
            Matriz de Objeções (Copilot)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Guia estratégico e Assistente de Vendas em tempo real</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button 
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objections, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", "matriz_objecoes_export.json");
              document.body.appendChild(downloadAnchorNode); //  for firefox
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            Exportar Logs (Estudo)
          </button>
        </div>
        <button 
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 card-modern border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:border-sky-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Sincronizar Planilha
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Copilot & Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-sky-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/20 blur-3xl rounded-full" />
            <div className="relative z-10">
              <h2 className="text-lg font-black flex items-center gap-2 text-sky-200 mb-4">
                <Sparkles className="w-5 h-5 text-sky-400" />
                Mhnet Sales Copilot
              </h2>
              <p className="text-sm text-sky-100/70 mb-6">
                Digite a objeção do cliente (ex: "ele disse que o concorrente é mais barato") para receber o script ideal de contorno.
              </p>
              
              <form onSubmit={handleAskCopilot} className="space-y-4">
                <textarea 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="O que o cliente falou?"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none h-24"
                />
                <button 
                  type="submit" 
                  disabled={isAiLoading || !aiInput.trim()}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gerar Contorno
                    </>
                  )}
                </button>
              </form>

              {aiResponse && (
                <div className="mt-6 ">
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-sm leading-relaxed text-slate-200 max-h-[300px] overflow-y-auto shadow-inner">
                    <div className="markdown-body text-slate-200 text-xs sm:text-sm">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveAiResponse}
                    disabled={isSavingObj}
                    className="mt-3 w-full bg-slate-700 hover:bg-slate-600 text-sky-100 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-sm disabled:opacity-50"
                  >
                    {isSavingObj ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                    Registrar para Estudo com a Equipe
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card-modern border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Resumo da Matriz</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Total de Objeções</span>
                <span className="font-black text-sky-600 text-lg">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">Etapas Mapeadas</span>
                <span className="font-bold text-slate-700">{stats.etapas.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Categorias</span>
                <span className="font-bold text-slate-700">{stats.categorias.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Database Table */}
        <div className="lg:col-span-2">
          <div className="card-modern border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-lg font-bold text-slate-800">Base de Conhecimento</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Buscar objeção, etapa ou categoria..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sky-500"
                />
                <button 
                  onClick={() => setIsSuggesting(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white p-2 rounded-xl flex items-center justify-center shrink-0 transition"
                  title="Sugerir Nova Objeção"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isSuggesting && (
              <form onSubmit={handleSuggestObjection} className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4  relative">
                <button 
                  type="button" 
                  onClick={() => setIsSuggesting(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-slate-800 mb-3 text-sm">Registrar Nova Objeção Encontrada</h3>
                <div className="flex flex-col gap-3">
                  <textarea 
                    value={newObjection}
                    onChange={(e) => setNewObjection(e.target.value)}
                    placeholder="Descreva a objeção do cliente detalhadamente..."
                    className="w-full card-modern border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-sky-500 resize-none h-20"
                    
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSavingObj || !newObjection.trim()}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition disabled:opacity-50 text-sm"
                    >
                      {isSavingObj ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Salvar Objeção
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl border border-slate-100">
              {isLoading ? (
                <div className="p-10 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-400" />
                  Carregando Matriz de Objeções...
                </div>
              ) : filteredObjecoes.length > 0 ? (
                <div className="flex flex-col">
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-100/50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500 font-bold sticky top-0 z-10">
                    <div className="col-span-8">Objeção & Resposta de Estudo</div>
                    <div className="col-span-2">Categoria</div>
                    <div className="col-span-2">Etapa</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {filteredObjecoes.map(obj => (
                      <div key={obj.id} className="p-4 hover:bg-white transition-colors group flex flex-col md:grid md:grid-cols-12 gap-4 items-start">
                        <div className="md:col-span-8 w-full">
                          <p className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            {obj.objecao}
                          </p>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 relative overflow-hidden group-hover:bg-sky-50/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 rounded-l-xl" />
                            <h4 className="text-xs font-bold text-sky-700 mb-2 uppercase tracking-wide">Resposta Sugerida / Estudo</h4>
                            <div className="text-sm text-slate-700 leading-relaxed max-w-3xl markdown-body !bg-transparent !text-sm">
                              <ReactMarkdown>{obj.resposta_ideal}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2 flex items-start">
                          <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-sky-100">
                            {obj.categoria}
                          </span>
                        </div>
                        <div className="md:col-span-2 flex items-start text-sm text-slate-600 font-medium">
                          {obj.etapa}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-slate-500">
                  Nenhuma objeção encontrada.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
