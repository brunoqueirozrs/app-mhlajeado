import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=6c9aaaf1"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=6c9aaaf1"; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"];
import {
  Terminal,
  Bot,
  Wifi,
  LogOut,
  Loader2,
  Award,
  ClipboardList,
  MapPin,
  Users,
  HelpCircle,
  Activity,
  CalendarDays,
  BookOpen,
  User,
  Lock,
  Sparkles,
  Coins,
  Download,
  Sliders,
  Link,
  Calculator,
  UserCheck,
  Store,
  FileSpreadsheet,
  Zap,
  Search,
  X,
  FileText,
  Sun,
  Moon
} from "/node_modules/.vite/deps/lucide-react.js?v=6c9aaaf1";
import { INITIAL_VENDORS } from "/src/data.ts";
import Dashboard from "/src/components/Dashboard.tsx";
import InternalProtocolsPage from "/src/components/InternalProtocolsPage.tsx";
import InstallationsQueuePage from "/src/components/InstallationsQueuePage.tsx";
import LeadsPage from "/src/components/LeadsPage.tsx";
import FttaPage from "/src/components/FttaPage.tsx";
import TasksPage from "/src/components/TasksPage.tsx";
import IndicatorsPage from "/src/components/IndicatorsPage.tsx";
import BaseManagementPage from "/src/components/BaseManagementPage.tsx";
import CompetitorsPage from "/src/components/CompetitorsPage.tsx";
import ObjectionsPage from "/src/components/ObjectionsPage.tsx";
import AbsencesPage from "/src/components/AbsencesPage.tsx";
import MaterialsPage from "/src/components/MaterialsPage.tsx";
import PlanosPage from "/src/components/PlanosPage.tsx";
import RotaVendasPage from "/src/components/RotaVendasPage.tsx";
import EstrategiaPage from "/src/components/EstrategiaPage.tsx";
import ChatModal from "/src/components/ChatModal.tsx";
import CobrancasPage from "/src/components/CobrancasPage.tsx";
import VendedoresPage from "/src/components/VendedoresPage.tsx";
import InstallationsPage from "/src/components/InstallationsPage.tsx";
import ExternalStorePortal from "/src/components/ExternalStorePortal.tsx";
import { AdminN8NPage } from "/src/components/AdminN8NPage.tsx";
import AdminLogsPage from "/src/components/AdminLogsPage.tsx";
import GestaoPessoasPage from "/src/components/GestaoPessoasPage.tsx";
import CalculoMultaPage from "/src/components/CalculoMultaPage.tsx";
import PosVendaPage from "/src/components/PosVendaPage.tsx";
import MatrizObjecoesPage from "/src/components/MatrizObjecoesPage.tsx";
import TradePage from "/src/components/TradePage.tsx";
import { LeadsFriosTab } from "/src/components/LeadsFriosTab.tsx";
import { initAuth, getAccessToken, googleSignIn } from "/src/lib/auth.ts";
import { createGoogleCalendarEvent, createGoogleTask } from "/src/lib/googleApi.ts";
export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [loggedUser, setLoggedUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loginTerm, setLoginTerm] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingInAnim, setIsLoggingInAnim] = useState(false);
  const [loginStageText, setLoginStageText] = useState("");
  const [webhookError, setWebhookError] = useState(false);
  useEffect(() => {
    const handler = () => setWebhookError(true);
    window.addEventListener("webhook-error", handler);
    return () => window.removeEventListener("webhook-error", handler);
  }, []);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [leads, setLeads] = useState([]);
  const [fttaItems, setFttaItems] = useState([]);
  const [fttaProsps, setFttaProsps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [baseClients, setBaseClients] = useState([]);
  const [baseActions, setBaseActions] = useState([]);
  const [cobrancas, setCobrancas] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leadsFilterSeller, setLeadsFilterSeller] = useState(null);
  const [isExternalPartnerMode, setIsExternalPartnerMode] = useState(false);
  const [fttaTab, setFttaTab] = useState("lajeado");
  const [registeredVendors, setRegisteredVendors] = useState([]);
  const [availableVendors, setAvailableVendors] = useState(INITIAL_VENDORS);
  const [isAiKeyLeaked, setIsAiKeyLeaked] = useState(false);
  const [aiKeyErrorMessage, setAiKeyErrorMessage] = useState("");
  const [missingEnvKeys, setMissingEnvKeys] = useState([]);
  const [invalidEnvKeys, setInvalidEnvKeys] = useState([]);
  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPWABanner, setShowPWABanner] = useState(false);
  const [showPWAInstructions, setShowPWAInstructions] = useState(false);
  useEffect(() => {
    initAuth(
      () => setHasGoogleAuth(true),
      () => setHasGoogleAuth(false)
    );
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowPWABanner(false);
      localStorage.setItem("pwa_banner_dismissed", "true");
    });
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || "standalone" in navigator && navigator.standalone;
    const isDismissed = localStorage.getItem("pwa_banner_dismissed") === "true";
    if (!isStandalone && !isDismissed && window.innerWidth < 768) {
      const bannerTimer = setTimeout(() => setShowPWABanner(true), 3e3);
      return () => clearTimeout(bannerTimer);
    }
    if (window.location.search.includes("mode=equipe-loja")) {
      setIsExternalPartnerMode(true);
    }
    if (window.location.search.includes("tab=cadastroLead")) {
      setActiveTab("cadastroLead");
    }
    fetch("/api/gemini/status").then((res) => res.json()).then((d) => {
      if (d && d.isLeaked) {
        setIsAiKeyLeaked(true);
        setAiKeyErrorMessage(d.errorMessage || "Your API key was reported as leaked.");
      }
    }).catch((err) => console.warn("Erro ao buscar status do Gemini:", err));
    fetch("/api/config/status").then((res) => res.json()).then((d) => {
      if (d && d.status === "issues") {
        if (d.missingKeys && d.missingKeys.length > 0) {
          console.error("⚠️ Variáveis de ambiente obrigatórias ausentes no .env:", d.missingKeys);
          setMissingEnvKeys(d.missingKeys);
        }
        if (d.invalidFormatKeys && d.invalidFormatKeys.length > 0) {
          console.error("⚠️ Variáveis de ambiente com formato inválido no .env:", d.invalidFormatKeys);
          setInvalidEnvKeys(d.invalidFormatKeys);
        }
      }
    }).catch((err) => console.warn("Erro ao verificar chaves de ambiente:", err));
    fetch("/api/vendors").then((res) => res.json()).then((d) => {
      if (d && d.vendors && d.vendors.length > 0) {
        setRegisteredVendors(d.vendors);
        const combined = d.vendors.map((v) => v.nome);
        setAvailableVendors(combined);
      }
    }).catch((err) => console.warn("Erro ao buscar vendedores:", err));
    fetch("/api/competitors").then((res) => res.json()).then((d) => {
      if (d && d.competitors) {
        setCompetitors(d.competitors);
      }
    }).catch((err) => console.warn("Erro ao buscar concorrentes:", err));
    fetch("/api/installations").then((res) => res.json()).then((d) => {
      if (d && d.installations) {
        setInstallations(d.installations);
      }
    }).catch((err) => console.warn("Erro ao buscar instalações:", err));
  }, []);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [unreadAiTips, setUnreadAiTips] = useState(0);
  const [isBadgePulsing, setIsBadgePulsing] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setUnreadAiTips((prev) => prev + 1);
      setIsBadgePulsing(true);
      setTimeout(() => setIsBadgePulsing(false), 5e3);
    }, 15e3);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  useEffect(() => {
    const savedUser = localStorage.getItem("mhnet_user");
    let savedRole = localStorage.getItem("mhnet_role");
    if (savedUser) {
      const lower = savedUser.toLowerCase();
      if (lower.includes("bruno queiroz") || lower.includes("bruno garcia") || lower.includes("gestor") || lower.includes("admin")) {
        savedRole = "admin";
        localStorage.setItem("mhnet_role", "admin");
      }
      setLoggedUser(savedUser);
      setUserRole(savedRole || "vendedor");
    }
  }, []);
  const fetchAllData = async () => {
    if (!loggedUser) return;
    setLoading(true);
    setIsSyncing(true);
    try {
      const rLeads = await fetch("/api/leads");
      if (rLeads.ok) {
        const d2 = await rLeads.json();
        setLeads(d2.data || []);
      }
      const rVendors = await fetch("/api/vendors");
      if (rVendors.ok) {
        const d2 = await rVendors.json();
        if (d2 && d2.vendors) {
          setRegisteredVendors(d2.vendors);
          setAvailableVendors(d2.vendors.map((v) => v.nome));
        }
      }
      const rFtta = await fetch("/api/ftta");
      if (rFtta.ok) {
        const d2 = await rFtta.json();
        setFttaItems(d2.sites || []);
        setFttaProsps(d2.prospeccoes || []);
      }
      const rTasks = await fetch("/api/tasks");
      if (rTasks.ok) {
        const d2 = await rTasks.json();
        setTasks(d2.tasks || []);
      }
      const rAbs = await fetch("/api/absences");
      if (rAbs.ok) {
        const d2 = await rAbs.json();
        setAbsences(d2.absences || []);
      }
      const rBase = await fetch("/api/base");
      if (rBase.ok) {
        const d2 = await rBase.json();
        setBaseClients(d2.clients || []);
        setBaseActions(d2.actions || []);
      }
      const rCob = await fetch("/api/cobrancas");
      if (rCob.ok) {
        const d2 = await rCob.json();
        setCobrancas(d2.cobrancas || []);
        saveOfflineCache("cobrancas", d2.cobrancas || []);
      }
      const rComp = await fetch("/api/competitors");
      if (rComp.ok) {
        const d2 = await rComp.json();
        setCompetitors(d2.competitors || []);
      }
      const rInst = await fetch("/api/installations");
      if (rInst.ok) {
        const d2 = await rInst.json();
        setInstallations(d2.installations || []);
      }
      const d = /* @__PURE__ */ new Date();
      setLastSyncTime(`${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
    } catch (e) {
      console.warn("⚠️ API de rede inacessível. Utilizando modo offline local localstorage.", e);
      loadOfflineLocalStorageDataCache();
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };
  const loadOfflineLocalStorageDataCache = () => {
    try {
      const cLeads = localStorage.getItem("cache_leads");
      const cTasks = localStorage.getItem("cache_tasks");
      const cAbs = localStorage.getItem("cache_absences");
      const cCob = localStorage.getItem("cache_cobrancas");
      if (cLeads) setLeads(JSON.parse(cLeads));
      if (cTasks) setTasks(JSON.parse(cTasks));
      if (cAbs) setAbsences(JSON.parse(cAbs));
      if (cCob) setCobrancas(JSON.parse(cCob));
    } catch (e) {
      console.warn("Erro ao carregar cache offline", e);
    }
  };
  const saveOfflineCache = (key, data) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn("Erro ao salvar cache", e);
    }
  };
  useEffect(() => {
    if (loggedUser) {
      fetchAllData();
      const interval = setInterval(() => {
        fetchAllData();
      }, 2 * 60 * 1e3);
      return () => clearInterval(interval);
    }
  }, [loggedUser]);
  const processLoginAction = (cleanName) => {
    let detectedRole = "vendedor";
    const lowerClean = cleanName.toLowerCase();
    if (lowerClean === "admin" || lowerClean === "gestor" || lowerClean === "123" || lowerClean.includes("bruno queiroz") || lowerClean.includes("bruno garcia")) {
      detectedRole = "admin";
    }
    localStorage.setItem("mhnet_user", cleanName);
    localStorage.setItem("mhnet_role", detectedRole);
    setIsLoggingInAnim(true);
    setLoginStageText("🔑 Verificando credenciais corporativas MHNET...");
    setTimeout(() => {
      setLoginStageText("🔄 Sincronizando carteira de leads (Google Sheets)...");
    }, 600);
    setTimeout(() => {
      setLoginStageText("📈 Consolidando matriz de indicadores em tempo real...");
    }, 1300);
    setTimeout(() => {
      setLoginStageText("✨ Otimizando o ambiente de vendas para seu navegador...");
    }, 2e3);
    setTimeout(() => {
      setLoggedUser(cleanName);
      setUserRole(detectedRole);
      setActiveTab("dashboard");
      setIsLoggingInAnim(false);
    }, 2650);
  };
  const handleGoogleLogin = async () => {
    try {
      setLoginError("");
      const result = await googleSignIn();
      if (result?.user) {
        const userName = result.user.displayName || result.user.email || "Usuário Vendedor";
        processLoginAction(userName);
      }
    } catch (e) {
      console.error(e);
      setLoginError("Erro ao autenticar com o Google. Tente novamente.");
    }
  };
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    const clean = loginTerm.trim();
    if (!clean) {
      setLoginError("Por favor, digite seu nome de consultor ou administrador.");
      return;
    }
    processLoginAction(clean);
  };
  const handleLogout = () => {
    localStorage.removeItem("mhnet_user");
    localStorage.removeItem("mhnet_role");
    setLoggedUser("");
    setUserRole("");
  };
  const handleSaveLead = async (payload) => {
    const isNew = !payload._linha;
    const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR");
    const nowTimeStr = (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    let updatedLeads = [...leads];
    if (isNew) {
      const newLead = {
        _linha: leads.length + 2,
        // estimate sheet row
        nomeLead: payload.nomeLead,
        telefone: payload.telefone,
        endereco: payload.endereco,
        numero: payload.numero,
        complemento: payload.complemento,
        bairro: payload.bairro,
        cidade: payload.cidade,
        provedor: payload.provedor,
        valorPlano: payload.valorPlano,
        planoAtual: payload.planoAtual,
        fidelidade: payload.fidelidade,
        interesse: payload.interesse,
        status: payload.status,
        observacao: payload.observacao,
        vendedor: loggedUser,
        dataCadastro: todayStr,
        ultimaAtualizacao: `${todayStr} ${nowTimeStr}`
      };
      updatedLeads = [newLead, ...leads];
      if (newLead.status === "Venda Fechada" || newLead.status === "Frio" || newLead.status === "Lead Frio") {
        updatedLeads = updatedLeads.filter((l) => l._linha !== newLead._linha);
      }
      setLeads(updatedLeads);
      saveOfflineCache("leads", updatedLeads);
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLead)
        });
      } catch (e) {
      }
    } else {
      updatedLeads = leads.map((l) => {
        if (l._linha === payload._linha) {
          return {
            ...l,
            ...payload,
            ultimaAtualizacao: `${todayStr} ${nowTimeStr}`
          };
        }
        return l;
      });
      if (payload.status === "Venda Fechada" || payload.status === "Frio" || payload.status === "Lead Frio") {
        updatedLeads = updatedLeads.filter((l) => l._linha !== payload._linha);
        if (payload.status === "Venda Fechada") {
          alert("Venda Fechada! Lead arquivado com sucesso.");
        }
      }
      setLeads(updatedLeads);
      saveOfflineCache("leads", updatedLeads);
      try {
        await fetch("/api/leads", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, ultimaAtualizacao: `${todayStr} ${nowTimeStr}` })
        });
      } catch (e) {
        console.error("Erro ao salvar edição de lead no servidor", e);
      }
    }
    fetchAllData();
  };
  const handleDeleteLead = async (rowId) => {
    const deletedLinhaNum = parseInt(rowId, 10);
    const updated = leads.filter((l) => String(l._linha) !== String(rowId)).map((l) => {
      const currentLinha = typeof l._linha === "number" ? l._linha : parseInt(String(l._linha), 10);
      if (currentLinha > deletedLinhaNum) {
        return { ...l, _linha: currentLinha - 1 };
      }
      return l;
    });
    setLeads(updated);
    saveOfflineCache("leads", updated);
    try {
      await fetch(`/api/leads?linha=${rowId}`, { method: "DELETE" });
    } catch (e) {
    }
    fetchAllData();
  };
  const handleSaveFttaItem = async (ftItem) => {
    try {
      await fetch("/api/ftta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "site", data: ftItem })
      });
      fetchAllData();
    } catch (e) {
      console.error("Erro ao salvar item FTTA", e);
    }
  };
  const handleSaveFttaProspKey = async (prosp) => {
    try {
      await fetch("/api/ftta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "prospeccao", data: prosp })
      });
      fetchAllData();
    } catch (e) {
      console.error("Erro ao salvar prospecção FTTA", e);
    }
  };
  const handleAddTask = async (desc, dataLimite, nomeLead, vendedor) => {
    const newTask = {
      id: String(Date.now()),
      vendedor: vendedor || loggedUser,
      descricao: desc,
      dataLimite: dataLimite || void 0,
      nomeLead: nomeLead || void 0,
      status: "PENDENTE"
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveOfflineCache("tasks", updated);
    try {
      const token = await getAccessToken();
      if (token) {
        let dateStr = dataLimite;
        let timeStr = "";
        const timeMatch = desc.match(/ às (\d{2}:\d{2})/);
        if (timeMatch) {
          timeStr = timeMatch[1];
        }
        const title = `Tarefa: ${desc} ${nomeLead ? `(Lead: ${nomeLead})` : ""}`;
        if (dateStr) {
          await createGoogleCalendarEvent(title, dateStr, timeStr);
        }
        await createGoogleTask(title, "Criada automaticamente pelo sistema", dateStr);
      }
    } catch (e) {
      console.error("Error creating google task/event", e);
    }
    try {
      const resp = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });
      const data = await resp.json();
      if (data.webhookStatus === 404 || data.webhookStatus === 500) {
        window.dispatchEvent(new CustomEvent("webhook-error"));
      }
    } catch (e) {
    }
    fetchAllData();
  };
  const handleToggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === "PENDENTE" ? "CONCLUIDA" : "PENDENTE";
    const updated = tasks.map((t) => t.id === id ? { ...t, status: newStatus } : t);
    setTasks(updated);
    saveOfflineCache("tasks", updated);
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle" })
      });
    } catch (e) {
    }
    fetchAllData();
  };
  const handleDeleteTask = async (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveOfflineCache("tasks", updated);
    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    } catch (e) {
    }
    fetchAllData();
  };
  const handleClearCompletedTasks = async () => {
    const updated = tasks.filter((t) => t.status !== "CONCLUIDA");
    setTasks(updated);
    saveOfflineCache("tasks", updated);
    try {
      await fetch(`/api/tasks?action=clear_completed`, { method: "DELETE" });
    } catch (e) {
    }
    fetchAllData();
  };
  const handleRegisterAbsence = async (dataFalta, motivo, obs, fileData, fileName, mimeType) => {
    let driveLink = "";
    if (fileData && fileName) {
      let token = await getAccessToken();
      if (!token) {
        try {
          const result = await googleSignIn();
          token = result?.accessToken || null;
        } catch (e) {
          console.warn("Pop-up do Google bloqueado ou fechado", e);
        }
      }
      if (token) {
        const boundary = "foo_bar_baz_" + Date.now();
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const base64Data = fileData.split(",")[1] || fileData;
        const metadata = {
          name: fileName,
          mimeType: mimeType || "application/octet-stream"
        };
        const multipartRequestBody = delimiter + "Content-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(metadata) + delimiter + "Content-Type: " + (mimeType || "application/octet-stream") + "\r\nContent-Transfer-Encoding: base64\r\n\r\n" + base64Data + close_delim;
        const respUpload = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "multipart/related; boundary=" + boundary
          },
          body: multipartRequestBody
        });
        if (respUpload.ok) {
          const driveData = await respUpload.json();
          driveLink = "https://drive.google.com/file/d/" + driveData.id;
        } else {
          console.warn("Google Drive upload failed:", await respUpload.text());
        }
      }
    }
    const payload = {
      vendedor: loggedUser,
      dataFalta,
      motivo,
      observacao: obs,
      fileData,
      fileName,
      mimeType,
      driveLink
    };
    const resp = await fetch("/api/absences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      throw new Error("Falha ao registrar ausência no servidor.");
    }
    const data = await resp.json();
    fetchAllData();
    if (data.emailStatus === "error") {
      return "Justificativa salva, mas o E-MAIL FALHOU: " + data.emailError;
    } else if (data.emailStatus === "not_configured") {
      return "Justificativa salva. (E-mail SIMULADO apenas - Credenciais não configuradas)";
    }
    return "✅ Solicitação enviada!\nO e-mail de notificação para bruno.queiroz@mhnet.com.br foi enviado com sucesso.";
  };
  const handleUpdateAbsence = async (id, status) => {
    try {
      await fetch(`/api/absences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchAllData();
    } catch (e) {
      console.error("Erro ao atualizar ausência", e);
    }
  };
  const handleRegisterBaseAction = async (payload) => {
    const resp = await fetch("/api/base/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      throw new Error("Erro de comunicação ao registrar log de atendimento comercial.");
    }
    fetchAllData();
  };
  const handleUpdateCobranca = async (updated) => {
    const resp = await fetch("/api/cobrancas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
    if (!resp.ok) {
      throw new Error("Erro ao salvar cobrança no servidor");
    }
    fetchAllData();
  };
  const handleRegisterCobrancaLog = async (idContrato, log) => {
    const resp = await fetch(`/api/cobrancas/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idContrato, operador: loggedUser, ...log })
    });
    if (!resp.ok) {
      throw new Error("Erro ao registrar log de cobrança");
    }
    fetchAllData();
  };
  const handleGenerateIACobrancaPitch = async (client) => {
    const resp = await fetch("/api/gemini/generateCobrancaMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client })
    });
    if (!resp.ok) throw new Error("Falha ao gerar cobrança de IA");
    const d = await resp.json();
    return d.text;
  };
  const handleRegisterVendor = async (nome, meta, telefone) => {
    const resp = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, meta, telefone })
    });
    if (!resp.ok) {
      throw new Error("Falha ao cadastrar vendedor no servidor.");
    }
    const resVendors = await fetch("/api/vendors");
    if (resVendors.ok) {
      const d = await resVendors.json();
      if (d && d.vendors) {
        setRegisteredVendors(d.vendors);
        setAvailableVendors(d.vendors.map((v) => v.nome));
      }
    }
  };
  const handleUpdateVendor = async (vendor) => {
    const resp = await fetch("/api/vendors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor)
    });
    if (!resp.ok) {
      throw new Error("Falha ao atualizar vendedor no servidor.");
    }
    const resVendors = await fetch("/api/vendors");
    if (resVendors.ok) {
      const d = await resVendors.json();
      if (d && d.vendors) {
        setRegisteredVendors(d.vendors);
        setAvailableVendors(d.vendors.map((v) => v.nome));
      }
    }
  };
  const handleDeleteVendor = async (id) => {
    const resp = await fetch(`/api/vendors?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    if (!resp.ok) {
      throw new Error("Falha ao excluir vendedor no servidor.");
    }
    const resVendors = await fetch("/api/vendors");
    if (resVendors.ok) {
      const d = await resVendors.json();
      if (d && d.vendors) {
        setRegisteredVendors(d.vendors);
        setAvailableVendors(d.vendors.map((v) => v.nome));
      }
    }
  };
  const handleBulkTransferLeads = async (fromSeller, toSeller) => {
    const resp = await fetch("/api/leads/bulk-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromSeller, toSeller })
    });
    if (!resp.ok) {
      throw new Error("Falha ao realizar transferência de leads no servidor.");
    }
    const d = await resp.json();
    await fetchAllData();
    return {
      leadsTransferred: d.details?.leadsTransferred || 0,
      tasksTransferred: d.details?.tasksTransferred || 0,
      message: d.message || "Transferência concluída"
    };
  };
  const handleSaveCompetitor = async (comp) => {
    const resp = await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comp)
    });
    if (resp.ok) {
      const d = await resp.json();
      setCompetitors(d.competitors || []);
    } else {
      throw new Error("Erro ao salvar concorrente no servidor.");
    }
  };
  const handleDeleteCompetitor = async (id) => {
    const resp = await fetch(`/api/competitors/${id}`, {
      method: "DELETE"
    });
    if (resp.ok) {
      const d = await resp.json();
      setCompetitors(d.competitors || []);
    } else {
      throw new Error("Erro ao excluir concorrente do servidor.");
    }
  };
  const handleSaveInstallation = async (inst) => {
    const resp = await fetch("/api/installations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inst)
    });
    if (resp.ok) {
      const d = await resp.json();
      setInstallations(d.installations || []);
      if (d.webhookStatus === 404 || d.webhookStatus === 500) {
        window.dispatchEvent(new CustomEvent("webhook-error"));
      }
    } else {
      let errorMessage = "Erro desconhecido";
      try {
        const d = await resp.json();
        errorMessage = d.message || errorMessage;
      } catch (e) {
        errorMessage = `Erro do servidor (${resp.status})`;
      }
      throw new Error(errorMessage);
    }
  };
  const handleDeleteInstallation = async (id) => {
    const resp = await fetch(`/api/installations/${id}`, {
      method: "DELETE"
    });
    if (resp.ok) {
      const d = await resp.json();
      setInstallations(d.installations || []);
    } else {
      throw new Error("Erro ao excluir agendamento de instalação.");
    }
  };
  const handleGenerateIAPitch = async (client) => {
    const resp = await fetch("/api/gemini/generatePitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client })
    });
    if (!resp.ok) throw new Error("Falha ao gerar abordagem");
    const d = await resp.json();
    return d.text;
  };
  const handleCombatObjection = async (objection) => {
    const resp = await fetch("/api/gemini/combatObjection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objection })
    });
    if (!resp.ok) throw new Error("Erro");
    const d = await resp.json();
    return d.text;
  };
  const handleAnalyzeCompetitor = async (name, question, mhnetVantagem) => {
    const resp = await fetch("/api/gemini/analyzeCompetitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, question, mhnetVantagem })
    });
    if (!resp.ok) throw new Error("Erro");
    const d = await resp.json();
    return d.text;
  };
  const handleSendChatMessage = async (msg, history) => {
    const resp = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, history })
    });
    if (!resp.ok) throw new Error("Erro");
    const d = await resp.json();
    return d.text;
  };
  const handleGenerateAIObs = async (nome, bairro, plano, valor, provedor) => {
    const resp = await fetch("/api/gemini/combatObjection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objection: `Gere um rápido resumo de perfil e abordagem para o lead: Nome ${nome}, reside no bairro ${bairro}, atualmente usa o provedor ${provedor} no plano ${plano} pagando R$ ${valor}. Diga 2 frases persuasivas curtas destacando a fibra óptica própria de Lajeado MHNET.`
      })
    });
    if (!resp.ok) throw new Error("Erro");
    const d = await resp.json();
    return d.text;
  };
  const handleFetchBaseLocal = async () => {
    try {
      const rBase = await fetch("/api/base");
      if (rBase.ok) {
        const d = await rBase.json();
        setBaseClients(d.clients || []);
        setBaseActions(d.actions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleSyncBase = async () => {
    setIsSyncing(true);
    setLoading(true);
    try {
      const response = await fetch("/api/base/sync", {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Falha ao se comunicar com o servidor da planilha.");
      }
      const data = await response.json();
      if (data.status === "success") {
        const rBase = await fetch("/api/base");
        if (rBase.ok) {
          const d = await rBase.json();
          setBaseClients(d.clients || []);
          setBaseActions(d.actions || []);
        }
        alert(`Sucesso! ${data.count} clientes importados diretamente da aba Base052026.`);
      } else {
        throw new Error(data.message || "Erro desconhecido durante o sync.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao sincronizar base: " + e.message);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };
  const handleSyncLeads = async () => {
    setIsSyncing(true);
    setLoading(true);
    try {
      const response = await fetch("/api/leads/sync", {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Falha ao se comunicar com o servidor da planilha.");
      }
      const data = await response.json();
      if (data.status === "success") {
        const rLeads = await fetch("/api/leads");
        if (rLeads.ok) {
          const d = await rLeads.json();
          setLeads(d.data || d.leads || []);
        }
        alert(`Sucesso! ${data.count} leads importados diretamente da aba Acompanhamento de Lead | Abordagens.`);
      } else {
        throw new Error(data.message || "Erro desconhecido durante o de sync dos leads.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao sincronizar leads: " + e.message);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };
  const handleSyncFtta = async () => {
    setIsSyncing(true);
    setLoading(true);
    try {
      const response = await fetch("/api/ftta/sync", {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Falha ao se comunicar com o servidor da planilha.");
      }
      const data = await response.json();
      if (data.status === "success") {
        const rFtta = await fetch("/api/ftta");
        if (rFtta.ok) {
          const d = await rFtta.json();
          setFttaItems(d.sites || []);
          setFttaProsps(d.prospeccoes || []);
        }
        alert(`Sucesso! ${data.sitesCount} edifícios e ${data.prospeccoesCount} prospecções de FTTA importados diretamente das planilhas ("FTTA LAJEADO", "FTTA ESTRELA" e "FTTA PROSPECÇÃO").`);
      } else {
        throw new Error(data.message || "Erro desconhecido durante o de sync do FTTA.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao sincronizar FTTA: " + e.message);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };
  const handleSyncInstallations = async () => {
    setIsSyncing(true);
    setLoading(true);
    try {
      const response = await fetch("/api/installations/sync", {
        method: "POST"
      });
      if (!response.ok) {
        throw new Error("Falha ao se comunicar com o servidor da planilha.");
      }
      const data = await response.json();
      if (data.status === "success") {
        const rInst = await fetch("/api/installations");
        if (rInst.ok) {
          const d = await rInst.json();
          setInstallations(d.installations || []);
        }
        alert(`Sucesso! ${data.count} agendamentos importados diretamente da aba Agenda Instalação.`);
      } else {
        throw new Error(data.message || "Erro desconhecido durante o sync da agenda de instalação.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao sincronizar agenda de instalação: " + e.message);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };
  if (isExternalPartnerMode) {
    return /* @__PURE__ */ jsxDEV(
      ExternalStorePortal,
      {
        installations,
        vendors: availableVendors,
        onSaveInstallation: handleSaveInstallation,
        onDeleteInstallation: handleDeleteInstallation
      },
      void 0,
      false,
      {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1188,
        columnNumber: 7
      },
      this
    );
  }
  if (isLoggingInAnim) {
    return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans leading-relaxed text-slate-100 p-6 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[130px] pointer-events-none" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1202,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[130px] pointer-events-none" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1203,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "max-w-md w-full text-center space-y-8 z-10 p-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "relative w-28 h-28 mx-auto flex items-center justify-center", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 rounded-full border-4 border-slate-900 border-t-sky-400 border-r-sky-500 animate-spin", style: { animationDuration: "1s" } }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1208,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-2 rounded-full border-2 border-slate-900 border-b-sky-300 border-l-blue-500 animate-spin", style: { animationDuration: "0.6s", animationDirection: "reverse" } }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1209,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center shadow-2xl", children: /* @__PURE__ */ jsxDEV(Sparkles, { className: "w-8 h-8 text-sky-400 animate-pulse" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1212,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1211,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1206,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-black uppercase text-white tracking-widest", children: "Acessando MHNET" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1217,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "h-[2px] w-24 bg-gradient-to-r from-sky-500 to-sky-400 mx-auto rounded-full" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1218,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-sky-400 font-extrabold tracking-widest mt-1 uppercase", children: "Iniciando Sessão Segura" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1220,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1216,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "w-full bg-slate-900 border border-slate-800 rounded-full h-3 p-0.5 overflow-hidden shadow-inner", children: /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "bg-gradient-to-r from-sky-500 via-sky-450 to-emerald-400 h-full rounded-full"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1227,
            columnNumber: 13
          },
          this
        ) }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1226,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "text-xs font-black tracking-wide text-slate-100 bg-slate-900/80 border border-slate-800 rounded-2xl py-3 px-5 inline-block mx-auto shadow-2xl backdrop-blur",
            children: loginStageText
          },
          loginStageText,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1231,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1205,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 1200,
      columnNumber: 7
    }, this);
  }
  if (!loggedUser) {
    return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-slate-950 flex flex-col justify-between font-sans leading-relaxed text-slate-100 p-6 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-sky-850/15 rounded-full blur-[110px] pointer-events-none" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1245,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-sky-950/15 rounded-full blur-[110px] pointer-events-none" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1246,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "space-y-4 text-center mt-12 z-10",
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 bg-gradient-to-tr from-sky-600 to-sky-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-sky-500/35", children: /* @__PURE__ */ jsxDEV(Wifi, { className: "w-9 h-9 stroke-[2.5]" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1252,
              columnNumber: 13
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1251,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-black tracking-tight text-white uppercase", children: "MHNET" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1255,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-sky-450 font-extrabold tracking-widest uppercase mt-0.5", children: "Gestor de Vendas Externas" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1256,
                columnNumber: 13
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1254,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1249,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-md z-15",
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5 text-center", children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-sm font-black uppercase text-slate-305 tracking-wider flex items-center justify-center gap-1.5 pl-0.5", children: [
                /* @__PURE__ */ jsxDEV(Lock, { className: "w-4 h-4 text-sky-400" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1265,
                  columnNumber: 15
                }, this),
                " Acesso Seguro"
              ] }, void 0, true, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1264,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[11px] text-slate-350 leading-normal font-bold px-4", children: "Faça login informando seu nome de consultor ou administrador para acessar o portal de controle." }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1267,
                columnNumber: 13
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1263,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("form", { onSubmit: handleLogin, className: "space-y-4 font-sans relative pt-2", children: [
              loginError && /* @__PURE__ */ jsxDEV("p", { className: "text-[11px] text-rose-450 font-black uppercase text-center", children: loginError }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1274,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
                /* @__PURE__ */ jsxDEV(
                  "select",
                  {
                    value: loginTerm,
                    onChange: (e) => setLoginTerm(e.target.value),
                    className: "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition font-medium appearance-none",
                    children: [
                      /* @__PURE__ */ jsxDEV("option", { value: "", disabled: true, className: "bg-sky-900 text-slate-300", children: "Selecione seu nome..." }, void 0, false, {
                        fileName: "/app/applet/src/App.tsx",
                        lineNumber: 1283,
                        columnNumber: 19
                      }, this),
                      registeredVendors.map((vendor, idx) => /* @__PURE__ */ jsxDEV("option", { value: vendor.nome, className: "bg-sky-900 text-white font-bold", children: vendor.nome }, vendor.id || idx, false, {
                        fileName: "/app/applet/src/App.tsx",
                        lineNumber: 1285,
                        columnNumber: 21
                      }, this))
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1279,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV("div", { className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400", children: /* @__PURE__ */ jsxDEV("svg", { className: "h-4 w-4 fill-current", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsxDEV("path", { d: "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1291,
                  columnNumber: 112
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1291,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1290,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1278,
                columnNumber: 15
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1277,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "submit",
                  className: "w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-sky-900/40 active:scale-97 cursor-pointer transition duration-150 flex items-center justify-center gap-2",
                  children: "Entrar no Sistema"
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1296,
                  columnNumber: 13
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === "accepted") {
                        setDeferredPrompt(null);
                      }
                    } else {
                      setShowPWAInstructions(true);
                    }
                  },
                  className: "w-full py-2.5 border border-slate-800 hover:bg-slate-900/60 text-slate-300 rounded-xl text-[10px] font-extrabold uppercase cursor-pointer transition flex items-center justify-center gap-1.5",
                  children: [
                    /* @__PURE__ */ jsxDEV(Download, { className: "w-4 h-4 text-sky-400" }, void 0, false, {
                      fileName: "/app/applet/src/App.tsx",
                      lineNumber: 1315,
                      columnNumber: 15
                    }, this),
                    " Instalar App"
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1301,
                  columnNumber: 13
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1272,
              columnNumber: 11
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1261,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-4 z-10",
          children: "MHNET VALE DO TAQUARI · LAJEADO"
        },
        void 0,
        false,
        {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1324,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 1242,
      columnNumber: 7
    }, this);
  }
  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return /* @__PURE__ */ jsxDEV(
          Dashboard,
          {
            isAdmin: userRole === "admin",
            loggedUser,
            leads,
            tasks,
            onSetFttaTab: setFttaTab,
            onOpenChat: () => setIsAiChatOpen(true),
            onTriggerCoach: () => setIsAiChatOpen(true),
            onNavigate: (tab) => setActiveTab(tab),
            onNavigateToSellerLeads: (seller) => {
              setLeadsFilterSeller(seller);
              setActiveTab("leads");
            },
            onSync: fetchAllData,
            vendors: registeredVendors
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1337,
            columnNumber: 11
          },
          this
        );
      case "admin_logs":
        return /* @__PURE__ */ jsxDEV(AdminLogsPage, {}, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1354,
          columnNumber: 16
        }, this);
      case "gestao_pessoas":
        return /* @__PURE__ */ jsxDEV(GestaoPessoasPage, { vendors: registeredVendors, loggedUser, isAdmin: userRole === "admin" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1356,
          columnNumber: 16
        }, this);
      case "leads":
        return /* @__PURE__ */ jsxDEV(
          LeadsPage,
          {
            leads,
            isAdmin: userRole === "admin",
            loggedUser,
            onSaveLead: handleSaveLead,
            onDeleteLead: handleDeleteLead,
            onGenerateAIObs: handleGenerateAIObs,
            onCombatObjectionWithIA: handleCombatObjection,
            onSyncLeads: handleSyncLeads,
            onAddTask: handleAddTask,
            onNavigateToTasks: () => setActiveTab("tasks"),
            defaultViewMode: "list",
            initialSellerFilter: leadsFilterSeller
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1359,
            columnNumber: 11
          },
          this
        );
      case "cadastroLead":
        return /* @__PURE__ */ jsxDEV(
          LeadsPage,
          {
            leads,
            isAdmin: userRole === "admin",
            loggedUser,
            onSaveLead: handleSaveLead,
            onDeleteLead: handleDeleteLead,
            onGenerateAIObs: handleGenerateAIObs,
            onCombatObjectionWithIA: handleCombatObjection,
            onSyncLeads: handleSyncLeads,
            onAddTask: handleAddTask,
            onNavigateToTasks: () => setActiveTab("tasks"),
            defaultViewMode: "form"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1375,
            columnNumber: 11
          },
          this
        );
      case "ftta":
        return /* @__PURE__ */ jsxDEV(
          FttaPage,
          {
            sites: fttaItems,
            prospecs: fttaProsps,
            isAdmin: userRole === "admin",
            loggedUser,
            onRegisterFttaSite: handleSaveFttaItem,
            onRegisterFttaProsp: handleSaveFttaProspKey,
            initialTab: fttaTab,
            onSyncFtta: handleSyncFtta
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1391,
            columnNumber: 11
          },
          this
        );
      case "tasks":
        return /* @__PURE__ */ jsxDEV(
          TasksPage,
          {
            tasks,
            onAddTask: handleAddTask,
            onToggleTask: handleToggleTask,
            onDeleteTask: handleDeleteTask,
            onClearCompletedTasks: handleClearCompletedTasks,
            leadsList: leads.map((l) => l.nomeLead),
            onNavigateToLeadDetail: (nome) => {
              setActiveTab("leads");
            },
            vendorsList: registeredVendors.map((v) => v.nome),
            isAdmin: userRole === "admin",
            loggedUser
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1403,
            columnNumber: 11
          },
          this
        );
      case "indicators":
        return /* @__PURE__ */ jsxDEV(
          IndicatorsPage,
          {
            leads,
            isAdmin: userRole === "admin",
            loggedUser
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1419,
            columnNumber: 11
          },
          this
        );
      case "base":
        return /* @__PURE__ */ jsxDEV(
          BaseManagementPage,
          {
            clients: baseClients,
            actions: baseActions,
            onRegisterAction: handleRegisterBaseAction,
            onGenerateIAPitch: handleGenerateIAPitch,
            onRefreshBase: handleSyncBase,
            onFetchBaseLocal: handleFetchBaseLocal,
            loggedUser,
            isAdmin: userRole === "admin"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1426,
            columnNumber: 11
          },
          this
        );
      case "cobrancas":
        return /* @__PURE__ */ jsxDEV(
          CobrancasPage,
          {
            cobrancas,
            loggedUser,
            isAdmin: userRole === "admin",
            onUpdateCobranca: handleUpdateCobranca,
            onRegisterCobrancaLog: handleRegisterCobrancaLog,
            onGenerateIAPitch: handleGenerateIACobrancaPitch,
            onRefreshData: fetchAllData
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1438,
            columnNumber: 11
          },
          this
        );
      case "competitors":
        return /* @__PURE__ */ jsxDEV(
          CompetitorsPage,
          {
            competitors,
            onAnalyzeWithAI: handleAnalyzeCompetitor,
            onSaveCompetitor: handleSaveCompetitor,
            onDeleteCompetitor: handleDeleteCompetitor,
            isAdmin: userRole === "admin"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1449,
            columnNumber: 11
          },
          this
        );
      case "objections":
        return /* @__PURE__ */ jsxDEV(
          ObjectionsPage,
          {
            onCombatObjection: handleCombatObjection
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1458,
            columnNumber: 11
          },
          this
        );
      case "absences":
        return /* @__PURE__ */ jsxDEV(
          AbsencesPage,
          {
            absences,
            isAdmin: userRole === "admin",
            onRegisterAbsence: handleRegisterAbsence,
            onUpdateAbsence: handleUpdateAbsence
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1463,
            columnNumber: 11
          },
          this
        );
      case "pos_venda":
        return /* @__PURE__ */ jsxDEV(PosVendaPage, { loggedUser, isAdmin: userRole === "admin" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1470,
          columnNumber: 16
        }, this);
      case "matriz_objecoes":
        return /* @__PURE__ */ jsxDEV(MatrizObjecoesPage, { loggedUser, isAdmin: userRole === "admin" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1472,
          columnNumber: 16
        }, this);
      case "trade":
        return /* @__PURE__ */ jsxDEV(TradePage, { loggedUser, isAdmin: userRole === "admin" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1474,
          columnNumber: 16
        }, this);
      case "leads_frios":
        return /* @__PURE__ */ jsxDEV(LeadsFriosTab, { isAdmin: userRole === "admin", vendors: availableVendors, loggedUser }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1476,
          columnNumber: 16
        }, this);
      case "estrategia":
        return /* @__PURE__ */ jsxDEV(EstrategiaPage, { loggedUser }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1479,
          columnNumber: 11
        }, this);
      case "materials":
        return /* @__PURE__ */ jsxDEV(
          MaterialsPage,
          {
            onBackToDashboard: () => setActiveTab("dashboard")
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1483,
            columnNumber: 11
          },
          this
        );
      case "planos":
        return /* @__PURE__ */ jsxDEV(PlanosPage, {}, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1488,
          columnNumber: 11
        }, this);
      case "rotas":
        return /* @__PURE__ */ jsxDEV(RotaVendasPage, { leads, loggedUser }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1492,
          columnNumber: 11
        }, this);
      case "vendedores":
        return /* @__PURE__ */ jsxDEV(
          VendedoresPage,
          {
            vendors: registeredVendors,
            onAddVendor: handleRegisterVendor,
            onUpdateVendor: handleUpdateVendor,
            onDeleteVendor: handleDeleteVendor,
            onBulkTransfer: handleBulkTransferLeads
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1496,
            columnNumber: 11
          },
          this
        );
      case "installations":
        return /* @__PURE__ */ jsxDEV(
          InstallationsPage,
          {
            installations,
            vendors: availableVendors,
            onSaveInstallation: handleSaveInstallation,
            onDeleteInstallation: handleDeleteInstallation,
            onSyncInstallations: handleSyncInstallations,
            userRole
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1505,
            columnNumber: 11
          },
          this
        );
      case "installations_queue":
        return /* @__PURE__ */ jsxDEV(InstallationsQueuePage, {}, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1514,
          columnNumber: 16
        }, this);
      case "protocolos_internos":
        return /* @__PURE__ */ jsxDEV(InternalProtocolsPage, {}, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1516,
          columnNumber: 16
        }, this);
      case "admin_n8n":
        return /* @__PURE__ */ jsxDEV(AdminN8NPage, {}, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1518,
          columnNumber: 16
        }, this);
      case "calculo_multa":
        return /* @__PURE__ */ jsxDEV(
          CalculoMultaPage,
          {
            onBackToDashboard: () => setActiveTab("dashboard")
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1521,
            columnNumber: 11
          },
          this
        );
      default:
        return /* @__PURE__ */ jsxDEV("div", { children: "Não encontrado" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1525,
          columnNumber: 16
        }, this);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-[#EDF2F7] flex font-sans text-slate-900 leading-normal max-w-[1600px] mx-auto border-x border-slate-200/60 relative shadow-2xl overflow-hidden h-screen", children: [
    webhookError && userRole === "admin" && /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 left-0 right-0 bg-rose-50 border-b border-rose-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-4 z-[100] shadow-md ", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "bg-rose-100 p-2 rounded-full", children: /* @__PURE__ */ jsxDEV(Zap, { className: "w-5 h-5 text-rose-600 animate-pulse" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1536,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1535,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-bold text-rose-800", children: "Falha de Comunicação com N8N" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1539,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-rose-600 font-medium mt-0.5", children: "Uma automação do Ngrok/N8N retornou erro (404/500). Verifique as variáveis de ambiente e se os fluxos estão ativos." }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1540,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1538,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1534,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              fetch("/api/env/n8n").then((r) => r.json()).then((d) => {
                const url = d.USE_N8N_TEST_AGENDAMENTO === "true" ? d.N8N_TEST_WEBHOOK_URL : d.N8N_WEBHOOK_URL;
                if (url) window.open(url, "_blank");
                else alert("URL não configurada no .env!");
              }).catch(() => alert("Erro ao obter URL"));
            },
            className: "px-3 py-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded hover:bg-rose-100 shadow-sm transition-colors whitespace-nowrap",
            children: "Testar Conexão"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1546,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setWebhookError(false),
            className: "px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 shadow-sm transition-colors whitespace-nowrap",
            children: "Dispensar"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1557,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1545,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 1533,
      columnNumber: 9
    }, this),
    webhookError && userRole !== "admin" && /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50 text-xs font-bold flex justify-between items-center shadow-md", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "mx-auto", children: "Uma automação falhou em segundo plano. Seu gestor já foi notificado." }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1567,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: () => setWebhookError(false), className: "text-white hover:text-red-200 px-2 font-bold", children: "✕" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1568,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 1566,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("aside", { className: "hidden lg:flex flex-col w-64 bg-slate-950 text-white border-r border-slate-800/80 shrink-0 select-none h-full py-6 px-4 z-40", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col flex-1 overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 px-2 cursor-pointer shrink-0 mb-6", onClick: () => setActiveTab("dashboard"), children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-sky-900/30", children: "MH" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1577,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-black tracking-tight text-white leading-none", children: "Painel MHNET" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1581,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1", children: "LAJEADO | ESTRELA" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1582,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1580,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1576,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "h-[1px] bg-slate-800/60 mx-1 shrink-0 mb-6" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1586,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-5 overflow-y-auto flex-1 pr-2 pb-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2", children: "Painel de Trabalho" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1591,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("dashboard"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "dashboard" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Activity, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1599,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Painel Principal" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1600,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1593,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("pos_venda"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "pos_venda" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(UserCheck, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1609,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Pós Vendas" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1610,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1603,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("base"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "base" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Award, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1619,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Base de Clientes" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1620,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1613,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => {
                  setLeadsFilterSeller(null);
                  setActiveTab("leads");
                },
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "leads" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Users, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1632,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Leads PAP (Funil)" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1633,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1623,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("leads_frios"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "leads_frios" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(FileSpreadsheet, { className: "w-4 h-4 shrink-0 text-white " }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1642,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Leads Frios" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1643,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1636,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("cobrancas"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "cobrancas" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900 block"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Coins, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1652,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Controle de Cobranças" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1653,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1646,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("ftta"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "ftta" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(MapPin, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1662,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Viabilidade FTTA" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1663,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1656,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("tasks"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "tasks" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(ClipboardList, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1672,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Minhas Tarefas" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1673,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1666,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("installations"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "installations" ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-950" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(CalendarDays, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1682,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Agenda de Instalações" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1683,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1676,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("installations_queue"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "installations_queue" ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-950" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(ClipboardList, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1691,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Fila de Monitoramento" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1692,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1685,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("gestao_pessoas"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "gestao_pessoas" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  userRole === "admin" ? /* @__PURE__ */ jsxDEV(Users, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1700,
                    columnNumber: 41
                  }, this) : /* @__PURE__ */ jsxDEV(User, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1700,
                    columnNumber: 93
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: userRole === "admin" ? "Gestão de Pessoas" : "Meu RH" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1701,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1694,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1590,
            columnNumber: 13
          }, this),
          userRole === "admin" && /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 mt-1", children: "Gestão de Equipe" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1707,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("protocolos_internos"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "protocolos_internos" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(FileText, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1714,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Protocolos Internos" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1715,
                    columnNumber: 19
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1708,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("estrategia"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "estrategia" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Bot, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1723,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Gestão Estratégica IA" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1724,
                    columnNumber: 19
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1717,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("vendedores"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "vendedores" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Sliders, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1732,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Vendedores & Metas" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1733,
                    columnNumber: 19
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1726,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("admin_n8n"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "admin_n8n" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Link, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1741,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Integrações N8N" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1742,
                    columnNumber: 19
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1735,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("admin_logs"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "admin_logs" ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold shadow-md shadow-rose-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Terminal, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1750,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Depuração & Logs IA" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1751,
                    columnNumber: 19
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1744,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1706,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2", children: "Treinamento & Apoio" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1757,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("competitors"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "competitors" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Sparkles, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1765,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Análise Concorrência" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1766,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1759,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("calculo_multa"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "calculo_multa" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900 block"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Calculator, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1775,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Cálculo de Multa" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1776,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1769,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("objections"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "objections" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(HelpCircle, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1785,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Contorno de Objeções" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1786,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1779,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("trade"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "trade" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Store, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1795,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Ações de Trade" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1796,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1789,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("absences"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "absences" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(CalendarDays, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1805,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Escala & Ausências" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1806,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1799,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setActiveTab("materials"),
                className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === "materials" ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" : "text-white hover:bg-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxDEV(BookOpen, { className: "w-4 h-4 shrink-0 text-white" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1815,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { children: "Drive & Panfletos" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1816,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1809,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1756,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1589,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1574,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 shrink-0 pt-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "h-[1px] bg-slate-800/60 mx-1" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1827,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between p-2.5 bg-slate-900/50 rounded-2xl border border-slate-800/40", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-8 h-8 rounded-full bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 select-none", children: loggedUser ? loggedUser.substring(0, 2).toUpperCase() : "U" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1830,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col min-w-0", children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[11px] font-bold text-white truncate leading-none mb-1", children: loggedUser }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1834,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] text-sky-400 font-bold uppercase tracking-wide leading-none", children: userRole === "admin" ? "Coordenador" : "Consultor PAP" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1835,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1833,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1829,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setTheme(theme === "light" ? "dark" : "light"),
                className: "p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg cursor-pointer transition active:scale-95 shrink-0",
                title: theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro",
                children: theme === "light" ? /* @__PURE__ */ jsxDEV(Moon, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1846,
                  columnNumber: 38
                }, this) : /* @__PURE__ */ jsxDEV(Sun, { className: "w-3.5 h-3.5 text-amber-400" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1846,
                  columnNumber: 73
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1841,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: handleLogout,
                className: "p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg cursor-pointer transition active:scale-95 shrink-0",
                title: "Sair do expediente",
                children: /* @__PURE__ */ jsxDEV(LogOut, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1851,
                  columnNumber: 17
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1848,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1840,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1828,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1826,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 1572,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 h-full", children: [
      missingEnvKeys.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 flex items-start gap-3 text-rose-800 text-xs font-medium z-40 select-none  shrink-0", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-sm shrink-0", children: "🚨" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1864,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 space-y-0.5", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "font-extrabold uppercase tracking-wider text-[10px] text-rose-700 block", children: "Variáveis de Ambiente Ausentes" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1866,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-slate-700 leading-relaxed text-[11px]", children: [
            "O sistema detectou que algumas chaves obrigatórias não foram configuradas no arquivo ",
            /* @__PURE__ */ jsxDEV("code", { className: "bg-rose-50 px-1 py-0.5 rounded text-[9.5px]", children: ".env" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1868,
              columnNumber: 102
            }, this),
            ". Algumas funcionalidades, como envio de e-mails ou integração com o N8N, podem não funcionar corretamente."
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1867,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10.5px] text-rose-750 font-bold mt-1", children: [
            "Chaves ausentes: ",
            missingEnvKeys.join(", ")
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1871,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1865,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setMissingEnvKeys([]),
            className: "text-rose-600 hover:text-rose-800 px-2 py-1.5 rounded hover:bg-rose-500/10 transition font-black text-[10px] uppercase tracking-wider scale-95 shrink-0 cursor-pointer self-center",
            children: "Ciente"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1875,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1863,
        columnNumber: 11
      }, this),
      invalidEnvKeys.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "bg-orange-500/10 border-b border-orange-500/20 px-6 py-2.5 flex items-start gap-3 text-orange-800 text-xs font-medium z-40 select-none  shrink-0", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-sm shrink-0", children: "⚠️" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1884,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 space-y-0.5", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "font-extrabold uppercase tracking-wider text-[10px] text-orange-700 block", children: "Variáveis de Ambiente com Formato Inválido" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1886,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-slate-700 leading-relaxed text-[11px]", children: [
            "O sistema detectou que algumas chaves foram configuradas com um formato inválido no arquivo ",
            /* @__PURE__ */ jsxDEV("code", { className: "bg-orange-50 px-1 py-0.5 rounded text-[9.5px]", children: ".env" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1888,
              columnNumber: 109
            }, this),
            ". Verifique se URLs possuem ",
            /* @__PURE__ */ jsxDEV("code", { className: "bg-orange-50 px-1 py-0.5 rounded text-[9.5px]", children: "http://" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1889,
              columnNumber: 43
            }, this),
            " ou ",
            /* @__PURE__ */ jsxDEV("code", { className: "bg-orange-50 px-1 py-0.5 rounded text-[9.5px]", children: "https://" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1889,
              columnNumber: 125
            }, this),
            " e se portas são apenas números."
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1887,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-[10.5px] text-orange-750 font-bold mt-1", children: [
            "Chaves com formato inválido: ",
            invalidEnvKeys.join(", ")
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1891,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1885,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setInvalidEnvKeys([]),
            className: "text-orange-600 hover:text-orange-800 px-2 py-1.5 rounded hover:bg-orange-500/10 transition font-black text-[10px] uppercase tracking-wider scale-95 shrink-0 cursor-pointer self-center",
            children: "Ciente"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1895,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1883,
        columnNumber: 11
      }, this),
      isAiKeyLeaked && /* @__PURE__ */ jsxDEV("div", { className: "bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-start gap-3 text-amber-800 text-xs font-medium z-40 select-none  shrink-0", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "text-sm shrink-0", children: "⚠️" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1904,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 space-y-0.5", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "font-extrabold uppercase tracking-wider text-[10px] text-amber-700 block", children: "Modo de Contingência (IA com Scripts Locais)" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1906,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-slate-700 leading-relaxed text-[11px]", children: [
            "A chave de API Gemini do sistema foi temporariamente suspensa ou identificada como vazada. Para garantir a continuidade das suas vendas de forma impecável, ativamos o ",
            /* @__PURE__ */ jsxDEV("strong", { children: "Roteirizador Inteligente de Contingência Off-line" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1909,
              columnNumber: 93
            }, this),
            "com ricas receitas de alta conversão pré-programadas para Lajeado, Estrela e região. Continue operando o sistema normalmente!"
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1907,
            columnNumber: 15
          }, this),
          userRole === "admin" && /* @__PURE__ */ jsxDEV("p", { className: "text-[10.5px] text-sky-750 font-bold mt-1", children: [
            "💡 Coordenador: Para reativar a IA inteligente adaptativa em tempo real, atualize a variável ",
            /* @__PURE__ */ jsxDEV("code", { className: "bg-sky-50 px-1 py-0.5 rounded text-[9.5px]", children: "GEMINI_API_KEY" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1915,
              columnNumber: 112
            }, this),
            " nas Configurações da plataforma do Google AI Studio."
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1914,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1905,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setIsAiKeyLeaked(false),
            className: "text-amber-600 hover:text-amber-800 px-2 py-1.5 rounded hover:bg-amber-500/10 transition font-black text-[10px] uppercase tracking-wider scale-95 shrink-0 cursor-pointer self-center",
            children: "Compreendi"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1919,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1903,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "h-14 lg:hidden flex items-center justify-between px-4 bg-white border-b border-slate-200 shrink-0 z-40 select-none", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2.5 cursor-pointer", onClick: () => setActiveTab("dashboard"), children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm", children: "MH" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1929,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-bold text-slate-900 leading-none", children: "Painel MHNET" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1933,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-[8px] text-slate-400 font-bold uppercase mt-0.5", children: "LAJEADO | ESTRELA" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1934,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1932,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1928,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setTheme(theme === "light" ? "dark" : "light"),
              className: `p-1.5 border rounded-lg transition cursor-pointer active:scale-95 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300" : "bg-slate-50 border-slate-200 text-slate-550 hover:text-slate-750"}`,
              title: theme === "light" ? "Modo Escuro" : "Modo Claro",
              children: theme === "light" ? /* @__PURE__ */ jsxDEV(Moon, { className: "w-3 h-3" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1944,
                columnNumber: 36
              }, this) : /* @__PURE__ */ jsxDEV(Sun, { className: "w-3 h-3 text-amber-500" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1944,
                columnNumber: 67
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1939,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-bold text-slate-950 leading-none", children: loggedUser.split(" ")[0] }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1948,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-[8px] font-semibold text-sky-600 uppercase tracking-widest", children: userRole === "admin" ? "COORD" : "PAP" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1949,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1947,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: handleLogout,
              className: "p-1.5 bg-slate-50 border border-slate-200 text-slate-550 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer",
              title: "Sair",
              children: /* @__PURE__ */ jsxDEV(LogOut, { className: "w-3 h-3" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1957,
                columnNumber: 15
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1954,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1938,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1927,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("main", { className: "flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 h-[calc(100vh-80px)] lg:h-[calc(100vh-36px)] bg-slate-200/40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] print:h-auto print:block print:overflow-visible", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "mb-6 relative", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(Search, { className: "w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1967,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "text",
                placeholder: "Buscar globalmente (leads, clientes, tarefas...)",
                value: globalSearchTerm,
                onChange: (e) => setGlobalSearchTerm(e.target.value),
                className: "w-full bg-white border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all placeholder:text-slate-400/70"
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1968,
                columnNumber: 15
              },
              this
            ),
            globalSearchTerm && /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => setGlobalSearchTerm(""),
                className: "absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition",
                children: /* @__PURE__ */ jsxDEV(X, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1976,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1974,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1966,
            columnNumber: 13
          }, this),
          globalSearchTerm && /* @__PURE__ */ jsxDEV("div", { className: "mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-4 max-h-[60vh] overflow-y-auto  z-50 relative", children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-black uppercase text-sky-500 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2", children: [
              /* @__PURE__ */ jsxDEV(Sparkles, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1984,
                columnNumber: 19
              }, this),
              " Resultados de Busca"
            ] }, void 0, true, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 1983,
              columnNumber: 17
            }, this),
            (() => {
              const s = globalSearchTerm.toLowerCase();
              const matchingLeads = leads.filter((l) => l.nomeLead.toLowerCase().includes(s) || l.telefone && l.telefone.includes(s));
              if (matchingLeads.length === 0) return null;
              return /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("h4", { className: "text-[10px] font-extrabold uppercase text-slate-400 mb-2", children: [
                  "Leads (",
                  matchingLeads.length,
                  ")"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1994,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: matchingLeads.map((lead) => /* @__PURE__ */ jsxDEV("div", { className: "text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-sky-300 hover:bg-sky-50 cursor-pointer transition", onClick: () => {
                  setGlobalSearchTerm("");
                  setActiveTab("leads");
                }, children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "font-bold text-slate-700", children: lead.nomeLead }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1998,
                    columnNumber: 29
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-full", children: lead.status }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 1999,
                    columnNumber: 29
                  }, this)
                ] }, lead._linha, true, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1997,
                  columnNumber: 27
                }, this)) }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 1995,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 1993,
                columnNumber: 21
              }, this);
            })(),
            (() => {
              const s = globalSearchTerm.toLowerCase();
              const matchingBase = baseClients.filter((c) => c.nome.toLowerCase().includes(s) || c.cidade && c.cidade.toLowerCase().includes(s));
              if (matchingBase.length === 0) return null;
              return /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("h4", { className: "text-[10px] font-extrabold uppercase text-slate-400 mb-2", children: [
                  "Base de Clientes (",
                  matchingBase.length,
                  ")"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2014,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: matchingBase.map((client) => /* @__PURE__ */ jsxDEV("div", { className: "text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-sky-300 hover:bg-sky-50 cursor-pointer transition", onClick: () => {
                  setGlobalSearchTerm("");
                  setActiveTab("base");
                }, children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "font-bold text-slate-700", children: client.nome }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 2018,
                    columnNumber: 29
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-full", children: client.plano }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 2019,
                    columnNumber: 29
                  }, this)
                ] }, client.idContrato, true, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2017,
                  columnNumber: 27
                }, this)) }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2015,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2013,
                columnNumber: 21
              }, this);
            })(),
            (() => {
              const s = globalSearchTerm.toLowerCase();
              const matchingTasks = tasks.filter((t) => t.descricao.toLowerCase().includes(s));
              if (matchingTasks.length === 0) return null;
              return /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("h4", { className: "text-[10px] font-extrabold uppercase text-slate-400 mb-2", children: [
                  "Tarefas (",
                  matchingTasks.length,
                  ")"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2034,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: matchingTasks.map((task) => /* @__PURE__ */ jsxDEV("div", { className: "text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition", onClick: () => {
                  setGlobalSearchTerm("");
                  setActiveTab("tasks");
                }, children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "font-bold text-slate-700", children: task.descricao }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 2038,
                    columnNumber: 29
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full", children: task.status === "CONCLUIDA" ? "Feita" : "Pendente" }, void 0, false, {
                    fileName: "/app/applet/src/App.tsx",
                    lineNumber: 2039,
                    columnNumber: 29
                  }, this)
                ] }, task.id, true, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2037,
                  columnNumber: 27
                }, this)) }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2035,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2033,
                columnNumber: 21
              }, this);
            })(),
            leads.filter((l) => l.nomeLead.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 && baseClients.filter((c) => c.nome.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 && tasks.filter((t) => t.descricao.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 && /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-slate-400 font-semibold text-center py-4", children: "Nenhum resultado encontrado." }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 2050,
              columnNumber: 20
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 1982,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 1965,
          columnNumber: 11
        }, this),
        loading && leads.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center py-24 text-slate-400 text-xs font-sans space-y-4", children: [
          /* @__PURE__ */ jsxDEV(Loader2, { className: "w-8 h-8 text-sky-600 animate-spin" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2058,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "font-bold uppercase tracking-wider text-[10px] text-slate-500", children: "Sincronizando Leads via Google Sheets..." }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2059,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 2057,
          columnNumber: 13
        }, this) : renderActivePage()
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 1963,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "lg:hidden bg-white border-t border-slate-200 py-2 px-4 flex overflow-x-auto gap-5 items-center shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-50 shrink-0 select-none font-sans [&::-webkit-scrollbar]:hidden", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("dashboard"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "dashboard" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(Activity, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2073,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Home" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2074,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2069,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setLeadsFilterSeller(null);
              setActiveTab("leads");
            },
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "leads" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(Users, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2084,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Leads" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2085,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2077,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("base"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "base" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(Award, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2092,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Base" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2093,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2088,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("leads_frios"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "leads_frios" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(FileSpreadsheet, { className: "w-4 h-4 " }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2100,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Frios" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2101,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2096,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("cobrancas"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "cobrancas" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(Coins, { className: "w-4 h-4 text-rose-500" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2108,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Cobrar" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2109,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2104,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("ftta"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "ftta" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(MapPin, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2116,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "FTTA" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2117,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2112,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("tasks"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "tasks" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(ClipboardList, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2124,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Tarefas" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2125,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2120,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("installations"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "installations" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(CalendarDays, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2132,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Agenda" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2133,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2128,
            columnNumber: 11
          },
          this
        ),
        userRole === "admin" && /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setActiveTab("estrategia"),
              className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "estrategia" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
              children: [
                /* @__PURE__ */ jsxDEV(Bot, { className: "w-4 h-4 text-blue-500" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2142,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Estratégia" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2143,
                  columnNumber: 17
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 2138,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setActiveTab("vendedores"),
              className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "vendedores" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
              children: [
                /* @__PURE__ */ jsxDEV(Sliders, { className: "w-4 h-4 text-sky-500" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2149,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Metas" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2150,
                  columnNumber: 17
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 2145,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setActiveTab("admin_n8n"),
              className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "admin_n8n" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
              children: [
                /* @__PURE__ */ jsxDEV(Link, { className: "w-4 h-4 text-blue-500" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2156,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "N8N" }, void 0, false, {
                  fileName: "/app/applet/src/App.tsx",
                  lineNumber: 2157,
                  columnNumber: 17
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 2152,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 2137,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("pos_venda"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "pos_venda" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(UserCheck, { className: "w-4 h-4 text-emerald-500" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2168,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Pós Venda" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2169,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2164,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActiveTab("trade"),
            className: `flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${activeTab === "trade" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"}`,
            children: [
              /* @__PURE__ */ jsxDEV(Store, { className: "w-4 h-4 text-sky-500" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2175,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-extrabold uppercase tracking-tight", children: "Trade" }, void 0, false, {
                fileName: "/app/applet/src/App.tsx",
                lineNumber: 2176,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2171,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2067,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 1860,
      columnNumber: 7
    }, this),
    showPWABanner && /* @__PURE__ */ jsxDEV("div", { className: "fixed top-0 left-0 right-0 z-[99999] bg-slate-900 border-b border-slate-700 p-4 shadow-xl flex items-center justify-between animate-in slide-in-from-top", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-10 h-10 bg-gradient-to-tr from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxDEV(Download, { className: "w-5 h-5 text-white" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 2188,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 2187,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-white text-xs font-bold leading-tight", children: "Instale o App MHNET" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2191,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-slate-400 text-[10px] leading-tight mt-0.5", children: "Acesso rápido e offline" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2192,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 2190,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2186,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              localStorage.setItem("pwa_banner_dismissed", "true");
              setShowPWABanner(false);
            },
            className: "px-2 py-1.5 text-slate-400 hover:text-white text-[10px] font-bold uppercase",
            children: "Agora não"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2196,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === "accepted") {
                  setDeferredPrompt(null);
                  setShowPWABanner(false);
                  localStorage.setItem("pwa_banner_dismissed", "true");
                }
              } else {
                setShowPWAInstructions(true);
                setShowPWABanner(false);
              }
            },
            className: "px-3 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-sky-500 shadow shadow-sky-900/50",
            children: "Instalar"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2204,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2195,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 2185,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        id: "floating-ai-agent-trigger-badge",
        onClick: () => {
          setIsAiChatOpen(true);
          setUnreadAiTips(0);
          setIsBadgePulsing(false);
        },
        className: `print:hidden fixed bottom-16 right-4 lg:bottom-6 lg:right-6 w-12 h-12 bg-gradient-to-tr from-sky-600 to-sky-800 text-white rounded-2xl shadow-xl hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center border border-sky-500/50 hover:shadow-sky-900/10 z-[99999] cursor-pointer ${isBadgePulsing ? "animate-ping" : "animate-pulse-light"}`,
        title: "Assistente Comercial IA",
        children: [
          /* @__PURE__ */ jsxDEV(Bot, { className: "w-6 h-6 stroke-[2.2]" }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2234,
            columnNumber: 9
          }, this),
          unreadAiTips > 0 && /* @__PURE__ */ jsxDEV("span", { className: "absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900 shadow-md", children: unreadAiTips }, void 0, false, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2236,
            columnNumber: 11
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2226,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      ChatModal,
      {
        isOpen: isAiChatOpen,
        onClose: () => setIsAiChatOpen(false),
        onSendChatMessage: handleSendChatMessage
      },
      void 0,
      false,
      {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2243,
        columnNumber: 7
      },
      this
    ),
    showPWAInstructions && /* @__PURE__ */ jsxDEV("div", { className: "fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4", children: /* @__PURE__ */ jsxDEV("div", { className: "bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center space-y-4", children: [
      /* @__PURE__ */ jsxDEV("button", { onClick: () => setShowPWAInstructions(false), className: "absolute top-4 right-4 text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsxDEV("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2255,
        columnNumber: 94
      }, this) }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2255,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2254,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mx-auto w-12 h-12 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxDEV("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2258,
        columnNumber: 94
      }, this) }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2258,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2257,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-bold text-white", children: "Instalar Aplicativo" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2260,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-slate-400 space-y-2 text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700/50", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "font-semibold text-slate-300", children: "Como instalar no seu celular:" }, void 0, false, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 2262,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("ul", { className: "list-disc pl-4 space-y-1", children: [
          /* @__PURE__ */ jsxDEV("li", { children: [
            /* @__PURE__ */ jsxDEV("strong", { children: "No iOS (Safari):" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 2264,
              columnNumber: 21
            }, this),
            ' Toque no ícone de Compartilhar e selecione "Adicionar à Tela de Início".'
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2264,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("li", { children: [
            /* @__PURE__ */ jsxDEV("strong", { children: "No Android (Chrome):" }, void 0, false, {
              fileName: "/app/applet/src/App.tsx",
              lineNumber: 2265,
              columnNumber: 21
            }, this),
            ' Toque no menu (3 pontos) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".'
          ] }, void 0, true, {
            fileName: "/app/applet/src/App.tsx",
            lineNumber: 2265,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/App.tsx",
          lineNumber: 2263,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2261,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("button", { onClick: () => setShowPWAInstructions(false), className: "w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold transition", children: "Entendido" }, void 0, false, {
        fileName: "/app/applet/src/App.tsx",
        lineNumber: 2268,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 2253,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/app/applet/src/App.tsx",
      lineNumber: 2252,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/app/applet/src/App.tsx",
    lineNumber: 1530,
    columnNumber: 5
  }, this);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFwcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAqL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgVGVybWluYWwsIFxuICBCb3QsIFdpZmksIFdpZmlPZmYsIFJlZnJlc2hDdywgTG9nT3V0LCBMb2FkZXIyLCBBd2FyZCwgQ2xpcGJvYXJkTGlzdCwgXG4gIE1hcFBpbiwgVXNlcnMsIEhlbHBDaXJjbGUsIEFjdGl2aXR5LCBJbmZvLCBDYWxlbmRhckRheXMsIEJvb2tPcGVuLCBVc2VyLCBMb2NrLCBTcGFya2xlcywgQ29pbnMsIERvd25sb2FkLCBTbGlkZXJzLCBMaW5rLCBDYWxjdWxhdG9yLCBMaWdodGJ1bGIsIFVzZXJDaGVjaywgU3RvcmUsIEZpbGVTcHJlYWRzaGVldCwgWmFwXG4sIEFyY2hpdmUsIFNlYXJjaCwgWCwgRmlsZVRleHQsIFN1biwgTW9vbiB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5cbmltcG9ydCB7IFxuICBWZW5kb3IsIExlYWQsIFRhc2ssIEFic2VuY2UsIEZ0dGFJdGVtLCBGdHRhUHJvc3BlY2NhbywgQ29tcGV0aXRvciwgQmFzZUNsaWVudCwgQmFzZUFjdGlvbkxvZywgQ29icmFuY2EsIENvYnJhbmNhTG9nLCBJbnN0YWxsYXRpb24gXG59IGZyb20gXCIuL3R5cGVzXCI7XG5cbi8vIFN0YXRpYyBmYWxsYmFjayBkYXRhXG5pbXBvcnQgeyBGQUxMQkFDS19DT01QRVRJVE9SUywgSU5JVElBTF9WRU5ET1JTIH0gZnJvbSBcIi4vZGF0YVwiO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgRGFzaGJvYXJkIGZyb20gXCIuL2NvbXBvbmVudHMvRGFzaGJvYXJkXCI7XG5pbXBvcnQgSW50ZXJuYWxQcm90b2NvbHNQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvSW50ZXJuYWxQcm90b2NvbHNQYWdlXCI7XG5pbXBvcnQgSW5zdGFsbGF0aW9uc1F1ZXVlUGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0luc3RhbGxhdGlvbnNRdWV1ZVBhZ2VcIjtcbmltcG9ydCBMZWFkc1BhZ2UgZnJvbSBcIi4vY29tcG9uZW50cy9MZWFkc1BhZ2VcIjtcbmltcG9ydCBGdHRhUGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0Z0dGFQYWdlXCI7XG5pbXBvcnQgVGFza3NQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvVGFza3NQYWdlXCI7XG5pbXBvcnQgSW5kaWNhdG9yc1BhZ2UgZnJvbSBcIi4vY29tcG9uZW50cy9JbmRpY2F0b3JzUGFnZVwiO1xuaW1wb3J0IEJhc2VNYW5hZ2VtZW50UGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0Jhc2VNYW5hZ2VtZW50UGFnZVwiO1xuaW1wb3J0IENvbXBldGl0b3JzUGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0NvbXBldGl0b3JzUGFnZVwiO1xuaW1wb3J0IE9iamVjdGlvbnNQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvT2JqZWN0aW9uc1BhZ2VcIjtcbmltcG9ydCBBYnNlbmNlc1BhZ2UgZnJvbSBcIi4vY29tcG9uZW50cy9BYnNlbmNlc1BhZ2VcIjtcbmltcG9ydCBNYXRlcmlhbHNQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvTWF0ZXJpYWxzUGFnZVwiO1xuaW1wb3J0IFBsYW5vc1BhZ2UgZnJvbSBcIi4vY29tcG9uZW50cy9QbGFub3NQYWdlXCI7XG5pbXBvcnQgUm90YVZlbmRhc1BhZ2UgZnJvbSBcIi4vY29tcG9uZW50cy9Sb3RhVmVuZGFzUGFnZVwiO1xuaW1wb3J0IEVzdHJhdGVnaWFQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvRXN0cmF0ZWdpYVBhZ2VcIjtcbmltcG9ydCBDaGF0TW9kYWwgZnJvbSBcIi4vY29tcG9uZW50cy9DaGF0TW9kYWxcIjtcbmltcG9ydCBDb2JyYW5jYXNQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvQ29icmFuY2FzUGFnZVwiO1xuaW1wb3J0IFZlbmRlZG9yZXNQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvVmVuZGVkb3Jlc1BhZ2VcIjtcbmltcG9ydCBJbnN0YWxsYXRpb25zUGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0luc3RhbGxhdGlvbnNQYWdlXCI7XG5pbXBvcnQgRXh0ZXJuYWxTdG9yZVBvcnRhbCBmcm9tIFwiLi9jb21wb25lbnRzL0V4dGVybmFsU3RvcmVQb3J0YWxcIjtcbmltcG9ydCB7IEFkbWluTjhOUGFnZSB9IGZyb20gXCIuL2NvbXBvbmVudHMvQWRtaW5OOE5QYWdlXCI7XG5pbXBvcnQgQWRtaW5Mb2dzUGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0FkbWluTG9nc1BhZ2VcIjtcbmltcG9ydCBBZG1pblRlc3RSZXN1bHRzUGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0FkbWluVGVzdFJlc3VsdHNQYWdlXCI7XG5pbXBvcnQgR2VzdGFvUGVzc29hc1BhZ2UgZnJvbSBcIi4vY29tcG9uZW50cy9HZXN0YW9QZXNzb2FzUGFnZVwiO1xuaW1wb3J0IENhbGN1bG9NdWx0YVBhZ2UgZnJvbSBcIi4vY29tcG9uZW50cy9DYWxjdWxvTXVsdGFQYWdlXCI7XG5pbXBvcnQgUG9zVmVuZGFQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvUG9zVmVuZGFQYWdlXCI7XG5pbXBvcnQgTWF0cml6T2JqZWNvZXNQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvTWF0cml6T2JqZWNvZXNQYWdlXCI7XG5pbXBvcnQgVHJhZGVQYWdlIGZyb20gXCIuL2NvbXBvbmVudHMvVHJhZGVQYWdlXCI7XG5pbXBvcnQgeyBMZWFkc0ZyaW9zVGFiIH0gZnJvbSBcIi4vY29tcG9uZW50cy9MZWFkc0ZyaW9zVGFiXCI7XG5pbXBvcnQgQXJxdWl2b01vcnRvUGFnZSBmcm9tIFwiLi9jb21wb25lbnRzL0FycXVpdm9Nb3J0b1BhZ2VcIjtcblxuaW1wb3J0IHsgaW5pdEF1dGgsIGdldEFjY2Vzc1Rva2VuLCBnb29nbGVTaWduSW4gfSBmcm9tIFwiLi9saWIvYXV0aFwiO1xuaW1wb3J0IHsgY3JlYXRlR29vZ2xlQ2FsZW5kYXJFdmVudCwgY3JlYXRlR29vZ2xlVGFzayB9IGZyb20gXCIuL2xpYi9nb29nbGVBcGlcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKCkge1xuICAvLyBUaGVtZSBzZWxlY3Rpb24gc3RhdGVcbiAgY29uc3QgW3RoZW1lLCBzZXRUaGVtZV0gPSB1c2VTdGF0ZTxcImxpZ2h0XCIgfCBcImRhcmtcIj4oKCkgPT4ge1xuICAgIHJldHVybiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0aGVtZVwiKSBhcyBcImxpZ2h0XCIgfCBcImRhcmtcIikgfHwgXCJsaWdodFwiO1xuICB9KTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGhlbWVcIiwgdGhlbWUpO1xuICAgIGlmICh0aGVtZSA9PT0gXCJkYXJrXCIpIHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZGFya1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkYXJrXCIpO1xuICAgIH1cbiAgfSwgW3RoZW1lXSk7XG5cbiAgLy8gQXV0aGVudGljYXRpb24gJiBzZXNzaW9uXG4gIGNvbnN0IFtnbG9iYWxTZWFyY2hUZXJtLCBzZXRHbG9iYWxTZWFyY2hUZXJtXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbbG9nZ2VkVXNlciwgc2V0TG9nZ2VkVXNlcl0gPSB1c2VTdGF0ZTxzdHJpbmc+KFwiXCIpO1xuICBjb25zdCBbdXNlclJvbGUsIHNldFVzZXJSb2xlXSA9IHVzZVN0YXRlPFwidmVuZGVkb3JcIiB8IFwiYWRtaW5cIiB8IFwiXCI+KFwiXCIpO1xuICBjb25zdCBbbG9naW5UZXJtLCBzZXRMb2dpblRlcm1dID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtsb2dpbkVycm9yLCBzZXRMb2dpbkVycm9yXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbaXNMb2dnaW5nSW5BbmltLCBzZXRJc0xvZ2dpbmdJbkFuaW1dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbbG9naW5TdGFnZVRleHQsIHNldExvZ2luU3RhZ2VUZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbd2ViaG9va0Vycm9yLCBzZXRXZWJob29rRXJyb3JdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaGFuZGxlciA9ICgpID0+IHNldFdlYmhvb2tFcnJvcih0cnVlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIndlYmhvb2stZXJyb3JcIiwgaGFuZGxlcik7XG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwid2ViaG9vay1lcnJvclwiLCBoYW5kbGVyKTtcbiAgfSwgW10pO1xuXG4gIC8vIEdsb2JhbCBTeW5jaW5nIHN0YXRlXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbaXNPbmxpbmUsIHNldElzT25saW5lXSA9IHVzZVN0YXRlKG5hdmlnYXRvci5vbkxpbmUpO1xuICBjb25zdCBbaXNTeW5jaW5nLCBzZXRJc1N5bmNpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbbGFzdFN5bmNUaW1lLCBzZXRMYXN0U3luY1RpbWVdID0gdXNlU3RhdGU8c3RyaW5nPihcIlwiKTtcblxuICAvLyBQcmltYXJ5IFN0YXRlIGNvbGxlY3Rpb25zXG4gIGNvbnN0IFtsZWFkcywgc2V0TGVhZHNdID0gdXNlU3RhdGU8TGVhZFtdPihbXSk7XG4gIGNvbnN0IFtmdHRhSXRlbXMsIHNldEZ0dGFJdGVtc10gPSB1c2VTdGF0ZTxGdHRhSXRlbVtdPihbXSk7XG4gIGNvbnN0IFtmdHRhUHJvc3BzLCBzZXRGdHRhUHJvc3BzXSA9IHVzZVN0YXRlPEZ0dGFQcm9zcGVjY2FvW10+KFtdKTtcbiAgY29uc3QgW3Rhc2tzLCBzZXRUYXNrc10gPSB1c2VTdGF0ZTxUYXNrW10+KFtdKTtcbiAgY29uc3QgW2Fic2VuY2VzLCBzZXRBYnNlbmNlc10gPSB1c2VTdGF0ZTxBYnNlbmNlW10+KFtdKTtcbiAgY29uc3QgW2Jhc2VDbGllbnRzLCBzZXRCYXNlQ2xpZW50c10gPSB1c2VTdGF0ZTxCYXNlQ2xpZW50W10+KFtdKTtcbiAgY29uc3QgW2Jhc2VBY3Rpb25zLCBzZXRCYXNlQWN0aW9uc10gPSB1c2VTdGF0ZTxCYXNlQWN0aW9uTG9nW10+KFtdKTtcbiAgY29uc3QgW2NvYnJhbmNhcywgc2V0Q29icmFuY2FzXSA9IHVzZVN0YXRlPENvYnJhbmNhW10+KFtdKTtcbiAgY29uc3QgW2NvbXBldGl0b3JzLCBzZXRDb21wZXRpdG9yc10gPSB1c2VTdGF0ZTxDb21wZXRpdG9yW10+KFtdKTtcbiAgY29uc3QgW2luc3RhbGxhdGlvbnMsIHNldEluc3RhbGxhdGlvbnNdID0gdXNlU3RhdGU8SW5zdGFsbGF0aW9uW10+KFtdKTtcblxuICAvLyBOYXZpZ2F0aW9uIFRyYWNraW5nc1xuICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGU8XG4gICAgXCJkYXNoYm9hcmRcIiB8IFwibGVhZHNcIiB8IFwiY2FkYXN0cm9MZWFkXCIgfCBcImZ0dGFcIiB8IFwidGFza3NcIiB8IFwiaW5kaWNhdG9yc1wiIHwgXCJiYXNlXCIgfCBcImNvbXBldGl0b3JzXCIgfCBcIm9iamVjdGlvbnNcIiB8IFwiYWJzZW5jZXNcIiB8IFwibWF0ZXJpYWxzXCIgfCBcImNvYnJhbmNhc1wiIHwgXCJ2ZW5kZWRvcmVzXCIgfCBcImluc3RhbGxhdGlvbnNcIiB8IFwiaW5zdGFsbGF0aW9uc19xdWV1ZVwiIHwgXCJhZG1pbl9uOG5cIiB8IFwiY2FsY3Vsb19tdWx0YVwiIHwgXCJwbGFub3NcIiB8IFwicm90YXNcIiB8IFwiZXN0cmF0ZWdpYVwiIHwgXCJrYWl6ZW5cIiB8IFwicG9zX3ZlbmRhXCIgfCBcIm1hdHJpel9vYmplY29lc1wiIHwgXCJ0cmFkZVwiIHwgXCJsZWFkc19mcmlvc1wiIHwgXCJwcm90b2NvbG9zX2ludGVybm9zXCIgfCBcImFkbWluX2xvZ3NcIiB8IFwiZ2VzdGFvX3Blc3NvYXNcIlxuICA+KFwiZGFzaGJvYXJkXCIpO1xuICBjb25zdCBbbGVhZHNGaWx0ZXJTZWxsZXIsIHNldExlYWRzRmlsdGVyU2VsbGVyXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbaXNFeHRlcm5hbFBhcnRuZXJNb2RlLCBzZXRJc0V4dGVybmFsUGFydG5lck1vZGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZnR0YVRhYiwgc2V0RnR0YVRhYl0gPSB1c2VTdGF0ZTxcImxhamVhZG9cIiB8IFwiZXN0cmVsYVwiIHwgXCJwcm9zcGVjY2FvXCI+KFwibGFqZWFkb1wiKTtcblxuICAvLyBEeW5hbWljIGxpc3Qgb2YgcmVnaXN0ZXJlZCB2ZW5kb3JzIChvYmplY3RzKVxuICBjb25zdCBbcmVnaXN0ZXJlZFZlbmRvcnMsIHNldFJlZ2lzdGVyZWRWZW5kb3JzXSA9IHVzZVN0YXRlPFZlbmRvcltdPihbXSk7XG5cbiAgLy8gRHluYW1pYyB2ZW5kb3JzIHN1Z2dlc3Rpb25zIG1hdGNoaW5nIHNwcmVhZHNoZWV0IGRhdGFcbiAgY29uc3QgW2F2YWlsYWJsZVZlbmRvcnMsIHNldEF2YWlsYWJsZVZlbmRvcnNdID0gdXNlU3RhdGU8c3RyaW5nW10+KElOSVRJQUxfVkVORE9SUyk7XG5cbiAgLy8gTW9uaXRvciBpZiBHZW1pbmkgQVBJIEtleSB3YXMgZmxhZ2dlZCBhcyBsZWFrZWQgb3IgcmVwb3J0ZWRcbiAgY29uc3QgW2lzQWlLZXlMZWFrZWQsIHNldElzQWlLZXlMZWFrZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYWlLZXlFcnJvck1lc3NhZ2UsIHNldEFpS2V5RXJyb3JNZXNzYWdlXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbbWlzc2luZ0VudktleXMsIHNldE1pc3NpbmdFbnZLZXlzXSA9IHVzZVN0YXRlPHN0cmluZ1tdPihbXSk7XG4gIGNvbnN0IFtpbnZhbGlkRW52S2V5cywgc2V0SW52YWxpZEVudktleXNdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKTtcblxuICBjb25zdCBbaGFzR29vZ2xlQXV0aCwgc2V0SGFzR29vZ2xlQXV0aF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtkZWZlcnJlZFByb21wdCwgc2V0RGVmZXJyZWRQcm9tcHRdID0gdXNlU3RhdGU8YW55PihudWxsKTtcbiAgY29uc3QgW3Nob3dQV0FCYW5uZXIsIHNldFNob3dQV0FCYW5uZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd1BXQUluc3RydWN0aW9ucywgc2V0U2hvd1BXQUluc3RydWN0aW9uc10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cblxuICAvLyBMb2FkIGFjdHVhbCBhY3RpdmUgdmVuZG9ycyBsaXN0IG9uIG1vdW50XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaW5pdEF1dGgoXG4gICAgICAoKSA9PiBzZXRIYXNHb29nbGVBdXRoKHRydWUpLFxuICAgICAgKCkgPT4gc2V0SGFzR29vZ2xlQXV0aChmYWxzZSlcbiAgICApO1xuXG4gICAgY29uc3QgaGFuZGxlQmVmb3JlSW5zdGFsbFByb21wdCA9IChlOiBhbnkpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNldERlZmVycmVkUHJvbXB0KGUpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImJlZm9yZWluc3RhbGxwcm9tcHRcIiwgaGFuZGxlQmVmb3JlSW5zdGFsbFByb21wdCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJhcHBpbnN0YWxsZWRcIiwgKCkgPT4ge1xuICAgICAgc2V0RGVmZXJyZWRQcm9tcHQobnVsbCk7XG4gICAgICBzZXRTaG93UFdBQmFubmVyKGZhbHNlKTtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwd2FfYmFubmVyX2Rpc21pc3NlZCcsICd0cnVlJyk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBpc1N0YW5kYWxvbmUgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKGRpc3BsYXktbW9kZTogc3RhbmRhbG9uZSknKS5tYXRjaGVzIHx8ICgnc3RhbmRhbG9uZScgaW4gbmF2aWdhdG9yICYmIChuYXZpZ2F0b3IgYXMgYW55KS5zdGFuZGFsb25lKTtcbiAgICBjb25zdCBpc0Rpc21pc3NlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwd2FfYmFubmVyX2Rpc21pc3NlZCcpID09PSAndHJ1ZSc7XG5cbiAgICBpZiAoIWlzU3RhbmRhbG9uZSAmJiAhaXNEaXNtaXNzZWQgJiYgd2luZG93LmlubmVyV2lkdGggPCA3NjgpIHtcbiAgICAgIGNvbnN0IGJhbm5lclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBzZXRTaG93UFdBQmFubmVyKHRydWUpLCAzMDAwKTtcbiAgICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQoYmFubmVyVGltZXIpO1xuICAgIH1cblxuXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guaW5jbHVkZXMoXCJtb2RlPWVxdWlwZS1sb2phXCIpKSB7XG4gICAgICBzZXRJc0V4dGVybmFsUGFydG5lck1vZGUodHJ1ZSk7XG4gICAgfVxuICAgIFxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uc2VhcmNoLmluY2x1ZGVzKFwidGFiPWNhZGFzdHJvTGVhZFwiKSkge1xuICAgICAgc2V0QWN0aXZlVGFiKFwiY2FkYXN0cm9MZWFkXCIpO1xuICAgIH1cblxuICAgIGZldGNoKFwiL2FwaS9nZW1pbmkvc3RhdHVzXCIpXG4gICAgICAudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICAgIC50aGVuKGQgPT4ge1xuICAgICAgICBpZiAoZCAmJiBkLmlzTGVha2VkKSB7XG4gICAgICAgICAgc2V0SXNBaUtleUxlYWtlZCh0cnVlKTtcbiAgICAgICAgICBzZXRBaUtleUVycm9yTWVzc2FnZShkLmVycm9yTWVzc2FnZSB8fCBcIllvdXIgQVBJIGtleSB3YXMgcmVwb3J0ZWQgYXMgbGVha2VkLlwiKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS53YXJuKFwiRXJybyBhbyBidXNjYXIgc3RhdHVzIGRvIEdlbWluaTpcIiwgZXJyKSk7XG5cbiAgICBmZXRjaChcIi9hcGkvY29uZmlnL3N0YXR1c1wiKVxuICAgICAgLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgICAudGhlbihkID0+IHtcbiAgICAgICAgaWYgKGQgJiYgZC5zdGF0dXMgPT09IFwiaXNzdWVzXCIpIHtcbiAgICAgICAgICBpZiAoZC5taXNzaW5nS2V5cyAmJiBkLm1pc3NpbmdLZXlzLmxlbmd0aD4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuKaoO+4jyBWYXJpw6F2ZWlzIGRlIGFtYmllbnRlIG9icmlnYXTDs3JpYXMgYXVzZW50ZXMgbm8gLmVudjpcIiwgZC5taXNzaW5nS2V5cyk7XG4gICAgICAgICAgICBzZXRNaXNzaW5nRW52S2V5cyhkLm1pc3NpbmdLZXlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGQuaW52YWxpZEZvcm1hdEtleXMgJiYgZC5pbnZhbGlkRm9ybWF0S2V5cy5sZW5ndGg+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLimqDvuI8gVmFyacOhdmVpcyBkZSBhbWJpZW50ZSBjb20gZm9ybWF0byBpbnbDoWxpZG8gbm8gLmVudjpcIiwgZC5pbnZhbGlkRm9ybWF0S2V5cyk7XG4gICAgICAgICAgICBzZXRJbnZhbGlkRW52S2V5cyhkLmludmFsaWRGb3JtYXRLZXlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUud2FybihcIkVycm8gYW8gdmVyaWZpY2FyIGNoYXZlcyBkZSBhbWJpZW50ZTpcIiwgZXJyKSk7XG5cbiAgICBmZXRjaChcIi9hcGkvdmVuZG9yc1wiKVxuICAgICAgLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgICAudGhlbihkID0+IHtcbiAgICAgICAgaWYgKGQgJiYgZC52ZW5kb3JzICYmIGQudmVuZG9ycy5sZW5ndGg+IDApIHtcbiAgICAgICAgICBzZXRSZWdpc3RlcmVkVmVuZG9ycyhkLnZlbmRvcnMpO1xuICAgICAgICAgIGNvbnN0IGNvbWJpbmVkID0gZC52ZW5kb3JzLm1hcCgodjogYW55KSA9PiB2Lm5vbWUpO1xuICAgICAgICAgIHNldEF2YWlsYWJsZVZlbmRvcnMoY29tYmluZWQpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLndhcm4oXCJFcnJvIGFvIGJ1c2NhciB2ZW5kZWRvcmVzOlwiLCBlcnIpKTtcblxuICAgIGZldGNoKFwiL2FwaS9jb21wZXRpdG9yc1wiKVxuICAgICAgLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgICAudGhlbihkID0+IHtcbiAgICAgICAgaWYgKGQgJiYgZC5jb21wZXRpdG9ycykge1xuICAgICAgICAgIHNldENvbXBldGl0b3JzKGQuY29tcGV0aXRvcnMpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLndhcm4oXCJFcnJvIGFvIGJ1c2NhciBjb25jb3JyZW50ZXM6XCIsIGVycikpO1xuXG4gICAgZmV0Y2goXCIvYXBpL2luc3RhbGxhdGlvbnNcIilcbiAgICAgIC50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgICAgLnRoZW4oZCA9PiB7XG4gICAgICAgIGlmIChkICYmIGQuaW5zdGFsbGF0aW9ucykge1xuICAgICAgICAgIHNldEluc3RhbGxhdGlvbnMoZC5pbnN0YWxsYXRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS53YXJuKFwiRXJybyBhbyBidXNjYXIgaW5zdGFsYcOnw7VlczpcIiwgZXJyKSk7XG4gIH0sIFtdKTtcblxuICAvLyBGbG9hdGluZyBBSSBjaGF0IHRyaWdnZXIgcG9wdXBcbiAgY29uc3QgW2lzQWlDaGF0T3Blbiwgc2V0SXNBaUNoYXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3VucmVhZEFpVGlwcywgc2V0VW5yZWFkQWlUaXBzXSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBbaXNCYWRnZVB1bHNpbmcsIHNldElzQmFkZ2VQdWxzaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIFNpbXVsYSBvIHJlY2ViaW1lbnRvIGRlIHVtYSBub3ZhIGRpY2EgZGUgYWJvcmRhZ2VtIGRhIElBIGFww7NzIDE1IHNlZ3VuZG9zXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldFVucmVhZEFpVGlwcyhwcmV2ID0+IHByZXYgKyAxKTtcbiAgICAgIHNldElzQmFkZ2VQdWxzaW5nKHRydWUpO1xuICAgICAgLy8gUGFyYSBhIHB1bHNhw6fDo28gYXDDs3MgNSBzZWd1bmRvc1xuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRJc0JhZGdlUHVsc2luZyhmYWxzZSksIDUwMDApO1xuICAgIH0sIDE1MDAwKTtcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgfSwgW10pO1xuXG5cbiAgLy8gTW9uaXRvciBvbmxpbmUgbmV0d29yayBjb25uZWN0aXZpdHlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBnb09ubGluZSA9ICgpID0+IHNldElzT25saW5lKHRydWUpO1xuICAgIGNvbnN0IGdvT2ZmbGluZSA9ICgpID0+IHNldElzT25saW5lKGZhbHNlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9ubGluZVwiLCBnb09ubGluZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvZmZsaW5lXCIsIGdvT2ZmbGluZSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwib25saW5lXCIsIGdvT25saW5lKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwib2ZmbGluZVwiLCBnb09mZmxpbmUpO1xuICAgIH07XG4gIH0sIFtdKTtcblxuICAvLyBTeW5jIGRhdGEgb24gc2Vzc2lvbiBsb2dpbiBzdWNjZXNzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc2F2ZWRVc2VyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJtaG5ldF91c2VyXCIpO1xuICAgIGxldCBzYXZlZFJvbGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm1obmV0X3JvbGVcIik7XG4gICAgaWYgKHNhdmVkVXNlcikge1xuICAgICAgY29uc3QgbG93ZXIgPSBzYXZlZFVzZXIudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChcbiAgICAgICAgbG93ZXIuaW5jbHVkZXMoXCJicnVubyBxdWVpcm96XCIpIHx8IFxuICAgICAgICBsb3dlci5pbmNsdWRlcyhcImJydW5vIGdhcmNpYVwiKSB8fCBcbiAgICAgICAgbG93ZXIuaW5jbHVkZXMoXCJnZXN0b3JcIikgfHwgXG4gICAgICAgIGxvd2VyLmluY2x1ZGVzKFwiYWRtaW5cIilcbiAgICAgICkge1xuICAgICAgICBzYXZlZFJvbGUgPSBcImFkbWluXCI7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibWhuZXRfcm9sZVwiLCBcImFkbWluXCIpO1xuICAgICAgfVxuICAgICAgc2V0TG9nZ2VkVXNlcihzYXZlZFVzZXIpO1xuICAgICAgc2V0VXNlclJvbGUoc2F2ZWRSb2xlIGFzIGFueSB8fCBcInZlbmRlZG9yXCIpO1xuICAgIH1cbiAgfSwgW10pO1xuXG4gIC8vIEZldGNoIGZyb20gRXhwcmVzcyBiYWNrLWVuZCBlbmRwb2ludHNcbiAgY29uc3QgZmV0Y2hBbGxEYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghbG9nZ2VkVXNlcikgcmV0dXJuO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgc2V0SXNTeW5jaW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICAvLyAxLiBGZXRjaCBsZWFkc1xuICAgICAgY29uc3QgckxlYWRzID0gYXdhaXQgZmV0Y2goXCIvYXBpL2xlYWRzXCIpO1xuICAgICAgaWYgKHJMZWFkcy5vaykge1xuICAgICAgICBjb25zdCBkID0gYXdhaXQgckxlYWRzLmpzb24oKTtcbiAgICAgICAgc2V0TGVhZHMoZC5kYXRhIHx8IFtdKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmV0Y2ggdmVuZG9ycyBsaXN0XG4gICAgICBjb25zdCByVmVuZG9ycyA9IGF3YWl0IGZldGNoKFwiL2FwaS92ZW5kb3JzXCIpO1xuICAgICAgaWYgKHJWZW5kb3JzLm9rKSB7XG4gICAgICAgIGNvbnN0IGQgPSBhd2FpdCByVmVuZG9ycy5qc29uKCk7XG4gICAgICAgIGlmIChkICYmIGQudmVuZG9ycykge1xuICAgICAgICAgIHNldFJlZ2lzdGVyZWRWZW5kb3JzKGQudmVuZG9ycyk7XG4gICAgICAgICAgc2V0QXZhaWxhYmxlVmVuZG9ycyhkLnZlbmRvcnMubWFwKCh2OiBhbnkpID0+IHYubm9tZSkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIDIuIEZldGNoIEZUVEEgbWFwcGluZ3NcbiAgICAgIGNvbnN0IHJGdHRhID0gYXdhaXQgZmV0Y2goXCIvYXBpL2Z0dGFcIik7XG4gICAgICBpZiAockZ0dGEub2spIHtcbiAgICAgICAgY29uc3QgZCA9IGF3YWl0IHJGdHRhLmpzb24oKTtcbiAgICAgICAgc2V0RnR0YUl0ZW1zKGQuc2l0ZXMgfHwgW10pO1xuICAgICAgICBzZXRGdHRhUHJvc3BzKGQucHJvc3BlY2NvZXMgfHwgW10pO1xuICAgICAgfVxuXG4gICAgICAvLyAzLiBGZXRjaCBUYXNrcyBjaGVja2xpc3RcbiAgICAgIGNvbnN0IHJUYXNrcyA9IGF3YWl0IGZldGNoKFwiL2FwaS90YXNrc1wiKTtcbiAgICAgIGlmIChyVGFza3Mub2spIHtcbiAgICAgICAgY29uc3QgZCA9IGF3YWl0IHJUYXNrcy5qc29uKCk7XG4gICAgICAgIHNldFRhc2tzKGQudGFza3MgfHwgW10pO1xuICAgICAgfVxuXG4gICAgICAvLyA0LiBGZXRjaCBBYnNlbmNlc1xuICAgICAgY29uc3QgckFicyA9IGF3YWl0IGZldGNoKFwiL2FwaS9hYnNlbmNlc1wiKTtcbiAgICAgIGlmIChyQWJzLm9rKSB7XG4gICAgICAgIGNvbnN0IGQgPSBhd2FpdCByQWJzLmpzb24oKTtcbiAgICAgICAgc2V0QWJzZW5jZXMoZC5hYnNlbmNlcyB8fCBbXSk7XG4gICAgICB9XG5cbiAgICAgIC8vIDUuIEZldGNoIFBvcnRmb2xpbyBDbGllbnRzXG4gICAgICBjb25zdCByQmFzZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9iYXNlXCIpO1xuICAgICAgaWYgKHJCYXNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGQgPSBhd2FpdCByQmFzZS5qc29uKCk7XG4gICAgICAgIHNldEJhc2VDbGllbnRzKGQuY2xpZW50cyB8fCBbXSk7XG4gICAgICAgIHNldEJhc2VBY3Rpb25zKGQuYWN0aW9ucyB8fCBbXSk7XG4gICAgICB9XG5cbiAgICAgIC8vIDYuIEZldGNoIENvYnJhbmNhc1xuICAgICAgY29uc3QgckNvYiA9IGF3YWl0IGZldGNoKFwiL2FwaS9jb2JyYW5jYXNcIik7XG4gICAgICBpZiAockNvYi5vaykge1xuICAgICAgICBjb25zdCBkID0gYXdhaXQgckNvYi5qc29uKCk7XG4gICAgICAgIHNldENvYnJhbmNhcyhkLmNvYnJhbmNhcyB8fCBbXSk7XG4gICAgICAgIHNhdmVPZmZsaW5lQ2FjaGUoXCJjb2JyYW5jYXNcIiwgZC5jb2JyYW5jYXMgfHwgW10pO1xuICAgICAgfVxuXG4gICAgICAvLyBGZXRjaCBjb21wZXRpdG9ycyBsaXN0XG4gICAgICBjb25zdCByQ29tcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9jb21wZXRpdG9yc1wiKTtcbiAgICAgIGlmIChyQ29tcC5vaykge1xuICAgICAgICBjb25zdCBkID0gYXdhaXQgckNvbXAuanNvbigpO1xuICAgICAgICBzZXRDb21wZXRpdG9ycyhkLmNvbXBldGl0b3JzIHx8IFtdKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmV0Y2ggaW5zdGFsbGF0aW9ucyBsaXN0XG4gICAgICBjb25zdCBySW5zdCA9IGF3YWl0IGZldGNoKFwiL2FwaS9pbnN0YWxsYXRpb25zXCIpO1xuICAgICAgaWYgKHJJbnN0Lm9rKSB7XG4gICAgICAgIGNvbnN0IGQgPSBhd2FpdCBySW5zdC5qc29uKCk7XG4gICAgICAgIHNldEluc3RhbGxhdGlvbnMoZC5pbnN0YWxsYXRpb25zIHx8IFtdKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKCk7XG4gICAgICBzZXRMYXN0U3luY1RpbWUoYCR7ZC50b0xvY2FsZURhdGVTdHJpbmcoXCJwdC1CUlwiKX0gJHtkLnRvTG9jYWxlVGltZVN0cmluZyhcInB0LUJSXCIsIHsgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCIgfSl9YCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKFwi4pqg77iPIEFQSSBkZSByZWRlIGluYWNlc3PDrXZlbC4gVXRpbGl6YW5kbyBtb2RvIG9mZmxpbmUgbG9jYWwgbG9jYWxzdG9yYWdlLlwiLCBlKTtcbiAgICAgIC8vIExvYWQgb2ZmbGluZSBjYWNoZSBvbiBmYXVsdFxuICAgICAgbG9hZE9mZmxpbmVMb2NhbFN0b3JhZ2VEYXRhQ2FjaGUoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICBzZXRJc1N5bmNpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBsb2FkT2ZmbGluZUxvY2FsU3RvcmFnZURhdGFDYWNoZSA9ICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgY0xlYWRzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjYWNoZV9sZWFkc1wiKTtcbiAgICAgIGNvbnN0IGNUYXNrcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY2FjaGVfdGFza3NcIik7XG4gICAgICBjb25zdCBjQWJzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjYWNoZV9hYnNlbmNlc1wiKTtcbiAgICAgIGNvbnN0IGNDb2IgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNhY2hlX2NvYnJhbmNhc1wiKTtcbiAgICAgIGlmIChjTGVhZHMpIHNldExlYWRzKEpTT04ucGFyc2UoY0xlYWRzKSk7XG4gICAgICBpZiAoY1Rhc2tzKSBzZXRUYXNrcyhKU09OLnBhcnNlKGNUYXNrcykpO1xuICAgICAgaWYgKGNBYnMpIHNldEFic2VuY2VzKEpTT04ucGFyc2UoY0FicykpO1xuICAgICAgaWYgKGNDb2IpIHNldENvYnJhbmNhcyhKU09OLnBhcnNlKGNDb2IpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJFcnJvIGFvIGNhcnJlZ2FyIGNhY2hlIG9mZmxpbmVcIiwgZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHNhdmVPZmZsaW5lQ2FjaGUgPSAoa2V5OiBzdHJpbmcsIGRhdGE6IGFueSkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgY2FjaGVfJHtrZXl9YCwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIkVycm8gYW8gc2FsdmFyIGNhY2hlXCIsIGUpO1xuICAgIH1cbiAgfTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChsb2dnZWRVc2VyKSB7XG4gICAgICBmZXRjaEFsbERhdGEoKTtcblxuICAgICAgLy8gU2luY3Jvbml6YcOnw6NvIGF1dG9tw6F0aWNhIGVtIHNlZ3VuZG8gcGxhbm8gYSBjYWRhIDIgbWludXRvc1xuICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGZldGNoQWxsRGF0YSgpO1xuICAgICAgfSwgMiAqIDYwICogMTAwMCk7XG4gICAgICBcbiAgICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9XG4gICAgfSwgW2xvZ2dlZFVzZXJdKTtcblxuICAvLyBTZXNzaW9uIExvZ2luIHdvcmtmbG93IGxvZ2ljXG4gIGNvbnN0IHByb2Nlc3NMb2dpbkFjdGlvbiA9IChjbGVhbk5hbWU6IHN0cmluZykgPT4ge1xuICAgIGxldCBkZXRlY3RlZFJvbGU6IFwidmVuZGVkb3JcIiB8IFwiYWRtaW5cIiA9IFwidmVuZGVkb3JcIjtcbiAgICBjb25zdCBsb3dlckNsZWFuID0gY2xlYW5OYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgXG4gICAgaWYgKFxuICAgICAgbG93ZXJDbGVhbiA9PT0gXCJhZG1pblwiIHx8IFxuICAgICAgbG93ZXJDbGVhbiA9PT0gXCJnZXN0b3JcIiB8fCBcbiAgICAgIGxvd2VyQ2xlYW4gPT09IFwiMTIzXCIgfHxcbiAgICAgIGxvd2VyQ2xlYW4uaW5jbHVkZXMoXCJicnVubyBxdWVpcm96XCIpIHx8XG4gICAgICBsb3dlckNsZWFuLmluY2x1ZGVzKFwiYnJ1bm8gZ2FyY2lhXCIpXG4gICAgKSB7XG4gICAgICBkZXRlY3RlZFJvbGUgPSBcImFkbWluXCI7XG4gICAgfVxuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJtaG5ldF91c2VyXCIsIGNsZWFuTmFtZSk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJtaG5ldF9yb2xlXCIsIGRldGVjdGVkUm9sZSk7XG4gICAgXG4gICAgLy8gU3RhcnQgZ29yZ2VvdXMgbG9naW4gYW5pbWF0aW9uIGZsb3dcbiAgICBzZXRJc0xvZ2dpbmdJbkFuaW0odHJ1ZSk7XG4gICAgc2V0TG9naW5TdGFnZVRleHQoXCLwn5SRIFZlcmlmaWNhbmRvIGNyZWRlbmNpYWlzIGNvcnBvcmF0aXZhcyBNSE5FVC4uLlwiKTtcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2V0TG9naW5TdGFnZVRleHQoXCLwn5SEIFNpbmNyb25pemFuZG8gY2FydGVpcmEgZGUgbGVhZHMgKEdvb2dsZSBTaGVldHMpLi4uXCIpO1xuICAgIH0sIDYwMCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldExvZ2luU3RhZ2VUZXh0KFwi8J+TiCBDb25zb2xpZGFuZG8gbWF0cml6IGRlIGluZGljYWRvcmVzIGVtIHRlbXBvIHJlYWwuLi5cIik7XG4gICAgfSwgMTMwMCk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldExvZ2luU3RhZ2VUZXh0KFwi4pyoIE90aW1pemFuZG8gbyBhbWJpZW50ZSBkZSB2ZW5kYXMgcGFyYSBzZXUgbmF2ZWdhZG9yLi4uXCIpO1xuICAgIH0sIDIwMDApO1xuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRMb2dnZWRVc2VyKGNsZWFuTmFtZSk7XG4gICAgICBzZXRVc2VyUm9sZShkZXRlY3RlZFJvbGUpO1xuICAgICAgc2V0QWN0aXZlVGFiKFwiZGFzaGJvYXJkXCIpO1xuICAgICAgc2V0SXNMb2dnaW5nSW5BbmltKGZhbHNlKTtcbiAgICB9LCAyNjUwKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVHb29nbGVMb2dpbiA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgc2V0TG9naW5FcnJvcihcIlwiKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdvb2dsZVNpZ25JbigpO1xuICAgICAgaWYgKHJlc3VsdD8udXNlcikge1xuICAgICAgICBjb25zdCB1c2VyTmFtZSA9IHJlc3VsdC51c2VyLmRpc3BsYXlOYW1lIHx8IHJlc3VsdC51c2VyLmVtYWlsIHx8IFwiVXN1w6FyaW8gVmVuZGVkb3JcIjtcbiAgICAgICAgcHJvY2Vzc0xvZ2luQWN0aW9uKHVzZXJOYW1lKTtcbiAgICAgIH0gXG4gICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgc2V0TG9naW5FcnJvcihcIkVycm8gYW8gYXV0ZW50aWNhciBjb20gbyBHb29nbGUuIFRlbnRlIG5vdmFtZW50ZS5cIik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ2luID0gKGU6IFJlYWN0LkZvcm1FdmVudCkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZXRMb2dpbkVycm9yKFwiXCIpO1xuICAgIGNvbnN0IGNsZWFuID0gbG9naW5UZXJtLnRyaW0oKTtcbiAgICBpZiAoIWNsZWFuKSB7XG4gICAgICBzZXRMb2dpbkVycm9yKFwiUG9yIGZhdm9yLCBkaWdpdGUgc2V1IG5vbWUgZGUgY29uc3VsdG9yIG91IGFkbWluaXN0cmFkb3IuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBwcm9jZXNzTG9naW5BY3Rpb24oY2xlYW4pO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ291dCA9ICgpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm1obmV0X3VzZXJcIik7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJtaG5ldF9yb2xlXCIpO1xuICAgIHNldExvZ2dlZFVzZXIoXCJcIik7XG4gICAgc2V0VXNlclJvbGUoXCJcIik7XG4gIH07XG5cbiAgLy8gQ0FMTEJBQ0sgSU5URVJBQ1RJT04gQUNUSU9OIEVORFBPSU5UUzpcbiAgLy8gMS4gTGVhZHMgY3JlYXRpb24gYW5kIGVkaXRpb25zIHN5bmNcbiAgY29uc3QgaGFuZGxlU2F2ZUxlYWQgPSBhc3luYyAocGF5bG9hZDogYW55KSA9PiB7XG4gICAgY29uc3QgaXNOZXcgPSAhcGF5bG9hZC5fbGluaGE7XG4gICAgY29uc3QgdG9kYXlTdHIgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlRGF0ZVN0cmluZyhcInB0LUJSXCIpO1xuICAgIGNvbnN0IG5vd1RpbWVTdHIgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZyhcInB0LUJSXCIsIHsgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCIgfSk7XG5cbiAgICBsZXQgdXBkYXRlZExlYWRzID0gWy4uLmxlYWRzXTtcbiAgICBcbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIGNvbnN0IG5ld0xlYWQ6IExlYWQgPSB7XG4gICAgICAgIF9saW5oYTogbGVhZHMubGVuZ3RoICsgMiwgLy8gZXN0aW1hdGUgc2hlZXQgcm93XG4gICAgICAgIG5vbWVMZWFkOiBwYXlsb2FkLm5vbWVMZWFkLFxuICAgICAgICB0ZWxlZm9uZTogcGF5bG9hZC50ZWxlZm9uZSxcbiAgICAgICAgZW5kZXJlY286IHBheWxvYWQuZW5kZXJlY28sXG4gICAgICAgIG51bWVybzogcGF5bG9hZC5udW1lcm8sXG4gICAgICAgIGNvbXBsZW1lbnRvOiBwYXlsb2FkLmNvbXBsZW1lbnRvLFxuICAgICAgICBiYWlycm86IHBheWxvYWQuYmFpcnJvLFxuICAgICAgICBjaWRhZGU6IHBheWxvYWQuY2lkYWRlLFxuICAgICAgICBwcm92ZWRvcjogcGF5bG9hZC5wcm92ZWRvcixcbiAgICAgICAgdmFsb3JQbGFubzogcGF5bG9hZC52YWxvclBsYW5vLFxuICAgICAgICBwbGFub0F0dWFsOiBwYXlsb2FkLnBsYW5vQXR1YWwsXG4gICAgICAgIGZpZGVsaWRhZGU6IHBheWxvYWQuZmlkZWxpZGFkZSxcbiAgICAgICAgaW50ZXJlc3NlOiBwYXlsb2FkLmludGVyZXNzZSxcbiAgICAgICAgc3RhdHVzOiBwYXlsb2FkLnN0YXR1cyxcbiAgICAgICAgb2JzZXJ2YWNhbzogcGF5bG9hZC5vYnNlcnZhY2FvLFxuICAgICAgICB2ZW5kZWRvcjogbG9nZ2VkVXNlcixcbiAgICAgICAgZGF0YUNhZGFzdHJvOiB0b2RheVN0cixcbiAgICAgICAgdWx0aW1hQXR1YWxpemFjYW86IGAke3RvZGF5U3RyfSAke25vd1RpbWVTdHJ9YFxuICAgICAgfTtcbiAgICAgIHVwZGF0ZWRMZWFkcyA9IFtuZXdMZWFkLCAuLi5sZWFkc107XG4gICAgICBpZiAobmV3TGVhZC5zdGF0dXMgPT09IFwiVmVuZGEgRmVjaGFkYVwiIHx8IChuZXdMZWFkLnN0YXR1cyBhcyBzdHJpbmcpID09PSBcIkZyaW9cIiB8fCAobmV3TGVhZC5zdGF0dXMgYXMgc3RyaW5nKSA9PT0gXCJMZWFkIEZyaW9cIikge1xuICAgICAgICB1cGRhdGVkTGVhZHMgPSB1cGRhdGVkTGVhZHMuZmlsdGVyKGwgPT4gbC5fbGluaGEgIT09IG5ld0xlYWQuX2xpbmhhKTtcbiAgICAgIH1cbiAgICAgIHNldExlYWRzKHVwZGF0ZWRMZWFkcyk7XG4gICAgICBzYXZlT2ZmbGluZUNhY2hlKFwibGVhZHNcIiwgdXBkYXRlZExlYWRzKTtcblxuICAgICAgLy8gQ2FsbCBBUElcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGZldGNoKFwiL2FwaS9sZWFkc1wiLCB7XG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkobmV3TGVhZClcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7IH0gXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEVkaXRcbiAgICAgIHVwZGF0ZWRMZWFkcyA9IGxlYWRzLm1hcChsID0+IHtcbiAgICAgICAgaWYgKGwuX2xpbmhhID09PSBwYXlsb2FkLl9saW5oYSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5sLFxuICAgICAgICAgICAgLi4ucGF5bG9hZCxcbiAgICAgICAgICAgIHVsdGltYUF0dWFsaXphY2FvOiBgJHt0b2RheVN0cn0gJHtub3dUaW1lU3RyfWBcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsO1xuICAgICAgfSk7XG4gICAgICBpZiAocGF5bG9hZC5zdGF0dXMgPT09IFwiVmVuZGEgRmVjaGFkYVwiIHx8IHBheWxvYWQuc3RhdHVzID09PSBcIkZyaW9cIiB8fCBwYXlsb2FkLnN0YXR1cyA9PT0gXCJMZWFkIEZyaW9cIikge1xuICAgICAgICAgdXBkYXRlZExlYWRzID0gdXBkYXRlZExlYWRzLmZpbHRlcihsID0+IGwuX2xpbmhhICE9PSBwYXlsb2FkLl9saW5oYSk7XG4gICAgICAgICBpZiAocGF5bG9hZC5zdGF0dXMgPT09IFwiVmVuZGEgRmVjaGFkYVwiKSB7XG4gICAgICAgICAgIGFsZXJ0KFwiVmVuZGEgRmVjaGFkYSEgTGVhZCBhcnF1aXZhZG8gY29tIHN1Y2Vzc28uXCIpO1xuICAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2V0TGVhZHModXBkYXRlZExlYWRzKTtcbiAgICAgIHNhdmVPZmZsaW5lQ2FjaGUoXCJsZWFkc1wiLCB1cGRhdGVkTGVhZHMpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBmZXRjaChcIi9hcGkvbGVhZHNcIiwge1xuICAgICAgICAgIG1ldGhvZDogXCJQVVRcIixcbiAgICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyAuLi5wYXlsb2FkLCB1bHRpbWFBdHVhbGl6YWNhbzogYCR7dG9kYXlTdHJ9ICR7bm93VGltZVN0cn1gIH0pXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJybyBhbyBzYWx2YXIgZWRpw6fDo28gZGUgbGVhZCBubyBzZXJ2aWRvclwiLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZmV0Y2hBbGxEYXRhKCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRGVsZXRlTGVhZCA9IGFzeW5jIChyb3dJZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgZGVsZXRlZExpbmhhTnVtID0gcGFyc2VJbnQocm93SWQsIDEwKTtcbiAgICBjb25zdCB1cGRhdGVkID0gbGVhZHNcbiAgICAgIC5maWx0ZXIobCA9PiBTdHJpbmcobC5fbGluaGEpICE9PSBTdHJpbmcocm93SWQpKVxuICAgICAgLm1hcChsID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudExpbmhhID0gdHlwZW9mIGwuX2xpbmhhID09PSAnbnVtYmVyJyA/IGwuX2xpbmhhIDogcGFyc2VJbnQoU3RyaW5nKGwuX2xpbmhhKSwgMTApO1xuICAgICAgICBpZiAoY3VycmVudExpbmhhPiBkZWxldGVkTGluaGFOdW0pIHtcbiAgICAgICAgICByZXR1cm4geyAuLi5sLCBfbGluaGE6IGN1cnJlbnRMaW5oYSAtIDEgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbDtcbiAgICAgIH0pO1xuXG4gICAgc2V0TGVhZHModXBkYXRlZCk7XG4gICAgc2F2ZU9mZmxpbmVDYWNoZShcImxlYWRzXCIsIHVwZGF0ZWQpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGZldGNoKGAvYXBpL2xlYWRzP2xpbmhhPSR7cm93SWR9YCwgeyBtZXRob2Q6IFwiREVMRVRFXCIgfSk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICBmZXRjaEFsbERhdGEoKTtcbiAgfTtcblxuICAvLyAyLiBGVFRBIGFjdGlvbnMgY2FsbGJhY2tzXG4gIGNvbnN0IGhhbmRsZVNhdmVGdHRhSXRlbSA9IGFzeW5jIChmdEl0ZW06IFBhcnRpYWw8RnR0YUl0ZW0+KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGZldGNoKFwiL2FwaS9mdHRhXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHR5cGU6IFwic2l0ZVwiLCBkYXRhOiBmdEl0ZW0gfSlcbiAgICAgIH0pO1xuICAgICAgZmV0Y2hBbGxEYXRhKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkVycm8gYW8gc2FsdmFyIGl0ZW0gRlRUQVwiLCBlKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZUZ0dGFQcm9zcEtleSA9IGFzeW5jIChwcm9zcDogT21pdDxGdHRhUHJvc3BlY2NhbywgXCJfbGluaGFcIj4pID0+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZmV0Y2goXCIvYXBpL2Z0dGFcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgdHlwZTogXCJwcm9zcGVjY2FvXCIsIGRhdGE6IHByb3NwIH0pXG4gICAgICB9KTtcbiAgICAgIGZldGNoQWxsRGF0YSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIHNhbHZhciBwcm9zcGVjw6fDo28gRlRUQVwiLCBlKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gMy4gVGFza3MgY2hlY2tsaXN0IGFjdGlvbnMgY2FsbGJhY2tzXG5cbiAgY29uc3QgaGFuZGxlQWRkVGFzayA9IGFzeW5jIChkZXNjOiBzdHJpbmcsIGRhdGFMaW1pdGU6IHN0cmluZywgbm9tZUxlYWQ6IHN0cmluZywgdmVuZGVkb3I/OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBuZXdUYXNrOiBUYXNrID0ge1xuICAgICAgaWQ6IFN0cmluZyhEYXRlLm5vdygpKSxcbiAgICAgIHZlbmRlZG9yOiB2ZW5kZWRvciB8fCBsb2dnZWRVc2VyLFxuICAgICAgZGVzY3JpY2FvOiBkZXNjLFxuICAgICAgZGF0YUxpbWl0ZTogZGF0YUxpbWl0ZSB8fCB1bmRlZmluZWQsXG4gICAgICBub21lTGVhZDogbm9tZUxlYWQgfHwgdW5kZWZpbmVkLFxuICAgICAgc3RhdHVzOiBcIlBFTkRFTlRFXCJcbiAgICB9O1xuICAgIGNvbnN0IHVwZGF0ZWQgPSBbLi4udGFza3MsIG5ld1Rhc2tdO1xuICAgIHNldFRhc2tzKHVwZGF0ZWQpO1xuICAgIHNhdmVPZmZsaW5lQ2FjaGUoXCJ0YXNrc1wiLCB1cGRhdGVkKTtcblxuICAgIC8vIENhbGwgR29vZ2xlIEFQSXMgaWYgYXV0aGVudGljYXRlZFxuICAgIHRyeSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGF3YWl0IGdldEFjY2Vzc1Rva2VuKCk7XG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgLy8gV2UgZG8gYXN5bmMgY2FsbFxuICAgICAgICBsZXQgZGF0ZVN0ciA9IGRhdGFMaW1pdGU7XG4gICAgICAgIGxldCB0aW1lU3RyID0gXCJcIjtcbiAgICAgICAgXG4gICAgICAgIC8vIGRlc2Mgc29tZXRpbWVzIGNvbnRhaW5zIFwiIMOgcyBISDptbVwiXG4gICAgICAgIGNvbnN0IHRpbWVNYXRjaCA9IGRlc2MubWF0Y2goLyDDoHMgKFxcZHsyfTpcXGR7Mn0pLyk7XG4gICAgICAgIGlmICh0aW1lTWF0Y2gpIHtcbiAgICAgICAgICB0aW1lU3RyID0gdGltZU1hdGNoWzFdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBgVGFyZWZhOiAke2Rlc2N9ICR7bm9tZUxlYWQgPyBgKExlYWQ6ICR7bm9tZUxlYWR9KWAgOiAnJ31gO1xuICAgICAgICBpZiAoZGF0ZVN0cikge1xuICAgICAgICAgIGF3YWl0IGNyZWF0ZUdvb2dsZUNhbGVuZGFyRXZlbnQodGl0bGUsIGRhdGVTdHIsIHRpbWVTdHIpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGNyZWF0ZUdvb2dsZVRhc2sodGl0bGUsIFwiQ3JpYWRhIGF1dG9tYXRpY2FtZW50ZSBwZWxvIHNpc3RlbWFcIiwgZGF0ZVN0cik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBjcmVhdGluZyBnb29nbGUgdGFzay9ldmVudFwiLCBlKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS90YXNrc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkobmV3VGFzaylcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpO1xuICAgICAgaWYgKGRhdGEud2ViaG9va1N0YXR1cyA9PT0gNDA0IHx8IGRhdGEud2ViaG9va1N0YXR1cyA9PT0gNTAwKSB7XG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcIndlYmhvb2stZXJyb3JcIikpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIGZldGNoQWxsRGF0YSgpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVRvZ2dsZVRhc2sgPSBhc3luYyAoaWQ6IHN0cmluZywgY3VycmVudFN0YXR1czogXCJQRU5ERU5URVwiIHwgXCJDT05DTFVJREFcIikgPT4ge1xuICAgIGNvbnN0IG5ld1N0YXR1czogXCJQRU5ERU5URVwiIHwgXCJDT05DTFVJREFcIiA9IGN1cnJlbnRTdGF0dXMgPT09IFwiUEVOREVOVEVcIiA/IFwiQ09OQ0xVSURBXCIgOiBcIlBFTkRFTlRFXCI7XG4gICAgY29uc3QgdXBkYXRlZDogVGFza1tdID0gdGFza3MubWFwKHQgPT4gdC5pZCA9PT0gaWQgPyB7IC4uLnQsIHN0YXR1czogbmV3U3RhdHVzIH0gOiB0KTtcbiAgICBzZXRUYXNrcyh1cGRhdGVkKTtcbiAgICBzYXZlT2ZmbGluZUNhY2hlKFwidGFza3NcIiwgdXBkYXRlZCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgZmV0Y2goXCIvYXBpL3Rhc2tzXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBVVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgaWQsIGFjdGlvbjogXCJ0b2dnbGVcIiB9KVxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICBmZXRjaEFsbERhdGEoKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVEZWxldGVUYXNrID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB1cGRhdGVkID0gdGFza3MuZmlsdGVyKHQgPT4gdC5pZCAhPT0gaWQpO1xuICAgIHNldFRhc2tzKHVwZGF0ZWQpO1xuICAgIHNhdmVPZmZsaW5lQ2FjaGUoXCJ0YXNrc1wiLCB1cGRhdGVkKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmZXRjaChgL2FwaS90YXNrcz9pZD0ke2lkfWAsIHsgbWV0aG9kOiBcIkRFTEVURVwiIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgZmV0Y2hBbGxEYXRhKCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQ2xlYXJDb21wbGV0ZWRUYXNrcyA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB1cGRhdGVkID0gdGFza3MuZmlsdGVyKHQgPT4gdC5zdGF0dXMgIT09IFwiQ09OQ0xVSURBXCIpO1xuICAgIHNldFRhc2tzKHVwZGF0ZWQpO1xuICAgIHNhdmVPZmZsaW5lQ2FjaGUoXCJ0YXNrc1wiLCB1cGRhdGVkKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBmZXRjaChgL2FwaS90YXNrcz9hY3Rpb249Y2xlYXJfY29tcGxldGVkYCwgeyBtZXRob2Q6IFwiREVMRVRFXCIgfSk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICBmZXRjaEFsbERhdGEoKTtcbiAgfTtcblxuICAvLyA0LiBBYnNlbmNlcyBzdWJtaXNzaW9uIGNhbGxiYWNrcyB3aXRoIGZpbGUgbWFwcGluZ1xuICBjb25zdCBoYW5kbGVSZWdpc3RlckFic2VuY2UgPSBhc3luYyAoXG4gICAgZGF0YUZhbHRhOiBzdHJpbmcsIFxuICAgIG1vdGl2bzogc3RyaW5nLCBcbiAgICBvYnM6IHN0cmluZywgXG4gICAgZmlsZURhdGE/OiBzdHJpbmcsIFxuICAgIGZpbGVOYW1lPzogc3RyaW5nLCBcbiAgICBtaW1lVHlwZT86IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGxldCBkcml2ZUxpbmsgPSBcIlwiO1xuXG4gICAgLy8gVXBsb2FkIHRvIEdvb2dsZSBEcml2ZSBpZiBmaWxlIGlzIHByZXNlbnRcbiAgICBpZiAoZmlsZURhdGEgJiYgZmlsZU5hbWUpIHtcbiAgICAgIGxldCB0b2tlbiA9IGF3YWl0IGdldEFjY2Vzc1Rva2VuKCk7XG4gICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgIC8vIFByb21wdCBsb2dpbiBleHBsaWNpdGx5XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ29vZ2xlU2lnbkluKCk7XG4gICAgICAgICAgdG9rZW4gPSByZXN1bHQ/LmFjY2Vzc1Rva2VuIHx8IG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJQb3AtdXAgZG8gR29vZ2xlIGJsb3F1ZWFkbyBvdSBmZWNoYWRvXCIsIGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAvLyBHb29nbGUgRHJpdmUgdXBsb2FkIG11bHRpcGFydCBmb3JtXG4gICAgICAgIGNvbnN0IGJvdW5kYXJ5ID0gJ2Zvb19iYXJfYmF6XycgKyBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBkZWxpbWl0ZXIgPSBcIlxcclxcbi0tXCIgKyBib3VuZGFyeSArIFwiXFxyXFxuXCI7XG4gICAgICAgIGNvbnN0IGNsb3NlX2RlbGltID0gXCJcXHJcXG4tLVwiICsgYm91bmRhcnkgKyBcIi0tXCI7XG5cbiAgICAgICAgLy8gQ29udmVydCBkYXRhVVJMIHRvIGJhc2U2NCBvbmx5XG4gICAgICAgIGNvbnN0IGJhc2U2NERhdGEgPSBmaWxlRGF0YS5zcGxpdCgnLCcpWzFdIHx8IGZpbGVEYXRhO1xuXG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0ge1xuICAgICAgICAgIG5hbWU6IGZpbGVOYW1lLFxuICAgICAgICAgIG1pbWVUeXBlOiBtaW1lVHlwZSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG11bHRpcGFydFJlcXVlc3RCb2R5ID1cbiAgICAgICAgICBkZWxpbWl0ZXIgK1xuICAgICAgICAgICdDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcXHJcXG5cXHJcXG4nICtcbiAgICAgICAgICBKU09OLnN0cmluZ2lmeShtZXRhZGF0YSkgK1xuICAgICAgICAgIGRlbGltaXRlciArXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZTogJyArIChtaW1lVHlwZSB8fCAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJykgKyAnXFxyXFxuJyArXG4gICAgICAgICAgJ0NvbnRlbnQtVHJhbnNmZXItRW5jb2Rpbmc6IGJhc2U2NFxcclxcblxcclxcbicgK1xuICAgICAgICAgIGJhc2U2NERhdGEgK1xuICAgICAgICAgIGNsb3NlX2RlbGltO1xuXG4gICAgICAgIGNvbnN0IHJlc3BVcGxvYWQgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vdXBsb2FkL2RyaXZlL3YzL2ZpbGVzP3VwbG9hZFR5cGU9bXVsdGlwYXJ0Jywge1xuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciAnICsgdG9rZW4sXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ211bHRpcGFydC9yZWxhdGVkOyBib3VuZGFyeT0nICsgYm91bmRhcnksXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5OiBtdWx0aXBhcnRSZXF1ZXN0Qm9keVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVzcFVwbG9hZC5vaykge1xuICAgICAgICAgICBjb25zdCBkcml2ZURhdGEgPSBhd2FpdCByZXNwVXBsb2FkLmpzb24oKTtcbiAgICAgICAgICAgLy8gT3B0aW9uYWw6IEFsc28gZmV0Y2ggdGhlIGZpbGUgdG8gZ2V0IFdlYlZpZXdMaW5rIG9yIGp1c3QgdXNlIElEXG4gICAgICAgICAgIGRyaXZlTGluayA9IFwiaHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2ZpbGUvZC9cIiArIGRyaXZlRGF0YS5pZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgY29uc29sZS53YXJuKFwiR29vZ2xlIERyaXZlIHVwbG9hZCBmYWlsZWQ6XCIsIGF3YWl0IHJlc3BVcGxvYWQudGV4dCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICB2ZW5kZWRvcjogbG9nZ2VkVXNlcixcbiAgICAgIGRhdGFGYWx0YSxcbiAgICAgIG1vdGl2byxcbiAgICAgIG9ic2VydmFjYW86IG9icyxcbiAgICAgIGZpbGVEYXRhLFxuICAgICAgZmlsZU5hbWUsXG4gICAgICBtaW1lVHlwZSxcbiAgICAgIGRyaXZlTGlua1xuICAgIH07XG5cbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL2Fic2VuY2VzXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKVxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXNwLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWxoYSBhbyByZWdpc3RyYXIgYXVzw6puY2lhIG5vIHNlcnZpZG9yLlwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgZmV0Y2hBbGxEYXRhKCk7XG5cbiAgICBpZiAoZGF0YS5lbWFpbFN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgICAgIHJldHVybiBcIkp1c3RpZmljYXRpdmEgc2FsdmEsIG1hcyBvIEUtTUFJTCBGQUxIT1U6IFwiICsgZGF0YS5lbWFpbEVycm9yO1xuICAgIH0gZWxzZSBpZiAoZGF0YS5lbWFpbFN0YXR1cyA9PT0gJ25vdF9jb25maWd1cmVkJykge1xuICAgICAgIHJldHVybiBcIkp1c3RpZmljYXRpdmEgc2FsdmEuIChFLW1haWwgU0lNVUxBRE8gYXBlbmFzIC0gQ3JlZGVuY2lhaXMgbsOjbyBjb25maWd1cmFkYXMpXCI7XG4gICAgfVxuICAgIHJldHVybiBcIuKchSBTb2xpY2l0YcOnw6NvIGVudmlhZGEhXFxuTyBlLW1haWwgZGUgbm90aWZpY2HDp8OjbyBwYXJhIGJydW5vLnF1ZWlyb3pAbWhuZXQuY29tLmJyIGZvaSBlbnZpYWRvIGNvbSBzdWNlc3NvLlwiO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVVwZGF0ZUFic2VuY2UgPSBhc3luYyAoaWQ6IHN0cmluZywgc3RhdHVzOiBzdHJpbmcpID0+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZmV0Y2goYC9hcGkvYWJzZW5jZXMvJHtpZH1gLCB7XG4gICAgICAgIG1ldGhvZDogXCJQQVRDSFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3RhdHVzIH0pXG4gICAgICB9KTtcbiAgICAgIGZldGNoQWxsRGF0YSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvIGFvIGF0dWFsaXphciBhdXPDqm5jaWFcIiwgZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIDUuIFBvcnRmb2xpbyBiYXNlIGFjdGlvbiByZWdpc3RyYXRpb24gY2FsbHNcbiAgY29uc3QgaGFuZGxlUmVnaXN0ZXJCYXNlQWN0aW9uID0gYXN5bmMgKHBheWxvYWQ6IE9taXQ8QmFzZUFjdGlvbkxvZywgXCJpZFwiIHwgXCJkYXRhQ29udGF0b1wiPikgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvYmFzZS9hY3Rpb25zXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKVxuICAgIH0pO1xuICAgIGlmICghcmVzcC5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJybyBkZSBjb211bmljYcOnw6NvIGFvIHJlZ2lzdHJhciBsb2cgZGUgYXRlbmRpbWVudG8gY29tZXJjaWFsLlwiKTtcbiAgICB9XG4gICAgZmV0Y2hBbGxEYXRhKCk7XG4gIH07XG5cbiAgLy8gNS41LiBDb2JyYW5jYXMgbW9kdWxlIGFjdGlvbiBjYWxsYmFjayBkZWNsYXJhdGlvbnNcbiAgY29uc3QgaGFuZGxlVXBkYXRlQ29icmFuY2EgPSBhc3luYyAodXBkYXRlZDogQ29icmFuY2EpID0+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL2NvYnJhbmNhc1wiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkodXBkYXRlZClcbiAgICB9KTtcbiAgICBpZiAoIXJlc3Aub2spIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm8gYW8gc2FsdmFyIGNvYnJhbsOnYSBubyBzZXJ2aWRvclwiKTtcbiAgICB9XG4gICAgZmV0Y2hBbGxEYXRhKCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlUmVnaXN0ZXJDb2JyYW5jYUxvZyA9IGFzeW5jIChpZENvbnRyYXRvOiBzdHJpbmcsIGxvZzogT21pdDxDb2JyYW5jYUxvZywgXCJkYXRhTG9nXCIgfCBcIm9wZXJhZG9yXCI+KSA9PiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAvYXBpL2NvYnJhbmNhcy9sb2dgLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBpZENvbnRyYXRvLCBvcGVyYWRvcjogbG9nZ2VkVXNlciwgLi4ubG9nIH0pXG4gICAgfSk7XG4gICAgaWYgKCFyZXNwLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvIGFvIHJlZ2lzdHJhciBsb2cgZGUgY29icmFuw6dhXCIpO1xuICAgIH1cbiAgICBmZXRjaEFsbERhdGEoKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVHZW5lcmF0ZUlBQ29icmFuY2FQaXRjaCA9IGFzeW5jIChjbGllbnQ6IENvYnJhbmNhKSA9PiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9nZW1pbmkvZ2VuZXJhdGVDb2JyYW5jYU1lc3NhZ2VcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY2xpZW50IH0pXG4gICAgfSk7XG4gICAgaWYgKCFyZXNwLm9rKSB0aHJvdyBuZXcgRXJyb3IoXCJGYWxoYSBhbyBnZXJhciBjb2JyYW7Dp2EgZGUgSUFcIik7XG4gICAgY29uc3QgZCA9IGF3YWl0IHJlc3AuanNvbigpO1xuICAgIHJldHVybiBkLnRleHQ7XG4gIH07XG5cbiAgLy8gNi4gVmVuZG9ycyBhbmQgaW5kaXZpZHVhbCBnb2FscyBtYW5hZ2VtZW50IGhhbmRsZXJzXG4gIGNvbnN0IGhhbmRsZVJlZ2lzdGVyVmVuZG9yID0gYXN5bmMgKG5vbWU6IHN0cmluZywgbWV0YTogbnVtYmVyLCB0ZWxlZm9uZT86IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvdmVuZG9yc1wiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBub21lLCBtZXRhLCB0ZWxlZm9uZSB9KVxuICAgIH0pO1xuICAgIGlmICghcmVzcC5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFsaGEgYW8gY2FkYXN0cmFyIHZlbmRlZG9yIG5vIHNlcnZpZG9yLlwiKTtcbiAgICB9XG4gICAgLy8gVXBkYXRlIGxvY2FsIGxpc3RzIGFuZCB0cmlnZ2VyIHJlLXN5bmNcbiAgICBjb25zdCByZXNWZW5kb3JzID0gYXdhaXQgZmV0Y2goXCIvYXBpL3ZlbmRvcnNcIik7XG4gICAgaWYgKHJlc1ZlbmRvcnMub2spIHtcbiAgICAgIGNvbnN0IGQgPSBhd2FpdCByZXNWZW5kb3JzLmpzb24oKTtcbiAgICAgIGlmIChkICYmIGQudmVuZG9ycykge1xuICAgICAgICBzZXRSZWdpc3RlcmVkVmVuZG9ycyhkLnZlbmRvcnMpO1xuICAgICAgICBzZXRBdmFpbGFibGVWZW5kb3JzKGQudmVuZG9ycy5tYXAoKHY6IGFueSkgPT4gdi5ub21lKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVVwZGF0ZVZlbmRvciA9IGFzeW5jICh2ZW5kb3I6IFZlbmRvcikgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvdmVuZG9yc1wiLCB7XG4gICAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh2ZW5kb3IpXG4gICAgfSk7XG4gICAgaWYgKCFyZXNwLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWxoYSBhbyBhdHVhbGl6YXIgdmVuZGVkb3Igbm8gc2Vydmlkb3IuXCIpO1xuICAgIH1cbiAgICAvLyBVcGRhdGUgbG9jYWwgbGlzdHMgYW5kIHRyaWdnZXIgcmUtc3luY1xuICAgIGNvbnN0IHJlc1ZlbmRvcnMgPSBhd2FpdCBmZXRjaChcIi9hcGkvdmVuZG9yc1wiKTtcbiAgICBpZiAocmVzVmVuZG9ycy5vaykge1xuICAgICAgY29uc3QgZCA9IGF3YWl0IHJlc1ZlbmRvcnMuanNvbigpO1xuICAgICAgaWYgKGQgJiYgZC52ZW5kb3JzKSB7XG4gICAgICAgIHNldFJlZ2lzdGVyZWRWZW5kb3JzKGQudmVuZG9ycyk7XG4gICAgICAgIHNldEF2YWlsYWJsZVZlbmRvcnMoZC52ZW5kb3JzLm1hcCgodjogYW55KSA9PiB2Lm5vbWUpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRGVsZXRlVmVuZG9yID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goYC9hcGkvdmVuZG9ycz9pZD0ke2VuY29kZVVSSUNvbXBvbmVudChpZCl9YCwge1xuICAgICAgbWV0aG9kOiBcIkRFTEVURVwiXG4gICAgfSk7XG4gICAgaWYgKCFyZXNwLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWxoYSBhbyBleGNsdWlyIHZlbmRlZG9yIG5vIHNlcnZpZG9yLlwiKTtcbiAgICB9XG4gICAgLy8gVXBkYXRlIGxvY2FsIGxpc3RzIGFuZCB0cmlnZ2VyIHJlLXN5bmNcbiAgICBjb25zdCByZXNWZW5kb3JzID0gYXdhaXQgZmV0Y2goXCIvYXBpL3ZlbmRvcnNcIik7XG4gICAgaWYgKHJlc1ZlbmRvcnMub2spIHtcbiAgICAgIGNvbnN0IGQgPSBhd2FpdCByZXNWZW5kb3JzLmpzb24oKTtcbiAgICAgIGlmIChkICYmIGQudmVuZG9ycykge1xuICAgICAgICBzZXRSZWdpc3RlcmVkVmVuZG9ycyhkLnZlbmRvcnMpO1xuICAgICAgICBzZXRBdmFpbGFibGVWZW5kb3JzKGQudmVuZG9ycy5tYXAoKHY6IGFueSkgPT4gdi5ub21lKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUJ1bGtUcmFuc2ZlckxlYWRzID0gYXN5bmMgKGZyb21TZWxsZXI6IHN0cmluZywgdG9TZWxsZXI6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvbGVhZHMvYnVsay10cmFuc2ZlclwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBmcm9tU2VsbGVyLCB0b1NlbGxlciB9KVxuICAgIH0pO1xuICAgIGlmICghcmVzcC5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFsaGEgYW8gcmVhbGl6YXIgdHJhbnNmZXLDqm5jaWEgZGUgbGVhZHMgbm8gc2Vydmlkb3IuXCIpO1xuICAgIH1cbiAgICBjb25zdCBkID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgXG4gICAgLy8gUmVmcmVzaCBhbGwgZGF0YSBsb2NhbGx5IHRvIGVuc3VyZSBzdGF0ZSB1cGRhdGVzIGFjcm9zcyBhbGwgcGFnZXNcbiAgICBhd2FpdCBmZXRjaEFsbERhdGEoKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgbGVhZHNUcmFuc2ZlcnJlZDogZC5kZXRhaWxzPy5sZWFkc1RyYW5zZmVycmVkIHx8IDAsXG4gICAgICB0YXNrc1RyYW5zZmVycmVkOiBkLmRldGFpbHM/LnRhc2tzVHJhbnNmZXJyZWQgfHwgMCxcbiAgICAgIG1lc3NhZ2U6IGQubWVzc2FnZSB8fCBcIlRyYW5zZmVyw6puY2lhIGNvbmNsdcOtZGFcIlxuICAgIH07XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZUNvbXBldGl0b3IgPSBhc3luYyAoY29tcDogQ29tcGV0aXRvcikgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvY29tcGV0aXRvcnNcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNvbXApXG4gICAgfSk7XG4gICAgaWYgKHJlc3Aub2spIHtcbiAgICAgIGNvbnN0IGQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgIHNldENvbXBldGl0b3JzKGQuY29tcGV0aXRvcnMgfHwgW10pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvIGFvIHNhbHZhciBjb25jb3JyZW50ZSBubyBzZXJ2aWRvci5cIik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZURlbGV0ZUNvbXBldGl0b3IgPSBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChgL2FwaS9jb21wZXRpdG9ycy8ke2lkfWAsIHtcbiAgICAgIG1ldGhvZDogXCJERUxFVEVcIlxuICAgIH0pO1xuICAgIGlmIChyZXNwLm9rKSB7XG4gICAgICBjb25zdCBkID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICBzZXRDb21wZXRpdG9ycyhkLmNvbXBldGl0b3JzIHx8IFtdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJybyBhbyBleGNsdWlyIGNvbmNvcnJlbnRlIGRvIHNlcnZpZG9yLlwiKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZUluc3RhbGxhdGlvbiA9IGFzeW5jIChpbnN0OiBJbnN0YWxsYXRpb24pID0+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL2luc3RhbGxhdGlvbnNcIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGluc3QpXG4gICAgfSk7XG4gICAgaWYgKHJlc3Aub2spIHtcbiAgICAgIGNvbnN0IGQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgIHNldEluc3RhbGxhdGlvbnMoZC5pbnN0YWxsYXRpb25zIHx8IFtdKTtcbiAgICAgIGlmIChkLndlYmhvb2tTdGF0dXMgPT09IDQwNCB8fCBkLndlYmhvb2tTdGF0dXMgPT09IDUwMCkge1xuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJ3ZWJob29rLWVycm9yXCIpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IFwiRXJybyBkZXNjb25oZWNpZG9cIjtcbiAgICAgIHRyeSB7IFxuICAgICAgICBjb25zdCBkID0gYXdhaXQgcmVzcC5qc29uKCk7IFxuICAgICAgICBlcnJvck1lc3NhZ2UgPSBkLm1lc3NhZ2UgfHwgZXJyb3JNZXNzYWdlOyBcbiAgICAgIH0gY2F0Y2ggKGUpIHsgXG4gICAgICAgIGVycm9yTWVzc2FnZSA9IGBFcnJvIGRvIHNlcnZpZG9yICgke3Jlc3Auc3RhdHVzfSlgOyBcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVEZWxldGVJbnN0YWxsYXRpb24gPSBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChgL2FwaS9pbnN0YWxsYXRpb25zLyR7aWR9YCwge1xuICAgICAgbWV0aG9kOiBcIkRFTEVURVwiXG4gICAgfSk7XG4gICAgaWYgKHJlc3Aub2spIHtcbiAgICAgIGNvbnN0IGQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgIHNldEluc3RhbGxhdGlvbnMoZC5pbnN0YWxsYXRpb25zIHx8IFtdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJybyBhbyBleGNsdWlyIGFnZW5kYW1lbnRvIGRlIGluc3RhbGHDp8Ojby5cIik7XG4gICAgfVxuICB9O1xuXG4gIC8vIDYuIERlZXAgc2FsZXMgR2VtaW5pIEFJIGludGVncmF0aW9ucyBjYWxsYmFja3M6XG4gIGNvbnN0IGhhbmRsZUdlbmVyYXRlSUFQaXRjaCA9IGFzeW5jIChjbGllbnQ6IEJhc2VDbGllbnQpID0+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL2dlbWluaS9nZW5lcmF0ZVBpdGNoXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGNsaWVudCB9KVxuICAgIH0pO1xuICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKFwiRmFsaGEgYW8gZ2VyYXIgYWJvcmRhZ2VtXCIpO1xuICAgIGNvbnN0IGQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICByZXR1cm4gZC50ZXh0O1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUNvbWJhdE9iamVjdGlvbiA9IGFzeW5jIChvYmplY3Rpb246IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcIi9hcGkvZ2VtaW5pL2NvbWJhdE9iamVjdGlvblwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBvYmplY3Rpb24gfSlcbiAgICB9KTtcbiAgICBpZiAoIXJlc3Aub2spIHRocm93IG5ldyBFcnJvcihcIkVycm9cIik7XG4gICAgY29uc3QgZCA9IGF3YWl0IHJlc3AuanNvbigpO1xuICAgIHJldHVybiBkLnRleHQ7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQW5hbHl6ZUNvbXBldGl0b3IgPSBhc3luYyAobmFtZTogc3RyaW5nLCBxdWVzdGlvbjogc3RyaW5nLCBtaG5ldFZhbnRhZ2VtOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXCIvYXBpL2dlbWluaS9hbmFseXplQ29tcGV0aXRvclwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBuYW1lLCBxdWVzdGlvbiwgbWhuZXRWYW50YWdlbSB9KVxuICAgIH0pO1xuICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKFwiRXJyb1wiKTtcbiAgICBjb25zdCBkID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgcmV0dXJuIGQudGV4dDtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVTZW5kQ2hhdE1lc3NhZ2UgPSBhc3luYyAobXNnOiBzdHJpbmcsIGhpc3Rvcnk6IGFueVtdKSA9PiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9nZW1pbmkvY2hhdFwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBtc2csIGhpc3RvcnkgfSlcbiAgICB9KTtcbiAgICBpZiAoIXJlc3Aub2spIHRocm93IG5ldyBFcnJvcihcIkVycm9cIik7XG4gICAgY29uc3QgZCA9IGF3YWl0IHJlc3AuanNvbigpO1xuICAgIHJldHVybiBkLnRleHQ7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlR2VuZXJhdGVBSU9icyA9IGFzeW5jIChub21lOiBzdHJpbmcsIGJhaXJybzogc3RyaW5nLCBwbGFubzogc3RyaW5nLCB2YWxvcjogc3RyaW5nLCBwcm92ZWRvcjogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKFwiL2FwaS9nZW1pbmkvY29tYmF0T2JqZWN0aW9uXCIsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IFxuICAgICAgICBvYmplY3Rpb246IGBHZXJlIHVtIHLDoXBpZG8gcmVzdW1vIGRlIHBlcmZpbCBlIGFib3JkYWdlbSBwYXJhIG8gbGVhZDogTm9tZSAke25vbWV9LCByZXNpZGUgbm8gYmFpcnJvICR7YmFpcnJvfSwgYXR1YWxtZW50ZSB1c2EgbyBwcm92ZWRvciAke3Byb3ZlZG9yfSBubyBwbGFubyAke3BsYW5vfSBwYWdhbmRvIFIkICR7dmFsb3J9LiBEaWdhIDIgZnJhc2VzIHBlcnN1YXNpdmFzIGN1cnRhcyBkZXN0YWNhbmRvIGEgZmlicmEgw7NwdGljYSBwcsOzcHJpYSBkZSBMYWplYWRvIE1ITkVULmAgXG4gICAgICB9KVxuICAgIH0pO1xuICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKFwiRXJyb1wiKTtcbiAgICBjb25zdCBkID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgcmV0dXJuIGQudGV4dDtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVGZXRjaEJhc2VMb2NhbCA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgckJhc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvYmFzZVwiKTtcbiAgICAgIGlmIChyQmFzZS5vaykge1xuICAgICAgICBjb25zdCBkID0gYXdhaXQgckJhc2UuanNvbigpO1xuICAgICAgICBzZXRCYXNlQ2xpZW50cyhkLmNsaWVudHMgfHwgW10pO1xuICAgICAgICBzZXRCYXNlQWN0aW9ucyhkLmFjdGlvbnMgfHwgW10pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU3luY0Jhc2UgPSBhc3luYyAoKSA9PiB7XG4gICAgc2V0SXNTeW5jaW5nKHRydWUpO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvYXBpL2Jhc2Uvc3luY1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCJcbiAgICAgIH0pO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWxoYSBhbyBzZSBjb211bmljYXIgY29tIG8gc2Vydmlkb3IgZGEgcGxhbmlsaGEuXCIpO1xuICAgICAgfVxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGlmIChkYXRhLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpIHtcbiAgICAgICAgLy8gRmV0Y2ggYWxsIHVwZGF0ZWQgZGF0YVxuICAgICAgICBjb25zdCByQmFzZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9iYXNlXCIpO1xuICAgICAgICBpZiAockJhc2Uub2spIHtcbiAgICAgICAgICBjb25zdCBkID0gYXdhaXQgckJhc2UuanNvbigpO1xuICAgICAgICAgIHNldEJhc2VDbGllbnRzKGQuY2xpZW50cyB8fCBbXSk7XG4gICAgICAgICAgc2V0QmFzZUFjdGlvbnMoZC5hY3Rpb25zIHx8IFtdKTtcbiAgICAgICAgfVxuICAgICAgICBhbGVydChgU3VjZXNzbyEgJHtkYXRhLmNvdW50fSBjbGllbnRlcyBpbXBvcnRhZG9zIGRpcmV0YW1lbnRlIGRhIGFiYSBCYXNlMDUyMDI2LmApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEubWVzc2FnZSB8fCBcIkVycm8gZGVzY29uaGVjaWRvIGR1cmFudGUgbyBzeW5jLlwiKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgYWxlcnQoXCJFcnJvIGFvIHNpbmNyb25pemFyIGJhc2U6IFwiICsgZS5tZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0SXNTeW5jaW5nKGZhbHNlKTtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVTeW5jTGVhZHMgPSBhc3luYyAoKSA9PiB7XG4gICAgc2V0SXNTeW5jaW5nKHRydWUpO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvYXBpL2xlYWRzL3N5bmNcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiXG4gICAgICB9KTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFsaGEgYW8gc2UgY29tdW5pY2FyIGNvbSBvIHNlcnZpZG9yIGRhIHBsYW5pbGhhLlwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICBpZiAoZGF0YS5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKSB7XG4gICAgICAgIC8vIEZldGNoIGFsbCB1cGRhdGVkIGRhdGFcbiAgICAgICAgY29uc3QgckxlYWRzID0gYXdhaXQgZmV0Y2goXCIvYXBpL2xlYWRzXCIpO1xuICAgICAgICBpZiAockxlYWRzLm9rKSB7XG4gICAgICAgICAgY29uc3QgZCA9IGF3YWl0IHJMZWFkcy5qc29uKCk7XG4gICAgICAgICAgLy8gU2FmZSBmYWxsYmFjayBmb3IgYm90aCAuZGF0YSBvciAubGVhZHMgZm9ybWF0c1xuICAgICAgICAgIHNldExlYWRzKGQuZGF0YSB8fCBkLmxlYWRzIHx8IFtdKTtcbiAgICAgICAgfVxuICAgICAgICBhbGVydChgU3VjZXNzbyEgJHtkYXRhLmNvdW50fSBsZWFkcyBpbXBvcnRhZG9zIGRpcmV0YW1lbnRlIGRhIGFiYSBBY29tcGFuaGFtZW50byBkZSBMZWFkIHwgQWJvcmRhZ2Vucy5gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLm1lc3NhZ2UgfHwgXCJFcnJvIGRlc2NvbmhlY2lkbyBkdXJhbnRlIG8gZGUgc3luYyBkb3MgbGVhZHMuXCIpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICBhbGVydChcIkVycm8gYW8gc2luY3Jvbml6YXIgbGVhZHM6IFwiICsgZS5tZXNzYWdlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0SXNTeW5jaW5nKGZhbHNlKTtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVTeW5jRnR0YSA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRJc1N5bmNpbmcodHJ1ZSk7XG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvZnR0YS9zeW5jXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIlxuICAgICAgfSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhbGhhIGFvIHNlIGNvbXVuaWNhciBjb20gbyBzZXJ2aWRvciBkYSBwbGFuaWxoYS5cIik7XG4gICAgICB9XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgaWYgKGRhdGEuc3RhdHVzID09PSBcInN1Y2Nlc3NcIikge1xuICAgICAgICAvLyBGZXRjaCBhbGwgdXBkYXRlZCBmdHRhIGRhdGFcbiAgICAgICAgY29uc3QgckZ0dGEgPSBhd2FpdCBmZXRjaChcIi9hcGkvZnR0YVwiKTtcbiAgICAgICAgaWYgKHJGdHRhLm9rKSB7XG4gICAgICAgICAgY29uc3QgZCA9IGF3YWl0IHJGdHRhLmpzb24oKTtcbiAgICAgICAgICBzZXRGdHRhSXRlbXMoZC5zaXRlcyB8fCBbXSk7XG4gICAgICAgICAgc2V0RnR0YVByb3NwcyhkLnByb3NwZWNjb2VzIHx8IFtdKTtcbiAgICAgICAgfVxuICAgICAgICBhbGVydChgU3VjZXNzbyEgJHtkYXRhLnNpdGVzQ291bnR9IGVkaWbDrWNpb3MgZSAke2RhdGEucHJvc3BlY2NvZXNDb3VudH0gcHJvc3BlY8Onw7VlcyBkZSBGVFRBIGltcG9ydGFkb3MgZGlyZXRhbWVudGUgZGFzIHBsYW5pbGhhcyAoXCJGVFRBIExBSkVBRE9cIiwgXCJGVFRBIEVTVFJFTEFcIiBlIFwiRlRUQSBQUk9TUEVDw4fDg09cIikuYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlIHx8IFwiRXJybyBkZXNjb25oZWNpZG8gZHVyYW50ZSBvIGRlIHN5bmMgZG8gRlRUQS5cIik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIGFsZXJ0KFwiRXJybyBhbyBzaW5jcm9uaXphciBGVFRBOiBcIiArIGUubWVzc2FnZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldElzU3luY2luZyhmYWxzZSk7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU3luY0luc3RhbGxhdGlvbnMgPSBhc3luYyAoKSA9PiB7XG4gICAgc2V0SXNTeW5jaW5nKHRydWUpO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvYXBpL2luc3RhbGxhdGlvbnMvc3luY1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCJcbiAgICAgIH0pO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWxoYSBhbyBzZSBjb211bmljYXIgY29tIG8gc2Vydmlkb3IgZGEgcGxhbmlsaGEuXCIpO1xuICAgICAgfVxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGlmIChkYXRhLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpIHtcbiAgICAgICAgY29uc3Qgckluc3QgPSBhd2FpdCBmZXRjaChcIi9hcGkvaW5zdGFsbGF0aW9uc1wiKTtcbiAgICAgICAgaWYgKHJJbnN0Lm9rKSB7XG4gICAgICAgICAgY29uc3QgZCA9IGF3YWl0IHJJbnN0Lmpzb24oKTtcbiAgICAgICAgICBzZXRJbnN0YWxsYXRpb25zKGQuaW5zdGFsbGF0aW9ucyB8fCBbXSk7XG4gICAgICAgIH1cbiAgICAgICAgYWxlcnQoYFN1Y2Vzc28hICR7ZGF0YS5jb3VudH0gYWdlbmRhbWVudG9zIGltcG9ydGFkb3MgZGlyZXRhbWVudGUgZGEgYWJhIEFnZW5kYSBJbnN0YWxhw6fDo28uYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5tZXNzYWdlIHx8IFwiRXJybyBkZXNjb25oZWNpZG8gZHVyYW50ZSBvIHN5bmMgZGEgYWdlbmRhIGRlIGluc3RhbGHDp8Ojby5cIik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIGFsZXJ0KFwiRXJybyBhbyBzaW5jcm9uaXphciBhZ2VuZGEgZGUgaW5zdGFsYcOnw6NvOiBcIiArIGUubWVzc2FnZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldElzU3luY2luZyhmYWxzZSk7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUkVOREVSIEZMT1cgRk9SIEVYVCBQQVJUTkVSOiBOTyBMT0dJTiBORUVERURcbiAgaWYgKGlzRXh0ZXJuYWxQYXJ0bmVyTW9kZSkge1xuICAgIHJldHVybiAoXG4gICAgICA8RXh0ZXJuYWxTdG9yZVBvcnRhbFxuICAgICAgICBpbnN0YWxsYXRpb25zPXtpbnN0YWxsYXRpb25zfVxuICAgICAgICB2ZW5kb3JzPXthdmFpbGFibGVWZW5kb3JzfVxuICAgICAgICBvblNhdmVJbnN0YWxsYXRpb249e2hhbmRsZVNhdmVJbnN0YWxsYXRpb259XG4gICAgICAgIG9uRGVsZXRlSW5zdGFsbGF0aW9uPXtoYW5kbGVEZWxldGVJbnN0YWxsYXRpb259IC8+XG4gICAgKTtcbiAgfVxuXG4gIC8vIFJFTkRFUiBGTE9XOiBMT0dJTiBQT1JUQUwgU0NSRUVOIElGIE5PVCBMT0dHRURcbiAgLy8gUkVOREVSIEZMT1c6IExPR0lOIFBPUlRBTCBTQ1JFRU4gSUYgTk9UIExPR0dFRCBPUiBEVVJJTkcgQU5JTUFUSU9OXG4gIGlmIChpc0xvZ2dpbmdJbkFuaW0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctc2xhdGUtOTUwIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGZvbnQtc2FucyBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS0xMDAgcC02IHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICB7LyogQmFja2dyb3VuZCBkZWNvcmF0aXZlIGJsdXJyeSBjaXJjbGVzICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC1bLTIwJV0gcmlnaHQtWy0xMCVdIHctWzUwMHB4XSBoLVs1MDBweF0gYmctc2t5LTUwMC8xNSByb3VuZGVkLWZ1bGwgYmx1ci1bMTMwcHhdIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGJvdHRvbS1bLTIwJV0gbGVmdC1bLTEwJV0gdy1bNTAwcHhdIGgtWzUwMHB4XSBiZy1za3ktNTAwLzE1IHJvdW5kZWQtZnVsbCBibHVyLVsxMzBweF0gcG9pbnRlci1ldmVudHMtbm9uZVwiIC8+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy1tZCB3LWZ1bGwgdGV4dC1jZW50ZXIgc3BhY2UteS04IHotMTAgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSB3LTI4IGgtMjggbXgtYXV0byBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgey8qIFNwaW5uaW5nIGdyYWRpZW50IGJvcmRlciAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMCByb3VuZGVkLWZ1bGwgYm9yZGVyLTQgYm9yZGVyLXNsYXRlLTkwMCBib3JkZXItdC1za3ktNDAwIGJvcmRlci1yLXNreS01MDAgYW5pbWF0ZS1zcGluXCIgc3R5bGU9e3sgYW5pbWF0aW9uRHVyYXRpb246IFwiMXNcIiB9fSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0yIHJvdW5kZWQtZnVsbCBib3JkZXItMiBib3JkZXItc2xhdGUtOTAwIGJvcmRlci1iLXNreS0zMDAgYm9yZGVyLWwtYmx1ZS01MDAgYW5pbWF0ZS1zcGluXCIgc3R5bGU9e3sgYW5pbWF0aW9uRHVyYXRpb246IFwiMC42c1wiLCBhbmltYXRpb25EaXJlY3Rpb246IFwicmV2ZXJzZVwiIH19IC8+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNiBoLTE2IGJnLXNsYXRlLTkwMCBib3JkZXIgYm9yZGVyLXNsYXRlLTgwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgc2hhZG93LTJ4bFwiPlxuICAgICAgICAgICAgICA8U3BhcmtsZXMgY2xhc3NOYW1lPVwidy04IGgtOCB0ZXh0LXNreS00MDAgYW5pbWF0ZS1wdWxzZVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0zXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJsYWNrIHVwcGVyY2FzZSB0ZXh0LXdoaXRlIHRyYWNraW5nLXdpZGVzdFwiPkFjZXNzYW5kbyBNSE5FVDwvaDI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtWzJweF0gdy0yNCBiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTUwMCB0by1za3ktNDAwIG14LWF1dG8gcm91bmRlZC1mdWxsXCIgLz5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC1za3ktNDAwIGZvbnQtZXh0cmFib2xkIHRyYWNraW5nLXdpZGVzdCBtdC0xIHVwcGVyY2FzZVwiPlxuICAgICAgICAgICAgICBJbmljaWFuZG8gU2Vzc8OjbyBTZWd1cmFcbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHsvKiBQcm9ncmVzcyBiYXIgY29udGFpbmVyICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGJnLXNsYXRlLTkwMCBib3JkZXIgYm9yZGVyLXNsYXRlLTgwMCByb3VuZGVkLWZ1bGwgaC0zIHAtMC41IG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctaW5uZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXNreS01MDAgdmlhLXNreS00NTAgdG8tZW1lcmFsZC00MDAgaC1mdWxsIHJvdW5kZWQtZnVsbFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBrZXk9e2xvZ2luU3RhZ2VUZXh0fSBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYmxhY2sgdHJhY2tpbmctd2lkZSB0ZXh0LXNsYXRlLTEwMCBiZy1zbGF0ZS05MDAvODAgYm9yZGVyIGJvcmRlci1zbGF0ZS04MDAgcm91bmRlZC0yeGwgcHktMyBweC01IGlubGluZS1ibG9jayBteC1hdXRvIHNoYWRvdy0yeGwgYmFja2Ryb3AtYmx1clwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2xvZ2luU3RhZ2VUZXh0fVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBpZiAoIWxvZ2dlZFVzZXIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctc2xhdGUtOTUwIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuIGZvbnQtc2FucyBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1zbGF0ZS0xMDAgcC02IHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICBcbiAgICAgICAgey8qIEJhY2tncm91bmQgZGVjb3JhdGl2ZSBibHVycnkgY2lyY2xlcyAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtWy0xMCVdIHJpZ2h0LVstMTAlXSB3LVs0NTBweF0gaC1bNDUwcHhdIGJnLXNreS04NTAvMTUgcm91bmRlZC1mdWxsIGJsdXItWzExMHB4XSBwb2ludGVyLWV2ZW50cy1ub25lXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBib3R0b20tWy0xMCVdIGxlZnQtWy0xMCVdIHctWzQ1MHB4XSBoLVs0NTBweF0gYmctc2t5LTk1MC8xNSByb3VuZGVkLWZ1bGwgYmx1ci1bMTEwcHhdIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuXG4gICAgICAgIHsvKiBUb3AgdGl0bGUgaW5mbyBsb2dvICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNCB0ZXh0LWNlbnRlciBtdC0xMiB6LTEwXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNiBoLTE2IGJnLWdyYWRpZW50LXRvLXRyIGZyb20tc2t5LTYwMCB0by1za3ktNjAwIHRleHQtd2hpdGUgcm91bmRlZC0zeGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbXgtYXV0byBzaGFkb3cteGwgYm9yZGVyIGJvcmRlci1za3ktNTAwLzM1XCI+XG4gICAgICAgICAgICA8V2lmaSBjbGFzc05hbWU9XCJ3LTkgaC05IHN0cm9rZS1bMi41XVwiIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRyYWNraW5nLXRpZ2h0IHRleHQtd2hpdGUgdXBwZXJjYXNlXCI+TUhORVQ8L2gxPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXNreS00NTAgZm9udC1leHRyYWJvbGQgdHJhY2tpbmctd2lkZXN0IHVwcGVyY2FzZSBtdC0wLjVcIj5HZXN0b3IgZGUgVmVuZGFzIEV4dGVybmFzPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7LyogTG9naW4gZm9ybSBib3ggKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIG1heC13LXNtIG14LWF1dG8gYmctc2xhdGUtOTAwLzYwIGJvcmRlciBib3JkZXItc2xhdGUtODAwIHJvdW5kZWQtM3hsIHAtNiBzcGFjZS15LTQgc2hhZG93LTJ4bCBiYWNrZHJvcC1ibHVyLW1kIHotMTVcIlxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTEuNSB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ibGFjayB1cHBlcmNhc2UgdGV4dC1zbGF0ZS0zMDUgdHJhY2tpbmctd2lkZXIgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTEuNSBwbC0wLjVcIj5cbiAgICAgICAgICAgICAgPExvY2sgY2xhc3NOYW1lPVwidy00IGgtNCB0ZXh0LXNreS00MDBcIiAvPiBBY2Vzc28gU2VndXJvXG4gICAgICAgICAgICA8L2gyPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC1zbGF0ZS0zNTAgbGVhZGluZy1ub3JtYWwgZm9udC1ib2xkIHB4LTRcIj5cbiAgICAgICAgICAgICAgRmHDp2EgbG9naW4gaW5mb3JtYW5kbyBzZXUgbm9tZSBkZSBjb25zdWx0b3Igb3UgYWRtaW5pc3RyYWRvciBwYXJhIGFjZXNzYXIgbyBwb3J0YWwgZGUgY29udHJvbGUuXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlTG9naW59IGNsYXNzTmFtZT1cInNwYWNlLXktNCBmb250LXNhbnMgcmVsYXRpdmUgcHQtMlwiPlxuICAgICAgICAgICAge2xvZ2luRXJyb3IgJiYgKFxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSB0ZXh0LXJvc2UtNDUwIGZvbnQtYmxhY2sgdXBwZXJjYXNlIHRleHQtY2VudGVyXCI+e2xvZ2luRXJyb3J9PC9wPlxuICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtsb2dpblRlcm19XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldExvZ2luVGVybShlLnRhcmdldC52YWx1ZSl9IGNsYXNzTmFtZT1cInctZnVsbCBiZy1zbGF0ZS04MDAvNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS03MDAgcm91bmRlZC14bCBweC00IHB5LTMgdGV4dC1zbSB0ZXh0LXdoaXRlIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1za3ktNTAwIHRyYW5zaXRpb24gZm9udC1tZWRpdW0gYXBwZWFyYW5jZS1ub25lXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCIgZGlzYWJsZWQgY2xhc3NOYW1lPVwiYmctc2t5LTkwMCB0ZXh0LXNsYXRlLTMwMFwiPlNlbGVjaW9uZSBzZXUgbm9tZS4uLjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAge3JlZ2lzdGVyZWRWZW5kb3JzLm1hcCgodmVuZG9yLCBpZHgpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e3ZlbmRvci5pZCB8fCBpZHh9IHZhbHVlPXt2ZW5kb3Iubm9tZX0gY2xhc3NOYW1lPVwiYmctc2t5LTkwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHt2ZW5kb3Iubm9tZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBvaW50ZXItZXZlbnRzLW5vbmUgYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgZmxleCBpdGVtcy1jZW50ZXIgcHgtNCB0ZXh0LXNsYXRlLTQwMFwiPlxuICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJoLTQgdy00IGZpbGwtY3VycmVudFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCI+PHBhdGggZD1cIk05LjI5MyAxMi45NWwuNzA3LjcwN0wxNS42NTcgOGwtMS40MTQtMS40MTRMMTAgMTAuODI4IDUuNzU3IDYuNTg2IDQuMzQzIDh6XCIvPjwvc3ZnPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMy41IGJnLXNreS02MDAgaG92ZXI6Ymctc2t5LTUwMCB0ZXh0LXdoaXRlIHJvdW5kZWQteGwgdGV4dC14cyBmb250LWJsYWNrIHRyYWNraW5nLXdpZGVyIHVwcGVyY2FzZSBzaGFkb3ctbGcgc2hhZG93LXNreS05MDAvNDAgYWN0aXZlOnNjYWxlLTk3IGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gZHVyYXRpb24tMTUwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgRW50cmFyIG5vIFNpc3RlbWFcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmVycmVkUHJvbXB0KSB7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZFByb21wdC5wcm9tcHQoKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHsgb3V0Y29tZSB9ID0gYXdhaXQgZGVmZXJyZWRQcm9tcHQudXNlckNob2ljZTtcbiAgICAgICAgICAgICAgICAgIGlmIChvdXRjb21lID09PSAnYWNjZXB0ZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldERlZmVycmVkUHJvbXB0KG51bGwpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzZXRTaG93UFdBSW5zdHJ1Y3Rpb25zKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB5LTIuNSBib3JkZXIgYm9yZGVyLXNsYXRlLTgwMCBob3ZlcjpiZy1zbGF0ZS05MDAvNjAgdGV4dC1zbGF0ZS0zMDAgcm91bmRlZC14bCB0ZXh0LVsxMHB4XSBmb250LWV4dHJhYm9sZCB1cHBlcmNhc2UgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMS41XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPERvd25sb2FkIGNsYXNzTmFtZT1cInctNCBoLTQgdGV4dC1za3ktNDAwXCIgLz4gSW5zdGFsYXIgQXBwXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgICBcblxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBGb290ZXIgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgdGV4dC1bMTBweF0gdGV4dC1zbGF0ZS01MDAgZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3QgbGVhZGluZy1ub25lIG1iLTQgei0xMFwiXG4gICAgICAgID5cbiAgICAgICAgICBNSE5FVCBWQUxFIERPIFRBUVVBUkkgwrcgTEFKRUFET1xuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICAvLyBDT1JFIFJFTkRFUiBGTE9XIE9GIENPTVBMRVRFRCBMT0dHRUQgQVBQXG4gIGNvbnN0IHJlbmRlckFjdGl2ZVBhZ2UgPSAoKSA9PiB7XG4gICAgc3dpdGNoIChhY3RpdmVUYWIpIHtcbiAgICAgIGNhc2UgXCJkYXNoYm9hcmRcIjpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8RGFzaGJvYXJkXG4gICAgICAgICAgICBpc0FkbWluPXt1c2VyUm9sZSA9PT0gXCJhZG1pblwifVxuICAgICAgICAgICAgbG9nZ2VkVXNlcj17bG9nZ2VkVXNlcn1cbiAgICAgICAgICAgIGxlYWRzPXtsZWFkc31cbiAgICAgICAgICAgIHRhc2tzPXt0YXNrc31cbiAgICAgICAgICAgIG9uU2V0RnR0YVRhYj17c2V0RnR0YVRhYn1cbiAgICAgICAgICAgIG9uT3BlbkNoYXQ9eygpID0+IHNldElzQWlDaGF0T3Blbih0cnVlKX1cbiAgICAgICAgICAgIG9uVHJpZ2dlckNvYWNoPXsoKSA9PiBzZXRJc0FpQ2hhdE9wZW4odHJ1ZSl9XG4gICAgICAgICAgICBvbk5hdmlnYXRlPXt0YWIgPT4gc2V0QWN0aXZlVGFiKHRhYiBhcyBhbnkpfVxuICAgICAgICAgICAgb25OYXZpZ2F0ZVRvU2VsbGVyTGVhZHM9eyhzZWxsZXIpID0+IHtcbiAgICAgICAgICAgICAgc2V0TGVhZHNGaWx0ZXJTZWxsZXIoc2VsbGVyKTtcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKFwibGVhZHNcIik7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25TeW5jPXtmZXRjaEFsbERhdGF9XG4gICAgICAgICAgICB2ZW5kb3JzPXtyZWdpc3RlcmVkVmVuZG9yc30gLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJhZG1pbl9sb2dzXCI6XG4gICAgICAgIHJldHVybiA8QWRtaW5Mb2dzUGFnZSAvPjtcbiAgICAgIGNhc2UgXCJnZXN0YW9fcGVzc29hc1wiOlxuICAgICAgICByZXR1cm4gPEdlc3Rhb1Blc3NvYXNQYWdlIHZlbmRvcnM9e3JlZ2lzdGVyZWRWZW5kb3JzfSBsb2dnZWRVc2VyPXtsb2dnZWRVc2VyIX0gaXNBZG1pbj17dXNlclJvbGUgPT09IFwiYWRtaW5cIn0gLz47XG4gICAgICBjYXNlIFwibGVhZHNcIjpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8TGVhZHNQYWdlXG4gICAgICAgICAgICBsZWFkcz17bGVhZHN9XG4gICAgICAgICAgICBpc0FkbWluPXt1c2VyUm9sZSA9PT0gXCJhZG1pblwifVxuICAgICAgICAgICAgbG9nZ2VkVXNlcj17bG9nZ2VkVXNlcn1cbiAgICAgICAgICAgIG9uU2F2ZUxlYWQ9e2hhbmRsZVNhdmVMZWFkfVxuICAgICAgICAgICAgb25EZWxldGVMZWFkPXtoYW5kbGVEZWxldGVMZWFkfVxuICAgICAgICAgICAgb25HZW5lcmF0ZUFJT2JzPXtoYW5kbGVHZW5lcmF0ZUFJT2JzfVxuICAgICAgICAgICAgb25Db21iYXRPYmplY3Rpb25XaXRoSUE9e2hhbmRsZUNvbWJhdE9iamVjdGlvbn1cbiAgICAgICAgICAgIG9uU3luY0xlYWRzPXtoYW5kbGVTeW5jTGVhZHN9XG4gICAgICAgICAgICBvbkFkZFRhc2s9e2hhbmRsZUFkZFRhc2t9XG4gICAgICAgICAgICBvbk5hdmlnYXRlVG9UYXNrcz17KCkgPT4gc2V0QWN0aXZlVGFiKFwidGFza3NcIil9XG4gICAgICAgICAgICBkZWZhdWx0Vmlld01vZGU9XCJsaXN0XCJcbiAgICAgICAgICAgIGluaXRpYWxTZWxsZXJGaWx0ZXI9e2xlYWRzRmlsdGVyU2VsbGVyfSAvPlxuICAgICAgICApO1xuICAgICAgY2FzZSBcImNhZGFzdHJvTGVhZFwiOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxMZWFkc1BhZ2VcbiAgICAgICAgICAgIGxlYWRzPXtsZWFkc31cbiAgICAgICAgICAgIGlzQWRtaW49e3VzZXJSb2xlID09PSBcImFkbWluXCJ9XG4gICAgICAgICAgICBsb2dnZWRVc2VyPXtsb2dnZWRVc2VyfVxuICAgICAgICAgICAgb25TYXZlTGVhZD17aGFuZGxlU2F2ZUxlYWR9XG4gICAgICAgICAgICBvbkRlbGV0ZUxlYWQ9e2hhbmRsZURlbGV0ZUxlYWR9XG4gICAgICAgICAgICBvbkdlbmVyYXRlQUlPYnM9e2hhbmRsZUdlbmVyYXRlQUlPYnN9XG4gICAgICAgICAgICBvbkNvbWJhdE9iamVjdGlvbldpdGhJQT17aGFuZGxlQ29tYmF0T2JqZWN0aW9ufVxuICAgICAgICAgICAgb25TeW5jTGVhZHM9e2hhbmRsZVN5bmNMZWFkc31cbiAgICAgICAgICAgIG9uQWRkVGFzaz17aGFuZGxlQWRkVGFza31cbiAgICAgICAgICAgIG9uTmF2aWdhdGVUb1Rhc2tzPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJ0YXNrc1wiKX1cbiAgICAgICAgICAgIGRlZmF1bHRWaWV3TW9kZT1cImZvcm1cIlxuICAgICAgICAgIC8+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwiZnR0YVwiOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxGdHRhUGFnZVxuICAgICAgICAgICAgc2l0ZXM9e2Z0dGFJdGVtc31cbiAgICAgICAgICAgIHByb3NwZWNzPXtmdHRhUHJvc3BzfVxuICAgICAgICAgICAgaXNBZG1pbj17dXNlclJvbGUgPT09IFwiYWRtaW5cIn1cbiAgICAgICAgICAgIGxvZ2dlZFVzZXI9e2xvZ2dlZFVzZXJ9XG4gICAgICAgICAgICBvblJlZ2lzdGVyRnR0YVNpdGU9e2hhbmRsZVNhdmVGdHRhSXRlbX1cbiAgICAgICAgICAgIG9uUmVnaXN0ZXJGdHRhUHJvc3A9e2hhbmRsZVNhdmVGdHRhUHJvc3BLZXl9XG4gICAgICAgICAgICBpbml0aWFsVGFiPXtmdHRhVGFifVxuICAgICAgICAgICAgb25TeW5jRnR0YT17aGFuZGxlU3luY0Z0dGF9IC8+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwidGFza3NcIjpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8VGFza3NQYWdlXG4gICAgICAgICAgICB0YXNrcz17dGFza3N9XG4gICAgICAgICAgICBvbkFkZFRhc2s9e2hhbmRsZUFkZFRhc2t9XG4gICAgICAgICAgICBvblRvZ2dsZVRhc2s9e2hhbmRsZVRvZ2dsZVRhc2t9XG4gICAgICAgICAgICBvbkRlbGV0ZVRhc2s9e2hhbmRsZURlbGV0ZVRhc2t9XG4gICAgICAgICAgICBvbkNsZWFyQ29tcGxldGVkVGFza3M9e2hhbmRsZUNsZWFyQ29tcGxldGVkVGFza3N9XG4gICAgICAgICAgICBsZWFkc0xpc3Q9e2xlYWRzLm1hcChsID0+IGwubm9tZUxlYWQpfVxuICAgICAgICAgICAgb25OYXZpZ2F0ZVRvTGVhZERldGFpbD17KG5vbWUpID0+IHtcbiAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKFwibGVhZHNcIik7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgdmVuZG9yc0xpc3Q9e3JlZ2lzdGVyZWRWZW5kb3JzLm1hcCh2ID0+IHYubm9tZSl9XG4gICAgICAgICAgICBpc0FkbWluPXt1c2VyUm9sZSA9PT0gXCJhZG1pblwifVxuICAgICAgICAgICAgbG9nZ2VkVXNlcj17bG9nZ2VkVXNlcn0gLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJpbmRpY2F0b3JzXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPEluZGljYXRvcnNQYWdlXG4gICAgICAgICAgICBsZWFkcz17bGVhZHN9XG4gICAgICAgICAgICBpc0FkbWluPXt1c2VyUm9sZSA9PT0gXCJhZG1pblwifVxuICAgICAgICAgICAgbG9nZ2VkVXNlcj17bG9nZ2VkVXNlcn0gLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJiYXNlXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPEJhc2VNYW5hZ2VtZW50UGFnZVxuICAgICAgICAgICAgY2xpZW50cz17YmFzZUNsaWVudHN9XG4gICAgICAgICAgICBhY3Rpb25zPXtiYXNlQWN0aW9uc31cbiAgICAgICAgICAgIG9uUmVnaXN0ZXJBY3Rpb249e2hhbmRsZVJlZ2lzdGVyQmFzZUFjdGlvbn1cbiAgICAgICAgICAgIG9uR2VuZXJhdGVJQVBpdGNoPXtoYW5kbGVHZW5lcmF0ZUlBUGl0Y2h9XG4gICAgICAgICAgICBvblJlZnJlc2hCYXNlPXtoYW5kbGVTeW5jQmFzZX1cbiAgICAgICAgICAgIG9uRmV0Y2hCYXNlTG9jYWw9e2hhbmRsZUZldGNoQmFzZUxvY2FsfVxuICAgICAgICAgICAgbG9nZ2VkVXNlcj17bG9nZ2VkVXNlcn1cbiAgICAgICAgICAgIGlzQWRtaW49e3VzZXJSb2xlID09PSBcImFkbWluXCJ9IC8+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwiY29icmFuY2FzXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPENvYnJhbmNhc1BhZ2VcbiAgICAgICAgICAgIGNvYnJhbmNhcz17Y29icmFuY2FzfVxuICAgICAgICAgICAgbG9nZ2VkVXNlcj17bG9nZ2VkVXNlcn1cbiAgICAgICAgICAgIGlzQWRtaW49e3VzZXJSb2xlID09PSBcImFkbWluXCJ9XG4gICAgICAgICAgICBvblVwZGF0ZUNvYnJhbmNhPXtoYW5kbGVVcGRhdGVDb2JyYW5jYX1cbiAgICAgICAgICAgIG9uUmVnaXN0ZXJDb2JyYW5jYUxvZz17aGFuZGxlUmVnaXN0ZXJDb2JyYW5jYUxvZ31cbiAgICAgICAgICAgIG9uR2VuZXJhdGVJQVBpdGNoPXtoYW5kbGVHZW5lcmF0ZUlBQ29icmFuY2FQaXRjaH1cbiAgICAgICAgICAgIG9uUmVmcmVzaERhdGE9e2ZldGNoQWxsRGF0YX0gLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJjb21wZXRpdG9yc1wiOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxDb21wZXRpdG9yc1BhZ2VcbiAgICAgICAgICAgIGNvbXBldGl0b3JzPXtjb21wZXRpdG9yc31cbiAgICAgICAgICAgIG9uQW5hbHl6ZVdpdGhBST17aGFuZGxlQW5hbHl6ZUNvbXBldGl0b3J9XG4gICAgICAgICAgICBvblNhdmVDb21wZXRpdG9yPXtoYW5kbGVTYXZlQ29tcGV0aXRvcn1cbiAgICAgICAgICAgIG9uRGVsZXRlQ29tcGV0aXRvcj17aGFuZGxlRGVsZXRlQ29tcGV0aXRvcn1cbiAgICAgICAgICAgIGlzQWRtaW49e3VzZXJSb2xlID09PSBcImFkbWluXCJ9IC8+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwib2JqZWN0aW9uc1wiOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxPYmplY3Rpb25zUGFnZVxuICAgICAgICAgICAgb25Db21iYXRPYmplY3Rpb249e2hhbmRsZUNvbWJhdE9iamVjdGlvbn0gLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJhYnNlbmNlc1wiOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxBYnNlbmNlc1BhZ2VcbiAgICAgICAgICAgIGFic2VuY2VzPXthYnNlbmNlc31cbiAgICAgICAgICAgIGlzQWRtaW49e3VzZXJSb2xlID09PSBcImFkbWluXCJ9XG4gICAgICAgICAgICBvblJlZ2lzdGVyQWJzZW5jZT17aGFuZGxlUmVnaXN0ZXJBYnNlbmNlfVxuICAgICAgICAgICAgb25VcGRhdGVBYnNlbmNlPXtoYW5kbGVVcGRhdGVBYnNlbmNlfSAvPlxuICAgICAgICApO1xuICAgICAgY2FzZSBcInBvc192ZW5kYVwiOlxuICAgICAgICByZXR1cm4gPFBvc1ZlbmRhUGFnZSBsb2dnZWRVc2VyPXtsb2dnZWRVc2VyIX0gaXNBZG1pbj17dXNlclJvbGUgPT09IFwiYWRtaW5cIn0gLz47XG4gICAgICBjYXNlIFwibWF0cml6X29iamVjb2VzXCI6XG4gICAgICAgIHJldHVybiA8TWF0cml6T2JqZWNvZXNQYWdlIGxvZ2dlZFVzZXI9e2xvZ2dlZFVzZXIhfSBpc0FkbWluPXt1c2VyUm9sZSA9PT0gXCJhZG1pblwifSAvPjtcbiAgICAgIGNhc2UgXCJ0cmFkZVwiOlxuICAgICAgICByZXR1cm4gPFRyYWRlUGFnZSBsb2dnZWRVc2VyPXtsb2dnZWRVc2VyIX0gaXNBZG1pbj17dXNlclJvbGUgPT09IFwiYWRtaW5cIn0gLz47XG4gICAgICBjYXNlIFwibGVhZHNfZnJpb3NcIjpcbiAgICAgICAgcmV0dXJuIDxMZWFkc0ZyaW9zVGFiIGlzQWRtaW49e3VzZXJSb2xlID09PSBcImFkbWluXCJ9IHZlbmRvcnM9e2F2YWlsYWJsZVZlbmRvcnN9IGxvZ2dlZFVzZXI9e2xvZ2dlZFVzZXIhfSAvPjtcbiAgICAgIGNhc2UgXCJlc3RyYXRlZ2lhXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPEVzdHJhdGVnaWFQYWdlIGxvZ2dlZFVzZXI9e2xvZ2dlZFVzZXJ9IC8+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwibWF0ZXJpYWxzXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPE1hdGVyaWFsc1BhZ2VcbiAgICAgICAgICAgIG9uQmFja1RvRGFzaGJvYXJkPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJkYXNoYm9hcmRcIil9IC8+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwicGxhbm9zXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPFBsYW5vc1BhZ2UgLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJyb3Rhc1wiOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxSb3RhVmVuZGFzUGFnZSBsZWFkcz17bGVhZHN9IGxvZ2dlZFVzZXI9e2xvZ2dlZFVzZXJ9IC8+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwidmVuZGVkb3Jlc1wiOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxWZW5kZWRvcmVzUGFnZVxuICAgICAgICAgICAgdmVuZG9ycz17cmVnaXN0ZXJlZFZlbmRvcnN9XG4gICAgICAgICAgICBvbkFkZFZlbmRvcj17aGFuZGxlUmVnaXN0ZXJWZW5kb3J9XG4gICAgICAgICAgICBvblVwZGF0ZVZlbmRvcj17aGFuZGxlVXBkYXRlVmVuZG9yfVxuICAgICAgICAgICAgb25EZWxldGVWZW5kb3I9e2hhbmRsZURlbGV0ZVZlbmRvcn1cbiAgICAgICAgICAgIG9uQnVsa1RyYW5zZmVyPXtoYW5kbGVCdWxrVHJhbnNmZXJMZWFkc30gLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJpbnN0YWxsYXRpb25zXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPEluc3RhbGxhdGlvbnNQYWdlXG4gICAgICAgICAgICBpbnN0YWxsYXRpb25zPXtpbnN0YWxsYXRpb25zfVxuICAgICAgICAgICAgdmVuZG9ycz17YXZhaWxhYmxlVmVuZG9yc31cbiAgICAgICAgICAgIG9uU2F2ZUluc3RhbGxhdGlvbj17aGFuZGxlU2F2ZUluc3RhbGxhdGlvbn1cbiAgICAgICAgICAgIG9uRGVsZXRlSW5zdGFsbGF0aW9uPXtoYW5kbGVEZWxldGVJbnN0YWxsYXRpb259XG4gICAgICAgICAgICBvblN5bmNJbnN0YWxsYXRpb25zPXtoYW5kbGVTeW5jSW5zdGFsbGF0aW9uc31cbiAgICAgICAgICAgIHVzZXJSb2xlPXt1c2VyUm9sZX0gLz5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJpbnN0YWxsYXRpb25zX3F1ZXVlXCI6XG4gICAgICAgIHJldHVybiA8SW5zdGFsbGF0aW9uc1F1ZXVlUGFnZSAvPjtcbiAgICAgIGNhc2UgXCJwcm90b2NvbG9zX2ludGVybm9zXCI6XG4gICAgICAgIHJldHVybiA8SW50ZXJuYWxQcm90b2NvbHNQYWdlIC8+O1xuICAgICAgY2FzZSBcImFkbWluX244blwiOlxuICAgICAgICByZXR1cm4gPEFkbWluTjhOUGFnZSAvPjtcbiAgICAgIGNhc2UgXCJjYWxjdWxvX211bHRhXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPENhbGN1bG9NdWx0YVBhZ2UgXG4gICAgICAgICAgICBvbkJhY2tUb0Rhc2hib2FyZD17KCkgPT4gc2V0QWN0aXZlVGFiKFwiZGFzaGJvYXJkXCIpfSAvPlxuICAgICAgICApO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIDxkaXY+TsOjbyBlbmNvbnRyYWRvPC9kaXY+O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGJnLVsjRURGMkY3XSBmbGV4IGZvbnQtc2FucyB0ZXh0LXNsYXRlLTkwMCBsZWFkaW5nLW5vcm1hbCBtYXgtdy1bMTYwMHB4XSBteC1hdXRvIGJvcmRlci14IGJvcmRlci1zbGF0ZS0yMDAvNjAgcmVsYXRpdmUgc2hhZG93LTJ4bCBvdmVyZmxvdy1oaWRkZW4gaC1zY3JlZW5cIj5cbiAgICAgIHsvKiBBTEVSVEEgREUgRVJSTyBERSBXRUJIT09LIE44TiAoVklTw41WRUwgQVBFTkFTIFBBUkEgQURNSU4pICovfVxuICAgICAge3dlYmhvb2tFcnJvciAmJiB1c2VyUm9sZSA9PT0gXCJhZG1pblwiICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCBsZWZ0LTAgcmlnaHQtMCBiZy1yb3NlLTUwIGJvcmRlci1iIGJvcmRlci1yb3NlLTIwMCBwLTMgZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC00IHotWzEwMF0gc2hhZG93LW1kIFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctcm9zZS0xMDAgcC0yIHJvdW5kZWQtZnVsbFwiPlxuICAgICAgICAgICAgICA8WmFwIGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC1yb3NlLTYwMCBhbmltYXRlLXB1bHNlXCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXJvc2UtODAwXCI+RmFsaGEgZGUgQ29tdW5pY2HDp8OjbyBjb20gTjhOPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXJvc2UtNjAwIGZvbnQtbWVkaXVtIG10LTAuNVwiPlxuICAgICAgICAgICAgICAgIFVtYSBhdXRvbWHDp8OjbyBkbyBOZ3Jvay9OOE4gcmV0b3Jub3UgZXJybyAoNDA0LzUwMCkuIFZlcmlmaXF1ZSBhcyB2YXJpw6F2ZWlzIGRlIGFtYmllbnRlIGUgc2Ugb3MgZmx1eG9zIGVzdMOjbyBhdGl2b3MuXG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgZmV0Y2goJy9hcGkvZW52L244bicpLnRoZW4ociA9PiByLmpzb24oKSkudGhlbihkID0+IHtcbiAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBkLlVTRV9OOE5fVEVTVF9BR0VOREFNRU5UTyA9PT0gXCJ0cnVlXCIgPyBkLk44Tl9URVNUX1dFQkhPT0tfVVJMIDogZC5OOE5fV0VCSE9PS19VUkw7XG4gICAgICAgICAgICAgICAgICAgaWYgKHVybCkgd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG4gICAgICAgICAgICAgICAgICAgZWxzZSBhbGVydChcIlVSTCBuw6NvIGNvbmZpZ3VyYWRhIG5vIC5lbnYhXCIpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IGFsZXJ0KFwiRXJybyBhbyBvYnRlciBVUkxcIikpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC0zIHB5LTEuNSBiZy13aGl0ZSBib3JkZXIgYm9yZGVyLXJvc2UtMjAwIHRleHQtcm9zZS03MDAgdGV4dC14cyBmb250LWJvbGQgcm91bmRlZCBob3ZlcjpiZy1yb3NlLTEwMCBzaGFkb3ctc20gdHJhbnNpdGlvbi1jb2xvcnMgd2hpdGVzcGFjZS1ub3dyYXBcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBUZXN0YXIgQ29uZXjDo29cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRXZWJob29rRXJyb3IoZmFsc2UpfSBjbGFzc05hbWU9XCJweC0zIHB5LTEuNSBiZy1yb3NlLTYwMCB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1ib2xkIHJvdW5kZWQgaG92ZXI6Ymctcm9zZS03MDAgc2hhZG93LXNtIHRyYW5zaXRpb24tY29sb3JzIHdoaXRlc3BhY2Utbm93cmFwXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgRGlzcGVuc2FyXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgICAgey8qIEZJTSBBTEVSVEEgTjhOICovfVxuICAgICAge3dlYmhvb2tFcnJvciAmJiB1c2VyUm9sZSAhPT0gXCJhZG1pblwiICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCBsZWZ0LTAgcmlnaHQtMCBiZy1yZWQtNjAwIHRleHQtd2hpdGUgcC0yIHRleHQtY2VudGVyIHotNTAgdGV4dC14cyBmb250LWJvbGQgZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIHNoYWRvdy1tZFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14LWF1dG9cIj5VbWEgYXV0b21hw6fDo28gZmFsaG91IGVtIHNlZ3VuZG8gcGxhbm8uIFNldSBnZXN0b3IgasOhIGZvaSBub3RpZmljYWRvLjwvc3Bhbj5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFdlYmhvb2tFcnJvcihmYWxzZSl9IGNsYXNzTmFtZT1cInRleHQtd2hpdGUgaG92ZXI6dGV4dC1yZWQtMjAwIHB4LTIgZm9udC1ib2xkXCI+4pyVPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKX1cbiAgICAgIHsvKiAxLiBTYWFTIFBlcnNpc3RlbnQgU2lkZWJhciBOYXZpZ2F0aW9uIChEZXNrdG9wIE9ubHkpICovfVxuICAgICAgPGFzaWRlIGNsYXNzTmFtZT1cImhpZGRlbiBsZzpmbGV4IGZsZXgtY29sIHctNjQgYmctc2xhdGUtOTUwIHRleHQtd2hpdGUgYm9yZGVyLXIgYm9yZGVyLXNsYXRlLTgwMC84MCBzaHJpbmstMCBzZWxlY3Qtbm9uZSBoLWZ1bGwgcHktNiBweC00IHotNDBcIj5cbiAgICAgICAgXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBmbGV4LTEgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgey8qIEJyYW5kL0xvZ28gU2VjdGlvbiAqL31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHB4LTIgY3Vyc29yLXBvaW50ZXIgc2hyaW5rLTAgbWItNlwiIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImRhc2hib2FyZFwiKX0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctOSBoLTkgYmctc2t5LTYwMCByb3VuZGVkLXhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtd2hpdGUgZm9udC1leHRyYWJvbGQgdGV4dC1iYXNlIHNoYWRvdy1sZyBzaGFkb3ctc2t5LTkwMC8zMFwiPlxuICAgICAgICAgICAgICBNSFxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2xcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJsYWNrIHRyYWNraW5nLXRpZ2h0IHRleHQtd2hpdGUgbGVhZGluZy1ub25lXCI+UGFpbmVsIE1ITkVUPC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIHRleHQtc2xhdGUtNTAwIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbXQtMVwiPkxBSkVBRE8gfCBFU1RSRUxBPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtWzFweF0gYmctc2xhdGUtODAwLzYwIG14LTEgc2hyaW5rLTAgbWItNlwiIC8+XG5cbiAgICAgICAgICB7LyogTmF2IENhdGVnb3JpZXMgKi99XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTUgb3ZlcmZsb3cteS1hdXRvIGZsZXgtMSBwci0yIHBiLTRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0xXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInB4LTMgdGV4dC1bMTBweF0gZm9udC1ib2xkIHRleHQtc2xhdGUtNTAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3QgYmxvY2sgbWItMlwiPlBhaW5lbCBkZSBUcmFiYWxobzwvc3Bhbj5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwiZGFzaGJvYXJkXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiZGFzaGJvYXJkXCIgXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC13aGl0ZSBob3ZlcjpiZy1zbGF0ZS05MDBcIlxuICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8QWN0aXZpdHkgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5QYWluZWwgUHJpbmNpcGFsPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcInBvc192ZW5kYVwiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcInBvc192ZW5kYVwiIFxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXNreS02MDAgdG8tc2t5LTUwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBzaGFkb3ctbWQgc2hhZG93LXNreS05MDAvMjBcIiBcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPFVzZXJDaGVjayBjbGFzc05hbWU9XCJ3LTQgaC00IHNocmluay0wIHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuPlDDs3MgVmVuZGFzPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImJhc2VcIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHB4LTMgcHktMi41IHJvdW5kZWQteGwgdGV4dC14cyBmb250LXNlbWlib2xkIGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gJHtcbiAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gXCJiYXNlXCIgXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC13aGl0ZSBob3ZlcjpiZy1zbGF0ZS05MDBcIlxuICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8QXdhcmQgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5CYXNlIGRlIENsaWVudGVzPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNldExlYWRzRmlsdGVyU2VsbGVyKG51bGwpO1xuICAgICAgICAgICAgICAgICAgc2V0QWN0aXZlVGFiKFwibGVhZHNcIik7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImxlYWRzXCIgXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC13aGl0ZSBob3ZlcjpiZy1zbGF0ZS05MDBcIlxuICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8VXNlcnMgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5MZWFkcyBQQVAgKEZ1bmlsKTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJsZWFkc19mcmlvc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImxlYWRzX2ZyaW9zXCIgXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC13aGl0ZSBob3ZlcjpiZy1zbGF0ZS05MDBcIlxuICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8RmlsZVNwcmVhZHNoZWV0IGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZSBcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuPkxlYWRzIEZyaW9zPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImNvYnJhbmNhc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImNvYnJhbmNhc1wiIFxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXNreS02MDAgdG8tc2t5LTUwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBzaGFkb3ctbWQgc2hhZG93LXNreS05MDAvMjBcIiBcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwIGJsb2NrXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPENvaW5zIGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4+Q29udHJvbGUgZGUgQ29icmFuw6dhczwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJmdHRhXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiZnR0YVwiIFxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXNreS02MDAgdG8tc2t5LTUwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBzaGFkb3ctbWQgc2hhZG93LXNreS05MDAvMjBcIiBcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPE1hcFBpbiBjbGFzc05hbWU9XCJ3LTQgaC00IHNocmluay0wIHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuPlZpYWJpbGlkYWRlIEZUVEE8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwidGFza3NcIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHB4LTMgcHktMi41IHJvdW5kZWQteGwgdGV4dC14cyBmb250LXNlbWlib2xkIGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gJHtcbiAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gXCJ0YXNrc1wiIFxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXNreS02MDAgdG8tc2t5LTUwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBzaGFkb3ctbWQgc2hhZG93LXNreS05MDAvMjBcIiBcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPENsaXBib2FyZExpc3QgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5NaW5oYXMgVGFyZWZhczwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJpbnN0YWxsYXRpb25zXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiaW5zdGFsbGF0aW9uc1wiIFxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctc2t5LTYwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBzaGFkb3ctbWQgc2hhZG93LXNreS05NTBcIiBcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPENhbGVuZGFyRGF5cyBjbGFzc05hbWU9XCJ3LTQgaC00IHNocmluay0wIHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuPkFnZW5kYSBkZSBJbnN0YWxhw6fDtWVzPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJpbnN0YWxsYXRpb25zX3F1ZXVlXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiaW5zdGFsbGF0aW9uc19xdWV1ZVwiIFxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctc2t5LTYwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBzaGFkb3ctbWQgc2hhZG93LXNreS05NTBcIiBcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPENsaXBib2FyZExpc3QgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5GaWxhIGRlIE1vbml0b3JhbWVudG88L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImdlc3Rhb19wZXNzb2FzXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiZ2VzdGFvX3Blc3NvYXNcIiBcbiAgICAgICAgICAgICAgICAgICAgPyBcImJnLWdyYWRpZW50LXRvLXIgZnJvbS1za3ktNjAwIHRvLXNreS01MDAgdGV4dC13aGl0ZSBmb250LWJvbGQgc2hhZG93LW1kIHNoYWRvdy1za3ktOTAwLzIwXCIgXG4gICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMFwiXG4gICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgIHt1c2VyUm9sZSA9PT0gXCJhZG1pblwiID8gPFVzZXJzIGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZVwiIC8+IDogPFVzZXIgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz59XG4gICAgICAgICAgICAgICAgPHNwYW4+e3VzZXJSb2xlID09PSBcImFkbWluXCIgPyBcIkdlc3TDo28gZGUgUGVzc29hc1wiIDogXCJNZXUgUkhcIn08L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHt1c2VyUm9sZSA9PT0gXCJhZG1pblwiICYmIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTFcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJweC0zIHRleHQtWzEwcHhdIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTUwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXN0IGJsb2NrIG1iLTIgbXQtMVwiPkdlc3TDo28gZGUgRXF1aXBlPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwicHJvdG9jb2xvc19pbnRlcm5vc1wiKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gXCJwcm90b2NvbG9zX2ludGVybm9zXCIgXG4gICAgICAgICAgICAgICAgICAgICAgPyBcImJnLWdyYWRpZW50LXRvLXIgZnJvbS1za3ktNjAwIHRvLXNreS01MDAgdGV4dC13aGl0ZSBmb250LWJvbGQgc2hhZG93LW1kIHNoYWRvdy1za3ktOTAwLzIwXCIgXG4gICAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwXCJcbiAgICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVGV4dCBjbGFzc05hbWU9XCJ3LTQgaC00IHNocmluay0wIHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+UHJvdG9jb2xvcyBJbnRlcm5vczwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImVzdHJhdGVnaWFcIil9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiZXN0cmF0ZWdpYVwiIFxuICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMFwiXG4gICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICA8Qm90IGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj5HZXN0w6NvIEVzdHJhdMOpZ2ljYSBJQTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcInZlbmRlZG9yZXNcIil9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwidmVuZGVkb3Jlc1wiIFxuICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMFwiXG4gICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICA8U2xpZGVycyBjbGFzc05hbWU9XCJ3LTQgaC00IHNocmluay0wIHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+VmVuZGVkb3JlcyAmIE1ldGFzPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwiYWRtaW5fbjhuXCIpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHB4LTMgcHktMi41IHJvdW5kZWQteGwgdGV4dC14cyBmb250LXNlbWlib2xkIGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gJHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImFkbWluX244blwiIFxuICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMFwiXG4gICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICA8TGluayBjbGFzc05hbWU9XCJ3LTQgaC00IHNocmluay0wIHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+SW50ZWdyYcOnw7VlcyBOOE48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJhZG1pbl9sb2dzXCIpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHB4LTMgcHktMi41IHJvdW5kZWQteGwgdGV4dC14cyBmb250LXNlbWlib2xkIGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gJHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImFkbWluX2xvZ3NcIiBcbiAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXJvc2UtNjAwIHRvLXJvc2UtNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctcm9zZS05MDAvMjBcIiBcbiAgICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC13aGl0ZSBob3ZlcjpiZy1zbGF0ZS05MDBcIlxuICAgICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgICAgPFRlcm1pbmFsIGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj5EZXB1cmHDp8OjbyAmIExvZ3MgSUE8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTFcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwicHgtMyB0ZXh0LVsxMHB4XSBmb250LWJvbGQgdGV4dC1zbGF0ZS01MDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVzdCBibG9jayBtYi0yXCI+VHJlaW5hbWVudG8gJiBBcG9pbzwvc3Bhbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImNvbXBldGl0b3JzXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiY29tcGV0aXRvcnNcIiBcbiAgICAgICAgICAgICAgICAgICAgPyBcImJnLWdyYWRpZW50LXRvLXIgZnJvbS1za3ktNjAwIHRvLXNreS01MDAgdGV4dC13aGl0ZSBmb250LWJvbGQgc2hhZG93LW1kIHNoYWRvdy1za3ktOTAwLzIwXCIgXG4gICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMFwiXG4gICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgIDxTcGFya2xlcyBjbGFzc05hbWU9XCJ3LTQgaC00IHNocmluay0wIHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuPkFuw6FsaXNlIENvbmNvcnLDqm5jaWE8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwiY2FsY3Vsb19tdWx0YVwiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImNhbGN1bG9fbXVsdGFcIiBcbiAgICAgICAgICAgICAgICAgICAgPyBcImJnLWdyYWRpZW50LXRvLXIgZnJvbS1za3ktNjAwIHRvLXNreS01MDAgdGV4dC13aGl0ZSBmb250LWJvbGQgc2hhZG93LW1kIHNoYWRvdy1za3ktOTAwLzIwXCIgXG4gICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMCBibG9ja1wiXG4gICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgIDxDYWxjdWxhdG9yIGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4+Q8OhbGN1bG8gZGUgTXVsdGE8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwib2JqZWN0aW9uc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcIm9iamVjdGlvbnNcIiBcbiAgICAgICAgICAgICAgICAgICAgPyBcImJnLWdyYWRpZW50LXRvLXIgZnJvbS1za3ktNjAwIHRvLXNreS01MDAgdGV4dC13aGl0ZSBmb250LWJvbGQgc2hhZG93LW1kIHNoYWRvdy1za3ktOTAwLzIwXCIgXG4gICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMFwiXG4gICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgIDxIZWxwQ2lyY2xlIGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4+Q29udG9ybm8gZGUgT2JqZcOnw7Vlczwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJ0cmFkZVwiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcInRyYWRlXCIgXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1yIGZyb20tc2t5LTYwMCB0by1za3ktNTAwIHRleHQtd2hpdGUgZm9udC1ib2xkIHNoYWRvdy1tZCBzaGFkb3ctc2t5LTkwMC8yMFwiIFxuICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC13aGl0ZSBob3ZlcjpiZy1zbGF0ZS05MDBcIlxuICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8U3RvcmUgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5Bw6fDtWVzIGRlIFRyYWRlPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImFic2VuY2VzXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLXhsIHRleHQteHMgZm9udC1zZW1pYm9sZCBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiYWJzZW5jZXNcIiBcbiAgICAgICAgICAgICAgICAgICAgPyBcImJnLWdyYWRpZW50LXRvLXIgZnJvbS1za3ktNjAwIHRvLXNreS01MDAgdGV4dC13aGl0ZSBmb250LWJvbGQgc2hhZG93LW1kIHNoYWRvdy1za3ktOTAwLzIwXCIgXG4gICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXdoaXRlIGhvdmVyOmJnLXNsYXRlLTkwMFwiXG4gICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgIDxDYWxlbmRhckRheXMgY2xhc3NOYW1lPVwidy00IGgtNCBzaHJpbmstMCB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj5Fc2NhbGEgJiBBdXPDqm5jaWFzPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcIm1hdGVyaWFsc1wiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcIm1hdGVyaWFsc1wiIFxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXNreS02MDAgdG8tc2t5LTUwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCBzaGFkb3ctbWQgc2hhZG93LXNreS05MDAvMjBcIiBcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtd2hpdGUgaG92ZXI6Ymctc2xhdGUtOTAwXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPEJvb2tPcGVuIGNsYXNzTmFtZT1cInctNCBoLTQgc2hyaW5rLTAgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4+RHJpdmUgJiBQYW5mbGV0b3M8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuXG5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIFVzZXIgcHJvZmlsZSB3aXRoIGxvZ291dCBvbiBzaWRlYmFyICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNCBzaHJpbmstMCBwdC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLVsxcHhdIGJnLXNsYXRlLTgwMC82MCBteC0xXCIgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTIuNSBiZy1zbGF0ZS05MDAvNTAgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci1zbGF0ZS04MDAvNDBcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgbWluLXctMFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctOCBoLTggcm91bmRlZC1mdWxsIGJnLXNreS02MDAvMjAgdGV4dC1za3ktNDAwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGZvbnQtYm9sZCB0ZXh0LXhzIHNocmluay0wIHNlbGVjdC1ub25lXCI+XG4gICAgICAgICAgICAgICAge2xvZ2dlZFVzZXIgPyBsb2dnZWRVc2VyLnN1YnN0cmluZygwLCAyKS50b1VwcGVyQ2FzZSgpIDogXCJVXCJ9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgbWluLXctMFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIGZvbnQtYm9sZCB0ZXh0LXdoaXRlIHRydW5jYXRlIGxlYWRpbmctbm9uZSBtYi0xXCI+e2xvZ2dlZFVzZXJ9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gdGV4dC1za3ktNDAwIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSBsZWFkaW5nLW5vbmVcIj5cbiAgICAgICAgICAgICAgICAgIHt1c2VyUm9sZSA9PT0gXCJhZG1pblwiID8gXCJDb29yZGVuYWRvclwiIDogXCJDb25zdWx0b3IgUEFQXCJ9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSBzaHJpbmstMFwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFRoZW1lKHRoZW1lID09PSBcImxpZ2h0XCIgPyBcImRhcmtcIiA6IFwibGlnaHRcIil9IFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInAtMS41IHRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtYW1iZXItNDAwIGhvdmVyOmJnLXNsYXRlLTgwMC82MCByb3VuZGVkLWxnIGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gYWN0aXZlOnNjYWxlLTk1IHNocmluay0wXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17dGhlbWUgPT09IFwibGlnaHRcIiA/IFwiQXRpdmFyIE1vZG8gRXNjdXJvXCIgOiBcIkF0aXZhciBNb2RvIENsYXJvXCJ9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dGhlbWUgPT09IFwibGlnaHRcIiA/IDxNb29uIGNsYXNzTmFtZT1cInctMy41IGgtMy41XCIgLz4gOiA8U3VuIGNsYXNzTmFtZT1cInctMy41IGgtMy41IHRleHQtYW1iZXItNDAwXCIgLz59XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPVwicC0xLjUgdGV4dC1zbGF0ZS01MDAgaG92ZXI6dGV4dC1yb3NlLTQwMCBob3ZlcjpiZy1zbGF0ZS04MDAvNjAgcm91bmRlZC1sZyBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uIGFjdGl2ZTpzY2FsZS05NSBzaHJpbmstMFwiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJTYWlyIGRvIGV4cGVkaWVudGVcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPExvZ091dCBjbGFzc05hbWU9XCJ3LTMuNSBoLTMuNVwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICA8L2FzaWRlPlxuXG4gICAgICB7LyogMi4gTWFpbiBDb250ZW50IFdyYXBwZXIgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMSBmbGV4IGZsZXgtY29sIG1pbi13LTAgb3ZlcmZsb3ctaGlkZGVuIGJnLXNsYXRlLTUwIGgtZnVsbFwiPlxuXG4gICAgICAgIHttaXNzaW5nRW52S2V5cy5sZW5ndGg+IDAgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctcm9zZS01MDAvMTAgYm9yZGVyLWIgYm9yZGVyLXJvc2UtNTAwLzIwIHB4LTYgcHktMi41IGZsZXggaXRlbXMtc3RhcnQgZ2FwLTMgdGV4dC1yb3NlLTgwMCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHotNDAgc2VsZWN0LW5vbmUgIHNocmluay0wXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHNocmluay0wXCI+8J+aqDwvc3Bhbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIHNwYWNlLXktMC41XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtZXh0cmFib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LVsxMHB4XSB0ZXh0LXJvc2UtNzAwIGJsb2NrXCI+VmFyacOhdmVpcyBkZSBBbWJpZW50ZSBBdXNlbnRlczwvc3Bhbj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbGF0ZS03MDAgbGVhZGluZy1yZWxheGVkIHRleHQtWzExcHhdXCI+XG4gICAgICAgICAgICAgICAgTyBzaXN0ZW1hIGRldGVjdG91IHF1ZSBhbGd1bWFzIGNoYXZlcyBvYnJpZ2F0w7NyaWFzIG7Do28gZm9yYW0gY29uZmlndXJhZGFzIG5vIGFycXVpdm8gPGNvZGUgY2xhc3NOYW1lPVwiYmctcm9zZS01MCBweC0xIHB5LTAuNSByb3VuZGVkIHRleHQtWzkuNXB4XVwiPi5lbnY8L2NvZGU+LiBcbiAgICAgICAgICAgICAgICBBbGd1bWFzIGZ1bmNpb25hbGlkYWRlcywgY29tbyBlbnZpbyBkZSBlLW1haWxzIG91IGludGVncmHDp8OjbyBjb20gbyBOOE4sIHBvZGVtIG7Do28gZnVuY2lvbmFyIGNvcnJldGFtZW50ZS5cbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMC41cHhdIHRleHQtcm9zZS03NTAgZm9udC1ib2xkIG10LTFcIj5cbiAgICAgICAgICAgICAgICBDaGF2ZXMgYXVzZW50ZXM6IHttaXNzaW5nRW52S2V5cy5qb2luKFwiLCBcIil9XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRNaXNzaW5nRW52S2V5cyhbXSl9IGNsYXNzTmFtZT1cInRleHQtcm9zZS02MDAgaG92ZXI6dGV4dC1yb3NlLTgwMCBweC0yIHB5LTEuNSByb3VuZGVkIGhvdmVyOmJnLXJvc2UtNTAwLzEwIHRyYW5zaXRpb24gZm9udC1ibGFjayB0ZXh0LVsxMHB4XSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgc2NhbGUtOTUgc2hyaW5rLTAgY3Vyc29yLXBvaW50ZXIgc2VsZi1jZW50ZXJcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBDaWVudGVcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIHtpbnZhbGlkRW52S2V5cy5sZW5ndGg+IDAgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctb3JhbmdlLTUwMC8xMCBib3JkZXItYiBib3JkZXItb3JhbmdlLTUwMC8yMCBweC02IHB5LTIuNSBmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0zIHRleHQtb3JhbmdlLTgwMCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHotNDAgc2VsZWN0LW5vbmUgIHNocmluay0wXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHNocmluay0wXCI+4pqg77iPPC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4LTEgc3BhY2UteS0wLjVcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1leHRyYWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtWzEwcHhdIHRleHQtb3JhbmdlLTcwMCBibG9ja1wiPlZhcmnDoXZlaXMgZGUgQW1iaWVudGUgY29tIEZvcm1hdG8gSW52w6FsaWRvPC9zcGFuPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTcwMCBsZWFkaW5nLXJlbGF4ZWQgdGV4dC1bMTFweF1cIj5cbiAgICAgICAgICAgICAgICBPIHNpc3RlbWEgZGV0ZWN0b3UgcXVlIGFsZ3VtYXMgY2hhdmVzIGZvcmFtIGNvbmZpZ3VyYWRhcyBjb20gdW0gZm9ybWF0byBpbnbDoWxpZG8gbm8gYXJxdWl2byA8Y29kZSBjbGFzc05hbWU9XCJiZy1vcmFuZ2UtNTAgcHgtMSBweS0wLjUgcm91bmRlZCB0ZXh0LVs5LjVweF1cIj4uZW52PC9jb2RlPi5cbiAgICAgICAgICAgICAgICBWZXJpZmlxdWUgc2UgVVJMcyBwb3NzdWVtIDxjb2RlIGNsYXNzTmFtZT1cImJnLW9yYW5nZS01MCBweC0xIHB5LTAuNSByb3VuZGVkIHRleHQtWzkuNXB4XVwiPmh0dHA6Ly88L2NvZGU+IG91IDxjb2RlIGNsYXNzTmFtZT1cImJnLW9yYW5nZS01MCBweC0xIHB5LTAuNSByb3VuZGVkIHRleHQtWzkuNXB4XVwiPmh0dHBzOi8vPC9jb2RlPiBlIHNlIHBvcnRhcyBzw6NvIGFwZW5hcyBuw7ptZXJvcy5cbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMC41cHhdIHRleHQtb3JhbmdlLTc1MCBmb250LWJvbGQgbXQtMVwiPlxuICAgICAgICAgICAgICAgIENoYXZlcyBjb20gZm9ybWF0byBpbnbDoWxpZG86IHtpbnZhbGlkRW52S2V5cy5qb2luKFwiLCBcIil9XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRJbnZhbGlkRW52S2V5cyhbXSl9IGNsYXNzTmFtZT1cInRleHQtb3JhbmdlLTYwMCBob3Zlcjp0ZXh0LW9yYW5nZS04MDAgcHgtMiBweS0xLjUgcm91bmRlZCBob3ZlcjpiZy1vcmFuZ2UtNTAwLzEwIHRyYW5zaXRpb24gZm9udC1ibGFjayB0ZXh0LVsxMHB4XSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgc2NhbGUtOTUgc2hyaW5rLTAgY3Vyc29yLXBvaW50ZXIgc2VsZi1jZW50ZXJcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBDaWVudGVcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIHtpc0FpS2V5TGVha2VkICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWFtYmVyLTUwMC8xMCBib3JkZXItYiBib3JkZXItYW1iZXItNTAwLzIwIHB4LTYgcHktMi41IGZsZXggaXRlbXMtc3RhcnQgZ2FwLTMgdGV4dC1hbWJlci04MDAgdGV4dC14cyBmb250LW1lZGl1bSB6LTQwIHNlbGVjdC1ub25lICBzaHJpbmstMFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSBzaHJpbmstMFwiPuKaoO+4jzwvc3Bhbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIHNwYWNlLXktMC41XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtZXh0cmFib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LVsxMHB4XSB0ZXh0LWFtYmVyLTcwMCBibG9ja1wiPk1vZG8gZGUgQ29udGluZ8OqbmNpYSAoSUEgY29tIFNjcmlwdHMgTG9jYWlzKTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbGF0ZS03MDAgbGVhZGluZy1yZWxheGVkIHRleHQtWzExcHhdXCI+XG4gICAgICAgICAgICAgICAgQSBjaGF2ZSBkZSBBUEkgR2VtaW5pIGRvIHNpc3RlbWEgZm9pIHRlbXBvcmFyaWFtZW50ZSBzdXNwZW5zYSBvdSBpZGVudGlmaWNhZGEgY29tbyB2YXphZGEuIFxuICAgICAgICAgICAgICAgIFBhcmEgZ2FyYW50aXIgYSBjb250aW51aWRhZGUgZGFzIHN1YXMgdmVuZGFzIGRlIGZvcm1hIGltcGVjw6F2ZWwsIGF0aXZhbW9zIG8gPHN0cm9uZz5Sb3RlaXJpemFkb3IgSW50ZWxpZ2VudGUgZGUgQ29udGluZ8OqbmNpYSBPZmYtbGluZTwvc3Ryb25nPiBcbiAgICAgICAgICAgICAgICBjb20gcmljYXMgcmVjZWl0YXMgZGUgYWx0YSBjb252ZXJzw6NvIHByw6ktcHJvZ3JhbWFkYXMgcGFyYSBMYWplYWRvLCBFc3RyZWxhIGUgcmVnacOjby4gXG4gICAgICAgICAgICAgICAgQ29udGludWUgb3BlcmFuZG8gbyBzaXN0ZW1hIG5vcm1hbG1lbnRlIVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIHt1c2VyUm9sZSA9PT0gXCJhZG1pblwiICYmIChcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMC41cHhdIHRleHQtc2t5LTc1MCBmb250LWJvbGQgbXQtMVwiPlxuICAgICAgICAgICAgICAgICAg8J+SoSBDb29yZGVuYWRvcjogUGFyYSByZWF0aXZhciBhIElBIGludGVsaWdlbnRlIGFkYXB0YXRpdmEgZW0gdGVtcG8gcmVhbCwgYXR1YWxpemUgYSB2YXJpw6F2ZWwgPGNvZGUgY2xhc3NOYW1lPVwiYmctc2t5LTUwIHB4LTEgcHktMC41IHJvdW5kZWQgdGV4dC1bOS41cHhdXCI+R0VNSU5JX0FQSV9LRVk8L2NvZGU+IG5hcyBDb25maWd1cmHDp8O1ZXMgZGEgcGxhdGFmb3JtYSBkbyBHb29nbGUgQUkgU3R1ZGlvLlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRJc0FpS2V5TGVha2VkKGZhbHNlKX0gY2xhc3NOYW1lPVwidGV4dC1hbWJlci02MDAgaG92ZXI6dGV4dC1hbWJlci04MDAgcHgtMiBweS0xLjUgcm91bmRlZCBob3ZlcjpiZy1hbWJlci01MDAvMTAgdHJhbnNpdGlvbiBmb250LWJsYWNrIHRleHQtWzEwcHhdIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBzY2FsZS05NSBzaHJpbmstMCBjdXJzb3ItcG9pbnRlciBzZWxmLWNlbnRlclwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIENvbXByZWVuZGlcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIHsvKiBNb2JpbGUgVG9wIE5hdmlnYXRpb24gSGVhZCAoVmlzaWJsZSBvbmx5IGJlbG93IGxnIHNjcmVlbiBzaXplKSAqL31cbiAgICAgICAgPG5hdiBjbGFzc05hbWU9XCJoLTE0IGxnOmhpZGRlbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNCBiZy13aGl0ZSBib3JkZXItYiBib3JkZXItc2xhdGUtMjAwIHNocmluay0wIHotNDAgc2VsZWN0LW5vbmVcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yLjUgY3Vyc29yLXBvaW50ZXJcIiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJkYXNoYm9hcmRcIil9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTcgaC03IGJnLXNreS02MDAgcm91bmRlZC1sZyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LXdoaXRlIGZvbnQtZXh0cmFib2xkIHRleHQteHMgc2hhZG93LXNtXCI+XG4gICAgICAgICAgICAgIE1IXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTkwMCBsZWFkaW5nLW5vbmVcIj5QYWluZWwgTUhORVQ8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzhweF0gdGV4dC1zbGF0ZS00MDAgZm9udC1ib2xkIHVwcGVyY2FzZSBtdC0wLjVcIj5MQUpFQURPIHwgRVNUUkVMQTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGhlbWUodGhlbWUgPT09IFwibGlnaHRcIiA/IFwiZGFya1wiIDogXCJsaWdodFwiKX0gXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHAtMS41IGJvcmRlciByb3VuZGVkLWxnIHRyYW5zaXRpb24gY3Vyc29yLXBvaW50ZXIgYWN0aXZlOnNjYWxlLTk1ICR7dGhlbWUgPT09IFwiZGFya1wiID8gXCJiZy1zbGF0ZS04MDAgYm9yZGVyLXNsYXRlLTcwMCB0ZXh0LWFtYmVyLTQwMCBob3Zlcjp0ZXh0LWFtYmVyLTMwMFwiIDogXCJiZy1zbGF0ZS01MCBib3JkZXItc2xhdGUtMjAwIHRleHQtc2xhdGUtNTUwIGhvdmVyOnRleHQtc2xhdGUtNzUwXCJ9YH1cbiAgICAgICAgICAgICAgdGl0bGU9e3RoZW1lID09PSBcImxpZ2h0XCIgPyBcIk1vZG8gRXNjdXJvXCIgOiBcIk1vZG8gQ2xhcm9cIn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3RoZW1lID09PSBcImxpZ2h0XCIgPyA8TW9vbiBjbGFzc05hbWU9XCJ3LTMgaC0zXCIgLz4gOiA8U3VuIGNsYXNzTmFtZT1cInctMyBoLTMgdGV4dC1hbWJlci01MDBcIiAvPn1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtcmlnaHRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWJvbGQgdGV4dC1zbGF0ZS05NTAgbGVhZGluZy1ub25lXCI+e2xvZ2dlZFVzZXIuc3BsaXQoXCIgXCIpWzBdfTwvZGl2PlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs4cHhdIGZvbnQtc2VtaWJvbGQgdGV4dC1za3ktNjAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3RcIj5cbiAgICAgICAgICAgICAgICB7dXNlclJvbGUgPT09IFwiYWRtaW5cIiA/IFwiQ09PUkRcIiA6IFwiUEFQXCJ9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPVwicC0xLjUgYmctc2xhdGUtNTAgYm9yZGVyIGJvcmRlci1zbGF0ZS0yMDAgdGV4dC1zbGF0ZS01NTAgcm91bmRlZC1sZyBob3ZlcjpiZy1yb3NlLTUwIGhvdmVyOnRleHQtcm9zZS02MDAgdHJhbnNpdGlvbiBjdXJzb3ItcG9pbnRlclwiXG4gICAgICAgICAgICAgIHRpdGxlPVwiU2FpclwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxMb2dPdXQgY2xhc3NOYW1lPVwidy0zIGgtM1wiIC8+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9uYXY+XG5cbiAgICAgICAgey8qIFByaW1hcnkgUGFnZSBDYW52YXMgU3RhZ2UgKi99XG4gICAgICAgIDxtYWluIGNsYXNzTmFtZT1cImZsZXgtMSBvdmVyZmxvdy15LWF1dG8gcHgtNCBweS00IG1kOnB4LTYgbWQ6cHktNiBoLVtjYWxjKDEwMHZoLTgwcHgpXSBsZzpoLVtjYWxjKDEwMHZoLTM2cHgpXSBiZy1zbGF0ZS0yMDAvNDAgc2hhZG93LVtpbnNldF8wXzRweF8xMHB4X3JnYmEoMCwwLDAsMC4wMildIHByaW50OmgtYXV0byBwcmludDpibG9jayBwcmludDpvdmVyZmxvdy12aXNpYmxlXCI+XG4gICAgICAgICAgey8qIEdsb2JhbCBTZWFyY2ggQmFyICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWItNiByZWxhdGl2ZVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICA8U2VhcmNoIGNsYXNzTmFtZT1cInctNSBoLTUgYWJzb2x1dGUgbGVmdC00IHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiB0ZXh0LXNsYXRlLTQwMFwiIC8+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJCdXNjYXIgZ2xvYmFsbWVudGUgKGxlYWRzLCBjbGllbnRlcywgdGFyZWZhcy4uLilcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtnbG9iYWxTZWFyY2hUZXJtfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0R2xvYmFsU2VhcmNoVGVybShlLnRhcmdldC52YWx1ZSl9IGNsYXNzTmFtZT1cInctZnVsbCBiZy13aGl0ZSBib3JkZXIgYm9yZGVyLXNsYXRlLTIwMC84MCByb3VuZGVkLTJ4bCBweS0zLjUgcGwtMTIgcHItNCB0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMCBzaGFkb3ctc20gZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctNCBmb2N1czpyaW5nLXNreS01MDAvMTAgZm9jdXM6Ym9yZGVyLXNreS00MDAgdHJhbnNpdGlvbi1hbGwgcGxhY2Vob2xkZXI6dGV4dC1zbGF0ZS00MDAvNzBcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7Z2xvYmFsU2VhcmNoVGVybSAmJiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRHbG9iYWxTZWFyY2hUZXJtKFwiXCIpfSBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC00IHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMCBiZy1zbGF0ZS0xMDAgcm91bmRlZC1mdWxsIHAtMSB0cmFuc2l0aW9uXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8WCBjbGFzc05hbWU9XCJ3LTMuNSBoLTMuNVwiIC8+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsvKiBTZWFyY2ggUmVzdWx0cyBEcm9wZG93bi1saWtlIHZpZXcgYnV0IGlubGluZSB0byBwdXNoIGNvbnRlbnQgZG93biAqL31cbiAgICAgICAgICAgIHtnbG9iYWxTZWFyY2hUZXJtICYmIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC00IGJnLXdoaXRlIGJvcmRlciBib3JkZXItc2xhdGUtMjAwIHJvdW5kZWQtMnhsIHAtNCBzaGFkb3cteGwgc3BhY2UteS00IG1heC1oLVs2MHZoXSBvdmVyZmxvdy15LWF1dG8gIHotNTAgcmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJsYWNrIHVwcGVyY2FzZSB0ZXh0LXNreS01MDAgdHJhY2tpbmctd2lkZXIgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgYm9yZGVyLWIgYm9yZGVyLXNsYXRlLTEwMCBwYi0yXCI+XG4gICAgICAgICAgICAgICAgICA8U3BhcmtsZXMgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+IFJlc3VsdGFkb3MgZGUgQnVzY2FcbiAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHsvKiBMZWFkcyBNYXRjaGVzICovfVxuICAgICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcyA9IGdsb2JhbFNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoaW5nTGVhZHMgPSBsZWFkcy5maWx0ZXIobCA9PiBsLm5vbWVMZWFkLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocykgfHwgKGwudGVsZWZvbmUgJiYgbC50ZWxlZm9uZS5pbmNsdWRlcyhzKSkpO1xuICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoaW5nTGVhZHMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtZXh0cmFib2xkIHVwcGVyY2FzZSB0ZXh0LXNsYXRlLTQwMCBtYi0yXCI+TGVhZHMgKHttYXRjaGluZ0xlYWRzLmxlbmd0aH0pPC9oND5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMS41XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bWF0Y2hpbmdMZWFkcy5tYXAobGVhZCA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtsZWFkLl9saW5oYX0gY2xhc3NOYW1lPVwidGV4dC14cyBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIGJnLXNsYXRlLTUwIGZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBob3Zlcjpib3JkZXItc2t5LTMwMCBob3ZlcjpiZy1za3ktNTAgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0R2xvYmFsU2VhcmNoVGVybShcIlwiKTsgc2V0QWN0aXZlVGFiKFwibGVhZHNcIik7IH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNsYXRlLTcwMFwiPntsZWFkLm5vbWVMZWFkfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWJvbGQgdGV4dC1za3ktNTAwIGJnLXNreS0xMDAgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsXCI+e2xlYWQuc3RhdHVzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pKCl9XG5cbiAgICAgICAgICAgICAgICB7LyogQmFzZSBNYXRjaGVzICovfVxuICAgICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcyA9IGdsb2JhbFNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoaW5nQmFzZSA9IGJhc2VDbGllbnRzLmZpbHRlcihjID0+IGMubm9tZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHMpIHx8IChjLmNpZGFkZSAmJiBjLmNpZGFkZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHMpKSk7XG4gICAgICAgICAgICAgICAgICBpZiAobWF0Y2hpbmdCYXNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWV4dHJhYm9sZCB1cHBlcmNhc2UgdGV4dC1zbGF0ZS00MDAgbWItMlwiPkJhc2UgZGUgQ2xpZW50ZXMgKHttYXRjaGluZ0Jhc2UubGVuZ3RofSk8L2g0PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0xLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHttYXRjaGluZ0Jhc2UubWFwKGNsaWVudCA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjbGllbnQuaWRDb250cmF0b30gY2xhc3NOYW1lPVwidGV4dC14cyBwLTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItc2xhdGUtMTAwIGJnLXNsYXRlLTUwIGZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBob3Zlcjpib3JkZXItc2t5LTMwMCBob3ZlcjpiZy1za3ktNTAgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0R2xvYmFsU2VhcmNoVGVybShcIlwiKTsgc2V0QWN0aXZlVGFiKFwiYmFzZVwiKTsgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc2xhdGUtNzAwXCI+e2NsaWVudC5ub21lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWJvbGQgdGV4dC1za3ktNTAwIGJnLXNreS0xMDAgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsXCI+e2NsaWVudC5wbGFub308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KSgpfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHsvKiBUYXNrcyBNYXRjaGVzICovfVxuICAgICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcyA9IGdsb2JhbFNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoaW5nVGFza3MgPSB0YXNrcy5maWx0ZXIodCA9PiB0LmRlc2NyaWNhby50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHMpKTtcbiAgICAgICAgICAgICAgICAgIGlmIChtYXRjaGluZ1Rhc2tzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWV4dHJhYm9sZCB1cHBlcmNhc2UgdGV4dC1zbGF0ZS00MDAgbWItMlwiPlRhcmVmYXMgKHttYXRjaGluZ1Rhc2tzLmxlbmd0aH0pPC9oND5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMS41XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bWF0Y2hpbmdUYXNrcy5tYXAodGFzayA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXt0YXNrLmlkfSBjbGFzc05hbWU9XCJ0ZXh0LXhzIHAtMi41IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1zbGF0ZS0xMDAgYmctc2xhdGUtNTAgZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIGhvdmVyOmJvcmRlci1lbWVyYWxkLTMwMCBob3ZlcjpiZy1lbWVyYWxkLTUwIGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb25cIiBvbkNsaWNrPXsoKSA9PiB7IHNldEdsb2JhbFNlYXJjaFRlcm0oXCJcIik7IHNldEFjdGl2ZVRhYihcInRhc2tzXCIpOyB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbGF0ZS03MDBcIj57dGFzay5kZXNjcmljYW99PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtYm9sZCB0ZXh0LWVtZXJhbGQtNjAwIGJnLWVtZXJhbGQtMTAwIHB4LTIgcHktMC41IHJvdW5kZWQtZnVsbFwiPnt0YXNrLnN0YXR1cyA9PT0gJ0NPTkNMVUlEQScgPyBcIkZlaXRhXCIgOiBcIlBlbmRlbnRlXCJ9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSkoKX1cblxuICAgICAgICAgICAgICAgIHtsZWFkcy5maWx0ZXIobCA9PiBsLm5vbWVMZWFkLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZ2xvYmFsU2VhcmNoVGVybS50b0xvd2VyQ2FzZSgpKSkubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgICAgICAgIGJhc2VDbGllbnRzLmZpbHRlcihjID0+IGMubm9tZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGdsb2JhbFNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSkpLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICB0YXNrcy5maWx0ZXIodCA9PiB0LmRlc2NyaWNhby50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGdsb2JhbFNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSkpLmxlbmd0aCA9PT0gMCAmJiAoXG4gICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXNsYXRlLTQwMCBmb250LXNlbWlib2xkIHRleHQtY2VudGVyIHB5LTRcIj5OZW5odW0gcmVzdWx0YWRvIGVuY29udHJhZG8uPC9wPlxuICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7bG9hZGluZyAmJiBsZWFkcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB5LTI0IHRleHQtc2xhdGUtNDAwIHRleHQteHMgZm9udC1zYW5zIHNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICA8TG9hZGVyMiBjbGFzc05hbWU9XCJ3LTggaC04IHRleHQtc2t5LTYwMCBhbmltYXRlLXNwaW5cIiAvPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJmb250LWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtWzEwcHhdIHRleHQtc2xhdGUtNTAwXCI+U2luY3Jvbml6YW5kbyBMZWFkcyB2aWEgR29vZ2xlIFNoZWV0cy4uLjwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICByZW5kZXJBY3RpdmVQYWdlKClcbiAgICAgICAgICApfVxuICAgICAgICA8L21haW4+XG5cbiAgICAgICAgey8qIENvbXBhY3QgSW50ZXJhY3RpdmUgVGFiIEJhciBQYW5lbCAoTW9iaWxlIE9ubHkgLSBoaWRkZW4gb24gZGVza3RvcCBsZykgKi99XG4gICAgICAgIDxuYXYgY2xhc3NOYW1lPVwibGc6aGlkZGVuIGJnLXdoaXRlIGJvcmRlci10IGJvcmRlci1zbGF0ZS0yMDAgcHktMiBweC00IGZsZXggb3ZlcmZsb3cteC1hdXRvIGdhcC01IGl0ZW1zLWNlbnRlciBzaGFkb3ctWzBfLTJweF8xMHB4X3JnYmEoMCwwLDAsMC4wMildIHotNTAgc2hyaW5rLTAgc2VsZWN0LW5vbmUgZm9udC1zYW5zIFsmOjotd2Via2l0LXNjcm9sbGJhcl06aGlkZGVuXCI+XG4gICAgICAgICAgXG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJkYXNoYm9hcmRcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LXNocmluay0wIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0wLjUgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiZGFzaGJvYXJkXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgPEFjdGl2aXR5IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bOXB4XSBmb250LWV4dHJhYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctdGlnaHRcIj5Ib21lPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldExlYWRzRmlsdGVyU2VsbGVyKG51bGwpO1xuICAgICAgICAgICAgICBzZXRBY3RpdmVUYWIoXCJsZWFkc1wiKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LXNocmluay0wIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0wLjUgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwibGVhZHNcIiA/IFwidGV4dC1za3ktNjAwIGZvbnQtYm9sZFwiIDogXCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMCBmb250LW1lZGl1bVwiXG4gICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICA8VXNlcnMgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtZXh0cmFib2xkIHVwcGVyY2FzZSB0cmFja2luZy10aWdodFwiPkxlYWRzPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJiYXNlXCIpfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC1zaHJpbmstMCBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBnYXAtMC41IGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gJHtcbiAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImJhc2VcIiA/IFwidGV4dC1za3ktNjAwIGZvbnQtYm9sZFwiIDogXCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMCBmb250LW1lZGl1bVwiXG4gICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICA8QXdhcmQgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtZXh0cmFib2xkIHVwcGVyY2FzZSB0cmFja2luZy10aWdodFwiPkJhc2U8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcImxlYWRzX2ZyaW9zXCIpfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC1zaHJpbmstMCBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBnYXAtMC41IGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gJHtcbiAgICAgICAgICAgICAgYWN0aXZlVGFiID09PSBcImxlYWRzX2ZyaW9zXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgPEZpbGVTcHJlYWRzaGVldCBjbGFzc05hbWU9XCJ3LTQgaC00IFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtZXh0cmFib2xkIHVwcGVyY2FzZSB0cmFja2luZy10aWdodFwiPkZyaW9zPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJjb2JyYW5jYXNcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LXNocmluay0wIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0wLjUgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiY29icmFuY2FzXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgPENvaW5zIGNsYXNzTmFtZT1cInctNCBoLTQgdGV4dC1yb3NlLTUwMFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtZXh0cmFib2xkIHVwcGVyY2FzZSB0cmFja2luZy10aWdodFwiPkNvYnJhcjwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwiZnR0YVwiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtc2hyaW5rLTAgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZ2FwLTAuNSBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gXCJmdHRhXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgPE1hcFBpbiBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1leHRyYWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXRpZ2h0XCI+RlRUQTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwidGFza3NcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LXNocmluay0wIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0wLjUgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwidGFza3NcIiA/IFwidGV4dC1za3ktNjAwIGZvbnQtYm9sZFwiIDogXCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMCBmb250LW1lZGl1bVwiXG4gICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICA8Q2xpcGJvYXJkTGlzdCBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1leHRyYWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXRpZ2h0XCI+VGFyZWZhczwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwiaW5zdGFsbGF0aW9uc1wiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtc2hyaW5rLTAgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZ2FwLTAuNSBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gXCJpbnN0YWxsYXRpb25zXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgPENhbGVuZGFyRGF5cyBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1leHRyYWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXRpZ2h0XCI+QWdlbmRhPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAge3VzZXJSb2xlID09PSBcImFkbWluXCIgJiYgKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJlc3RyYXRlZ2lhXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtc2hyaW5rLTAgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZ2FwLTAuNSBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiZXN0cmF0ZWdpYVwiID8gXCJ0ZXh0LXNreS02MDAgZm9udC1ib2xkXCIgOiBcInRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtc2xhdGUtNjAwIGZvbnQtbWVkaXVtXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgPEJvdCBjbGFzc05hbWU9XCJ3LTQgaC00IHRleHQtYmx1ZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1leHRyYWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXRpZ2h0XCI+RXN0cmF0w6lnaWE8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVRhYihcInZlbmRlZG9yZXNcIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC1zaHJpbmstMCBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBnYXAtMC41IGN1cnNvci1wb2ludGVyIHRyYW5zaXRpb24gJHtcbiAgICAgICAgICAgICAgICAgIGFjdGl2ZVRhYiA9PT0gXCJ2ZW5kZWRvcmVzXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8U2xpZGVycyBjbGFzc05hbWU9XCJ3LTQgaC00IHRleHQtc2t5LTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bOXB4XSBmb250LWV4dHJhYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctdGlnaHRcIj5NZXRhczwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwiYWRtaW5fbjhuXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtc2hyaW5rLTAgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZ2FwLTAuNSBjdXJzb3ItcG9pbnRlciB0cmFuc2l0aW9uICR7XG4gICAgICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwiYWRtaW5fbjhuXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICA8TGluayBjbGFzc05hbWU9XCJ3LTQgaC00IHRleHQtYmx1ZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1leHRyYWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXRpZ2h0XCI+TjhOPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG5cblxuXG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIoXCJwb3NfdmVuZGFcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LXNocmluay0wIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0wLjUgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwicG9zX3ZlbmRhXCIgPyBcInRleHQtc2t5LTYwMCBmb250LWJvbGRcIiA6IFwidGV4dC1zbGF0ZS00MDAgaG92ZXI6dGV4dC1zbGF0ZS02MDAgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgPFVzZXJDaGVjayBjbGFzc05hbWU9XCJ3LTQgaC00IHRleHQtZW1lcmFsZC01MDBcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bOXB4XSBmb250LWV4dHJhYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctdGlnaHRcIj5Qw7NzIFZlbmRhPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKFwidHJhZGVcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LXNocmluay0wIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0wLjUgY3Vyc29yLXBvaW50ZXIgdHJhbnNpdGlvbiAke1xuICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IFwidHJhZGVcIiA/IFwidGV4dC1za3ktNjAwIGZvbnQtYm9sZFwiIDogXCJ0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXNsYXRlLTYwMCBmb250LW1lZGl1bVwiXG4gICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICA8U3RvcmUgY2xhc3NOYW1lPVwidy00IGgtNCB0ZXh0LXNreS01MDBcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bOXB4XSBmb250LWV4dHJhYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctdGlnaHRcIj5UcmFkZTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICA8L25hdj5cblxuICAgICAgPC9kaXY+XG5cbiAgICAgIHsvKiBDdXN0b20gUFdBIEluc3RhbGxhdGlvbiBCYW5uZXIgKi99XG4gICAgICB7c2hvd1BXQUJhbm5lciAmJiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgdG9wLTAgbGVmdC0wIHJpZ2h0LTAgei1bOTk5OTldIGJnLXNsYXRlLTkwMCBib3JkZXItYiBib3JkZXItc2xhdGUtNzAwIHAtNCBzaGFkb3cteGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGFuaW1hdGUtaW4gc2xpZGUtaW4tZnJvbS10b3BcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCBiZy1ncmFkaWVudC10by10ciBmcm9tLXNreS01MDAgdG8tc2t5LTYwMCByb3VuZGVkLXhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNocmluay0wXCI+XG4gICAgICAgICAgICAgIDxEb3dubG9hZCBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1ib2xkIGxlYWRpbmctdGlnaHRcIj5JbnN0YWxlIG8gQXBwIE1ITkVUPC9wPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNsYXRlLTQwMCB0ZXh0LVsxMHB4XSBsZWFkaW5nLXRpZ2h0IG10LTAuNVwiPkFjZXNzbyByw6FwaWRvIGUgb2ZmbGluZTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwd2FfYmFubmVyX2Rpc21pc3NlZCcsICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgc2V0U2hvd1BXQUJhbm5lcihmYWxzZSk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTIgcHktMS41IHRleHQtc2xhdGUtNDAwIGhvdmVyOnRleHQtd2hpdGUgdGV4dC1bMTBweF0gZm9udC1ib2xkIHVwcGVyY2FzZVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIEFnb3JhIG7Do29cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmVycmVkUHJvbXB0KSB7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZFByb21wdC5wcm9tcHQoKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHsgb3V0Y29tZSB9ID0gYXdhaXQgZGVmZXJyZWRQcm9tcHQudXNlckNob2ljZTtcbiAgICAgICAgICAgICAgICAgIGlmIChvdXRjb21lID09PSAnYWNjZXB0ZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldERlZmVycmVkUHJvbXB0KG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBzZXRTaG93UFdBQmFubmVyKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3B3YV9iYW5uZXJfZGlzbWlzc2VkJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc2V0U2hvd1BXQUluc3RydWN0aW9ucyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgIHNldFNob3dQV0FCYW5uZXIoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgYmctc2t5LTYwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtbGcgdGV4dC1bMTBweF0gZm9udC1ib2xkIHVwcGVyY2FzZSBob3ZlcjpiZy1za3ktNTAwIHNoYWRvdyBzaGFkb3ctc2t5LTkwMC81MFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIEluc3RhbGFyXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgICAgey8qIEZsb2F0aW5nIEFJIEFnZW50IHRyaWdnZXIgYnViYmxlICovfVxuICAgICAgPGJ1dHRvbiBpZD1cImZsb2F0aW5nLWFpLWFnZW50LXRyaWdnZXItYmFkZ2VcIlxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgc2V0SXNBaUNoYXRPcGVuKHRydWUpO1xuICAgICAgICAgIHNldFVucmVhZEFpVGlwcygwKTtcbiAgICAgICAgICBzZXRJc0JhZGdlUHVsc2luZyhmYWxzZSk7XG4gICAgICAgIH19IGNsYXNzTmFtZT17YHByaW50OmhpZGRlbiBmaXhlZCBib3R0b20tMTYgcmlnaHQtNCBsZzpib3R0b20tNiBsZzpyaWdodC02IHctMTIgaC0xMiBiZy1ncmFkaWVudC10by10ciBmcm9tLXNreS02MDAgdG8tc2t5LTgwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtMnhsIHNoYWRvdy14bCBob3ZlcjpzY2FsZS0xMTAgaG92ZXI6LXRyYW5zbGF0ZS15LTEgYWN0aXZlOnNjYWxlLTk1IHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCBlYXNlLW91dCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBib3JkZXIgYm9yZGVyLXNreS01MDAvNTAgaG92ZXI6c2hhZG93LXNreS05MDAvMTAgei1bOTk5OTldIGN1cnNvci1wb2ludGVyICR7aXNCYWRnZVB1bHNpbmcgPyAnYW5pbWF0ZS1waW5nJyA6ICdhbmltYXRlLXB1bHNlLWxpZ2h0J31gfVxuICAgICAgICB0aXRsZT1cIkFzc2lzdGVudGUgQ29tZXJjaWFsIElBXCJcbiAgICAgID5cbiAgICAgICAgPEJvdCBjbGFzc05hbWU9XCJ3LTYgaC02IHN0cm9rZS1bMi4yXVwiIC8+XG4gICAgICAgIHt1bnJlYWRBaVRpcHMgPiAwICYmIChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhYnNvbHV0ZSAtdG9wLTIgLXJpZ2h0LTIgYmctcm9zZS01MDAgdGV4dC13aGl0ZSB0ZXh0LVs5cHhdIGZvbnQtYmxhY2sgdy01IGgtNSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciByb3VuZGVkLWZ1bGwgYm9yZGVyLTIgYm9yZGVyLXNsYXRlLTkwMCBzaGFkb3ctbWRcIj5cbiAgICAgICAgICAgIHt1bnJlYWRBaVRpcHN9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApfVxuICAgICAgPC9idXR0b24+XG5cbiAgICAgIHsvKiBGbG9hdGluZyBwb3B1cCBhZ2VudCBkaWFsb2cgY29udHJvbGxlciAqL31cbiAgICAgIDxDaGF0TW9kYWxcbiAgICAgICAgaXNPcGVuPXtpc0FpQ2hhdE9wZW59XG4gICAgICAgIG9uQ2xvc2U9eygpID0+IHNldElzQWlDaGF0T3BlbihmYWxzZSl9XG4gICAgICAgIG9uU2VuZENoYXRNZXNzYWdlPXtoYW5kbGVTZW5kQ2hhdE1lc3NhZ2V9IC8+XG5cblxuXG4gICAgICB7LyogUFdBIEluc3RydWN0aW9ucyBNb2RhbCAqL31cbiAgICAgIHtzaG93UFdBSW5zdHJ1Y3Rpb25zICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLXNsYXRlLTkwMC84MCBiYWNrZHJvcC1ibHVyLXNtIHotWzk5OTk5OV0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1zbGF0ZS05MDAgYm9yZGVyIGJvcmRlci1zbGF0ZS03MDAgcm91bmRlZC0yeGwgdy1mdWxsIG1heC13LXNtIHAtNiBzaGFkb3ctMnhsIHJlbGF0aXZlIHRleHQtY2VudGVyIHNwYWNlLXktNFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93UFdBSW5zdHJ1Y3Rpb25zKGZhbHNlKX0gY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTQgcmlnaHQtNCB0ZXh0LXNsYXRlLTQwMCBob3Zlcjp0ZXh0LXdoaXRlIHRyYW5zaXRpb25cIj5cbiAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3LTUgaC01XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PHBhdGggc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIHN0cm9rZVdpZHRoPXsyfSBkPVwiTTYgMThMMTggNk02IDZsMTIgMTJcIi8+PC9zdmc+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXgtYXV0byB3LTEyIGgtMTIgYmctc2t5LTUwMC8yMCB0ZXh0LXNreS00MDAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwidy02IGgtNlwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxwYXRoIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBzdHJva2VXaWR0aD17Mn0gZD1cIk00IDE2djFhMyAzIDAgMDAzIDNoMTBhMyAzIDAgMDAzLTN2LTFtLTQtNGwtNCA0bTAgMGwtNC00bTQgNFY0XCIvPjwvc3ZnPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC13aGl0ZVwiPkluc3RhbGFyIEFwbGljYXRpdm88L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtc2xhdGUtNDAwIHNwYWNlLXktMiB0ZXh0LWxlZnQgYmctc2xhdGUtODAwLzUwIHAtNCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItc2xhdGUtNzAwLzUwXCI+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGQgdGV4dC1zbGF0ZS0zMDBcIj5Db21vIGluc3RhbGFyIG5vIHNldSBjZWx1bGFyOjwvcD5cbiAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtZGlzYyBwbC00IHNwYWNlLXktMVwiPlxuICAgICAgICAgICAgICAgIDxsaT48c3Ryb25nPk5vIGlPUyAoU2FmYXJpKTo8L3N0cm9uZz4gVG9xdWUgbm8gw61jb25lIGRlIENvbXBhcnRpbGhhciBlIHNlbGVjaW9uZSBcIkFkaWNpb25hciDDoCBUZWxhIGRlIEluw61jaW9cIi48L2xpPlxuICAgICAgICAgICAgICAgIDxsaT48c3Ryb25nPk5vIEFuZHJvaWQgKENocm9tZSk6PC9zdHJvbmc+IFRvcXVlIG5vIG1lbnUgKDMgcG9udG9zKSBlIHNlbGVjaW9uZSBcIkluc3RhbGFyIGFwbGljYXRpdm9cIiBvdSBcIkFkaWNpb25hciDDoCB0ZWxhIGluaWNpYWxcIi48L2xpPlxuICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFNob3dQV0FJbnN0cnVjdGlvbnMoZmFsc2UpfSBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMyBiZy1za3ktNjAwIGhvdmVyOmJnLXNreS01MDAgdGV4dC13aGl0ZSByb3VuZGVkLXhsIHRleHQtc20gZm9udC1ib2xkIHRyYW5zaXRpb25cIj5cbiAgICAgICAgICAgICAgRW50ZW5kaWRvXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sIm1hcHBpbmdzIjoiQUFtcUNNLFNBcTdCTSxVQXI3Qk47QUFucUNOO0FBQUE7QUFBQTtBQUFBO0FBS0EsU0FBZ0IsVUFBVSxpQkFBaUI7QUFDM0M7QUFBQSxFQUFTO0FBQUEsRUFDUDtBQUFBLEVBQUs7QUFBQSxFQUEwQjtBQUFBLEVBQVE7QUFBQSxFQUFTO0FBQUEsRUFBTztBQUFBLEVBQ3ZEO0FBQUEsRUFBUTtBQUFBLEVBQU87QUFBQSxFQUFZO0FBQUEsRUFBZ0I7QUFBQSxFQUFjO0FBQUEsRUFBVTtBQUFBLEVBQU07QUFBQSxFQUFNO0FBQUEsRUFBVTtBQUFBLEVBQU87QUFBQSxFQUFVO0FBQUEsRUFBUztBQUFBLEVBQU07QUFBQSxFQUF1QjtBQUFBLEVBQVc7QUFBQSxFQUFPO0FBQUEsRUFBaUI7QUFBQSxFQUMxSztBQUFBLEVBQVE7QUFBQSxFQUFHO0FBQUEsRUFBVTtBQUFBLEVBQUs7QUFBQSxPQUFZO0FBT2pELFNBQStCLHVCQUF1QjtBQUd0RCxPQUFPLGVBQWU7QUFDdEIsT0FBTywyQkFBMkI7QUFDbEMsT0FBTyw0QkFBNEI7QUFDbkMsT0FBTyxlQUFlO0FBQ3RCLE9BQU8sY0FBYztBQUNyQixPQUFPLGVBQWU7QUFDdEIsT0FBTyxvQkFBb0I7QUFDM0IsT0FBTyx3QkFBd0I7QUFDL0IsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyxvQkFBb0I7QUFDM0IsT0FBTyxrQkFBa0I7QUFDekIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxvQkFBb0I7QUFDM0IsT0FBTyxvQkFBb0I7QUFDM0IsT0FBTyxlQUFlO0FBQ3RCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sb0JBQW9CO0FBQzNCLE9BQU8sdUJBQXVCO0FBQzlCLE9BQU8seUJBQXlCO0FBQ2hDLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sbUJBQW1CO0FB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