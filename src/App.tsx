/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Terminal, Database, CheckCircle, 
  Bot, Wifi, WifiOff, RefreshCw, LogOut, Loader2, Award, ClipboardList, 
  MapPin, Users, HelpCircle, Activity, Info, CalendarDays, BookOpen, User, Lock, Sparkles, Coins, Download, Sliders, Link, Calculator, Lightbulb, UserCheck, Store, FileSpreadsheet, Zap
, Archive, Search, X, FileText, Sun, Moon } from 'lucide-react';

import { 
  Vendor, Lead, Task, Absence, FttaItem, FttaProspeccao, Competitor, BaseClient, BaseActionLog, Cobranca, CobrancaLog, Installation 
} from "./types";

// Static fallback data
import { FALLBACK_COMPETITORS, INITIAL_VENDORS } from "./data";

// Components
import Dashboard from "./components/Dashboard";
import InternalProtocolsPage from "./components/InternalProtocolsPage";
import InstallationsQueuePage from "./components/InstallationsQueuePage";
import LeadsPage from "./components/LeadsPage";
import FttaPage from "./components/FttaPage";
import TasksPage from "./components/TasksPage";
import IndicatorsPage from "./components/IndicatorsPage";
import BaseManagementPage from "./components/BaseManagementPage";
import CompetitorsPage from "./components/CompetitorsPage";
import ObjectionsPage from "./components/ObjectionsPage";
import AbsencesPage from "./components/AbsencesPage";
import MaterialsPage from "./components/MaterialsPage";
import PlanosPage from "./components/PlanosPage";
import RotaVendasPage from "./components/RotaVendasPage";
import EstrategiaPage from "./components/EstrategiaPage";
import ChatModal from "./components/ChatModal";
import CobrancasPage from "./components/CobrancasPage";
import VendedoresPage from "./components/VendedoresPage";
import InstallationsPage from "./components/InstallationsPage";
import ExternalStorePortal from "./components/ExternalStorePortal";
import { AdminN8NPage } from "./components/AdminN8NPage";
import AdminLogsPage from "./components/AdminLogsPage";
import AdminTestResultsPage from "./components/AdminTestResultsPage";
import GestaoPessoasPage from "./components/GestaoPessoasPage";
import DatabaseCentralPage from "./components/DatabaseCentralPage";
import CalculoMultaPage from "./components/CalculoMultaPage";
import KaizenPage from "./components/KaizenPage";
import PosVendaPage from "./components/PosVendaPage";
import MatrizObjecoesPage from "./components/MatrizObjecoesPage";
import TradePage from "./components/TradePage";
import { LeadsFriosTab } from "./components/LeadsFriosTab";
import ArquivoMortoPage from "./components/ArquivoMortoPage";

import { initAuth, getAccessToken, googleSignIn } from "./lib/auth";
import { createGoogleCalendarEvent, createGoogleTask } from "./lib/googleApi";

export default function App() {
  // Theme selection state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Authentication & session
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [loggedUser, setLoggedUser] = useState<string>("");
  const [userRole, setUserRole] = useState<"vendedor" | "admin" | "">("");
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

  // Global Syncing state
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Primary State collections
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fttaItems, setFttaItems] = useState<FttaItem[]>([]);
  const [fttaProsps, setFttaProsps] = useState<FttaProspeccao[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [baseClients, setBaseClients] = useState<BaseClient[]>([]);
  const [baseActions, setBaseActions] = useState<BaseActionLog[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);

  // Navigation Trackings
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "leads" | "cadastroLead" | "ftta" | "tasks" | "indicators" | "base" | "competitors" | "objections" | "absences" | "materials" | "cobrancas" | "vendedores" | "installations" | "installations_queue" | "admin_n8n" | "calculo_multa" | "planos" | "rotas" | "estrategia" | "kaizen" | "pos_venda" | "matriz_objecoes" | "trade" | "leads_frios" | "protocolos_internos" | "admin_logs" | "admin_tests" | "gestao_pessoas" | "database_central"
  >("dashboard");
  const [leadsFilterSeller, setLeadsFilterSeller] = useState<string | null>(null);
  const [isExternalPartnerMode, setIsExternalPartnerMode] = useState(false);
  const [fttaTab, setFttaTab] = useState<"lajeado" | "estrela" | "prospeccao">("lajeado");

  // Dynamic list of registered vendors (objects)
  const [registeredVendors, setRegisteredVendors] = useState<Vendor[]>([]);

  // Dynamic vendors suggestions matching spreadsheet data
  const [availableVendors, setAvailableVendors] = useState<string[]>(INITIAL_VENDORS);

  // Monitor if Gemini API Key was flagged as leaked or reported
  const [isAiKeyLeaked, setIsAiKeyLeaked] = useState(false);
  const [aiKeyErrorMessage, setAiKeyErrorMessage] = useState("");
  const [missingEnvKeys, setMissingEnvKeys] = useState<string[]>([]);
  const [invalidEnvKeys, setInvalidEnvKeys] = useState<string[]>([]);

  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWABanner, setShowPWABanner] = useState(false);
  const [showPWAInstructions, setShowPWAInstructions] = useState(false);


  // Load actual active vendors list on mount
  useEffect(() => {
    initAuth(
      () => setHasGoogleAuth(true),
      () => setHasGoogleAuth(false)
    );

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowPWABanner(false);
      localStorage.setItem('pwa_banner_dismissed', 'true');
    });

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);
    const isDismissed = localStorage.getItem('pwa_banner_dismissed') === 'true';

    if (!isStandalone && !isDismissed && window.innerWidth < 768) {
      const bannerTimer = setTimeout(() => setShowPWABanner(true), 3000);
      return () => clearTimeout(bannerTimer);
    }


    if (window.location.search.includes("mode=equipe-loja")) {
      setIsExternalPartnerMode(true);
    }
    
    if (window.location.search.includes("tab=cadastroLead")) {
      setActiveTab("cadastroLead");
    }

    fetch("/api/gemini/status")
      .then(res => res.json())
      .then(d => {
        if (d && d.isLeaked) {
          setIsAiKeyLeaked(true);
          setAiKeyErrorMessage(d.errorMessage || "Your API key was reported as leaked.");
        }
      })
      .catch(err => console.warn("Erro ao buscar status do Gemini:", err));

    fetch("/api/config/status")
      .then(res => res.json())
      .then(d => {
        if (d && d.status === "issues") {
          if (d.missingKeys && d.missingKeys.length> 0) {
            console.error("⚠️ Variáveis de ambiente obrigatórias ausentes no .env:", d.missingKeys);
            setMissingEnvKeys(d.missingKeys);
          }
          if (d.invalidFormatKeys && d.invalidFormatKeys.length> 0) {
            console.error("⚠️ Variáveis de ambiente com formato inválido no .env:", d.invalidFormatKeys);
            setInvalidEnvKeys(d.invalidFormatKeys);
          }
        }
      })
      .catch(err => console.warn("Erro ao verificar chaves de ambiente:", err));

    fetch("/api/vendors")
      .then(res => res.json())
      .then(d => {
        if (d && d.vendors && d.vendors.length> 0) {
          setRegisteredVendors(d.vendors);
          const combined = d.vendors.map((v: any) => v.nome);
          setAvailableVendors(combined);
        }
      })
      .catch(err => console.warn("Erro ao buscar vendedores:", err));

    fetch("/api/competitors")
      .then(res => res.json())
      .then(d => {
        if (d && d.competitors) {
          setCompetitors(d.competitors);
        }
      })
      .catch(err => console.warn("Erro ao buscar concorrentes:", err));

    fetch("/api/installations")
      .then(res => res.json())
      .then(d => {
        if (d && d.installations) {
          setInstallations(d.installations);
        }
      })
      .catch(err => console.warn("Erro ao buscar instalações:", err));
  }, []);

  // Floating AI chat trigger popup
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [unreadAiTips, setUnreadAiTips] = useState(0);
  const [isBadgePulsing, setIsBadgePulsing] = useState(false);

  useEffect(() => {
    // Simula o recebimento de uma nova dica de abordagem da IA após 15 segundos
    const timer = setTimeout(() => {
      setUnreadAiTips(prev => prev + 1);
      setIsBadgePulsing(true);
      // Para a pulsação após 5 segundos
      setTimeout(() => setIsBadgePulsing(false), 5000);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);



  useEffect(() => {
    console.log("[App.tsx] activeTab changed:", activeTab);
  }, [activeTab]);

  useEffect(() => {
    console.log("[App.tsx] userRole changed:", userRole);
  }, [userRole]);

  useEffect(() => {
    console.log("[App.tsx] loggedUser changed:", loggedUser);
  }, [loggedUser]);

  // Monitor online network connectivity
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

  // Sync data on session login success
  useEffect(() => {
    const savedUser = localStorage.getItem("mhnet_user");
    let savedRole = localStorage.getItem("mhnet_role");
    if (savedUser) {
      const lower = savedUser.toLowerCase();
      if (
        lower.includes("bruno queiroz") || 
        lower.includes("bruno garcia") || 
        lower.includes("gestor") || 
        lower.includes("admin")
      ) {
        savedRole = "admin";
        localStorage.setItem("mhnet_role", "admin");
      }
      setLoggedUser(savedUser);
      setUserRole(savedRole as any || "vendedor");
    }
  }, []);

  // Fetch from Express back-end endpoints
  const fetchAllData = async () => {
    if (!loggedUser) return;
    setLoading(true);
    setIsSyncing(true);
    try {
      // 1. Fetch leads
      const rLeads = await fetch("/api/leads");
      if (rLeads.ok) {
        const d = await rLeads.json();
        setLeads(d.data || []);
      }

      // Fetch vendors list
      const rVendors = await fetch("/api/vendors");
      if (rVendors.ok) {
        const d = await rVendors.json();
        if (d && d.vendors) {
          setRegisteredVendors(d.vendors);
          setAvailableVendors(d.vendors.map((v: any) => v.nome));
        }
      }

      // 2. Fetch FTTA mappings
      const rFtta = await fetch("/api/ftta");
      if (rFtta.ok) {
        const d = await rFtta.json();
        setFttaItems(d.sites || []);
        setFttaProsps(d.prospeccoes || []);
      }

      // 3. Fetch Tasks checklist
      const rTasks = await fetch("/api/tasks");
      if (rTasks.ok) {
        const d = await rTasks.json();
        setTasks(d.tasks || []);
      }

      // 4. Fetch Absences
      const rAbs = await fetch("/api/absences");
      if (rAbs.ok) {
        const d = await rAbs.json();
        setAbsences(d.absences || []);
      }

      // 5. Fetch Portfolio Clients
      const rBase = await fetch("/api/base");
      if (rBase.ok) {
        const d = await rBase.json();
        setBaseClients(d.clients || []);
        setBaseActions(d.actions || []);
      }

      // 6. Fetch Cobrancas
      const rCob = await fetch("/api/cobrancas");
      if (rCob.ok) {
        const d = await rCob.json();
        setCobrancas(d.cobrancas || []);
        saveOfflineCache("cobrancas", d.cobrancas || []);
      }

      // Fetch competitors list
      const rComp = await fetch("/api/competitors");
      if (rComp.ok) {
        const d = await rComp.json();
        setCompetitors(d.competitors || []);
      }

      // Fetch installations list
      const rInst = await fetch("/api/installations");
      if (rInst.ok) {
        const d = await rInst.json();
        setInstallations(d.installations || []);
      }

      const d = new Date();
      setLastSyncTime(`${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
    } catch (e) {
      console.warn("⚠️ API de rede inacessível. Utilizando modo offline local localstorage.", e);
      // Load offline cache on fault
      loadOfflineLocalStorageDataCache();
    } finally {
      setLoading(false);
      setIsSyncing(false);
      setIsInitialLoad(false);
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

  const saveOfflineCache = (key: string, data: any) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn("Erro ao salvar cache", e);
    }
  };

  useEffect(() => {
    if (loggedUser) {
      fetchAllData();

      // Sincronização automática em segundo plano a cada 2 minutos
      const interval = setInterval(() => {
        fetchAllData();
      }, 2 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
    }, [loggedUser]);

  // Session Login workflow logic
  const processLoginAction = (cleanName: string) => {
    let detectedRole: "vendedor" | "admin" = "vendedor";
    const lowerClean = cleanName.toLowerCase();
    
    if (
      lowerClean === "admin" || 
      lowerClean === "gestor" || 
      lowerClean === "123" ||
      lowerClean.includes("bruno queiroz") ||
      lowerClean.includes("bruno garcia")
    ) {
      detectedRole = "admin";
    }

    localStorage.setItem("mhnet_user", cleanName);
    localStorage.setItem("mhnet_role", detectedRole);
    
    // Start gorgeous login animation flow
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
    }, 2000);

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
    } catch (e: any) {
      console.error(e);
      setLoginError("Erro ao autenticar com o Google. Tente novamente.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
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

  // CALLBACK INTERACTION ACTION ENDPOINTS:
  // 1. Leads creation and editions sync
  const handleSaveLead = async (payload: any) => {
    const isNew = !payload._linha;
    const todayStr = new Date().toLocaleDateString("pt-BR");
    const nowTimeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    let updatedLeads = [...leads];
    
    if (isNew) {
      const newLead: Lead = {
        _linha: leads.length + 2, // estimate sheet row
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
      if (newLead.status === "Venda Fechada" || (newLead.status as string) === "Frio" || (newLead.status as string) === "Lead Frio") {
        updatedLeads = updatedLeads.filter(l => l._linha !== newLead._linha);
      }
      setLeads(updatedLeads);
      saveOfflineCache("leads", updatedLeads);

      // Call API
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLead)
        });
      } catch (e) { } 
    } else {
      // Edit
      updatedLeads = leads.map(l => {
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
         updatedLeads = updatedLeads.filter(l => l._linha !== payload._linha);
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

  const handleDeleteLead = async (rowId: string) => {
    const deletedLinhaNum = parseInt(rowId, 10);
    const updated = leads
      .filter(l => String(l._linha) !== String(rowId))
      .map(l => {
        const currentLinha = typeof l._linha === 'number' ? l._linha : parseInt(String(l._linha), 10);
        if (currentLinha> deletedLinhaNum) {
          return { ...l, _linha: currentLinha - 1 };
        }
        return l;
      });

    setLeads(updated);
    saveOfflineCache("leads", updated);

    try {
      await fetch(`/api/leads?linha=${rowId}`, { method: "DELETE" });
    } catch (e) {}
    fetchAllData();
  };

  // 2. FTTA actions callbacks
  const handleSaveFttaItem = async (ftItem: Partial<FttaItem>) => {
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

  const handleSaveFttaProspKey = async (prosp: Omit<FttaProspeccao, "_linha">) => {
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

  // 3. Tasks checklist actions callbacks

  const handleAddTask = async (desc: string, dataLimite: string, nomeLead: string, vendedor?: string) => {
    const newTask: Task = {
      id: String(Date.now()),
      vendedor: vendedor || loggedUser,
      descricao: desc,
      dataLimite: dataLimite || undefined,
      nomeLead: nomeLead || undefined,
      status: "PENDENTE"
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveOfflineCache("tasks", updated);

    // Call Google APIs if authenticated
    try {
      const token = await getAccessToken();
      if (token) {
        // We do async call
        let dateStr = dataLimite;
        let timeStr = "";
        
        // desc sometimes contains " às HH:mm"
        const timeMatch = desc.match(/ às (\d{2}:\d{2})/);
        if (timeMatch) {
          timeStr = timeMatch[1];
        }

        const title = `Tarefa: ${desc} ${nomeLead ? `(Lead: ${nomeLead})` : ''}`;
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
      } catch (e) {}
    fetchAllData();
  };

  const handleToggleTask = async (id: string, currentStatus: "PENDENTE" | "CONCLUIDA") => {
    const newStatus: "PENDENTE" | "CONCLUIDA" = currentStatus === "PENDENTE" ? "CONCLUIDA" : "PENDENTE";
    const updated: Task[] = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    setTasks(updated);
    saveOfflineCache("tasks", updated);

    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle" })
      });
    } catch (e) {}
    fetchAllData();
  };

  const handleDeleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveOfflineCache("tasks", updated);

    try {
      await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    } catch (e) {}
    fetchAllData();
  };

  const handleClearCompletedTasks = async () => {
    const updated = tasks.filter(t => t.status !== "CONCLUIDA");
    setTasks(updated);
    saveOfflineCache("tasks", updated);

    try {
      await fetch(`/api/tasks?action=clear_completed`, { method: "DELETE" });
    } catch (e) {}
    fetchAllData();
  };

  // 4. Absences submission callbacks with file mapping
  const handleRegisterAbsence = async (
    dataFalta: string, 
    motivo: string, 
    obs: string, 
    fileData?: string, 
    fileName?: string, 
    mimeType?: string
  ): Promise<string> => {
    let driveLink = "";

    // We bypass client-side Google Drive upload and let backend/N8N handle the file data directly
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

    if (data.emailStatus === 'error') {
       return "Justificativa salva, mas o E-MAIL FALHOU: " + data.emailError;
    } else if (data.emailStatus === 'not_configured') {
       return "Justificativa salva. (E-mail SIMULADO apenas - Credenciais não configuradas)";
    }
    return "✅ Solicitação enviada!\nO e-mail de notificação para bruno.queiroz@mhnet.com.br foi enviado com sucesso.";
  };

  const handleUpdateAbsence = async (id: string, status: string) => {
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

  // 5. Portfolio base action registration calls
  const handleRegisterBaseAction = async (payload: Omit<BaseActionLog, "id" | "dataContato">) => {
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

  // 5.5. Cobrancas module action callback declarations
  const handleUpdateCobranca = async (updated: Cobranca) => {
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

  const handleRegisterCobrancaLog = async (idContrato: string, log: Omit<CobrancaLog, "dataLog" | "operador">) => {
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

  const handleGenerateIACobrancaPitch = async (client: Cobranca) => {
    const resp = await fetch("/api/gemini/generateCobrancaMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client })
    });
    if (!resp.ok) throw new Error("Falha ao gerar cobrança de IA");
    const d = await resp.json();
    return d.text;
  };

  // 6. Vendors and individual goals management handlers
  const handleRegisterVendor = async (nome: string, meta: number, telefone?: string) => {
    const resp = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, meta, telefone })
    });
    if (!resp.ok) {
      throw new Error("Falha ao cadastrar vendedor no servidor.");
    }
    // Update local lists and trigger re-sync
    const resVendors = await fetch("/api/vendors");
    if (resVendors.ok) {
      const d = await resVendors.json();
      if (d && d.vendors) {
        setRegisteredVendors(d.vendors);
        setAvailableVendors(d.vendors.map((v: any) => v.nome));
      }
    }
  };

  const handleUpdateVendor = async (vendor: Vendor) => {
    const resp = await fetch("/api/vendors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor)
    });
    if (!resp.ok) {
      throw new Error("Falha ao atualizar vendedor no servidor.");
    }
    // Update local lists and trigger re-sync
    const resVendors = await fetch("/api/vendors");
    if (resVendors.ok) {
      const d = await resVendors.json();
      if (d && d.vendors) {
        setRegisteredVendors(d.vendors);
        setAvailableVendors(d.vendors.map((v: any) => v.nome));
      }
    }
  };

  const handleDeleteVendor = async (id: string) => {
    const resp = await fetch(`/api/vendors?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    if (!resp.ok) {
      throw new Error("Falha ao excluir vendedor no servidor.");
    }
    // Update local lists and trigger re-sync
    const resVendors = await fetch("/api/vendors");
    if (resVendors.ok) {
      const d = await resVendors.json();
      if (d && d.vendors) {
        setRegisteredVendors(d.vendors);
        setAvailableVendors(d.vendors.map((v: any) => v.nome));
      }
    }
  };

  const handleBulkTransferLeads = async (fromSeller: string, toSeller: string) => {
    const resp = await fetch("/api/leads/bulk-transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromSeller, toSeller })
    });
    if (!resp.ok) {
      throw new Error("Falha ao realizar transferência de leads no servidor.");
    }
    const d = await resp.json();
    
    // Refresh all data locally to ensure state updates across all pages
    await fetchAllData();
    
    return {
      leadsTransferred: d.details?.leadsTransferred || 0,
      tasksTransferred: d.details?.tasksTransferred || 0,
      message: d.message || "Transferência concluída"
    };
  };

  const handleSaveCompetitor = async (comp: Competitor) => {
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

  const handleDeleteCompetitor = async (id: string) => {
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

  const handleSaveInstallation = async (inst: Installation) => {
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

  const handleDeleteInstallation = async (id: string) => {
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

  // 6. Deep sales Gemini AI integrations callbacks:
  const handleGenerateIAPitch = async (client: BaseClient) => {
    const resp = await fetch("/api/gemini/generatePitch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client })
    });
    if (!resp.ok) throw new Error("Falha ao gerar abordagem");
    const d = await resp.json();
    return d.text;
  };

  const handleCombatObjection = async (objection: string) => {
    const resp = await fetch("/api/gemini/combatObjection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objection })
    });
    if (!resp.ok) throw new Error("Erro");
    const d = await resp.json();
    return d.text;
  };

  const handleAnalyzeCompetitor = async (name: string, question: string, mhnetVantagem: string) => {
    const resp = await fetch("/api/gemini/analyzeCompetitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, question, mhnetVantagem })
    });
    if (!resp.ok) throw new Error("Erro");
    const d = await resp.json();
    return d.text;
  };

  const handleSendChatMessage = async (msg: string, history: any[]) => {
    const resp = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, history })
    });
    if (!resp.ok) throw new Error("Erro");
    const d = await resp.json();
    return d.text;
  };

  const handleGenerateAIObs = async (nome: string, bairro: string, plano: string, valor: string, provedor: string) => {
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
    } catch (e: any) {
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
        // Fetch all updated data
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
      } catch (e: any) {
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
        // Fetch all updated data
        const rLeads = await fetch("/api/leads");
        if (rLeads.ok) {
          const d = await rLeads.json();
          // Safe fallback for both .data or .leads formats
          setLeads(d.data || d.leads || []);
        }
        alert(`Sucesso! ${data.count} leads importados diretamente da aba Acompanhamento de Lead | Abordagens.`);
      } else {
        throw new Error(data.message || "Erro desconhecido durante o de sync dos leads.");
        }
      } catch (e: any) {
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
        // Fetch all updated ftta data
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
      } catch (e: any) {
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
      } catch (e: any) {
      console.error(e);
      alert("Erro ao sincronizar agenda de instalação: " + e.message);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };

  // RENDER FLOW FOR EXT PARTNER: NO LOGIN NEEDED
  if (isExternalPartnerMode) {
    return (
      <ExternalStorePortal
        installations={installations}
        vendors={availableVendors}
        onSaveInstallation={handleSaveInstallation}
        onDeleteInstallation={handleDeleteInstallation} />
    );
  }

  // RENDER FLOW: LOGIN PORTAL SCREEN IF NOT LOGGED
  // RENDER FLOW: LOGIN PORTAL SCREEN IF NOT LOGGED OR DURING ANIMATION
  if (isLoggingInAnim) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans leading-relaxed text-slate-100 p-6 relative overflow-hidden">
        {/* Background decorative blurry circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-md w-full text-center space-y-8 z-10 p-4">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Spinning gradient border */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-sky-400 border-r-sky-500 animate-spin" style={{ animationDuration: "1s" }} />
            <div className="absolute inset-2 rounded-full border-2 border-slate-900 border-b-sky-300 border-l-blue-500 animate-spin" style={{ animationDuration: "0.6s", animationDirection: "reverse" }} />
            
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center shadow-2xl">
              <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase text-white tracking-widest">Acessando MHNET</h2>
            <div className="h-[2px] w-24 bg-gradient-to-r from-sky-500 to-sky-400 mx-auto rounded-full" />
            
            <p className="text-[10px] text-sky-400 font-extrabold tracking-widest mt-1 uppercase">
              Iniciando Sessão Segura
            </p>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-sky-500 via-sky-450 to-emerald-400 h-full rounded-full"
            />
          </div>

          <div key={loginStageText} className="text-xs font-black tracking-wide text-slate-100 bg-slate-900/80 border border-slate-800 rounded-2xl py-3 px-5 inline-block mx-auto shadow-2xl backdrop-blur"
          >
            {loginStageText}
          </div>
        </div>
      </div>
    );
  }

  if (!loggedUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans leading-relaxed text-slate-100 p-6 relative overflow-hidden">
        
        {/* Background decorative blurry circles */}
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-sky-850/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] bg-sky-950/15 rounded-full blur-[110px] pointer-events-none" />

        {/* Top title info logo */}
        <div className="space-y-4 text-center mt-12 z-10"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-sky-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-sky-500/35">
            <Wifi className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">MHNET</h1>
            <p className="text-xs text-sky-450 font-extrabold tracking-widest uppercase mt-0.5">Gestor de Vendas Externas</p>
          </div>
        </div>

        {/* Login form box */}
        <div className="w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-md z-15"
        >
          <div className="space-y-1.5 text-center">
            <h2 className="text-sm font-black uppercase text-slate-305 tracking-wider flex items-center justify-center gap-1.5 pl-0.5">
              <Lock className="w-4 h-4 text-sky-400" /> Acesso Seguro
            </h2>
            <p className="text-[11px] text-slate-350 leading-normal font-bold px-4">
              Faça login informando seu nome de consultor ou administrador para acessar o portal de controle.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-sans relative pt-2">
            {loginError && (
              <p className="text-[11px] text-rose-450 font-black uppercase text-center">{loginError}</p>
            )}

            <div>
              <div className="relative">
                <select
                  value={loginTerm}
                  onChange={(e) => setLoginTerm(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition font-medium appearance-none"
                >
                  <option value="" disabled className="bg-sky-900 text-slate-300">Selecione seu nome...</option>
                  {registeredVendors.map((vendor, idx) => (
                    <option key={vendor.id || idx} value={vendor.nome} className="bg-sky-900 text-white font-bold">
                      {vendor.nome}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-sky-900/40 active:scale-97 cursor-pointer transition duration-150 flex items-center justify-center gap-2"
            >
              Entrar no Sistema
            </button>

            <button type="button"
              onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                  }
                } else {
                  setShowPWAInstructions(true);
                }
              }}
              className="w-full py-2.5 border border-slate-800 hover:bg-slate-900/60 text-slate-300 rounded-xl text-[10px] font-extrabold uppercase cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-sky-400" /> Instalar App
            </button>
          </form>

          

          </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-4 z-10"
        >
          MHNET VALE DO TAQUARI · LAJEADO
        </div>
      </div>
    );
  }

  // CORE RENDER FLOW OF COMPLETED LOGGED APP
  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            isAdmin={userRole === "admin"}
            loggedUser={loggedUser}
            leads={leads}
            tasks={tasks}
            onSetFttaTab={setFttaTab}
            onOpenChat={() => setIsAiChatOpen(true)}
            onTriggerCoach={() => setIsAiChatOpen(true)}
            onNavigate={tab => setActiveTab(tab as any)}
            onNavigateToSellerLeads={(seller) => {
              setLeadsFilterSeller(seller);
              setActiveTab("leads");
            }}
            onSync={fetchAllData}
            vendors={registeredVendors} />
        );
      case "admin_logs":
        return <AdminLogsPage />;
      case "admin_tests":
        return <AdminTestResultsPage />;
      case "database_central":
        return <DatabaseCentralPage />;
      case "gestao_pessoas":
        return <GestaoPessoasPage vendors={registeredVendors} loggedUser={loggedUser!} isAdmin={userRole === "admin"} />;
      case "leads":
        return (
          <LeadsPage
            leads={leads}
            isAdmin={userRole === "admin"}
            loggedUser={loggedUser}
            onSaveLead={handleSaveLead}
            onDeleteLead={handleDeleteLead}
            onGenerateAIObs={handleGenerateAIObs}
            onCombatObjectionWithIA={handleCombatObjection}
            onSyncLeads={handleSyncLeads}
            onAddTask={handleAddTask}
            onNavigateToTasks={() => setActiveTab("tasks")}
            defaultViewMode="list"
            initialSellerFilter={leadsFilterSeller} />
        );
      case "cadastroLead":
        return (
          <LeadsPage
            leads={leads}
            isAdmin={userRole === "admin"}
            loggedUser={loggedUser}
            onSaveLead={handleSaveLead}
            onDeleteLead={handleDeleteLead}
            onGenerateAIObs={handleGenerateAIObs}
            onCombatObjectionWithIA={handleCombatObjection}
            onSyncLeads={handleSyncLeads}
            onAddTask={handleAddTask}
            onNavigateToTasks={() => setActiveTab("tasks")}
            defaultViewMode="form"
          />
        );
      case "ftta":
        return (
          <FttaPage
            sites={fttaItems}
            prospecs={fttaProsps}
            isAdmin={userRole === "admin"}
            loggedUser={loggedUser}
            onRegisterFttaSite={handleSaveFttaItem}
            onRegisterFttaProsp={handleSaveFttaProspKey}
            initialTab={fttaTab}
            onSyncFtta={handleSyncFtta} />
        );
      case "tasks":
        return (
          <TasksPage
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onClearCompletedTasks={handleClearCompletedTasks}
            leadsList={leads.map(l => l.nomeLead)}
            onNavigateToLeadDetail={(nome) => {
              setActiveTab("leads");
            }}
            vendorsList={registeredVendors.map(v => v.nome)}
            isAdmin={userRole === "admin"}
            loggedUser={loggedUser} />
        );
      case "indicators":
        return (
          <IndicatorsPage
            leads={leads}
            isAdmin={userRole === "admin"}
            loggedUser={loggedUser} />
        );
      case "base":
        return (
          <BaseManagementPage
            clients={baseClients}
            actions={baseActions}
            onRegisterAction={handleRegisterBaseAction}
            onGenerateIAPitch={handleGenerateIAPitch}
            onRefreshBase={handleSyncBase}
            onFetchBaseLocal={handleFetchBaseLocal}
            loggedUser={loggedUser}
            isAdmin={userRole === "admin"} />
        );
      case "cobrancas":
        return (
          <CobrancasPage
            cobrancas={cobrancas}
            loggedUser={loggedUser}
            isAdmin={userRole === "admin"}
            onUpdateCobranca={handleUpdateCobranca}
            onRegisterCobrancaLog={handleRegisterCobrancaLog}
            onGenerateIAPitch={handleGenerateIACobrancaPitch}
            onRefreshData={fetchAllData} />
        );
      case "competitors":
        return (
          <CompetitorsPage
            competitors={competitors}
            onAnalyzeWithAI={handleAnalyzeCompetitor}
            onSaveCompetitor={handleSaveCompetitor}
            onDeleteCompetitor={handleDeleteCompetitor}
            isAdmin={userRole === "admin"} />
        );
      case "objections":
        return (
          <ObjectionsPage
            onCombatObjection={handleCombatObjection} />
        );
      case "absences":
        return (
          <AbsencesPage
            absences={absences}
            isAdmin={userRole === "admin"}
            loggedUser={loggedUser!}
            onRegisterAbsence={handleRegisterAbsence}
            onUpdateAbsence={handleUpdateAbsence} />
        );
      case "pos_venda":
        return <PosVendaPage loggedUser={loggedUser!} isAdmin={userRole === "admin"} />;
      case "matriz_objecoes":
        return <MatrizObjecoesPage loggedUser={loggedUser!} isAdmin={userRole === "admin"} />;
      case "trade":
        return <TradePage loggedUser={loggedUser!} isAdmin={userRole === "admin"} />;
      case "leads_frios":
        return <LeadsFriosTab isAdmin={userRole === "admin"} vendors={availableVendors} loggedUser={loggedUser!} />;
      case "kaizen":
        return <KaizenPage loggedUser={loggedUser!} onBackToDashboard={() => setActiveTab("dashboard")} />;
      case "estrategia":
        return (
          <EstrategiaPage loggedUser={loggedUser} />
        );
      case "materials":
        return (
          <MaterialsPage
            onBackToDashboard={() => setActiveTab("dashboard")} />
        );
      case "planos":
        return (
          <PlanosPage />
        );
      case "rotas":
        return (
          <RotaVendasPage leads={leads} loggedUser={loggedUser} />
        );
      case "vendedores":
        return (
          <VendedoresPage
            vendors={registeredVendors}
            onAddVendor={handleRegisterVendor}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
            onBulkTransfer={handleBulkTransferLeads} />
        );
      case "installations":
        return (
          <InstallationsPage
            installations={installations}
            vendors={availableVendors}
            onSaveInstallation={handleSaveInstallation}
            onDeleteInstallation={handleDeleteInstallation}
            onSyncInstallations={handleSyncInstallations}
            userRole={userRole} />
        );
      case "installations_queue":
        return <InstallationsQueuePage />;
      case "protocolos_internos":
        return <InternalProtocolsPage />;
      case "admin_n8n":
        return <AdminN8NPage />;
      case "calculo_multa":
        return (
          <CalculoMultaPage 
            onBackToDashboard={() => setActiveTab("dashboard")} />
        );
      default:
        return <div>Não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#EDF2F7] flex font-sans text-slate-900 leading-normal max-w-[1600px] mx-auto border-x border-slate-200/60 relative shadow-2xl overflow-hidden h-screen">
      {/* ALERTA DE ERRO DE WEBHOOK N8N (VISÍVEL APENAS PARA ADMIN) */}
      {webhookError && userRole === "admin" && (
        <div className="absolute top-0 left-0 right-0 bg-rose-50 border-b border-rose-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-4 z-[100] shadow-md ">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-full">
              <Zap className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-800">Falha de Comunicação com N8N</div>
              <div className="text-xs text-rose-600 font-medium mt-0.5">
                Uma automação do Ngrok/N8N retornou erro (404/500). Verifique as variáveis de ambiente e se os fluxos estão ativos.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
                fetch('/api/env/n8n').then(r => r.json()).then(d => {
                   const url = d.USE_N8N_TEST_AGENDAMENTO === "true" ? d.N8N_TEST_WEBHOOK_URL : d.N8N_WEBHOOK_URL;
                   if (url) window.open(url, '_blank');
                   else alert("URL não configurada no .env!");
                }).catch(() => alert("Erro ao obter URL"));
              }}
              className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-bold rounded hover:bg-rose-100 shadow-sm transition-colors whitespace-nowrap"
            >
              Testar Conexão
            </button>
            <button onClick={() => setWebhookError(false)} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 shadow-sm transition-colors whitespace-nowrap"
            >
              Dispensar
            </button>
          </div>
        </div>
      )}
      {/* FIM ALERTA N8N */}
      {webhookError && userRole !== "admin" && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50 text-xs font-bold flex justify-between items-center shadow-md">
          <span className="mx-auto">Uma automação falhou em segundo plano. Seu gestor já foi notificado.</span>
          <button onClick={() => setWebhookError(false)} className="text-white hover:text-red-200 px-2 font-bold">✕</button>
        </div>
      )}
      {/* 1. SaaS Persistent Sidebar Navigation (Desktop Only) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 text-white border-r border-slate-800/80 shrink-0 select-none h-full py-6 px-4 z-40">
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Brand/Logo Section */}
          <div className="flex items-center gap-3 px-2 cursor-pointer shrink-0 mb-6" onClick={() => setActiveTab("dashboard")}>
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-sky-900/30">
              MH
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white leading-none">Painel MHNET</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">LAJEADO | ESTRELA</span>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/60 mx-1 shrink-0 mb-6" />

          {/* Nav Categories */}
          <div className="space-y-5 overflow-y-auto flex-1 pr-2 pb-4">
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Painel de Trabalho</span>
              
              <button onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "dashboard" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <Activity className="w-4 h-4 shrink-0 text-white" />
                <span>Painel Principal</span>
              </button>

              <button onClick={() => setActiveTab("pos_venda")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "pos_venda" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <UserCheck className="w-4 h-4 shrink-0 text-white" />
                <span>Pós Vendas</span>
              </button>

              <button onClick={() => setActiveTab("base")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "base" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <Award className="w-4 h-4 shrink-0 text-white" />
                <span>Base de Clientes</span>
              </button>

              <button onClick={() => {
                  setLeadsFilterSeller(null);
                  setActiveTab("leads");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "leads" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <Users className="w-4 h-4 shrink-0 text-white" />
                <span>Leads PAP (Funil)</span>
              </button>

              <button onClick={() => setActiveTab("leads_frios")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "leads_frios" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <FileSpreadsheet className="w-4 h-4 shrink-0 text-white " />
                <span>Leads Frios</span>
              </button>

              <button onClick={() => setActiveTab("cobrancas")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "cobrancas" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900 block"
                }`}>
                <Coins className="w-4 h-4 shrink-0 text-white" />
                <span>Controle de Cobranças</span>
              </button>

              <button onClick={() => setActiveTab("ftta")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "ftta" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <MapPin className="w-4 h-4 shrink-0 text-white" />
                <span>Viabilidade FTTA</span>
              </button>

              <button onClick={() => setActiveTab("tasks")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "tasks" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <ClipboardList className="w-4 h-4 shrink-0 text-white" />
                <span>Minhas Tarefas</span>
              </button>

              <button onClick={() => setActiveTab("installations")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "installations" 
                    ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-950" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <CalendarDays className="w-4 h-4 shrink-0 text-white" />
                <span>Agenda de Instalações</span>
              </button>
              <button onClick={() => setActiveTab("installations_queue")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "installations_queue" 
                    ? "bg-sky-600 text-white font-bold shadow-md shadow-sky-950" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <ClipboardList className="w-4 h-4 shrink-0 text-white" />
                <span>Fila de Monitoramento</span>
              </button>
              <button onClick={() => setActiveTab("gestao_pessoas")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "gestao_pessoas" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                {userRole === "admin" ? <Users className="w-4 h-4 shrink-0 text-white" /> : <User className="w-4 h-4 shrink-0 text-white" />}
                <span>{userRole === "admin" ? "Gestão de Pessoas" : "Meu RH"}</span>
              </button>
            </div>

            {userRole === "admin" && (
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 mt-1">Gestão de Equipe</span>
                <button onClick={() => setActiveTab("protocolos_internos")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeTab === "protocolos_internos" 
                      ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                      : "text-white hover:bg-slate-900"
                  }`}>
                  <FileText className="w-4 h-4 shrink-0 text-white" />
                  <span>Protocolos Internos</span>
                </button>
                <button onClick={() => setActiveTab("estrategia")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeTab === "estrategia" 
                      ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                      : "text-white hover:bg-slate-900"
                  }`}>
                  <Bot className="w-4 h-4 shrink-0 text-white" />
                  <span>Gestão Estratégica IA</span>
                </button>
                <button onClick={() => setActiveTab("vendedores")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeTab === "vendedores" 
                      ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                      : "text-white hover:bg-slate-900"
                  }`}>
                  <Sliders className="w-4 h-4 shrink-0 text-white" />
                  <span>Vendedores & Metas</span>
                </button>
                <button onClick={() => setActiveTab("admin_n8n")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeTab === "admin_n8n" 
                      ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                      : "text-white hover:bg-slate-900"
                  }`}>
                  <Link className="w-4 h-4 shrink-0 text-white" />
                  <span>Integrações N8N</span>
                </button>
                
              <button onClick={() => setActiveTab("admin_tests")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "admin_tests" 
                    ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <CheckCircle className="w-4 h-4 shrink-0 text-white" />
                <span>Históricos de Testes</span>
              </button>

              <button onClick={() => setActiveTab("database_central")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "database_central" 
                    ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <Database className="w-4 h-4 shrink-0 text-white" />
                <span>Base dados</span>
              </button>

                <button onClick={() => setActiveTab("admin_logs")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    activeTab === "admin_logs" 
                      ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold shadow-md shadow-rose-900/20" 
                      : "text-white hover:bg-slate-900"
                  }`}>
                  <Terminal className="w-4 h-4 shrink-0 text-white" />
                  <span>Depuração & Logs IA</span>
                </button>
              </div>
            )}

            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Treinamento & Apoio</span>

              <button onClick={() => setActiveTab("competitors")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "competitors" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <Sparkles className="w-4 h-4 shrink-0 text-white" />
                <span>Análise Concorrência</span>
              </button>

              <button onClick={() => setActiveTab("calculo_multa")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "calculo_multa" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900 block"
                }`}>
                <Calculator className="w-4 h-4 shrink-0 text-white" />
                <span>Cálculo de Multa</span>
              </button>

              <button onClick={() => setActiveTab("objections")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "objections" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <HelpCircle className="w-4 h-4 shrink-0 text-white" />
                <span>Contorno de Objeções</span>
              </button>

              <button onClick={() => setActiveTab("trade")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "trade" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <Store className="w-4 h-4 shrink-0 text-white" />
                <span>Ações de Trade</span>
              </button>

              <button onClick={() => setActiveTab("absences")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "absences" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <CalendarDays className="w-4 h-4 shrink-0 text-white" />
                <span>Escala & Ausências</span>
              </button>

              <button onClick={() => setActiveTab("materials")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeTab === "materials" 
                    ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold shadow-md shadow-sky-900/20" 
                    : "text-white hover:bg-slate-900"
                }`}>
                <BookOpen className="w-4 h-4 shrink-0 text-white" />
                <span>Drive & Panfletos</span>
              </button>


              
            </div>
          </div>
        </div>

        {/* User profile with logout on sidebar */}
        <div className="space-y-4 shrink-0 pt-4">
          <div className="h-[1px] bg-slate-800/60 mx-1" />
          <div className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-2xl border border-slate-800/40">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {loggedUser ? loggedUser.substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-white truncate leading-none mb-1">{loggedUser}</span>
                <span className="text-[9px] text-sky-400 font-bold uppercase tracking-wide leading-none">
                  {userRole === "admin" ? "Coordenador" : "Consultor PAP"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg cursor-pointer transition active:scale-95 shrink-0"
                title={theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
              >
                {theme === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
              <button onClick={handleLogout} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg cursor-pointer transition active:scale-95 shrink-0"
                title="Sair do expediente"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 h-full">

        {missingEnvKeys.length> 0 && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 flex items-start gap-3 text-rose-800 text-xs font-medium z-40 select-none  shrink-0">
            <span className="text-sm shrink-0">🚨</span>
            <div className="flex-1 space-y-0.5">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-rose-700 block">Variáveis de Ambiente Ausentes</span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                O sistema detectou que algumas chaves obrigatórias não foram configuradas no arquivo <code className="bg-rose-50 px-1 py-0.5 rounded text-[9.5px]">.env</code>. 
                Algumas funcionalidades, como envio de e-mails ou integração com o N8N, podem não funcionar corretamente.
              </p>
              <p className="text-[10.5px] text-rose-750 font-bold mt-1">
                Chaves ausentes: {missingEnvKeys.join(", ")}
              </p>
            </div>
            <button onClick={() => setMissingEnvKeys([])} className="text-rose-600 hover:text-rose-800 px-2 py-1.5 rounded hover:bg-rose-500/10 transition font-black text-[10px] uppercase tracking-wider scale-95 shrink-0 cursor-pointer self-center"
            >
              Ciente
            </button>
          </div>
        )}

        {invalidEnvKeys.length> 0 && (
          <div className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-2.5 flex items-start gap-3 text-orange-800 text-xs font-medium z-40 select-none  shrink-0">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="flex-1 space-y-0.5">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-orange-700 block">Variáveis de Ambiente com Formato Inválido</span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                O sistema detectou que algumas chaves foram configuradas com um formato inválido no arquivo <code className="bg-orange-50 px-1 py-0.5 rounded text-[9.5px]">.env</code>.
                Verifique se URLs possuem <code className="bg-orange-50 px-1 py-0.5 rounded text-[9.5px]">http://</code> ou <code className="bg-orange-50 px-1 py-0.5 rounded text-[9.5px]">https://</code> e se portas são apenas números.
              </p>
              <p className="text-[10.5px] text-orange-750 font-bold mt-1">
                Chaves com formato inválido: {invalidEnvKeys.join(", ")}
              </p>
            </div>
            <button onClick={() => setInvalidEnvKeys([])} className="text-orange-600 hover:text-orange-800 px-2 py-1.5 rounded hover:bg-orange-500/10 transition font-black text-[10px] uppercase tracking-wider scale-95 shrink-0 cursor-pointer self-center"
            >
              Ciente
            </button>
          </div>
        )}

        {isAiKeyLeaked && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-start gap-3 text-amber-800 text-xs font-medium z-40 select-none  shrink-0">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="flex-1 space-y-0.5">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700 block">Modo de Contingência (IA com Scripts Locais)</span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                A chave de API Gemini do sistema foi temporariamente suspensa ou identificada como vazada. 
                Para garantir a continuidade das suas vendas de forma impecável, ativamos o <strong>Roteirizador Inteligente de Contingência Off-line</strong> 
                com ricas receitas de alta conversão pré-programadas para Lajeado, Estrela e região. 
                Continue operando o sistema normalmente!
              </p>
              {userRole === "admin" && (
                <p className="text-[10.5px] text-sky-750 font-bold mt-1">
                  💡 Coordenador: Para reativar a IA inteligente adaptativa em tempo real, atualize a variável <code className="bg-sky-50 px-1 py-0.5 rounded text-[9.5px]">GEMINI_API_KEY</code> nas Configurações da plataforma do Google AI Studio.
                </p>
              )}
            </div>
            <button onClick={() => setIsAiKeyLeaked(false)} className="text-amber-600 hover:text-amber-800 px-2 py-1.5 rounded hover:bg-amber-500/10 transition font-black text-[10px] uppercase tracking-wider scale-95 shrink-0 cursor-pointer self-center"
            >
              Compreendi
            </button>
          </div>
        )}

        {/* Mobile Top Navigation Head (Visible only below lg screen size) */}
        <nav className="h-14 lg:hidden flex items-center justify-between px-4 bg-white border-b border-slate-200 shrink-0 z-40 select-none">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
              MH
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 leading-none">Painel MHNET</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">LAJEADO | ESTRELA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
              className={`p-1.5 border rounded-lg transition cursor-pointer active:scale-95 ${theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300" : "bg-slate-50 border-slate-200 text-slate-550 hover:text-slate-750"}`}
              title={theme === "light" ? "Modo Escuro" : "Modo Claro"}
            >
              {theme === "light" ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3 text-amber-500" />}
            </button>

            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-950 leading-none">{loggedUser.split(" ")[0]}</div>
              <span className="text-[8px] font-semibold text-sky-600 uppercase tracking-widest">
                {userRole === "admin" ? "COORD" : "PAP"}
              </span>
            </div>

            <button onClick={handleLogout} className="p-1.5 bg-slate-50 border border-slate-200 text-slate-550 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </nav>

        {/* Primary Page Canvas Stage */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 h-[calc(100vh-80px)] lg:h-[calc(100vh-36px)] bg-slate-200/40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] print:h-auto print:block print:overflow-visible">
          {/* Global Search Bar */}
          <div className="mb-6 relative">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text"
                placeholder="Buscar globalmente (leads, clientes, tarefas...)"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all placeholder:text-slate-400/70"
              />
              {globalSearchTerm && (
                <button onClick={() => setGlobalSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Search Results Dropdown-like view but inline to push content down */}
            {globalSearchTerm && (
              <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-4 max-h-[60vh] overflow-y-auto  z-50 relative">
                <h3 className="text-xs font-black uppercase text-sky-500 tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sparkles className="w-4 h-4" /> Resultados de Busca
                </h3>
                
                {/* Leads Matches */}
                {(() => {
                  const s = globalSearchTerm.toLowerCase();
                  const matchingLeads = leads.filter(l => l.nomeLead.toLowerCase().includes(s) || (l.telefone && l.telefone.includes(s)));
                  if (matchingLeads.length === 0) return null;
                  return (
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 mb-2">Leads ({matchingLeads.length})</h4>
                      <div className="space-y-1.5">
                        {matchingLeads.map(lead => (
                          <div key={lead._linha} className="text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-sky-300 hover:bg-sky-50 cursor-pointer transition" onClick={() => { setGlobalSearchTerm(""); setActiveTab("leads"); }}>
                            <span className="font-bold text-slate-700">{lead.nomeLead}</span>
                            <span className="text-[10px] font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-full">{lead.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Base Matches */}
                {(() => {
                  const s = globalSearchTerm.toLowerCase();
                  const matchingBase = baseClients.filter(c => c.nome.toLowerCase().includes(s) || (c.cidade && c.cidade.toLowerCase().includes(s)));
                  if (matchingBase.length === 0) return null;
                  return (
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 mb-2">Base de Clientes ({matchingBase.length})</h4>
                      <div className="space-y-1.5">
                        {matchingBase.map(client => (
                          <div key={client.idContrato} className="text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-sky-300 hover:bg-sky-50 cursor-pointer transition" onClick={() => { setGlobalSearchTerm(""); setActiveTab("base"); }}>
                            <span className="font-bold text-slate-700">{client.nome}</span>
                            <span className="text-[10px] font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-full">{client.plano}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Tasks Matches */}
                {(() => {
                  const s = globalSearchTerm.toLowerCase();
                  const matchingTasks = tasks.filter(t => t.descricao.toLowerCase().includes(s));
                  if (matchingTasks.length === 0) return null;
                  return (
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 mb-2">Tarefas ({matchingTasks.length})</h4>
                      <div className="space-y-1.5">
                        {matchingTasks.map(task => (
                          <div key={task.id} className="text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition" onClick={() => { setGlobalSearchTerm(""); setActiveTab("tasks"); }}>
                            <span className="font-bold text-slate-700">{task.descricao}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{task.status === 'CONCLUIDA' ? "Feita" : "Pendente"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {leads.filter(l => l.nomeLead.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 &&
                 baseClients.filter(c => c.nome.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 &&
                 tasks.filter(t => t.descricao.toLowerCase().includes(globalSearchTerm.toLowerCase())).length === 0 && (
                   <p className="text-xs text-slate-400 font-semibold text-center py-4">Nenhum resultado encontrado.</p>
                 )}
              </div>
            )}
          </div>

          {isInitialLoad ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-xs font-sans space-y-4">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
              <p className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Sincronizando Leads via Google Sheets...</p>
            </div>
          ) : (
            <ErrorBoundary>
              {renderActivePage()}
            </ErrorBoundary>
          )}
        </main>

        {/* Compact Interactive Tab Bar Panel (Mobile Only - hidden on desktop lg) */}
        <nav className="lg:hidden bg-white border-t border-slate-200 py-2 px-4 flex overflow-x-auto gap-5 items-center shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-50 shrink-0 select-none font-sans [&::-webkit-scrollbar]:hidden">
          
          <button onClick={() => setActiveTab("dashboard")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "dashboard" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <Activity className="w-4 h-4" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Home</span>
          </button>

          <button onClick={() => {
              setLeadsFilterSeller(null);
              setActiveTab("leads");
            }}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "leads" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Leads</span>
          </button>

          <button onClick={() => setActiveTab("base")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "base" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <Award className="w-4 h-4" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Base</span>
          </button>

          <button onClick={() => setActiveTab("leads_frios")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "leads_frios" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <FileSpreadsheet className="w-4 h-4 " />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Frios</span>
          </button>

          <button onClick={() => setActiveTab("cobrancas")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "cobrancas" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <Coins className="w-4 h-4 text-rose-500" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Cobrar</span>
          </button>

          <button onClick={() => setActiveTab("ftta")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "ftta" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <MapPin className="w-4 h-4" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">FTTA</span>
          </button>

          <button onClick={() => setActiveTab("tasks")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "tasks" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <ClipboardList className="w-4 h-4" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Tarefas</span>
          </button>

          <button onClick={() => setActiveTab("installations")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "installations" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <CalendarDays className="w-4 h-4" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Agenda</span>
          </button>

          {userRole === "admin" && (
            <>
              <button onClick={() => setActiveTab("estrategia")}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
                  activeTab === "estrategia" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
                }`}>
                <Bot className="w-4 h-4 text-blue-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-tight">Estratégia</span>
              </button>
              <button onClick={() => setActiveTab("vendedores")}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
                  activeTab === "vendedores" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
                }`}>
                <Sliders className="w-4 h-4 text-sky-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-tight">Metas</span>
              </button>
              <button onClick={() => setActiveTab("admin_n8n")}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
                  activeTab === "admin_n8n" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
                }`}>
                <Link className="w-4 h-4 text-blue-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-tight">N8N</span>
              </button>
            </>
          )}



          <button onClick={() => setActiveTab("pos_venda")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "pos_venda" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Pós Venda</span>
          </button>
          <button onClick={() => setActiveTab("trade")}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 cursor-pointer transition ${
              activeTab === "trade" ? "text-sky-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
            }`}>
            <Store className="w-4 h-4 text-sky-500" />
            <span className="text-[9px] font-extrabold uppercase tracking-tight">Trade</span>
          </button>

        </nav>

      </div>

      {/* Custom PWA Installation Banner */}
      {showPWABanner && (
        <div className="fixed top-0 left-0 right-0 z-[99999] bg-slate-900 border-b border-slate-700 p-4 shadow-xl flex items-center justify-between animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">Instale o App MHNET</p>
              <p className="text-slate-400 text-[10px] leading-tight mt-0.5">Acesso rápido e offline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
                localStorage.setItem('pwa_banner_dismissed', 'true');
                setShowPWABanner(false);
              }}
              className="px-2 py-1.5 text-slate-400 hover:text-white text-[10px] font-bold uppercase"
            >
              Agora não
            </button>
            <button onClick={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                    setShowPWABanner(false);
                    localStorage.setItem('pwa_banner_dismissed', 'true');
                  }
                } else {
                  setShowPWAInstructions(true);
                  setShowPWABanner(false);
                }
              }}
              className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-sky-500 shadow shadow-sky-900/50"
            >
              Instalar
            </button>
          </div>
        </div>
      )}
      {/* Floating AI Agent trigger bubble */}
      <button id="floating-ai-agent-trigger-badge"
        onClick={() => {
          setIsAiChatOpen(true);
          setUnreadAiTips(0);
          setIsBadgePulsing(false);
        }} className={`print:hidden fixed bottom-16 right-4 lg:bottom-6 lg:right-6 w-12 h-12 bg-gradient-to-tr from-sky-600 to-sky-800 text-white rounded-2xl shadow-xl hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center border border-sky-500/50 hover:shadow-sky-900/10 z-[99999] cursor-pointer ${isBadgePulsing ? 'animate-ping' : 'animate-pulse-light'}`}
        title="Assistente Comercial IA"
      >
        <Bot className="w-6 h-6 stroke-[2.2]" />
        {unreadAiTips > 0 && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900 shadow-md">
            {unreadAiTips}
          </span>
        )}
      </button>

      {/* Floating popup agent dialog controller */}
      <ChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onSendChatMessage={handleSendChatMessage} />



      {/* PWA Instructions Modal */}
      {showPWAInstructions && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center space-y-4">
            <button onClick={() => setShowPWAInstructions(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="mx-auto w-12 h-12 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </div>
            <h3 className="text-lg font-bold text-white">Instalar Aplicativo</h3>
            <div className="text-sm text-slate-400 space-y-2 text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="font-semibold text-slate-300">Como instalar no seu celular:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>No iOS (Safari):</strong> Toque no ícone de Compartilhar e selecione "Adicionar à Tela de Início".</li>
                <li><strong>No Android (Chrome):</strong> Toque no menu (3 pontos) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".</li>
              </ul>
            </div>
            <button onClick={() => setShowPWAInstructions(false)} className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold transition">
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
