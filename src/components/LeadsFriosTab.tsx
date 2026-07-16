import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, RefreshCw, Filter, FileSpreadsheet, MapPin, User, Phone, CheckCircle2, XCircle, CloudUpload, ArrowRight, X, Calendar, MessageSquare, Briefcase, Sparkles, Printer, Bot } from 'lucide-react';
import { db } from '../lib/db';
import { collection, writeBatch, doc, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import Markdown from 'react-markdown';

export interface HistoricoInteracao {
  id: string;
  data: string;
  consultor: string;
  acao: string;
}

interface LeadFrio {
  id: string;
  data: string;
  cidade: string;
  bairro?: string;
  endereco?: string;
  numero?: string;
  nome: string;
  telefone1: string;
  telefone2: string;
  email: string;
  origem: string;
  consultor: string;
  status: string;
  convertido: string;
  motivoNaoConversao: string;
  codigoProposta: string;
  provedorAtual?: string;
  observacao: string;
  abaOrigem: string;
  historico?: HistoricoInteracao[];
}

interface LeadsFriosTabProps {
  isAdmin: boolean;
  vendors?: string[];
  loggedUser?: string;
}

export function LeadsFriosTab({ isAdmin, vendors = [], loggedUser = "Usuário" }: LeadsFriosTabProps) {
  const [leads, setLeads] = useState<LeadFrio[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [originFilter, setOriginFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 50;

  const [selectedLead, setSelectedLead] = useState<LeadFrio | null>(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editLeadForm, setEditLeadForm] = useState<Partial<LeadFrio>>({});
  const [savingLead, setSavingLead] = useState(false);
  const [transforming, setTransforming] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [transformError, setTransformError] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [newHistoryAction, setNewHistoryAction] = useState("");
  const [addingHistory, setAddingHistory] = useState(false);

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newHistoryAction.trim()) return;

    const newHistoryItem: HistoricoInteracao = {
      id: new Date().getTime().toString(),
      data: new Date().toLocaleString(),
      consultor: loggedUser || (isAdmin ? "Administrador" : "Consultor"),
      acao: newHistoryAction.trim()
    };

    const updatedHistorico = [...(selectedLead.historico || []), newHistoryItem];
    const updatedLead = { ...selectedLead, historico: updatedHistorico };
    const previousLead = { ...selectedLead };

    // Atualização otimista na interface (Instantâneo)
    setSelectedLead(updatedLead);
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
    setNewHistoryAction("");
    setAddingHistory(true);

    try {
      const docRef = doc(db, "leads_frios", selectedLead.id);
      await updateDoc(docRef, { historico: updatedHistorico });
    } catch (err) {
      console.error("Error adding history:", err);
      alert("Falha ao registrar histórico. As alterações foram revertidas.");
      // Reverter em caso de erro
      setSelectedLead(previousLead);
      setLeads(prev => prev.map(l => l.id === previousLead.id ? previousLead : l));
    } finally {
      setAddingHistory(false);
    }
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLead) return;
    
    const updatedLead = { ...selectedLead, ...editLeadForm } as LeadFrio;
    const previousLead = { ...selectedLead };

    // Atualização otimista
    setSelectedLead(updatedLead);
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updatedLead : l));
    setIsEditingLead(false);
    setSavingLead(true);

    try {
      const docRef = doc(db, "leads_frios", selectedLead.id);
      await setDoc(docRef, updatedLead, { merge: true });
    } catch (err) {
      console.error("Error saving lead details:", err);
      alert("Falha ao salvar detalhes do lead. As alterações foram revertidas.");
      // Reverter
      setSelectedLead(previousLead);
      setLeads(prev => prev.map(l => l.id === previousLead.id ? previousLead : l));
      setIsEditingLead(true);
    } finally {
      setSavingLead(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "leads_frios"));
      const loadedLeads: LeadFrio[] = [];
      querySnapshot.forEach((doc) => {
        loadedLeads.push({ id: doc.id, ...doc.data() } as LeadFrio);
      });
      
      if (loadedLeads.length > 0) {
        setLeads(loadedLeads);
      } else {
        const res = await fetch("/api/leads-frios");
        const data = await res.json();
        if (data.status === "success") {
          setLeads(data.leads || []);
        }
      }
    } catch (e) {
      console.error("Firestore error:", e);
      try {
        const res = await fetch("/api/leads-frios");
        const data = await res.json();
        if (data.status === "success") {
          setLeads(data.leads || []);
        }
      } catch (err) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const syncLeads = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/leads-frios/sync", { method: "POST" });
      const data = await res.json();
      if (data.status === "success" && data.leads) {
        const localLeads: LeadFrio[] = data.leads;
        const existingIds = new Set(leads.map(l => l.id));
        const newLeads = localLeads.filter(l => !existingIds.has(l.id));

        if (newLeads.length > 0) {
          const BATCH_SIZE = 400;
          let batch = writeBatch(db);
          let count = 0;
          
          for (const lead of newLeads) {
            const leadRef = doc(collection(db, "leads_frios"), lead.id);
            batch.set(leadRef, lead, { merge: true });
            count++;
            
            if (count % BATCH_SIZE === 0) {
              await batch.commit();
              batch = writeBatch(db);
            }
          }
          if (count % BATCH_SIZE !== 0) {
            await batch.commit();
          }
          
          alert(`${newLeads.length} novos leads sincronizados da planilha para o banco de dados!`);
          await fetchLeads(); // Recarregar do Firestore
        } else {
          alert("A base já está atualizada. Nenhum lead novo encontrado na planilha.");
        }
      }
    } catch (e) {
      console.error("Erro na sincronização:", e);
      alert("Erro ao sincronizar planilha.");
    } finally {
      setSyncing(false);
    }
  };

  const transformToLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !selectedVendor) {
      setTransformError("Selecione um vendedor.");
      return;
    }

    setTransforming(true);
    setTransformError("");

    try {
      const newLeadPayload = {
        nomeLead: selectedLead.nome,
        telefone: selectedLead.telefone1 || selectedLead.telefone2,
        endereco: selectedLead.origem || "Não informado",
        bairro: "Não informado",
        cidade: selectedLead.cidade || "Lajeado",
        vendedor: selectedVendor,
        interesse: "Médio",
        status: "Novo",
        observacao: `[LEAD FRIO CONVERTIDO] Consultor original: ${selectedLead.consultor}. Observações: ${selectedLead.observacao}`,
        dataCadastro: new Date().toISOString()
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadPayload)
      });

      if (!response.ok) throw new Error("Erro ao salvar no servidor.");

      try {
        const docRef = doc(db, "leads_frios", selectedLead.id);
        await updateDoc(docRef, { convertido: "Sim" });
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, convertido: "Sim" } : l));
      } catch (fbErr) {
        console.warn("Could not update firestore status:", fbErr);
      }

      alert("Lead convertido e adicionado com sucesso!");
      setSelectedLead(null);
    } catch (err: any) {
      setTransformError(err.message || "Falha ao transformar lead.");
    } finally {
      setTransforming(false);
    }
  };

  const handleAnalyzeLead = async () => {
    if (!selectedLead) return;
    setAnalyzingAi(true);
    setAiAnalysis("");
    try {
      const response = await fetch("/api/gemini/analyze-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: selectedLead })
      });
      const data = await response.json();
      if (data.status === "success") {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis("Erro na análise: " + data.message);
      }
    } catch (e) {
      setAiAnalysis("Erro ao se conectar com o serviço de IA.");
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, originFilter, statusFilter]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setPage(p => p + 1);
      setLoadingMore(false);
    }, 400); // Visual delay for UX
  };

  const uniqueOrigins = Array.from(new Set(leads.map(l => l.abaOrigem).filter(Boolean))).sort();
  const uniqueStatuses = Array.from(new Set(leads.map(l => l.status).filter(Boolean))).sort();

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      (l.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (l.telefone1 || "").includes(searchTerm) ||
      (l.cidade || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrigin = originFilter === "TODOS" || l.abaOrigem === originFilter;
    const matchesStatus = statusFilter === "TODOS" || l.status === statusFilter;

    return matchesSearch && matchesOrigin && matchesStatus;
  });

  const paginatedLeads = filteredLeads.slice(0, page * ITEMS_PER_PAGE);

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert("Nenhum dado para exportar com os filtros atuais.");
      return;
    }

    const headers = [
      "Data", "Cidade", "Bairro", "Endereço", "N°", "Nome", "Telefone 1", "Telefone 2", 
      "E-mail", "Consultor", "Forma de Captação/Origem", "Status/Situação", "Convertido?", 
      "Motivo Não Conversão", "Código Proposta/Plano", "Provedor Atual/Cliente?", "Observações", "Aba de Origem"
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    for (const lead of filteredLeads) {
      const row = [
        lead.data || "",
        lead.cidade || "",
        lead.bairro || "",
        lead.endereco || "",
        lead.numero || "",
        lead.nome || "",
        lead.telefone1 || "",
        lead.telefone2 || "",
        lead.email || "",
        lead.consultor || "",
        lead.origem || "",
        lead.status || "",
        lead.convertido || "",
        lead.motivoNaoConversao || "",
        lead.codigoProposta || "",
        lead.provedorAtual || "",
        (lead.observacao || "").replace(/\\n/g, " ").replace(/,/g, ";"),
        lead.abaOrigem || ""
      ].map(field => `"${String(field).replace(/"/g, '""')}"`);
      
      csvRows.push(row.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8,\\uFEFF" + csvRows.join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_frios_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6  pb-24 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span className="bg-sky-600 text-white p-2 rounded-lg shadow-md shadow-sky-200">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            Base de Leads Frios
          </h2>
          <p className="text-slate-500 mt-1">Gestão unificada de captações e contatos frios.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E6FAF1] border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition shadow-sm font-medium text-sm active:scale-95"
            title="Baixar lista filtrada em CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>

          <button
            onClick={syncLeads}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 card-modern border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition shadow-sm font-medium text-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Planilha"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-modern p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Buscar Lead</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nome, Telefone ou Cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none"
            />
          </div>
        </div>
        
        <div className="w-full md:w-56 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Origem / Aba
          </label>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 transition outline-none appearance-none"
          >
            <option value="TODOS">Todas as Origens</option>
            {uniqueOrigins.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-56 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 transition outline-none appearance-none"
          >
            <option value="TODOS">Todos os Status</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-4" />
          <p className="font-medium text-sm">Carregando base unificada...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedLeads.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                Nenhum lead encontrado para os filtros atuais.
              </div>
            ) : (
              paginatedLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  onClick={() => setSelectedLead(lead)}
                  className="card-modern border border-slate-200/80 rounded-2xl p-5 -md hover:border-slate-300 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-sky-500/10 to-transparent group-hover:from-sky-500/20 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-800 truncate pr-4 text-base">{lead.nome || "Lead Sem Nome"}</h3>
                    {lead.convertido?.toUpperCase() === "SIM" && (
                      <span className="bg-emerald-100 text-emerald-700 p-1 rounded-full shrink-0" title="Convertido">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{lead.telefone1 || "Sem telefone"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{lead.cidade || "-"}</span>
                    </div>
                    {lead.status && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate font-medium text-slate-700">{lead.status}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-lg truncate max-w-[140px]">
                      {lead.abaOrigem}
                    </span>
                    <span className="text-xs font-semibold text-sky-600 group-hover:text-sky-700 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      Detalhes <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {filteredLeads.length > paginatedLeads.length && (
            <div className="flex justify-center pt-2 pb-6">
              <button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 card-modern border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-bold transition shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    Carregando...
                  </>
                ) : (
                  <>Carregar Mais ({filteredLeads.length - paginatedLeads.length} restantes)</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalhes do Lead */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm ">
          <div className="card-modern rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-scale-up">
            <button 
              onClick={() => {
                setSelectedLead(null);
                setIsEditingLead(false);
              }}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-5 pr-10 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedLead.nome || "Lead Sem Nome"}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                      {selectedLead.abaOrigem}
                    </span>
                    {selectedLead.status && (
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {selectedLead.status}
                      </span>
                    )}
                    {selectedLead.convertido?.toUpperCase() === "SIM" && (
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Convertido
                      </span>
                    )}
                  </div>
                </div>
                {!isEditingLead && (
                  <button
                    onClick={() => {
                      setEditLeadForm(selectedLead);
                      setIsEditingLead(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-lg transition print:hidden"
                  >
                    Editar Lead
                  </button>
                )}
              </div>

              {isEditingLead ? (
                <div className="space-y-4 bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nome</label>
                      <input 
                        type="text" 
                        value={editLeadForm.nome || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, nome: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Telefone 1</label>
                      <input 
                        type="text" 
                        value={editLeadForm.telefone1 || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, telefone1: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Telefone 2</label>
                      <input 
                        type="text" 
                        value={editLeadForm.telefone2 || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, telefone2: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={editLeadForm.email || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, email: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Cidade</label>
                      <input 
                        type="text" 
                        value={editLeadForm.cidade || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, cidade: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Bairro</label>
                      <input 
                        type="text" 
                        value={editLeadForm.bairro || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, bairro: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Endereço (Logradouro)</label>
                      <input 
                        type="text" 
                        value={editLeadForm.endereco || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, endereco: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Número</label>
                      <input 
                        type="text" 
                        value={editLeadForm.numero || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, numero: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                      <input 
                        type="text" 
                        value={editLeadForm.status || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, status: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Origem (Marketing)</label>
                      <input 
                        type="text" 
                        value={editLeadForm.origem || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, origem: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Consultor Responsável</label>
                      <input 
                        type="text" 
                        value={editLeadForm.consultor || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, consultor: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Motivo de Não Conversão</label>
                      <input 
                        type="text" 
                        value={editLeadForm.motivoNaoConversao || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, motivoNaoConversao: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Observações / Detalhes</label>
                      <textarea 
                        value={editLeadForm.observacao || ""} 
                        onChange={e => setEditLeadForm({...editLeadForm, observacao: e.target.value})}
                        className="w-full px-3 py-2 card-modern border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none h-24 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button 
                      onClick={() => setIsEditingLead(false)}
                      className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveLeadDetails}
                      disabled={savingLead}
                      className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contato</span>
                    <div className="font-medium text-slate-700 text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {selectedLead.telefone1} {selectedLead.telefone2 ? ` / ${selectedLead.telefone2}` : ""}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Localidade</span>
                    <div className="font-medium text-slate-700 text-sm flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span>{selectedLead.cidade || "Não informada"}<br/><span className="text-xs text-slate-500 font-normal">{selectedLead.origem}</span></span>
                    </div>
                  </div>
                  {selectedLead.data && (
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Registro</span>
                      <div className="font-medium text-slate-700 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {selectedLead.data}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Consultor Responsável</span>
                    <div className="font-medium text-slate-700 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      {selectedLead.consultor || "Nenhum"}
                    </div>
                  </div>
                  {selectedLead.motivoNaoConversao && (
                    <div>
                      <span className="block text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Motivo Perda</span>
                      <div className="font-medium text-rose-700 text-sm flex items-start gap-2 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                        <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <span>{selectedLead.motivoNaoConversao}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedLead.observacao && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Observações Anteriores
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedLead.observacao}</p>
                </div>
              )}

              {/* Histórico de Interações */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Histórico de Interações
                </span>
                
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {selectedLead.historico && selectedLead.historico.length > 0 ? (
                    selectedLead.historico.map((h) => (
                      <div key={h.id} className="card-modern p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-800">{h.consultor}</span>
                          <span className="text-[10px] text-slate-500">{h.data}</span>
                        </div>
                        <p className="text-slate-600">{h.acao}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-2">Sem histórico de interações registrado recentemente.</p>
                  )}
                </div>

                <form onSubmit={handleAddHistory} className="flex flex-col sm:flex-row gap-2 print:hidden">
                  <input
                    type="text"
                    value={newHistoryAction}
                    onChange={(e) => setNewHistoryAction(e.target.value)}
                    placeholder="Adicionar nova interação/negociação..."
                    className="flex-1 px-3 py-2 card-modern border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    
                  />
                  <button
                    type="submit"
                    disabled={addingHistory || !newHistoryAction.trim()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {addingHistory ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                  </button>
                </form>
              </div>

              {/* AI Analysis Section */}
              <div className="border-t border-slate-200 pt-6 mt-2 print:hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-sky-500" /> 
                    Análise IA de Abordagem
                  </h3>
                  {!aiAnalysis && !analyzingAi && (
                    <button
                      onClick={handleAnalyzeLead}
                      className="px-4 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition flex items-center gap-2"
                    >
                      <Sparkles className="w-3 h-3" /> Gerar Análise
                    </button>
                  )}
                </div>

                {analyzingAi && (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                    <p className="text-sm text-slate-500 font-medium">A IA está analisando o histórico e formulando a melhor abordagem...</p>
                  </div>
                )}

                {aiAnalysis && !analyzingAi && (
                  <div className="bg-gradient-to-br from-sky-50 to-white p-5 rounded-xl border border-sky-100 shadow-sm relative">
                    <div className="markdown-body text-sm text-slate-700 leading-relaxed prose prose-sm prose-sky max-w-none">
                      <Markdown>{aiAnalysis}</Markdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Ação de Conversão */}
              {selectedLead.convertido?.toUpperCase() !== "SIM" && isAdmin && (
                <div className="border-t border-slate-200 pt-6 mt-2 print:hidden">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00A86B]" /> 
                    Transformar em Lead Ativo
                  </h3>
                  
                  <form onSubmit={transformToLead} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <select 
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 transition outline-none appearance-none"
                        
                      >
                        <option value="">Selecione o Vendedor de Destino...</option>
                        {vendors.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      type="submit"
                      disabled={transforming || !selectedVendor}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {transforming ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Convertendo...</>
                      ) : (
                        <><User className="w-4 h-4" /> Atribuir Lead</>
                      )}
                    </button>
                  </form>
                  {transformError && <p className="text-xs text-rose-600 font-bold mt-2">{transformError}</p>}
                </div>
              )}
              
              <div className="pt-4 flex justify-end print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg text-sm font-medium transition"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Salvar PDF
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

