/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CheckSquare, Calendar, FolderOpen, ShieldAlert, 
  Bot, Trophy, Network, UserPlus, ArrowRight, Bell, ChevronRight,
  TrendingUp, Users, MapPin, Clock, CalendarDays, Zap, Sparkles, RefreshCw, Send, AlertTriangle, X, List, FileSpreadsheet,
  ClipboardList, FileText, CheckCircle, Coins
} from "lucide-react";
import { Lead, Task, Vendor } from "../types";
import { INITIAL_VENDORS } from "../data";

interface DashboardProps {
  loggedUser: string;
  isAdmin: boolean;
  onNavigate: (pageId: string) => void;
  onNavigateToSellerLeads?: (sellerName: string) => void;
  leads: Lead[];
  tasks: Task[];
  onSetFttaTab: (tab: "lajeado" | "estrela" | "prospeccao") => void;
  onOpenChat: () => void;
  onTriggerCoach: () => void;
  onSync?: () => void;
  vendors?: Vendor[];
}

export default function Dashboard({
  loggedUser,
  isAdmin,
  onNavigate,
  onNavigateToSellerLeads,
  leads,
  tasks,
  onSetFttaTab,
  onOpenChat,
  onTriggerCoach,
  onSync,
  vendors = []
}: DashboardProps) {
  const [leadsHojeCount, setLeadsHojeCount] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [todayConversion, setTodayConversion] = useState(0);
  
  // Follow-up contacts for today
  const [retornosHoje, setRetornosHoje] = useState<Lead[]>([]);
  
  // Stale leads count (> 48h)
  const [staleLeads, setStaleLeads] = useState<Lead[]>([]);
  
  // IA Live Coach Quote
  const [aiQuote, setAiQuote] = useState<string>("");
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Seller managed leads and transfer state
  const [selectedSellerForLeads, setSelectedSellerForLeads] = useState<string | null>(null);
  const [bulkTargetSeller, setBulkTargetSeller] = useState<string>("");
  const [transferLoading, setTransferLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);


  const [weatherData, setWeatherData] = useState<{ temp: number; description: string; icon: string; forecast: { temp: number; icon: string; dayOfWeek: string }[] } | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = "ebd22083715266fc0cf88a2053f31cb8";
        const city = "Lajeado,br";
        
        // Fetch current weather
        const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
        const resCurrent = await fetch(urlCurrent);
        const currentData = await resCurrent.json();
        
        // Fetch forecast
        const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
        const resForecast = await fetch(urlForecast);
        const forecastData = await resForecast.json();

        if (resCurrent.ok && resForecast.ok) {
          // Process forecast to get next 3 days at roughly midday
          const today = new Date().toISOString().split('T')[0];
          const dailyForecasts = new Map();
          
          for (const item of forecastData.list) {
            const dateText = item.dt_txt.split(' ')[0];
            const timeText = item.dt_txt.split(' ')[1];
            
            if (dateText !== today && !dailyForecasts.has(dateText)) {
              if (timeText >= '12:00:00' || timeText >= '15:00:00') {
                const dateObj = new Date(item.dt_txt);
                const dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                dailyForecasts.set(dateText, {
                  temp: Math.round(item.main.temp),
                  icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
                  dayOfWeek: dayOfWeek
                });
              }
            }
          }
          
          const forecastArray = Array.from(dailyForecasts.values()).slice(0, 3);

          setWeatherData({
            temp: Math.round(currentData.main.temp),
            description: currentData.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`,
            forecast: forecastArray
          });
        }
      } catch (err) {
        console.error("Failed to fetch weather data", err);
      }
    };
    fetchWeather();
  }, []);


  // Load real gemini coach advice on mount
  const loadAiQuote = async () => {
    setLoadingQuote(true);
    try {
      const response = await fetch("/api/gemini/coach");
      if (response.ok) {
        const data = await response.json();
        if (data.answer) {
          setAiQuote(data.answer);
          return;
        }
      }
      throw new Error();
    } catch (err) {
      setAiQuote("Foque na abordagem direta de upgrade hoje! Bairros como Centro e Americano têm alta adesão de fibra MHNET de 1GB.");
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    loadAiQuote();
  }, [loggedUser]);

  useEffect(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    
    // 1. Leads registered today
    const viewableLeads = isAdmin || !loggedUser ? leads : leads.filter(l => { 
      if (!l.vendedor) return false;
      const v = l.vendedor.toLowerCase(); 
      const user = loggedUser.toLowerCase(); 
      return v === user || v.includes(user) || user.includes(v); 
    }); 
    const myTodayRecords = viewableLeads.filter(l => l.dataCadastro === hoje);
    setLeadsHojeCount(myTodayRecords.length);

    // 2. Sales closed today
    const myTodayClosed = myTodayRecords.filter(l => l.status === "Venda Fechada").length;
    setTodaySales(myTodayClosed);

    // 3. Conversion of today
    if (myTodayRecords.length > 0) {
      setTodayConversion(Math.round((myTodayClosed / myTodayRecords.length) * 100));
    } else {
      setTodayConversion(0);
    }

    // 4. Follow-up scheduler contacts today
    const scheduledToday = viewableLeads.filter(l => {
      if (!l.agendamento) return false;
      return l.agendamento.includes(hoje) && l.status !== "Venda Fechada";
    });
    setRetornosHoje(scheduledToday);

    // 5. Stale leads (No action for > 48 hours)
    const aged = viewableLeads.filter(l => {
      if (l.status === "Venda Fechada") return false;
      if (!l.dataCadastro) return false;
      try {
        const [dia, mes, ano] = l.dataCadastro.split("/").map(Number);
        const dateCad = new Date(ano, mes - 1, dia);
        const hoursDiff = (new Date().getTime() - dateCad.getTime()) / (1000 * 60 * 60);
        return hoursDiff >= 48;
      } catch (e) {
        return false;
      }
    });
    setStaleLeads(aged);

  }, [leads, isAdmin, loggedUser]);

  // Handler to go to FTTA and pick tab
  const handleFttaGo = (tab: "lajeado" | "estrela" | "prospeccao") => {
    onSetFttaTab(tab);
    onNavigate("ftta");
  };

  // Setup mapped routes for safe navigation
  const navigateTo = (tab: string) => {
    if (tab === "gestaoBase" || tab === "base") {
      onNavigate("base");
    } else if (tab === "cadastroLead") {
      onNavigate("cadastroLead");
    } else if (tab === "gestaoLeads" || tab === "leads") {
      onNavigate("leads");
    } else if (tab === "indicadores" || tab === "indicators") {
      onNavigate("indicators");
    } else if (tab === "tarefas" || tab === "tasks") {
      onNavigate("tasks");
    } else if (tab === "faltas" || tab === "absences") {
      onNavigate("absences");
    } else if (tab === "materiais" || tab === "materials") {
      onNavigate("materials");
    } else if (tab === "objecoes" || tab === "objections") {
      onNavigate("objections");
    } else if (tab === "concorrentes" || tab === "competitors") {
      onNavigate("competitors");
    } else {
      onNavigate(tab);
    }
  };

  // Helper for case-and-accent-insensitive seller matchmaking
  const matchSeller = (leadSeller: string, loggedUser: string) => {
    if (!leadSeller || !loggedUser) return false;
    const s = leadSeller.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const u = loggedUser.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return s === u || s.includes(u) || u.includes(s);
  };

  // 1. Calculate stats
  const myLeadsRaw = isAdmin ? leads : leads.filter(l => matchSeller(l.vendedor, loggedUser));
  const myLeads = myLeadsRaw.filter(l => l.status !== "Frio");
  const totalLeads = myLeads.length;
  const closedSales = myLeads.filter(l => l.status === "Venda Fechada").length;
  const conversionRate = totalLeads > 0 ? Math.round((closedSales / totalLeads) * 100) : 0;
  const inNegotiation = myLeads.filter(l => l.status === "Negociação").length;
  const pendingTasksTotal = tasks.filter(t => matchSeller(t.vendedor, loggedUser) && t.status !== "CONCLUIDA").length;

  // Monthly Sales parameters
  const getLoggedInVendorMeta = () => {
    if (!vendors || vendors.length === 0) return 30;
    const found = vendors.find(v => {
      const s = v.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const u = loggedUser.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return s === u || s.includes(u) || u.includes(s);
    });
    return found ? found.meta : 30; // 30 is fallback benchmark
  };
  const monthlyGoal = getLoggedInVendorMeta();
  const monthlyGoalPct = Math.min(100, Math.round((closedSales / (monthlyGoal || 1)) * 100));

  // Dynamic ranking of sales performance (Derived live from backend data)
  const activeSellers = vendors.length > 0 
    ? vendors.map(v => v.nome) 
    : Array.from(new Set([...INITIAL_VENDORS, ...leads.map(l => l.vendedor).filter(Boolean)]));
  
  const rankingVendedores = activeSellers.map(v => {
    const vLeads = leads.filter(l => l.vendedor === v && l.status !== "Frio");
    const vSales = vLeads.filter(l => l.status === "Venda Fechada").length;
    const vTotal = vLeads.length;
    return { name: v, sales: vSales, totalLeads: vTotal };
  }).sort((a, b) => b.sales - a.sales || b.totalLeads - a.totalLeads);

  // Check for overdue tasks
  const now = new Date();
  const currentYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  const overdueTasks = tasks.filter(t => {
    if (t.status !== "PENDENTE") return false;
    // Admins see all, sellers see their own
    if (!isAdmin && loggedUser) {
      if (!t.vendedor) return false;
      const v = t.vendedor.toLowerCase();
      const l = loggedUser.toLowerCase();
      if (v !== l && !v.includes(l) && !l.includes(v)) return false;
    }

    if (!t.dataLimite) return false;
    
    // Compare YYYY-MM-DD
    if (t.dataLimite < currentYMD) return true;
    
    if (t.dataLimite === currentYMD) {
      // Check time if it exists in descricao
      const timeMatch = t.descricao.match(/ às (\d{2}):(\d{2})/);
      if (timeMatch) {
        const h = parseInt(timeMatch[1], 10);
        const m = parseInt(timeMatch[2], 10);
        if (h < currentH || (h === currentH && m < currentM)) {
          return true;
        }
      } else {
        // No time specified, but it's today. Consider it overdue if it's late in the day, > 17:00
        if (currentH >= 17) return true;
      }
    }
    return false;
  });

  const [delayedInstallations, setDelayedInstallations] = useState(0);

  useEffect(() => {
    fetch('/api/installations-queue')
      .then(r => r.json())
      .then((data: any[]) => {
        let atrasados = data.filter(d => d.status === 'Atrasado');
        if (!isAdmin && loggedUser) {
          const lowerLogged = loggedUser.toLowerCase();
          atrasados = atrasados.filter(d => {
            if (!d.vendedor) return false;
            const v = d.vendedor.toLowerCase();
            return v === lowerLogged || v.includes(lowerLogged) || lowerLogged.includes(v);
          });
        }
        setDelayedInstallations(atrasados.length);
      })
      .catch(e => console.error(e));
  }, [isAdmin, loggedUser]);

  return (
    <div id="dashboard-component" className="space-y-6 font-sans">
      
      {/* DELAYED INSTALLATIONS ALERT */}
      {delayedInstallations > 0 && (
        <div 
          onClick={() => onNavigate("installations-queue")}
          className="bg-orange-50 border border-orange-200 text-orange-800 rounded-[20px] p-4 flex items-start gap-3 shadow-sm cursor-pointer hover:bg-orange-100 transition active:scale-[0.99] animate-pulse-slow"
        >
          <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm tracking-tight mb-1">
              Atenção: Você tem {delayedInstallations} {delayedInstallations === 1 ? 'instalação atrasada' : 'instalações atrasadas'} na Fila de Monitoramento
            </h3>
            <p className="text-[11px] font-medium opacity-90 mb-2">
              Clique aqui para verificar a Fila de Monitoramento e tomar uma ação rápida para não perder o cliente.
            </p>
          </div>
        </div>
      )}

      {/* OVERDUE TASKS ALERT */}
      {overdueTasks.length > 0 && (
        <div 
          onClick={() => navigateTo("tasks")}
          className="bg-rose-50 border border-rose-200 text-rose-800 rounded-[20px] p-4 flex items-start gap-3 shadow-sm cursor-pointer hover:bg-rose-100 transition active:scale-[0.99] animate-pulse-slow"
        >
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm tracking-tight mb-1">
              Atenção: Você tem {overdueTasks.length} {overdueTasks.length === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}
            </h3>
            <p className="text-[11px] font-medium opacity-90 mb-2">
              Verifique sua lista de tarefas para não perder os retornos agendados e esfriar o lead.
            </p>
            <div className="flex flex-col gap-1.5">
              {overdueTasks.slice(0, 2).map(t => (
                <div key={t.id} className="text-[10px] bg-white/60 border border-rose-100 px-2 py-1.5 rounded-lg flex justify-between items-center">
                  <span className="font-bold truncate max-w-[70%]">{t.descricao}</span>
                  <span className="opacity-80 flex gap-1 items-center">
                    <Clock className="w-3 h-3" />
                    {t.dataLimite?.split('-').reverse().join('/')}
                  </span>
                </div>
              ))}
              {overdueTasks.length > 2 && (
                <span className="text-[10px] font-bold text-rose-600 pl-1">+ {overdueTasks.length - 2} outras tarefas...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. GERENTE/ADMIN DECORATION SUPERVISOR PORTAL */}
      {isAdmin && (
        <div className="bg-slate-900 border border-sky-500/20 text-white rounded-[24px] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl z-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 bg-sky-500/10 border border-sky-400/20 text-sky-400 rounded-xl flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs md:text-sm font-black tracking-wide uppercase text-sky-300">Espaço de Supervisão MHNET</div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Conselho e controle geral da equipe de consultores externos</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto z-10">
            <button 
              onClick={() => navigateTo("base")} 
              className="flex-1 sm:flex-none text-center bg-slate-800 hover:bg-slate-750 active:scale-95 text-xs text-white border border-slate-700 font-bold px-3.5 py-2 rounded-xl transition duration-150 cursor-pointer"
            >
              Consultas de Base
            </button>
            <button 
              onClick={() => navigateTo("leads")} 
              className="flex-1 sm:flex-none text-center bg-sky-600 hover:bg-sky-500 active:scale-95 text-xs text-white font-bold px-3.5 py-2 rounded-xl transition duration-150 cursor-pointer shadow-md shadow-sky-900/30"
            >
              Monitorar Leads
            </button>
          </div>
        </div>
      )}

      {/* QUICK ADD LEAD (VENDEDORES) */}
      {!isAdmin && (
        <button
          onClick={() => navigateTo("cadastroLead")}
          className="w-full bg-gradient-to-tr from-sky-600 to-sky-600 hover:opacity-95 text-white p-5 rounded-[24px] shadow-lg shadow-sky-600/30 flex items-center justify-between group transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-black tracking-tight leading-none mb-1">Cadastrar Novo Lead</h2>
              <p className="text-[11px] text-sky-100 font-semibold opacity-90 uppercase tracking-wider">Acesso rápido</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-white text-sky-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <ChevronRight className="w-6 h-6 ml-0.5" />
          </div>
        </button>
      )}

      {/* 2. LIVE AI INSIGHTS CARD PANEL */}
      <div className="bg-gradient-to-r from-slate-950 to-sky-950 rounded-[28px] border border-slate-800 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-950">
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest leading-none">MHNET AI Sales Advisor</span>
                <span className="inline-block text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase leading-none">Gemini 1.5 Ativo</span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Táticas Comerciais Recomendadas</h3>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{loadingQuote ? "Sintonizando táticas comerciais da IA..." : aiQuote}"
              </p>
            </div>
          </div>
          <button
            onClick={loadAiQuote}
            disabled={loadingQuote}
            className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition px-3 py-1.5 rounded-full cursor-pointer shrink-0"
            title="Recarregar nova dica da IA de forma segura"
          >
            <RefreshCw className={`w-3 h-3 ${loadingQuote ? "animate-spin text-sky-400" : ""}`} />
            <span>Atualizar Tática</span>
          </button>
        </div>
      </div>

      {/* 3. CORE COMMAND BENTO GRID */}
      <div className="grid grid-cols-12 gap-5">
        
        {/* TILE 1: Monthly sales objectives - Goal vs Actual (8 columns layout desktop) */}
        <div className="col-span-12 lg:col-span-8 card-modern rounded-[24px] border border-slate-200 p-6 shadow-lg transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider">Objetivo de Vendas Individual</span>
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">Meta x Realizado do Mês</h4>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] font-bold text-slate-400 block">Status da Meta</span>
              <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 ${
                monthlyGoalPct >= 80 ? "bg-[#E6FAF1] text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {monthlyGoalPct}% Atingido
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-4">
            <div className="md:col-span-4 flex flex-col justify-center items-center py-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase mb-1">Total de Vendas</div>
              <div className="text-4xl font-extrabold text-slate-950 font-mono tracking-tight">{closedSales}</div>
              <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">De {monthlyGoal} Pretendidos</div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Sua evolução de vendas em LRS</span>
                  <span className="font-extrabold font-mono text-slate-800">{closedSales} / {monthlyGoal} vendas</span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                  <div 
                    className="bg-sky-600 h-full rounded-full transition-all duration-500 shadow-inner flex items-center justify-end pr-2 text-[8px] font-black text-white"
                    style={{ width: `${monthlyGoalPct}%` }}
                  >
                    {monthlyGoalPct > 15 && `${monthlyGoalPct}%`}
                  </div>
                </div>
              </div>

              {/* Reward milestone badge */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                <div className="bg-white rounded-full p-1.5 shadow-sm border border-amber-100">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
                <span className="text-[11px] text-amber-900 font-bold leading-relaxed">
                  {closedSales >= monthlyGoal 
                    ? "✨ Sensacional! Você superou sua meta e mostrou do que é capaz. Continue brilhando!"
                    : `“O sucesso é a soma de pequenos esforços repetidos dia após dia.” Foco total, faltam só ${monthlyGoal - closedSales} vendas!`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Taxa de Conversão de Funil: <strong className="text-slate-800">{conversionRate}%</strong></span>
            </div>
            <button 
              onClick={() => navigateTo("indicators")} 
              className="text-sky-600 hover:text-sky-800 font-bold uppercase tracking-wide text-[10.5px] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver Gráfico Funil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TILE 2: Conversão do dia (%) (Circular progress - 4 columns layout desktop) */}
        <div className="col-span-12 lg:col-span-4 card-modern rounded-[24px] border border-slate-200 p-6 shadow-lg transition-all flex flex-col justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider">Métricas de Fundo de Funil</span>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">Conversão Diária</h4>
          </div>

          <div className="my-5 flex items-center justify-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              {/* Radial circle representation */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="48" cy="48" r="40" stroke="#4f46e5" strokeWidth="6" fill="transparent" 
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * todayConversion) / 100}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-slate-950 font-mono tracking-tighter leading-none">{todayConversion}%</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Taxa</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none">Novos hoje</span>
                <span className="text-sm font-bold text-slate-800">{leadsHojeCount} leads</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none">Fechados hoje</span>
                <span className="text-sm font-bold text-[#00A86B] flex items-center gap-1">
                  {todaySales} fechadas <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200/40 rounded-xl text-[10px] text-slate-550 leading-relaxed text-center">
            {leadsHojeCount === 0 
              ? "Sem novos leads cadastrados hoje. Agilize sua panfletagem no condomínio!" 
              : "Abordagem rápida gera vendas rápidas. Fale hoje com eles!"
            }
          </div>
        </div>

        {/* TILE 3: Clientes para retorno hoje (Action-ready followups) */}
        <div className="col-span-12 lg:col-span-6 card-modern rounded-[24px] border border-slate-200 p-6 shadow-lg flex flex-col justify-between h-[360px] transition duration-200">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Compromissos Agendados</span>
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-900 tracking-tight">Clientes para Retorno Hoje</h4>
              <span className="text-xs font-mono font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                {retornosHoje.length} Pendentes
              </span>
            </div>
          </div>

          <div className="my-4 flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
            {retornosHoje.length > 0 ? (
              retornosHoje.map((item, idx) => (
                <div key={item._linha || idx} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl flex items-center justify-between gap-3 transition">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">{item.nomeLead}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.bairro} · {item.endereco}</div>
                    <div className="inline-block text-[9px] bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded mt-1">
                      Plano: {item.planoAtual || "Não informado"}
                    </div>
                  </div>
                  
                  {/* WhatsApp contact prompt */}
                  <a 
                    href={`https://wa.me/${item.telefone?.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#E6FAF1] hover:bg-emerald-100 text-[#00A86B] border border-emerald-200/80 rounded-xl transition shrink-0" 
                    title="Enviar WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-400 font-medium">Você concluiu todos os retornos de hoje! Parabéns pelo empenho.</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigateTo("leads")}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition text-center cursor-pointer"
          >
            Acessar Funil de Leads Completo
          </button>
        </div>

        {/* TILE 4: Previsão do Tempo */}
        <div className="col-span-12 lg:col-span-6 card-modern rounded-[24px] border border-slate-200 p-6 shadow-lg flex flex-col justify-between h-[360px] transition duration-200 bg-gradient-to-br from-blue-50 to-sky-100">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest block">Lajeado / RS</span>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">🌤️ Previsão do Tempo</h4>
          </div>

          <div className="my-4 flex-1 flex flex-col items-center justify-center space-y-4">
            {weatherData ? (
              <div className="w-full flex flex-col h-full justify-between mt-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center gap-4">
                    <img src={weatherData.icon} alt={weatherData.description} className="w-20 h-20 drop-shadow-md" />
                    <div className="text-left">
                      <span className="text-4xl font-black text-slate-800 tracking-tighter block leading-none">{weatherData.temp}°C</span>
                      <span className="text-sm font-bold text-slate-500 capitalize mt-1 block">{weatherData.description}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-sky-200/50 w-full">
                  {weatherData.forecast.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center bg-white/40 rounded-xl p-2 border border-white/20">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{day.dayOfWeek}</span>
                      <img src={day.icon} alt="icon" className="w-10 h-10 drop-shadow-sm" />
                      <span className="text-sm font-black text-slate-700 mt-1">{day.temp}°C</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
                <span className="text-xs font-bold text-slate-500">Buscando previsão...</span>
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="w-full py-2 bg-white/60 border border-white/40 text-sky-900 rounded-xl text-[10px] uppercase font-black tracking-widest text-center shadow-sm">
              Mantenha o Foco nas Vendas!
            </div>
          </div>
        </div>

        {/* TILE 5: Leads parados mais de 48h Warning Panel (Whole span) */}
        {staleLeads.length > 0 && (
          <div 
            onClick={() => navigateTo("leads")}
            className="col-span-12 bg-rose-50 border border-rose-200 p-5 rounded-[24px] hover:bg-rose-100/50 hover:border-rose-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-rose-100 border border-rose-200 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5.5 h-5.5 stroke-[2.2] animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Atenção Prioritária (Ação no Funil)</div>
                <h4 className="text-sm font-black text-slate-900 leading-tight">Você possui {staleLeads.length} leads parados há mais de 48h!</h4>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Estes possíveis clientes mostraram interesse mas não tiveram atualizações recentes em seu status. Abordagens rápidas no PAP evitam que abandonem ou fechem com a concorrência!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-700 font-extrabold uppercase tracking-wide cursor-pointer select-none shrink-0 border border-rose-300 rounded-full bg-white px-4 py-1.5 hover:bg-rose-50">
              <span>Recuperar Leads</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </div>
          </div>
        )}

      </div>


      {/* 4. WORK MODULE PORTALS GRID */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 select-none">Atalhos dos Módulos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          
          <button 
            onClick={() => navigateTo("leads")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center"><Users className="w-5 h-5 stroke-[2.2]" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Gestão</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Leads PAP</div>
            </div>
          </button>
          {isAdmin && (
            <button 
              onClick={() => navigateTo("protocolos_internos")} 
              className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E6FAF1] border border-[#00A86B]/20 text-[#00A86B] flex items-center justify-center"><FileText className="w-5 h-5 stroke-[2.2]" /></div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Acompanhamento</span>
                <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Protocolos Internos</div>
              </div>
            </button>
          )}

          <button 
            onClick={() => navigateTo("leads_frios")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-500 flex items-center justify-center"><FileSpreadsheet className="w-5 h-5 stroke-[2.2]" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Captação</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Leads Frios</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("tasks")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center"><CheckSquare className="w-5 h-5 stroke-[2.2]" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Atividades</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Minhas Tarefas</div>
              {pendingTasksTotal > 0 && (
                <span className="inline-block mt-1 text-[8px] bg-blue-100 text-blue-900 px-1 py-0.2 rounded font-black font-mono">
                  {pendingTasksTotal} ATIVAS
                </span>
              )}
            </div>
          </button>

          <button 
            onClick={() => navigateTo("absences")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center"><CalendarDays className="w-5 h-5 stroke-[2.2]" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Escala</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Ausências & Faltas</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("materials")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center"><FolderOpen className="w-5 h-5 stroke-[2.2]" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Drive</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Arquivos & Panfletos</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("planos")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center"><List className="w-5 h-5 stroke-[2.2]" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Comercial</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Planos & Preços</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("rotas")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center"><MapPin className="w-5 h-5 stroke-[2.2]" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Inteligência</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Rota de Vendas</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("objecoes")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Contorno</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Combate Objeções</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("concorrentes")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center"><Zap className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Análise</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Concorrência Local</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("estrategia")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center"><Bot className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Gestão</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Gestão Estratégica</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("base")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Gestão</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Base de Clientes</div>
            </div>
          </button>

          <button 
            onClick={() => handleFttaGo("lajeado")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6FAF1] border border-[#00A86B]/20 text-[#00A86B] flex items-center justify-center"><Network className="w-5 h-5" /></div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Estudos</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Viabilidade FTTA</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("calculo_multa")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Simulador</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Cálculo de Multa</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("pos_venda")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6FAF1] border border-[#00A86B]/20 text-[#00A86B] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Retenção</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Pós Vendas</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("matriz_objecoes")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Argumentação</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Matriz Objeções</div>
            </div>
          </button>

          <button 
            onClick={() => navigateTo("trade")} 
            className="card-modern border border-slate-200/80 rounded-[22px] p-4 flex flex-col items-start gap-4 cursor-pointer shadow-sm  hover:border-slate-300  active:translate-y-0 text-left transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 14 3-3"/><path d="m2 10 3 3"/><path d="m2 18 3-3"/><path d="m2 6 3 3"/><path d="M11 20h11"/><path d="m7 12 7-7 4 4-7 7-4-4Z"/></svg>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Marketing</span>
              <div className="text-xs font-extrabold text-slate-800 tracking-tight leading-tight mt-0.5">Ações de Trade</div>
            </div>
          </button>

        </div>
      </div>

      {/* 5. FTTA MAP DECORATIVE SITES AND QUICK ENTRANCES */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 select-none">Mapeamento FTTA — Áreas Ativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          <div 
            onClick={() => handleFttaGo("lajeado")}
            className="card-modern border border-slate-200/80 rounded-[24px] p-4 flex items-center gap-4.5 cursor-pointer shadow -md hover:border-slate-300  transition duration-200 bg-gradient-to-br from-white to-blue-50/20"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs select-none shadow-md shadow-sky-900/10">LJ</div>
            <div>
              <div className="text-xs font-black text-slate-800 leading-tight">FTTA Lajeado</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Condomínios Ativos</div>
            </div>
          </div>

          <div 
            onClick={() => handleFttaGo("estrela")}
            className="card-modern border border-slate-200/80 rounded-[24px] p-4 flex items-center gap-4.5 cursor-pointer shadow -md hover:border-slate-300  transition duration-200 bg-gradient-to-br from-white to-teal-50/20 w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs select-none shadow-md shadow-teal-900/10">ES</div>
            <div>
              <div className="text-xs font-black text-slate-800 leading-tight">FTTA Estrela</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Sectores Instalados</div>
            </div>
          </div>

          <div 
            onClick={() => handleFttaGo("prospeccao")}
            className="card-modern border border-slate-200/80 rounded-[24px] p-4 flex items-center gap-4.5 cursor-pointer shadow -md hover:border-slate-300  transition duration-200 bg-gradient-to-br from-white to-blue-50/20 w-full"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs select-none shadow-md shadow-blue-950/10 font-sans">PR</div>
            <div>
              <div className="text-xs font-black text-slate-800 leading-tight">Mapeamento Viabilidade</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Em captação comercial</div>
            </div>
          </div>

        </div>
      </div>

      {/* 6. PLAYBOOK E AJUDA PROCESSOS */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 select-none">Recursos e Processos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <a
            href="https://sites.google.com/view/playbook-vendas-digitais/planos-varejo-apenas-cpf?authuser=0"
            target="_blank"
            rel="noopener noreferrer"
            className="card-modern border border-slate-200/80 rounded-[24px] p-4 flex items-center gap-4.5 cursor-pointer shadow -md hover:border-slate-300  transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs select-none shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 leading-tight">Playbook</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Planos Varejo</div>
            </div>
          </a>
          <a
            href="https://docs.google.com/document/d/1XJerfC5kThE2EBPChlvWvIJO1SFNUW5YGNp0B0c30K0/edit?tab=t.tdusduyigo5t"
            target="_blank"
            rel="noopener noreferrer"
            className="card-modern border border-slate-200/80 rounded-[24px] p-4 flex items-center gap-4.5 cursor-pointer shadow -md hover:border-slate-300  transition duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs select-none shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 leading-tight">Ajuda Processos</div>
              <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Documentação de Apoio</div>
            </div>
          </a>
        </div>
      </div>

      {/* Dynamic Modal for Seller Leads Transfer */}
      {selectedSellerForLeads && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[28px] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header without any sales numbers or lead totals as requested */}
            <div className="p-5 border-b border-slate-150 bg-slate-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-black text-slate-900 tracking-tight">Leads de {selectedSellerForLeads}</h4>
                  <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider leading-none mt-1">Gerenciamento e Transferência Comercial</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSellerForLeads(null)}
                className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Feedback messages */}
              {feedback && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  feedback.type === "success" 
                    ? "bg-[#E6FAF1] border-emerald-200 text-emerald-800" 
                    : "bg-rose-50 border-rose-200 text-rose-850"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${feedback.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* SECTION A: Bulk Transfer (Transferir todos os de uma vez) */}
              {leads.filter(l => l.vendedor?.toLowerCase().trim() === selectedSellerForLeads.toLowerCase().trim()).length > 0 && (
                <div className="bg-sky-50/30 border border-sky-100 rounded-[20px] p-5 space-y-3.5">
                  <div>
                    <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest block mb-0.5">Transferência Geral de Carteira</span>
                    <h5 className="text-xs font-black text-slate-900">Transferir TODOS os leads deste vendedor simultaneamente</h5>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1">
                      <select
                        value={bulkTargetSeller}
                        onChange={e => setBulkTargetSeller(e.target.value)}
                        className="w-full h-10 px-3.5 rounded-xl border border-slate-250 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 transition"
                      >
                        <option value="">Escolha o vendedor substituto...</option>
                        {activeSellers
                          .filter(name => name.toLowerCase().trim() !== selectedSellerForLeads.toLowerCase().trim())
                          .map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))
                        }
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (!bulkTargetSeller) {
                          setFeedback({ type: "error", text: "Por favor, selecione o vendedor para onde reatribuir." });
                          return;
                        }
                        setTransferLoading("bulk");
                        setFeedback(null);
                        try {
                          const response = await fetch("/api/leads/bulk-transfer", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              fromSeller: selectedSellerForLeads,
                              toSeller: bulkTargetSeller
                            })
                          });
                          if (!response.ok) throw new Error("Erro na requisição.");
                          const data = await response.json();
                          if (onSync) {
                            await onSync();
                          }
                          setFeedback({ 
                            type: "success", 
                            text: `Sucesso! Todos os leads (${data.details?.leadsTransferred || 0}) foram reatribuídos para ${bulkTargetSeller}.` 
                          });
                          setBulkTargetSeller("");
                        } catch (err: any) {
                          setFeedback({ type: "error", text: "Erro ao realizar transferência em lote: " + err.message });
                        } finally {
                          setTransferLoading(null);
                        }
                      }}
                      disabled={transferLoading !== null || !bulkTargetSeller}
                      className="h-10 px-5 bg-sky-600 hover:bg-sky-550 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-900/10 cursor-pointer flex items-center justify-center gap-1.5 transition whitespace-nowrap shrink-0"
                    >
                      {transferLoading === "bulk" ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Transferindo...</span>
                        </>
                      ) : (
                        <span>Transferir Toda Carteira</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION B: Leads List */}
              <div className="space-y-3">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block px-1">Lançamentos Individuais</span>
                
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {leads.filter(l => l.vendedor?.toLowerCase().trim() === selectedSellerForLeads.toLowerCase().trim()).length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-bold text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                      Não há leads sob responsabilidade deste vendedor.
                    </div>
                  ) : (
                    leads
                      .filter(l => l.vendedor?.toLowerCase().trim() === selectedSellerForLeads.toLowerCase().trim())
                      .map((lead, idx) => {
                        let statusColor = "bg-slate-50 border-slate-200 text-slate-700";
                        if (lead.status === "Novo") statusColor = "bg-blue-50 border-blue-200 text-blue-700";
                        else if (lead.status === "Agendado") statusColor = "bg-amber-50 border-amber-200 text-amber-700";
                        else if (lead.status === "Negociação") statusColor = "bg-blue-50 border-blue-200 text-blue-900";
                        else if (lead.status === "Venda Fechada") statusColor = "bg-[#E6FAF1] border-emerald-200 text-emerald-700";
                        else if (lead.status === "Sem Interesse") statusColor = "bg-rose-50 border-rose-200 text-rose-700";

                        return (
                          <div key={lead._linha || idx} className="p-4 border border-slate-150 rounded-[20px] bg-white hover:border-slate-250 -xs transition-all space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0">
                                <h6 className="font-extrabold text-slate-900 text-xs truncate leading-normal">{lead.nomeLead}</h6>
                                <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{lead.bairro} · {lead.endereco}</p>
                                <p className="text-[10px] text-sky-600 font-bold mt-1">Contato: {lead.telefone}</p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black shrink-0 ${statusColor}`}>
                                {lead.status}
                              </span>
                            </div>

                            {/* Single Lead Reassignment */}
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                              <span className="text-[9.5px] font-black text-slate-400 uppercase shrink-0">Reatribuir Vendedor:</span>
                              <div className="flex-1 max-w-[240px]">
                                <select
                                  defaultValue=""
                                  onChange={async (e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    setTransferLoading(String(lead._linha));
                                    setFeedback(null);
                                    try {
                                      const updatedLead = { ...lead, vendedor: val };
                                      const response = await fetch("/api/leads", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(updatedLead)
                                      });
                                      if (!response.ok) throw new Error("Erro de atualização no servidor.");
                                      
                                      if (onSync) {
                                        await onSync();
                                      }
                                      setFeedback({ 
                                        type: "success", 
                                        text: `Lead "${lead.nomeLead}" transferido com sucesso para ${val}!` 
                                      });
                                    } catch (err: any) {
                                      setFeedback({ type: "error", text: "Erro ao transferir lead: " + err.message });
                                    } finally {
                                      setTransferLoading(null);
                                    }
                                  }}
                                  disabled={transferLoading !== null}
                                  className="w-full h-8.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer transition"
                                >
                                  <option value="">Selecione vendedor substituto...</option>
                                  {activeSellers
                                    .filter(name => name.toLowerCase().trim() !== selectedSellerForLeads.toLowerCase().trim())
                                    .map(name => (
                                      <option key={name} value={name}>{name}</option>
                                    ))
                                  }
                                </select>
                              </div>
                              {transferLoading === String(lead._linha) && (
                                <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedSellerForLeads(null)}
                className="px-4.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white text-xs font-black uppercase rounded-xl cursor-pointer transition shadow-sm active:translate-y-[1px]"
              >
                Concluir & Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
