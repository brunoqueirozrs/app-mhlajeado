/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, BarChart, History, Filter, Search, ShieldAlert, AlertCircle, Check,
  Smartphone, MessageSquare, ClipboardCheck, Sparkles, Phone, FileText, CheckCircle, ArrowUpRight,
  RefreshCw, BarChart2, UploadCloud, Loader2, Copy, Send, Webhook, Bot, Zap, X
} from "lucide-react";
import { BaseClient, BaseActionLog } from "../types";
import Markdown from "react-markdown";
import ConfirmModal from "./ConfirmModal";

const formatTimeInYearsMonths = (meses: number | undefined) => {
  if (!meses) return "0 meses";
  if (meses < 12) return `${meses} meses`;
  const y = Math.floor(meses / 12);
  const m = meses % 12;
  const yStr = `${y} ${y === 1 ? 'ano' : 'anos'}`;
  const mStr = m > 0 ? ` ${m} ${m === 1 ? 'mês' : 'meses'}` : '';
  return `${yStr}${mStr}`;
};

// Static data fallbacks in case sheet fails
import { FALLBACK_MATERIALS } from "../data";

interface BaseProps {
  clients: BaseClient[];
  actions: BaseActionLog[];
  onRegisterAction: (log: Omit<BaseActionLog, "id" | "dataContato">) => Promise<void>;
  onGenerateIAPitch: (client: BaseClient) => Promise<string>;
  onRefreshBase: () => Promise<void>;
  onFetchBaseLocal?: () => Promise<void>;
  loggedUser?: string;
  isAdmin?: boolean;
}

const normalizeReason = (reason: string | undefined | null) => {
  if (!reason || reason.trim() === "") return "Não informado";
  
  const r = reason.toLowerCase();
  if (r.includes("inadimplência") || r.includes("inadimp") || r.includes("falta de pag") || r.includes("financeiro")) return "Inadimplência";
  if (r.includes("mudança") || r.includes("mudou") || r.includes("fechou") || r.includes("encerrou")) return "Mudança de Endereço/Fechamento";
  if (r.includes("concorrente") || r.includes("operadora") || r.includes("portabilidade") || r.includes("copel") || r.includes("claro") || r.includes("vivo")) return "Concorrência";
  if (r.includes("insatisfação") || r.includes("lentidao") || r.includes("lento") || r.includes("tecnico") || r.includes("suporte") || r.includes("oscilando")) return "Problemas Técnicos/Suporte";
  if (r.includes("inviabilidade") || r.includes("sem viabilidade") || r.includes("porta") || r.includes("distancia")) return "Sem Viabilidade Técnica";
  if (r.includes("falecimento") || r.includes("faleceu") || r.includes("óbito")) return "Falecimento";
  if (r.includes("valor") || r.includes("caro") || r.includes("preco")) return "Insatisfação com Preço";
  if (r.includes("desistiu") || r.includes("desistencia") || r.includes("cancelou")) return "Desistência Cliente";

  // Fallback
  const str = reason.trim();
  if (str.length > 35) return str.substring(0, 32) + "...";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const FastWhatsAppBtn = ({ client, onSend, isSending }: { client: BaseClient, onSend: (client: BaseClient) => void, isSending: boolean }) => {
  const [phone, setPhone] = useState("");
  
  useEffect(() => {
    const localSaved = localStorage.getItem(`cliente_${client.idContrato}_dados`);
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (parsed.whatsapp) {
          setPhone(parsed.whatsapp);
          client.telefoneExterno = parsed.whatsapp;
          return;
        }
      } catch (e) {}
    }
    setPhone(client.telefoneExterno && client.telefoneExterno !== "Não informado" ? client.telefoneExterno : "");
  }, [client.idContrato]); // Remove client.telefoneExterno to prevent cursor jump during edit

    const handleSaveAndSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone || phone.trim() === "") {
      alert("⚠️ Informe o WhatsApp do cliente primeiro!");
      return;
    }
    // Save locally
    localStorage.setItem(`cliente_${client.idContrato}_dados`, JSON.stringify({ whatsapp: phone }));
    client.telefoneExterno = phone;

    if (onSend) {
      onSend(client);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 w-full max-w-[320px]" onClick={e => e.stopPropagation()}>
      <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
        <span className="bg-[#E6FAF1] border-r border-[#00A86B]/20 flex items-center justify-center px-2 shrink-0">
          <svg className="w-3.5 h-3.5 text-[#00A86B]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </span>
        <input 
          type="text" 
          value={phone}
          onChange={e => {
            const val = e.target.value;
            setPhone(val);
            client.telefoneExterno = val;
            localStorage.setItem(`cliente_${client.idContrato}_dados`, JSON.stringify({ whatsapp: val }));
          }}
          placeholder="Número c/ DDD"
          className="w-full text-[10px] p-1.5 outline-none text-slate-700 bg-transparent font-medium"
        />
      </div>
      <button 
        onClick={handleSaveAndSend}
        disabled={isSending}
        title="Enviar whatsapp Loja"
        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg transition-all duration-300 shadow-md text-[10px] font-extrabold overflow-hidden relative ${
          isSending ? "bg-sky-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-500 hover:scale-105 active:scale-95"
        }`}
      >
        <div className="flex items-center gap-1.5 transition-transform duration-300">
          {isSending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Disparo Automático
            </>
          )}
        </div>
      </button>


    </div>
  );
};

export default function BaseManagementPage({
  clients,
  actions,
  onRegisterAction,
  onGenerateIAPitch,
  onRefreshBase,
  onFetchBaseLocal,
  loggedUser = "",
  isAdmin = false
}: BaseProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard_geral" | "clientes" | "dashboard" | "historico" | "manutencao">("clientes");
  
  const [confirmState, setConfirmState] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void;}>({
    isOpen: false, title: "", message: "", onConfirm: () => {}
  });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  
  // Settings
  

  // Filters State
  const [filterConsultor, setFilterConsultor] = useState("");
  const [filterVelocidade, setFilterVelocidade] = useState("");
  const [filterAntiguidade, setFilterAntiguidade] = useState("");
  const [filterOrdem, setFilterOrdem] = useState("score");
  const [filterApenasAtivos, setFilterApenasAtivos] = useState(true);
  const [filterPrioridade, setFilterPrioridade] = useState<string | null>(null);
  const [filterMotivo, setFilterMotivo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlanoExato, setFilterPlanoExato] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 15;

  // Selected item structures
  const [selectedClient, setSelectedClient] = useState<BaseClient | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  
  // Bulk Assign State
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [isBulkTransferOpen, setIsBulkTransferOpen] = useState(false);
  const [targetBulkConsultor, setTargetBulkConsultor] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Register Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerStatus, setRegisterStatus] = useState("");
  const [registerResultado, setRegisterResultado] = useState("");
  const [registerClientStatus, setRegisterClientStatus] = useState("");
  const [registerConsultor, setRegisterConsultor] = useState("");
  const [registerPlanoNovo, setRegisterPlanoNovo] = useState("");
  const [registerValorNovo, setRegisterValorNovo] = useState("");
  const [registerObs, setRegisterObs] = useState("");

  const [aiPlanSuggestions, setAiPlanSuggestions] = useState<any[]>([]);
  const [aiPlanSuggestionsLoading, setAiPlanSuggestionsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedNameId, setCopiedNameId] = useState<string | null>(null);
  const [n8nStatusIndex, setN8nStatusIndex] = useState<number | null>(null);

  // New Verification States
  const [registerGloboplay, setRegisterGloboplay] = useState(false);
  const [registerAvaliacao, setRegisterAvaliacao] = useState(false);
  const [registerSuperApp, setRegisterSuperApp] = useState(false);
  const [registerIndicacao, setRegisterIndicacao] = useState(false);
  const [registerCanais, setRegisterCanais] = useState(false);
  const [registerContatoSalvo, setRegisterContatoSalvo] = useState(false);
  const [registerWifiTotal, setRegisterWifiTotal] = useState(false);
  const [registerChipMovel, setRegisterChipMovel] = useState(false);
  const [registerQualidade, setRegisterQualidade] = useState("");
  const [registerDateRetorno, setRegisterDateRetorno] = useState("");
  const [deltaValorCalculation, setDeltaValorCalculation] = useState(0);

  // Write manual telephone/WA/CPF
  const [manualWhatsApp, setManualWhatsApp] = useState("");
  const [manualCpf, setManualCpf] = useState("");
  const [manualBairro, setManualBairro] = useState("");
  const [manualCidade, setManualCidade] = useState("");

  // AI Modal State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponseText, setAiResponseText] = useState("");

  const [churnAIOpen, setChurnAIOpen] = useState(false);
  const [churnAILoading, setChurnAILoading] = useState(false);
  const [churnAIResponse, setChurnAIResponse] = useState("");

  // Base import state
  const [batchRawData, setBatchRawData] = useState("");
  const [batchIsLoading, setBatchIsLoading] = useState(false);

  // Batch Operations
  const handleBatchOperation = async (operation: "upsert" | "delete") => {
    if (!batchRawData.trim()) return alert("Por favor, cole os dados primeiro.");
    if (!confirm(`Deseja realmente prosseguir com a operação de ${operation === "upsert" ? "ADIÇÃO/ATUALIZAÇÃO" : "EXCLUSÃO"} em lote?`)) return;
    
    setBatchIsLoading(true);
    try {
      const resp = await fetch("/api/base/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, rawData: batchRawData })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Erro interno");
      alert(`Operação concluída com sucesso! Processados ${data.count} itens.`);
      setBatchRawData("");
      if (onFetchBaseLocal) {
        await onFetchBaseLocal();
      } else {
        await onRefreshBase();
      }
    } catch (err: any) {
      alert("Erro na operação em lote: " + err.message);
    } finally {
      setBatchIsLoading(false);
    }
  };

  const handleBulkTransfer = async () => {
    if (selectedBulkIds.length === 0 || !targetBulkConsultor) return;
    setIsTransferring(true);
    try {
      const response = await fetch("/api/base/bulk-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedBulkIds,
          consultor: targetBulkConsultor
        })
      });
      if (response.ok) {
        setSelectedBulkIds([]);
        setIsBulkTransferOpen(false);
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        alert("Erro na transferência: " + (errorData.message || "Erro desconhecido"));
      }
    } catch (err) {
      alert("Falha de comunicação.");
    } finally {
      setIsTransferring(false);
    }
  };

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(0);
  }, [filterConsultor, filterVelocidade, filterAntiguidade, filterOrdem, filterApenasAtivos, filterPrioridade, searchTerm, filterMotivo, filterPlanoExato]);

  // Determine viewable clients based on access level
  const viewableClients = React.useMemo(() => {
    if (isAdmin || !loggedUser) return clients;
    const lowerLogged = loggedUser.toLowerCase();
    
    return clients.filter(c => {
      if (!c.consultorOrigem) return false;
      const co = c.consultorOrigem.toLowerCase();
      if (co === lowerLogged) return true;
      
      // Prevent short string matches like "R" matching "Bruno"
      if (co.length > 2 && lowerLogged.includes(co)) return true;
      if (lowerLogged.length > 2 && co.includes(lowerLogged)) return true;
      
      // Extract first name
      const loggedFirstName = lowerLogged.split(" ")[0];
      const coFirstName = co.split(" ")[0];
      if (loggedFirstName.length > 2 && loggedFirstName === coFirstName) return true;

      return false;
    });
  }, [clients, isAdmin, loggedUser]);

  // Compute calculated clients fields (Score, Meses values)
  const computedClients = viewableClients.map(c => {
    const hoje = new Date();
    let meses = 0;
    if (c.dataAtivacao) {
      const dtAt = new Date(c.dataAtivacao);
      if (!isNaN(dtAt.getTime())) {
        meses = Math.floor((hoje.getTime() - dtAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      }
    }

    let score = 0;
    if (meses >= 24) score += 40;
    else if (meses >= 12) score += 25;
    else if (meses >= 6) score += 10;

    const mb = c.velocidadeMb || 0;
    if (mb > 0 && mb <= 100) score += 35;
    else if (mb > 0 && mb <= 300) score += 25;
    else if (mb > 0 && mb <= 600) score += 10;

    const valorFrac = (c.valor || 0) % 1;
    if (valorFrac > 0.01 && valorFrac < 0.99) score += 15;

    let prioridade: "urgente" | "oportunidade" | "neutro" = "neutro";
    
    // New simplified logic based on user request ("Urgentes em segundo que seriam contratos de status atual ativos menores que 300mb")
    const lastUpgrade = actions.filter(a => a.idContrato === c.idContrato && a.resultado === "UPGRADE").sort((a,b) => new Date(b.dataContato).getTime() - new Date(a.dataContato).getTime())[0]; const isUpgradeOlderThanYear = lastUpgrade ? (hoje.getTime() - new Date(lastUpgrade.dataContato).getTime()) > (365 * 24 * 60 * 60 * 1000) : false; const isUrgente = (String(c.status).toLowerCase().includes("ativo") && mb > 0 && mb <= 300) || isUpgradeOlderThanYear;
    if (isUrgente) {
      prioridade = "urgente";
    } else if (score >= 25) {
      prioridade = "oportunidade";
    }

    return { ...c, meses, score, prioridade };
  });

  // List of unique salespeople dynamically extracted from portfolio database
  const uniqueConsultores = Array.from(
    new Set(viewableClients.map(c => c.consultorOrigem).filter(Boolean))
  ).sort();

  // Auto-preselect the logged salesperson in their upgrades portfolio
  useEffect(() => {
    if (loggedUser && !isAdmin && viewableClients.length > 0) {
      const lowerLogged = loggedUser.toLowerCase();
      const matched = uniqueConsultores.find(uc => {
        const lowerUc = uc.toLowerCase();
        return lowerUc === lowerLogged || lowerUc.includes(lowerLogged) || lowerLogged.includes(lowerUc);
      });
      if (matched) {
        setFilterConsultor(matched);
      }
    }
  }, [loggedUser, isAdmin, viewableClients.length]);

  // Unique list of active contracts requiring action (status ATUACAO in history)
  const idsAtuacao = new Set(actions.filter(a => a.resultado === "ATUACAO" || a.requerAtuacao).map(a => a.idContrato));

  // Determine the base set of clients for KPIs depending on current filters, especially filterApenasAtivos
  const baseForTotal = computedClients.filter(c => {
    if (filterConsultor && c.consultorOrigem !== filterConsultor) return false;
    return true;
  });

  // KPI Calculations as requested
  const kpiAtivos = baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo")).length;
  const kpiUrgente = baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && (c.velocidadeMb || 0) > 0 && (c.velocidadeMb || 0) <= 300).length;
  const kpiAtuacao = baseForTotal.filter(c => idsAtuacao.has(c.idContrato)).length;
  const kpiCancelados = baseForTotal.filter(c => {
    const st = String(c.status).toLowerCase();
    return st.includes("cancelad") || st.includes("suspens");
  }).length;
  const kpiTotal = baseForTotal.length;

  // Filter list of clients (for the main table view)
  const filteredList = computedClients.filter(c => {
    if (filterPrioridade === "urgente" && c.prioridade !== "urgente") return false;
    if (filterPrioridade === "oportunidade" && c.prioridade !== "oportunidade") return false;
    if (filterPrioridade === "atuacao" && !idsAtuacao.has(c.idContrato)) return false;
    if (filterPrioridade === "cancelados") {
        const st = String(c.status).toLowerCase();
        if (!(st.includes("cancelad") || st.includes("suspens"))) return false;
    }
    
    if (filterConsultor && c.consultorOrigem !== filterConsultor) return false;

    if (filterPlanoExato) {
      const p = c.plano ? c.plano.trim() : "Sem Plano";
      if (p !== filterPlanoExato) return false;
    }

    if (filterMotivo) {
      if (normalizeReason(c.motivoCancelamento) !== filterMotivo) return false;
    }

    if (filterApenasAtivos) {
      if (!String(c.status).toLowerCase().includes("ativo")) return false;
    }

    const mb = c.velocidadeMb || 0;
    if (filterVelocidade === "100mb" && !(mb > 0 && mb <= 100)) return false;
    if (filterVelocidade === "300mb" && !(mb > 100 && mb <= 300)) return false;
    if (filterVelocidade === "baixo" && !(mb > 0 && mb <= 300)) return false; // Legacy fallback
    if (filterVelocidade === "medio" && !(mb > 300 && mb <= 600)) return false;
    if (filterVelocidade === "alto" && !(mb > 600)) return false;

    const m = c.meses || 0;
    if (filterAntiguidade === "12mais" && m < 12) return false;
    if (filterAntiguidade === "6a12" && !(m >= 6 && m < 12)) return false;
    if (filterAntiguidade === "menos6" && m >= 6) return false;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return (
        String(c.nome || "").toLowerCase().includes(searchLower) ||
        String(c.plano || "").toLowerCase().includes(searchLower) ||
        String(c.cidade || "").toLowerCase().includes(searchLower) ||
        String(c.idContrato || "").toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Map of last action for each client log
  const lastActionMap: Record<string, BaseActionLog> = {};
  actions.forEach(a => {
    if (!lastActionMap[a.idContrato] || new Date(a.dataContato).getTime() > new Date(lastActionMap[a.idContrato].dataContato).getTime()) {
      lastActionMap[a.idContrato] = a;
    }
  });

  // Sorting
  filteredList.sort((a, b) => {
    if (filterOrdem === "score") return (b.score || 0) - (a.score || 0);
    if (filterOrdem === "valor_desc") return (b.valor || 0) - (a.valor || 0);
    if (filterOrdem === "valor_asc") return (a.valor || 0) - (b.valor || 0);
    if (filterOrdem === "meses_desc") return (b.meses || 0) - (a.meses || 0);
    if (filterOrdem === "nome") return (a.nome || "").localeCompare(b.nome || "");
    
    // Padrão: colocar no final da fila quem já foi trabalhado recentemente
    const actA = lastActionMap[a.idContrato];
    const actB = lastActionMap[b.idContrato];
    if (!actA && actB) return -1;
    if (actA && !actB) return 1;
    if (actA && actB) {
      return new Date(actA.dataContato).getTime() - new Date(actB.dataContato).getTime();
    }
    return 0;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Calculate Delta when values change of upgrade form
  useEffect(() => {
    const vAnt = selectedClient?.valor || 0;
    const vNov = parseFloat(registerValorNovo) || 0;
    setDeltaValorCalculation(vNov - vAnt);
  }, [registerValorNovo, selectedClient]);

  const handleOpenRegister = (client: BaseClient) => {
    setSelectedClient(client);
    setRegisterConsultor(client.consultorOrigem || "");
    setRegisterStatus("");
    setRegisterClientStatus(client.status || "Ativo");
    setRegisterResultado("");
    setRegisterPlanoNovo("");
    setRegisterValorNovo("");
    setRegisterObs("");
    setRegisterDateRetorno("");
    setDeltaValorCalculation(0);
    
    // Reset Verification States
    setRegisterGloboplay(false);
    setRegisterAvaliacao(false);
    setRegisterSuperApp(false);
    setRegisterIndicacao(false);
    setRegisterCanais(false);
    setRegisterContatoSalvo(false);
    setRegisterWifiTotal(false);
    setRegisterChipMovel(false);
    setRegisterQualidade("");
    setAiPlanSuggestions([]);
    
    setIsRegisterOpen(true);
    setIsClientDetailsOpen(false);
  };

  const handleGenerateAiSuggestions = async (clientValor: number) => {
    setAiPlanSuggestionsLoading(true);
    try {
      const res = await fetch("/api/gemini/suggestBasePlanos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorAtual: clientValor })
      });
      const data = await res.json();
      if (data.status === "success" && data.suggestions) {
        setAiPlanSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Failed to fetch AI suggestions", error);
    } finally {
      setAiPlanSuggestionsLoading(false);
    }
  };

  const getSuggestionMessage = (sug: any) => {
    if (!selectedClient) return "";
    const firstName = selectedClient.nome.split(" ")[0];
    return `Olá ${firstName}! Tudo bem? Sou da MHNET.\n\nVi aqui que você já é nosso cliente pagando R$ ${selectedClient.valor}.\n\nTenho uma oportunidade perfeita disponível hoje na sua região:\n👉 Plano ${sug.nomePlano} por apenas R$ ${sug.valor}.\n\n${sug.motivo}\n\nO que acha de aproveitarmos essa condição especial?`;
  };

  const handleCopySuggestion = (sug: any, idx: number) => {
    navigator.clipboard.writeText(getSuggestionMessage(sug));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyName = (e: React.MouseEvent, nome: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nome);
    setCopiedNameId(id);
    setTimeout(() => setCopiedNameId(null), 2000);
  };

  const handleSendWhatsAppSuggestion = (sug: any) => {
    if (!selectedClient) return;
    const phone = (manualWhatsApp || selectedClient.telefoneExterno || "").replace(/\D/g, "");
    if (!phone) {
      alert("⚠️ Nenhum telefone válido encontrado. Verifique o cadastro ou preencha o campo de telefone.");
      return;
    }

    requestConfirm(
      "Confirmar Envio",
      "Você conferiu se os dados (como plano e valor) estão corretos e atualizados?\n\nAo prosseguir, o disparo será feito com os dados atuais.",
      () => {
        const text = encodeURIComponent(getSuggestionMessage(sug));
        window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
      }
    );
  };

  const handleN8nSend = async (sug: any, idx: number) => {
    if (!selectedClient) return;
    const phone = (manualWhatsApp || selectedClient.telefoneExterno || "").replace(/\D/g, "");
    if (!phone) {
      alert("⚠️ Nenhum telefone válido encontrado.");
      return;
    }

    if (!window.confirm("Você conferiu se os dados (como plano e valor) estão corretos e atualizados?\n\nAo prosseguir, o disparo será feito com os dados atuais.")) {
      return;
    }

    const msg = getSuggestionMessage(sug);
    
    setN8nStatusIndex(idx);
    try {
      const payload = {
            tipo: "sugestao_ia_upsell",
            cliente: selectedClient.nome,
            telefone: phone,
            contrato: selectedClient.idContrato,
            mensagem: msg,
            oferta_ia: sug
          };
      
      const resp = await fetch("/api/n8n/webhook-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        if (resp.status === 404 || resp.status === 500) {
          window.dispatchEvent(new CustomEvent("webhook-error"));
          throw new Error("Erro no webhook do N8N.");
        }
        throw new Error("HTTP " + resp.status);
      }
      alert("✅ Disparo via n8n enviado com sucesso!");
    } catch (err: any) {
      console.error("n8n webhook error:", err);
      alert("❌ Falha ao enviar para n8n: " + err.message);
    } finally {
      setN8nStatusIndex(null);
    }
  };

  const handleSaveAction = async () => {
    if (!selectedClient) return;
    if (!registerConsultor) {
      alert("⚠️ Selecione o consultor!");
      return;
    }
    if (!registerStatus) {
      alert("⚠️ Selecione o STATUS DA NEGOCIAÇÃO!");
      return;
    }

    const checklistText = [
      registerGloboplay ? "Globoplay" : "",
      registerAvaliacao ? "Avaliação Google" : "",
      registerSuperApp ? "Super App" : "",
      registerIndicacao ? "Indicação" : "",
      registerCanais ? "Canais Atendimento" : "",
      registerContatoSalvo ? "Contato Salvo" : "",
      registerWifiTotal ? "Wifi Total" : "",
      registerChipMovel ? "Chip Móvel" : "",
      registerQualidade ? `Qualidade: ${registerQualidade}` : ""
    ].filter(Boolean).join(", ");

    const finalObs = registerObs 
      ? (checklistText ? `${registerObs}\n\n[Verificações Realizadas: ${checklistText}]` : registerObs)
      : (checklistText ? `[Verificações Realizadas: ${checklistText}]` : undefined);

    const payload = {
      idContrato: selectedClient.idContrato,
      consultor: registerConsultor,
      statusContato: registerStatus,
      resultado: registerResultado || registerStatus,
      planoAnterior: selectedClient.plano,
      planoNovo: registerPlanoNovo || undefined,
      valorAnterior: selectedClient.valor,
      valorNovo: registerValorNovo ? parseFloat(registerValorNovo) : undefined,
      deltaValor: registerValorNovo ? (parseFloat(registerValorNovo) - selectedClient.valor) : undefined,
      observacao: finalObs,
      requerAtuacao: registerResultado === "ATUACAO",
      dataRetorno: registerDateRetorno || undefined,
      novoStatusContrato: registerClientStatus !== selectedClient.status ? registerClientStatus : undefined,
      verificacaoGloboplay: registerGloboplay,
      verificacaoAvaliacaoGoogle: registerAvaliacao,
      verificacaoSuperApp: registerSuperApp,
      verificacaoIndicacao: registerIndicacao,
      verificacaoCanais: registerCanais,
      verificacaoContatoSalvo: registerContatoSalvo,
      verificacaoWifiTotal: registerWifiTotal,
      verificacaoChipMovel: registerChipMovel,
      verificacaoQualidade: registerQualidade
    };

    try {
      await onRegisterAction(payload);
      
      // Update manually input phone, cpf, bairro, cidade data if edited
      if (manualWhatsApp || manualCpf || manualBairro || manualCidade) {
        // Save locally
        const savedData = { whatsapp: manualWhatsApp, cpf: manualCpf, bairro: manualBairro, cidade: manualCidade };
        localStorage.setItem(`cliente_${selectedClient.idContrato}_dados`, JSON.stringify(savedData));
        selectedClient.telefoneExterno = manualWhatsApp;
        selectedClient.cpf = manualCpf;
        selectedClient.bairro = manualBairro;
        selectedClient.cidade = manualCidade;
      }

      setIsRegisterOpen(false);
      setSelectedClient(null);
      alert("✅ Ação registrada com sucesso!");
    } catch (e: any) {
      alert(`❌ Falha ao registrar: ${e.message}`);
    }
  };

  const handleGenerateAI = async (client: BaseClient) => {
    setSelectedClient(client);
    setAiLoading(true);
    setIsAIOpen(true);
    setAiResponseText("");

    // Initialize local input boxes
    const localSaved = localStorage.getItem(`cliente_${client.idContrato}_dados`);
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        setManualWhatsApp(parsed.whatsapp || "");
        setManualCpf(parsed.cpf || "");
        setManualBairro(parsed.bairro || "");
        setManualCidade(parsed.cidade || "");
      } catch (e) {}
    } else {
      setManualWhatsApp(client.telefoneExterno || "");
      setManualCpf(client.cpf || "");
      setManualBairro(client.bairro || "");
      setManualCidade(client.cidade || "");
    }

    try {
      const computedC = computedClients.find(x => x.idContrato === client.idContrato) || client;
      const pitch = await onGenerateIAPitch(computedC);
      setAiResponseText(pitch);
    } catch (e: any) {
      setAiResponseText(`Olá ${client.nome}! Tudo bem? Vimos aqui na MHNET que você já é nosso cliente especial há mais de um ano! Que tal darmos uma olhada sem mexer no seu orçamento em um plano melhor com o dobro de velocidade de fibra óptica? Temos ofertas incríveis pra ti. Abraço!`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveContactParams = () => {
    if (!selectedClient) return;
    const cacheData = { whatsapp: manualWhatsApp, cpf: manualCpf, bairro: manualBairro, cidade: manualCidade };
    localStorage.setItem(`cliente_${selectedClient.idContrato}_dados`, JSON.stringify(cacheData));
    selectedClient.telefoneExterno = manualWhatsApp;
    selectedClient.cpf = manualCpf;
    selectedClient.bairro = manualBairro;
    selectedClient.cidade = manualCidade;
    alert("✅ Dados de contato salvos com sucesso no dispositivo!");
  };

  const handleSendWA = () => {
    const fone = manualWhatsApp || selectedClient?.telefoneExterno || "";
    if (!fone) {
      alert("⚠️ Informe o WhatsApp do cliente primeiro!");
      return;
    }

    requestConfirm(
      "Confirmar Envio",
      "Você conferiu se os dados (como plano e valor) estão corretos e atualizados?\n\nAo prosseguir, o disparo será feito com os dados atuais.",
      () => {
        const clean = fone.replace(/\D/g, "");
        window.open(`https://wa.me/55${clean}?text=${encodeURIComponent(aiResponseText)}`, "_blank");
      }
    );
  };

  const [n8nSending, setN8nSending] = useState(false);
  const [n8nPopup, setN8nPopup] = useState<{type: 'error'|'success', message: string} | null>(null);

  const handleSendN8n = async () => {
    if (!selectedClient) return;
    const fone = manualWhatsApp || selectedClient.telefoneExterno || "";
    if (!fone) {
      alert("⚠️ Informe o WhatsApp do cliente primeiro para disparar via n8n!");
      return;
    }

    requestConfirm(
      "Confirmar Disparo via N8N",
      "Você conferiu se os dados (como plano e valor) estão corretos e atualizados?\n\nAo prosseguir, o disparo será feito com os dados atuais.",
      async () => {
        setN8nSending(true);
        const payload = {
          nome_cliente: selectedClient.nome,
          telefone: fone,
          plano_atual: selectedClient.plano,
          valor_atual: selectedClient.valor,
          meses_base: selectedClient.meses,
          cidade: selectedClient.cidade || manualCidade,
          bairro: selectedClient.bairro || manualBairro,
          velocidade_atual: selectedClient.velocidadeMb
        };

        try {
          const res = await fetch("/api/n8n/webhook-upgrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
            alert("🚀 Disparo enviado para o n8n com sucesso!\n\nVerifique o console ou a plataforma n8n para confirmar o recebimento e o disparo no WhatsApp.");
            await onRegisterAction({
              idContrato: selectedClient.idContrato,
              consultor: loggedUser || "Sistema",
              statusContato: "Contato por WhatsApp",
              resultado: "Disparo Automático (n8n)",
              observacao: "Disparo Automático via n8n realizado.",
              planoAnterior: selectedClient.plano,
              valorAnterior: selectedClient.valor
            });
          } else {
            alert("❌ Erro ao enviar para o n8n: " + (data.message || "Erro desconhecido"));
          }
        } catch (e: any) {
          alert("❌ Falha de conexão ao disparar n8n: " + e.message);
        } finally {
          setN8nSending(false);
        }
      }
    );
  };

  const handleQuickSendN8n = async (client: BaseClient) => {
    let fone = client.telefoneExterno || "";
    if (selectedClient && selectedClient.idContrato === client.idContrato && manualWhatsApp) {
      fone = manualWhatsApp;
    }
    
    if (!fone) {
      setN8nPopup({ type: 'error', message: "O cliente não possui um WhatsApp cadastrado para disparar via n8n!" });
      return;
    }

    requestConfirm(
      "Confirmar Disparo Automático (N8N)",
      "Você conferiu se os dados (como plano e valor) estão corretos e atualizados?\n\nAo prosseguir, o disparo será feito com os dados atuais.",
      async () => {
        setN8nSending(true);
        const payload = {
          nome_cliente: client.nome,
          telefone: fone,
          plano_atual: client.plano,
          valor_atual: client.valor,
          meses_base: client.meses,
          cidade: client.cidade,
          bairro: client.bairro,
          velocidade_atual: client.velocidadeMb
        };

        try {
          const res = await fetch("/api/n8n/webhook-upgrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
            setN8nPopup({ type: 'success', message: "Disparo realizado! Monitore o WhatsApp." });
            await onRegisterAction({
              idContrato: client.idContrato,
              consultor: loggedUser || "Sistema",
              statusContato: "Contato por WhatsApp",
              resultado: "Disparo Automático (n8n)",
              observacao: "Disparo Automático via n8n realizado.",
              planoAnterior: client.plano,
              valorAnterior: client.valor
            });
          } else {
            setN8nPopup({ type: 'error', message: "Erro ao enviar para o n8n: " + (data.message || "Erro desconhecido") });
          }
        } catch (e: any) {
          setN8nPopup({ type: 'error', message: "Falha de conexão ao disparar n8n: " + e.message });
        } finally {
          setN8nSending(false);
        }
      }
    );
  };

  const handleClipboard = () => {
    navigator.clipboard.writeText(aiResponseText);
    alert("📋 Texto copiado para a área de transferência!");
  };

  const handleAnalyzeChurnAI = async (cancelados: BaseClient[], desistencias: BaseClient[]) => {
    setChurnAIOpen(true);
    setChurnAILoading(true);
    setChurnAIResponse("");
    
    let topCancelamentos = "";
    const cxMap: Record<string, number> = {};
    cancelados.forEach(c => {
      const m = normalizeReason(c.motivoCancelamento);
      cxMap[m] = (cxMap[m] || 0) + 1;
    });
    topCancelamentos = Object.entries(cxMap).map(([k,v]) => `- ${k}: ${v} clientes`).join("\n");

    let topDesistencias = "";
    const dxMap: Record<string, number> = {};
    desistencias.forEach(c => {
      const m = normalizeReason(c.motivoCancelamento);
      dxMap[m] = (dxMap[m] || 0) + 1;
    });
    topDesistencias = Object.entries(dxMap).map(([k,v]) => `- ${k}: ${v} clientes`).join("\n");

    try {
      const resp = await fetch("/api/gemini/analyzeBaseChurn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalCancelamentos: cancelados.length,
          topCancelamentos,
          totalDesistencias: desistencias.length,
          topDesistencias
        })
      });
      const data = await resp.json();
      if (data.status === "success") {
        setChurnAIResponse(data.text);
      } else {
        setChurnAIResponse("Erro ao analisar: " + data.message);
      }
    } catch (e: any) {
      setChurnAIResponse("Erro de rede: " + e.message);
    } finally {
      setChurnAILoading(false);
    }
  };

  // Compile team/consultor stats for Dashboard sub-tab (last 30 days)
  const computeDashboardStats = () => {
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const stats: Record<string, { total: number; upgrades: number; downgrades: number; delta: number }> = {};
    
    ["Ana Paula", "Karolina", "João Vithor", "Mauricio"].forEach(name => {
      stats[name] = { total: 0, upgrades: 0, downgrades: 0, delta: 0 };
    });

    actions.forEach(a => {
      if (!a.consultor || stats[a.consultor] === undefined) return;
      const dt = new Date(a.dataContato);
      if (isNaN(dt.getTime()) || dt < last30) return;

      stats[a.consultor].total++;
      if (a.resultado === "UPGRADE") {
        stats[a.consultor].upgrades++;
        stats[a.consultor].delta += a.deltaValor || 0;
      } else if (a.resultado === "DOWNGRADE") {
        stats[a.consultor].downgrades++;
        stats[a.consultor].delta += a.deltaValor || 0;
      }
    });

    return stats;
  };

  const stats = computeDashboardStats();

  return (
    <div id="base-viewport" className="space-y-4">
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          confirmState.onConfirm();
        }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
      {/* Tab Selectors list */}
      <div className="flex gap-1 card-modern border border-slate-100 rounded-xl p-1 shadow-sm font-sans overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab("clientes")}
          className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg cursor-pointer transition whitespace-nowrap ${
            activeSubTab === "clientes" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          📁 Clientes Base
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab("dashboard_geral")}
            className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg cursor-pointer transition whitespace-nowrap ${
              activeSubTab === "dashboard_geral" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            📈 Dashboard Base
          </button>
        )}
        <button
          onClick={() => setActiveSubTab("manutencao")}
          className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg cursor-pointer transition whitespace-nowrap ${
            activeSubTab === "manutencao" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          ⚙️ Manutenção
        </button>
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg cursor-pointer transition whitespace-nowrap ${
            activeSubTab === "dashboard" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          📊 Stats Consultor
        </button>
        <button
          onClick={() => setActiveSubTab("historico")}
          className={`flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg cursor-pointer transition whitespace-nowrap ${
            activeSubTab === "historico" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          ⏳ Histórico
        </button>
      </div>

      {/* SUBTAB: MANUTENCAO */}
      {activeSubTab === "manutencao" && (
        <div className="space-y-4 animate-fade-in font-sans">
          <div className="bg-gradient-to-r from-sky-900 via-sky-850 to-sky-950 text-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-sky-400" />
              Manutenção da Base (Importação em Massa)
            </h3>
            <p className="text-xs text-sky-200 mt-1 font-medium">Adicione ou atualize clientes em lote colando os dados da planilha de Fechamento (ex: Fechamento MAI 2026).</p>
          </div>

          <div className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider border-b border-b-slate-50 pb-2">Colar Dados da Planilha (TSV / Excel)</h4>
            <div className="text-xs text-slate-500 font-medium space-y-1">
              <p>Cole as colunas na seguinte ordem exata:</p>
              <ul className="list-disc pl-4 grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-1 font-mono text-[9px] text-slate-400">
                <li>1. Consultora Pós Venda</li>
                <li>2. CLIENTES</li>
                <li>3. Plano</li>
                <li>4. STATUS</li>
                <li>5. Tel. WhatsApp</li>
                <li>6. CPF</li>
                <li>7. Endereço</li>
                <li>8. Cidade</li>
                <li>...</li>
              </ul>
            </div>
            
            <textarea 
              value={batchRawData}
              onChange={e => setBatchRawData(e.target.value)}
              disabled={batchIsLoading}
              className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              placeholder="Cole os dados aqui da planilha fechamento. Certifique-se de não copiar o cabeçalho, apenas os dados."
            ></textarea>

            <div className="flex gap-2">
              <button 
                disabled={batchIsLoading}
                onClick={() => handleBatchOperation("upsert")}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-3 rounded-xl transition shadow-sm border-b-2 border-sky-700 active:border-b-0 active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none"
              >
                {batchIsLoading ? "Processando..." : "Adicionar / Atualizar Lote"}
              </button>
              <button 
                disabled={batchIsLoading}
                onClick={() => handleBatchOperation("delete")}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-3 rounded-xl transition shadow-sm border-b-2 border-rose-700 active:border-b-0 active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none"
              >
                {batchIsLoading ? "Processando..." : "Excluir Lote (Baseado no Nome/CPF)"}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-bold">Nota: Esta operação afeta a base de dados em memória. Para persistência permanente, ajuste a planilha master Base052026.</p>
          </div>


        </div>
      )}

      {/* SUBTAB: DASHBOARD GERAL */}
      {activeSubTab === "dashboard_geral" && (
        <div className="space-y-4 animate-fade-in font-sans">
          
          <div className="bg-gradient-to-r from-sky-900 via-sky-850 to-sky-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-sky-400" />
                Estatísticas Gerais da Base
              </h3>
              <p className="text-xs text-sky-200 mt-1 font-medium">Visão macro de todos os clientes registrados e retenção.</p>
            </div>
            <button
               onClick={() => {
                 const cancelados = baseForTotal.filter(c => String(c.status).toLowerCase().includes("cancelad"));
                 const desistencias = baseForTotal.filter(c => String(c.status).toLowerCase().includes("desist") || String(c.status).toLowerCase().includes("inviab"));
                 handleAnalyzeChurnAI(cancelados, desistencias);
               }}
               className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2.5 text-[11px] font-black rounded-xl flex items-center gap-2 transition active:scale-95 shadow-sm self-start md:self-auto uppercase tracking-wider"
            >
               <Sparkles className="w-4 h-4 text-sky-100 animate-pulse" /> IA: Analisar Cancelamentos
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div 
               onClick={() => {
                 setFilterApenasAtivos(false);
                 setFilterPrioridade(null);
                 setFilterConsultor("");
                 setFilterVelocidade("");
                 setFilterAntiguidade("");
                 setSearchTerm("");
                 setFilterMotivo("");
                 setFilterPlanoExato("");
                 setActiveSubTab("clientes");
               }}
               className="card-modern p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center h-full cursor-pointer hover:bg-slate-50 transition active:scale-95"
             >
               <div className="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Total de Contratos</div>
               <div className="text-4xl font-black text-sky-950 mt-2">{baseForTotal.length}</div>
             </div>
             <div 
               onClick={() => {
                 setFilterApenasAtivos(true);
                 setFilterPrioridade(null);
                 setFilterConsultor("");
                 setFilterVelocidade("");
                 setFilterAntiguidade("");
                 setSearchTerm("");
                 setFilterMotivo("");
                 setFilterPlanoExato("");
                 setActiveSubTab("clientes");
               }}
               className="card-modern p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center h-full cursor-pointer hover:bg-[#E6FAF1]/20 hover:border-emerald-200 transition active:scale-95"
             >
               <div className="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Ativos</div>
               <div className="text-4xl font-black text-[#00A86B] mt-2">{baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo")).length}</div>
               <div className="text-xs font-bold text-slate-400 mt-1">{((baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo")).length / baseForTotal.length) * 100).toFixed(1)}% do total</div>
             </div>
             <div 
               onClick={() => {
                 setFilterApenasAtivos(false);
                 setFilterPrioridade("cancelados");
                 setFilterConsultor("");
                 setFilterVelocidade("");
                 setFilterAntiguidade("");
                 setSearchTerm("");
                 setFilterMotivo("");
                 setFilterPlanoExato("");
                 setActiveSubTab("clientes");
               }}
               className="card-modern p-5 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden h-full cursor-pointer group transition active:scale-95"
             >
                <div className="absolute inset-0 bg-rose-50/50 group-hover:bg-rose-100/50 transition"></div>
                <div className="relative z-10 w-full">
                  <div className="text-sm font-extrabold uppercase text-rose-500 tracking-wider group-hover:text-rose-600 transition">Cancelados / Suspensos</div>
                  <div className="text-4xl font-black text-rose-700 mt-2">{baseForTotal.filter(c => String(c.status).toLowerCase().includes("cancelad") || String(c.status).toLowerCase().includes("suspens")).length}</div>
                  <div className="text-xs font-bold text-rose-400 mt-1">{((baseForTotal.filter(c => String(c.status).toLowerCase().includes("cancelad")).length / baseForTotal.length) * 100).toFixed(1)}% churn</div>
                </div>
             </div>
             <div className="card-modern p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center h-full">
               <div className="text-sm font-extrabold uppercase text-slate-400 tracking-wider">Média de Vida</div>
               <div className="text-4xl font-black text-sky-700 mt-2">
                 {Math.round(baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo")).reduce((acc, c) => acc + (c.meses || 0), 0) / (baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo")).length || 1))} <span className="text-lg text-slate-400 font-bold">meses</span>
               </div>
               <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Longevidade Ativa</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card-modern border border-slate-100 rounded-2xl shadow-sm p-5">
               <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-b-slate-50 pb-2">Distribuição de Velocidades</h4>
               <div className="space-y-3">
                 {[
                   { label: "Até 100Mb", key: "100mb", count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && c.velocidadeMb! > 0 && c.velocidadeMb! <= 100).length, color: "bg-rose-500" },
                   { label: "De 101 a 300Mb", key: "300mb", count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && c.velocidadeMb! > 100 && c.velocidadeMb! <= 300).length, color: "bg-amber-500" },
                   { label: "De 301 a 600Mb", key: "medio", count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && c.velocidadeMb! > 300 && c.velocidadeMb! <= 600).length, color: "bg-blue-500" },
                   { label: "Acima de 600Mb", key: "alto", count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && c.velocidadeMb! > 600).length, color: "bg-emerald-500" },
                 ].map(i => {
                    const totalAtv = baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo")).length || 1;
                    const pct = Math.round((i.count / totalAtv) * 100);
                    return (
                      <div 
                        key={i.label} 
                        onClick={() => {
                          setFilterApenasAtivos(true);
                          setFilterVelocidade(i.key);
                          setActiveSubTab("clientes");
                        }}
                        className="flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition"
                      >
                        <div className="flex items-center gap-2 w-32">
                          <div className={`w-3 h-3 rounded-full ${i.color}`}></div>
                          <span className="text-slate-600">{i.label}</span>
                        </div>
                        <div className="flex-1 max-w-xs mx-4">
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${i.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-slate-800">{i.count}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({pct}%)</span>
                        </div>
                      </div>
                    )
                 })}
               </div>
            </div>

            <div className="card-modern border border-slate-100 rounded-2xl shadow-sm p-5">
               <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-b-slate-50 pb-2">Status do Portfólio</h4>
               <div className="space-y-3">
                 {[
                   { label: "Ativos", key: null, apenasAtivos: true, count: baseForTotal.filter(c => String(c.status).toLowerCase() === "ativo").length, color: "bg-emerald-500" },
                   { label: "Suspendos", key: "cancelados", apenasAtivos: false, count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("suspens")).length, color: "bg-amber-500" },
                   { label: "Desistência / Inviab.", key: "cancelados", apenasAtivos: false, count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("desistência") || String(c.status).toLowerCase().includes("inviab")).length, color: "bg-orange-500" },
                   { label: "Cancelados", key: "cancelados", apenasAtivos: false, count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("cancelad")).length, color: "bg-rose-500" },
                 ].map(i => {
                    const pct = Math.round((i.count / (baseForTotal.length || 1)) * 100);
                    return (
                      <div 
                        key={i.label} 
                        onClick={() => {
                          setFilterApenasAtivos(i.apenasAtivos);
                          if (i.key) setFilterPrioridade(i.key);
                          setActiveSubTab("clientes");
                        }}
                        className="flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition"
                      >
                        <div className="flex items-center gap-2 w-40">
                          <div className={`w-3 h-3 rounded-full ${i.color}`}></div>
                          <span className="text-slate-600 truncate">{i.label}</span>
                        </div>
                        <div className="flex-1 max-w-[150px] mx-4">
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${i.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-slate-800">{i.count}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({pct}%)</span>
                        </div>
                      </div>
                    )
                 })}
               </div>
            </div>

            <div className="card-modern border border-slate-100 rounded-2xl shadow-sm p-5">
               <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-b-slate-50 pb-2">Tempo de Contrato</h4>
               <div className="space-y-3">
                 {[
                   { label: "Menos de 6 meses", key: "menos6", count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && (c.meses || 0) < 6).length, color: "bg-sky-500" },
                   { label: "6 a 12 meses", key: "6a12", count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && (c.meses || 0) >= 6 && (c.meses || 0) < 12).length, color: "bg-sky-500" },
                   { label: "Mais de 1 Ano", key: "12mais", count: baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo") && (c.meses || 0) >= 12).length, color: "bg-blue-500" },
                 ].map(i => {
                    const totalAtv = baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo")).length || 1;
                    const pct = Math.round((i.count / totalAtv) * 100);
                    return (
                      <div 
                        key={i.label} 
                        onClick={() => {
                          setFilterApenasAtivos(true);
                          setFilterAntiguidade(i.key);
                          setActiveSubTab("clientes");
                        }}
                        className="flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition"
                      >
                        <div className="flex items-center gap-2 w-32">
                          <div className={`w-3 h-3 rounded-full ${i.color}`}></div>
                          <span className="text-slate-600">{i.label}</span>
                        </div>
                        <div className="flex-1 max-w-xs mx-4">
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${i.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-slate-800">{i.count}</span>
                          <span className="text-slate-400 text-[10px] ml-1">({pct}%)</span>
                        </div>
                      </div>
                    )
                 })}
               </div>
            </div>
          </div>

          <div className="card-modern border border-slate-100 rounded-2xl shadow-sm p-5 mt-4">
             <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-b-slate-50 pb-2 flex justify-between items-center">
               <span>Top Planos (Somente Ativos)</span>
             </h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
               {(() => {
                 const atvList = baseForTotal.filter(c => String(c.status).toLowerCase().includes("ativo"));
                 const pMap: Record<string, number> = {};
                 atvList.forEach(c => {
                   const p = c.plano ? c.plano.trim() : "Sem Plano";
                   pMap[p] = (pMap[p] || 0) + 1;
                 });
                 const topPlans = Object.entries(pMap).sort((a,b) => b[1]-a[1]);
                 if (topPlans.length === 0) return <p className="text-xs text-slate-400 font-bold col-span-full">Nenhum plano ativo encontrado.</p>;
                 
                 return topPlans.map(([planoText, count], idx) => {
                   const totalAtv = atvList.length || 1;
                   const pct = ((count / totalAtv) * 100).toFixed(1);
                   return (
                     <div 
                       key={planoText}
                       onClick={() => {
                         setFilterApenasAtivos(true);
                         setFilterVelocidade("");
                         setFilterPlanoExato(planoText);
                         setActiveSubTab("clientes");
                       }}
                       className={`flex items-center justify-between text-xs font-bold cursor-pointer p-2.5 border rounded-xl transition group shadow-sm relative overflow-hidden ${
                         filterPlanoExato === planoText
                           ? "bg-sky-50 border-sky-300 ring-1 ring-sky-500/20"
                           : "bg-white border-slate-150 hover:border-sky-300 hover:bg-slate-50 hover:shadow-md"
                       }`}
                     >
                       {filterPlanoExato === planoText && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />}
                       <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                         <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 border ${
                           filterPlanoExato === planoText ? "bg-sky-500 text-white border-sky-600 shadow-inner" : "bg-sky-50 text-sky-600 border-sky-100/50 group-hover:bg-sky-100"
                         }`}>
                           {idx+1}
                         </div>
                         <span className={`truncate ${filterPlanoExato === planoText ? "text-sky-900" : "text-slate-700 group-hover:text-slate-900"}`} title={planoText}>{planoText}</span>
                       </div>
                       <div className="text-right shrink-0 flex flex-col items-end">
                         <span className={`${filterPlanoExato === planoText ? "text-sky-700" : "text-sky-900"} text-sm font-black leading-none`}>{count}</span>
                         <span className={`${filterPlanoExato === planoText ? "text-sky-400" : "text-slate-400"} text-[9px] mt-1 uppercase tracking-widest leading-none`}>{pct}%</span>
                       </div>
                     </div>
                   )
                 })
               })()}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="card-modern border border-slate-100 rounded-2xl shadow-sm p-5">
              <h4 className="text-sm font-black text-rose-700 uppercase tracking-wider mb-4 border-b border-b-slate-50 pb-2">Top Motivos de Cancelamento</h4>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {(() => {
                  const cancelados = baseForTotal.filter(c => String(c.status).toLowerCase().includes("cancelad"));
                  if (cancelados.length === 0) return <p className="text-xs text-slate-400 font-bold">Nenhum cancelamento na base.</p>;
                  
                  const countMap: Record<string, number> = {};
                  cancelados.forEach(c => {
                    const m = normalizeReason(c.motivoCancelamento);
                    countMap[m] = (countMap[m] || 0) + 1;
                  });
                  const topReasons = Object.entries(countMap).sort((a,b) => b[1] - a[1]);
                  
                  return topReasons.map(([reason, count]) => (
                    <div 
                      key={reason} 
                      onClick={() => {
                        setFilterApenasAtivos(false);
                        setFilterMotivo(reason);
                        setFilterPrioridade("cancelados");
                        setActiveSubTab("clientes");
                      }}
                      className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs cursor-pointer hover:bg-rose-50 transition active:scale-[0.98]"
                    >
                      <span className="font-bold text-slate-700 truncate mr-2" title={reason}>{reason}</span>
                      <span className="bg-white shadow-sm border border-slate-100 px-2 py-0.5 rounded text-rose-600 font-black">{count}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="card-modern border border-slate-100 rounded-2xl shadow-sm p-5">
              <h4 className="text-sm font-black text-orange-600 uppercase tracking-wider mb-4 border-b border-b-slate-50 pb-2">Top Motivos Desistência/Inviab.</h4>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {(() => {
                  const desistencias = baseForTotal.filter(c => String(c.status).toLowerCase().includes("desist") || String(c.status).toLowerCase().includes("inviab"));
                  if (desistencias.length === 0) return <p className="text-xs text-slate-400 font-bold">Nenhuma desistência na base.</p>;
                  
                  const countMap: Record<string, number> = {};
                  desistencias.forEach(c => {
                    const m = normalizeReason(c.motivoCancelamento);
                    countMap[m] = (countMap[m] || 0) + 1;
                  });
                  const topReasons = Object.entries(countMap).sort((a,b) => b[1] - a[1]);
                  
                  return topReasons.map(([reason, count]) => (
                    <div 
                      key={reason} 
                      onClick={() => {
                        setFilterApenasAtivos(false);
                        setFilterMotivo(reason);
                        setFilterPrioridade("cancelados");
                        setActiveSubTab("clientes");
                      }}
                      className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs cursor-pointer hover:bg-orange-50 transition active:scale-[0.98]"
                    >
                      <span className="font-bold text-slate-700 truncate mr-2" title={reason}>{reason}</span>
                      <span className="bg-white shadow-sm border border-slate-100 px-2 py-0.5 rounded text-orange-600 font-black">{count}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: CLIENTS BASE LISTING */}
      {activeSubTab === "clientes" && (
        <div className="space-y-4 animate-fade-in">
          {/* Sheet Sync Row */}
          <div className="bg-gradient-to-r from-sky-900 via-sky-850 to-sky-950 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-200">Sincronização de Dados</div>
              <h4 className="text-sm font-black tracking-tight mt-0.5">Base de Upgrades & Retenção (Base052026)</h4>
              <p className="text-[10.5px] text-sky-100/80 leading-snug font-semibold mt-0.5">A sincronização neste painel é <strong>manual</strong>. Clique no botão ao lado para buscar os dados mais recentes da aba <code className="bg-sky-950 px-1 py-0.5 rounded text-[10px] font-mono">Base052026</code> da planilha no Google Sheets.</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await onRefreshBase();
                } catch (e: any) {
                  alert("Erro ao sincronizar base: " + e.message);
                }
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 card-modern hover:bg-sky-50 text-sky-950 text-xs font-black rounded-xl shadow cursor-pointer transition active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
              <span>Sincronizar Planilha</span>
            </button>
          </div>

          {/* Base KPIs overview tiles */}
          <div className={`grid grid-cols-2 ${isAdmin ? "md:grid-cols-5" : "md:grid-cols-4"} gap-2`}>
            {/* 1. Ativo */}
            <div 
              onClick={() => { 
                setFilterApenasAtivos(true); 
                setFilterPrioridade(null);
                setFilterConsultor("");
                setFilterVelocidade("");
                setFilterAntiguidade("");
                setSearchTerm("");
                setFilterMotivo("");
                setFilterPlanoExato("");
              }}
              className={`card-modern border p-3 rounded-xl cursor-pointer shadow-sm active:scale-97 transition ${
                filterApenasAtivos && !filterPrioridade ? "border-emerald-400 bg-[#E6FAF1]/10" : "border-slate-100"
              }`}
            >
              <div className="text-xl font-black text-[#00A86B] leading-none">{kpiAtivos}</div>
              <div className="text-[10px] font-extrabold uppercase text-slate-450 mt-1">🟢 Total Ativos</div>
            </div>

            {/* 2. Urgente */}
            <div 
              onClick={() => { 
                setFilterApenasAtivos(true); 
                setFilterPrioridade(filterPrioridade === "urgente" ? null : "urgente");
                setFilterConsultor("");
                setFilterVelocidade("");
                setFilterAntiguidade("");
                setSearchTerm("");
                setFilterMotivo("");
                setFilterPlanoExato("");
              }}
              className={`card-modern border p-3 rounded-xl cursor-pointer shadow-sm active:scale-97 transition ${
                filterPrioridade === "urgente" ? "border-rose-400 bg-rose-50/10" : "border-slate-100"
              }`}
            >
              <div className="text-xl font-black text-rose-600 leading-none">{kpiUrgente}</div>
              <div className="text-[10px] font-extrabold uppercase text-slate-450 mt-1">🔴 Alta (&le;300MB)</div>
            </div>

            {/* 3. Reclamação */}
            <div 
              onClick={() => { 
                setFilterApenasAtivos(true); 
                setFilterPrioridade(filterPrioridade === "atuacao" ? null : "atuacao");
                setFilterConsultor("");
                setFilterVelocidade("");
                setFilterAntiguidade("");
                setSearchTerm("");
                setFilterMotivo("");
                setFilterPlanoExato("");
              }}
              className={`card-modern border p-3 rounded-xl cursor-pointer shadow-sm active:scale-97 transition ${
                filterPrioridade === "atuacao" ? "border-amber-500 bg-amber-50/10" : "border-slate-100"
              }`}
            >
              <div className="text-xl font-black text-amber-500 leading-none">{kpiAtuacao}</div>
              <div className="text-[10px] font-extrabold uppercase text-slate-450 mt-1">⚠️ Atuações (Reclamação)</div>
            </div>

            {/* 4. Cancelados / Suspensos */}
            <div 
              onClick={() => { 
                setFilterApenasAtivos(false); 
                setFilterPrioridade(filterPrioridade === "cancelados" ? null : "cancelados");
                setFilterConsultor("");
                setFilterVelocidade("");
                setFilterAntiguidade("");
                setSearchTerm("");
                setFilterMotivo("");
                setFilterPlanoExato("");
              }}
              className={`card-modern border p-3 rounded-xl cursor-pointer shadow-sm active:scale-97 transition ${
                filterPrioridade === "cancelados" ? "border-slate-400 bg-slate-50" : "border-slate-100"
              }`}
            >
              <div className="text-xl font-black text-slate-600 leading-none">{kpiCancelados}</div>
              <div className="text-[10px] font-extrabold uppercase text-slate-450 mt-1">⚫ Cancelados / Suspensos</div>
            </div>

            {/* 5. Total Geral */}
            {isAdmin && (
              <div 
                onClick={() => { 
                  setFilterApenasAtivos(false); 
                  setFilterPrioridade(null);
                  setFilterConsultor("");
                  setFilterVelocidade("");
                  setFilterAntiguidade("");
                  setSearchTerm("");
                  setFilterMotivo("");
                  setFilterPlanoExato("");
                }}
                className={`card-modern border p-3 rounded-xl cursor-pointer shadow-sm active:scale-97 transition ${
                  (!filterPrioridade && !filterApenasAtivos) ? "border-sky-400 bg-sky-50/10" : "border-slate-100"
                }`}
              >
                <div className="text-xl font-black text-sky-900 leading-none">{kpiTotal}</div>
                <div className="text-[10px] font-extrabold uppercase text-slate-450 mt-1">🏠 Total Geral</div>
              </div>
            )}
          </div>

          {/* Filtering bento box panel */}
          <div className="card-modern border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm font-sans">
            <div className="text-xs font-black uppercase text-sky-950 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtros e Priorizações
            </div>

            <div className="grid grid-cols-2 gap-2">
              {isAdmin && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Vendedor Origem</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-semibold"
                    value={filterConsultor}
                    onChange={e => setFilterConsultor(e.target.value)}
                  >
                    <option value="">Qualquer consultor</option>
                    {uniqueConsultores.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Velocidade Plano</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-semibold"
                  value={filterVelocidade}
                  onChange={e => setFilterVelocidade(e.target.value)}
                >
                  <option value="">Qualquer plano</option>
                  <option value="baixo">Plano baixo (≤300Mb)</option>
                  <option value="medio">Plano médio (301-600Mb)</option>
                  <option value="alto">Plano alto (&gt;600Mb)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Antiguidade Ativa</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-semibold"
                  value={filterAntiguidade}
                  onChange={e => setFilterAntiguidade(e.target.value)}
                >
                  <option value="">Qualquer tempo</option>
                  <option value="12mais">Mais de 12 meses</option>
                  <option value="6a12">6 a 12 meses</option>
                  <option value="menos6">Menos de 6 meses</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Ordenação Externa</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-semibold"
                  value={filterOrdem}
                  onChange={e => setFilterOrdem(e.target.value)}
                >
                  <option value="score">Maior Prioridade (Score)</option>
                  <option value="valor_desc">Maior valor/mês</option>
                  <option value="valor_asc">Menor valor/mês</option>
                  <option value="meses_desc">Mais antigo de casa</option>
                  <option value="nome">Nome Alfabético</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-t-slate-100">
              <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={filterApenasAtivos} 
                  onChange={e => setFilterApenasAtivos(e.target.checked)}
                  className="rounded text-sky-950 focus:ring-0"
                />
                Exibir apenas contratos Ativos
              </label>

              <button 
                onClick={() => {
                  setFilterConsultor("");
                  setFilterVelocidade("");
                  setFilterAntiguidade("");
                  setFilterOrdem("score");
                  setFilterApenasAtivos(true);
                  setSearchTerm("");
                  setFilterMotivo("");
                  setFilterPlanoExato("");
                  setFilterPrioridade(null);
                }}
                className="text-[10px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {filterMotivo && (
            <div className="flex items-center gap-2 mt-2 mb-2">
               <div className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                 <span>Motivo: <strong>{filterMotivo}</strong></span>
                 <button onClick={() => setFilterMotivo("")} className="hover:bg-rose-100 rounded-full p-0.5">✕</button>
               </div>
            </div>
          )}

          {filterPlanoExato && (
            <div className="flex items-center gap-2 mt-2 mb-2">
               <div className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                 <span>Plano Analítico: <strong>{filterPlanoExato}</strong></span>
                 <button onClick={() => setFilterPlanoExato("")} className="hover:bg-sky-100 rounded-full p-0.5">✕</button>
               </div>
            </div>
          )}

          {/* Quick search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full card-modern border border-slate-150 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400"
              placeholder="Pesquisar por idContrato, cidade, nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Records counting label */}
          <div className="flex items-center justify-between pl-1">
            <p className="text-[11px] text-slate-400 font-bold uppercase">
              Resultados: {filteredList.length} cliente(s) listado(s)
            </p>
            {isAdmin && selectedBulkIds.length > 0 && (
              <button
                onClick={() => setIsBulkTransferOpen(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                Transferir Selecionados ({selectedBulkIds.length})
              </button>
            )}
          </div>

          {/* List panel */}
          <div className="space-y-3">
            {paginatedList.length > 0 ? (
              paginatedList.map(client => {
                const las = lastActionMap[client.idContrato];
                const requAtuacao = las?.resultado === "ATUACAO" || las?.requerAtuacao;
                
                return (
                  <div 
                    key={client.idContrato}
                    onClick={() => handleOpenRegister(client)}
                    className="card-modern border border-slate-300 rounded-xl p-4 space-y-3 shadow-md -xl hover:border-sky-300 relative overflow-hidden cursor-pointer transition duration-200"
                  >
                    {/* Visual bar depending on priority */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      client.prioridade === "urgente" ? "bg-rose-500" : client.prioridade === "oportunidade" ? "bg-amber-400" : "bg-emerald-400"
                    }`} />

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer z-10"
                              checked={selectedBulkIds.includes(client.idContrato)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBulkIds(prev => [...prev, client.idContrato]);
                                } else {
                                  setSelectedBulkIds(prev => prev.filter(id => id !== client.idContrato));
                                }
                              }}
                            />
                          )}
                          <div 
                            className="font-extrabold text-slate-950 text-sm leading-snug hover:text-sky-850 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(client);
                              setIsClientDetailsOpen(true);
                            }}
                          >
                            {client.nome}
                          </div>
                          <button 
                            onClick={(e) => handleCopyName(e, client.nome, client.idContrato)}
                            className="text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                            title="Copiar Nome"
                          >
                            {copiedNameId === client.idContrato ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-700 font-extrabold uppercase mt-0.5">Contrato: {client.idContrato}{client.cidade ? ` · ${client.cidade}` : ''}{client.bairro ? ` · ${client.bairro}` : ''}</p>
                        <FastWhatsAppBtn client={client} onSend={handleQuickSendN8n} isSending={n8nSending} />
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        client.prioridade === "urgente" ? "bg-rose-50 text-rose-800 border border-rose-200" : client.prioridade === "oportunidade" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-[#E6FAF1] text-emerald-850 border border-emerald-200"
                      }`}>
                        {client.prioridade === "urgente" ? "🔴 Alta" : client.prioridade === "oportunidade" ? "🟡 Média" : "✅ Baixa"}
                      </span>
                    </div>

                    {requAtuacao && (
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-black text-[10px] px-2 py-1 rounded-md">
                        ⚠️ Requer Atuação / Reclamação pendente
                      </div>
                    )}

                    {client.motivoCancelamento && client.motivoCancelamento.trim() !== "" && (
                      <div className="flex bg-rose-50 border border-rose-200 text-rose-800 font-extrabold text-[10px] px-2 py-1.5 rounded-lg leading-snug">
                        <span className="shrink-0 mr-1 opacity-80">Motivo:</span> 
                        <span>{client.motivoCancelamento}</span>
                      </div>
                    )}

                    {/* Stats Tiles info grid inside Base Client card */}
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <div className="text-slate-600 font-extrabold uppercase text-[8px]">Plano</div>
                        <div className="font-extrabold text-sky-950">{client.velocidadeMb ? `${client.velocidadeMb}Mb` : client.plano}</div>
                      </div>

                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <div className="text-slate-600 font-extrabold uppercase text-[8px]">Valor/mês</div>
                        <div className="font-extrabold text-sky-900 font-black">R$ {Number(client.valor).toFixed(2).replace(".", ",")}</div>
                      </div>

                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <div className="text-slate-600 font-extrabold uppercase text-[8px]">Tempo</div>
                        <div className="font-extrabold text-slate-800 text-[10px] whitespace-nowrap leading-tight">{formatTimeInYearsMonths(client.meses)}</div>
                      </div>

                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <div className="text-slate-600 font-extrabold uppercase text-[8px]">Prioridade</div>
                        <div className={`font-extrabold text-[10px] leading-tight ${client.prioridade === 'urgente' ? 'text-rose-700' : client.prioridade === 'oportunidade' ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {client.prioridade === "urgente" ? "Alta" : client.prioridade === "oportunidade" ? "Média" : "Baixa"}
                        </div>
                      </div>
                    </div>

                    {/* Active agent detail if logged */}
                    {las && (
                      <div className="text-[10px] text-slate-600 font-semibold leading-none">
                        Último Atendimento: <span className="font-extrabold text-sky-950">{las.consultor}</span> em {new Date(las.dataContato).toLocaleDateString("pt-BR")} — <strong className="text-slate-800 font-extrabold">{las.resultado}</strong>
                      </div>
                    )}

                    {/* Action buttons inside base page card */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateAI(client);
                        }}
                        className="flex-1 py-1.5 bg-blue-50 text-blue-900 border border-blue-100 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 active:scale-97 cursor-pointer hover:bg-blue-100/50"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Abordagem IA
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRegister(client);
                        }}
                        className="flex-1 py-1.5 bg-sky-50 text-sky-850 border border-sky-100 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 active:scale-97 cursor-pointer hover:bg-sky-100/50"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" /> Registrar Ação
                      </button>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-slate-400 card-modern rounded-2xl border border-slate-50">
                <Users className="w-10 h-10 mx-auto opacity-20" />
                <p className="text-sm font-semibold">Nenhum registro encontrado na carteira de base.</p>
              </div>
            )}
          </div>

          {/* Pagination panel */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4 pt-1">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(c => Math.max(0, c - 1))}
                className="px-3 py-1.5 card-modern border border-slate-200 text-xs font-bold rounded-lg disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs font-extrabold text-slate-500">Pág. {currentPage + 1} de {totalPages}</span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(c => Math.min(totalPages - 1, c + 1))}
                className="px-3 py-1.5 card-modern border border-slate-200 text-xs font-bold rounded-lg disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: ACTION LOGS HISTORY LOGS */}
      {activeSubTab === "historico" && (
        <div className="space-y-3 animate-fade-in pb-10">
          <h3 className="text-xs font-black uppercase text-slate-450 leading-none">Logs de Contato Recentes</h3>
          {actions.length > 0 ? (
            [...actions]
              .sort((a, b) => new Date(b.dataContato).getTime() - new Date(a.dataContato).getTime())
              .map(log => {
                const targetC = clients.find(c => c.idContrato === log.idContrato);
                const isPositive = log.resultado === "UPGRADE";
                const isNegative = log.resultado === "DOWNGRADE" || log.resultado === "RECUSOU";
                const isAtuacao = log.resultado === "ATUACAO" || log.requerAtuacao;

                return (
                  <div 
                    key={log.id}
                    className={`card-modern border border-slate-100 rounded-xl p-3.5 space-y-1.5 shadow-sm border-l-4 ${
                      isPositive ? "border-l-emerald-500" : isNegative ? "border-l-rose-500" : isAtuacao ? "border-l-amber-500" : "border-l-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                      <span className="text-sky-950 font-black flex items-center gap-1">👤 {log.consultor}</span>
                      <span>{new Date(log.dataContato.includes('T') ? log.dataContato : log.dataContato + 'T12:00:00').toLocaleDateString("pt-BR") + (log.dataContato.includes('T') ? " " + new Date(log.dataContato).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"}) : "")}</span>
                    </div>

                    <div className="font-extrabold text-slate-800 text-xs">
                      {targetC?.nome || log.idContrato} <span className="font-normal text-slate-450">({log.idContrato})</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-700">
                      Resultado: <strong className="text-sky-90 font-extrabold">{log.resultado}</strong>
                      {log.dataRetorno && <span className="text-amber-800 ml-1.5">📅 Retorno: {new Date(log.dataRetorno).toLocaleDateString("pt-BR")}</span>}
                    </div>

                    {log.deltaValor && log.deltaValor !== 0 ? (
                      <div className="text-[10px] bg-sky-50 text-sky-850 p-1.5 rounded-md font-sans">
                        📈 {log.planoAnterior || "Anterior"} → {log.planoNovo || "Novo"} · {log.deltaValor > 0 ? "+" : ""}R$ {log.deltaValor.toFixed(2).replace(".", ",")} /mês
                      </div>
                    ) : null}

                    {log.observacao && (
                      <p className="text-[11px] text-slate-400 italic">"{log.observacao}"</p>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="text-center py-20 text-slate-405 card-modern rounded-2xl border border-slate-50">
              <History className="w-10 h-10 mx-auto opacity-20" />
              <p className="text-sm font-semibold">Nenhuma ação registrada no histórico.</p>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: SALESPERSON PERFORMANCE METRICS TAB */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-4 animate-fade-in pb-10">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-400 leading-none">Rendimento e Volume da Equipe</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Últimos 30 dias de campanhas</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(stats).map(name => {
              const item = stats[name];
              const initials = name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
              const convRate = item.total > 0 ? Math.round((item.upgrades / item.total) * 100) : 0;
              const deltaFmt = item.delta !== 0 ? `${item.delta > 0 ? "+" : ""}R$ ${item.delta.toFixed(2).replace(".", ",")}` : "R$ 0,00";

              return (
                <div key={name} className="card-modern border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-sm">
                  {/* Performance sub header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-850 to-sky-950 text-white rounded-xl font-black text-xs flex items-center justify-center">
                      {initials}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 text-sm leading-none mb-1">{name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Taxa de Upgrade: {convRate}% · {item.total} contatos</div>
                    </div>
                  </div>

                  {/* Operational stats row list */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-sans">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <div className="text-slate-400 font-bold uppercase text-[8px] mb-0.5">Contatos</div>
                      <p className="font-black text-slate-800 text-sm">{item.total}</p>
                    </div>

                    <div className="bg-[#E6FAF1] p-2 rounded-xl border border-[#00A86B]/20">
                      <div className="text-emerald-700 font-bold uppercase text-[8px] mb-0.5">Upgrades</div>
                      <p className="font-black text-emerald-800 text-sm">{item.upgrades}</p>
                    </div>

                    <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
                      <div className="text-rose-700 font-bold uppercase text-[8px] mb-0.5">Downgrades</div>
                      <p className="font-black text-rose-800 text-sm">{item.downgrades}</p>
                    </div>

                    <div className={ `${item.delta >= 0 ? "bg-[#E6FAF1] border-[#00A86B]/20" : "bg-rose-50 border-rose-100"} p-2 rounded-xl border` }>
                      <div className="text-slate-400 font-bold uppercase text-[8px] mb-0.5">Δ Receita</div>
                      <p className="font-black text-sky-950 text-[11px] truncate leading-tight mt-1">{deltaFmt}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: SINGLE BASE DETAILED VIEW */}
      {isClientDetailsOpen && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[990] flex items-end justify-center select-none" onClick={() => setIsClientDetailsOpen(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-barge-up" onClick={e => e.stopPropagation()}>
            <div className="modal-handle w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2" />
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{selectedClient.nome}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">ID Contrato: {selectedClient.idContrato}{selectedClient.cidade ? ` · ${selectedClient.cidade}` : ''}{selectedClient.bairro ? ` · ${selectedClient.bairro}` : ''}</p>
              </div>
              <button 
                onClick={() => setIsClientDetailsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 text-xs font-bold leading-none bg-slate-50 border rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Core data grid panel of selected card */}
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[9px] font-bold uppercase mb-0.5">Plano Contratado</div>
                <div className="font-extrabold text-sky-950 text-sm leading-tight">{selectedClient.velocidadeMb ? `${selectedClient.velocidadeMb}Mb` : selectedClient.plano}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[9px] font-bold uppercase mb-0.5">Valor Mensal</div>
                <div className="font-extrabold text-sky-900 text-sm leading-tight">R$ {Number(selectedClient.valor).toFixed(2).replace(".", ",")}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[9px] font-bold uppercase mb-0.5">Antiguidade</div>
                <div className="font-extrabold text-slate-805 text-sm leading-tight">{formatTimeInYearsMonths(selectedClient.meses)} de casa</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-slate-400 text-[9px] font-bold uppercase mb-0.5">Score de Prioridade</div>
                <div className="font-extrabold text-rose-600 text-sm leading-tight">{selectedClient.score} / 100</div>
              </div>
            </div>

            {/* General details lists */}
            <div className="space-y-1.5 text-xs text-slate-500 font-medium font-sans">
              <p>📡 <span className="text-slate-400 pl-1">Canal de Captação:</span> <strong className="text-slate-700 font-bold">{selectedClient.canal || "Direto / Externo"}</strong></p>
              <p>📶 <span className="text-slate-400 pl-1">Status do contrato:</span> <strong className="text-slate-700 font-bold">{selectedClient.status || "Ativo"}</strong></p>
              {selectedClient.cpf && (
                <p>🆔 <span className="text-slate-400 pl-1">CPF:</span> <strong className="text-slate-700 font-bold">{selectedClient.cpf}</strong></p>
              )}
              {selectedClient.endereco && (
                <p>📍 <span className="text-slate-400 pl-1">Endereço:</span> <strong className="text-slate-700 font-bold">{selectedClient.endereco}</strong></p>
              )}
              {selectedClient.bairro && (
                <p>🏘️ <span className="text-slate-400 pl-1">Bairro:</span> <strong className="text-slate-700 font-bold">{selectedClient.bairro}</strong></p>
              )}
              {selectedClient.cidade && (
                <p>🏙️ <span className="text-slate-400 pl-1">Cidade:</span> <strong className="text-slate-700 font-bold">{selectedClient.cidade}</strong></p>
              )}
              {selectedClient.telefoneExterno && (
                <p>📞 <span className="text-slate-400 pl-1">Telefone:</span> <strong className="text-slate-700 font-bold">{selectedClient.telefoneExterno}</strong></p>
              )}
              {selectedClient.motivoCancelamento && (
                <p>⚠️ <span className="text-slate-400 pl-1">Motivo:</span> <strong className="text-slate-700 font-bold">{selectedClient.motivoCancelamento}</strong></p>
              )}
              {selectedClient.dataAtivacao && (
                <p>📅 <span className="text-slate-400 pl-1">Data Ativação:</span> <strong className="text-slate-700 font-bold">{new Date(selectedClient.dataAtivacao).toLocaleDateString("pt-BR")}</strong></p>
              )}
            </div>

            {/* Quick action buttons list */}
            <div className="flex gap-2 pt-2 border-t border-t-slate-100">
              <button 
                onClick={() => handleGenerateAI(selectedClient)}
                className="flex-1 py-1.5 bg-gradient-to-r from-blue-950 to-sky-900 text-white rounded-xl text-xs font-bold leading-none cursor-pointer hover:opacity-90 flex items-center justify-center gap-1 shadow-sm active:scale-97 transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> Abordagem IA
              </button>
              <button 
                onClick={() => handleOpenRegister(selectedClient)}
                className="flex-1 py-1.5 bg-sky-900 hover:bg-sky-950 text-white rounded-xl text-xs font-bold leading-none cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-97 transition"
              >
                <ClipboardCheck className="w-3.5 h-3.5" /> Registrar Ação
              </button>
              <button 
                onClick={() => handleQuickSendN8n(selectedClient)}
                disabled={n8nSending}
                className="flex-1 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 border border-blue-500/30 rounded-xl text-xs font-bold leading-none cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-97 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {n8nSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} {n8nSending ? "Enviando..." : "Disparo Automático"}
              </button>
            </div>

            {/* Client Action History */}
            <div className="pt-4 border-t border-t-slate-100 space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-450 leading-none flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Histórico de Contatos
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {actions.filter(a => a.idContrato === selectedClient.idContrato).length > 0 ? (
                  [...actions]
                    .filter(a => a.idContrato === selectedClient.idContrato)
                    .sort((a, b) => new Date(b.dataContato).getTime() - new Date(a.dataContato).getTime())
                    .map(log => {
                      const isPositive = log.resultado === "UPGRADE";
                      const isNegative = log.resultado === "DOWNGRADE" || log.resultado === "RECUSOU";
                      const isAtuacao = log.resultado === "ATUACAO" || log.requerAtuacao;
                      return (
                        <div 
                          key={log.id}
                          className={`bg-slate-50 border border-slate-100 rounded-lg p-2.5 shadow-sm border-l-4 ${
                            isPositive ? "border-l-emerald-500" : isNegative ? "border-l-rose-500" : isAtuacao ? "border-l-amber-500" : "border-l-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase mb-1">
                            <span className="text-sky-950 font-black">👤 {log.consultor}</span>
                            <span>{new Date(log.dataContato.includes('T') ? log.dataContato : log.dataContato + 'T12:00:00').toLocaleDateString("pt-BR")}{log.dataContato.includes('T') ? " " + new Date(log.dataContato).toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"}) : ""}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700 leading-snug">
                            Resultado: <strong className="text-sky-900 font-extrabold">{log.resultado}</strong>
                          </div>
                          {log.observacao && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5 leading-snug">"{log.observacao}"</p>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-slate-100">Nenhum histórico registrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL REGISTER MODAL */}
      {isRegisterOpen && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
          <div className="card-modern rounded-2xl w-full max-w-4xl p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-extrabold text-slate-805 flex items-center gap-1.5">
              <ClipboardCheck className="w-6 h-6 text-sky-950" /> Log/Registrar Ação
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-650 font-medium">
              📁 <strong>{selectedClient.nome}</strong><br />
              Contrato {selectedClient.idContrato} · {selectedClient.plano} · R$ {Number(selectedClient.valor).toFixed(2).replace(".",",")}/mês
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              {/* Left Column: Register Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-1">Dados da Negociação</h4>
                <div className="space-y-1 block border border-slate-100 p-2 rounded-xl bg-white shadow-sm mb-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Status do Contrato <span className="text-[8px] font-medium opacity-60">(opcionalmente, altere o status)</span></label>
                <select
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-bold font-sans text-sky-950 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  value={registerClientStatus}
                  onChange={e => setRegisterClientStatus(e.target.value)}
                >
                  <option value="Ativo">🟢 Ativo</option>
                  <option value="Cancelado">🔴 Cancelado</option>
                  <option value="Suspenso">🟡 Suspenso</option>
                  <option value="Desistência / Inviabilidade">⚠️ Desistência / Inviabilidade</option>
                  <option value="Backlog">🟣 Backlog</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Responsável pelo contato</label>
                <select
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-semibold"
                  value={registerConsultor}
                  onChange={e => setRegisterConsultor(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="Ana Paula">Ana Paula</option>
                  <option value="Karolina">Karolina</option>
                  <option value="João Vithor">João Vithor</option>
                  <option value="Mauricio">Mauricio</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">STATUS DA NEGOCIAÇÃO</label>
                <select
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-semibold"
                  value={registerStatus}
                  onChange={e => {
                    const st = e.target.value;
                    setRegisterStatus(st);
                    if (st === "FECHADO") setRegisterResultado("UPGRADE");
                    if (st === "RECUSOU") setRegisterResultado("RECUSOU");
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="ATENDEU">✅ Atendeu – em negociação</option>
                  <option value="AGENDOU">📅 Agendou retorno</option>
                  <option value="NAO_ATENDEU">📵 Não atendeu</option>
                  <option value="FECHADO">🎯 Fechado (upgrade realizado)</option>
                  <option value="PERDIDO">❌ Perdido</option>
                  <option value="RECUSOU">🚫 Recusou upgrade</option>
                </select>
              </div>

              {/* Data de Retorno if status is AGENDOU */}
              {registerStatus === "AGENDOU" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">DATA DE RETORNO / RECONTATO</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-semibold"
                    value={registerDateRetorno}
                    onChange={e => setRegisterDateRetorno(e.target.value)}
                  />
                </div>
              )}

              {/* Results area if target active */}
              {(registerStatus === "ATENDEU" || registerStatus === "FECHADO") && (
                <div className="p-3 bg-sky-50/50 rounded-xl space-y-3 border border-sky-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Resultado Final</label>
                    <select
                      className="w-full card-modern border border-slate-200 rounded-xl py-1.5 px-2 text-xs font-bold text-sky-950"
                      value={registerResultado}
                      onChange={e => setRegisterResultado(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="UPGRADE">✅ Upgrade de plano</option>
                      <option value="DOWNGRADE">🔽 Downgrade de plano</option>
                      <option value="FIDELIZOU">🔒 Fidelizou (manteve o plano)</option>
                      <option value="RECUSOU">❌ Recusou upgrade</option>
                      <option value="ATUACAO">⚠️ Requer atuação (reclamação)</option>
                    </select>
                  </div>

                  {/* Sub area for plans details if upgrade/downgrade */}
                  {(registerResultado === "UPGRADE" || registerResultado === "DOWNGRADE") && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-400 uppercase">Plano Novo</label>
                        <input
                          type="text"
                          className="w-full card-modern border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-semibold"
                          placeholder="Ex: 600Mb"
                          value={registerPlanoNovo}
                          onChange={e => setRegisterPlanoNovo(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-slate-400 uppercase">Novo Valor (R$)</label>
                        <input
                          type="number"
                          className="w-full card-modern border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-semibold"
                          placeholder="Ex: 119.90"
                          value={registerValorNovo}
                          onChange={e => setRegisterValorNovo(e.target.value)}
                        />
                      </div>

                      {/* Display Delta */}
                      <div className="col-span-2 pt-2 flex items-center justify-between border-t border-t-slate-100 text-[10px] uppercase font-bold text-slate-500 pl-1">
                        <span>Δ Impacto mensal:</span>
                        <strong className={`text-xs font-black ${deltaValorCalculation > 0 ? "text-[#00A86B]" : deltaValorCalculation < 0 ? "text-rose-500" : "text-slate-650"}`}>
                          {deltaValorCalculation > 0 ? "+" : ""} R$ {deltaValorCalculation.toFixed(2).replace(".", ",")}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Observações / Detalhes de Retenção</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs"
                  rows={2}
                  maxLength={180}
                  placeholder="Ex: Reclamou do WiFi, ofereci WiFi Plus e upgrade por +R$10..."
                  value={registerObs}
                  onChange={e => setRegisterObs(e.target.value)}
                />
              </div>
            </div>
            
            {/* Right Column: Verification Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-1">Verificações Obrigatórias</h4>
                
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-3 shadow-sm">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerGloboplay} onChange={e => setRegisterGloboplay(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Globoplay Ativo?</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerAvaliacao} onChange={e => setRegisterAvaliacao(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Avaliação no Google realizada?</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerSuperApp} onChange={e => setRegisterSuperApp(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Super App instalado?</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerIndicacao} onChange={e => setRegisterIndicacao(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Cliente realizou Indicação?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerCanais} onChange={e => setRegisterCanais(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Orientado sobre Canais de Atendimento?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerContatoSalvo} onChange={e => setRegisterContatoSalvo(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Contato da Loja Salvo no celular?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerWifiTotal} onChange={e => setRegisterWifiTotal(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Interesse em WiFi Total?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={registerChipMovel} onChange={e => setRegisterChipMovel(e.target.checked)} className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">Oferecido Chip Móvel?</span>
                  </label>
                  
                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Qualidade da Conexão</label>
                    <select
                      className="w-full card-modern border border-slate-205 rounded-xl py-2 px-3 text-xs font-semibold"
                      value={registerQualidade}
                      onChange={e => setRegisterQualidade(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Ótima">🟢 Ótima (Sem reclamações)</option>
                      <option value="Boa">🟡 Boa (Pequenas instabilidades)</option>
                      <option value="Ruim">🔴 Ruim (Problemas frequentes)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* History Section */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-1 mb-2">
                Histórico de Contatos
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {actions.filter(a => a.idContrato === selectedClient.idContrato).length > 0 ? (
                  actions.filter(a => a.idContrato === selectedClient.idContrato)
                    .sort((a,b) => new Date(b.dataContato).getTime() - new Date(a.dataContato).getTime())
                    .map((act, i) => (
                      <div key={i} className="bg-slate-50 p-2.5 rounded-xl text-xs flex flex-col gap-1.5 shadow-sm border border-slate-100">
                         <div className="flex justify-between items-start">
                           <span className="font-extrabold text-slate-800">{act.consultor}</span>
                           <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">{new Date(act.dataContato.includes('T') ? act.dataContato : act.dataContato + 'T12:00:00').toLocaleDateString('pt-BR')} {act.dataContato.includes('T') ? new Date(act.dataContato).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : ''}</span>
                         </div>
                         <div className="flex flex-wrap items-center gap-1.5">
                           <span className="font-semibold text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{act.statusContato}</span>
                           <span className="font-semibold text-[10px] text-emerald-700 bg-[#E6FAF1] px-1.5 py-0.5 rounded border border-[#00A86B]/20">{act.resultado}</span>
                         </div>
                         {act.observacao && (
                           <p className="text-slate-600 font-medium leading-relaxed mt-0.5 whitespace-pre-wrap">{act.observacao}</p>
                         )}
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                    Nenhum histórico encontrado.
                  </div>
                )}
              </div>
            </div>

            {/* AI Plan Suggestions */}
            <div className="pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1 mb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  ✨ Sugestões de Oferta (IA)
                </h4>
                <button
                  onClick={() => handleGenerateAiSuggestions(selectedClient.valor)}
                  disabled={aiPlanSuggestionsLoading}
                  className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-1 rounded border border-sky-100 hover:bg-sky-100 transition disabled:opacity-50 flex items-center gap-1"
                >
                  {aiPlanSuggestionsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {aiPlanSuggestions.length > 0 ? "Atualizar" : "Gerar Opções"}
                </button>
              </div>
              
              {aiPlanSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {aiPlanSuggestions.map((sug, idx) => (
                    <div key={idx} className="bg-sky-50/50 border border-sky-100/50 rounded-xl p-3 flex flex-col gap-1.5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">{sug.tipo}</span>
                      </div>
                      <div className="font-extrabold text-sky-950 text-sm leading-tight">{sug.nomePlano}</div>
                      <div className="text-sky-700 font-bold text-lg border-b border-sky-100/50 pb-1.5 mb-0.5">
                        R$ {sug.valor}
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium leading-relaxed italic flex-1">
                        "{sug.motivo}"
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => handleCopySuggestion(sug, idx)}
                          className="flex flex-col items-center justify-center gap-1 card-modern border border-sky-100 rounded-lg p-1.5 text-sky-600 hover:bg-sky-100/50 transition-colors active:scale-95"
                          title="Copiar Texto"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-[#00A86B]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[8px] font-bold uppercase">{copiedIndex === idx ? "Copiado" : "Copiar"}</span>
                        </button>
                        <button
                          onClick={() => handleSendWhatsAppSuggestion(sug)}
                          className="flex flex-col items-center justify-center gap-1 bg-[#E6FAF1] border border-emerald-200 rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100 transition-colors active:scale-95"
                          title="Enviar no WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-bold uppercase">Enviar</span>
                        </button>
                        <button
                          onClick={() => handleN8nSend(sug, idx)}
                          disabled={n8nStatusIndex === idx}
                          className="flex flex-col items-center justify-center gap-1 bg-sky-50 border border-sky-200 rounded-lg p-1.5 text-sky-700 hover:bg-sky-100 transition-colors active:scale-95 disabled:opacity-50 disabled:scale-100"
                          title="Disparo via n8n"
                        >
                          {n8nStatusIndex === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Webhook className="w-3.5 h-3.5" />}
                          <span className="text-[8px] font-bold uppercase">n8n</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs font-medium text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  Clique em "Gerar Opções" para ver sugestões de planos personalizadas pelo valor atual do cliente.
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 mt-2">
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-extrabold rounded-lg active:scale-95"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveAction}
                className="px-4 py-2 bg-sky-900 text-white hover:bg-sky-950 text-xs font-extrabold rounded-lg shadow active:scale-95 transition"
              >
                Salvar Atendimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL IA CHURN ANALYSIS DIALOG */}
      {churnAIOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
          <div className="card-modern rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-sky-600 animate-pulse" /> IA: Análise de Ofensores
              </h3>
              <button 
                onClick={() => setChurnAIOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              {churnAILoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-sky-600 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <p className="text-sm font-bold animate-pulse">Sintetizando ofensores de churn e desistência...</p>
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-700 leading-relaxed text-left markdown-body space-y-3 prose prose-sm prose-sky">
                  <Markdown>{churnAIResponse}</Markdown>
                </div>
              )}
            </div>

            {!churnAILoading && churnAIResponse && (
               <div className="flex justify-end pt-2">
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(churnAIResponse);
                        alert("📋 Análise copiada!");
                     }}
                     className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition"
                   >
                     📋 Copiar Análise
                   </button>
               </div>
            )}
          </div>
        </div>
      )}

      {/* PORTAL IA APPORACH GENERATED DIALOG */}
      {isAIOpen && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[990] flex items-center justify-center p-4">
          <div className="card-modern rounded-2xl w-full max-w-sm p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-base font-extrabold text-sky-900 flex items-center gap-1.5 pl-0.5">
                <Sparkles className="w-5 h-5 text-sky-600 animate-spin-slow" /> Abordagem Inteligente IA
              </h3>
              <button 
                onClick={() => setIsAIOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg text-xs leading-none"
              >
                ✕
              </button>
            </div>

            {/* Overwrite Manual details bar inside Approach dialogue */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 space-y-2 text-xs">
              <p className="font-extrabold text-slate-800">📋 {selectedClient.nome}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="space-y-0.5">
                  <label className="text-[8px] font-bold text-slate-400 uppercase">Modificar WhatsApp</label>
                  <input
                    type="tel"
                    className="w-full card-modern border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-semibold"
                    placeholder="Ex: 51999990001"
                    value={manualWhatsApp}
                    onChange={e => {
                      const val = e.target.value;
                      setManualWhatsApp(val);
                      if (selectedClient) {
                        selectedClient.telefoneExterno = val;
                        const cacheData = { whatsapp: val, cpf: manualCpf, bairro: manualBairro, cidade: manualCidade };
                        localStorage.setItem(`cliente_${selectedClient.idContrato}_dados`, JSON.stringify(cacheData));
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-0.5">
                  <label className="text-[8px] font-bold text-slate-400 uppercase">Cadastrar CPF</label>
                  <input
                    type="text"
                    className="w-full card-modern border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-semibold"
                    placeholder="Ex: 123.456.789-00"
                    value={manualCpf}
                    onChange={e => setManualCpf(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="space-y-0.5">
                  <label className="text-[8px] font-bold text-slate-400 uppercase">Cidade</label>
                  <input
                    type="text"
                    className="w-full card-modern border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-semibold"
                    placeholder="Ex: Lajeado"
                    value={manualCidade}
                    onChange={e => setManualCidade(e.target.value)}
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[8px] font-bold text-slate-400 uppercase">Bairro</label>
                  <input
                    type="text"
                    className="w-full card-modern border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-semibold"
                    placeholder="Ex: Centro"
                    value={manualBairro}
                    onChange={e => setManualBairro(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveContactParams}
                className="w-full py-1 text-[10px] font-bold card-modern hover:bg-slate-100 border border-slate-200 text-slate-650 rounded-md transition"
              >
                ✓ Atualizar Contato localmente
              </button>
            </div>

            {/* IA Output status */}
            {aiLoading ? (
              <div className="py-8 text-center text-xs text-slate-450 space-y-3 font-medium">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
                <p>Analisando contrato e redigindo pitch regional...</p>
              </div>
            ) : (
              <div className="space-y-3 font-sans animate-fade-in">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 text-sky-950 font-medium font-sans text-xs p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {aiResponseText}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button 
                    onClick={handleClipboard}
                    className="py-2.5 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-150 font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    📋 Copiar Texto
                  </button>
                  <button
                    onClick={handleSendWA}
                    className="py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
                  >
                    <Smartphone className="w-4 h-4" /> Enviar Whats
                  </button>
                </div>
                
                <button
                  onClick={handleSendN8n}
                  disabled={n8nSending}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-sky-600 to-sky-800 text-white hover:opacity-90 font-black rounded-xl flex items-center justify-center gap-2 active:scale-95 transition shadow-md"
                >
                  {n8nSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {n8nSending ? "Processando..." : "Disparo Automático (n8n)"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* N8N Popup Modal */}
      {n8nPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setN8nPopup(null)}>
          <div 
            className="card-modern rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center transform scale-100 transition-transform"
            onClick={e => e.stopPropagation()}
            style={{ animation: '0.2s cubic-bezier(0.16, 1, 0.3, 1) 0s 1 normal forwards zoomIn' }}
          >
            {n8nPopup.type === 'error' ? (
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-100">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-[#E6FAF1] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#00A86B]/20">
                <CheckCircle className="w-8 h-8 text-[#00A86B]" />
              </div>
            )}
            
            <h3 className="text-lg font-black text-slate-800 mb-2">
              {n8nPopup.type === 'error' ? 'Falha no Disparo' : 'Disparo Realizado'}
            </h3>
            <p className="text-sm font-medium text-slate-600 mb-6">
              {n8nPopup.message}
            </p>
            <button
              onClick={() => setN8nPopup(null)}
              className={`w-full py-2.5 text-white rounded-xl text-sm font-bold shadow-sm transition active:scale-95 ${
                n8nPopup.type === 'error' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              Entendi
            </button>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes zoomIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}} />
        </div>
      )}

      {/* Bulk Transfer Modal */}
      {isBulkTransferOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                Transferir {selectedBulkIds.length} Clientes
              </h3>
              <button onClick={() => setIsBulkTransferOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Selecione o novo consultor para os clientes selecionados. Esta ação atualizará o responsável por eles.
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Novo Consultor</label>
                <select
                  value={targetBulkConsultor}
                  onChange={(e) => setTargetBulkConsultor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Selecione um consultor...</option>
                  {uniqueConsultores.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsBulkTransferOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkTransfer}
                disabled={!targetBulkConsultor || isTransferring}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isTransferring ? "Transferindo..." : "Transferir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
