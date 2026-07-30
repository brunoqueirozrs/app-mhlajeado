import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  CalendarDays, 
  BrainCircuit, 
  Sparkles, 
  Navigation, 
  Edit3, 
  X, 
  Check, 
  Send, 
  Flame, 
  Sun, 
  Snowflake, 
  Plus, 
  Trash2, 
  Sliders, 
  Save, 
  Info,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Lead, BairroHeatItem, RotaIaParametros, HeatLevel, RouteSlot } from "../types";

interface RotaVendasPageProps {
  leads: Lead[];
  loggedUser: string;
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(date.setDate(diff));
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatDateString(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CIDADES_SUPORTADAS = ["Lajeado", "Estrela", "Arroio do Meio"];

export default function RotaVendasPage({ leads, loggedUser }: RotaVendasPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<"cronograma" | "parametros">("cronograma");
  
  const [briefing, setBriefing] = useState("");
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [rotaSemanal, setRotaSemanal] = useState<RouteSlot[]>([]);
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()));

  // N8N State
  const [sendingN8n, setSendingN8n] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<string | null>(null);

  // Config & Heatmap State
  const [bairros, setBairros] = useState<BairroHeatItem[]>([]);
  const [parametros, setParametros] = useState<RotaIaParametros>({
    regraDias1a10: "Primeiros 10 dias do mês: focar prioritariamente nos bairros com Maior Calor (Top Oportunidades).",
    regraDias11a16: "Dias 11 a 16 do mês: focar nos bairros com menor densidade / cobertura para prospeção de novas áreas.",
    regraSextaTarde: "Todas as Sextas-feiras à tarde: focar exclusivamente em Condomínios e Edifícios residenciais.",
    regraSabado: "Todos os Sábados: focar em Ação Externa e Ponto de Venda (PDV).",
    observacaoGeral: "Dividir a agenda em 2 turnos por dia (Turno 1 = Manhã, Turno 2 = Tarde)."
  });
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);

  // Filter cidade in Parametros
  const [selectedCidadeParam, setSelectedCidadeParam] = useState("Lajeado");

  // New Bairro Form
  const [novoBairroNome, setNovoBairroNome] = useState("");
  const [novoBairroCidade, setNovoBairroCidade] = useState("Lajeado");
  const [novoBairroHeat, setNovoBairroHeat] = useState<HeatLevel>("quente");

  // Slot Editing State
  const [editingSlot, setEditingSlot] = useState<{ dateStr: string; turno: number } | null>(null);
  const [editCidade, setEditCidade] = useState("Lajeado");
  const [editBairro, setEditBairro] = useState("");
  const [editJustificativa, setEditJustificativa] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + i);
    return d;
  });

  // Carregar Configurações de Bairros e Parâmetros
  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const resp = await fetch("/api/rotas/config");
      if (resp.ok) {
        const data = await resp.json();
        if (data.bairros) setBairros(data.bairros);
        if (data.parametros) setParametros(data.parametros);
      }
    } catch (e) {
      console.error("Erro ao carregar configurações de rota:", e);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Carregar Rota Salva do Servidor para a semana atual e vendedor
  const loadSavedRoute = async () => {
    const weekMondayStr = formatDateString(currentWeekMonday);
    try {
      const resp = await fetch(`/api/rotas?vendedor=${encodeURIComponent(loggedUser)}&weekMonday=${weekMondayStr}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.rota) {
          setBriefing(data.rota.briefing || "");
          setRotaSemanal(data.rota.slots || []);
        } else {
          // Se não existir rota salva para a semana, gera automaticamente via IA
          generateBriefingAndRoute();
        }
      }
    } catch (e) {
      console.error("Erro ao buscar rota salva:", e);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (loggedUser) {
      loadSavedRoute();
    }
  }, [currentWeekMonday, loggedUser]);

  // Gerar Rota com IA
  const generateBriefingAndRoute = async () => {
    setLoadingBriefing(true);
    setN8nStatus(null);
    try {
      const weekMondayStr = formatDateString(currentWeekMonday);
      const resp = await fetch("/api/gemini/generateRouteBriefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads, loggedUser, weekMonday: weekMondayStr })
      });
      const data = await resp.json();
      if (data.status === "success") {
        setBriefing(data.briefing);
        if (data.rotaSemanal && Array.isArray(data.rotaSemanal)) {
          setRotaSemanal(data.rotaSemanal);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBriefing(false);
    }
  };

  // Salvar a Rota Manualmente ou quando editada
  const saveCurrentRouteToDb = async (updatedSlots: RouteSlot[], newBriefing?: string) => {
    const weekMondayStr = formatDateString(currentWeekMonday);
    try {
      await fetch("/api/rotas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendedor: loggedUser,
          weekMonday: weekMondayStr,
          briefing: newBriefing !== undefined ? newBriefing : briefing,
          slots: updatedSlots
        })
      });
    } catch (e) {
      console.error("Erro ao salvar rota:", e);
    }
  };

  // Enviar para o N8N
  const handleNotifyN8n = async () => {
    setSendingN8n(true);
    setN8nStatus(null);
    try {
      const weekMondayStr = formatDateString(currentWeekMonday);
      const resp = await fetch("/api/rotas/notify-n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendedor: loggedUser,
          weekMonday: weekMondayStr,
          briefing,
          slots: rotaSemanal
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setN8nStatus("Rota enviada com sucesso para o N8N / WhatsApp!");
      } else {
        setN8nStatus(data.error || "Falha ao enviar para o N8N.");
      }
    } catch (e) {
      console.error("Erro ao disparar N8N:", e);
      setN8nStatus("Erro ao conectar com a API do N8N.");
    } finally {
      setSendingN8n(false);
    }
  };

  // Handlers do Modal de Edição de Turno
  const handleSlotClick = (dateStr: string, turno: number, slot: RouteSlot | undefined) => {
    setEditingSlot({ dateStr, turno });
    
    let c = "Lajeado";
    let b = "";
    if (slot && slot.foco) {
      if (slot.foco.includes(" - ")) {
        const parts = slot.foco.split(" - ");
        b = parts[0];
        c = parts[1];
      } else {
        b = slot.foco;
      }
    }
    setEditCidade(c);
    setEditBairro(b);
    setEditJustificativa(slot?.justificativa || "");
  };

  const handleSaveSlot = () => {
    if (!editingSlot) return;
    const focoStr = editBairro ? `${editBairro} - ${editCidade}` : "Livre";
    const newSlots = [...rotaSemanal];
    const existingIdx = newSlots.findIndex(s => s.dateStr === editingSlot.dateStr && s.turno === editingSlot.turno);
    
    if (existingIdx >= 0) {
      newSlots[existingIdx] = { ...newSlots[existingIdx], foco: focoStr, justificativa: editJustificativa };
    } else {
      newSlots.push({
        dateStr: editingSlot.dateStr,
        turno: editingSlot.turno,
        foco: focoStr,
        justificativa: editJustificativa
      });
    }

    setRotaSemanal(newSlots);
    saveCurrentRouteToDb(newSlots);
    setEditingSlot(null);
  };

  // Handlers do Mapa de Calor e Configurações de Parâmetros
  const handleAddBairro = () => {
    if (!novoBairroNome.trim()) return;
    const novoItem: BairroHeatItem = {
      id: "b_" + Date.now(),
      cidade: novoBairroCidade,
      nome: novoBairroNome.trim(),
      heatLevel: novoBairroHeat
    };
    setBairros(prev => [...prev, novoItem]);
    setNovoBairroNome("");
  };

  const handleDeleteBairro = (id: string) => {
    setBairros(prev => prev.filter(b => b.id !== id));
  };

  const handleChangeBairroHeat = (id: string, newHeat: HeatLevel) => {
    setBairros(prev => prev.map(b => b.id === id ? { ...b, heatLevel: newHeat } : b));
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setConfigSuccessMsg(null);
    try {
      const resp = await fetch("/api/rotas/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bairros, parametros })
      });
      if (resp.ok) {
        setConfigSuccessMsg("Parâmetros e Mapa de Calor salvos com sucesso!");
        setTimeout(() => setConfigSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingConfig(false);
    }
  };

  // Bairros filtrados por cidade ativa no painel de parâmetros
  const bairrosFiltrados = bairros.filter(b => selectedCidadeParam === "Todas" || b.cidade === selectedCidadeParam);
  const bairrosQuentes = bairrosFiltrados.filter(b => b.heatLevel === "quente");
  const bairrosMedios = bairrosFiltrados.filter(b => b.heatLevel === "medio");
  const bairrosFrios = bairrosFiltrados.filter(b => b.heatLevel === "frio");

  // Obter bairros disponíveis para edição do slot
  const bairrosParaSelecaoSlot = bairros
    .filter(b => b.cidade === editCidade)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const renderSlotCell = (dateStr: string, turno: number, label: string) => {
    const slot = rotaSemanal.find(r => r.dateStr === dateStr && r.turno === turno);
    const hasData = slot && slot.foco;

    return (
      <div 
        key={`${dateStr}-${turno}`}
        onClick={() => handleSlotClick(dateStr, turno, slot)}
        className={`relative p-2.5 rounded-xl border flex flex-col justify-center min-h-[90px] transition-all cursor-pointer group ${
          hasData 
            ? "bg-slate-900 border-slate-700 hover:border-sky-500" 
            : "border-slate-800/50 border-dashed bg-slate-950/30 hover:border-slate-600 hover:bg-slate-900/50"
        }`}
      >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
        </div>
        {hasData ? (
          <>
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider line-clamp-2 pr-4">{slot.foco}</p>
            </div>
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed line-clamp-3">{slot.justificativa}</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 space-y-1 h-full">
            <span className="text-[10px] font-bold uppercase tracking-widest">{label} Livre</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
      {/* Header e Sub-abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-sm">
            <Navigation className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">Rota de Vendas</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 tracking-widest uppercase">Inteligência de Campo & Automação</p>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveSubTab("cronograma")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "cronograma"
                ? "bg-white text-sky-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Cronograma Rota IA
          </button>
          <button
            onClick={() => setActiveSubTab("parametros")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === "parametros"
                ? "bg-white text-sky-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Parâmetros & Mapa de Calor
          </button>
        </div>
      </div>

      {/* ABA 1: CRONOGRAMA DA ROTA IA */}
      {activeSubTab === "cronograma" && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="text-slate-400">Vendedor:</span>
              <span className="bg-sky-50 text-sky-800 px-2.5 py-1 rounded-lg border border-sky-100 font-extrabold">{loggedUser}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button 
                onClick={generateBriefingAndRoute}
                disabled={loadingBriefing}
                className="bg-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-sky-700 transition active:scale-95 disabled:opacity-50 shadow-sm shadow-sky-600/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {loadingBriefing ? "Gerando Rota IA..." : "Gerar Rota com IA"}
              </button>

              <button
                onClick={handleNotifyN8n}
                disabled={sendingN8n || rotaSemanal.length === 0}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50 shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {sendingN8n ? "Enviando para N8N..." : "Disparar Rota (n8n)"}
              </button>
            </div>
          </div>

          {/* Feedback N8N Status */}
          {n8nStatus && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              n8nStatus.includes("sucesso") 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{n8nStatus}</span>
              </div>
              <button onClick={() => setN8nStatus(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* AI Briefing */}
          <div className="bg-sky-50 border border-sky-100 rounded-3xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-sky-600" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-black uppercase text-sky-900 tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Briefing de Rota Inteligente
              </h3>
              {loadingBriefing ? (
                <div className="flex flex-col items-start justify-center py-4 space-y-4">
                  <div className="w-6 h-6 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm border border-sky-200/50 p-4 rounded-2xl text-slate-700 text-[13px] leading-relaxed whitespace-pre-wrap font-medium shadow-sm">
                  {briefing || "Clique em 'Gerar Rota com IA' para que a inteligência artificial construa a agenda de turnos com base no mapa de calor dos bairros."}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#0b1120] rounded-3xl p-6 shadow-sm border border-slate-800 text-slate-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-sm font-black uppercase text-slate-200 tracking-wider flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-500" /> Cronograma de Turnos (Frota)
              </h3>
              <div className="flex items-center gap-3 bg-slate-900 rounded-xl border border-slate-800 p-1">
                <button onClick={() => {
                  const prev = new Date(currentWeekMonday);
                  prev.setDate(currentWeekMonday.getDate() - 7);
                  setCurrentWeekMonday(prev);
                }} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition font-bold text-[10px] tracking-wider uppercase cursor-pointer">
                  Semana Ant.
                </button>
                <div className="w-px h-4 bg-slate-800"></div>
                <button onClick={() => setCurrentWeekMonday(getMonday(new Date()))} className="px-4 py-2 rounded-lg bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 hover:text-sky-300 transition font-black text-[10px] tracking-wider uppercase cursor-pointer">
                  Hoje
                </button>
                <div className="w-px h-4 bg-slate-800"></div>
                <button onClick={() => {
                  const next = new Date(currentWeekMonday);
                  next.setDate(currentWeekMonday.getDate() + 7);
                  setCurrentWeekMonday(next);
                }} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition font-bold text-[10px] tracking-wider uppercase cursor-pointer">
                  Próx. Semana
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((day) => {
                const dateStr = formatDateString(day);
                const isToday = formatDateString(new Date()) === dateStr;
                const dayName = day.toLocaleDateString("pt-BR", { weekday: "long" }).split("-")[0];
                const formattedLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                
                return (
                  <div 
                    key={dateStr} 
                    className={`flex flex-col bg-slate-900 rounded-xl overflow-hidden border ${
                      isToday ? "border-sky-500 shadow-lg shadow-sky-950/20" : "border-slate-800"
                    }`}
                  >
                    <div className={`p-3 text-center border-b ${
                        isToday ? "bg-sky-600 text-white border-sky-500" : "bg-slate-950 text-slate-300 border-slate-800"
                      }`}
                    >
                      <div className="text-[10px] font-bold tracking-wider uppercase opacity-75">{formattedLabel}</div>
                      <div className="text-sm font-extrabold">{day.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}</div>
                    </div>

                    <div className="p-2 space-y-3 flex-1 flex flex-col justify-start">
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Manhã</div>
                        {renderSlotCell(dateStr, 1, "Manhã")}
                      </div>
                      
                      <div className="border-t border-slate-800/50 my-1"></div>

                      <div className="space-y-1.5">
                        <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Tarde / Extras</div>
                        {renderSlotCell(dateStr, 2, "Tarde")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: PARÂMETROS & MAPA DE CALOR */}
      {activeSubTab === "parametros" && (
        <div className="space-y-8">
          {/* Top Info Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold mb-0.5">Lógica do Escopo de Rota de Vendas</p>
              <p className="font-medium text-amber-800/90 leading-relaxed">
                Aqui você ajusta o Mapa de Calor por Cidade e os Bairros que direcionam a geração da IA no sistema. O n8n é utilizado exclusivamente para o disparo das mensagens no WhatsApp dos vendedores.
              </p>
            </div>
          </div>

          {/* Feedback Message */}
          {configSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-extrabold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{configSuccessMsg}</span>
              </div>
              <button onClick={() => setConfigSuccessMsg(null)}>
                <X className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          )}

          {/* Seção 1: Filtro por Cidade + Adicionar Bairro */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-600" /> Mapa de Calor dos Bairros
                </h2>
                <p className="text-xs text-slate-500 font-medium">Organize os bairros por densidade e temperatura de vendas</p>
              </div>

              {/* Selector Cidade */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filtrar Cidade:</span>
                <select
                  value={selectedCidadeParam}
                  onChange={e => setSelectedCidadeParam(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
                >
                  <option value="Todas">Todas as Cidades</option>
                  {CIDADES_SUPORTADAS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Adicionar Bairro Form */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Adicionar Novo Bairro na Base</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nome do Bairro (ex: Santo Antônio)"
                  value={novoBairroNome}
                  onChange={e => setNovoBairroNome(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                />
                <select
                  value={novoBairroCidade}
                  onChange={e => setNovoBairroCidade(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                >
                  {CIDADES_SUPORTADAS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={novoBairroHeat}
                  onChange={e => setNovoBairroHeat(e.target.value as HeatLevel)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                >
                  <option value="quente">🔥 Quente (Top Oportunidade)</option>
                  <option value="medio">☀️ Médio</option>
                  <option value="frio">❄️ Frio / Cobertura</option>
                </select>
                <button
                  onClick={handleAddBairro}
                  className="bg-sky-600 text-white rounded-xl px-4 py-2 text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-sky-700 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Adicionar Bairro
                </button>
              </div>
            </div>

            {/* Colunas do Mapa de Calor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Coluna 1: Bairros Quentes */}
              <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between border-b border-rose-200/60 pb-2.5">
                  <span className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600" />
                    🔥 Top Oportunidades ({bairrosQuentes.length})
                  </span>
                  <span className="text-[10px] font-extrabold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">Quentes</span>
                </div>

                <div className="space-y-2 flex-1 max-h-[380px] overflow-y-auto pr-1">
                  {bairrosQuentes.map(b => (
                    <div key={b.id} className="bg-white border border-rose-200 p-2.5 rounded-xl flex items-center justify-between shadow-2xs group">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{b.nome}</p>
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">{b.cidade}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <select
                          value={b.heatLevel}
                          onChange={e => handleChangeBairroHeat(b.id, e.target.value as HeatLevel)}
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-1.5 py-1 text-slate-700"
                        >
                          <option value="quente">🔥 Quente</option>
                          <option value="medio">☀️ Médio</option>
                          <option value="frio">❄️ Frio</option>
                        </select>
                        <button onClick={() => handleDeleteBairro(b.id)} className="p-1 text-slate-300 hover:text-rose-600 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {bairrosQuentes.length === 0 && (
                    <p className="text-xs text-rose-400 font-medium italic text-center py-4">Nenhum bairro quente cadastrado.</p>
                  )}
                </div>
              </div>

              {/* Coluna 2: Bairros Médios */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                  <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-600" />
                    ☀️ Bairros Médios ({bairrosMedios.length})
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">Médios</span>
                </div>

                <div className="space-y-2 flex-1 max-h-[380px] overflow-y-auto pr-1">
                  {bairrosMedios.map(b => (
                    <div key={b.id} className="bg-white border border-amber-200 p-2.5 rounded-xl flex items-center justify-between shadow-2xs group">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{b.nome}</p>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{b.cidade}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <select
                          value={b.heatLevel}
                          onChange={e => handleChangeBairroHeat(b.id, e.target.value as HeatLevel)}
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-1.5 py-1 text-slate-700"
                        >
                          <option value="quente">🔥 Quente</option>
                          <option value="medio">☀️ Médio</option>
                          <option value="frio">❄️ Frio</option>
                        </select>
                        <button onClick={() => handleDeleteBairro(b.id)} className="p-1 text-slate-300 hover:text-rose-600 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {bairrosMedios.length === 0 && (
                    <p className="text-xs text-amber-400 font-medium italic text-center py-4">Nenhum bairro médio cadastrado.</p>
                  )}
                </div>
              </div>

              {/* Coluna 3: Bairros Frios / Cobertura */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Snowflake className="w-4 h-4 text-sky-500" />
                    ❄️ Bairros Frios / Cobertura ({bairrosFrios.length})
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">Frios</span>
                </div>

                <div className="space-y-2 flex-1 max-h-[380px] overflow-y-auto pr-1">
                  {bairrosFrios.map(b => (
                    <div key={b.id} className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center justify-between shadow-2xs group">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{b.nome}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{b.cidade}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <select
                          value={b.heatLevel}
                          onChange={e => handleChangeBairroHeat(b.id, e.target.value as HeatLevel)}
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-1.5 py-1 text-slate-700"
                        >
                          <option value="quente">🔥 Quente</option>
                          <option value="medio">☀️ Médio</option>
                          <option value="frio">❄️ Frio</option>
                        </select>
                        <button onClick={() => handleDeleteBairro(b.id)} className="p-1 text-slate-300 hover:text-rose-600 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {bairrosFrios.length === 0 && (
                    <p className="text-xs text-slate-400 font-medium italic text-center py-4">Nenhum bairro frio cadastrado.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Regras e Parâmetros para Prompt da IA */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-sky-600" /> Diretrizes e Regras de Rota IA
              </h2>
              <p className="text-xs text-slate-500 font-medium">Instruções fornecidas para a inteligência gerar o planejamento dos 14 turnos da semana</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Regra 1: Dias 01 a 10 do Mês</label>
                <input
                  type="text"
                  value={parametros.regraDias1a10}
                  onChange={e => setParametros({ ...parametros, regraDias1a10: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Regra 2: Dias 11 a 16 do Mês</label>
                <input
                  type="text"
                  value={parametros.regraDias11a16}
                  onChange={e => setParametros({ ...parametros, regraDias11a16: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Regra 3: Sexta-Feira à Tarde</label>
                <input
                  type="text"
                  value={parametros.regraSextaTarde}
                  onChange={e => setParametros({ ...parametros, regraSextaTarde: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">Regra 4: Sábados</label>
                <input
                  type="text"
                  value={parametros.regraSabado}
                  onChange={e => setParametros({ ...parametros, regraSabado: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="bg-sky-600 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-sky-700 transition shadow-md shadow-sky-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingConfig ? "Salvando Parâmetros..." : "Salvar Todos os Parâmetros da IA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edição de Turno */}
      {editingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="card-modern rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 bg-white">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-500" />
                Editar Turno ({editingSlot.turno === 1 ? "Manhã" : "Tarde"})
              </h2>
              <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Cidade</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                      value={editCidade}
                      onChange={e => {
                        setEditCidade(e.target.value);
                        setEditBairro("");
                      }}
                    >
                      {CIDADES_SUPORTADAS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Bairro</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
                      value={editBairro}
                      onChange={e => setEditBairro(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {bairrosParaSelecaoSlot.map(b => (
                        <option key={b.id} value={b.nome}>
                          {b.nome} ({b.heatLevel === "quente" ? "🔥 Quente" : b.heatLevel === "medio" ? "☀️ Médio" : "❄️ Frio"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Justificativa / Ação</label>
                <textarea 
                  value={editJustificativa}
                  onChange={e => setEditJustificativa(e.target.value)}
                  placeholder="Ex: Ação Externa PDV, Condomínios, Prospecção ativa..."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingSlot(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveSlot}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Salvar Turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
