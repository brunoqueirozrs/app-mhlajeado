import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  BellRing,
  ExternalLink,
  RefreshCw,
  Sparkles,
  UserCheck,
  Send,
  MessageSquare,
  ShieldAlert,
  Info,
  Calendar,
  Check,
  Zap,
  Phone,
  Database,
  Plus,
  Trash2,
  Bug,
  Eye,
  Filter,
  CheckCheck,
  Terminal,
  Activity,
  Sun,
  Moon,
  Users,
  Shield
} from "lucide-react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db, TARGET_DATABASE_ID } from "../lib/db";

export interface AtendimentoSlaItem {
  id: string;
  id_atendimento: string;
  cliente_nome: string;
  cliente_telefone: string;
  atendente_nome?: string;
  atendente_id?: string;
  timestamp_ultima_mensagem_cliente: any; // Timestamp or ISO string or Date or Unix
  status_resposta: "aguardando" | "respondido";
  timestamp_resposta?: any;
  alarme_disparado: boolean;
  timestamp_alarme?: any;
  isMockData?: boolean;
  rawDoc?: any; // Raw document data for debugger
}

interface AtendimentoSlaPageProps {
  onOpenChat?: (chatId?: string) => void;
  theme?: "light" | "dark";
  loggedUser?: string;
  userRole?: string;
}

// Hyper-robust helper to convert Firestore timestamp, string, or number to Date
function parseToDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return isNaN(val.getTime()) ? new Date() : val;

  // 1. Firestore Timestamp object (.toDate())
  if (typeof val?.toDate === "function") {
    try {
      const parsed = val.toDate();
      if (parsed instanceof Date && !isNaN(parsed.getTime())) return parsed;
    } catch {
      /* fallback */
    }
  }

  // 2. Firestore raw timestamp object {_seconds, _nanoseconds} or {seconds, nanoseconds}
  if (typeof val?.seconds === "number" && !isNaN(val.seconds)) {
    return new Date(val.seconds * 1000);
  }
  if (typeof val?._seconds === "number" && !isNaN(val._seconds)) {
    return new Date(val._seconds * 1000);
  }

  // 3. Numeric timestamp in seconds or milliseconds (Unix Epoch)
  if (typeof val === "number" && !isNaN(val) && val > 0) {
    return val < 10000000000 ? new Date(val * 1000) : new Date(val);
  }

  // 4. String format processing
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed) {
      // 4a. Check if string is purely numeric or decimal string (e.g. Unix timestamp)
      if (/^\d+(\.\d+)?$/.test(trimmed)) {
        const num = Number(trimmed);
        if (!isNaN(num) && num > 0) {
          return num < 10000000000 ? new Date(num * 1000) : new Date(num);
        }
      }

      // 4b. Brazilian format: DD/MM/YYYY, HH:mm:ss or DD/MM/YYYY HH:mm:ss
      const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
      if (brMatch) {
        const day = parseInt(brMatch[1], 10);
        const month = parseInt(brMatch[2], 10) - 1;
        const year = parseInt(brMatch[3], 10);
        const hour = brMatch[4] ? parseInt(brMatch[4], 10) : 0;
        const minute = brMatch[5] ? parseInt(brMatch[5], 10) : 0;
        const second = brMatch[6] ? parseInt(brMatch[6], 10) : 0;
        const parsedBr = new Date(year, month, day, hour, minute, second);
        if (!isNaN(parsedBr.getTime())) return parsedBr;
      }

      // 4c. Standard ISO/Date string parsing
      let isoStr = trimmed;
      if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(isoStr)) {
        isoStr = isoStr.replace(" ", "T");
      }
      const parsedIso = new Date(isoStr);
      if (!isNaN(parsedIso.getTime()) && parsedIso.getFullYear() >= 2000 && parsedIso.getFullYear() <= 2100) {
        return parsedIso;
      }
    }
  }

  return new Date();
}

// Format wait time duration cleanly
function formatWaitTime(diffMs: number): { text: string; minutes: number } {
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  if (diffMinutes < 60) {
    return { text: `${diffMinutes} min`, minutes: diffMinutes };
  }
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return { text: `${hours}h ${mins}min`, minutes: diffMinutes };
}

export function AtendimentoSlaPage({
  onOpenChat,
  theme = "dark",
  loggedUser = "",
  userRole = ""
}: AtendimentoSlaPageProps) {
  const [darkMode, setDarkMode] = useState<boolean>(theme === "dark");
  const isLight = !darkMode;
  const [items, setItems] = useState<AtendimentoSlaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [now, setNow] = useState<Date>(new Date());
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Verificação para botão exclusivo de Baixa Manual (BRUNO GARCIA QUEIROZ / Admin)
  const isBrunoAdmin =
    userRole === "admin" ||
    (loggedUser && loggedUser.toLowerCase().includes("bruno")) ||
    (typeof window !== "undefined" &&
      ((localStorage.getItem("loggedUser") || "").toLowerCase().includes("bruno") ||
       localStorage.getItem("userRole") === "admin"));

  // Filter & Debug states
  const [dataFilter, setDataFilter] = useState<"all" | "real" | "mock">("all");
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [selectedDebugItem, setSelectedDebugItem] = useState<AtendimentoSlaItem | null>(null);
  const [statusTab, setStatusTab] = useState<"aguardando" | "respondido" | "todos">("aguardando");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // 1. Escuta a coleção "atendimentos_sla" na base de dados especificada em tempo real
  useEffect(() => {
    setLoading(true);

    try {
      const colRef = collection(db, "atendimentos_sla");
      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const list: AtendimentoSlaItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            // Mapeamento hyper-flexível para dados vindos de webhooks, Evolution API, ou inserções do n8n
            const rawPhone =
              data.cliente_telefone ||
              data.remoteJid ||
              data.phone ||
              data.whatsapp ||
              data.body?.data?.key?.remoteJid ||
              data.data?.key?.remoteJid ||
              (docSnap.id.includes("@") ? docSnap.id : "") ||
              (typeof data.id_atendimento === "string" && data.id_atendimento.includes("@")
                ? data.id_atendimento.split("@")[0]
                : "") ||
              "";

            const formattedPhone = String(rawPhone).replace("@s.whatsapp.net", "").trim();

            const isGhost =
              docSnap.id === "undefined" ||
              (!data.id_atendimento && !data.cliente_telefone && !data.cliente_nome && !data.remoteJid);

            const isMock =
              Boolean(data.isMockData) ||
              docSnap.id.startsWith("chat_") ||
              docSnap.id.startsWith("test_") ||
              (data.id_atendimento && String(data.id_atendimento).startsWith("chat_"));

            // Extraction e conversão 100% segura para String
            const rawNomeVal =
              data.cliente_nome ??
              data.pushName ??
              data.nome ??
              data.client_name ??
              data.body?.data?.pushName ??
              data.data?.pushName;

            let finalClienteNome = "";
            if (typeof rawNomeVal === "string") {
              finalClienteNome = rawNomeVal;
            } else if (typeof rawNomeVal === "number" || typeof rawNomeVal === "boolean") {
              finalClienteNome = String(rawNomeVal);
            } else if (rawNomeVal && typeof rawNomeVal === "object") {
              finalClienteNome = rawNomeVal.name || rawNomeVal.pushName || rawNomeVal.formattedName || JSON.stringify(rawNomeVal);
            }

            if (!finalClienteNome || !finalClienteNome.trim()) {
              finalClienteNome = isGhost
                ? "Documento Mapeado Errado (n8n)"
                : formattedPhone
                ? `Cliente (+${formattedPhone})`
                : "Cliente WhatsApp";
            }

            const rawAtendenteVal = data.atendente_nome || "Equipe WhatsApp";
            const finalAtendenteNome = typeof rawAtendenteVal === "string" ? rawAtendenteVal : String(rawAtendenteVal);

            // Status da RESPOSTA ao cliente no SLA (Não usar data.status genérico do protocolo do WhatsApp ex: "READ" ou 1)
            const rawStatusResposta = String(
              data.status_resposta ||
              data.status_atendimento ||
              data.atendimento_status ||
              data.resposta_status ||
              ""
            ).toLowerCase().trim();

            const isRespondido =
              rawStatusResposta === "respondido" ||
              rawStatusResposta === "closed" ||
              rawStatusResposta === "fechado" ||
              rawStatusResposta === "atendido" ||
              rawStatusResposta === "resolved" ||
              rawStatusResposta === "finished" ||
              data.respondido === true ||
              data.answered === true;

            list.push({
              id: String(docSnap.id),
              id_atendimento: String(data.id_atendimento || docSnap.id),
              cliente_nome: finalClienteNome,
              cliente_telefone: formattedPhone ? (formattedPhone.length > 10 ? `+${formattedPhone}` : formattedPhone) : (isGhost ? "Sem Telefone" : "WhatsApp"),
              atendente_nome: finalAtendenteNome,
              atendente_id: String(data.atendente_id || ""),
              timestamp_ultima_mensagem_cliente:
                data.timestamp_ultima_mensagem_cliente ||
                data.messageTimestamp ||
                data.date_time ||
                data.body?.data?.messageTimestamp ||
                data.data?.messageTimestamp ||
                data.createdAt ||
                data.created_at ||
                new Date(),
              status_resposta: isRespondido ? "respondido" : "aguardando",
              timestamp_resposta: data.timestamp_resposta,
              alarme_disparado: Boolean(data.alarme_disparado || data.alarmeDisparado || data.body?.alarme_disparado),
              timestamp_alarme: data.timestamp_alarme,
              isMockData: isMock,
              rawDoc: { _database: TARGET_DATABASE_ID, id: docSnap.id, ...data }
            });
          });
          setItems(list);
          setLoading(false);
        },
        (error) => {
          console.error("Erro ao escutar coleção no Firestore:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Exceção na conexão Firestore:", err);
      setLoading(false);
    }
  }, []);

  // 2. Timer tick a cada 30 segundos para atualizar tempos de espera em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dar Baixa manual (marcar como respondido) no Firestore
  const handleMarcarComoRespondido = async (id: string) => {
    setActionLoadingId(id);
    try {
      const docRef = doc(db, "atendimentos_sla", id);
      await updateDoc(docRef, {
        status_resposta: "respondido",
        timestamp_resposta: serverTimestamp()
      });
    } catch (err) {
      console.error("Erro ao dar baixa no atendimento SLA:", err);
      alert("Erro ao dar baixa no atendimento. Verifique as permissões do Firestore.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Excluir registro individual do Firestore
  const handleExcluirRegistro = async (id: string) => {
    if (!window.confirm("Deseja realmente remover este registro de SLA do Firestore?")) return;
    setActionLoadingId(id);
    try {
      const docRef = doc(db, "atendimentos_sla", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Erro ao excluir registro:", err);
      alert("Erro ao excluir documento do Firestore.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Apagar todos os dados de teste (Mock Data) deixando apenas os dados reais do n8n
  const handleLimparDadosTeste = async () => {
    const mockItems = items.filter((i) => i.isMockData);
    if (mockItems.length === 0) {
      alert("Não há dados de teste/demonstração na base.");
      return;
    }
    if (!window.confirm(`Deseja remover os ${mockItems.length} registros de teste e deixar SOMENTE informações reais da Evolution API?`)) return;

    setClearing(true);
    try {
      for (const item of mockItems) {
        await deleteDoc(doc(db, "atendimentos_sla", item.id));
      }
      alert("Dados de teste removidos com sucesso! Apenas dados reais permanecem.");
    } catch (err) {
      console.error("Erro ao limpar dados de teste:", err);
      alert("Erro ao apagar alguns registros de teste.");
    } finally {
      setClearing(false);
    }
  };

  // Gerar dados de demonstração com MÚLTIPLOS clientes reais do WhatsApp
  const handleSeedMultiplesClientes = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      const colRef = collection(db, "atendimentos_sla");
      const currentTime = new Date();

      const clientsToSeed = [
        {
          id: "555180295905@s.whatsapp.net",
          nome: "+55 51 8029-5905",
          phone: "555180295905",
          timeMins: 4
        },
        {
          id: "555198765001@s.whatsapp.net",
          nome: "Maicon gerente da O&M SANTA CRUZ",
          phone: "555198765001",
          timeMins: 16
        },
        {
          id: "555191106906@s.whatsapp.net",
          nome: "+55 51 9110-6906",
          phone: "555191106906",
          timeMins: 24
        },
        {
          id: "555199887766@s.whatsapp.net",
          nome: "Eracilda Fátima da Cruz",
          phone: "555199887766",
          timeMins: 32
        },
        {
          id: "5551991234567@s.whatsapp.net",
          nome: "Stefani Lazaron Mhnet",
          phone: "5551991234567",
          timeMins: 45
        },
        {
          id: "5551998765432@s.whatsapp.net",
          nome: "João Mhnet",
          phone: "5551998765432",
          timeMins: 58
        }
      ];

      for (const client of clientsToSeed) {
        const t = new Date(currentTime.getTime() - client.timeMins * 60 * 1000);
        await setDoc(doc(colRef, client.id), {
          id_atendimento: client.id,
          cliente_nome: client.nome,
          cliente_telefone: client.phone,
          atendente_nome: "Equipe de Atendimento",
          timestamp_ultima_mensagem_cliente: Timestamp.fromDate(t),
          status_resposta: "aguardando",
          alarme_disparado: client.timeMins > 30,
          timestamp_alarme: client.timeMins > 30 ? Timestamp.fromDate(new Date(t.getTime() + 30 * 60 * 1000)) : null,
          isMockData: false
        });
      }

      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao gerar clientes múltiplos no Firestore:", err);
      alert("Erro ao criar documentos de teste. Verifique permissões do Firestore.");
    } finally {
      setSeeding(false);
    }
  };

  // Gerar dados de demonstração
  const handleSeedMockData = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      const colRef = collection(db, "atendimentos_sla");
      const currentTime = new Date();

      // Item 1: Recente (<15 min)
      const t1 = new Date(currentTime.getTime() - 8 * 60 * 1000);
      await addDoc(colRef, {
        id_atendimento: "chat_001",
        cliente_nome: "Carlos Eduardo Silva",
        cliente_telefone: "5551998231122",
        atendente_nome: "Ana Paula / Consultor",
        timestamp_ultima_mensagem_cliente: Timestamp.fromDate(t1),
        status_resposta: "aguardando",
        alarme_disparado: false,
        timestamp_alarme: null,
        isMockData: true
      });

      // Item 2: Alerta (15-30 min)
      const t2 = new Date(currentTime.getTime() - 22 * 60 * 1000);
      await addDoc(colRef, {
        id_atendimento: "chat_002",
        cliente_nome: "Mariana Souza Fontes",
        cliente_telefone: "5551981129988",
        atendente_nome: "Roberto Mendes",
        timestamp_ultima_mensagem_cliente: Timestamp.fromDate(t2),
        status_resposta: "aguardando",
        alarme_disparado: false,
        timestamp_alarme: null,
        isMockData: true
      });

      // Item 3: Estourado (>30 min) com Alarme Disparado
      const t3 = new Date(currentTime.getTime() - 42 * 60 * 1000);
      const tAlarme = new Date(currentTime.getTime() - 12 * 60 * 1000);
      await addDoc(colRef, {
        id_atendimento: "chat_003",
        cliente_nome: "Empresa Lajeado Logística Ltda",
        cliente_telefone: "5551992014455",
        atendente_nome: "Equipe WhatsApp",
        timestamp_ultima_mensagem_cliente: Timestamp.fromDate(t3),
        status_resposta: "aguardando",
        alarme_disparado: true,
        timestamp_alarme: Timestamp.fromDate(tAlarme),
        isMockData: true
      });

      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao gerar dados fake no Firestore:", err);
    } finally {
      setSeeding(false);
    }
  };

  // Filtragem dos itens exibidos
  const filteredItems = items.filter((item) => {
    if (dataFilter === "real") return !item.isMockData;
    if (dataFilter === "mock") return item.isMockData;
    return true;
  });

  // ================= CALCULA MÉTRICAS =================
  const waitingItems = filteredItems.filter((i) => i.status_resposta === "aguardando");
  const answeredItems = filteredItems.filter((i) => i.status_resposta === "respondido");

  // Itens exibidos na tabela conforme a aba selecionada (Aguardando / Respondidos / Todos)
  const baseQueue =
    statusTab === "aguardando"
      ? waitingItems
      : statusTab === "respondido"
      ? answeredItems
      : filteredItems;

  // Ordenar Fila do MAIOR tempo de espera para o MENOR (mais crítico no topo)
  const sortedQueue = [...baseQueue].sort((a, b) => {
    const dateA = parseToDate(a.timestamp_ultima_mensagem_cliente).getTime();
    const dateB = parseToDate(b.timestamp_ultima_mensagem_cliente).getTime();
    return dateA - dateB; // Quanto menor o timestamp, mais antiga a mensagem (maior tempo de espera)
  });

  // Card 1: Em espera agora
  const totalEmEspera = waitingItems.length;

  // Card 2: Em alerta (15-30 min)
  const totalAlerta = waitingItems.filter((i) => {
    const dt = parseToDate(i.timestamp_ultima_mensagem_cliente);
    const diffMins = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60));
    return diffMins >= 15 && diffMins <= 30;
  }).length;

  // Card 3: Estourados (>30 min)
  const totalEstourados = waitingItems.filter((i) => {
    const dt = parseToDate(i.timestamp_ultima_mensagem_cliente);
    const diffMins = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60));
    return diffMins > 30;
  }).length;

  // Card 4: Tempo médio de espera atual na fila (ou de resposta se concluído)
  let tempoMedioMinutos = 0;
  if (waitingItems.length > 0) {
    const totalMins = waitingItems.reduce((acc, curr) => {
      const dt = parseToDate(curr.timestamp_ultima_mensagem_cliente);
      const diffMins = Math.max(0, Math.floor((now.getTime() - dt.getTime()) / (1000 * 60)));
      return acc + diffMins;
    }, 0);
    tempoMedioMinutos = Math.round(totalMins / waitingItems.length);
  } else if (answeredItems.length > 0) {
    const totalDiffMinutes = answeredItems.reduce((acc, curr) => {
      const msgDate = parseToDate(curr.timestamp_ultima_mensagem_cliente).getTime();
      const respDate = curr.timestamp_resposta ? parseToDate(curr.timestamp_resposta).getTime() : now.getTime();
      const diffMins = Math.max(0, Math.floor((respDate - msgDate) / (1000 * 60)));
      return acc + diffMins;
    }, 0);
    tempoMedioMinutos = Math.round(totalDiffMinutes / answeredItems.length);
  }

  // Bloco 3: Histórico de alarmes disparados
  const alarmesDisparadosList = filteredItems
    .filter((i) => i.alarme_disparado)
    .sort((a, b) => {
      const dateA = parseToDate(a.timestamp_alarme || a.timestamp_ultima_mensagem_cliente).getTime();
      const dateB = parseToDate(b.timestamp_alarme || b.timestamp_ultima_mensagem_cliente).getTime();
      return dateB - dateA; // Mais recente primeiro
    });

  const countRealData = items.filter((i) => !i.isMockData).length;
  const countMockData = items.filter((i) => i.isMockData).length;

  return (
    <div className={`w-full h-full overflow-y-auto ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} p-4 md:p-6 space-y-6 transition-colors duration-200`}>
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold tracking-tight">Monitor de SLA & Alarmes (Evolution API)</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  Tempo Real (Firestore)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Central de vigilância de tempo de resposta da Evolution API (alertas de 15 e 30 minutos sincronizados com o Firebase).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              title={darkMode ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>

            {/* Admin Toggle Button */}
            <button
              onClick={() => {
                const nextAdmin = !isAdmin;
                setIsAdmin(nextAdmin);
                if (!nextAdmin) setShowDebugPanel(false);
              }}
              className={`px-3 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm ${
                isAdmin
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title="Alternar Modo de Administrador"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdmin ? "Modo Admin (Ativo)" : "Modo Administrador"}</span>
            </button>

            {/* BOTÕES EXCLUSIVOS PARA ADMINISTRADOR */}
            {isAdmin && (
              <>
                {/* Filter Toggle */}
                <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs animate-fadeIn">
                  <button
                    onClick={() => setDataFilter("all")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      dataFilter === "all" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Todos ({items.length})
                  </button>
                  <button
                    onClick={() => setDataFilter("real")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      dataFilter === "real" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Zap className="w-3 h-3 text-emerald-400" />
                    Reais ({countRealData})
                  </button>
                  <button
                    onClick={() => setDataFilter("mock")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      dataFilter === "mock" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Testes ({countMockData})
                  </button>
                </div>

                {/* Debug Panel Toggle (Somente Administrador) */}
                <button
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                  className={`px-3 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 animate-fadeIn ${
                    showDebugPanel
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                  title="Abrir Painel de Depuração e Inspeção do Fluxo SLA"
                >
                  <Bug className="w-3.5 h-3.5 text-purple-400" />
                  <span>{showDebugPanel ? "Fechar Debug" : "Depurar Fluxo"}</span>
                </button>

                {/* Clean Test Data Button (Somente Administrador) */}
                {countMockData > 0 && (
                  <button
                    onClick={handleLimparDadosTeste}
                    disabled={clearing}
                    className="px-3 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 animate-fadeIn"
                    title="Apagar registros de demonstração e manter apenas dados reais do n8n"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>{clearing ? "Limpando..." : "Apagar Testes"}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* PAINEL DE DEBUG DO FLUXO SLA (Inspeção de Payload Real) */}
      {showDebugPanel && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Painel de Depuração & Diagnóstico do Fluxo SLA
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                    Coleção: atendimentos_sla
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Inspeção em tempo real dos documentos do Firestore e verificação da sincronização n8n
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDebugPanel(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
            >
              Fechar ✕
            </button>
          </div>

          {/* DIAGNÓSTICO DE MÚLTIPLOS CLIENTES E BAIXA AUTOMÁTICA */}
          <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <Bug className="w-4 h-4 text-purple-400" />
                <span>Diagnóstico: Por que o WhatsApp tem 9 não lidas mas só apareciam 2 no Firestore?</span>
              </div>
              <button
                onClick={handleSeedMultiplesClientes}
                disabled={seeding}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
              >
                + Testar 6 Clientes na Fila Agora
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] text-slate-300">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-amber-300 font-bold block">1. Causa: Sobrescrita ou Filtro no n8n:</strong>
                <p className="text-slate-400 leading-relaxed">
                  O painel exibe <strong>100% dos documentos</strong> gravados na coleção <code className="text-purple-300">atendimentos_sla</code> sem nenhum limite. Se apenas 2 aparecem, significa que o n8n está gravando apenas 2 documentos ou sobrescrevendo contatos quando o <code className="text-amber-300">Update Key</code> não encontra o id da conversa.
                </p>
                <div className="mt-2 text-[10px] font-mono bg-slate-900 p-1.5 rounded text-amber-200">
                  Update Key recomendado no n8n: <code>{"={{ $json.body.data.key.remoteJid || $json.body.data.remoteJid || $json.body.key.remoteJid || $json.body.from }}"}</code>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-emerald-300 font-bold block">2. Como Solucionar no n8n:</strong>
                <p className="text-slate-400 leading-relaxed">
                  Verifique nos logs de execução do n8n se o webhook da Evolution API está sendo ativado para todas as mensagens não lidas do WhatsApp. Toda mensagem sem resposta do atendente deve enviar um <code className="text-emerald-300">Create or Update</code> com id do cliente.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Health Check */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                1. Documentos no Banco
              </span>
              <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold">
                <Activity className="w-4 h-4 animate-pulse text-emerald-400" />
                <span>Firestore ({items.length} total)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Aguardando: <strong className="text-amber-400">{waitingItems.length}</strong> | Respondidos:{" "}
                <strong className="text-emerald-400">{answeredItems.length}</strong>
              </p>
            </div>

            {/* Rules / Condition Validator */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                2. Status da Resposta Automática
              </span>
              <div className="text-[11px] font-mono text-amber-300 bg-slate-900 p-2 rounded-xl border border-slate-800">
                fromMe == true ➔ status_resposta = "respondido"
              </div>
              <p className="text-[11px] text-slate-400">
                Respostas do atendente alteram o status automaticamente.
              </p>
            </div>

            {/* Inspector Selector */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                3. Inspecionar Documento Solicitado
              </span>
              <select
                onChange={(e) => {
                  const found = items.find((i) => i.id === e.target.value);
                  setSelectedDebugItem(found || null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-mono"
              >
                <option value="">-- Selecione um registro para ver o JSON --</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.isMockData ? "[TESTE]" : "[REAL]"} {i.cliente_nome} ({i.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Item JSON view */}
          {selectedDebugItem && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 font-mono">
                  Payload no Firestore (ID: {selectedDebugItem.id}):
                </span>
                <span className="text-[10px] text-slate-400">
                  Parsed Date: {parseToDate(selectedDebugItem.timestamp_ultima_mensagem_cliente).toLocaleString("pt-BR")}
                </span>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                {JSON.stringify(selectedDebugItem.rawDoc, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* BLOCO 1: Métricas do Topo (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Em espera agora */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Em Espera Agora
              </span>
              <h2 className="text-3xl font-black mt-1 text-slate-900 dark:text-white font-mono">
                {totalEmEspera}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">Atendimentos aguardando resposta</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Em alerta (15-30min) */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                2. Em Alerta (15 a 30min)
              </span>
              <h2 className="text-3xl font-black mt-1 text-amber-600 dark:text-amber-400 font-mono">
                {totalAlerta}
              </h2>
              <p className="text-[11px] text-amber-700/70 dark:text-amber-300/70 mt-1">Atenção requerida antes do estouro</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Estourados (>30min) */}
        <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-3xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-red-500/5 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                3. Estourados (&gt; 30min)
              </span>
              <h2 className="text-3xl font-black mt-1 text-red-600 dark:text-red-400 font-mono">
                {totalEstourados}
              </h2>
              <p className="text-[11px] text-red-700/70 dark:text-red-300/70 mt-1">SLA excedido / Alarme ativado</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Card 4: Tempo médio de espera ou resposta */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Tempo Médio
              </span>
              <h2 className="text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                {tempoMedioMinutos} min
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                {waitingItems.length > 0
                  ? `Média de espera das ${waitingItems.length} conversas ativas`
                  : "Média de tempo dos atendimentos respondidos"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 2: Fila de Atendimento ao Vivo (Ordenada por tempo de espera) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Fila de Atendimento ao Vivo
              </h2>
              <p className="text-[11px] text-slate-400">
                Ordenada do maior tempo de espera para o menor (mais crítico no topo)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge de Contagem Fila de Espera */}
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{waitingItems.length} {waitingItems.length === 1 ? "Aguardando" : "Aguardando"}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            <span>Conectando ao Firestore em tempo real...</span>
          </div>
        ) : sortedQueue.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Fila zerada! Nenhum cliente aguardando resposta neste momento.
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Todos os clientes do WhatsApp foram atendidos dentro do tempo estipulado.
              </p>
            </div>
            {countMockData === 0 && (
              <button
                onClick={handleSeedMockData}
                disabled={seeding}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-600/20"
              >
                Criar Atendimentos de Teste
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedQueue.map((item) => {
              const dtMsg = parseToDate(item.timestamp_ultima_mensagem_cliente);
              const diffMs = now.getTime() - dtMsg.getTime();
              const { text: waitText, minutes: waitMins } = formatWaitTime(diffMs);

              // Colors based on wait time
              let cardBg = "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800";
              let badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
              let timerColor = "text-emerald-600 dark:text-emerald-400";

              if (waitMins > 30) {
                cardBg = "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50";
                badgeColor = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
                timerColor = "text-red-600 dark:text-red-400 font-black animate-pulse";
              } else if (waitMins >= 15) {
                cardBg = "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50";
                badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                timerColor = "text-amber-600 dark:text-amber-400 font-extrabold";
              }

              // Iniciais do cliente
              const safeNome = typeof item.cliente_nome === "string" ? item.cliente_nome : String(item.cliente_nome || "CL");
              const initials = safeNome
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              const isActionPending = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border ${cardBg} transition hover:shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center font-extrabold text-xs shrink-0 border border-slate-700">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.cliente_nome}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.cliente_telefone}
                        </span>
                        {item.isMockData && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Demonstração
                          </span>
                        )}
                        {item.alarme_disparado && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white flex items-center gap-1 shadow-sm">
                            <BellRing className="w-3 h-3 animate-ping" /> Alarme Enviado no WhatsApp
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Atendente responsável: <strong className="text-slate-300">{item.atendente_nome || "Equipe de Atendimento"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-0 border-slate-200 dark:border-slate-800 flex-wrap">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                        Aguardando Há:
                      </span>
                      <span className={`text-base font-mono ${timerColor}`}>
                        {waitText}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Dar Baixa Manual - Visível somente para BRUNO GARCIA QUEIROZ / Administrador */}
                      {isBrunoAdmin && (
                        <button
                          onClick={() => handleMarcarComoRespondido(item.id)}
                          disabled={isActionPending}
                          className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer active:scale-95 disabled:opacity-50"
                          title="Dar baixa manual neste atendimento (Apenas Administrador BRUNO GARCIA QUEIROZ)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dar Baixa</span>
                        </button>
                      )}

                      {/* Abrir WhatsApp */}
                      <button
                        onClick={() => {
                          if (onOpenChat) {
                            onOpenChat(item.id_atendimento);
                          } else {
                            const digits = (item.cliente_telefone || "").replace(/\D/g, "");
                            if (digits) {
                              const fullPhone = digits.length <= 11 && !digits.startsWith("55") ? `55${digits}` : digits;
                              window.open(`https://wa.me/${fullPhone}`, "_blank", "noopener,noreferrer");
                            } else {
                              alert("Telefone do cliente não cadastrado.");
                            }
                          }
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                        title="Abrir conversa no WhatsApp Web"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Excluir Registro */}
                      <button
                        onClick={() => handleExcluirRegistro(item.id)}
                        disabled={isActionPending}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                        title="Remover do Firestore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BLOCO 3: Histórico de Alarmes Disparados Hoje */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Histórico de Alarmes Disparados Hoje
              </h2>
              <p className="text-[11px] text-slate-400">
                Relatório dos alertas enviados ao gestor via WhatsApp e tempo final de resolução
              </p>
            </div>
          </div>
        </div>

        {alarmesDisparadosList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhum alarme de SLA disparado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Horário do Alarme</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Atendente</th>
                  <th className="py-3 px-3 text-right">Resultado / Status Final</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {alarmesDisparadosList.map((item) => {
                  const isActionPending = actionLoadingId === item.id;
                  const dtAlarme = parseToDate(item.timestamp_alarme || item.timestamp_ultima_mensagem_cliente);
                  const horaFormatada = dtAlarme.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  let statusNode = null;
                  if (item.status_resposta === "respondido" && item.timestamp_resposta) {
                    const dtMsg = parseToDate(item.timestamp_ultima_mensagem_cliente);
                    const dtResp = parseToDate(item.timestamp_resposta);
                    const diffMins = Math.max(0, Math.floor((dtResp.getTime() - dtMsg.getTime()) / (1000 * 60)));
                    statusNode = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Respondido em {diffMins} min
                      </span>
                    );
                  } else {
                    const dtMsg = parseToDate(item.timestamp_ultima_mensagem_cliente);
                    const { text: waitText } = formatWaitTime(now.getTime() - dtMsg.getTime());
                    statusNode = (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                        Sem resposta há {waitText}
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition">
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {horaFormatada}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 dark:text-white block">{item.cliente_nome}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{item.cliente_telefone}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {item.atendente_nome || "Equipe de Atendimento"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {statusNode}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isBrunoAdmin && item.status_resposta === "aguardando" && (
                            <button
                              onClick={() => handleMarcarComoRespondido(item.id)}
                              disabled={isActionPending}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Dar baixa manual neste atendimento (Apenas Administrador BRUNO GARCIA QUEIROZ)"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Baixar</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleExcluirRegistro(item.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                            title="Excluir do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AtendimentoSlaPage;
