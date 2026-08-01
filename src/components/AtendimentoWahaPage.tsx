import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Search,
  User,
  Phone,
  Clock,
  Send,
  CheckCheck,
  Tag,
  Paperclip,
  CheckCircle2,
  Zap,
  ArrowRightLeft,
  Filter,
  RefreshCw,
  Plus,
  AlertTriangle,
  UserCheck,
  Smile,
  FileSpreadsheet,
  X,
  Sparkles,
  Bot,
  MoreVertical,
  Check,
  SendHorizontal,
  Sun,
  Moon,
  BarChart2,
  PieChart,
  TrendingUp,
  Users,
  Activity,
  Share2,
  Target,
  ArrowUpRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { collection, onSnapshot, doc, setDoc, query, orderBy, where, addDoc } from "firebase/firestore";
import { db } from "../lib/db";
import { INITIAL_VENDORS } from "../data";

export interface Ticket {
  chat_id: string;
  cliente_nome: string;
  atendente_atual: string;
  fila: string; // "Comercial", "Suporte", "Implantação", "Financeiro", "Sucesso Cliente"
  status: "novo" | "em_andamento" | "aguardando_cliente" | "concluido";
  tags: string[];
  criado_em: number;
  ultima_msg_em: number;
  ultima_direcao?: "inbound" | "outbound";
  ultima_mensagem?: string;
  unread_count?: number;
  avatar_url?: string;
}

export interface ChatMessage {
  id?: string;
  id_atendimento: string;
  id_mensagem_waha?: string;
  direcao: "inbound" | "outbound" | "system";
  remetente: string;
  texto: string;
  timestamp: number;
  tipo?: "chat" | "image" | "audio" | "document" | "system";
}

interface AtendimentoWahaPageProps {
  loggedUser: string;
  userRole: "vendedor" | "admin" | "";
  theme?: "light" | "dark";
}

// Initial mock fallback seed to guarantee rich initial data
const SEED_TICKETS: Ticket[] = [
  {
    chat_id: "5551998887711",
    cliente_nome: "Lucas Pereira",
    atendente_atual: "Amanda",
    fila: "Suporte",
    status: "em_andamento",
    tags: ["PRIORIDADE", "EZ TECH"],
    criado_em: Date.now() - 15 * 60 * 1000,
    ultima_msg_em: Date.now() - 2 * 60 * 1000,
    ultima_direcao: "inbound",
    ultima_mensagem: "Preciso de auxílio para reiniciar o modem no endereço do Centro.",
    unread_count: 2,
  },
  {
    chat_id: "5551995554433",
    cliente_nome: "Isabela Costa",
    atendente_atual: "",
    fila: "Comercial",
    status: "novo",
    tags: ["LEAD WHITE LABEL", "FLUXO IA"],
    criado_em: Date.now() - 8 * 60 * 1000,
    ultima_msg_em: Date.now() - 5 * 60 * 1000,
    ultima_direcao: "inbound",
    ultima_mensagem: "Gostaria de contratar o plano de 700 Mega para o bairro Conventos em Lajeado.",
    unread_count: 1,
  },
  {
    chat_id: "5551981112233",
    cliente_nome: "Fernanda Lima",
    atendente_atual: "Stefani",
    fila: "Sucesso do Cliente",
    status: "em_andamento",
    tags: ["RENOVAÇÃO", "NOVA ASSINATURA"],
    criado_em: Date.now() - 45 * 60 * 1000,
    ultima_msg_em: Date.now() - 12 * 60 * 1000,
    ultima_direcao: "outbound",
    ultima_mensagem: "Ótimo Fernanda! Já agendei a sua upgrade de velocidade sem custo extra.",
    unread_count: 0,
  },
  {
    chat_id: "5551991234567",
    cliente_nome: "Ana Clara",
    atendente_atual: "",
    fila: "Implantação",
    status: "novo",
    tags: ["AGENDAMENTO", "FTTA"],
    criado_em: Date.now() - 25 * 60 * 1000,
    ultima_msg_em: Date.now() - 18 * 60 * 1000,
    ultima_direcao: "inbound",
    ultima_mensagem: "O técnico pode passar amanhã pela manhã no bairro São Cristóvão?",
    unread_count: 3,
  },
  {
    chat_id: "5551988889900",
    cliente_nome: "Marcos Oliveira",
    atendente_atual: "Bruno Garcia Queiroz",
    fila: "Financeiro",
    status: "em_andamento",
    tags: ["2ª VIA PIX"],
    criado_em: Date.now() - 90 * 60 * 1000,
    ultima_msg_em: Date.now() - 30 * 60 * 1000,
    ultima_direcao: "outbound",
    ultima_mensagem: "Código PIX gerado com sucesso! A chave foi enviada acima.",
    unread_count: 0,
  }
];

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  "5551998887711": [
    {
      id_atendimento: "5551998887711",
      direcao: "system",
      remetente: "Sistema",
      texto: "Card criado / Atendimento iniciado pelo Agente de IA em Lajeado",
      timestamp: Date.now() - 15 * 60 * 1000,
      tipo: "system",
    },
    {
      id_atendimento: "5551998887711",
      direcao: "inbound",
      remetente: "Lucas Pereira",
      texto: "Olá, boa tarde! A internet oscilou aqui na loja no Centro.",
      timestamp: Date.now() - 14 * 60 * 1000,
      tipo: "chat",
    },
    {
      id_atendimento: "5551998887711",
      direcao: "outbound",
      remetente: "Amanda - Suporte",
      texto: "Olá Lucas! Me chamo Amanda. Já estou analisando o sinal da sua fibra óptica aqui.",
      timestamp: Date.now() - 10 * 60 * 1000,
      tipo: "chat",
    },
    {
      id_atendimento: "5551998887711",
      direcao: "inbound",
      remetente: "Lucas Pereira",
      texto: "Preciso de auxílio para reiniciar o modem no endereço do Centro.",
      timestamp: Date.now() - 2 * 60 * 1000,
      tipo: "chat",
    }
  ],
  "5551995554433": [
    {
      id_atendimento: "5551995554433",
      direcao: "system",
      remetente: "Sistema",
      texto: "Card criado / Lead capturado via Formulário Web Lajeado",
      timestamp: Date.now() - 8 * 60 * 1000,
      tipo: "system",
    },
    {
      id_atendimento: "5551995554433",
      direcao: "inbound",
      remetente: "Isabela Costa",
      texto: "Gostaria de contratar o plano de 700 Mega para o bairro Conventos em Lajeado.",
      timestamp: Date.now() - 5 * 60 * 1000,
      tipo: "chat",
    }
  ]
};

const RESPOSTAS_RAPIDAS = [
  "Olá! Sou da equipe MHNET. Como posso te ajudar hoje?",
  "Temos planos super velozes de 500MB e 700MB de Fibra Óptica com instalação grátis em Lajeado e região!",
  "Sua solicitação foi encaminhada para a nossa equipe técnica e em instantes daremos retorno.",
  "Aqui está o código Pix para pagamento rápido da sua fatura.",
  "Atendimento concluído com sucesso! A MHNET agradece a sua preferência."
];

export function AtendimentoWahaPage({ loggedUser, userRole, theme = "dark" }: AtendimentoWahaPageProps) {
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [selectedChatId, setSelectedChatId] = useState<string>("5551998887711");
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(SEED_MESSAGES);
  
  // Dedicated local theme for WAHA screen
  const [wahaTheme, setWahaTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("waha_theme") as "dark" | "light") || theme || "dark";
  });

  useEffect(() => {
    if (theme) {
      setWahaTheme(theme);
    }
  }, [theme]);

  const toggleWahaTheme = () => {
    setWahaTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("waha_theme", next);
      return next;
    });
  };

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [tabFilter, setTabFilter] = useState<"novos" | "meus" | "outros" | "concluidos">("novos");
  const [vendedorFilter, setVendedorFilter] = useState<string>("Todos");

  // Collapsible shortcuts column state
  const [isShortcutsCollapsed, setIsShortcutsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("waha_shortcuts_collapsed") === "true";
  });

  const toggleShortcuts = () => {
    setIsShortcutsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("waha_shortcuts_collapsed", String(next));
      return next;
    });
  };

  // Input & Modal states
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConcludeModal, setShowConcludeModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportsTab, setReportsTab] = useState<"sla" | "tags" | "equipe">("sla");
  const [isTriggeringN8nReport, setIsTriggeringN8nReport] = useState(false);
  const [n8nSuccessMsg, setN8nSuccessMsg] = useState("");

  const handleTriggerN8nReport = async () => {
    setIsTriggeringN8nReport(true);
    setN8nSuccessMsg("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setN8nSuccessMsg("🚀 Resumo Executivo de KPIs enviado com sucesso para o grupo de Gestão via WhatsApp (n8n Webhook)!");
      setTimeout(() => setN8nSuccessMsg(""), 6000);
    } catch (err) {
      console.error("Erro ao disparar relatório n8n:", err);
    } finally {
      setIsTriggeringN8nReport(false);
    }
  };
  const [transferTargetVendor, setTransferTargetVendor] = useState<string>(INITIAL_VENDORS[0] || "Bruno Garcia Queiroz");
  const [concludeNotes, setConcludeNotes] = useState("");
  const [concludeTag, setConcludeTag] = useState("Atendimento Concluído");
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [isAddingNewLeadModal, setIsAddingNewLeadModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientFila, setNewClientFila] = useState("Comercial");

  // Diagnostic state for Firestore real-time connection check
  const [diagnostic, setDiagnostic] = useState<{
    status: "connected" | "connecting" | "error";
    counts: { atendimentos: number; atendimentos_waha: number; mensagens: number; mensagens_waha: number };
    lastUpdate: string | null;
    errorMsg: string | null;
    isTesting: boolean;
    testSuccessMsg: string | null;
  }>({
    status: "connecting",
    counts: { atendimentos: 0, atendimentos_waha: 0, mensagens: 0, mensagens_waha: 0 },
    lastUpdate: null,
    errorMsg: null,
    isTesting: false,
    testSuccessMsg: null,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync with Firestore in Real-Time (listening to 'atendimentos', 'atendimentos_waha', 'mensagens', 'mensagens_waha')
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    const handleTicketsSnapshot = (snapshot: any, colName: "atendimentos" | "atendimentos_waha") => {
      setDiagnostic((prev) => ({
        ...prev,
        status: "connected",
        lastUpdate: new Date().toLocaleTimeString(),
        counts: { ...prev.counts, [colName]: snapshot.size || snapshot.docs?.length || 0 },
      }));

      if (!snapshot.empty) {
        const list: Ticket[] = [];
        snapshot.forEach((docSnap: any) => {
          const data = docSnap.data();
          
          // Extract timestamp properly (support seconds vs milliseconds and raw WAHA payload)
          let rawTs = data.ultima_msg_em || data.timestamp || data.payload?.timestamp || Date.now();
          if (typeof rawTs === "number" && rawTs < 10000000000) {
            rawTs = rawTs * 1000;
          }

          const rawChatId = String(
            data.chat_id || data.from || data.payload?.from || docSnap.id
          );

          const ticket: Ticket = {
            chat_id: rawChatId,
            cliente_nome:
              data.cliente_nome ||
              data.pushName ||
              data.payload?.pushName ||
              data.payload?._data?.notifyName ||
              data.name ||
              rawChatId.split("@")[0] ||
              "Cliente WAHA",
            atendente_atual: data.atendente_atual || "",
            fila: data.fila || "Comercial",
            status: data.status || "novo",
            tags: Array.isArray(data.tags) ? data.tags : ["WAHA"],
            criado_em: data.criado_em || rawTs,
            ultima_msg_em: rawTs,
            ultima_direcao:
              data.ultima_direcao ||
              (data.fromMe || data.payload?.fromMe ? "outbound" : "inbound"),
            ultima_mensagem:
              data.ultima_mensagem ||
              data.body ||
              data.texto ||
              data.payload?.body ||
              "",
            unread_count: data.unread_count ?? (data.fromMe ? 0 : 1),
            avatar_url: data.avatar_url || "",
          };
          list.push(ticket);
        });

        // Merge snapshot with local tickets
        setTickets((prev) => {
          const map = new Map<string, Ticket>();
          prev.forEach((t) => map.set(t.chat_id, t));
          list.forEach((t) => map.set(t.chat_id, t));
          return Array.from(map.values()).sort((a, b) => b.ultima_msg_em - a.ultima_msg_em);
        });
      }
    };

    try {
      unsubscribes.push(
        onSnapshot(
          collection(db, "atendimentos"),
          (snap) => handleTicketsSnapshot(snap, "atendimentos"),
          (err) => {
            console.warn("atendimentos sub error:", err);
            setDiagnostic((prev) => ({ ...prev, status: "error", errorMsg: err.message }));
          }
        )
      );

      unsubscribes.push(
        onSnapshot(
          collection(db, "atendimentos_waha"),
          (snap) => handleTicketsSnapshot(snap, "atendimentos_waha"),
          (err) => console.warn("atendimentos_waha sub error:", err)
        )
      );
    } catch (e: any) {
      console.warn("Firestore tickets error setup:", e);
      setDiagnostic((prev) => ({ ...prev, status: "error", errorMsg: e.message || String(e) }));
    }

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  // Sync Messages in Real-Time for all chats
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    const handleAllMsgsSnapshot = (snapshot: any, colName: "mensagens" | "mensagens_waha") => {
      setDiagnostic((prev) => ({
        ...prev,
        status: "connected",
        lastUpdate: new Date().toLocaleTimeString(),
        counts: { ...prev.counts, [colName]: snapshot.size || snapshot.docs?.length || 0 },
      }));

      if (!snapshot.empty) {
        const msgsByChat: Record<string, ChatMessage[]> = {};

        snapshot.forEach((docSnap: any) => {
          const data = docSnap.data();
          const chatIdRaw = String(
            data.id_atendimento || data.from || data.payload?.from || data.chat_id || docSnap.id
          );
          const cleanPhone = chatIdRaw.split("@")[0].replace(/\D/g, "");

          let msgTs = data.timestamp || data.time || data.payload?.timestamp || Date.now();
          if (typeof msgTs === "number" && msgTs < 10000000000) {
            msgTs = msgTs * 1000;
          }

          const msg: ChatMessage = {
            id: docSnap.id,
            id_atendimento: chatIdRaw,
            id_mensagem_waha: data.id_mensagem_waha || data.id,
            direcao:
              data.direcao ||
              (data.fromMe || data.payload?.fromMe ? "outbound" : "inbound"),
            remetente:
              data.remetente ||
              data.pushName ||
              data.payload?.pushName ||
              (data.fromMe || data.payload?.fromMe ? "Atendente" : "Cliente"),
            texto: data.texto || data.body || data.payload?.body || data.message || "",
            timestamp: msgTs,
            tipo: data.tipo || "chat",
          };

          const keys = Array.from(new Set([chatIdRaw, cleanPhone, `${cleanPhone}@c.us`, `+${cleanPhone}`])).filter(
            Boolean
          );

          keys.forEach((key) => {
            if (!msgsByChat[key]) msgsByChat[key] = [];
            msgsByChat[key].push(msg);
          });
        });

        setMessagesMap((prev) => {
          const next = { ...prev };
          Object.keys(msgsByChat).forEach((chatKey) => {
            const currentList = next[chatKey] || [];
            const map = new Map<string, ChatMessage>();
            currentList.forEach((m) => map.set(m.id, m));
            msgsByChat[chatKey].forEach((m) => map.set(m.id, m));
            const sorted = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
            next[chatKey] = sorted;
          });
          return next;
        });
      }
    };

    try {
      unsubscribes.push(
        onSnapshot(
          collection(db, "mensagens"),
          (snap) => handleAllMsgsSnapshot(snap, "mensagens"),
          (err) => console.warn("mensagens error:", err)
        )
      );

      unsubscribes.push(
        onSnapshot(
          collection(db, "mensagens_waha"),
          (snap) => handleAllMsgsSnapshot(snap, "mensagens_waha"),
          (err) => console.warn("mensagens_waha error:", err)
        )
      );
    } catch (e: any) {
      console.warn("Messages firestore error:", e);
    }

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  // Handler for Diagnostic Test Message
  const handleTestFirestoreWrite = async () => {
    setDiagnostic((prev) => ({ ...prev, isTesting: true, testSuccessMsg: null, errorMsg: null }));
    try {
      const testChatId = selectedChatId || "5551998887711";
      const now = Date.now();

      // Write test message
      await addDoc(collection(db, "mensagens"), {
        id_atendimento: testChatId,
        texto: `🧪 [Teste Real-time] Mensagem recebida em ${new Date().toLocaleTimeString()}`,
        direcao: "inbound",
        remetente: "Cliente WAHA (Teste)",
        timestamp: now,
        tipo: "chat",
      });

      // Update ticket
      await setDoc(
        doc(db, "atendimentos", testChatId),
        {
          chat_id: testChatId,
          cliente_nome: "Isabela Costa (MHNET Fibra)",
          ultima_mensagem: "🧪 Teste Real-time recebido com sucesso!",
          ultima_msg_em: now,
          ultima_direcao: "inbound",
          status: "novo",
          fila: "Comercial",
          unread_count: 1,
        },
        { merge: true }
      );

      setDiagnostic((prev) => ({
        ...prev,
        isTesting: false,
        testSuccessMsg: "✅ Teste gravado no Firestore! O listener onSnapshot capturou e atualizou a tela instantaneamente.",
      }));

      setTimeout(() => {
        setDiagnostic((prev) => ({ ...prev, testSuccessMsg: null }));
      }, 6000);
    } catch (err: any) {
      console.error("Erro no teste do Firestore:", err);
      setDiagnostic((prev) => ({
        ...prev,
        isTesting: false,
        errorMsg: `Falha no Firestore: ${err.message || String(err)}`,
      }));
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedChatId, messagesMap]);

  // Fetch API sync backup
  const handleRefreshData = async () => {
    setIsSyncingServer(true);
    try {
      const res = await fetch("/api/waha/atendimentos");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.atendimentos) && data.atendimentos.length > 0) {
          setTickets(data.atendimentos);
        }
      }
    } catch (e) {
      console.error("API sync error:", e);
    } finally {
      setTimeout(() => setIsSyncingServer(false), 500);
    }
  };

  // Vendedores list
  const listVendedores = Array.from(
    new Set([
      "Todos",
      "Sem Atendente",
      ...INITIAL_VENDORS,
      ...tickets.map((t) => t.atendente_atual).filter(Boolean)
    ])
  );

  // Filtered tickets logic
  const activeTickets = tickets.filter((t) => {
    // 1. Search filter
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      const matchName = t.cliente_nome.toLowerCase().includes(s);
      const matchPhone = t.chat_id.includes(s);
      const matchTag = t.tags?.some((tg) => tg.toLowerCase().includes(s));
      const matchVendor = t.atendente_atual?.toLowerCase().includes(s);
      if (!matchName && !matchPhone && !matchTag && !matchVendor) return false;
    }

    // 2. Vendedor filter
    if (vendedorFilter !== "Todos") {
      if (vendedorFilter === "Sem Atendente") {
        if (t.atendente_atual) return false;
      } else {
        if (!t.atendente_atual?.toLowerCase().includes(vendedorFilter.toLowerCase())) {
          return false;
        }
      }
    }

    // 3. Tab filter
    if (tabFilter === "novos") {
      return t.status === "novo" || !t.atendente_atual;
    }
    if (tabFilter === "meus") {
      return t.atendente_atual?.toLowerCase().includes(loggedUser.split(" ")[0].toLowerCase()) && t.status !== "concluido";
    }
    if (tabFilter === "concluidos") {
      return t.status === "concluido";
    }
    // "outros" / "todos"
    return true;
  });

  const selectedTicket = tickets.find((t) => t.chat_id === selectedChatId) || tickets[0];
  const currentMessages = selectedChatId ? messagesMap[selectedChatId] || [] : [];

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || !selectedTicket) return;

    setInputMessage("");
    setSending(true);

    const now = Date.now();
    const newMsg: ChatMessage = {
      id_atendimento: selectedTicket.chat_id,
      direcao: "outbound",
      remetente: `${loggedUser || "Consultor"} - ${selectedTicket.fila}`,
      texto: textToSend,
      timestamp: now,
      tipo: "chat",
    };

    // 1. Local Optimistic Update
    setMessagesMap((prev) => ({
      ...prev,
      [selectedTicket.chat_id]: [...(prev[selectedTicket.chat_id] || []), newMsg],
    }));

    setTickets((prev) =>
      prev.map((t) =>
        t.chat_id === selectedTicket.chat_id
          ? {
              ...t,
              ultima_mensagem: textToSend,
              ultima_msg_em: now,
              ultima_direcao: "outbound",
              unread_count: 0,
              status: t.status === "novo" ? "em_andamento" : t.status,
              atendente_atual: t.atendente_atual || loggedUser || "Atendente",
            }
          : t
      )
    );

    // 2. Send via Backend Server API & Firestore
    try {
      await fetch("/api/waha/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: selectedTicket.chat_id,
          cliente_nome: selectedTicket.cliente_nome,
          texto: textToSend,
          remetente: loggedUser || "Atendente",
          fila: selectedTicket.fila,
        }),
      });

      // Also persist to client Firestore directly
      await addDoc(collection(db, "mensagens"), newMsg);
      await setDoc(doc(db, "atendimentos", selectedTicket.chat_id), {
        ...selectedTicket,
        ultima_mensagem: textToSend,
        ultima_msg_em: now,
        ultima_direcao: "outbound",
        unread_count: 0,
        status: selectedTicket.status === "novo" ? "em_andamento" : selectedTicket.status,
        atendente_atual: selectedTicket.atendente_atual || loggedUser || "Atendente",
      }, { merge: true });
    } catch (err) {
      console.warn("Message sync warning:", err);
    } finally {
      setSending(false);
    }
  };

  // Assign Ticket to Logged User
  const handleAssignToMe = async () => {
    if (!selectedTicket) return;
    const now = Date.now();
    const updated = {
      ...selectedTicket,
      atendente_atual: loggedUser || "Consultor",
      status: "em_andamento" as const,
    };

    setTickets((prev) => prev.map((t) => (t.chat_id === selectedTicket.chat_id ? updated : t)));

    // System event message
    const sysMsg: ChatMessage = {
      id_atendimento: selectedTicket.chat_id,
      direcao: "system",
      remetente: "Sistema",
      texto: `Atendimento assumido por ${loggedUser || "Consultor"}`,
      timestamp: now,
      tipo: "system",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedTicket.chat_id]: [...(prev[selectedTicket.chat_id] || []), sysMsg],
    }));

    try {
      await fetch("/api/waha/assign-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: selectedTicket.chat_id, atendente: loggedUser }),
      });
      await setDoc(doc(db, "atendimentos", selectedTicket.chat_id), updated, { merge: true });
      await addDoc(collection(db, "mensagens"), sysMsg);
    } catch (e) {
      console.warn("Assign error:", e);
    }
  };

  // Transfer Ticket Vendedor
  const handleTransfer = async () => {
    if (!selectedTicket) return;
    const now = Date.now();
    const updated = {
      ...selectedTicket,
      atendente_atual: transferTargetVendor,
      fila: "Comercial",
    };

    setTickets((prev) => prev.map((t) => (t.chat_id === selectedTicket.chat_id ? updated : t)));

    const sysMsg: ChatMessage = {
      id_atendimento: selectedTicket.chat_id,
      direcao: "system",
      remetente: "Sistema",
      texto: `Atendimento transferido para Vendedor Comercial: ${transferTargetVendor} por ${loggedUser}`,
      timestamp: now,
      tipo: "system",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedTicket.chat_id]: [...(prev[selectedTicket.chat_id] || []), sysMsg],
    }));

    setShowTransferModal(false);

    try {
      await setDoc(doc(db, "atendimentos", selectedTicket.chat_id), updated, { merge: true });
      await addDoc(collection(db, "mensagens"), sysMsg);
    } catch (e) {
      console.warn("Transfer error:", e);
    }
  };

  // Conclude Ticket & Save SLA to Google Sheets
  const handleConcludeTicket = async () => {
    if (!selectedTicket) return;
    const now = Date.now();
    const updated = {
      ...selectedTicket,
      status: "concluido" as const,
      tags: Array.from(new Set([...(selectedTicket.tags || []), concludeTag])),
    };

    setTickets((prev) => prev.map((t) => (t.chat_id === selectedTicket.chat_id ? updated : t)));

    const sysMsg: ChatMessage = {
      id_atendimento: selectedTicket.chat_id,
      direcao: "system",
      remetente: "Sistema",
      texto: `Atendimento Concluído. Obs: ${concludeNotes || "Sem observações extra."}`,
      timestamp: now,
      tipo: "system",
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedTicket.chat_id]: [...(prev[selectedTicket.chat_id] || []), sysMsg],
    }));

    setShowConcludeModal(false);

    // Call Backend API to append SLA line in Google Sheets
    try {
      await fetch("/api/waha/complete-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: selectedTicket.chat_id,
          cliente_nome: selectedTicket.cliente_nome,
          atendente: selectedTicket.atendente_atual || loggedUser,
          fila: selectedTicket.fila,
          criado_em: selectedTicket.criado_em,
          concluido_em: now,
          resumo: concludeNotes,
          tag: concludeTag,
        }),
      });

      await setDoc(doc(db, "atendimentos", selectedTicket.chat_id), updated, { merge: true });
      await addDoc(collection(db, "mensagens"), sysMsg);
    } catch (e) {
      console.warn("Conclude error:", e);
    }
  };

  // Add New Manuel Ticket/Lead
  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) return;

    const formattedPhone = newClientPhone.replace(/\D/g, "");
    const now = Date.now();
    const newTicket: Ticket = {
      chat_id: formattedPhone || `5551${Date.now().toString().slice(-7)}`,
      cliente_nome: newClientName,
      atendente_atual: loggedUser || "Atendente",
      fila: newClientFila,
      status: "novo",
      tags: ["NOVO CONTATO", "WHATSAPP"],
      criado_em: now,
      ultima_msg_em: now,
      ultima_direcao: "inbound",
      ultima_mensagem: "Contato iniciado via Painel de Atendimento",
      unread_count: 1,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedChatId(newTicket.chat_id);
    setIsAddingNewLeadModal(false);
    setNewClientName("");
    setNewClientPhone("");

    try {
      await setDoc(doc(db, "atendimentos", newTicket.chat_id), newTicket);
    } catch (e) {
      console.warn("Create lead error:", e);
    }
  };

  // Calculate SLA status color & duration
  const getSlaStatus = (criadoEm: number) => {
    const elapsedMinutes = Math.floor((Date.now() - criadoEm) / 60000);
    if (elapsedMinutes < 15) {
      return { label: `${elapsedMinutes}m`, color: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50 border-emerald-200" };
    }
    if (elapsedMinutes <= 30) {
      return { label: `${elapsedMinutes}m`, color: "bg-amber-500", text: "text-amber-600", bgLight: "bg-amber-50 border-amber-200" };
    }
    return { label: `${elapsedMinutes}m`, color: "bg-rose-500 animate-pulse", text: "text-rose-600", bgLight: "bg-rose-50 border-rose-200" };
  };

  // Counters
  const countNovos = tickets.filter((t) => t.status === "novo" || !t.atendente_atual).length;
  const countMeus = tickets.filter((t) => t.atendente_atual?.toLowerCase().includes(loggedUser.split(" ")[0].toLowerCase()) && t.status !== "concluido").length;
  const countOutros = tickets.length;
  const countConcluidos = tickets.filter((t) => t.status === "concluido").length;

  const isLight = wahaTheme === "light";

  // If reports view is active, display the Full Screen Reports & Dashboards Page
  if (showReportsModal) {
    return (
      <div className={`flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] ${isLight ? "bg-slate-100 border-slate-200 text-slate-800 shadow-xl" : "bg-slate-900 border-slate-800 text-white shadow-2xl"} rounded-2xl overflow-hidden border font-sans transition-colors animate-in fade-in duration-200`}>
        {/* Full Screen Header with Prominent Back Button */}
        <div className={`${isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"} px-5 py-3.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 transition-colors`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReportsModal(false)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-sky-900/20 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Atendimento</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-700/50 hidden sm:block"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-white"} tracking-tight`}>
                    Painel Geral de Relatórios, KPIs & Ciclo PDCA
                  </h2>
                  <span className="bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-500/30">
                    Lajeado / Estrela
                  </span>
                </div>
                <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"} font-medium`}>
                  Indicadores estratégicos alimentados em tempo real via Firebase, Google Sheets e automações n8n
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Theme toggle button inside reports view */}
            <button
              onClick={toggleWahaTheme}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isLight
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700"
              }`}
              title={isLight ? "Modo Escuro" : "Modo Claro"}
            >
              {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
              <span className="hidden sm:inline text-[11px] font-bold">
                {isLight ? "Modo Claro" : "Modo Escuro"}
              </span>
            </button>

            <button
              onClick={handleTriggerN8nReport}
              disabled={isTriggeringN8nReport}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer"
              title="Disparar resumo dos KPIs no WhatsApp via n8n"
            >
              <Share2 className={`w-3.5 h-3.5 ${isTriggeringN8nReport ? "animate-spin" : ""}`} />
              <span>{isTriggeringN8nReport ? "Disparando..." : "Enviar Resumo WhatsApp (n8n)"}</span>
            </button>
          </div>
        </div>

        {/* Success notification banner for n8n */}
        {n8nSuccessMsg && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-600 dark:text-emerald-300 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{n8nSuccessMsg}</span>
          </div>
        )}

        {/* Full Screen Navigation Tabs */}
        <div className={`px-6 pt-3 border-b ${isLight ? "bg-slate-100/80 border-slate-200" : "bg-slate-950/80 border-slate-800"} flex items-center gap-3 shrink-0 overflow-x-auto`}>
          <button
            onClick={() => setReportsTab("sla")}
            className={`pb-3 px-4 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              reportsTab === "sla"
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : isLight
                ? "border-transparent text-slate-500 hover:text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>⏱️ 1. SLA & Eficiência</span>
          </button>

          <button
            onClick={() => setReportsTab("tags")}
            className={`pb-3 px-4 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              reportsTab === "tags"
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : isLight
                ? "border-transparent text-slate-500 hover:text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>🏷️ 2. Estratégico & Tags</span>
          </button>

          <button
            onClick={() => setReportsTab("equipe")}
            className={`pb-3 px-4 text-xs font-extrabold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              reportsTab === "equipe"
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : isLight
                ? "border-transparent text-slate-500 hover:text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 3. Produtividade da Equipe</span>
          </button>
        </div>

        {/* Main Full Screen Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: SLA & EFICIÊNCIA */}
          {reportsTab === "sla" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top 4 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-2`}>
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>TMPR (1ª Resposta)</span>
                    <Clock className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>03m 48s</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Meta: &lt; 05m 00s (🟢 100% Ok)</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-2`}>
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>TMA (Atendimento Total)</span>
                    <Activity className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>16m 20s</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Meta: &lt; 25m 00s (🟢 Excelente)</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-2`}>
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                    <span>Taxa de SLA no Prazo</span>
                    <Target className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className={`text-2xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>84.6%</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <span>33/39 Chamados no Verde (&lt;15m)</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isLight ? "bg-rose-50/50 border-rose-200 text-rose-900 shadow-sm" : "bg-rose-950/20 border-rose-900/40 text-rose-300"} space-y-2`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                    <span>Gargalo Crítico de Fila</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-lg font-black text-rose-500 truncate">Implantação FTTA</div>
                  <div className="text-[10px] font-medium text-rose-400">
                    Média espera: 22m | Ação: Remanejar +1
                  </div>
                </div>
              </div>

              {/* SLA Distribution Progress Bar */}
              <div className={`p-5 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-3`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                    Distribuição da Saúde do SLA (Semafórico)
                  </h4>
                  <span className="text-xs text-slate-400 font-bold">Total: 39 Atendimentos no Dia</span>
                </div>

                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: "84.6%" }} title="Verde < 15m (84.6%)"></div>
                  <div className="bg-amber-500 h-full" style={{ width: "10.3%" }} title="Amarelo 15-30m (10.3%)"></div>
                  <div className="bg-rose-500 h-full" style={{ width: "5.1%" }} title="Vermelho > 30m (5.1%)"></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Verde (&lt; 15m): 33 (84.6%)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Amarelo (15-30m): 4 (10.3%)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span>Vermelho (&gt; 30m): 2 (5.1%)</span>
                  </div>
                </div>
              </div>

              {/* Queue SLA Breakdown Table */}
              <div className={`p-5 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-3`}>
                <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  Indicadores por Fila de Atendimento (Lajeado / Estrela)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-400"} text-[10px] uppercase tracking-wider font-extrabold`}>
                        <th className="py-2 px-3">Fila</th>
                        <th className="py-2 px-3">Chamados</th>
                        <th className="py-2 px-3">TMPR (1ª Resp.)</th>
                        <th className="py-2 px-3">TMA Total</th>
                        <th className="py-2 px-3">Conformidade SLA</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">Comercial / Vendas</td>
                        <td className="py-2.5 px-3 font-medium">14</td>
                        <td className="py-2.5 px-3 font-medium">02m 10s</td>
                        <td className="py-2.5 px-3 font-medium">12m 30s</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-500">92.8% Verde</td>
                        <td className="py-2.5 px-3 text-right"><span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">🟢 Saudável</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">Suporte Técnico</td>
                        <td className="py-2.5 px-3 font-medium">12</td>
                        <td className="py-2.5 px-3 font-medium">04m 15s</td>
                        <td className="py-2.5 px-3 font-medium">18m 40s</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-500">83.3% Verde</td>
                        <td className="py-2.5 px-3 text-right"><span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">🟢 Saudável</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">Implantação FTTA</td>
                        <td className="py-2.5 px-3 font-medium">6</td>
                        <td className="py-2.5 px-3 font-medium">08m 50s</td>
                        <td className="py-2.5 px-3 font-medium">24m 10s</td>
                        <td className="py-2.5 px-3 font-bold text-amber-500">66.7% Verde</td>
                        <td className="py-2.5 px-3 text-right"><span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">🟡 Gargalo</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">Financeiro</td>
                        <td className="py-2.5 px-3 font-medium">4</td>
                        <td className="py-2.5 px-3 font-medium">03m 05s</td>
                        <td className="py-2.5 px-3 font-medium">11m 20s</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-500">100% Verde</td>
                        <td className="py-2.5 px-3 text-right"><span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">🟢 Saudável</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">Sucesso do Cliente</td>
                        <td className="py-2.5 px-3 font-medium">3</td>
                        <td className="py-2.5 px-3 font-medium">01m 45s</td>
                        <td className="py-2.5 px-3 font-medium">09m 10s</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-500">100% Verde</td>
                        <td className="py-2.5 px-3 text-right"><span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">🟢 Saudável</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESTRATÉGICO & TAGS */}
          {reportsTab === "tags" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mapa de Calor por Tags */}
                <div className={`p-5 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                      🔥 Mapa de Calor por Tags & Assuntos
                    </h4>
                    <span className="text-[10px] text-sky-500 font-bold">Top Categorias</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-sky-600 dark:text-sky-400">#LEAD WHITE LABEL</span>
                        <span>15 chamados (38.5%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full" style={{ width: "38.5%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-indigo-600 dark:text-indigo-400">#FTTA (Implantação Fibra)</span>
                        <span>10 chamados (25.6%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: "25.6%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">#AGENDAMENTO</span>
                        <span>6 chamados (15.4%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "15.4%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-amber-600 dark:text-amber-400">#RETENCAO</span>
                        <span>4 chamados (10.3%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: "10.3%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-500">#SEGUNDA_VIA_FATURA</span>
                        <span>3 chamados (7.7%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full" style={{ width: "7.7%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Retenção e Churn */}
                <div className={`p-5 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-4`}>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                    🛡️ Análise de Retenção e Riscos (Sucesso do Cliente)
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"}`}>
                      <span className="text-[10px] text-slate-400 font-bold block">Chamados em Risco</span>
                      <span className="text-xl font-black text-amber-500">4 Clientes</span>
                    </div>
                    <div className={`p-3 rounded-lg border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"}`}>
                      <span className="text-[10px] text-slate-400 font-bold block">Taxa de Reversão</span>
                      <span className="text-xl font-black text-emerald-500">75% Sucesso</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${isLight ? "bg-sky-50 border-sky-200 text-sky-900" : "bg-sky-950/40 border-sky-900/40 text-sky-300"} text-xs space-y-1`}>
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Insight Automático n8n:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      80% dos chamados da fila Comercial em Lajeado envolvem pedidos de viabilidade para novos loteamentos FTTA. Excelente oportunidade para campanhas direcionadas!
                    </p>
                  </div>
                </div>
              </div>

              {/* Volume por Horário do Dia (Horário de Pico) */}
              <div className={`p-5 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                    📈 Volume de Mensagens por Horário (Picos de Demanda)
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-bold">Pico Principal: 10h00 às 11h00</span>
                </div>

                <div className="grid grid-cols-10 gap-1.5 items-end h-32 pt-4">
                  {[
                    { hour: "08h", count: 4, isPeak: false },
                    { hour: "09h", count: 8, isPeak: false },
                    { hour: "10h", count: 18, isPeak: true },
                    { hour: "11h", count: 12, isPeak: false },
                    { hour: "12h", count: 5, isPeak: false },
                    { hour: "13h", count: 7, isPeak: false },
                    { hour: "14h", count: 15, isPeak: true },
                    { hour: "15h", count: 11, isPeak: false },
                    { hour: "16h", count: 9, isPeak: false },
                    { hour: "17h", count: 6, isPeak: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[9px] font-extrabold text-slate-400">{item.count}</span>
                      <div
                        style={{ height: `${(item.count / 18) * 100}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          item.isPeak
                            ? "bg-gradient-to-t from-sky-600 to-indigo-500 animate-pulse"
                            : isLight ? "bg-slate-300" : "bg-slate-800"
                        }`}
                      ></div>
                      <span className="text-[9px] font-semibold text-slate-500">{item.hour}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUTIVIDADE DA EQUIPE */}
          {reportsTab === "equipe" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className={`p-5 rounded-xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/70 border-slate-800"} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                    🏆 Desempenho e Produtividade dos Atendentes (Lajeado / Estrela)
                  </h4>
                  <span className="text-xs text-sky-500 font-bold">Rastreabilidade Total</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${isLight ? "border-slate-200 text-slate-500" : "border-slate-800 text-slate-400"} text-[10px] uppercase tracking-wider font-extrabold`}>
                        <th className="py-2 px-3">Operador</th>
                        <th className="py-2 px-3">Atendimentos Concluídos</th>
                        <th className="py-2 px-3">TMA Médio</th>
                        <th className="py-2 px-3">Conformidade SLA</th>
                        <th className="py-2 px-3 text-right">Fila Principal</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"}`}>
                      <tr>
                        <td className="py-3 px-3 font-extrabold flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">KS</div>
                          <span>Karolina Santos</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-sky-500">38 tickets</td>
                        <td className="py-3 px-3 font-medium">14m 10s</td>
                        <td className="py-3 px-3 font-bold text-emerald-500">95% Verde</td>
                        <td className="py-3 px-3 text-right"><span className="bg-sky-500/15 text-sky-500 font-bold text-[10px] px-2 py-0.5 rounded">Comercial</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-extrabold flex items-center gap-2">
                          <div className="w-7 h-7 bg-sky-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">SW</div>
                          <span>Stefani Weber</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-sky-500">31 tickets</td>
                        <td className="py-3 px-3 font-medium">17m 30s</td>
                        <td className="py-3 px-3 font-bold text-emerald-500">91% Verde</td>
                        <td className="py-3 px-3 text-right"><span className="bg-indigo-500/15 text-indigo-500 font-bold text-[10px] px-2 py-0.5 rounded">Suporte</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-extrabold flex items-center gap-2">
                          <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">AM</div>
                          <span>Amanda Miller</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-sky-500">27 tickets</td>
                        <td className="py-3 px-3 font-medium">18m 05s</td>
                        <td className="py-3 px-3 font-bold text-emerald-500">88% Verde</td>
                        <td className="py-3 px-3 text-right"><span className="bg-emerald-500/15 text-emerald-500 font-bold text-[10px] px-2 py-0.5 rounded">Financeiro</span></td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-extrabold flex items-center gap-2">
                          <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">BG</div>
                          <span>Bruno Garcia Queiroz</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-sky-500">22 tickets</td>
                        <td className="py-3 px-3 font-medium">12m 40s</td>
                        <td className="py-3 px-3 font-bold text-emerald-500">96% Verde</td>
                        <td className="py-3 px-3 text-right"><span className="bg-amber-500/15 text-amber-500 font-bold text-[10px] px-2 py-0.5 rounded">Geral / Vendas</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* n8n + Sheets Integration Box */}
              <div className={`p-5 rounded-xl border ${isLight ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"} space-y-2`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                  <span>Sincronização em Tempo Real (Google Sheets & n8n)</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Cada atendimento concluído nesta Central envia instantaneamente a data/hora, atendente, fila, tags e tempo de resposta para a planilha Google Sheets vinculada. O webhook do n8n compila automaticamente o resumo executivo no WhatsApp para a gestão.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Full Screen Footer */}
        <div className={`px-6 py-3 border-t ${isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"} flex items-center justify-between shrink-0 text-xs`}>
          <span className="text-slate-400 font-medium">
            📊 Base de dados: Firestore + Google Sheets (Aba <strong className={isLight ? "text-slate-800" : "text-white"}>Atendimentos_WAHA</strong>)
          </span>
          <button
            onClick={() => setShowReportsModal(false)}
            className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Atendimento</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] ${isLight ? "bg-slate-100 border-slate-200 text-slate-800 shadow-xl" : "bg-slate-900 border-slate-800 text-white shadow-2xl"} rounded-2xl overflow-hidden border font-sans transition-colors`}>
      {/* Top Banner White Label Navigation Header */}
      <div className={`${isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"} px-5 py-3 border-b flex items-center justify-between shrink-0 transition-colors`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-extrabold ${isLight ? "text-slate-900" : "text-white"} tracking-wide`}>
                Central de Atendimento WhatsApp WAHA
              </h2>
              <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ONLINE
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"} font-medium`}>
              Gestão de Filas, Atendentes e SLA em Tempo Real (Firebase & Sheets)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Tema Exclusivo do Atendimento WhatsApp */}
          <button
            onClick={toggleWahaTheme}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              isLight
                ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/80 shadow-xs"
                : "bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700"
            }`}
            title={isLight ? "Mudar para modo escuro da Central WAHA" : "Mudar para modo claro da Central WAHA"}
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
            <span className="hidden sm:inline text-[11px] font-bold">
              {isLight ? "Modo Claro" : "Modo Escuro"}
            </span>
          </button>

          {/* Botão de Relatórios & Dashboards PDCA */}
          <button
            onClick={() => setShowReportsModal(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-md shadow-sky-900/20 cursor-pointer"
            title="Abrir métricas, gráficos e relatórios gerenciais"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Relatórios & Dashboards</span>
          </button>

          {/* Botão de Novo Lead */}
          <button
            onClick={() => setIsAddingNewLeadModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-900/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Atendimento</span>
          </button>
        </div>
      </div>

      {/* Bar de Diagnóstico em Tempo Real do Firestore */}
      <div className={`px-5 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/80 border-slate-800"
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Indicator Status */}
          <div className="flex items-center gap-1.5 font-bold">
            {diagnostic.status === "connected" && (
              <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Firestore Conectado (Real-Time)
              </span>
            )}
            {diagnostic.status === "connecting" && (
              <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 text-[11px]">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Conectando ao Firestore...
              </span>
            )}
            {diagnostic.status === "error" && (
              <span className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 text-[11px]">
                <AlertTriangle className="w-3 h-3" />
                Erro Firestore
              </span>
            )}
          </div>

          {/* Document Counters */}
          <div className={`flex flex-wrap items-center gap-2 text-[11px] font-medium ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            <span className={`px-2 py-0.5 rounded border ${isLight ? "bg-slate-200/60 border-slate-300" : "bg-slate-800 border-slate-700"}`}>
              Tickets no Banco: <strong className="text-sky-500 font-extrabold">{diagnostic.counts.atendimentos + diagnostic.counts.atendimentos_waha}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded border ${isLight ? "bg-slate-200/60 border-slate-300" : "bg-slate-800 border-slate-700"}`}>
              Mensagens Sincronizadas: <strong className="text-sky-500 font-extrabold">{diagnostic.counts.mensagens + diagnostic.counts.mensagens_waha}</strong>
            </span>
            {diagnostic.lastUpdate && (
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Sincronizado às {diagnostic.lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Test Firestore Read/Write */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestFirestoreWrite}
            disabled={diagnostic.isTesting}
            className="px-3 py-1 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-[11px] rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Grava uma mensagem de teste no Firestore para validar se o ouvinte onSnapshot atualiza a tela na hora"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-300 ${diagnostic.isTesting ? "animate-spin" : ""}`} />
            <span>{diagnostic.isTesting ? "Testando..." : "⚡ Testar Gravação em Tempo Real"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Messages Banner */}
      {diagnostic.testSuccessMsg && (
        <div className="px-5 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{diagnostic.testSuccessMsg}</span>
        </div>
      )}

      {diagnostic.errorMsg && (
        <div className="px-5 py-2 bg-rose-500/15 border-b border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{diagnostic.errorMsg}</span>
        </div>
      )}

      {/* Main Three-Pane Grid */}
      <div className={`flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden ${isLight ? "bg-slate-50" : "bg-slate-900"}`}>
        
        {/* COLUMN 1: Filters & Metrics (Retractable Column) */}
        {isShortcutsCollapsed ? (
          /* RETRACTED ICON-ONLY COLUMN */
          <div className={`md:col-span-1 border-r ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-slate-800 bg-slate-950/70 text-white"} flex flex-col items-center py-3 space-y-3 transition-all shrink-0 select-none overflow-y-auto`}>
            {/* Expand / Fix Button */}
            <button
              onClick={toggleShortcuts}
              title="Fixar / Expandir Painel de Atalhos"
              className="p-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 transition cursor-pointer flex flex-col items-center gap-1 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-tighter">Fixar</span>
            </button>

            <div className={`w-8 h-[1px] ${isLight ? "bg-slate-200" : "bg-slate-800"}`} />

            {/* Icon Quick Counters */}
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={() => setTabFilter("novos")}
                title={`Novos: ${countNovos}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative cursor-pointer border ${
                  tabFilter === "novos"
                    ? isLight ? "bg-sky-100 border-sky-400 text-sky-700" : "bg-sky-500/25 border-sky-400 text-sky-300"
                    : isLight ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                {countNovos > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sky-500 text-white font-extrabold text-[9px] px-1 rounded-full border border-slate-900">
                    {countNovos}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTabFilter("meus")}
                title={`Meus: ${countMeus}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative cursor-pointer border ${
                  tabFilter === "meus"
                    ? isLight ? "bg-indigo-100 border-indigo-400 text-indigo-700" : "bg-indigo-500/25 border-indigo-400 text-indigo-300"
                    : isLight ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <User className="w-4 h-4 text-indigo-400" />
                {countMeus > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-extrabold text-[9px] px-1 rounded-full border border-slate-900">
                    {countMeus}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTabFilter("outros")}
                title={`Todos: ${countOutros}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative cursor-pointer border ${
                  tabFilter === "outros"
                    ? isLight ? "bg-slate-300 border-slate-400 text-slate-900" : "bg-slate-800 border-slate-700 text-white"
                    : isLight ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setTabFilter("concluidos")}
                title={`Concluídos: ${countConcluidos}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition relative cursor-pointer border ${
                  tabFilter === "concluidos"
                    ? isLight ? "bg-emerald-100 border-emerald-400 text-emerald-700" : "bg-emerald-500/25 border-emerald-400 text-emerald-300"
                    : isLight ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>
            </div>

            <div className={`w-8 h-[1px] ${isLight ? "bg-slate-200" : "bg-slate-800"}`} />

            {/* Icon Vendor Filters */}
            <div className="flex flex-col gap-2 items-center">
              {listVendedores.map((v) => {
                const isSel = vendedorFilter === v;
                const count =
                  v === "Todos"
                    ? tickets.length
                    : v === "Sem Atendente"
                    ? tickets.filter((t) => !t.atendente_atual).length
                    : tickets.filter((t) => t.atendente_atual?.toLowerCase().includes(v.toLowerCase())).length;

                const initials =
                  v === "Todos"
                    ? "ALL"
                    : v === "Sem Atendente"
                    ? "SEM"
                    : v
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                return (
                  <button
                    key={v}
                    onClick={() => setVendedorFilter(v)}
                    title={`Vendedor: ${v} (${count})`}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative border font-extrabold text-[10px] ${
                      isSel
                        ? isLight ? "bg-sky-100 border-sky-400 text-sky-800 shadow-sm" : "bg-sky-600/30 border-sky-400 text-sky-300 shadow-sm"
                        : isLight ? "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {v === "Todos" ? (
                      <Users className="w-4 h-4 text-sky-400" />
                    ) : v === "Sem Atendente" ? (
                      <UserCheck className="w-4 h-4 text-amber-400" />
                    ) : (
                      <span>{initials}</span>
                    )}
                    <span className="absolute -bottom-1 -right-1 text-[8px] font-extrabold bg-slate-800 text-slate-300 px-1 rounded-full border border-slate-900">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* EXPANDED COLUMN */
          <div className={`md:col-span-3 border-r ${isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950/70"} flex flex-col overflow-y-auto transition-all`}>
            {/* Header with Retract Button */}
            <div className={`p-3 border-b ${isLight ? "border-slate-200 bg-slate-50" : "border-slate-800/80 bg-slate-950"} flex items-center justify-between shrink-0`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-slate-300"} flex items-center gap-1.5`}>
                <Users className="w-3.5 h-3.5 text-sky-500" />
                Vendedores & Atalhos
              </span>
              <button
                onClick={toggleShortcuts}
                title="Retrair Coluna (Apenas Ícones)"
                className={`px-2 py-1 rounded-lg ${isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"} transition cursor-pointer flex items-center gap-1 text-[10px] font-bold`}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>Retrair</span>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className={`p-3 border-b ${isLight ? "border-slate-200" : "border-slate-800/80"}`}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente, número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isLight ? "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400" : "bg-slate-900 border-slate-800 text-white placeholder-slate-500"} border rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-sky-500 transition`}
                />
              </div>
            </div>

            {/* Quick Counter Tabs */}
            <div className={`p-2 grid grid-cols-2 gap-1.5 border-b ${isLight ? "border-slate-200" : "border-slate-800/80"}`}>
              <button
                onClick={() => setTabFilter("novos")}
                className={`p-2 rounded-xl text-left transition relative cursor-pointer border ${
                  tabFilter === "novos"
                    ? isLight ? "bg-sky-50 border-sky-300 text-sky-700 font-bold" : "bg-sky-500/15 border-sky-500/40 text-sky-300 font-bold"
                    : isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80"
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Novos</div>
                <div className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-white"} flex items-center justify-between mt-0.5`}>
                  {countNovos}
                  {countNovos > 0 && <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>}
                </div>
              </button>

              <button
                onClick={() => setTabFilter("meus")}
                className={`p-2 rounded-xl text-left transition relative cursor-pointer border ${
                  tabFilter === "meus"
                    ? isLight ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold" : "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-bold"
                    : isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80"
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Meus</div>
                <div className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-white"} mt-0.5`}>{countMeus}</div>
              </button>

              <button
                onClick={() => setTabFilter("outros")}
                className={`p-2 rounded-xl text-left transition relative cursor-pointer border ${
                  tabFilter === "outros"
                    ? isLight ? "bg-slate-200 border-slate-300 text-slate-900 font-bold" : "bg-slate-800 border-slate-700 text-white font-bold"
                    : isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80"
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Todos</div>
                <div className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-white"} mt-0.5`}>{countOutros}</div>
              </button>

              <button
                onClick={() => setTabFilter("concluidos")}
                className={`p-2 rounded-xl text-left transition relative cursor-pointer border ${
                  tabFilter === "concluidos"
                    ? isLight ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold" : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                    : isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80"
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>Concluídos</div>
                <div className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-white"} mt-0.5`}>{countConcluidos}</div>
              </button>
            </div>

            {/* Vendedores Filter List */}
            <div className="p-3 space-y-1 flex-1 overflow-y-auto">
              <span className={`text-[10px] font-extrabold ${isLight ? "text-slate-400" : "text-slate-500"} uppercase tracking-widest block mb-2 px-1 flex items-center justify-between`}>
                <span>Vendedores</span>
                <span className="text-[9px] text-sky-500 lowercase font-bold">Comercial</span>
              </span>
              {listVendedores.map((v) => {
                const isSelected = vendedorFilter === v;
                const count =
                  v === "Todos"
                    ? tickets.length
                    : v === "Sem Atendente"
                    ? tickets.filter((t) => !t.atendente_atual).length
                    : tickets.filter((t) => t.atendente_atual?.toLowerCase().includes(v.toLowerCase())).length;

                return (
                  <button
                    key={v}
                    onClick={() => setVendedorFilter(v)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? isLight ? "bg-sky-50 text-sky-700 border border-sky-300 font-bold" : "bg-sky-600/20 text-sky-400 border border-sky-500/30 font-bold"
                        : isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    }`}
                  >
                    <span className="truncate pr-2">{v === "Todos" ? "Todos os Vendedores" : v}</span>
                    <span className={`text-[10px] ${isLight ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-900 text-slate-500 border-slate-800"} px-2 py-0.5 rounded-full font-bold border shrink-0`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SLA Metrics Bar Footer */}
            <div className={`p-3 border-t ${isLight ? "border-slate-200 bg-slate-100/80" : "border-slate-800 bg-slate-950/90"} space-y-1.5`}>
              <div className={`text-[10px] font-extrabold ${isLight ? "text-slate-600" : "text-slate-400"} uppercase tracking-wider flex items-center justify-between`}>
                <span>Indicadores SLA</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">Lajeado / Estrela</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
                <div className={`${isLight ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-950/40 border-emerald-800/50 text-emerald-400"} border p-1.5 rounded-lg font-bold`}>
                  🟢 &lt; 15m
                </div>
                <div className={`${isLight ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-amber-950/40 border-amber-800/50 text-amber-400"} border p-1.5 rounded-lg font-bold`}>
                  🟡 15-30m
                </div>
                <div className={`${isLight ? "bg-rose-100 border-rose-300 text-rose-800" : "bg-rose-950/40 border-rose-800/50 text-rose-400"} border p-1.5 rounded-lg font-bold`}>
                  🔴 &gt; 30m
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COLUMN 2: Tickets List */}
        <div className={`${isShortcutsCollapsed ? "md:col-span-5" : "md:col-span-4"} border-r ${isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900/90"} flex flex-col overflow-y-auto transition-colors`}>
          <div className={`p-3 border-b ${isLight ? "border-slate-200 bg-slate-50" : "border-slate-800/80 bg-slate-950/50"} flex items-center justify-between shrink-0`}>
            <span className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"} uppercase tracking-wider flex items-center gap-2`}>
              <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
              Atendimentos ({activeTickets.length})
            </span>
            <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-500"} font-semibold`}>Atualização em tempo real</span>
          </div>

          <div className={`flex-1 divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/60"} overflow-y-auto`}>
            {activeTickets.length === 0 ? (
              <div className={`p-8 text-center ${isLight ? "text-slate-400" : "text-slate-500"} text-xs`}>
                Nenhum atendimento encontrado para os filtros selecionados.
              </div>
            ) : (
              activeTickets.map((t) => {
                const isSelected = selectedChatId === t.chat_id;
                const sla = getSlaStatus(t.criado_em);
                const initials = t.cliente_nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={t.chat_id}
                    onClick={() => setSelectedChatId(t.chat_id)}
                    className={`p-3.5 cursor-pointer transition relative ${
                      isSelected
                        ? isLight
                          ? "bg-sky-50/80 border-l-4 border-l-sky-600 shadow-sm"
                          : "bg-slate-800/90 border-l-4 border-l-sky-500 shadow-md"
                        : isLight
                          ? "bg-white hover:bg-slate-100/80"
                          : "bg-transparent hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 ${isLight ? "bg-slate-200 text-sky-700 border-slate-300" : "bg-gradient-to-br from-slate-700 to-slate-800 text-sky-300 border-slate-700"} rounded-full flex items-center justify-center font-extrabold text-xs border shadow-sm`}>
                            {initials}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 ${isLight ? "border-white" : "border-slate-900"} rounded-full`}></span>
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-extrabold ${isLight ? "text-slate-900" : "text-white"} truncate leading-tight`}>
                            {t.cliente_nome}
                          </h4>
                          <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"} font-medium truncate block`}>
                            +{t.chat_id}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className={`w-2 h-2 rounded-full ${sla.color}`} title={`SLA: ${sla.label}`}></span>
                        <span className={`text-[9.5px] ${isLight ? "text-slate-400" : "text-slate-500"} mt-1 font-semibold`}>
                          {t.ultima_msg_em ? "há pouco" : "hoje"}
                        </span>
                      </div>
                    </div>

                    {/* Queue & Agent Badge */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className={`${isLight ? "bg-sky-100 text-sky-800 border-sky-200" : "bg-sky-500/20 text-sky-300 border-sky-500/30"} text-[9px] font-extrabold px-2 py-0.5 rounded-md border`}>
                        {t.fila.toUpperCase()}
                      </span>
                      {t.atendente_atual ? (
                        <span className={`${isLight ? "bg-indigo-100 text-indigo-800 border-indigo-200" : "bg-indigo-500/15 text-indigo-300 border-indigo-500/20"} text-[9px] font-bold px-1.5 py-0.5 rounded-md border truncate max-w-[120px]`}>
                          👤 {t.atendente_atual.split(" ")[0]}
                        </span>
                      ) : (
                        <span className={`${isLight ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-amber-500/20 text-amber-300 border-amber-500/30"} text-[9px] font-bold px-1.5 py-0.5 rounded-md border`}>
                          ⏳ Sem Atendente
                        </span>
                      )}
                    </div>

                    {/* Tags List */}
                    {t.tags && t.tags.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                        {t.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`${isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-300 border-slate-700/80"} text-[8.5px] font-semibold px-1.5 py-0.2 rounded border`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message Preview */}
                    <p className={`mt-2 text-[11px] ${isLight ? "text-slate-600" : "text-slate-400"} line-clamp-1 font-normal`}>
                      {t.ultima_direcao === "outbound" && <span className="text-sky-600 dark:text-sky-400 font-bold">Você: </span>}
                      {t.ultima_mensagem || "Aguardando interação..."}
                    </p>

                    {/* Unread badge */}
                    {t.unread_count && t.unread_count > 0 ? (
                      <span className="absolute right-3 bottom-3 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                        {t.unread_count}
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: Active Chat Stage */}
        <div className={`${isShortcutsCollapsed ? "md:col-span-6" : "md:col-span-5"} flex flex-col ${isLight ? "bg-slate-100" : "bg-slate-950/90"} overflow-hidden relative transition-colors`}>
          {selectedTicket ? (
            <>
              {/* Active Chat Header */}
              <div className={`p-3.5 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-md"} border-b flex items-center justify-between shrink-0`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-md">
                    {selectedTicket.cliente_nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`text-xs font-extrabold ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
                      {selectedTicket.cliente_nome}
                      <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"} font-normal`}>+{selectedTicket.chat_id}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9.5px] ${isLight ? "bg-slate-100 text-sky-700 border-slate-200" : "bg-slate-800 text-sky-400 border-slate-700"} px-2 py-0.5 rounded font-bold border`}>
                        {selectedTicket.fila}
                      </span>
                      <span className={`text-[9.5px] ${isLight ? "text-slate-500" : "text-slate-400"} font-medium`}>
                        Atendente: <strong className={isLight ? "text-slate-900" : "text-white"}>{selectedTicket.atendente_atual || "Livre"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  {!selectedTicket.atendente_atual && (
                    <button
                      onClick={handleAssignToMe}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Assumir
                    </button>
                  )}

                  <button
                    onClick={() => setShowTransferModal(true)}
                    className={`p-1.5 ${isLight ? "bg-slate-200 hover:bg-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 text-slate-300"} rounded-lg text-xs font-bold transition cursor-pointer`}
                    title="Transferir Fila"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setShowConcludeModal(true)}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Concluir
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div
                ref={chatContainerRef}
                className={`flex-1 p-4 overflow-y-auto space-y-3 ${
                  isLight
                    ? "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50"
                    : "bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
                }`}
              >
                {currentMessages.map((msg, index) => {
                  if (msg.direcao === "system") {
                    return (
                      <div key={index} className="flex justify-center my-2">
                        <span className={`${isLight ? "bg-white border-slate-200 text-slate-600 shadow-sm" : "bg-slate-900/90 border-slate-800 text-slate-400 shadow-sm"} border text-[9.5px] font-semibold px-3 py-1 rounded-full text-center flex items-center gap-1.5`}>
                          <Bot className="w-3 h-3 text-sky-500 shrink-0" />
                          {msg.texto}
                        </span>
                      </div>
                    );
                  }

                  const isOutbound = msg.direcao === "outbound";

                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isOutbound ? "items-end" : "items-start"} space-y-0.5`}
                    >
                      <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-slate-500"} px-1 font-medium`}>
                        {msg.remetente || (isOutbound ? loggedUser : selectedTicket.cliente_nome)}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-md ${
                          isOutbound
                            ? "bg-sky-600 text-white rounded-tr-none"
                            : isLight
                              ? "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                              : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/80"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.texto}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[8.5px] ${
                            isOutbound ? "text-sky-100" : isLight ? "text-slate-400" : "text-slate-400"
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isOutbound && <CheckCheck className="w-3 h-3 text-sky-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Replies Bar Popover */}
              {showQuickReplies && (
                <div className={`p-3 ${isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"} border-t space-y-1.5 animate-in slide-in-from-bottom duration-200`}>
                  <div className={`flex items-center justify-between text-[10px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"} uppercase tracking-wider mb-1`}>
                    <span>Respostas Rápidas MHNET</span>
                    <button
                      onClick={() => setShowQuickReplies(false)}
                      className={`${isLight ? "text-slate-400 hover:text-slate-700" : "text-slate-500 hover:text-white"}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {RESPOSTAS_RAPIDAS.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleSendMessage(reply);
                          setShowQuickReplies(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800" : "bg-slate-800 hover:bg-slate-700 text-slate-200"} text-xs transition cursor-pointer truncate`}
                      >
                        ⚡ {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Footer */}
              <div className={`p-3 ${isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"} border-t shrink-0`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className={`p-2 ${isLight ? "bg-slate-100 hover:bg-slate-200 text-sky-600" : "bg-slate-800 hover:bg-slate-700 text-sky-400"} rounded-xl transition cursor-pointer`}
                    title="Respostas Rápidas"
                  >
                    <Zap className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Digite sua mensagem para o cliente..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className={`flex-1 ${isLight ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400" : "bg-slate-950 border-slate-800 text-white placeholder-slate-500"} border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-sky-500 transition`}
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={sending || !inputMessage.trim()}
                    className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-md cursor-pointer flex items-center justify-center"
                  >
                    <SendHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={`flex flex-col items-center justify-center flex-1 ${isLight ? "text-slate-400" : "text-slate-500"} text-xs p-6 space-y-2`}>
              <MessageSquare className={`w-10 h-10 ${isLight ? "text-slate-300" : "text-slate-700"}`} />
              <p>Selecione um atendimento da lista ao lado para iniciar a conversa.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Transferir / Reatribuir Vendedor */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                Transferir Atendimento para Vendedor
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Selecione o Vendedor Comercial:</label>
              <select
                value={transferTargetVendor}
                onChange={(e) => setTransferTargetVendor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                {INITIAL_VENDORS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Concluir Atendimento & Gravar no Google Sheets */}
      {showConcludeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Concluir Atendimento & Relatório SLA
              </h3>
              <button onClick={() => setShowConcludeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ao concluir, os dados deste atendimento serão salvos e sincronizados com a planilha de SLA do Google Sheets.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Tag de Resultado:</label>
                <select
                  value={concludeTag}
                  onChange={(e) => setConcludeTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Atendimento Concluído">Atendimento Concluído</option>
                  <option value="Venda Realizada">Venda Realizada</option>
                  <option value="Dúvida Sanada">Dúvida Sanada</option>
                  <option value="Suporte Técnico Concluído">Suporte Técnico Concluído</option>
                  <option value="Agendamento Confirmado">Agendamento Confirmado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Observações / Resumo:</label>
                <textarea
                  rows={3}
                  placeholder="Descreva brevemente o atendimento para o relatório..."
                  value={concludeNotes}
                  onChange={(e) => setConcludeNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConcludeModal(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConcludeTicket}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Salvar & Concluir SLA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Novo Atendimento Manual */}
      {isAddingNewLeadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateNewClient} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                Novo Chamado WhatsApp
              </h3>
              <button type="button" onClick={() => setIsAddingNewLeadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nome do Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Silva"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Número do WhatsApp (com DDD):</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5551988887777"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Fila Inicial:</label>
                <select
                  value={newClientFila}
                  onChange={(e) => setNewClientFila(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Comercial">Comercial / Vendas</option>
                  <option value="Suporte">Suporte Técnico</option>
                  <option value="Implantação">Implantação / FTTA</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNewLeadModal(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
              >
                Criar Atendimento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AtendimentoWahaPage;

