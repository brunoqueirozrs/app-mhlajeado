/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, Search, Filter, AlertCircle, CheckCircle, Clock,
  Smartphone, MessageSquare, Plus, Save, Phone, ClipboardList,
  Sparkles, Bot, Trash, Play, Check, Send, ArrowUpRight, Share2, HelpCircle, RefreshCw, Download
} from "lucide-react";
import { Cobranca, CobrancaLog } from "../types";
import CobrancasDashboard from "./CobrancasDashboard";

interface CobrancasPageProps {
  cobrancas: Cobranca[];
  loggedUser: string;
  isAdmin: boolean;
  onUpdateCobranca: (cobranca: Cobranca) => Promise<void>;
  onRegisterCobrancaLog: (idContrato: string, log: Omit<CobrancaLog, "dataLog" | "operador">) => Promise<void>;
  onGenerateIAPitch: (cobranca: Cobranca) => Promise<string>;
  onRefreshData?: () => void;
}


const formatPlano = (plano?: string) => {
  if (!plano) return "Sem Plano";
  let result = plano;
  const match = plano.match(/(\d+\s*(?:Mbps|Gbps|Mb|Gb|Mega|Giga))/i);
  if (match) {
    result = match[1];
    if (/wifitotal/i.test(plano)) {
      result += " + WIFITotal";
    }
  }
  return result;
};

export default function CobrancasPage({
  cobrancas,
  loggedUser,
  isAdmin,
  onUpdateCobranca,
  onRegisterCobrancaLog,
  onGenerateIAPitch,
  onRefreshData
}: CobrancasPageProps) {
  const [viewMode, setViewMode] = useState<"lista" | "dashboard">("lista");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [filterCidade, setFilterCidade] = useState<string>("Todos");
  const [filterN8N, setFilterN8N] = useState<string>("NaoEnviado");
  const [sortBy, setSortBy] = useState<string>("atraso_desc");

  // Registro Rapido
  const [isRegistroRapidoOpen, setIsRegistroRapidoOpen] = useState(false);
  const [registroRapidoAtendeu, setRegistroRapidoAtendeu] = useState<boolean | null>(null);
  const [registroRapidoRelato, setRegistroRapidoRelato] = useState("");

  // Selected Billing Item
  const [selectedItem, setSelectedItem] = useState<Cobranca | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isContactLogOpen, setIsContactLogOpen] = useState(false);
  
  // Selection and N8N dispatch
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDispatching, setIsDispatching] = useState(false);
  const [isConfirmDispatchOpen, setIsConfirmDispatchOpen] = useState(false);

  // Form states for log registration
  const [logTipo, setLogTipo] = useState<"WhatsApp" | "Telefone" | "Sistema">("WhatsApp");
  const [logDescricao, setLogDescricao] = useState("");
  const [prometeuPagamento, setPrometeuPagamento] = useState(false);
  const [promessaData, setPromessaData] = useState("");
  const [contatoEfetivo, setContatoEfetivo] = useState(false);
  const [motivoInadimplencia, setMotivoInadimplencia] = useState("");

  // AI Message Generation States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDraftMessage, setAiDraftMessage] = useState("");

  // New Billing entry modal/form states
  const [isNewCobrancaOpen, setIsNewCobrancaOpen] = useState(false);
  const [newIdContrato, setNewIdContrato] = useState("");
  const [newNomeCliente, setNewNomeCliente] = useState("");
  const [newTelefone, setNewTelefone] = useState("");
  const [newValor, setNewValor] = useState("");
  const [newDataVencimento, setNewDataVencimento] = useState("");
  const [newCidade, setNewCidade] = useState("Lajeado");
  const [newPlano, setNewPlano] = useState("MHNET Fibra 300Mbps");
  const [newObs, setNewObs] = useState("");

  // Bulk spreadsheets copy-paste states
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkPreview, setBulkPreview] = useState<Cobranca[]>([]);

  // Parse TSV/Excel copy-paste data dynamically
  const parseBulkPaste = (text: string) => {
    if (!text.trim()) {
      setBulkPreview([]);
      return;
    }
    const lines = text.split(/\r?\n/);
    const results: Cobranca[] = [];
    
    // Attempt dynamic keyword mapping from first line if headers are present
    let headers: string[] = [];
    let dataStartIdx = 0;
    
    if (lines.length> 0) {
      const firstLineCells = lines[0].split("\t");
      const hasKeywords = firstLineCells.some(c => 
        /contrato|cliente|nome|valor|vencimento|telefone|cidade|plano/i.test(c)
      );
      if (hasKeywords) {
        headers = firstLineCells.map(h => h.trim().toLowerCase());
        dataStartIdx = 1;
      }
    }
    for (let i = dataStartIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cells = line.split("\t");
      if (cells.length < 2) continue;
      
      let idContrato = "";
      let nomeCliente = "";
      let telefone = "";
      let valor = 99.90;
      let dataVencimento = "";
      let cidade = "Lajeado";
      let plano = "MHNET Fibra 300Mbps";
      let observacao = "";
      let cpfCnpj = "";
      let celular = "";
      let bairro = "";
      let consultor = "";
      let campanha = "";
      let canal = "";
      let numeroFaturas = 1;
      let dataAtivacao = "";
      let acaoEnvio = "";
      
      if (headers.length> 0) {
        headers.forEach((h, cellIdx) => {
          const val = (cells[cellIdx] || "").trim();
          if (!val) return;
          if (h.includes("contrato") || h.includes("código") || h.includes("id")) idContrato = val;
          else if (h.includes("cliente") || h.includes("nome") && !h.includes("bairro")) nomeCliente = val;
          else if (h.includes("telefone") && !h.includes("celular")) telefone = val;
          else if (h.match(/^valor|emissão/i)) {
            const num = parseFloat(val.replace(/[^\d,.-]/g, "").replace(",", "."));
            if (!isNaN(num)) valor = num;
          }
          else if (h.includes("vencimento")) dataVencimento = val;
          else if (h.match(/^cidade|^município/i)) cidade = val;
          else if (h.match(/^plano|^serviço|^descrição produto/i)) plano = val;
          else if (h.match(/^obs/i)) observacao = val;
          // New matches
          else if (h.includes("cpf") || h.includes("cnpj")) cpfCnpj = val;
          else if (h.includes("celular")) celular = val;
          else if (h.includes("bairro")) bairro = val;
          else if (h.includes("consultor") || h.match(/^vendedor/i)) consultor = val;
          else if (h.includes("campanha")) campanha = val;
          else if (h.includes("canal")) canal = val;
          else if (h.includes("faturas vencidas") || h.includes("n° faturas")) {
            const fnum = parseInt(val, 10);
            if (!isNaN(fnum)) numeroFaturas = fnum;
          }
          else if (h.match(/^data.*ativação/i)) dataAtivacao = val;
          else if (h.match(/^ação/i) || h.match(/^status.*envio/i)) acaoEnvio = val;
        });
      } else {
        // Fallback positional:
        idContrato = cells[0]?.trim() || "";
        nomeCliente = cells[1]?.trim() || "";
        telefone = cells[2]?.trim() || "";
        const valRaw = cells[3]?.trim();
        if (valRaw) {
          const num = parseFloat(valRaw.replace(/[^\d,.-]/g, "").replace(",", "."));
          if (!isNaN(num)) valor = num;
        }
        dataVencimento = cells[4]?.trim() || "";
        cidade = cells[5]?.trim() || "Lajeado";
        plano = cells[6]?.trim() || "MHNET Fibra 300Mbps";
        observacao = cells[7]?.trim() || "";
      }
      
      if (!idContrato || !nomeCliente) continue;
      
      // Normalize dates from DD/MM/YYYY to YYYY-MM-DD
      if (dataVencimento.includes("/")) {
        const parts = dataVencimento.split("/");
        if (parts.length === 3) {
          let y = parts[2].trim();
          if (y.length === 2) y = "20" + y;
          const m = parts[1].trim().padStart(2, "0");
          const d = parts[0].trim().padStart(2, "0");
          dataVencimento = `${y}-${m}-${d}`;
        }
      } else if (!dataVencimento) {
        dataVencimento = new Date().toISOString().split("T")[0];
      }
      
      // Calculate delay in days
      let diasAtraso = 12;
      const dVent = new Date(dataVencimento + "T12:00:00");
      if (!isNaN(dVent.getTime())) {
        const diffTime = Date.now() - dVent.getTime();
        const calculated = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (calculated > 0) {
          diasAtraso = calculated;
        } else {
          diasAtraso = 0;
        }
      }
      
      results.push({
        idContrato,
        nomeCliente,
        telefone,
        valor,
        dataVencimento,
        cidade,
        plano,
        status: diasAtraso > 0 ? "Vencido" : "Pendente",
        diasAtraso,
        observacao: observacao || "Importado da planilha",
        historicoContatos: [],
        cpfCnpj,
        celular,
        bairro,
        consultor,
        campanha,
        canal,
        dataAtivacao,
        numeroFaturas,
        acaoEnvio: acaoEnvio || (diasAtraso > 0 ? "Pendente" : "")
      });
    }
    setBulkPreview(results);
  };

  const handleSaveBulk = async () => {
    if (bulkPreview.length === 0) return;
    try {
      const response = await fetch("/api/cobrancas/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list: bulkPreview, overwrite: false })
      });
      if (!response.ok) {
        throw new Error("Erro na comunicação com o servidor.");
      }
      const data = await response.json();
      if (data.status === "success") {
        alert(`Sucesso! ${bulkPreview.length} cobranças salvas e consolidadas no banco de dados!`);
        setIsBulkImportOpen(false);
        setBulkText("");
        setBulkPreview([]);
        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        throw new Error(data.message || "Erro desconhecido");
      }
    } catch (e: any) {
      alert("Falha ao salvar cobranças: " + e.message);
    }
  };

  // Auto-select first item when details or something opens
  const handleOpenDetails = (item: Cobranca) => {
    setSelectedItem(item);
    setAiDraftMessage("");
    setIsDetailsOpen(true);
  };

  const handleOpenContactLog = (item: Cobranca) => {
    setSelectedItem(item);
    setLogDescricao("");
    setPrometeuPagamento(false);
    setPromessaData("");
    setContatoEfetivo(false);
    setMotivoInadimplencia("");
    setIsContactLogOpen(true);
  };

  // Submit contact log
  
  const handleRegistroRapidoSubmit = async (atendeu: boolean, relato?: string) => {
    if (!selectedItem) return;
    try {
      if (atendeu === false) {
        await onRegisterCobrancaLog(selectedItem.idContrato, {
          tipo: "Telefone",
          descricao: "Tentativa de chamada sem sucesso",
          contatoEfetivo: false,
          acordoFirmado: false,
          motivoInadimplencia: ""
        });
        alert("Tentativa de chamada registrada!");
      } else {
        if (!relato?.trim()) {
          alert("Por favor, preencha o relato.");
          return;
        }
        await onRegisterCobrancaLog(selectedItem.idContrato, {
          tipo: "Telefone",
          descricao: "Chamada atendida: " + relato,
          contatoEfetivo: true,
          acordoFirmado: false,
          motivoInadimplencia: ""
        });
        alert("Relato registrado!");
      }
      setIsRegistroRapidoOpen(false);
      setRegistroRapidoAtendeu(null);
      setRegistroRapidoRelato("");
      
      // We rely on parent updates to refresh 'cobrancas', but we can try to find fresh locally if it mutates
      // Usually the parent mutation triggers re-render, we don't need to manually re-find unless necessary.
      // We will do nothing because we don't have fresh 'cobrancas' available directly inside a closure easily if not careful, 
      // but 'cobrancas' is a prop so it might refresh the selectedItem if we find it.
      const fresh = cobrancas.find(x => x.idContrato === selectedItem.idContrato);
      if (fresh) setSelectedItem(fresh);

    } catch (e: any) {
      alert("Erro ao registrar ligação: " + e.message);
    }
  };

  const handleSubmitContactLog = async () => {
    if (!selectedItem) return;
    if (!logDescricao.trim()) {
      alert("Por favor, descreva o resumo do contato!");
      return;
    }

    try {
      // 1. Register log entry
      await onRegisterCobrancaLog(selectedItem.idContrato, {
        tipo: logTipo,
        descricao: logDescricao + (prometeuPagamento ? ` [Acordo: Promessa de pagamento para ${promessaData}]` : "") + (motivoInadimplencia ? ` [Motivo: ${motivoInadimplencia}]` : ""),
        contatoEfetivo,
        acordoFirmado: prometeuPagamento,
        motivoInadimplencia
      });

      // 2. Compute status update if agreed
      const updatedItem = { ...selectedItem };
      if (prometeuPagamento) {
        updatedItem.status = "Negociando";
        updatedItem.observacao = `Promessa de pgto: ${promessaData}. ` + logDescricao;
        await onUpdateCobranca(updatedItem);
      }

      alert("Atendimento de cobrança registrado com sucesso!");
      setIsContactLogOpen(false);
      
      // Update selected item reference to show log live
      const fresh = cobrancas.find(x => x.idContrato === selectedItem.idContrato);
      if (fresh) {
        setSelectedItem(fresh);
      }
    } catch (e: any) {
      alert("Erro ao registrar atendimento: " + e.message);
    }
  };

  // Mark invoice as PAID
  const handleMarkAsPaid = async (item: Cobranca) => {
    if (!window.confirm(`Confirmar recebimento da fatura do cliente ${item.nomeCliente} no valor de R$ ${Number(item.valor).toFixed(2)}?`)) {
      return;
    }

    try {
      const today = new Date();
      const updated: Cobranca = {
        ...item,
        status: "Pago",
        dataPagamento: today.toLocaleDateString("pt-BR"),
        diasAtraso: 0,
        observacao: `Fatura quitada em ${today.toLocaleDateString("pt-BR")}. Contato feito por ${loggedUser}.`
      };

      await onUpdateCobranca(updated);
      
      // Add auto-log
      await onRegisterCobrancaLog(item.idContrato, {
        tipo: "Sistema",
        descricao: `Recebimento confirmado via painel por ${loggedUser}. Status alterado de ${item.status} para Pago.`
      });

      alert("Fatura baixada com sucesso!");
      setIsDetailsOpen(false);
    } catch (e: any) {
      alert("Erro ao dar baixa na fatura: " + e.message);
    }
  };

  // Request AI Customized approach message via Gemini API
  const handleRequestAiDraft = async () => {
    if (!selectedItem) return;
    setAiGenerating(true);
    setAiDraftMessage("");
    try {
      const msg = await onGenerateIAPitch(selectedItem);
      setAiDraftMessage(msg);
    } catch (e) {
      setAiDraftMessage("Olá! Identificamos uma pendência em sua assinatura MHNET. Por favor, regularize via código pix ou boleto bancário.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Launch pre-filled WhatsApp Web link
  const handleOpenWhatsAppChat = (item: Cobranca, customMessage?: string) => {
    const textToUse = customMessage || `Olá, ${item.nomeCliente}! Tudo bem? Sou da MHNET e notamos a pendência da fatura do plano ${item.plano}, no valor de de R$ ${Number(item.valor).toFixed(2)}, vencida em ${item.dataVencimento}. Gostaríamos de prestar o melhor atendimento para que continue navegando na velocidade máxima! Posso ajudar com a 2ª via?`;
    const cleanPhone = item.telefone.replace(/\D/g, "");
    const encoded = encodeURIComponent(textToUse);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, "_blank");
  };

  // Trigger quick manual charge creation
  const handleCreateNewCobranca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdContrato || !newNomeCliente || !newTelefone || !newValor || !newDataVencimento) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const parsedValor = parseFloat(newValor.replace(",", "."));
      if (isNaN(parsedValor) || parsedValor <= 0) {
        alert("Digite um valor válido para a cobrança!");
        return;
      }

      // Calculate initial delay
      let calculatedDelay = 0;
      try {
        const [dia, mes, ano] = newDataVencimento.split("/").map(Number);
        const vencDate = new Date(ano, mes - 1, dia);
        const diffTime = new Date().getTime() - vencDate.getTime();
        calculatedDelay = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      } catch (e) {}

      const newEntry: Cobranca = {
        idContrato: newIdContrato.toUpperCase().trim(),
        nomeCliente: newNomeCliente.trim(),
        telefone: newTelefone.trim(),
        valor: parsedValor,
        dataVencimento: newDataVencimento,
        status: calculatedDelay> 0 ? "Vencido" : "Pendente",
        diasAtraso: calculatedDelay,
        cidade: newCidade,
        plano: newPlano,
        observacao: newObs.trim() || undefined,
        historicoContatos: [
          {
            dataLog: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"}),
            operador: loggedUser,
            tipo: "Sistema",
            descricao: "Cobrança cadastrada manualmente no painel por " + loggedUser
          }
        ]
      };

      // Call update endpoint for write
      await onUpdateCobranca(newEntry);
      alert("Nova cobrança anotada com sucesso!");
      setIsNewCobrancaOpen(false);

      // Clean inputs
      setNewIdContrato("");
      setNewNomeCliente("");
      setNewTelefone("");
      setNewValor("");
      setNewDataVencimento("");
      setNewObs("");
    } catch (e: any) {
      alert("Erro ao cadastrar cobrança: " + e.message);
    }
  };

  // Get unique list of cities for dropdown
  const cidadesDisponiveis = Array.from(new Set(cobrancas.map(c => c.cidade || "Outro"))).filter(Boolean);

  // Compute stats/KPI cards
  const totalRecebido = cobrancas
    .filter(c => c.status === "Pago")
    .reduce((acc, c) => acc + (c.valor || 0), 0);

  const totalVencido = cobrancas
    .filter(c => c.status === "Vencido")
    .reduce((acc, c) => acc + (c.valor || 0), 0);

  const totalNegociando = cobrancas
    .filter(c => c.status === "Negociando")
    .reduce((acc, c) => acc + (c.valor || 0), 0);

  const totalAPendente = cobrancas
    .filter(c => c.status === "Pendente")
    .reduce((acc, c) => acc + (c.valor || 0), 0);

  const totalContratosVencidos = cobrancas.filter(c => c.status === "Vencido").length;
  const totalContratosAtendidos = cobrancas.filter(c => c.historicoContatos.length> 1).length;

  const totalClientesValidos = cobrancas.length;
  const taxaAdimplencia = totalClientesValidos> 0 
    ? Math.round(((cobrancas.filter(c => c.status === "Pago" || c.status === "Pendente").length) / totalClientesValidos) * 100)
    : 100;

  const totalEmFila = cobrancas.filter(c => c.statusEnvio === "Em Fila").length;
  const totalEnviado = cobrancas.filter(c => c.statusEnvio === "Enviado").length;
  const totalN8N = totalEmFila + totalEnviado;
  const progressPercent = totalN8N> 0 ? Math.round((totalEnviado / totalN8N) * 100) : 0;
  const estMinutes = Math.ceil((totalEmFila * 90) / 60);

  // Auto-filter based on N8N rules
  const validLeadsForBilling = cobrancas.filter(c => {
    // Excluir Estágio Atual = Cancelado
    if (c.estagioContrato && c.estagioContrato.toLowerCase().trim() === "cancelado") return false;
    // Excluir Status = Pago
    if (c.status === "Pago") return false;
    // Telefone/Celular vazio
    if (!c.telefone && !c.celular) return false;
    return true;
  });

  // Filter List results
  const filteredList = validLeadsForBilling.filter(c => {
    // 1. Search term
    const s = searchTerm.toLowerCase().trim();
    if (s) {
      const matchName = c.nomeCliente.toLowerCase().includes(s);
      const matchContrato = c.idContrato.toLowerCase().includes(s);
      if (!matchName && !matchContrato) return false;
    }

    // 2. Status dropdown Filter
    if (filterStatus !== "Todos") {
      if (filterStatus === "Pendente" && c.status !== "Pendente") return false;
      if (filterStatus === "Vencido" && c.status !== "Vencido") return false;
      if (filterStatus === "Pago" && c.status !== "Pago") return false;
      if (filterStatus === "Negociando" && c.status !== "Negociando") return false;
    }

    // 3. City Filter
    if (filterCidade !== "Todos" && c.cidade !== filterCidade) return false;

    // 4. N8N Filter
    if (filterN8N !== "Todos") {
      if (filterN8N === "NaoEnviado" && (c.statusEnvio === "Enviado" || c.statusEnvio === "Em Fila")) return false;
      if (filterN8N === "Enviado" && c.statusEnvio !== "Enviado") return false;
      if (filterN8N === "EmFila" && c.statusEnvio !== "Em Fila") return false;
      if (filterN8N === "Erro" && c.statusEnvio !== "Erro") return false;
    }

    return true;
  });

  // Sort list results
  filteredList.sort((a, b) => {
    if (sortBy === "atraso_desc") return (b.diasAtraso || 0) - (a.diasAtraso || 0);
    if (sortBy === "valor_desc") return b.valor - a.valor;
    if (sortBy === "valor_asc") return a.valor - b.valor;
    if (sortBy === "nome_asc") return a.nomeCliente.localeCompare(b.nomeCliente);
    return 0;
  });

  // Selection toggle handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(c => c.idContrato)));
    }
  };

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = [
      "CPF/CNPJ", "Cliente", "Cidade", "Bairro", "Telefone", "Celular", 
      "Vencimento", "Dias Atraso", "Faturas", "Valor", "Plano", "Baixou App", 
      "Status N8N", "Ação de Envio"
    ];
    const rows = filteredList.map(c => [
      c.cpfCnpj,
      c.nomeCliente,
      c.cidade,
      c.bairro,
      c.telefone,
      c.celular,
      c.dataVencimento,
      c.diasAtraso,
      c.numeroFaturas,
      c.valor,
      c.plano,
      c.baixouApp,
      c.statusEnvio,
      c.acaoEnvio || "Pendente"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `extracao_cobrancas_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSingleDispatch = async (c: Cobranca) => {
    if (!window.confirm(`Confirmar envio manual para ${c.nomeCliente}?`)) return;
    try {
      const selectedClients = [{
        codigo_cliente: c.idContrato,
        nome: c.nomeCliente,
        telefone: c.celular || c.telefone || "",
        data_instalacao: c.dataAtivacao || "",
        total_faturas_vencidas: c.numeroFaturas || 1,
        baixou_app: c.baixouApp || "Não",
        descricao_produto: c.plano || ""
      }];
      const res = await fetch("/api/cobrancas/disparar-n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientes: selectedClients })
      });
      if (!res.ok) throw new Error("Erro na comunicação com o servidor.");
      alert(`✅ Enviado com sucesso para o N8N.\nStatus na tabela atualizado para 'Em Fila'.`);
      if (onRefreshData) onRefreshData();
    } catch (error: any) {
      alert("Falha ao disparar envio: " + error.message);
    }
  };

  const confirmAndDispatch = async () => {
    setIsConfirmDispatchOpen(false);
    setIsDispatching(true);
    try {
      const selectedClients = cobrancas
        .filter(c => selectedIds.has(c.idContrato) && c.statusEnvio !== "Enviado" && c.statusEnvio !== "Em Fila")
        .map(c => ({
          codigo_cliente: c.idContrato,
          nome: c.nomeCliente,
          telefone: c.celular || c.telefone || "",
          data_instalacao: c.dataAtivacao || "",
          total_faturas_vencidas: c.numeroFaturas || 1,
          baixou_app: c.baixouApp || "Não",
          descricao_produto: c.plano || ""
        }));

      if (selectedClients.length === 0) {
        alert("Todos os clientes selecionados já foram enviados ou estão na fila.");
        return;
      }

      const res = await fetch("/api/cobrancas/disparar-n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientes: selectedClients })
      });

      if (!res.ok) throw new Error("Erro na comunicação com o servidor.");
      
      alert(`✅ Lote enviado com sucesso para o N8N.\nStatus na tabela atualizado para 'Em Fila'.`);
      setSelectedIds(new Set());
      if (onRefreshData) onRefreshData();
    } catch (error: any) {
      alert("Falha ao disparar lote: " + error.message);
    } finally {
      setIsDispatching(false);
    }
  };

  if (viewMode === "dashboard") {
    return (
      <CobrancasDashboard 
        cobrancas={cobrancas} 
        onClose={() => setViewMode("lista")} 
        onOpenDetails={(item) => handleOpenContactLog(item)} />
    );
  }

  return (
    <div id="cobrancas-module" className="cobrancas-page-container space-y-6 font-sans relative">

      {/* Modal Confirmar Disparo */}
      {isConfirmDispatchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Confirmar Disparo</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Você disparará mensagens para <strong className="text-slate-800">{selectedIds.size} clientes</strong>.
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Tempo estimado: <strong className="text-slate-800">{
                    (() => {
                      const estTime = Math.ceil((selectedIds.size * 90) / 60);
                      return estTime> 60 ? `${Math.floor(estTime/60)}h ${estTime%60}min` : `${estTime} min`;
                    })()
                  }</strong>
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsConfirmDispatchOpen(false)} className="px-4 py-2 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button onClick={confirmAndDispatch} className="px-4 py-2 font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 justify-start">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Módulo Financeiro PAP</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-none">Gestão de Cobrança & Mensalidades</h1>
          <p className="text-xs text-slate-400 font-semibold">Consulte, cobre no WhatsApp via IA, e controle inadimplência da sua base direta do Vale do Taquari</p>
        </div>
        <div className="flex gap-2">
          {onRefreshData && (
            <button onClick={onRefreshData} className="p-2.5 card-modern border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-sky-600 rounded-xl transition cursor-pointer"
              title="Recarregar Clientes e Contas da Planilha"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20 cursor-pointer transition active:scale-95 shrink-0"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Dashboard Gerencial</span>
          </button>
          <button onClick={() => setIsBulkImportOpen(true)} className="flex items-center gap-2 px-4 py-2.5 card-modern hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition active:scale-95 shrink-0"
            title="Importar cobranças direto de planilhas copiando e colando"
          >
            <ClipboardList className="w-4.5 h-4.5" />
            <span>Importar</span>
          </button>
          
          <button onClick={() => setIsNewCobrancaOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/10 cursor-pointer transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir Manual</span>
          </button>
        </div>
      </div>
      {/* ANALYTICAL DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Core numbers */}
        <div className="card-modern border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-center space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Em Atraso</span>
            <div className="bg-rose-50 px-2 py-0.5 rounded text-rose-600 text-xs font-bold font-mono">
              {cobrancas.filter(c => c.diasAtraso> 0).length} clientes
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Em Dia (Pagos/Pendentes)</span>
            <div className="bg-[#E6FAF1] px-2 py-0.5 rounded text-[#00A86B] text-xs font-bold font-mono">
              {cobrancas.filter(c => c.diasAtraso <= 0).length} clientes
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">A Serem Chamados</span>
            <div className="bg-amber-100 px-2 py-0.5 rounded text-amber-700 text-xs font-bold font-mono">
              {cobrancas.filter(c => c.diasAtraso> 0 && (!c.acaoEnvio || c.acaoEnvio === "Sem Contato" || c.acaoEnvio === "Pendente")).length}
            </div>
          </div>
        </div>

        {/* Cidades Inadimplência */}
        <div className="card-modern border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Inadimplência por Cidade (Top 3)</div>
          <div className="space-y-2 flex-1">
            {Object.entries(
              cobrancas.filter(c => c.diasAtraso> 0).reduce((acc, curr) => {
                const city = curr.cidade || "Desconhecida";
                acc[city] = (acc[city] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([city, count]) => (
              <div key={city} className="flex justify-between items-center text-xs">
                <span className="text-slate-800 font-bold truncate pr-2">{city}</span>
                <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bairros Inadimplência */}
        <div className="card-modern border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Inadimplência Bairro/Cid (Top 3)</div>
          <div className="space-y-2 flex-1">
            {Object.entries(
              cobrancas.filter(c => c.diasAtraso> 0).reduce((acc, curr) => {
                const bn = `${curr.bairro || "Sem bairro"} (${curr.cidade || ""})`;
                acc[bn] = (acc[bn] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([bairro, count]) => (
              <div key={bairro} className="flex justify-between items-center text-xs">
                <span className="text-slate-800 font-bold truncate pr-2" title={bairro}>{bairro}</span>
                <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Perfil Planos */}
        <div className="bg-gradient-to-tr from-slate-900 to-sky-950 text-white border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col">
          <div className="text-[9px] text-sky-300 font-bold uppercase tracking-wider mb-2">Planos mais Inadimplentes</div>
          <div className="space-y-2 flex-1">
            {Object.entries(
              cobrancas.filter(c => c.diasAtraso> 0).reduce((acc, curr) => {
                const p = formatPlano(curr.plano) || "Outros";
                acc[p] = (acc[p] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([plano, count]) => (
              <div key={plano} className="flex justify-between items-center text-xs">
                <span className="text-sky-100 font-semibold truncate pr-2" title={plano}>{plano}</span>
                <span className="font-mono text-sky-300 bg-black/20 px-1.5 py-0.5 rounded text-[10px]">{count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FILTER SEARCH CRITERIA ROW */}
      <div className="card-modern border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          <div className="sm:col-span-4 relative font-sans">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input type="text"
              placeholder="Pesquisar por Código, Nome..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 hover:bg-slate-50 focus:bg-white leading-none transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}>
              <option value="Todos">Status: Todos</option>
              <option value="Pendente">A vencer / Pendente</option>
              <option value="Vencido">Atrasado / Vencido</option>
              <option value="Negociando">Em Negociação / Acordo</option>
              <option value="Pago">Quitado / Pago</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              value={filterCidade}
              onChange={e => setFilterCidade(e.target.value)}>
              <option value="Todos">Cidade: Todas</option>
              {cidadesDisponiveis.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              value={filterN8N}
              onChange={e => setFilterN8N(e.target.value)}>
              <option value="Todos">N8N: Todos</option>
              <option value="NaoEnviado">N8N: Não Enviados</option>
              <option value="Enviado">N8N: Enviados</option>
              <option value="EmFila">N8N: Em Fila</option>
              <option value="Erro">N8N: Com Erro</option>
            </select>
          </div>
        </div>
      </div>

      {/* CORE CHARGES TABLE LISTING */}
      <div className="card-modern border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Bulk Action Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-3 sm:px-5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input type="checkbox"
              id="select-all-cobrancas"
              checked={selectedIds.size > 0 && selectedIds.size === filteredList.length}
              ref={input => {
                if (input) {
                  input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredList.length;
                }
              }}
              onChange={handleToggleSelectAll} className="w-4 h-4 text-sky-600 bg-white border-slate-300 rounded cursor-pointer"
            />
            <label htmlFor="select-all-cobrancas" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
              {selectedIds.size> 0 
                ? `${selectedIds.size} clientes selecionados (de ${filteredList.length} filtrados)` 
                : `Selecionar todos (${filteredList.length} filtrados)`}
            </label>
          </div>

          <div className="flex gap-2">
            <button onClick={handleExportCSV}
                  
                  disabled={filteredList.length === 0} className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                filteredList.length> 0
                  ? "bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}>
              <Download className="w-3.5 h-3.5" />
              Extrair Planilha
            </button>
            <button onClick={() => {
                if (onRefreshData) {
                  onRefreshData();
                  alert("Sincronizando cobranças com a planilha Google Sheets...");
                }
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar Planilha
            </button>
            <button id="btn-disparo-massa"
              onClick={() => setIsConfirmDispatchOpen(true)}
                  
                  disabled={selectedIds.size === 0 || isDispatching} className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2
                ${selectedIds.size> 0 && !isDispatching
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
              {isDispatching ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-rose-500 rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Disparar cobrança
            </button>
          </div>
        </div>

        {/* Evolução de Envios N8N - Abaixo dos botões */}
        {totalN8N> 0 && (
          <div className="bg-white border-b border-slate-100 p-4 sm:px-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                {totalEmFila> 0 ? (
                  <RefreshCw className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span className="text-slate-700">Progresso de Disparo</span>
              </div>
              <span className="text-slate-500">
                {totalEnviado}/{totalN8N} clientes processados
              </span>
            </div>
            
            <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
              {totalEmFila> 0 && (
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        )}

        <div className="hidden md:block overflow-x-auto whitespace-nowrap">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[9.5px] font-black uppercase text-slate-400 select-none tracking-widest">
                <th className="py-4 px-4 w-10 text-center">
                  <input type="checkbox" className="cobrancas-table-header w-3.5 h-3.5 text-sky-600 bg-white border-slate-300 rounded cursor-pointer"
                    checked={selectedIds.size > 0 && selectedIds.size === filteredList.length}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredList.length;
                      }
                    }}
                    onChange={handleToggleSelectAll}
                    title="Selecionar todos os filtrados"
                  />
                </th>
                <th className="py-4 px-4">CPF/CNPJ e Cliente</th>
                <th className="py-4 px-4">Localização e Contatos</th>
                <th className="py-4 px-4">Faturamento e Atraso</th>
                <th className="py-4 px-4">App / Info</th>
                <th className="py-4 px-4">Status do Envio</th>
                <th className="py-4 px-4 text-right pr-6">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length> 0 ? (
                filteredList.map((item, index) => {
                     
                  return (
                    <tr key={`${item.idContrato}-${index}`} className={`hover:bg-slate-50/50 transition duration-100 alignment cursor-pointer ${selectedIds.has(item.idContrato) ? 'bg-sky-50/30' : ''}`} onClick={(e) => {
                        if ((e.target as HTMLElement).closest('input[type="checkbox"], button')) return;
                        handleOpenDetails(item);
                      }}>
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input type="checkbox"
                          checked={selectedIds.has(item.idContrato)}
                          onChange={() => handleToggleRow(item.idContrato)} className="w-4 h-4 text-sky-600 bg-white border-slate-300 rounded cursor-pointer"
                        />
                      </td>

                      {/* CPF/CNPJ e Cliente */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="text-[10px] text-slate-400 font-mono font-bold tracking-tight mb-0.5" title="Código / CPF">
                          {item.cpfCnpj || item.idContrato}
                        </div>
                        <div className="font-extrabold text-slate-800 leading-tight block truncate whitespace-normal max-w-[200px] transform hover:scale-105 hover:text-sky-600 transition-all origin-left cursor-pointer" title={item.nomeCliente}>
                          {item.nomeCliente}
                        </div>
                      </td>

                      {/* Localização e Contatos */}
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="text-[11px] font-bold text-slate-700 truncate mb-0.5">
                          {item.bairro ? `${item.bairro}, ` : ""}{item.cidade || "Lajeado"}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span title="Telefone Principal">{item.telefone}</span>
                          {item.celular && (
                            <span className="text-slate-400" title="Celular"> / {item.celular}</span>
                          )}
                        </div>
                      </td>

                      {/* Faturamento, Vencimento, Nº Faturas e Dias de Atraso */}
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${item.diasAtraso> 0 ? "bg-rose-50 text-rose-700" : "bg-[#E6FAF1] text-emerald-700"}`}>
                            {item.diasAtraso> 0 ? "Em Atraso" : "Em Dia"}
                          </span>
                          <span className="font-extrabold text-rose-600 font-mono text-[11px] flex items-center" title="Dias Intevalo Hoje - Vencimento">
                            {item.diasAtraso> 0 && <span className="mr-1">{item.diasAtraso}d</span>}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold max-w-[140px] truncate">
                          {item.numeroFaturas ? `${item.numeroFaturas} faturas` : "1 fatura"} {item.dataVencimento && `· Venc: ${item.dataVencimento}`}
                        </div>
                      </td>

                      {/* App / Info */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
                          Baixou App: <span className={item.baixouApp === "Sim" ? "text-emerald-600" : "text-amber-600"}>{item.baixouApp || "Não"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]" title="Plano">
                          {formatPlano(item.plano)}
                        </div>
                      </td>
                      {/* Status de Envio */}
                      <td className="py-3 px-4 min-w-[140px]">
                        {(!item.statusEnvio || item.statusEnvio === "Pendente") ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            Pendente
                          </span>
                        ) : item.statusEnvio === "Enviado" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Enviado
                          </span>
                        ) : item.statusEnvio === "Erro" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Erro
                          </span>
                        ) : item.statusEnvio === "Em Fila" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                            Em Fila
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {item.statusEnvio}
                          </span>
                        )}
                      </td>
                      {/* Ações Rápidas */}
                      <td className="py-3 px-4 text-right pr-6 min-w-[150px]">
                        <div className="flex justify-end gap-1.5 font-sans">
                          {/* Manual Dispatch N8N Button */}
                          <button 
                            onClick={() => handleSingleDispatch(item)}
                            disabled={item.statusEnvio === "Enviado" || item.statusEnvio === "Em Fila"}
                            className={`px-2.5 py-1.5 border rounded-lg text-[10.5px] uppercase font-black tracking-wide transition flex items-center gap-1 ${
                              item.statusEnvio === "Enviado" || item.statusEnvio === "Em Fila"
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-slate-50 hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 cursor-pointer"
                            }`}
                            title={item.statusEnvio === "Enviado" || item.statusEnvio === "Em Fila" ? "Já enviado ao N8N" : "Disparo Manual (N8N)"}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar</span>
                          </button>

                          {/* Quick WhatsApp push */}
                          <button 
                            onClick={() => handleOpenWhatsAppChat(item)}
                            className="p-1.5 bg-[#E6FAF1] hover:bg-emerald-100 text-[#00A86B] border border-emerald-250 rounded-lg cursor-pointer transition"
                            title="Cobrar diretamente no WhatsApp (Texto padrão)"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Mark paid Quick */}
                          <button 
                            onClick={() => handleMarkAsPaid(item)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer transition shadow-sm active:scale-90"
                            title="Confirmar pagamento ou baixar"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-sans">
                    <AlertCircle className="w-9 h-9 text-slate-350 mx-auto mb-2" />
                    <p className="font-extrabold uppercase text-[10px] text-slate-500">Nenhuma cobrança encontrada</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">Revise o termo de pesquisa ou altere os filtros selecionados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (telas pequenas) */}
        <div className="md:hidden divide-y divide-slate-100 font-sans">
          {filteredList.length> 0 ? (
            filteredList.map((item, index) => (
              <div key={`${item.idContrato}-${index}`} className="p-4 bg-white space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono font-bold tracking-tight mb-0.5">{item.cpfCnpj || item.idContrato}</div>
                    <div className="font-extrabold text-slate-800 leading-tight text-sm transform hover:scale-105 hover:text-sky-600 transition-all origin-left cursor-pointer">{item.nomeCliente}</div>
                  </div>
                  <span className={`shrink-0 inline-block px-2 py-1 rounded-lg text-[9px] font-black uppercase ${item.diasAtraso> 0 ? "bg-rose-50 text-rose-700" : "bg-[#E6FAF1] text-emerald-700"}`}>
                    {item.diasAtraso> 0 ? "Em Atraso" : "Em Dia"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Localização</span>
                    <span className="font-semibold text-slate-700">{item.bairro ? `${item.bairro}, ` : ""}{item.cidade || "Lajeado"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vencimento</span>
                    <span className="font-bold text-rose-600">{item.dataVencimento} {item.diasAtraso> 0 && `(${item.diasAtraso}d)`}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Contatos</span>
                    <span className="text-slate-600">{item.telefone} {item.celular && `/ ${item.celular}`}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultor</span>
                    <span className="text-slate-600 truncate">{item.consultor || "—"}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <input type="checkbox"
                      checked={selectedIds.has(item.idContrato)}
                      onChange={() => handleToggleRow(item.idContrato)} className="w-4 h-4 text-sky-600 bg-white border-slate-300 rounded cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-600">
                      Selecionar
                    </span>
                  </div>
                  <div className="text-right">
                    {item.statusEnvio === "Enviado" && <span className="text-[10px] font-bold text-emerald-600">Enviado</span>}
                    {item.statusEnvio === "Em Fila" && <span className="text-[10px] font-bold text-sky-600">Em Fila</span>}
                    {item.statusEnvio === "Erro" && <span className="text-[10px] font-bold text-rose-600">Erro</span>}
                    {(!item.statusEnvio || item.statusEnvio === "Pendente") && <span className="text-[10px] font-bold text-amber-600">Pendente</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="p-6 text-center text-slate-400 text-xs font-bold">Nenhum registro encontrado.</div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL DESKTOP AND PORTABLE */}
      {isDetailsOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[210] font-sans">
          <div className="bg-white rounded-[28px] border border-slate-205 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header description */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent pointer-events-none" />
              <div className="space-y-1 z-10">
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block leading-none">Dossiê e Histórico de Cobrança</span>
                <h3 className="text-lg font-black tracking-tight">{selectedItem.nomeCliente}</h3>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-400 font-mono font-bold uppercase">Contrato ID: {selectedItem.idContrato} · Telefone: {selectedItem.telefone}</p>
                  <button onClick={() => { setIsRegistroRapidoOpen(true); setRegistroRapidoAtendeu(null); setRegistroRapidoRelato(""); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Registro Rápido de Ligação
                  </button>
                </div>
              </div>

              <button onClick={() => setIsDetailsOpen(false)} className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition text-xs font-bold leading-none shrink-0"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Modal Body scrollable */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Financial snapshot panel */}
              <div className="grid grid-cols-3 gap-3.5">
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Fatura Aberta</span>
                  <span className="text-base font-black font-mono text-slate-905 block mt-1">R$ {Number(selectedItem.valor).toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Plano Atual</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-1">{formatPlano(selectedItem.plano)}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-wider block">Status atual</span>
                  <span className={`inline-block text-[9.5px] font-black px-2.5 py-0.5 rounded mt-1 uppercase ${
                    selectedItem.status === "Pago" ? "bg-[#E6FAF1] text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>
              </div>

              {/* INTEGRATED GEMINI AI WHATSAPP SCRIPT COBRANÇA */}
              {selectedItem.status !== "Pago" && (
                <div className="border border-sky-505/30 bg-sky-50/20 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-sky-700 leading-none">MHNET AI Collections</span>
                        <div className="text-xs font-bold text-slate-900">Abordagem Empática e Construtiva</div>
                      </div>
                    </div>
                    
                    <button onClick={handleRequestAiDraft}
                  
                  disabled={aiGenerating} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] uppercase font-black tracking-wide cursor-pointer transition flex items-center gap-1 shadow-md shadow-sky-900/10 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>{aiGenerating ? "Redigindo..." : "Gerar Roteiro IA"}</span>
                    </button>
                  </div>

                  {aiDraftMessage ? (
                    <div className="space-y-2">
                      <div className="p-3.5 card-modern border border-slate-200 rounded-xl text-xs text-slate-850 leading-relaxed italic relative whitespace-pre-wrap">
                        {aiDraftMessage}
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => {
                            navigator.clipboard.writeText(aiDraftMessage);
                            alert("Mensagem da IA copiada para a área de transferência! Cole no chat do cliente.");
                          }} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-[10px] uppercase font-black cursor-pointer transition"
                        >
                          Copiar Texto
                        </button>
                        
                        <button onClick={() => handleOpenWhatsAppChat(selectedItem, aiDraftMessage)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] uppercase font-black cursor-pointer transition flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Enviar no WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 leading-normal pl-0.5">Clique em "Gerar Roteiro IA" para criar uma tática consultiva gaúcha adaptada a este atraso via inteligência artificial.</p>
                  )}
                </div>
              )}


              {/* Historic contacts timelines */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-slate-400 block tracking-widest">Linha do Tempo de Atendimentos</div>
                <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 bg-slate-50/50">
                  {selectedItem.historicoContatos && selectedItem.historicoContatos.length> 0 ? (
                    selectedItem.historicoContatos.map((log, lidx) => (
                      <div key={lidx} className="p-3.5 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                            <span className="font-extrabold text-slate-700">{log.operador}</span>
                            <span>Via {log.tipo}</span>
                          </div>
                          <span className="font-mono text-slate-400">{log.dataLog}</span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-semibold">{log.descricao}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-400 italic text-xs">Sem históricos registrados anteriormente.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2 shrink-0 select-none">
              <button onClick={() => setIsDetailsOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold leading-none cursor-pointer transition"
              >
                Voltar
              </button>
              
              {selectedItem.status !== "Pago" && (
                <button onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenContactLog(selectedItem);
                  }} className="px-4 py-2 bg-sky-650 hover:bg-sky-600 text-white rounded-xl text-xs font-bold leading-none cursor-pointer transition"
                >
                  Registrar Contato
                </button>
              )}

              {selectedItem.status !== "Pago" && (
                <button onClick={() => handleMarkAsPaid(selectedItem)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold leading-none cursor-pointer transition"
                >
                  Baixar Pago
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* REGISTER CONTACT LOG MODAL */}
      {isContactLogOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[220] font-sans">
          <div className="bg-white rounded-[26px] border border-slate-250 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            
            <div className="p-5 bg-amber-500 text-slate-950 flex justify-between items-center shrink-0">
              <div className="font-sans">
                <span className="text-[9px] font-black uppercase tracking-wider block">Registrar Contato</span>
                <h3 className="text-sm font-black uppercase tracking-tight block">Acordo/Cobrança: {selectedItem.nomeCliente}</h3>
              </div>
              <button onClick={() => setIsContactLogOpen(false)} className="p-1 px-2.5 bg-slate-900/10 hover:bg-slate-900/20 text-slate-950 border border-slate-950/20 text-xs font-bold leading-none shrink-0 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block pl-0.5 pr-0.5">Tipo de Contato</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["WhatsApp", "Telefone", "Sistema"] as const).map(t => (
                    <button key={t} type="button"
                      onClick={() => setLogTipo(t)} className={`py-2 text-center text-xs font-extrabold rounded-xl border transition ${
                        logTipo === t 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block pl-0.5">Descrição do Atendimento</label>
                <textarea
                  
                  placeholder="Ex: Cliente disse que teve imprevistos de saúde e que pagará na próxima sexta-feira o boleto."
                  rows={4} className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:card-modern rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed transition"
                  value={logDescricao}
                  onChange={e => setLogDescricao(e.target.value)} />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox"
                  id="contatoEfetivoCheck"
                  checked={contatoEfetivo}
                  onChange={e => setContatoEfetivo(e.target.checked)} className="rounded border-slate-300 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="contatoEfetivoCheck" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Contato Efetivo? (Atendeu e conversou)
                </label>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block pl-0.5">Motivo da Inadimplência (Diagnóstico)</label>
                <select className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 focus:outline-none transition"
                  value={motivoInadimplencia}
                  onChange={e => setMotivoInadimplencia(e.target.value)}>
                  <option value="">Selecione o Motivo (Opcional)</option>
                  <option value="Esquecimento">Esquecimento</option>
                  <option value="Desemprego/Dificuldade Financeira">Desemprego / Dificuldade Financeira</option>
                  <option value="Insatisfação com o Serviço">Insatisfação com o Serviço</option>
                  <option value="Não Recebeu Fatura">Não Recebeu a Fatura</option>
                  <option value="Cancelamento não processado">Cancelamento não processado</option>
                  <option value="Problema de Saúde">Problema de Saúde</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              {/* Settlement Agreement (Promise) checkbox togglers */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    checked={prometeuPagamento}
                    onChange={e => setPrometeuPagamento(e.target.checked)} />
                  <span className="text-xs font-black text-slate-700 uppercase">Houve Promessa de Pagamento?</span>
                </label>

                {prometeuPagamento && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block pl-0.5">Previsão Acordada de Pagamento</span>
                    <input type="text"
                      placeholder="Ex: 12/06/2026" className="w-full card-modern border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                      value={promessaData}
                      onChange={e => setPromessaData(e.target.value)} />
                  </div>
                )}
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button onClick={() => setIsContactLogOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition leading-none select-none"
              >
                Cancelar
              </button>
              
              <button onClick={handleSubmitContactLog} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition leading-none select-none shadow-md shadow-emerald-900/10"
              >
                Salvar Anotação
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NEW COBRANÇA CREATION MODAL */}
      {isNewCobrancaOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[210] font-sans">
          <div className="bg-white rounded-[26px] border border-slate-250 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            
            <div className="p-5 bg-sky-650 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-sky-300 block">Cadastrar Novo Record</span>
                <h3 className="text-base font-black tracking-tight">Cobrança Comercial / Inadimplente</h3>
              </div>
              <button onClick={() => setIsNewCobrancaOpen(false)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sky-100 hover:text-white transition font-sans text-xs font-bold leading-none pr-3"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleCreateNewCobranca} className="p-5 overflow-y-auto space-y-3 flex-1 font-sans">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Contrato Código *</label>
                  <input type="text"
                    placeholder="Ex: MHN98721" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none uppercase"
                    value={newIdContrato}
                    onChange={e => setNewIdContrato(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Telefone de Contato *</label>
                  <input type="text"
                    placeholder="Ex: (51) 99872-6543" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                    value={newTelefone}
                    onChange={e => setNewTelefone(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Nome Completo do Cliente *</label>
                <input type="text"
                  placeholder="Ex: Clóvis Roberto Born" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                  value={newNomeCliente}
                  onChange={e => setNewNomeCliente(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Valor da Fatura (R$) *</label>
                  <input type="text"
                    placeholder="Ex: 119.90" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none text-right font-mono"
                    value={newValor}
                    onChange={e => setNewValor(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Data Vencimento *</label>
                  <input type="text"
                    placeholder="Ex: 10/06/2026" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                    value={newDataVencimento}
                    onChange={e => setNewDataVencimento(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Cidade</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold cursor-pointer text-slate-705 focus:outline-none"
                    value={newCidade}
                    onChange={e => setNewCidade(e.target.value)}>
                    <option value="Lajeado">Lajeado</option>
                    <option value="Estrela">Estrela</option>
                    
                    
                    
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Plano</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none"
                    value={newPlano}
                    onChange={e => setNewPlano(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block pl-0.5">Observações Internas (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Observações de inadimplência histórica ou facilidades de contato" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:outline-none leading-normal"
                  value={newObs}
                  onChange={e => setNewObs(e.target.value)} />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-right">
                <button type="button"
                  onClick={() => setIsNewCobrancaOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-355 text-slate-800 rounded-xl text-xs font-bold leading-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-sky-650 hover:bg-sky-600 text-white rounded-xl text-xs font-bold leading-none cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4.5 h-4.5" />
                  <span>Salvar Cobrança</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* SPREADSHEEET BULK IMPORT MODAL */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[215] font-sans">
          <div className="bg-white rounded-[26px] border border-slate-250 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col font-sans">
            
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 block">Importador de Planilhas Excel / TSV</span>
                <h3 className="text-base font-black tracking-tight">Cobranças em Lote / Copiar e Colar</h3>
              </div>
              <button onClick={() => {
                  setIsBulkImportOpen(false);
                  setBulkText("");
                  setBulkPreview([]);
                }} className="p-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white transition font-sans text-xs font-bold leading-none"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5 space-y-2">
                <span className="text-[10px] font-black uppercase text-sky-700 block">Como funciona?</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Copie as linhas de sua planilha de cobrança no Excel ou Google Sheets e cole-as na caixa abaixo.
                </p>
                <div className="text-[11px] text-slate-500 font-semibold space-y-1">
                  <p>✓ <strong>Com cabeçalhos:</strong> Se a primeira linha contiver nomes de colunas (como <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">Contrato</code>, <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">Cliente</code>, <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">Valor</code>, etc), o sistema irá mapear as colunas automaticamente!</p>
                  <p>✓ <strong>Sem cabeçalhos:</strong> O sistema assume a ordem: <span className="text-slate-700 font-bold">Contrato · Cliente · Telefone · Valor · Vencimento · Cidade · Plano · Observação</span>.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase block pl-0.5">Área de Colagem (Ctrl+V)</label>
                <textarea
                  placeholder="Cole as colunas de sua planilha de cobrança aqui..."
                  rows={6} className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:card-modern rounded-xl py-3 px-4 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed transition"
                  value={bulkText}
                  onChange={e => {
                    setBulkText(e.target.value);
                    parseBulkPaste(e.target.value);
                  }} />
              </div>

              {bulkPreview.length> 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 block pl-0.5">Pré-visualização: {bulkPreview.length} registros detectados</span>
                    <span className="text-[10px] font-bold text-[#00A86B] flex items-center gap-1">✓ Dados Formatados</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Contrato ID</th>
                          <th className="py-2 px-3">Cliente</th>
                          <th className="py-2 px-3">Telefone</th>
                          <th className="py-2 px-3">Vence em</th>
                          <th className="py-2 px-3 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {bulkPreview.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono text-slate-800 uppercase">{item.idContrato}</td>
                            <td className="py-2 px-3 text-slate-900 truncate max-w-[150px]">{item.nomeCliente}</td>
                            <td className="py-2 px-3 text-slate-500">{item.telefone}</td>
                            <td className="py-2 px-3 text-rose-600 font-semibold">{item.dataVencimento} ({item.diasAtraso}d atraso)</td>
                            <td className="py-2 px-3 text-right text-slate-900 font-mono">R$ {item.valor.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-350 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs font-semibold text-slate-400">Os dados colados aparecerão aqui formatados e preparados para salvamento.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2 shrink-0">
              <button onClick={() => {
                  setIsBulkImportOpen(false);
                  setBulkText("");
                  setBulkPreview([]);
                }} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold leading-none cursor-pointer transition select-none"
              >
                Cancelar
              </button>
              <button
                disabled={bulkPreview.length === 0} onClick={handleSaveBulk} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold cursor-pointer transition flex items-center gap-1 shadow shadow-rose-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Salvar {bulkPreview.length} Cobranças no Banco</span>
              </button>
            </div>

          </div>
        </div>
      )}

    
      {/* REGISTRO RAPIDO MODAL */}
      {isRegistroRapidoOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[250] font-sans">
          <div className="bg-white rounded-[26px] border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="p-5 bg-sky-600 text-white flex justify-between items-center shrink-0">
              <div className="font-sans">
                <span className="text-[9px] font-black uppercase tracking-wider block text-sky-200">Ligação Telefônica</span>
                <h3 className="text-sm font-black uppercase tracking-tight block">Registro Rápido</h3>
              </div>
              <button onClick={() => setIsRegistroRapidoOpen(false)} className="p-1 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-slate-800">
              <p className="text-sm font-bold text-center">O cliente atendeu a ligação?</p>
              
              {registroRapidoAtendeu === null && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={() => handleRegistroRapidoSubmit(false)} className="p-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-sm transition flex flex-col items-center justify-center gap-1"
                  >
                    <Phone className="w-5 h-5 mb-1" />
                    Não Atendeu
                  </button>
                  <button onClick={() => setRegistroRapidoAtendeu(true)} className="p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-sm transition flex flex-col items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-5 h-5 mb-1" />
                    Sim, Atendeu
                  </button>
                </div>
              )}

              {registroRapidoAtendeu === true && (
                <div className="space-y-3 mt-4 ">
                  <label className="text-xs font-black uppercase text-slate-500 block">Relato do Atendimento</label>
                  <textarea
                    value={registroRapidoRelato}
                    onChange={(e) => setRegistroRapidoRelato(e.target.value)}
                    placeholder="Descreva o que foi conversado..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setRegistroRapidoAtendeu(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                    >
                      Voltar
                    </button>
                    <button onClick={() => handleRegistroRapidoSubmit(true, registroRapidoRelato)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition"
                    >
                      Salvar Relato
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
</div>
  );
}
