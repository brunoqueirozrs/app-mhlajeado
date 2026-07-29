import React, { useState, useEffect } from "react";
import { 
  CheckCircle, CheckSquare, Check, X, AlertTriangle, 
  MessageSquare, UserCheck, Calendar, Search, 
  Filter, ChevronRight, Phone, MapPin, 
  Wifi, Smartphone, ThumbsUp, HelpCircle, RefreshCw, Zap, Loader2, AlertCircle,
  ExternalLink, ShieldAlert, ShieldCheck, Activity, Copy
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
  statusSva?: string;
  statusIndicacaoEnvio?: string;
  dataHoraSva?: string;
  dataHoraIndicacao?: string;
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

export interface AtenuacaoAnalysis {
  status: "Excelente" | "Boa" | "Atenção" | "Crítica" | "Offline" | "Sem Comunicação com a OLT" | "Aguardando Leitura";
  indicator: string;
  badgeBg: string;
  badgeBorder: string;
  cardBg: string;
  cardBorder: string;
  inputBorderOnu: string;
  inputBorderOlt: string;
  saudePerc: number | null;
  saudeStr: string;
  diferenca: number | null;
  diferencaStr: string;
  motivos: string[];
  qualidade: "EXCELENTE" | "BOA" | "ATENCAO" | "CRITICA" | "OFFLINE" | "SEM_COMUNICACAO" | "INCOMPLETO";
}

export function analisarAtenuacaoFibra(rxOnuRaw: string, rxOltRaw: string): AtenuacaoAnalysis {
  const onuVal = (rxOnuRaw || "").trim();
  const oltVal = (rxOltRaw || "").trim();

  // 1. ONU sem energia / vazia
  const onuNormalized = onuVal.toLowerCase();
  if (!onuVal || onuNormalized.includes("sem energia") || onuNormalized === "offline") {
    return {
      status: "Offline",
      indicator: "⚫",
      badgeBg: "bg-slate-200 text-slate-800",
      badgeBorder: "border-slate-300",
      cardBg: "bg-slate-50",
      cardBorder: "border-slate-200",
      inputBorderOnu: "border-slate-300 focus:border-slate-400",
      inputBorderOlt: "border-slate-200 focus:border-sky-500",
      saudePerc: 0,
      saudeStr: "0%",
      diferenca: null,
      diferencaStr: "N/A",
      motivos: ["ONU sem energia."],
      qualidade: "OFFLINE"
    };
  }

  // 2. OLT sem leitura / N/A
  const oltNormalized = oltVal.toUpperCase();
  if (!oltVal || oltNormalized.includes("N/A") || oltVal.toLowerCase().includes("sem comunicação") || oltVal.toLowerCase().includes("sem comunicacao")) {
    return {
      status: "Sem Comunicação com a OLT",
      indicator: "🔵",
      badgeBg: "bg-blue-100 text-blue-800",
      badgeBorder: "border-blue-300",
      cardBg: "bg-blue-50/50",
      cardBorder: "border-blue-200",
      inputBorderOnu: "border-slate-200 focus:border-sky-500",
      inputBorderOlt: "border-blue-300 focus:border-blue-400",
      saudePerc: null,
      saudeStr: "N/A",
      diferenca: null,
      diferencaStr: "N/A",
      motivos: ["ONU sem comunicação com a OLT."],
      qualidade: "SEM_COMUNICACAO"
    };
  }

  // Parse numeric values
  const rxOnu = parseFloat(onuVal.replace(',', '.'));
  const rxOlt = parseFloat(oltVal.replace(',', '.'));

  if (isNaN(rxOnu) || isNaN(rxOlt)) {
    return {
      status: "Aguardando Leitura",
      indicator: "⚪",
      badgeBg: "bg-slate-100 text-slate-600",
      badgeBorder: "border-slate-200",
      cardBg: "bg-slate-50",
      cardBorder: "border-slate-200",
      inputBorderOnu: "border-slate-200 focus:border-sky-500",
      inputBorderOlt: "border-slate-200 focus:border-sky-500",
      saudePerc: null,
      saudeStr: "-",
      diferenca: null,
      diferencaStr: "-",
      motivos: [],
      qualidade: "INCOMPLETO"
    };
  }

  // 3. Diferença |RX ONU - RX OLT|
  const diferenca = Math.abs(rxOnu - rxOlt);
  const diferencaStr = `${diferenca.toFixed(2).replace('.', ',')} dBm`;

  const motivos: string[] = [];

  // Regra: RX ONU < -27 dBm
  if (rxOnu < -27) {
    motivos.push("RX ONU fora do padrão (-27 dBm ou mais atenuado).");
  }

  // Regra: RX OLT < -27 dBm
  if (rxOlt < -27) {
    motivos.push("RX OLT fora do padrão (-27 dBm ou mais atenuado).");
  }

  // Regra: Diferença > 4 dBm
  if (diferenca > 4) {
    motivos.push("Diferença entre RX ONU e RX OLT superior a 4 dBm.");
  }

  const isOnuCritica = rxOnu < -27;
  const isOltCritica = rxOlt < -27;
  const isDiffCritica = diferenca > 4;

  const isOnuAtencao = rxOnu >= -27 && rxOnu <= -26;
  const isOltAtencao = rxOlt >= -27 && rxOlt <= -26;
  const isDiffAtencao = diferenca >= 3 && diferenca <= 4;

  // Classificação
  // 🔴 Crítica: RX ONU < -27 OU RX OLT < -27 OU Diferença > 4
  if (isOnuCritica || isOltCritica || isDiffCritica) {
    let saude = 65;
    if (isOnuCritica) saude -= Math.round(Math.abs(-27 - rxOnu) * 10);
    if (isOltCritica) saude -= Math.round(Math.abs(-27 - rxOlt) * 10);
    if (isDiffCritica) saude -= Math.round((diferenca - 4) * 10);
    saude = Math.max(10, Math.min(69, saude));

    return {
      status: "Crítica",
      indicator: "🔴",
      badgeBg: "bg-rose-100 text-rose-800",
      badgeBorder: "border-rose-300",
      cardBg: "bg-rose-50/70",
      cardBorder: "border-rose-300",
      inputBorderOnu: isOnuCritica ? "border-2 border-rose-500 focus:border-rose-600 bg-rose-50/60 text-rose-900 font-bold shadow-sm" : (isOnuAtencao ? "border-2 border-amber-400 focus:border-amber-500 bg-amber-50/40 text-amber-900" : "border-slate-200 focus:border-sky-500"),
      inputBorderOlt: isOltCritica ? "border-2 border-rose-500 focus:border-rose-600 bg-rose-50/60 text-rose-900 font-bold shadow-sm" : (isOltAtencao ? "border-2 border-amber-400 focus:border-amber-500 bg-amber-50/40 text-amber-900" : "border-slate-200 focus:border-sky-500"),
      saudePerc: saude,
      saudeStr: `${saude}%`,
      diferenca,
      diferencaStr,
      motivos,
      qualidade: "CRITICA"
    };
  }

  // 🟡 Atenção: RX ONU entre -26 e -27 OU RX OLT entre -26 e -27 OU Diferença entre 3 e 4
  if (isOnuAtencao || isOltAtencao || isDiffAtencao) {
    if (isOnuAtencao) {
      motivos.push("RX ONU em nível de atenção (entre -26 dBm e -27 dBm).");
    }
    if (isOltAtencao) {
      motivos.push("RX OLT em nível de atenção (entre -26 dBm e -27 dBm).");
    }
    if (isDiffAtencao) {
      motivos.push("Diferença entre RX ONU e RX OLT em limite de atenção (entre 3 dBm e 4 dBm).");
    }

    return {
      status: "Atenção",
      indicator: "🟡",
      badgeBg: "bg-amber-100 text-amber-800",
      badgeBorder: "border-amber-300",
      cardBg: "bg-amber-50/70",
      cardBorder: "border-amber-300",
      inputBorderOnu: isOnuAtencao ? "border-2 border-amber-400 focus:border-amber-500 bg-amber-50/30 text-amber-900 font-semibold" : "border-slate-200 focus:border-sky-500",
      inputBorderOlt: isOltAtencao ? "border-2 border-amber-400 focus:border-amber-500 bg-amber-50/30 text-amber-900 font-semibold" : "border-slate-200 focus:border-sky-500",
      saudePerc: 78,
      saudeStr: "78%",
      diferenca,
      diferencaStr,
      motivos,
      qualidade: "ATENCAO"
    };
  }

  // 🟢 Boa: RX ONU entre -24 e -26 e Diferença <= 3
  if (rxOnu >= -26 && rxOnu <= -24) {
    return {
      status: "Boa",
      indicator: "🟢",
      badgeBg: "bg-emerald-100 text-emerald-800",
      badgeBorder: "border-emerald-300",
      cardBg: "bg-emerald-50/40",
      cardBorder: "border-emerald-200",
      inputBorderOnu: "border-slate-200 focus:border-sky-500",
      inputBorderOlt: "border-slate-200 focus:border-sky-500",
      saudePerc: 90,
      saudeStr: "90%",
      diferenca,
      diferencaStr,
      motivos: [],
      qualidade: "BOA"
    };
  }

  // 🟢 Excelente
  return {
    status: "Excelente",
    indicator: "🟢",
    badgeBg: "bg-emerald-200 text-emerald-900",
    badgeBorder: "border-emerald-400",
    cardBg: "bg-emerald-50/70",
    cardBorder: "border-emerald-300",
    inputBorderOnu: "border-slate-200 focus:border-sky-500",
    inputBorderOlt: "border-slate-200 focus:border-sky-500",
    saudePerc: 98,
    saudeStr: "98%",
    diferenca,
    diferencaStr,
    motivos: [],
    qualidade: "EXCELENTE"
  };
}

const formatBRDate = (val: string) => {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return val;
};

function formatDateString(val: string): string {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    const [y, m, d] = val.trim().split("-");
    return `${d}/${m}/${y}`;
  }

  const digits = val.replace(/\D/g, "");
  if (!digits) return val;

  if (digits.length === 6) {
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = "20" + digits.slice(4, 6);
    return `${day}/${month}/${year}`;
  }

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export default function PosVendaPage({ loggedUser, isAdmin }: { loggedUser?: string, isAdmin?: boolean }) {
  const [activeTab, setActiveTab] = useState<"pendentes" | "base_ativa" | "financeiro" | "vendas_sva" | "indicacoes">("pendentes");
  const [months, setMonths] = useState<{ value: string, label: string }[]>([]);
  const [selectedMes, setSelectedMes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<ClientPosVenda[]>([]);
  const [sendingSvaState, setSendingSvaState] = useState<Record<string, { status: "loading" | "success" | "error", message?: string }>>({});
  const [selectedSvaIds, setSelectedSvaIds] = useState<Set<string>>(new Set());
  const [isDispatchingSva, setIsDispatchingSva] = useState(false);
  const [selectedIndicacoesIds, setSelectedIndicacoesIds] = useState<Set<string>>(new Set());
  const [isDispatchingIndicacoes, setIsDispatchingIndicacoes] = useState(false);
  const [sendingIndicacoesState, setSendingIndicacoesState] = useState<Record<string, { status: "loading" | "success" | "error", message?: string }>>({});
  const [selectedClient, setSelectedClient] = useState<ClientPosVenda | null>(null);
  const [checklist, setChecklist] = useState<any>(checklistsDefault);
  const [vendedoraFilter, setVendedoraFilter] = useState(isAdmin ? "Todas" : (loggedUser || "Todas"));
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNameId, setCopiedNameId] = useState<string | null>(null);

  const handleCopyName = (e: React.MouseEvent, name: string, id?: string) => {
    e.stopPropagation();
    if (!name) return;
    navigator.clipboard.writeText(name);
    setCopiedNameId(id || name);
    setTimeout(() => setCopiedNameId(null), 2000);
  };

  const [confirmState, setConfirmState] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void;}>({
    isOpen: false, title: "", message: "", onConfirm: () => {}
  });



  
  const handleSendIndicacao = async (client: ClientPosVenda) => {
    if (sendingIndicacoesState[client.id]?.status === 'loading') return;
    setSendingIndicacoesState(prev => ({ ...prev, [client.id]: { status: 'loading' } }));
    
    try {
      const res = await fetch("/api/n8n/webhook-indicacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cliente: { 
            nome: client.nome, 
            telefone: client.telefone, 
            plano: client.plano 
          } 
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Erro na comunicação com o servidor.");
      }
      
      setSendingIndicacoesState(prev => ({ ...prev, [client.id]: { status: 'success' } }));
      
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 3000);
      
    } catch (e: any) {
      const errMsg = e.message || "Erro desconhecido";
      setSendingIndicacoesState(prev => ({ ...prev, [client.id]: { status: 'error', message: errMsg } }));
      
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 5000);
    }
  };

  const handleSendIndicacaoIndividual = async (client: ClientPosVenda) => {
    if (sendingIndicacoesState[client.id]?.status === 'loading') return;
    setSendingIndicacoesState(prev => ({ ...prev, [client.id]: { status: 'loading' } }));
    const nowFormatted = new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

    try {
      const res = await fetch("/api/pos-vendas/disparar-indicacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientes: [client] })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Erro na comunicação com o servidor.");
      }
      
      setSendingIndicacoesState(prev => ({ ...prev, [client.id]: { status: 'success' } }));
      setClientes(prev => prev.map(c => c.id === client.id ? { ...c, statusIndicacaoEnvio: "Em Fila", dataHoraIndicacao: nowFormatted } : c));
      
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 5000);
      
    } catch (err: any) {
      setSendingIndicacoesState(prev => ({ 
        ...prev, 
        [client.id]: { status: 'error', message: err.message || "Erro desconhecido" } 
      }));
      
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 5000);
    }
  };

  const handleBulkSendIndicacao = async () => {
    if (selectedIndicacoesIds.size === 0) return;
    const selectedClients = clientes.filter(c => selectedIndicacoesIds.has(c.id));
    setIsDispatchingIndicacoes(true);
    const nowFormatted = new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    
    setSendingIndicacoesState(prev => {
      const newState = { ...prev };
      selectedClients.forEach(c => {
        newState[c.id] = { status: 'loading' };
      });
      return newState;
    });

    try {
      const res = await fetch("/api/pos-vendas/disparar-indicacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientes: selectedClients })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Erro na comunicação com o servidor.");
      }
      
      setSendingIndicacoesState(prev => {
        const newState = { ...prev };
        selectedClients.forEach(c => {
          newState[c.id] = { status: 'success' };
        });
        return newState;
      });
      
      setClientes(prev => prev.map(c => selectedIndicacoesIds.has(c.id) ? { ...c, statusIndicacaoEnvio: "Em Fila", dataHoraIndicacao: nowFormatted } : c));
      setSelectedIndicacoesIds(new Set());
      
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          selectedClients.forEach(c => delete newState[c.id]);
          return newState;
        });
        if (selectedMes) fetchData(selectedMes);
      }, 3000);
      
    } catch (e: any) {
      const errMsg = e.message || "Erro desconhecido";
      setSendingIndicacoesState(prev => {
        const newState = { ...prev };
        selectedClients.forEach(c => {
          newState[c.id] = { status: 'error', message: errMsg };
        });
        return newState;
      });
      
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          selectedClients.forEach(c => delete newState[c.id]);
          return newState;
        });
      }, 5000);
    } finally {
      setIsDispatchingIndicacoes(false);
    }
  };

  const handleBulkSendSva = async () => {
    if (selectedSvaIds.size === 0) return;
    const selectedClients = clientes.filter(c => selectedSvaIds.has(c.id));
    setIsDispatchingSva(true);
    const nowFormatted = new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    
    // Set individual loading states for better UX
    setSendingSvaState(prev => {
      const newState = { ...prev };
      selectedClients.forEach(c => {
        newState[c.id] = { status: 'loading' };
      });
      return newState;
    });

    try {
      const res = await fetch("/api/pos-vendas/disparar-sva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientes: selectedClients })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Erro na comunicação com o servidor.");
      }
      
      // Mark as success and clear selection
      setSendingSvaState(prev => {
        const newState = { ...prev };
        selectedClients.forEach(c => {
          newState[c.id] = { status: 'success' };
        });
        return newState;
      });
      
      setClientes(prev => prev.map(c => selectedSvaIds.has(c.id) ? { ...c, statusSva: "Em Fila", dataHoraSva: nowFormatted } : c));
      setSelectedSvaIds(new Set());
      
      // Auto-clear success state
      setTimeout(() => {
        setSendingSvaState(prev => {
          const newState = { ...prev };
          selectedClients.forEach(c => delete newState[c.id]);
          return newState;
        });
        if (selectedMes) fetchData(selectedMes); // Refresh to get statusEnvio
      }, 3000);
      
    } catch (e: any) {
      const errMsg = e.message || "Erro desconhecido";
      setSendingSvaState(prev => {
        const newState = { ...prev };
        selectedClients.forEach(c => {
          newState[c.id] = { status: 'error', message: errMsg };
        });
        return newState;
      });
      
      setTimeout(() => {
        setSendingSvaState(prev => {
          const newState = { ...prev };
          selectedClients.forEach(c => delete newState[c.id]);
          return newState;
        });
      }, 5000);
    } finally {
      setIsDispatchingSva(false);
    }
  };

  const handleSendSva = async (client: ClientPosVenda) => {
    if (sendingSvaState[client.id]?.status === 'loading') return;
    setSendingSvaState(prev => ({ ...prev, [client.id]: { status: 'loading' } }));
    const nowFormatted = new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    
    try {
      const res = await fetch("/api/n8n/webhook-vendas-sva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cliente: { 
            id: client.id,
            nome: client.nome, 
            telefone: client.telefone, 
            plano: client.plano 
          } 
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Erro na comunicação com o servidor.");
      }
      
      setSendingSvaState(prev => ({ ...prev, [client.id]: { status: 'success' } }));
      setClientes(prev => prev.map(c => c.id === client.id ? { ...c, statusSva: "Em Fila", dataHoraSva: nowFormatted } : c));
      
      // Auto-clear success state after 3 seconds
      setTimeout(() => {
        setSendingSvaState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 3000);
      
    } catch (e: any) {
      const errMsg = e.message || "Erro desconhecido";
      setSendingSvaState(prev => ({ ...prev, [client.id]: { status: 'error', message: errMsg } }));
      
      // Auto-clear error state after 5 seconds
      setTimeout(() => {
        setSendingSvaState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 5000);
    }
  };

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
    const initialCidade = c.checklist?.cidade || c.cidade || "";
    const initialBairro = c.checklist?.bairro || c.bairro || "";
    if (c.checklist) {
      setChecklist({
        ...checklistsDefault,
        ...c.checklist,
        cidade: initialCidade,
        bairro: initialBairro,
        observacao: c.observacoes || c.checklist.observacao || ""
      });
    } else {
      setChecklist({
        ...checklistsDefault, 
        cpf: c.cpf || "",
        cidade: initialCidade,
        bairro: initialBairro,
        atenuacaoRxOnu: c.rx_onu || "",
        atenuacaoRxOlt: c.rx_olt || "",
        observacao: c.observacoes || ""
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
          const res = await fetch("/api/n8n/webhook-vendas-sva", {
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
      c.cidade = checklist.cidade || selectedClient.cidade || c.cidade || "";
      c.bairro = checklist.bairro || selectedClient.bairro || c.bairro || "";
      c.cpf = checklist.cpf || selectedClient.cpf || c.cpf || "";
      c.checklist = {
        ...checklist,
        cidade: c.cidade,
        bairro: c.bairro,
        cpf: c.cpf
      };
      c.dataInstalacao = selectedClient.dataInstalacao || c.dataInstalacao;
      c.observacoes = selectedClient.observacoes || checklist.observacao || c.observacoes;
      c.nome = selectedClient.nome || c.nome;
      c.telefone = selectedClient.telefone || c.telefone;
      c.endereco = selectedClient.endereco || c.endereco;
      c.rx_onu = checklist.atenuacaoRxOnu || c.rx_onu;
      c.rx_olt = checklist.atenuacaoRxOlt || c.rx_olt;
      
      const analiseFibra = analisarAtenuacaoFibra(checklist.atenuacaoRxOnu, checklist.atenuacaoRxOlt);

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
        
        if (checklist.abriuChamado === "Sim" || checklist.percepcaoCliente?.toLowerCase().includes("ruim") || analiseFibra.qualidade === "CRITICA") {
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
            isConcluido: isComplete,
            // Client details for Base de Clientes
            nome: c.nome,
            plano: c.plano,
            dataInstalacao: c.dataInstalacao,
            endereco: c.endereco,
            telefone: c.telefone,
            vendedora: c.vendedora,
            cidade: c.cidade || checklist.cidade,
            bairro: c.bairro || checklist.bairro,
            cpf: checklist.cpf
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
      if (!cVend.includes(vFilter) && !vFilter.includes(cVend)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNome = c.nome?.toLowerCase().includes(q);
      const matchTelefone = c.telefone?.toLowerCase().includes(q);
      const matchEndereco = c.endereco?.toLowerCase().includes(q);
      const matchCidade = c.cidade?.toLowerCase().includes(q) || c.checklist?.cidade?.toLowerCase().includes(q);
      const matchBairro = c.bairro?.toLowerCase().includes(q) || c.checklist?.bairro?.toLowerCase().includes(q);
      const matchCpf = c.cpf?.toLowerCase().includes(q) || c.checklist?.cpf?.toLowerCase().includes(q);
      if (!matchNome && !matchTelefone && !matchEndereco && !matchCidade && !matchBairro && !matchCpf) {
        return false;
      }
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
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => {
          confirmState.onConfirm();
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
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
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Buscar cliente, cidade, bairro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div 
                className="group relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 cursor-help flex-shrink-0"
                title="Filtros no Google Sheets: Se alguém usar um 'Filtro' comum na planilha, os dados ocultados não aparecerão aqui. Use sempre 'Visualizações de Filtro' (Filter Views)!"
              >
                <AlertCircle className="w-5 h-5" />
                <div className="pointer-events-none absolute bottom-full mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 left-1/2 -translate-x-1/2 text-center">
                  <p className="font-bold mb-1">Filtros no Google Sheets</p>
                  <p>O sistema importa apenas o que está visível. Se um filtro comum for ativado na planilha base, os clientes vão sumir daqui.</p>
                  <p className="mt-2 text-amber-300 font-bold">Dica: Oriente a equipe a usar "Visualizações de Filtro". Elas não afetam o sistema!</p>
                </div>
              </div>
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
            <button 
              onClick={() => setActiveTab("vendas_sva")}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'vendas_sva' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Vendas SVA
            </button>
            <button 
              onClick={() => setActiveTab("indicacoes")}
              className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === 'indicacoes' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Indicações
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-lg">{c.nome}</h3>
                        <button 
                          onClick={(e) => handleCopyName(e, c.nome, c.id)}
                          className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                          title="Copiar Nome"
                        >
                          {copiedNameId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                        <Phone className="w-3 h-3" /> {c.telefone}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${c.status === 'Pendente' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {c.endereco}{c.bairro ? ` - ${c.bairro}` : ''}{c.cidade ? ` (${c.cidade})` : ''}</div>
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
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-black">{selectedClient.nome}</h2>
                <button 
                  onClick={(e) => handleCopyName(e, selectedClient.nome, selectedClient.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 active:scale-95 shadow-sm"
                  title="Copiar Nome do Cliente"
                >
                  {copiedNameId === (selectedClient.id || selectedClient.nome) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Nome Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Nome</span>
                    </>
                  )}
                </button>
              </div>
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
                  <input 
                    type="text" 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" 
                    value={checklist.cidade || ""} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setChecklist({...checklist, cidade: val});
                      if (selectedClient) setSelectedClient({...selectedClient, cidade: val});
                    }} 
                    placeholder="Ex: Lajeado" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
                  <input 
                    type="text" 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" 
                    value={checklist.bairro || ""} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setChecklist({...checklist, bairro: val});
                      if (selectedClient) setSelectedClient({...selectedClient, bairro: val});
                    }} 
                    placeholder="Ex: Centro" 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-sky-600 flex items-center gap-2">
                  <span className="bg-sky-100 w-6 h-6 flex items-center justify-center rounded-lg text-sky-700">2</span>
                  Dados Técnicos (Atenuação)
                </h4>
                <a 
                  href="https://sig.mhnet.com.br/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors shadow-sm"
                  title="Acessar o sistema SIG MHNET em uma nova aba"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  Acessar SIG MHNET
                </a>
              </div>

              {(() => {
                const analise = analisarAtenuacaoFibra(checklist.atenuacaoRxOnu, checklist.atenuacaoRxOlt);
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500 uppercase">Rx ONU (dBm)</label>
                          <button 
                            type="button"
                            onClick={() => setChecklist({...checklist, atenuacaoRxOnu: "Sem Energia"})}
                            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline"
                          >
                            Sem Energia
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className={`bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${analise.inputBorderOnu}`} 
                          value={checklist.atenuacaoRxOnu || ""} 
                          onChange={(e) => setChecklist({...checklist, atenuacaoRxOnu: e.target.value})} 
                          placeholder="Ex: -25,63 ou Sem Energia" 
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-500 uppercase">Rx OLT (dBm)</label>
                          <button 
                            type="button"
                            onClick={() => setChecklist({...checklist, atenuacaoRxOlt: "N/A"})}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 underline"
                          >
                            N/A (Sem Leitura)
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className={`bg-slate-50 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${analise.inputBorderOlt}`} 
                          value={checklist.atenuacaoRxOlt || ""} 
                          onChange={(e) => setChecklist({...checklist, atenuacaoRxOlt: e.target.value})} 
                          placeholder="Ex: -23,84 ou N/A" 
                        />
                      </div>
                    </div>

                    {/* Card da Análise e Diagnóstico da Fibra */}
                    <div className={`p-4 rounded-xl border ${analise.cardBorder} ${analise.cardBg} transition-all space-y-3`}>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl leading-none">{analise.indicator}</span>
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status da Conexão</div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${analise.badgeBg} ${analise.badgeBorder}`}>
                              {analise.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Diferença (ONU x OLT)</div>
                            <div className="text-sm font-black text-slate-800">{analise.diferencaStr}</div>
                          </div>

                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Saúde da Fibra</div>
                            <div className="text-sm font-black text-slate-800">{analise.saudeStr}</div>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso da Saúde da Fibra */}
                      {analise.saudePerc !== null && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                analise.qualidade === "EXCELENTE" || analise.qualidade === "BOA" ? "bg-emerald-500" :
                                analise.qualidade === "ATENCAO" ? "bg-amber-500" :
                                analise.qualidade === "CRITICA" ? "bg-rose-500" : "bg-slate-400"
                              }`}
                              style={{ width: `${analise.saudePerc}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Motivos Específicos e Diagnóstico Técnico */}
                      {analise.motivos.length > 0 && (
                        <div className={`p-3 rounded-lg text-xs font-medium border flex items-start gap-2.5 ${
                          analise.qualidade === "CRITICA" ? "bg-rose-100/90 text-rose-900 border-rose-300" :
                          analise.qualidade === "ATENCAO" ? "bg-amber-100/90 text-amber-900 border-amber-300" :
                          analise.qualidade === "OFFLINE" ? "bg-slate-200/90 text-slate-800 border-slate-300" :
                          "bg-blue-100/90 text-blue-900 border-blue-300"
                        }`}>
                          <ShieldAlert className="w-4 h-4 text-current shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-extrabold uppercase tracking-wider text-[10px]">Diagnóstico Técnico / Motivo(s):</div>
                            <ul className="list-disc list-inside space-y-0.5 font-semibold">
                              {analise.motivos.map((motivo, idx) => (
                                <li key={idx}>{motivo}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
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

            <section className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest text-sky-600 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="bg-sky-100 w-6 h-6 flex items-center justify-center rounded-lg text-sky-700">5</span>
                Instalação & Observação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data de Instalação</label>
                  <input 
                    type="text" 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500" 
                    value={selectedClient.dataInstalacao || ""} 
                    onChange={(e) => {
                      const formatted = formatDateString(e.target.value);
                      setSelectedClient({...selectedClient, dataInstalacao: formatted});
                    }}
                    onBlur={(e) => {
                      const formatted = formatDateString(e.target.value);
                      setSelectedClient({...selectedClient, dataInstalacao: formatted});
                    }} 
                    placeholder="Ex: 10/06/2026" 
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Observações do Pós-Venda</label>
                  <textarea 
                    rows={3}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500 resize-none" 
                    value={selectedClient.observacoes || checklist.observacao || ""} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedClient({...selectedClient, observacoes: val});
                      setChecklist({...checklist, observacao: val});
                    }} 
                    placeholder="Digite uma pequena observação referente a esta instalação ou cliente..." 
                  />
                </div>
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
                     <td className="p-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{c.nome}</span>
                          <button 
                            onClick={(e) => handleCopyName(e, c.nome, c.id)}
                            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                            title="Copiar Nome"
                          >
                            {copiedNameId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
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

      

      {activeTab === "vendas_sva" && !selectedClient && (
        <div className="space-y-6">
          <div className="card-modern rounded-3xl p-6 border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Vendas SVA (Celular, Câmeras, MhPlay)</h2>
              <button 
                onClick={() => {
                  if (selectedSvaIds.size === 0) {
                    alert("Selecione pelo menos um cliente para disparar.");
                    return;
                  }
                  requestConfirm("Disparo em Massa (SVA)", `Deseja enviar SVA para ${selectedSvaIds.size} clientes selecionados?`, handleBulkSendSva);
                }}
                disabled={isDispatchingSva || selectedSvaIds.size === 0}
                className={`${isDispatchingSva || selectedSvaIds.size === 0 ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition`}
              >
                {isDispatchingSva ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isDispatchingSva ? 'Disparando...' : `Disparo em Massa (${selectedSvaIds.size})`}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        checked={filteredClientes.length > 0 && selectedSvaIds.size === filteredClientes.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSvaIds(new Set(filteredClientes.map(c => c.id)));
                          } else {
                            setSelectedSvaIds(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano Contratado</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Confirmação de Envio</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Último Envio</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientes.map(c => (
                    <tr key={c.id} className={`hover:bg-slate-50 transition-colors ${selectedSvaIds.has(c.id) ? 'bg-sky-50/50' : ''}`}>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                          checked={selectedSvaIds.has(c.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedSvaIds);
                            if (e.target.checked) newSet.add(c.id);
                            else newSet.delete(c.id);
                            setSelectedSvaIds(newSet);
                          }}
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-800 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{c.nome}</span>
                          <button 
                            onClick={(e) => handleCopyName(e, c.nome, c.id)}
                            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                            title="Copiar Nome"
                          >
                            {copiedNameId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">{c.telefone || "-"}</td>
                      <td className="p-3 text-sm text-slate-600">{c.plano}</td>
                      <td className="p-3 text-center">
                        {c.statusSva ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            c.statusSva.toLowerCase().includes('fila') ? 'bg-amber-100 text-amber-700' :
                            c.statusSva.toLowerCase().includes('enviado') || c.statusSva.toLowerCase().includes('sucesso') || c.statusSva.toLowerCase().trim() === 'ok' ? 'bg-emerald-100 text-emerald-700' :
                            c.statusSva.toLowerCase().includes('erro') || c.statusSva.toLowerCase().includes('falha') ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {c.statusSva}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                        {c.dataHoraSva ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {c.dataHoraSva}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end gap-1 ml-auto">
                          <button 
                            onClick={() => handleSendSva(c)}
                            disabled={sendingSvaState[c.id]?.status === 'loading' || sendingSvaState[c.id]?.status === 'success'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              sendingSvaState[c.id]?.status === 'loading' ? 'bg-sky-100/50 text-sky-700/50 cursor-not-allowed' : 
                              sendingSvaState[c.id]?.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                              sendingSvaState[c.id]?.status === 'error' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' :
                              'bg-sky-100 text-sky-700 hover:bg-sky-200'
                            }`}
                          >
                            {sendingSvaState[c.id]?.status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                             sendingSvaState[c.id]?.status === 'success' ? <CheckCircle className="w-3.5 h-3.5 animate-in zoom-in" /> :
                             sendingSvaState[c.id]?.status === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                             <Zap className="w-3.5 h-3.5" />}
                             
                            {sendingSvaState[c.id]?.status === 'loading' ? 'Enviando...' : 
                             sendingSvaState[c.id]?.status === 'success' ? 'Enviado!' :
                             sendingSvaState[c.id]?.status === 'error' ? 'Tentar Novamente' :
                             'Enviar SVA'}
                          </button>
                          {sendingSvaState[c.id]?.status === 'error' && (
                            <span className="text-[9px] font-bold text-rose-500 animate-in fade-in">
                              Motivo: {sendingSvaState[c.id]?.message}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "indicacoes" && !selectedClient && (
        <div className="space-y-6">
          <div className="card-modern rounded-3xl p-6 border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Solicitação de Indicações</h2>
              <button 
                onClick={() => {
                  if (selectedIndicacoesIds.size === 0) {
                    alert("Selecione pelo menos um cliente para disparar.");
                    return;
                  }
                  requestConfirm("Disparo em Massa (Indicações)", `Deseja enviar solicitações de indicação para ${selectedIndicacoesIds.size} clientes selecionados?`, handleBulkSendIndicacao);
                }}
                disabled={isDispatchingIndicacoes || selectedIndicacoesIds.size === 0}
                className={`${isDispatchingIndicacoes || selectedIndicacoesIds.size === 0 ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition`}
              >
                {isDispatchingIndicacoes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isDispatchingIndicacoes ? 'Disparando...' : `Disparo em Massa (${selectedIndicacoesIds.size})`}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        checked={filteredClientes.length > 0 && selectedIndicacoesIds.size === filteredClientes.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndicacoesIds(new Set(filteredClientes.map(c => c.id)));
                          } else {
                            setSelectedIndicacoesIds(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status de Envio</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Último Envio</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          checked={selectedIndicacoesIds.has(c.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedIndicacoesIds);
                            if (e.target.checked) newSet.add(c.id);
                            else newSet.delete(c.id);
                            setSelectedIndicacoesIds(newSet);
                          }}
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-800 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{c.nome}</span>
                          <button 
                            onClick={(e) => handleCopyName(e, c.nome, c.id)}
                            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                            title="Copiar Nome"
                          >
                            {copiedNameId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600">{c.telefone || "-"}</td>
                      <td className="p-3 text-sm text-slate-600">{c.plano}</td>
                      <td className="p-3 text-center">
                        {c.statusIndicacaoEnvio ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            c.statusIndicacaoEnvio.toLowerCase().includes('fila') ? 'bg-amber-100 text-amber-700' :
                            c.statusIndicacaoEnvio.toLowerCase().includes('enviado') || c.statusIndicacaoEnvio.toLowerCase().includes('sucesso') || c.statusIndicacaoEnvio.toLowerCase() === 'ok' ? 'bg-emerald-100 text-emerald-700' :
                            c.statusIndicacaoEnvio.toLowerCase().includes('erro') || c.statusIndicacaoEnvio.toLowerCase().includes('falha') ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {c.statusIndicacaoEnvio}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                        {c.dataHoraIndicacao ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {c.dataHoraIndicacao}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end gap-1 ml-auto">
                          <button 
                            onClick={() => handleSendIndicacaoIndividual(c)}
                            disabled={sendingIndicacoesState[c.id]?.status === 'loading' || sendingIndicacoesState[c.id]?.status === 'success'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                              sendingIndicacoesState[c.id]?.status === 'loading' ? 'bg-emerald-100/50 text-emerald-700/50 cursor-not-allowed' : 
                              sendingIndicacoesState[c.id]?.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                              sendingIndicacoesState[c.id]?.status === 'error' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' :
                              'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                          >
                            {sendingIndicacoesState[c.id]?.status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                             sendingIndicacoesState[c.id]?.status === 'success' ? <CheckCircle className="w-3.5 h-3.5 animate-in zoom-in" /> :
                             sendingIndicacoesState[c.id]?.status === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                             <UserCheck className="w-3.5 h-3.5" />}
                            {sendingIndicacoesState[c.id]?.status === 'loading' ? 'Enviando...' :
                             sendingIndicacoesState[c.id]?.status === 'success' ? 'Solicitado' :
                             sendingIndicacoesState[c.id]?.status === 'error' ? 'Erro' :
                             'Solicitar'}
                          </button>
                          {sendingIndicacoesState[c.id]?.status === 'error' && (
                            <span className="text-[10px] text-rose-500 font-medium">
                              {sendingIndicacoesState[c.id]?.message}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-800 text-sm">{c.nome}</div>
                          <button 
                            onClick={(e) => handleCopyName(e, c.nome, c.id)}
                            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                            title="Copiar Nome"
                          >
                            {copiedNameId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
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
