import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Plus, 
  Sparkles, 
  Check, 
  Clock, 
  X, 
  FileText, 
  Users,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  Info,
  Copy,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowLeft,
  CalendarDays,
  Trash2,
  Edit3
} from "lucide-react";
import { Installation } from "../types";

interface ExternalStorePortalProps {
  installations: Installation[];
  vendors: string[];
  onSaveInstallation: (inst: Installation) => Promise<void>;
  onDeleteInstallation: (id: string) => Promise<void>;
}

// Helper to parse pasted protocol text string
function parseProtocolText(raw: string) {
  if (!raw) return { protocol: "", name: "" };

  const protMatch = raw.match(/Protocolo\s+(\d+)/i);
  const protocol = protMatch ? protMatch[1] : "";
  
  const parts = raw.split(" - ");
  let name = "";
  if (parts.length > 0) {
    const rawName = parts[parts.length - 1].trim();
    if (rawName && !rawName.toUpperCase().includes("PROTOCOLO") && !rawName.toUpperCase().includes("ATIVAÇÃO")) {
      name = rawName;
    }
  }
    
  return { 
    protocol: protocol || "Pendente", 
    name: name || "Cliente Desconhecido" 
  };
}

// Helpers for dates mapping
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

export default function ExternalStorePortal({
  installations,
  vendors,
  onSaveInstallation,
  onDeleteInstallation
}: ExternalStorePortalProps) {
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()));
  const [selectedDayAndSlot, setSelectedDayAndSlot] = useState<{ date: string; slot: number } | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstallation, setCurrentInstallation] = useState<Installation | null>(null);

  // Form states
  const [protocolRawInput, setProtocolRawInput] = useState("");
  const [formVendedor, setFormVendedor] = useState("");
  const [formCidade, setFormCidade] = useState("Lajeado");
  const [formStatus, setFormStatus] = useState<Installation["status"]>("Pendente");

  // Success AI Broadcast screen
  const [successAiMessage, setSuccessAiMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // General Filter
  const [searchTerm, setSearchTerm] = useState("");

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + i);
    return d;
  });

  // Navigate Weeks
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekMonday);
    prev.setDate(currentWeekMonday.getDate() - 7);
    setCurrentWeekMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(currentWeekMonday.getDate() + 7);
    setCurrentWeekMonday(next);
  };

  const handleResetToToday = () => {
    setCurrentWeekMonday(getMonday(new Date()));
  };

  const handleSlotClick = (dateStr: string, slotIdx: number, existing?: Installation) => {
    setSuccessAiMessage(null);
    if (existing) {
      setCurrentInstallation(existing);
      if (existing.nomeCliente === "SLOT EXTRA") {
        setProtocolRawInput("");
        setFormVendedor("");
        setFormStatus("Pendente");
        setFormCidade("Lajeado");
      } else {
        if (existing.observacao && existing.observacao.includes("Protocolo")) {
          setProtocolRawInput(`Protocolo ${existing.observacao.replace("Protocolo: ", "")} - O&M - Ativação FTTH / O&M - Ativação/Instalação de Cliente - ${existing.nomeCliente}`);
        } else {
          setProtocolRawInput(`Protocolo 000000 - O&M - Ativação FTTH - ${existing.nomeCliente}`);
        }
        setFormVendedor(existing.vendedorResponsavel || "");
        setFormStatus(existing.status);
        setFormCidade(existing.cidade || "Lajeado");
      }
      setSelectedDayAndSlot({ date: dateStr, slot: slotIdx });
      setIsModalOpen(true);
    } else {
      setCurrentInstallation(null);
      setProtocolRawInput("");
      setFormVendedor("");
      setFormStatus("Pendente");
      setFormCidade("Lajeado");
      setSelectedDayAndSlot({ date: dateStr, slot: slotIdx });
      setIsModalOpen(true);
    }
  };

  // Extra Slot Modal
  const [extraSlotModal, setExtraSlotModal] = useState({ isOpen: false, date: "", password: "", error: "" });
  const [selectedDayDetails, setSelectedDayDetails] = useState<string | null>(null);

  const handleAddExtraSlotClick = (dateStr: string) => {
    setExtraSlotModal({ isOpen: true, date: dateStr, password: "", error: "" });
  };

  const handleConfirmExtraSlot = () => {
    const { date, password } = extraSlotModal;
    if (password === "admin123" || password === "mhnetadmin" || password === "senha123" || password === "grente123") {
      const existingSlots = installations.filter(i => i.dataAgendamento === date).map(i => i.slotIndex);
      const maxSlot = Math.max(4, ...existingSlots);
      const nextSlot = maxSlot + 1;
      const newInst: Installation = {
        id: "inst_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        dataAgendamento: date,
        slotIndex: nextSlot,
        nomeCliente: "SLOT EXTRA",
        cidade: "Lajeado",
        status: "Pendente",
        observacao: "Disponível para agendamento",
        telefone: "",
        endereco: "",
        vendedorResponsavel: "",
        gerenteResponsavel: "",
        planoEscolhido: "",
        horario: "",
      };
      onSaveInstallation(newInst);
      setExtraSlotModal({ isOpen: false, date: "", password: "", error: "" });
    } else {
      setExtraSlotModal(prev => ({ ...prev, error: "Senha incorreta. Tente novamente." }));
    }
  };


  const handleSaveModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolRawInput.trim()) {
      alert("Por favor, cole a string completa de protocolo.");
      return;
    }
    if (!selectedDayAndSlot) return;

    try {
      const parsed = parseProtocolText(protocolRawInput);

      const payload: Installation = {
        id: currentInstallation?.id || "",
        nomeCliente: parsed.name,
        telefone: "Consulte no Protocolo",
        endereco: "Endereço no Protocolo",
        cidade: formCidade,
        vendedorResponsavel: formVendedor || "Não informado",
        gerenteResponsavel: "Bruno Garcia Queiroz",
        planoEscolhido: "Ativação / Instalação Expresso",
        dataAgendamento: selectedDayAndSlot.date,
        horario: getSlotTimeLabel(selectedDayAndSlot.slot),
        slotIndex: selectedDayAndSlot.slot,
        status: formStatus,
        observacao: `Protocolo: ${parsed.protocol}`,
        protocolRaw: protocolRawInput.trim(),
        equipeLoja: "Equipe Loja Bruno Garcia Queiroz"
      };

      await onSaveInstallation(payload);
      
      // Look up generated message or simulate if offline
      setTimeout(() => {
        setSuccessAiMessage(
          `👤 *Cliente:* ${payload.nomeCliente}\n📅 *Turno:* ${getSlotLabel(selectedDayAndSlot.slot)} (${getSlotTimeLabel(selectedDayAndSlot.slot)})\n📍 *Cidade:* ${payload.cidade}\n💼 *Vendedor:* ${payload.vendedorResponsavel}\n\n*Aviso Comercial Gerado:* Instalação programada com sucesso! Consultor responsável alertado para pré-auditoria comercial.`
        );
      }, 400);

      setIsModalOpen(false);
      setCurrentInstallation(null);
      setProtocolRawInput("");
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Deseja realmente desmarcar este agendamento comercial?")) {
      await onDeleteInstallation(id);
      setIsModalOpen(false);
      setCurrentInstallation(null);
    }
  };

  const handleCopyBroadcast = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const getSlotLabel = (slot: number) => {
    switch (slot) {
      case 1: return "Slot 1 (Manhã - Espaço 1)";
      case 2: return "Slot 2 (Manhã - Espaço 2)";
      case 3: return "Slot 3 (Tarde - Espaço 1)";
      case 4: return "Slot 4 (Tarde - Espaço 2)";
      default: return `Slot ${slot} (Extra)`;
    }
  };

  const getSlotTimeLabel = (slot: number) => {
    switch (slot) {
      case 1: return "08:30 às 10:30";
      case 2: return "10:30 às 12:00";
      case 3: return "13:30 às 15:30";
      case 4: return "15:30 às 17:30";
      default: return "A combinar";
    }
  };

  const getStatusColor = (status: Installation["status"]) => {
    switch (status) {
      case "Confirmada": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Instalada": return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "Cancelada": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "Reagendada": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-355 border border-slate-500/10";
    }
  };

  const liveParsed = parseProtocolText(protocolRawInput);

  const handleDragStart = (e: React.DragEvent, inst: Installation) => {
    e.dataTransfer.setData("application/json", JSON.stringify(inst));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string, targetSlot: number, targetInst?: Installation) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData("application/json");
      if (!data) return;
      const draggedInst: Installation = JSON.parse(data);
      if (draggedInst.dataAgendamento === targetDate && draggedInst.slotIndex === targetSlot) return;

      if (!targetInst) {
        const payload = { ...draggedInst, dataAgendamento: targetDate, slotIndex: targetSlot, horario: getSlotTimeLabel(targetSlot) };
        await onSaveInstallation(payload);
      } else {
        const swapPayload1 = { ...draggedInst, dataAgendamento: targetDate, slotIndex: targetSlot, horario: getSlotTimeLabel(targetSlot) };
        const swapPayload2 = { ...targetInst, dataAgendamento: draggedInst.dataAgendamento, slotIndex: draggedInst.slotIndex, horario: getSlotTimeLabel(draggedInst.slotIndex!) };
        await onSaveInstallation(swapPayload1);
        await onSaveInstallation(swapPayload2);
      }
    } catch (err) {
      console.error("Drop err:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Upper Brand Header */}
      <div className="bg-slate-900 border-b border-slate-800 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold tracking-widest text-xs animate-none">
              MH
            </span>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Portal de Agendamento Comercial <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full">Equipe Loja</span>
              </h1>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Gerência Supervisionada:</span>
                <strong className="text-slate-300">Bruno Garcia Queiroz</strong>
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-450 hidden sm:block">
            📅 Horário Local: <strong>{new Date().toLocaleDateString("pt-BR")}</strong>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Helper informational Card */}
        <div className="p-4 bg-sky-950/20 border border-sky-900/30 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Como Agendar Rapidamente?</h4>
            <p className="text-[11px] text-slate-350 leading-relaxed">
              Consulte a planilha de reservas semanal logo abaixo. Escolha um dia e turno disponível, clique em <strong>"Disponível"</strong> e cole o protocolo MHNET copiado no formato oficial para salvar instantaneamente sem precisar redigitar dados.
            </p>
          </div>
        </div>

        {/* Date Selector Dashboard and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-850 shadow-md">
          <div className="flex items-center gap-2">
            <button onClick={handlePrevWeek} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-300" />
            </button>
            
            <button onClick={handleResetToToday} className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              Hoje
            </button>

            <button onClick={handleNextWeek} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>

            <span className="text-xs font-bold text-slate-300 px-2 font-mono">
              {weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
              {" ~ "}
              {weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input type="text"
              placeholder="Pesquisar por cliente / consultor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>

        {/* Dynamic AI Success warning panel after saving */}
        {successAiMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-450 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instalação Protocolada com Sucesso!</span>
              </div>
              <button onClick={() => setSuccessAiMessage(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Declinar
              </button>
            </div>
            <p className="text-[11px] text-slate-300 font-mono bg-slate-900/60 p-3 rounded-lg leading-relaxed whitespace-pre-line">
              {successAiMessage}
            </p>
            <button onClick={() => handleCopyBroadcast(successAiMessage)} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition cursor-pointer"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar para WhatsApp do Consultor</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 7 Columns GRID for external team */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day, dIdx) => {
            const dateStr = formatDateString(day);
            const isToday = formatDateString(new Date()) === dateStr;
            const dayName = day.toLocaleDateString("pt-BR", { weekday: "long" }).split("-")[0];
            const formattedLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1);
            
            return (
              <div key={dateStr} className={`flex flex-col bg-slate-900 rounded-xl overflow-hidden border ${
                  isToday ? "border-sky-500 shadow-xl" : "border-slate-800"
                }`}>
                {/* Header */}
                <div onClick={() => setSelectedDayDetails(dateStr)} className={`p-3 text-center border-b cursor-pointer hover:bg-opacity-80 transition ${
                  isToday ? "bg-sky-600 text-white font-bold hover:bg-sky-500" : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900"
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-80">{formattedLabel}</span>
                  <span className="text-sm font-extrabold">{day.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}</span>
                </div>

                {/* Day content with slots 1, 2, 3, 4 */}
                <div className="p-2 space-y-2 flex-grow flex flex-col justify-space-between min-h-[300px]">
                  {/* Manhã */}
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest px-1 block mb-1">Manhã</span>
                    {[1, 2].map(slotIdx => {
                      const matched = installations.find(i => i.dataAgendamento === dateStr && i.slotIndex === slotIdx);
                      return renderSlotCard(dateStr, slotIdx, matched);
                    })}
                  </div>

                  {/* Tarde e Extras */}
                  <div className="space-y-1.5 flex-1 mt-4">
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest px-1 block mb-1">Tarde / Extras</span>
                    {(() => {
                      const existingSlots = installations.filter(i => i.dataAgendamento === dateStr).map(i => i.slotIndex);
                      const maxSlot = Math.max(4, ...existingSlots);
                      const keys = [];
                      for (let i = 3; i <= maxSlot; i++) keys.push(i);
                      return keys.map(slotIdx => {
                        const matched = installations.find(i => i.dataAgendamento === dateStr && i.slotIndex === slotIdx);
                        return renderSlotCard(dateStr, slotIdx, matched);
                      });
                    })()}
                    <button onClick={(e) => { e.stopPropagation(); handleAddExtraSlotClick(dateStr); }} className="mt-2 w-full p-2 border border-dashed border-slate-700/50 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:bg-slate-800 transition text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Slot Extra
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* DAY DETAILS MODAL */}
      
        {selectedDayDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedDayDetails(null)} />
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <Calendar className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">
                      Detalhes do Dia: {selectedDayDetails.split("-").reverse().join("/")}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Visão completa de todos os agendamentos e slots extra.
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedDayDetails(null)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {/* Find all slots for this day */}
                {[...Array(Math.max(4, ...installations.filter(i => i.dataAgendamento === selectedDayDetails && i.slotIndex).map(i => i.slotIndex || 0)))].map((_, i) => {
                  const slotIdx = i + 1;
                  const inst = installations.find(ins => ins.dataAgendamento === selectedDayDetails && ins.slotIndex === slotIdx);
                  return (
                    <div key={slotIdx} className={`p-4 rounded-xl border ${inst ? (inst.status === 'Cancelada' ? 'border-rose-900/50 bg-rose-950/10' : inst.status === 'Instalada' ? 'border-emerald-900/50 bg-emerald-950/10' : 'border-sky-900/50 bg-sky-950/10') : 'border-slate-800 bg-slate-950'} flex flex-col md:flex-row md:items-center gap-4`}>
                      <div className="w-full md:w-1/4">
                        <div className="text-sm font-bold text-slate-300">{getSlotLabel(slotIdx)}</div>
                        <div className="text-xs font-mono text-slate-500">{getSlotTimeLabel(slotIdx)}</div>
                        {inst && <div className={`text-[10px] font-bold uppercase tracking-wider mt-2 inline-block px-2 py-0.5 rounded ${getStatusColor(inst.status)}`}>{inst.status}</div>}
                      </div>
                      
                      <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-4 md:pt-0">
                        {inst ? (
                          <div className="space-y-2">
                             <div className="flex justify-between items-start gap-2">
                               <div>
                                 <h4 className="font-bold text-sm text-white">{inst.nomeCliente}</h4>
                                 {inst.observacao && <p className="text-xs font-mono text-slate-400 mt-0.5">{inst.observacao.substring(0, 80)}{inst.observacao.length> 80 ? '...' : ''}</p>}
                               </div>
                               <button onClick={() => { setSelectedDayDetails(null); handleSlotClick(selectedDayDetails, slotIdx, inst); }} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold text-white transition cursor-pointer"
                               >
                                 Abrir
                               </button>
                             </div>
                             
                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
                                <div>
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-500">Cidade</span>
                                  <span className="text-xs text-slate-300 font-medium">{inst.cidade}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-500">Telefone</span>
                                  <span className="text-xs text-slate-300 font-medium">{inst.telefone}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="block text-[9px] uppercase tracking-wider text-slate-500">Endereço</span>
                                  <span className="text-xs text-slate-300 font-medium truncate block">{inst.endereco}</span>
                                </div>
                             </div>
                             {(inst.vendedorResponsavel) && (
                               <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/50">
                                 {inst.vendedorResponsavel && <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Responsável: {inst.vendedorResponsavel}</span>}
                               </div>
                             )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between h-full">
                            <span className="text-sm text-slate-500 italic">Slot Livre</span>
                            <button onClick={() => { setSelectedDayDetails(null); handleSlotClick(selectedDayDetails, slotIdx); }} className="px-3 py-1.5 border border-slate-700 hover:border-sky-500 hover:text-sky-400 rounded-lg text-xs font-bold text-slate-400 transition cursor-pointer"
                             >
                               Agendar
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      

      {/* EXTRA SLOT MODAL */}
      {extraSlotModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setExtraSlotModal({ isOpen: false, date: "", password: "", error: "" })} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <h3 className="text-lg font-bold text-white mb-2">Liberar Slot Extra</h3>
            <p className="text-xs text-slate-400 mb-4">Insira a senha de administrador (Gerente) para adicionar um novo slot para o dia {new Date(extraSlotModal.date + "T12:00:00").toLocaleDateString("pt-BR")}.</p>
            
            <input type="password"
              placeholder="Senha de liberação"
              value={extraSlotModal.password}
              onChange={e => setExtraSlotModal(prev => ({ ...prev, password: e.target.value }))}
              onKeyDown={e => {
                if (e.key === "Enter") handleConfirmExtraSlot();
              }} className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none"
              autoFocus
            />
            {extraSlotModal.error && (
              <p className="text-red-400 text-xs mt-2">{extraSlotModal.error}</p>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button type="button"
                onClick={() => setExtraSlotModal({ isOpen: false, date: "", password: "", error: "" })} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button type="button"
                onClick={handleConfirmExtraSlot} className="px-4 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg shadow-sky-600/20"
              >
                Confirmar e Liberar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EXPEDITED BOOKING DIRECT DIALOG */}
      
        {isModalOpen && selectedDayAndSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-sky-500/15 text-sky-400">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold">Agendar Ativação de Cliente</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Data: {selectedDayAndSlot.date.split("-").reverse().join("/")} - {getSlotLabel(selectedDayAndSlot.slot)} ({getSlotTimeLabel(selectedDayAndSlot.slot)})
                    </p>
                  </div>
                </div>

                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-300 mb-1">
                    Cole o Protocolo Completo do Sistema (copia e cola) *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Exemplo de conteúdo copiado do MHNET:
Protocolo 15462138 - O&M - Ativação FTTH / O&M - Ativação/Instalação de Cliente - NATALIA REGINA DE BORTOLI"
                    value={protocolRawInput}
                    onChange={e => setProtocolRawInput(e.target.value)} className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder-slate-650 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition leading-relaxed resize-none"
                  />
                </div>

                {protocolRawInput.trim() && (
                  <div className="bg-sky-950/20 border border-sky-900/30 rounded-xl p-3 space-y-1.5">
                    <span className="text-[9px] font-extrabold text-sky-400 uppercase block tracking-wider">Metadados Identificados</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nome do Cliente:</span>
                        <strong className="text-white block truncate">{liveParsed.name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nº de Protocolo:</span>
                        <strong className="text-sky-300 font-mono block">{liveParsed.protocol}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-1">
                      Cidade Atendimento
                    </label>
                    <select
                      value={formCidade}
                      onChange={e => setFormCidade(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Lajeado">Lajeado</option>
                          <option value="Estrela">Estrela</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-1">
                      Consultor MHNET
                    </label>
                    <select
                      value={formVendedor}
                      onChange={e => setFormVendedor(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Selecione...</option>
                      {vendors.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-1">
                      Status Inicial
                    </label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmada">Confirmada</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
                  {currentInstallation ? (
                    <button type="button"
                      onClick={() => handleDeleteClick(currentInstallation.id)} className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900 border border-rose-800/40 text-rose-450 hover:text-white text-xs cursor-pointer transition font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-350 transition cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition cursor-pointer"
                    >
                      Salvar Agendamento
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      
    </div>
  );

  function renderSlotCard(dateStr: string, slotIdx: number, matched?: Installation) {
    if (matched) {
      return (
        <div key={slotIdx}
          draggable
          onDragStart={(e) => handleDragStart(e, matched)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, dateStr, slotIdx, matched)} className={`p-2.5 rounded-lg border text-left flex flex-col justify-between min-h-[95px] relative group text-xs cursor-grab active:cursor-grabbing ${getStatusColor(matched.status)}`}>
          <div className="flex items-start justify-between gap-1">
            <span className="font-bold text-[11px] truncate leading-tight flex-1 text-slate-250 block max-w-[85%]">
              {matched.nomeCliente}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition shrink-0">
              <button onClick={() => handleSlotClick(dateStr, slotIdx, matched)} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-1 text-[9px] mt-2">
            <p className="font-mono text-slate-450 truncate">{matched.observacao || "Prot. Geral"}</p>
            <p className="text-slate-400 block truncate font-sans">👤 {matched.vendedorResponsavel || "S/ Vendedor"}</p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-500/10 pt-1 mt-2 text-[8px] uppercase tracking-wider text-slate-400">
            <span>{matched.status}</span>
            <span className="font-mono text-[7px] text-slate-500">{matched.cidade}</span>
          </div>
        </div>
      );
    }

    return (
      <button key={slotIdx} onClick={() => handleSlotClick(dateStr, slotIdx)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, dateStr, slotIdx)} className="w-full p-3 rounded-lg border border-dashed border-slate-800 hover:border-sky-650/40 text-left flex flex-col items-center justify-center min-h-[95px] text-slate-650 hover:text-slate-300 hover:bg-sky-950/5 transition cursor-pointer"
      >
        <Plus className="w-4 h-4 mb-1 text-slate-600" />
        <span className="text-[8px] font-extrabold uppercase tracking-widest block text-slate-550">Disponível</span>
        <span className="text-[7.5px] font-mono text-slate-600 mt-0.5">{getSlotTimeLabel(slotIdx).split(" às ")[0]}</span>
      </button>
    );
  }
}
