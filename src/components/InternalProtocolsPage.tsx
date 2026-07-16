import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, Briefcase, FileSignature, RefreshCw, Layers, ArrowRight, Activity, X, CheckCircle, Trash2, PhoneCall, Clock, Check, MessageSquare, User, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const formatDateBR = (val: string) => {
  if (!val) return "";
  if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const p = val.split('-');
    return `${p[2]}-${p[1]}-${p[0]}`;
  }
  if (val.includes('/')) {
    const p = val.split('/');
    if(p[0].length === 4) return `${p[2]}-${p[1]}-${p[0]}`; // YYYY/MM/DD
    return `${p[0]}-${p[1]}-${p[2]}`.substring(0, 10);
  }
  return val;
};

interface InternalProtocol {
  id?: string;
  protocolo: string;
  dataAbertura: string;
  setor: string;
  motivo: string;
  observacoes?: string;
  status?: string;
  vendedor?: string;
  timestamp?: string;
}

export default function InternalProtocolsPage() {
  const [protocols, setProtocols] = useState<InternalProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [selectedProtocol, setSelectedProtocol] = useState<InternalProtocol | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingAction, setIsSavingAction] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'Pendentes' | 'Concluidos' | 'Todos'>('Pendentes');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    protocolo: '',
    dataAbertura: new Date().toISOString().split('T')[0],
    setor: '',
    motivo: '',
    vendedor: localStorage.getItem("userName") || ""
  });

  const loadProtocols = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sheets/internal-protocols');
      if (res.ok) {
        const data = await res.json();
        setProtocols(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProtocols();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/sheets/internal-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          status: 'Pendente', 
          observacoes: '',
          vendedor: localStorage.getItem("userName") || "",
          timestamp: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) // DD/MM/AAAA
        })
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({
          protocolo: '',
          dataAbertura: new Date().toISOString().split('T')[0],
          setor: '',
          motivo: '',
          vendedor: localStorage.getItem("userName") || ""
        });
        loadProtocols();
      } else {
        alert("Erro ao salvar protocolo.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<InternalProtocol>) => {
    setIsSavingAction(true);
    try {
      const res = await fetch(`/api/sheets/internal-protocols/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        loadProtocols();
        if(selectedProtocol && selectedProtocol.id === id) {
          setSelectedProtocol(prev => prev ? { ...prev, ...updates } : null);
        }
      } else {
        alert("Erro ao atualizar.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsSavingAction(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    setIsSavingAction(true);
    try {
      const res = await fetch(`/api/sheets/internal-protocols/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSelectedProtocol(null);
        loadProtocols();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsSavingAction(false);
    }
  };
  
  const handleAddAction = (text: string) => {
    setEditNotes(prev => prev ? `${prev}\n${formatDateBR(new Date().toISOString().split('T')[0])}: ${text}` : `${formatDateBR(new Date().toISOString().split('T')[0])}: ${text}`);
  };

  // Filter Protocols
  const filteredProtocols = protocols.filter(p => {
    const isConcluido = p.status === 'Concluido' || p.status === 'Concluído';
    if (filterStatus === 'Pendentes' && isConcluido) return false;
    if (filterStatus === 'Concluidos' && !isConcluido) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.protocolo.toLowerCase().includes(q) &&
          !p.motivo.toLowerCase().includes(q) &&
          !p.setor.toLowerCase().includes(q) &&
          !(p.vendedor && p.vendedor.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Hero Section */}
      <div className="bg-slate-950 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-10 p-8 opacity-10">
          <Layers className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-4">
              <Activity className="w-3.5 h-3.5" />
              Gestão de Demandas
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 flex items-center gap-3">
              Protocolos Internos
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm md:text-base leading-relaxed">
              Acompanhe protocolos, requisições e demandas operacionais como panfletos, expansões e materiais.
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={loadProtocols}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm active:scale-95 shadow-emerald-900/20 border border-emerald-500"
            >
              <Plus className="w-4 h-4" />
              Novo Protocolo
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <motion.form 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="card-modern p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E6FAF1] border border-[#00A86B]/20 flex items-center justify-center text-[#00A86B]">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Registrar Novo Protocolo</h3>
              <p className="text-xs font-medium text-slate-500">Preencha os dados da solicitação para enviar à planilha</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Nº Protocolo / ID</label>
              <div className="relative">
                <input required type="text" value={formData.protocolo} onChange={e => setFormData({...formData, protocolo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all placeholder:text-slate-400" placeholder="Ex: PRT-293" />
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Data de Abertura</label>
              <div className="relative">
                <input required type="date" value={formData.dataAbertura} onChange={e => setFormData({...formData, dataAbertura: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-slate-700" />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Setor Responsável</label>
              <div className="relative">
                <input required type="text" value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all placeholder:text-slate-400" placeholder="Ex: Marketing, TI, Compras" />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">Motivo / Descrição</label>
              <div className="relative">
                <input required type="text" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all placeholder:text-slate-400" placeholder="Ex: Impressão de 5000 panfletos" />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button disabled={isLoading} type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors mr-2">
              Cancelar
            </button>
            <button disabled={isLoading} type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {isLoading ? 'Salvando...' : 'Salvar Protocolo'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.form>
      )}

      {/* Data Table Section */}
      <div className="card-modern rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Registros
              <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full text-xs">
                {filteredProtocols.length}
              </span>
            </h3>
            
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setFilterStatus('Pendentes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'Pendentes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pendentes
              </button>
              <button 
                onClick={() => setFilterStatus('Concluidos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'Concluidos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Concluídos
              </button>
              <button 
                onClick={() => setFilterStatus('Todos')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === 'Todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Todos
              </button>
            </div>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse cursor-pointer">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Protocolo & Data</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Setor Responsável</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Motivo / Descrição</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Solicitante</th>
                <th className="p-4 pr-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProtocols.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium text-sm">Nenhum protocolo encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProtocols.map((p, i) => (
                  <tr 
                    key={p.id || i} 
                    onClick={() => {
                      setSelectedProtocol(p);
                      setEditNotes(p.observacoes || '');
                    }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E6FAF1] text-[#00A86B] flex items-center justify-center shrink-0 border border-[#00A86B]/20">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-mono text-xs font-bold text-slate-700 group-hover:text-[#00A86B] transition-colors">{p.protocolo}</span>
                          <span className="block text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" /> {formatDateBR(p.dataAbertura)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60 uppercase tracking-wide">
                        {p.setor}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium max-w-xs truncate">
                      {p.motivo}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {p.vendedor || "Não Informado"}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {p.status === 'Concluido' || p.status === 'Concluído' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Concluído
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protocol Details Modal */}
      <AnimatePresence>
        {selectedProtocol && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedProtocol(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6FAF1] border border-[#00A86B]/20 flex items-center justify-center text-[#00A86B]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                      Protocolo {selectedProtocol.protocolo}
                      {selectedProtocol.status === 'Concluido' || selectedProtocol.status === 'Concluído' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase font-bold tracking-wider">Concluído</span>
                      ) : null}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> {formatDateBR(selectedProtocol.dataAbertura)}
                      {selectedProtocol.vendedor && (
                         <><span className="text-slate-300">|</span> <User className="w-3.5 h-3.5" /> {selectedProtocol.vendedor}</>
                      )}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProtocol(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Setor Responsável</span>
                    <span className="text-sm font-bold text-slate-700">{selectedProtocol.setor}</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivo / Descrição</span>
                    <span className="text-sm font-bold text-slate-700">{selectedProtocol.motivo}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> 
                      Ações e Observações
                    </label>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleAddAction("Liguei para o setor responsável")} className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200 transition-colors flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5" /> Liguei
                    </button>
                    <button onClick={() => handleAddAction("Em andamento no setor")} className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Em andamento
                    </button>
                    <button onClick={() => handleAddAction("Em fase de orçamento")} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Orçamento
                    </button>
                  </div>

                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Adicione notas, atualizações de status ou o histórico do protocolo..."
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 focus:border-[#00A86B] transition-all resize-none h-32 custom-scrollbar"
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-wrap sm:flex-nowrap justify-between gap-3 shrink-0 items-center">
                <button
                  onClick={() => {
                    if (selectedProtocol.id) {
                      handleDelete(selectedProtocol.id);
                    }
                  }}
                  disabled={isSavingAction}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (selectedProtocol.id) {
                        handleUpdate(selectedProtocol.id, { observacoes: editNotes });
                      }
                    }}
                    disabled={isSavingAction}
                    className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    Salvar Notas
                  </button>
                  <button
                    onClick={() => {
                      if (selectedProtocol.id) {
                        handleUpdate(selectedProtocol.id, { observacoes: editNotes, status: 'Concluido' });
                        setSelectedProtocol(null);
                      }
                    }}
                    disabled={isSavingAction || selectedProtocol.status === 'Concluido' || selectedProtocol.status === 'Concluído'}
                    className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-[#00A86B] hover:bg-[#00905a] shadow-sm shadow-[#00A86B]/30 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" /> Concluir Protocolo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
