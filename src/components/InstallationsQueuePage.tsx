import React, { useState, useEffect } from 'react';

import { ClipboardList, CheckCircle, Clock, Check, RefreshCw, Filter, Phone, PhoneCall, AlertTriangle, Trash2, X } from 'lucide-react';

const formatDataDisplay = (val: string) => {

  if (!val) return "";
  if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const p = val.split('-');
    return `${p[2]}-${p[1]}-${p[0]} 00:00`;
  }
  if (val.includes('/')) {
    return val.replace(/\//g, '-').substring(0, 16);
  }
  return val;
};

interface QueueItem {
  id: string;
  cliente: string;
  protocolo: string;
  dataAdicao: string;
  status: 'Pendente' | 'Concluido' | 'Atrasado';
  vendedor: string;
  observacoes: string;
}

export default function InstallationsQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('Pendente');
  
  const [finalizeId, setFinalizeId] = useState<string | null>(null);
  const [observacaoFinal, setObservacaoFinal] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/installations-queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleFinalizeSubmit = async () => {
    if (!finalizeId) return;
    try {
      const res = await fetch(`/api/installations-queue/${finalizeId}/finalize`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observacaoFinal })
      });
      if (res.ok) {
        setFinalizeId(null);
        setObservacaoFinal('');
        loadQueue();
      } else {
        alert("Erro ao finalizar.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir permanentemente este item da fila?")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/installations-queue/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadQueue();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsDeleting(null);
    }
  };
  const filteredQueue = filterStatus === 'Todos' ? queue : queue.filter(q => q.status === filterStatus);

  return (
    <div className="space-y-6  font-sans pb-12">
      {/* Hero Section */}
      <div className="bg-slate-950 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-10 p-8 opacity-10">
          <ClipboardList className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold tracking-wide uppercase mb-4">
              <CheckCircle className="w-3.5 h-3.5" />
              Acompanhamento de Instalações
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 flex items-center gap-3">
              Fila de Monitoramento
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm md:text-base leading-relaxed">
              Monitore os protocolos de instalação gerados pelos vendedores. Contate os clientes para validação e garanta a conclusão das entregas.
            </p>
          </div>
          
          <div className="flex shrink-0">
            <button onClick={loadQueue}
                  
                  disabled={isLoading} className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
              <span className="hidden sm:inline">Atualizar Fila</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-modern p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400 ml-2" />
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['Pendente', 'Atrasado', 'Concluido', 'Todos'].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === status 
                    ? 'bg-white text-sky-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}>
                {status === 'Concluido' ? 'Concluídos' : status}
                {status !== 'Todos' && (
                  <span className="ml-2 inline-block px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[9px] font-black">
                    {queue.filter(q => q.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
          {filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center col-span-full py-16 text-center space-y-4"><div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <ClipboardList className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <p className="text-slate-500 font-bold text-lg">Nenhum chamado na fila</p>
                <p className="text-slate-400 text-sm mt-1">Não há instalações com o status selecionado.</p>
              </div>
            </div>
          ) : (
            filteredQueue.map((item) => (
              <div key={item.id} className="card-modern rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden bg-white"><div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 ${
                      item.status === 'Concluido' ? 'bg-[#E6FAF1] text-[#00A86B] border border-[#00A86B]/20' :
                      item.status === 'Atrasado' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {item.status === 'Pendente' && <Clock className="w-3 h-3" />}
                      {item.status === 'Atrasado' && <AlertTriangle className="w-3 h-3" />}
                      {item.status === 'Concluido' && <CheckCircle className="w-3 h-3" />}
                      {item.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{formatDataDisplay(item.dataAdicao)}</span>
                  </div>
                  
                  <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo / Dados</span>
                      <span className="font-mono text-xs font-bold text-sky-700 leading-relaxed break-words">{item.protocolo}</span>
                    </div>
                    {item.cliente && item.cliente !== "-" && (
                      <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</span>
                        <span className="font-sans text-xs font-bold text-slate-800">{item.cliente}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultor</span>
                      <span className="text-xs font-bold text-slate-700">{item.vendedor}</span>
                    </div>
                  </div>

                  {item.observacoes && (
                    <div className="mb-4 text-xs font-medium text-slate-500 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                      "{item.observacoes}"
                    </div>
                  )}
                </div>

                                {item.status !== 'Concluido' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button onClick={() => handleDelete(item.id)}
                  
                  disabled={isDeleting === item.id} className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl flex items-center justify-center transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="flex-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <PhoneCall className="w-4 h-4" />
                      Ligar
                    </button>
                    <button onClick={() => setFinalizeId(item.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Finalizar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        
            </div>

      {/* Modal Finalização */}
      
        {finalizeId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00A86B]" />
                  Finalizar Instalação
                </h3>
                <button onClick={() => {
                    setFinalizeId(null);
                    setObservacaoFinal('');
                    }} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-4">
                  Adicione uma observação de fechamento para este protocolo (ex: "Instalação concluída com sucesso, cliente satisfeito").
                </p>
                <textarea
                  value={observacaoFinal}
                  onChange={(e) => setObservacaoFinal(e.target.value)}
                  placeholder="Observação final..." className="w-full rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none h-32"
                />
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex gap-3">
                <button onClick={() => {
                    setFinalizeId(null);
                    setObservacaoFinal('');
                    }} className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200/50 transition-colors"
                >
                  Cancelar
                </button>
                <button onClick={handleFinalizeSubmit} className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200 transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Concluir
                </button>
              </div>
            </div>
          </div>
        )}
      

    </div>
  );
}
