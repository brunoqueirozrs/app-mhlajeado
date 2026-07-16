import React, { useState, useEffect } from "react";
import { MapPin, CalendarDays, BrainCircuit, Sparkles, Navigation, Edit3, X, Check, CheckCircle } from "lucide-react";
import { Lead } from "../types";
import { BAIRROS_LAJEADO, BAIRROS_ESTRELA } from "../data";

interface RotaVendasPageProps {
  leads: Lead[];
  loggedUser: string;
}

const SCORE_LAJEADO: Record<string, number> = {
  "Santo Antônio": 74,
  "Centro": 24,
  "Jardim Do Cedro": 22,
  "Conservas": 19,
  "Conventos": 13,
  "Florestal": 10,
  "Morro 25": 10,
  "São Cristóvão": 10,
  "Americano": 9,
  "Moinhos": 9,
  "Santo André": 9,
  "Campestre": 8,
  "Universitário": 8,
  "Montanha": 7,
  "Olarias": 6,
  "Bom Pastor": 5,
  "Moinhos D'Água": 5,
  "Planalto": 4,
  "Das Nações": 3,
  "Hidráulica": 3,
  "Igrejinha": 3,
  "Centenário": 2,
  "São Bento": 2,
  "Alto Do Parque": 1,
  "Indústrias": 1,
  "Jardim Botânico": 1
};

const SCORE_ESTRELA: Record<string, number> = {
  "Boa União": 7,
  "Estados": 5,
  "Indústrias": 5,
  "Oriental": 4,
  "Centro": 3,
  "Cristo Rei": 3,
  "Imigrantes": 3,
  "Marmitt": 3,
  "Pinheiros": 2,
  "Auxiliadora": 1,
  "São José": 1
};

interface RouteSlot {
  dateStr: string;
  turno: number; // 1 = Manhã, 2 = Tarde
  foco: string;
  justificativa: string;
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

export default function RotaVendasPage({ leads, loggedUser }: RotaVendasPageProps) {
  const [briefing, setBriefing] = useState("");
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [rotaSemanal, setRotaSemanal] = useState<RouteSlot[]>([]);
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()));

  // Editing state
  const [editingSlot, setEditingSlot] = useState<{ dateStr: string; turno: number } | null>(null);
  const [editCidade, setEditCidade] = useState("Lajeado");
  const [editBairro, setEditBairro] = useState("");
  const [editJustificativa, setEditJustificativa] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + i);
    return d;
  });

  const generateBriefingAndRoute = async () => {
    setLoadingBriefing(true);
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

  useEffect(() => {
    generateBriefingAndRoute();
  }, [currentWeekMonday]);

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
    setRotaSemanal(prev => {
      const copy = [...prev];
      const existingIdx = copy.findIndex(s => s.dateStr === editingSlot.dateStr && s.turno === editingSlot.turno);
      if (existingIdx >= 0) {
        copy[existingIdx] = { ...copy[existingIdx], foco: focoStr, justificativa: editJustificativa };
      } else {
        copy.push({
          dateStr: editingSlot.dateStr,
          turno: editingSlot.turno,
          foco: focoStr,
          justificativa: editJustificativa
        });
      }
      return copy;
    });
    setEditingSlot(null);
  };

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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-sm">
            <Navigation className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">Rota de Vendas</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 tracking-widest uppercase">Inteligência de Campo</p>
          </div>
        </div>
        <button 
          onClick={generateBriefingAndRoute}
          disabled={loadingBriefing}
          className="bg-sky-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-sky-700 transition active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {loadingBriefing ? "Gerando Rota IA..." : "Gerar Rota IA"}
        </button>
      </div>

      <div className="space-y-6">
        {/* AI Briefing */}
        <div className="bg-sky-50 border border-sky-100 rounded-3xl p-6 relative overflow-hidden">
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
                {briefing || "Clique em 'Gerar Rota IA' para preencher a tabela de turnos abaixo com os bairros otimizados."}
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
               }} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition font-bold text-[10px] tracking-wider uppercase">
                 Semana Ant.
               </button>
               <div className="w-px h-4 bg-slate-800"></div>
               <button onClick={() => setCurrentWeekMonday(getMonday(new Date()))} className="px-4 py-2 rounded-lg bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 hover:text-sky-300 transition font-black text-[10px] tracking-wider uppercase">
                 Hoje
               </button>
               <div className="w-px h-4 bg-slate-800"></div>
               <button onClick={() => {
                 const next = new Date(currentWeekMonday);
                 next.setDate(currentWeekMonday.getDate() + 7);
                 setCurrentWeekMonday(next);
               }} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition font-bold text-[10px] tracking-wider uppercase">
                 Próx. Semana
               </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day, dIdx) => {
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

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ">
          <div className="card-modern rounded-3xl w-full max-w-md shadow-2xl overflow-hidden  border border-slate-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-500" />
                Editar Turno ({editingSlot.turno === 1 ? "Manhã" : "Tarde"})
              </h2>
              <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
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
                      <option value="Lajeado">Lajeado</option>
                      <option value="Estrela">Estrela</option>
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
                      {(editCidade === "Lajeado" ? BAIRROS_LAJEADO : BAIRROS_ESTRELA).map(b => {
                        const count = editCidade === "Lajeado" ? (SCORE_LAJEADO[b] || 0) : (SCORE_ESTRELA[b] || 0);
                        return (
                          <option key={b} value={b}>{b} ({count})</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex gap-1.5 flex-wrap">
                  <span className="w-full text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-400" /> Calor do Bairro (Base Clientes)
                  </span>
                  {(() => {
                    const scores = editCidade === "Lajeado" ? SCORE_LAJEADO : SCORE_ESTRELA;
                    const sortedBairros = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
                    return sortedBairros.map((b, idx) => {
                      const isHot = idx < 4;
                      return (
                        <span key={b} className={`text-[9px] font-bold border px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          isHot 
                            ? "bg-rose-50 border-rose-200 text-rose-700" 
                            : "bg-white border-slate-200 text-slate-600"
                        }`}>
                          {b} <span className={isHot ? "text-rose-500" : "text-sky-500"}>{scores[b]}</span>
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Justificativa / Ação</label>
                <textarea 
                  value={editJustificativa}
                  onChange={e => setEditJustificativa(e.target.value)}
                  placeholder="Ex: Ação Externa PDV, Condomínios, Bairro quente..."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button 
                onClick={() => setEditingSlot(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveSlot}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-600/20 active:scale-95 flex items-center gap-2"
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
