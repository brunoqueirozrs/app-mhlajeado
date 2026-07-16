import React, { useState, useEffect } from "react";
import { 
  CheckSquare, Check, X, AlertTriangle, 
  MessageSquare, UserCheck, Calendar, Search, 
  Filter, ChevronRight, Phone, MapPin, 
  Wifi, Smartphone, ThumbsUp, HelpCircle, RefreshCw, Zap, Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ConfirmModal from "./ConfirmModal";

interface ClientPosVenda {
  id: string;
  nome: string;
  telefone: string;
  cpf?: string;
  cidade?: string;
  bairro?: string;
  endereco: string;
  plano: string;
  vendedora: string;
  dataInstalacao: string;
  dataAlvo: string;
  rx_onu?: string;
  rx_olt?: string;
  status: "Pendente" | "Em Andamento" | "Concluído" | "Alerta";
  score?: number;
  dataConclusao?: string;
  checklist?: any;
  observacoes?: string;
}

const checklistsDefault = {
  cpf: "",
  cidade: "",
  bairro: "",
  atenuacaoLuz: "",
  atenuacaoRxOnu: "",
  atenuacaoRxOlt: "",
  percepcaoCliente: "",
  abriuChamado: null,
  globoplayAtivo: null,
  google: null,
  superApp: null,
  indicacao: null,
  canaisAtendimento: null,
  contatoSalvo: null,
  foiIndicacao: null,
  foiIndicacaoNome: "",
  cobrancaMes1: null,
  cobrancaMes2: null,
  cobrancaMes3: null
};

const atenuacaoMessage = (val: string) => {
  if (!val) return null;
  if (val.toUpperCase().includes("UP")) return { text: "Fora do Padrão (Abrir chamado)", color: "text-rose-700 bg-rose-50 border-rose-200", inputBorder: "border-rose-500 focus:border-rose-600" };
  const num = parseFloat(val.replace(',', '.'));
  if (isNaN(num)) return null;
  if (num <= -8 && num >= -27) return { text: "Padrão Ideal", color: "text-emerald-700 bg-[#E6FAF1] border-emerald-200", inputBorder: "border-slate-200 focus:border-sky-500" };
  if (num < -27 && num >= -29) return { text: "Atenção (Verificar luz)", color: "text-amber-700 bg-amber-50 border-amber-200", inputBorder: "border-amber-400 focus:border-amber-500" };
  if (num < -29 || num > -8) return { text: "Fora do Padrão (Abrir chamado técnico)", color: "text-rose-700 bg-rose-50 border-rose-200", inputBorder: "border-rose-500 focus:border-rose-600" };
  return null;
};

const formatBRDate = (val: string) => {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return val;
};

export default function PosVendaPage({ loggedUser, isAdmin }: { loggedUser?: string, isAdmin?: boolean }) {
  const [activeTab, setActiveTab] = useState<"pendentes" | "base_ativa" | "financeiro">("pendentes");
  const [months, setMonths] = useState<{ value: string, label: string }[]>([]);
  const [selectedMes, setSelectedMes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<ClientPosVenda[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientPosVenda | null>(null);
  const [checklist, setChecklist] = useState<any>(checklistsDefault);
  const [vendedoraFilter, setVendedoraFilter] = useState(isAdmin ? "Todas" : (loggedUser || "Todas"));

  const [confirmState, setConfirmState] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void;}>({
    isOpen: false, title: "", message: "", onConfirm: () => {}
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  useEffect(() => {
    const opts = [];
    const currentDate = new Date();
    // Use upper case abbreviations to match sheet names like "FECHAMENTO MAI 2026"
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const monthLabels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    for (let i = -1; i < 11; i++) {
      // Look 1 month ahead and 11 months back
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const mNameShort = monthNames[d.getMonth()];
      const mNameFull = monthLabels[d.getMonth()];
      const year = d.getFullYear();
      
      const sheetName = `FECHAMENTO ${mNameShort} ${year}`;
      const labelName = `Fechamento ${mNameFull} ${year}`;
      opts.push({ value: sheetName, label: labelName });
    }
    setMonths(opts);
    setSelectedMes(opts[0].value);
  }, []);

  useEffect(() => {
    if (!selectedMes) return;
    fetchData(selectedMes);
  }, [selectedMes]);

  const fetchData = async (mes: string) => {
    setIsLoading(true);
    setClientes([]);
    try {
      const resp = await fetch(`/api/pos-vendas/${encodeURIComponent(mes)}`);
      const data = await resp.json();
      if (data.status === "success") {
        setClientes(data.clients || []);
      } else {
        console.log("No data for this month:", data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openClient = (c: ClientPosVenda) => {
    setSelectedClient(c);
    if (c.checklist) {
      setChecklist(c.checklist);
    } else {
      setChecklist({
        ...checklistsDefault, 
        cpf: c.cpf || "",
        cidade: c.cidade || "",
        bairro: c.bairro || "",
        atenuacaoRxOnu: c.rx_onu || "",
        atenuacaoRxOlt: c.rx_olt || ""
      });
    }
  };

  const [n8nSending, setN8nSending] = useState(false);

  const handleSendN8nPosVenda = async () => {
    if (!selectedClient) return;

    requestConfirm(
      "Confirmar Disparo N8N (Pós-Venda)",
      "Você conferiu se os dados (como plano e valor) estão corretos e atualizados?\n\nAo prosseguir, o disparo será feito com os dados atuais.",
      async () => {
        setN8nSending(true);
        try {
          const res = await fetch("/api/n8n/webhook-pos-venda", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cliente_id: selectedClient.id,
              nome: selectedClient.nome,
              telefone: selectedClient.telefone,
              plano: selectedClient.plano,
              vendedora: selectedClient.vendedora,
              checklist: checklist
            })
          });
          const data = await res.json();
          if (data.success) {
            const timestamp = new Date().toISOString();
            const user = loggedUser || "Atendente";
            const newChecklist = { ...checklist, n8nEnviadoEm: timestamp, n8nEnviadoPor: user };
            setChecklist(newChecklist);
            
            const updatedClient = {
                ...selectedClient,
                checklist: newChecklist
            };
            await fetch(`/api/pos-vendas/${encodeURIComponent(selectedClient.id)}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedClient)
            });

            let updatedClientes = [...clientes];
            const idx = updatedClientes.findIndex(c => c.id === selectedClient.id);
            if (idx !== -1) {
                updatedClientes[idx].checklist = newChecklist;
                setClientes(updatedClientes);
            }
      } else {
        alert("❌ Erro ao enviar para o n8n: " + (data.message || "Desconhecido"));
      }
    } catch (e: any) {
      alert("❌ Falha de conexão: " + e.message);
    } finally {
      setN8nSending(false);
    }
  });
};

  const saveChecklist = async (isComplete: boolean = false) => {
    if (!selectedClient) return;

    let updatedClientes = [...clientes];
    const idx = updatedClientes.findIndex(c => c.id === selectedClient.id);
    
    if (idx !== -1) {
      const c = updatedClientes[idx];
      c.checklist = checklist;
      
      if (isComplete) {
        let points = 0;
        let total = 0;
        const booleanKeys = ['abriuChamado', 'globoplayAtivo', 'google', 'superApp', 'indicacao', 'canaisAtendimento', 'contatoSalvo', 'foiIndicacao'];
        booleanKeys.forEach(key => {
          if (checklist[key] === "Sim") points++;
          if (checklist[key] === "Sim" || checklist[key] === "Não") total++;
        });
        const score = total > 0 ? Math.round((points / total) * 100) : 0;
        
        c.score = score;
        c.dataConclusao = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
        
        if (checklist.abriuChamado === "Sim" || checklist.percepcaoCliente?.toLowerCase().includes("ruim")) {
           c.status = "Alerta";
        } else {
           c.status = "Concluído";
        }
      } else {
        c.status = "Em Andamento";
      }
      
      setClientes(updatedClientes);
      
      try {
        await fetch(`/api/pos-vendas/${encodeURIComponent(c.id)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: c.status,
            score: c.score,
            dataConclusao: c.dataConclusao,
            checklist: c.checklist,
            observacoes: c.observacoes,
            // Client details for Base de Clientes
            nome: c.nome,
            plano: c.plano,
            dataInstalacao: c.dataInstalacao,
            endereco: c.endereco,
            telefone: c.telefone,
            vendedora: c.vendedora
          })
        });
      } catch (e) {
        console.error("Erro ao salvar", e);
      }

      setSelectedClient(null);
    }
  };

  const uniqueVendedoras = Array.from(new Set(clientes.map(c => c.vendedora).filter(Boolean)));
  const filteredClientes = clientes.filter(c => {
    if (vendedoraFilter !== "Todas") {
      const vFilter = vendedoraFilter.toLowerCase();
      const cVend = c.vendedora?.toLowerCase() || "";
      // Match if one string includes the other (e.g. "Ana Silva" matches "Ana")
      return cVend.includes(vFilter) || vFilter.includes(cVend);
    }
    return true;
  });

  const OptionBtn = ({ val, current, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${current === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
    >
      {val}
    </button>
  );

  return (
    <div className="space-y-6 font-sans pb-20">
      {!selectedClient && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <UserCheck className="w-7 h-7 text-sky-600" /> Pós-Vendas
              </h1>
              <p className="text-slate-500 text-sm mt-1">Módulo de Retenção & Checklists de Instalação</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-slate-600 shadow-sm min-w-[200px]"
                value={vendedoraFilter}
                onChange={(e) => setVendedoraFilter(e.target.value)}
              >
                <option value="Todas">Todas Vendedoras</option>
                {uniqueVendedoras.map((v: any) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>

              <select 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-slate-600 shadow-sm min-w-[200px]"
                value={selectedMes}
                onChange={(e) => setSelectedMes(e.target.value)}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
            <button 
              onClick={() => setActiveTab("pendentes")}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'pendentes' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Fila de Pós-Venda
            </button>
            <button 
              onClick={() => setActiveTab("base_ativa")}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'base_ativa' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Base Ativa
            </button>
            <button 
              onClick={() => setActiveTab("financeiro")}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'financeiro' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Financeiro (3 Meses)
            </button>
          </div>


          {activeTab === "pendentes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                 <div className="col-span-full py-10 text-center text-slate-400">
                   <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-400" />
                   Buscando dados na planilha...
                 </div>
              ) : filteredClientes.filter(c => c.status === "Pendente" || c.status === "Em Andamento").map(c => (
                <div key={c.id} className="card-modern rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4 hover:border-sky-300 transition-colors cursor-pointer group" onClick={() => openClient(c)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{c.nome}</h3>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                        <Phone className="w-3 h-3" /> {c.telefone}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${c.status === 'Pendente' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.endereco}</div>
                    <div className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-slate-400" /> {c.plano}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Ativo: {formatBRDate(c.dataInstalacao)}</div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Vendedora: {c.vendedora}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500" />
                  </div>
                </div>
              ))}
              {filteredClientes.filter(c => c.status === "Pendente" || c.status === "Em Andamento").length === 0 && (
                 <div className="col-span-full py-10 text-center text-slate-400">
                   Nenhum cliente na fila de pós-venda para este mês.
                 </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedClient && (
        <div className="card-modern rounded-2xl border border-slate-200 shadow-xl overflow-hidden  w-full">
          <div className="bg-gradient-to-r from-sky-900 to-sky-700 p-5 md:p-8 text-white flex justify-between items-center">
            <div>
              <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-sky-200 hover:text-white transition-colors mb-4 text-sm font-bold">
                <ChevronRight className="w-4 h-4 rotate-180" />
                Voltar para Lista
              </button>
              <h2 className="text-2xl md:text-3xl font-black">{selectedClient.nome}</h2>
              <p className="text-sky-200 mt-1">{selectedClient.plano} • Instalação: {formatBRDate(selectedClient.dataInstalacao)}</p>
            </div>
          </div>

          <div className="p-5 md:p-8 space-y-10">
            
            <section className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-sky-600 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="bg-sky-100 w-6 h-6 flex items-center justify-center rounded-lg text-sky-700">1</span>
                Dados Gerais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tel. WhatsApp</label>
                  <input type="text" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" value={selectedClient.telefone || ""} onChange={(e) => setSelectedClient({...selectedClient, telefone: e.target.value})} placeholder="(XX) 9XXXX-XXXX" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">CPF</label>
                  <input type="text" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" value={checklist.cpf} onChange={(e) => setChecklist({...checklist, cpf: e.target.value})} placeholder="000.000.000-00" />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Endereço (Somente Rua e Número/Compl.)</label>
                  <input type="text" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" value={selectedClient.endereco || ""} onChange={(e) => setSelectedClient({...selectedClient, endereco: e.target.value})} placeholder="Rua XYZ, 123 - Apto 4" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cidade</label>
                  <input type="text" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" value={checklist.cidade} onChange={(e) => setChecklist({...checklist, cidade: e.target.value})} placeholder="Ex: Lajeado" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
                  <input type="text" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" value={checklist.bairro} onChange={(e) => setChecklist({...checklist, bairro: e.target.value})} placeholder="Ex: Centro" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-sky-600 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="bg-sky-100 w-6 h-6 flex items-center justify-center rounded-lg text-sky-700">2</span>
                Dados Técnicos (Atenuação)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Rx ONU</label>
                  <input type="text" className={`bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${atenuacaoMessage(checklist.atenuacaoRxOnu)?.inputBorder || 'border-slate-200 focus:border-sky-500'}`} value={checklist.atenuacaoRxOnu} onChange={(e) => setChecklist({...checklist, atenuacaoRxOnu: e.target.value})} placeholder="-23.10" />
                  {atenuacaoMessage(checklist.atenuacaoRxOnu) && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border w-fit ${atenuacaoMessage(checklist.atenuacaoRxOnu)!.color}`}>
                      {atenuacaoMessage(checklist.atenuacaoRxOnu)!.text}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Rx OLT</label>
                  <input type="text" className={`bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${atenuacaoMessage(checklist.atenuacaoRxOlt)?.inputBorder || 'border-slate-200 focus:border-sky-500'}`} value={checklist.atenuacaoRxOlt} onChange={(e) => setChecklist({...checklist, atenuacaoRxOlt: e.target.value})} placeholder="-21.80" />
                  {atenuacaoMessage(checklist.atenuacaoRxOlt) && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border w-fit ${atenuacaoMessage(checklist.atenuacaoRxOlt)!.color}`}>
                      {atenuacaoMessage(checklist.atenuacaoRxOlt)!.text}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-sky-600 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="bg-sky-100 w-6 h-6 flex items-center justify-center rounded-lg text-sky-700">3</span>
                Satisfação & Serviços
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Percepção do cliente</label>
                  <input type="text" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" value={checklist.percepcaoCliente} onChange={(e) => setChecklist({...checklist, percepcaoCliente: e.target.value})} placeholder="Satisfeito, Ótima, Ruim..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Abriu chamado?</span>
                    <div className="flex gap-2">
                      <OptionBtn val="Sim" current={checklist.abriuChamado} onClick={() => setChecklist({...checklist, abriuChamado: "Sim"})} />
                      <OptionBtn val="Não" current={checklist.abriuChamado} onClick={() => setChecklist({...checklist, abriuChamado: "Não"})} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Globoplay Ativo?</span>
                    <div className="flex gap-2">
                      <OptionBtn val="Sim" current={checklist.globoplayAtivo} onClick={() => setChecklist({...checklist, globoplayAtivo: "Sim"})} />
                      <OptionBtn val="Não" current={checklist.globoplayAtivo} onClick={() => setChecklist({...checklist, globoplayAtivo: "Não"})} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Google Avaliado?</span>
                    <div className="flex gap-2">
                      <OptionBtn val="Sim" current={checklist.google} onClick={() => setChecklist({...checklist, google: "Sim"})} />
                      <OptionBtn val="Não" current={checklist.google} onClick={() => setChecklist({...checklist, google: "Não"})} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Super App?</span>
                    <div className="flex gap-2">
                      <OptionBtn val="Sim" current={checklist.superApp} onClick={() => setChecklist({...checklist, superApp: "Sim"})} />
                      <OptionBtn val="Não" current={checklist.superApp} onClick={() => setChecklist({...checklist, superApp: "Não"})} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Indicação Ofertada?</span>
                    <div className="flex gap-2">
                      <OptionBtn val="Sim" current={checklist.indicacao} onClick={() => setChecklist({...checklist, indicacao: "Sim"})} />
                      <OptionBtn val="Não" current={checklist.indicacao} onClick={() => setChecklist({...checklist, indicacao: "Não"})} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Canais de Atend.?</span>
                    <div className="flex gap-2">
                      <OptionBtn val="Sim" current={checklist.canaisAtendimento} onClick={() => setChecklist({...checklist, canaisAtendimento: "Sim"})} />
                      <OptionBtn val="Não" current={checklist.canaisAtendimento} onClick={() => setChecklist({...checklist, canaisAtendimento: "Não"})} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Contato Salvo no celular?</span>
                    <div className="flex gap-2">
                      <OptionBtn val="Sim" current={checklist.contatoSalvo} onClick={() => setChecklist({...checklist, contatoSalvo: "Sim"})} />
                      <OptionBtn val="Não" current={checklist.contatoSalvo} onClick={() => setChecklist({...checklist, contatoSalvo: "Não"})} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-sky-600 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="bg-sky-100 w-6 h-6 flex items-center justify-center rounded-lg text-sky-700">4</span>
                Indicação
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Foi indicação de alguém?</span>
                  <div className="flex gap-2">
                    <OptionBtn val="Sim" current={checklist.foiIndicacao} onClick={() => setChecklist({...checklist, foiIndicacao: "Sim"})} />
                    <OptionBtn val="Não" current={checklist.foiIndicacao} onClick={() => setChecklist({...checklist, foiIndicacao: "Não"})} />
                  </div>
                </div>
                {checklist.foiIndicacao === "Sim" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome/Contato de quem indicou</label>
                    <input type="text" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" value={checklist.foiIndicacaoNome} onChange={(e) => setChecklist({...checklist, foiIndicacaoNome: e.target.value})} placeholder="Nome / Telefone..." />
                  </div>
                )}
              </div>
            </section>
            
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
             <div className="flex flex-col gap-1">
               <button 
                 onClick={handleSendN8nPosVenda} 
                 disabled={n8nSending}
                 className={`px-5 py-2.5 text-sm font-bold border rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${checklist.n8nEnviadoEm ? 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200' : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'}`}
               >
                 {n8nSending ? <Loader2 className="w-5 h-5 animate-spin" /> : (checklist.n8nEnviadoEm ? <Check className="w-5 h-5" /> : <Zap className="w-5 h-5" />)}
                 {n8nSending ? "Enviando..." : (checklist.n8nEnviadoEm ? "Disparado via n8n" : "Disparo n8n (Pós-Venda)")}
               </button>
               {checklist.n8nEnviadoEm && (
                 <span className="text-[10px] text-green-600 font-medium px-1">
                   Enviado por {checklist.n8nEnviadoPor} em {new Date(checklist.n8nEnviadoEm).toLocaleString('pt-BR')}
                 </span>
               )}
             </div>
             <div className="flex items-center gap-3">
               <button onClick={() => saveChecklist(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                 Salvar e Sair
               </button>
               <button onClick={() => saveChecklist(true)} className="px-5 py-2.5 text-sm font-black text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-lg shadow-sky-600/30 transition-colors flex items-center gap-2">
                 <CheckSquare className="w-5 h-5" />
                 Concluir Pós-Venda
               </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === "base_ativa" && !selectedClient && (
         <div className="space-y-6">
           {isLoading ? (
             <div className="py-10 text-center text-slate-400">
               <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-400" />
               Buscando dados na planilha...
             </div>
           ) : (
             <>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="card-modern border border-slate-200 p-4 rounded-2xl shadow-sm">
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Concluídos</div>
               <div className="text-3xl font-black text-[#00A86B]">{filteredClientes.filter(c => c.status === "Concluído" || c.status === "Alerta").length} / {filteredClientes.length}</div>
             </div>
             <div className="card-modern border border-slate-200 p-4 rounded-2xl shadow-sm">
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Alertas</div>
               <div className="text-3xl font-black text-rose-600">{filteredClientes.filter(c => c.status === "Alerta").length}</div>
             </div>
             <div className="card-modern border border-slate-200 p-4 rounded-2xl shadow-sm">
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Média Score</div>
               <div className="text-3xl font-black text-sky-600">
                 {Math.round(filteredClientes.filter(c => c.score !== undefined).reduce((acc, curr) => acc + (curr.score || 0), 0) / (filteredClientes.filter(c => c.score !== undefined).length || 1))}%
               </div>
             </div>
           </div>

           <div className="card-modern rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                   <th className="p-4 font-bold text-slate-600">Cliente</th>
                   <th className="p-4 font-bold text-slate-600">Vendedora</th>
                   <th className="p-4 font-bold text-slate-600">Data</th>
                   <th className="p-4 font-bold text-slate-600">Score</th>
                   <th className="p-4 font-bold text-slate-600">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {filteredClientes.filter(c => c.status === "Concluído" || c.status === "Alerta").map(c => (
                   <tr key={c.id} className="hover:bg-slate-50">
                     <td className="p-4 font-medium text-slate-800">{c.nome}</td>
                     <td className="p-4 text-slate-600">{c.vendedora}</td>
                     <td className="p-4 text-slate-600">{c.dataConclusao}</td>
                     <td className="p-4 font-bold text-sky-600">{c.score}%</td>
                     <td className="p-4">
                       {c.status === "Concluído" ? (
                         <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1 w-max">
                           <Check className="w-3.5 h-3.5" /> OK
                         </span>
                       ) : (
                         <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-700 rounded-full flex items-center gap-1 w-max">
                           <AlertTriangle className="w-3.5 h-3.5" /> Alerta
                         </span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           </>
           )}
         </div>
      )}

      
      {activeTab === "financeiro" && !selectedClient && (
        <div className="space-y-6">
          <div className="card-modern rounded-3xl p-6 border border-slate-200 shadow-sm bg-white overflow-hidden">
            <h2 className="text-xl font-black text-slate-800 mb-6">Acompanhamento Financeiro (Primeiros 3 Meses)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">1º Mês</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">2º Mês</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">3º Mês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 text-sm">{c.nome}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{c.plano}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`https://wa.me/${c.telefone?.replace(/\\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-sky-600 transition-colors">
                            {c.telefone || "-"}
                          </a>
                        </div>
                      </td>
                      {[1, 2, 3].map(mes => (
                        <td key={mes} className="p-3">
                          <select
                            className={`text-xs font-bold rounded-lg px-2 py-1.5 border outline-none cursor-pointer ${
                              c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] === 'Pago' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] === 'Em Atraso' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] === 'Enviado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                            value={c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] || ''}
                            onChange={(e) => {
                              const newCheck = { ...c.checklist, [['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]]: e.target.value };
                              setClientes(prev => prev.map(cl => cl.id === c.id ? { ...cl, checklist: newCheck } : cl));
                              
                              // Trigger update to API (optimistic)
                              fetch('/api/pos-vendas/' + encodeURIComponent(c.id), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ checklist: newCheck })
                              }).catch(() => console.error("Falha ao salvar financeiro"));
                            }}
                          >
                            <option value="">-</option>
                            <option value="Pago">Pago</option>
                            <option value="Em Atraso">Atraso</option>
                            <option value="Enviado">Enviado</option>
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
