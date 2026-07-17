import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  X, 
  FileText, 
  ExternalLink,
  Users,
  Search,
  Filter,
  Eye,
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { Installation } from "../types";
import ConfirmModal from "./ConfirmModal";

interface InstallationsPageProps {
  installations: Installation[];
  vendors: string[];
  onSaveInstallation: (inst: Installation) => Promise<void>;
  onDeleteInstallation: (id: string) => Promise<void>;
  onSyncInstallations?: () => Promise<void>;
  userRole?: string;
}

// Client-side parser for live feedback
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

// Helpers for dates
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

export default function InstallationsPage({
  installations,
  vendors,
  onSaveInstallation,
  onDeleteInstallation,
  onSyncInstallations,
  userRole = "consultor"
}: InstallationsPageProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  // Navigation: state is the Monday of the selected week
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()));
  const [selectedDayAndSlot, setSelectedDayAndSlot] = useState<{ date: string; slot: number } | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'cadastro' | 'acao'>('cadastro');
  const [currentInstallation, setCurrentInstallation] = useState<Installation | null>(null);

  // Form inputs
  const [protocolRawInput, setProtocolRawInput] = useState("");
  const [formVendedor, setFormVendedor] = useState("");
  const [formStatus, setFormStatus] = useState<Installation["status"]>("Pendente");
  const [formCidade, setFormCidade] = useState("Lajeado");
  const [formCoordenadas, setFormCoordenadas] = useState("");
  const [formAtividade, setFormAtividade] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formEndereco, setFormEndereco] = useState("");
  const [formCpf, setFormCpf] = useState("");

  // Notification viewer
  const [viewingAiInst, setViewingAiInst] = useState<Installation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<string | null>(null);
  const [instToDelete, setInstToDelete] = useState<string | null>(null);

  // General States
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate the 7 days of the current week (Monday to Sunday)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + i);
    return d;
  });

  // Navigate weeks
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

  // Click on a slot
  const handleSlotClick = (dateStr: string, slotIdx: number, existing?: Installation) => {
    if (existing) {
      setCurrentInstallation(existing);
      setModalTab('acao');
      if (existing.nomeCliente === "SLOT EXTRA") {
        setProtocolRawInput("");
        setFormVendedor("");
        setFormStatus("Pendente");
        setFormCidade("Lajeado");
        setFormCoordenadas("");
        setFormAtividade("");
        setFormTelefone("");
        setFormEndereco("");
        setFormCpf("");
      } else {
        setProtocolRawInput(existing.observacao && existing.observacao.startsWith("Protocolo:") ? `${existing.observacao} - ${existing.nomeCliente}` : (existing.observacao || ""));
        // Override if we have full raw stored, otherwise build a simple fallback string
        if (existing.observacao && existing.observacao.includes("Protocolo")) {
          setProtocolRawInput(`Protocolo ${existing.observacao.replace("Protocolo: ", "")} - O&M - Ativação FTTH / O&M - Ativação/Instalação de Cliente - ${existing.nomeCliente}`);
        } else {
          setProtocolRawInput(`Protocolo 000000 - O&M - Ativação FTTH - ${existing.nomeCliente}`);
        }
        setFormVendedor(existing.vendedorResponsavel || "");
        setFormStatus(existing.status);
        setFormCidade(existing.cidade || "Lajeado");
        setFormCoordenadas(existing.coordenadas || "");
        setFormAtividade(existing.atividade || "");
        setFormTelefone(existing.telefone !== "Consulte no Protocolo" ? existing.telefone : "");
        setFormEndereco(existing.endereco !== "Endereço no Protocolo" ? existing.endereco : "");
        setFormCpf(existing.cpf || "");
      }
      setSelectedDayAndSlot({ date: dateStr, slot: slotIdx });
      setIsModalOpen(true);
    } else {
      setCurrentInstallation(null);
      setModalTab('cadastro');
      setProtocolRawInput("");
      setFormVendedor("");
      setFormStatus("Pendente");
      setFormCidade("Lajeado");
      setFormCoordenadas("");
      setFormAtividade("");
      setFormTelefone("");
      setFormEndereco("");
      setFormCpf("");
      setSelectedDayAndSlot({ date: dateStr, slot: slotIdx });
      setIsModalOpen(true);
    }
  };

  // Extra Slot Modal
  const [extraSlotModal, setExtraSlotModal] = useState({ isOpen: false, date: "", password: "", error: "" });

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

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolRawInput.trim()) {
      alert("Por favor, cole o protocolo do sistema para preenchimento automático.");
      return;
    }

    if (!selectedDayAndSlot) return;

    try {
      const parsed = parseProtocolText(protocolRawInput);
      
      let finalPhone = "";
      if (formTelefone.trim()) {
        let cleanPhone = formTelefone.replace(/\D/g, '');
        finalPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
        
        // Remove o nono dígito (9) para integração com WhatsApp/n8n se houver 13 dígitos numéros (55 + 11 dígitos)
        if (finalPhone.length === 13 && finalPhone[4] === '9') {
          finalPhone = finalPhone.slice(0, 4) + finalPhone.slice(5);
        }
      }

      const payload: Installation = {
        id: currentInstallation?.id || "",
        nomeCliente: parsed.name,
        telefone: finalPhone,
        endereco: formEndereco,
        cpf: formCpf,
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
        coordenadas: formCoordenadas,
        atividade: formAtividade
      };

      await onSaveInstallation(payload);
      setIsModalOpen(false);
      setCurrentInstallation(null);
      setProtocolRawInput("");
    } catch (e: any) {
      alert("Erro ao salvar agendamento: " + e.message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setInstToDelete(id);
  };

  const confirmDeleteInstallation = async () => {
    if (!instToDelete) return;
    await onDeleteInstallation(instToDelete);
    setInstToDelete(null);
    setIsModalOpen(false);
    setCurrentInstallation(null);
  };

  const handleCopyExternalLink = () => {
    const extUrl = `${window.location.origin}/?mode=equipe-loja`;
    navigator.clipboard.writeText(extUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyAlert = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Slot timing mapping definitions
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
      default: return "bg-slate-500/10 text-slate-350 border border-slate-500/10";
    }
  };

  // Quick live state for parsing
  const liveParsed = parseProtocolText(protocolRawInput);

  // Search filtered installations to highlight matches
  const filteredInstallations = installations.filter(inst => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      inst.nomeCliente.toLowerCase().includes(term) ||
      (inst.observacao && inst.observacao.toLowerCase().includes(term)) ||
      inst.vendedorResponsavel.toLowerCase().includes(term) ||
      inst.cidade.toLowerCase().includes(term)
    );
  });

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
    <div className="space-y-6 pb-20">
      {/* Upper Information Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">Agenda Comercial de Instalações</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Planejamento semanal inteligente da MHNET. Exiba até 4 slots por dia divididos em turnos (Manhã/Tarde). Insira novos agendamentos colando diretamente o protocolo completo do sistema.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onSyncInstallations && (
            <button onClick={async () => {
                setIsSyncing(true);
                try {
                  await onSyncInstallations();
                } finally {
                  setIsSyncing(false);
                }
                    }}
                    disabled={isSyncing} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-550 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition shadow-sm"
              title="Sincronizar agendamentos diretamente do Google Sheets"
            >
              <CalendarDays className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sincronizando..." : "Sincronizar Planilha"}</span>
            </button>
          )}

          <button onClick={handleCopyExternalLink} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition shadow-sm"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copiado!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>Copiar Link Externo de Loja</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Week Controller Dashboard */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2 text-slate-200">
          <button onClick={handlePrevWeek} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            title="Semana Anterior"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button onClick={handleResetToToday} className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-xs font-semibold transition cursor-pointer text-slate-300"
          >
            Hoje
          </button>

          <button onClick={handleNextWeek} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            title="Próxima Semana"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-slate-300 px-2">
            {weekDays[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            {" até - "}
            {weekDays[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input type="text"
              placeholder="Buscar por cliente, protocolo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-600 transition"
            />
          </div>
        </div>
      </div>

      {/* Visual Weekly Grid Planning Board */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day, dIdx) => {
          const dateStr = formatDateString(day);
          const isToday = formatDateString(new Date()) === dateStr;
          const dayName = day.toLocaleDateString("pt-BR", { weekday: "long" }).split("-")[0];
          const formattedLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1);
          
          return (
            <div key={dateStr} className={`flex flex-col bg-slate-900 rounded-xl overflow-hidden border ${
                isToday ? "border-sky-500 shadow-lg shadow-sky-950/20" : "border-slate-800"
              }`}>
              {/* Day Header */}
              <div onClick={() => setSelectedDayDetails(dateStr)} className={`p-3 text-center border-b cursor-pointer hover:bg-opacity-80 transition ${
                  isToday ? "bg-sky-600 text-white hover:bg-sky-500" : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900"
                }`}>
                <div className="text-[10px] font-bold tracking-wider uppercase opacity-75">{formattedLabel}</div>
                <div className="text-sm font-extrabold">{day.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}</div>
              </div>

              {/* Day Slots */}
              <div className="p-2 space-y-2 flex-1 flex flex-col justify-between">
                {/* Manhã Block */}
                <div className="space-y-2">
                  <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Manhã</div>
                  {[1, 2].map(slotIdx => {
                    const inst = filteredInstallations.find(i => i.dataAgendamento === dateStr && i.slotIndex === slotIdx);
                    return renderSlotCell(dateStr, slotIdx, inst);
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-850/50 my-2"></div>

                {/* Tarde e Extras Block */}
                <div className="space-y-2">
                  <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Tarde / Extras</div>
                  {(() => {
                    const existingSlots = filteredInstallations.filter(i => i.dataAgendamento === dateStr).map(i => i.slotIndex);
                    const maxSlot = Math.max(4, ...existingSlots);
                    const keys = [];
                    for (let i = 3; i <= maxSlot; i++) keys.push(i);
                    return keys.map(slotIdx => {
                      const inst = filteredInstallations.find(i => i.dataAgendamento === dateStr && i.slotIndex === slotIdx);
                      return renderSlotCell(dateStr, slotIdx, inst);
                    });
                  })()}
                  <button onClick={(e) => { e.stopPropagation(); handleAddExtraSlotClick(dateStr); }} className="mt-2 w-full p-2 border border-dashed border-slate-700/50 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-500 transition text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Slot Extra
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER INFO */}
      <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div>
          <span>📌 Cada dia da semana possui exatamente <strong>4 espaços (2 por turno)</strong> para instalações. Clique no slot livre para agendar.</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-600"></span> Pendente</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Confirmada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-500"></span> Instalada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Reagendada</span>
        </div>
      </div>

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
                             {(inst.atividade || inst.vendedorResponsavel) && (
                               <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-800/50">
                                 {inst.vendedorResponsavel && <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Responsável: {inst.vendedorResponsavel}</span>}
                                 {inst.atividade && <span className="text-[10px] bg-amber-900/30 border border-amber-800/50 text-amber-400 px-2 py-0.5 rounded">{inst.atividade}</span>}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">Liberar Slot Extra</h3>
            <p className="text-xs text-slate-400 mb-4">Insira a senha de administrador ou gerente para adicionar um novo slot para o dia {new Date(extraSlotModal.date + "T12:00:00").toLocaleDateString("pt-BR")}.</p>
            
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
                onClick={() => setExtraSlotModal({ isOpen: false, date: "", password: "", error: "" })} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button type="button"
                onClick={handleConfirmExtraSlot} className="px-4 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg shadow-sky-600/20 cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK AGENDAMENTO DIALOG MODAL */}
      
        {isModalOpen && selectedDayAndSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-md font-bold">
                      {currentInstallation ? 'Editar Agendamento' : 'Novo Agendamento Expresso'}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {selectedDayAndSlot.date.split("-").reverse().join("/")} — {getSlotLabel(selectedDayAndSlot.slot)} ({getSlotTimeLabel(selectedDayAndSlot.slot)})
                    </p>
                  </div>
                </div>
                
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentInstallation && (
                <div className="flex gap-4 border-b border-slate-800 mb-4 pb-2">
                  <button type="button"
                    onClick={() => setModalTab('acao')} className={`text-xs font-bold pb-2 border-b-2 transition cursor-pointer ${modalTab === 'acao' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    Ação Técnica
                  </button>
                  <button type="button"
                    onClick={() => setModalTab('cadastro')} className={`text-xs font-bold pb-2 border-b-2 transition cursor-pointer ${modalTab === 'cadastro' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                    Cadastro / Edição
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveModal} className="space-y-4">
                {modalTab === 'cadastro' ? (
                  <>
                    {/* THE RAW COPIA E COLA PROTOCOLO FIELD */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-350 mb-1.5">
                        Protocolo do Sistema MHNET (Copia e Cola) *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Cole aqui o texto do protocolo exemplo:
Protocolo 15462138 - O&M - Ativação FTTH / O&M - Ativação/Instalação de Cliente - NATALIA REGINA DE BORTOLI"
                        value={protocolRawInput}
                        onChange={e => setProtocolRawInput(e.target.value)} className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition leading-relaxed resize-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Não é necessário digitar nome ou outros campos. Nosso motor inteligente analisa a string e cria as notificações.
                      </p>
                    </div>

                    {/* AUTOMATED LIVE EXTRACTION RESULTS */}
                    {protocolRawInput.trim() && (
                      <div className="bg-sky-950/20 border border-sky-900/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-sky-400 uppercase tracking-wide">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>Motor de Extração Ativo</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-400">Cliente Identificado:</span>
                            <span className="font-bold text-white block truncate">{liveParsed.name}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Nº Protocolo:</span>
                            <span className="font-mono font-bold text-sky-300 block">{liveParsed.protocol}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Vendedor Responsável */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          Vendedor / Consultor
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

                      {/* Status */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          Cidade / Região
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
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          Status Inicial
                        </label>
                        <select
                          value={formStatus}
                          onChange={e => setFormStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="Instalada">Instalada</option>
                          <option value="Reagendada">Reagendada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          CPF do Cliente *
                        </label>
                        <input type="text"
                          value={formCpf}
                          onChange={e => setFormCpf(e.target.value)}
                          placeholder="Ex: 000.000.000-00" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          Telefone do Cliente
                        </label>
                        <div className="flex bg-slate-950 border border-slate-800 rounded-lg focus-within:border-sky-500 overflow-hidden">
                          <span className="px-2 text-xs text-slate-500 bg-slate-900/50 border-r border-slate-800 flex items-center justify-center">+55</span>
                          <input type="text"
                            value={formTelefone}
                            onChange={e => setFormTelefone(e.target.value)}
                            placeholder="Ex: 51988887777" className="w-full bg-transparent p-2 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          Endereço Completo
                        </label>
                        <input type="text"
                          value={formEndereco}
                          onChange={e => setFormEndereco(e.target.value)}
                          placeholder="Rua, Número, Bairro" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          Protocolo
                        </label>
                        <div className="text-xs font-mono text-sky-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                          {liveParsed.protocol || "Não identificado"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                          Telefone do Cliente
                        </label>
                        <div className="flex gap-2">
                          <div className="flex w-full bg-slate-950 border border-slate-800 rounded-lg focus-within:border-amber-500 overflow-hidden">
                            <span className="px-2 text-xs text-slate-500 bg-slate-900/50 border-r border-slate-800 flex items-center justify-center">+55</span>
                            <input 
                              value={formTelefone}
                              onChange={e => setFormTelefone(e.target.value)}
                              placeholder="Ex: 51988887777" className="w-full bg-transparent p-2 text-xs text-white focus:outline-none"
                            />
                          </div>
                          {formTelefone && formTelefone !== "Consulte no Protocolo" && (
                            <a 
                              href={`https://wa.me/${formTelefone.replace(/\D/g, '').startsWith('55') ? formTelefone.replace(/\D/g, '') : '55' + formTelefone.replace(/\D/g, '')}`}
                              target="_blank" rel="noreferrer" className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition"
                              title="Chamar no WhatsApp"
                            >
                              <span className="font-bold text-xs whitespace-nowrap">Chamar</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                           Endereço
                         </label>
                         <input
                           value={formEndereco}
                           onChange={e => setFormEndereco(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                         />
                      </div>
                      <div>
                         <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                           Coordenadas
                         </label>
                         <input
                           value={formCoordenadas}
                           placeholder="-29.xxxx, -51.xxxx"
                           onChange={e => setFormCoordenadas(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                         />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                        Atividade / Deslocamento
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formAtividade}
                          onChange={e => setFormAtividade(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="">Selecione...</option>
                          <option value="Deslocamento">Deslocamento (Avisar Cliente)</option>
                          <option value="Chegada">Chegada ao Local</option>
                          <option value="Iniciado">Instalação Iniciada</option>
                          <option value="Finalizado">Instalação Finalizada / Ativo</option>
                          <option value="Pendente">Retorno Necessário / Problema</option>
                        </select>
                        {formAtividade === "Deslocamento" && formTelefone && formTelefone !== "Consulte no Protocolo" && (
                          <button type="button"
                            onClick={() => {
                              const msg = `Olá, ${liveParsed.name || 'cliente'}! O técnico da MHNET está a caminho da sua residência para realizar o serviço agendado.`;
                              window.open(`https://wa.me/${formTelefone.replace(/\D/g, '').startsWith('55') ? formTelefone.replace(/\D/g, '') : '55' + formTelefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, "_blank");
                            }} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg whitespace-nowrap transition cursor-pointer flex items-center justify-center"
                          >
                            WhatsApp Aviso
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Para automatizar notificações reais sem intervenção, integre um Webhook do N8N ou similar ao salvar no backend.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
                  {currentInstallation ? (
                    <button type="button"
                      onClick={() => handleDeleteClick(currentInstallation.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/45 hover:bg-rose-900 border border-rose-800/50 text-rose-450 hover:text-white text-xs font-semibold cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Reserva</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-300 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-950/30 text-xs font-bold text-white transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmar Agendamento</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      

      {/* THE AMAZING AI WARNING BROADCAST DRAWER */}
      
        {viewingAiInst && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setViewingAiInst(null)} />
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10">
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                      <span>Notificação Exclusiva IA</span>
                    </span>
                    <h3 className="text-md font-bold text-white truncate max-w-xs">{viewingAiInst.nomeCliente}</h3>
                    <p className="text-[10px] text-slate-450">{viewingAiInst.observacao || "Protocolo Pendente"}</p>
                  </div>

                  <button onClick={() => setViewingAiInst(null)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-450 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  {/* Alert Display card */}
                  <div className="bg-slate-950/75 border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-slate-850 pb-2">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>Status do Registro</span>
                    </div>
                    <div className="space-y-2 text-slate-300">
                      <p>👤 <strong>Consultor Titular:</strong> {viewingAiInst.vendedorResponsavel || "Não informado"}</p>
                      <p>📍 <strong>Cidade de Destino:</strong> {viewingAiInst.cidade}</p>
                      <p>📅 <strong>Horário Turno:</strong> {getSlotLabel(viewingAiInst.slotIndex ?? 1)} / {viewingAiInst.horario}</p>
                    </div>
                  </div>

                  {/* Message content */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider">Aviso Gerado Pela IA</span>
                    <div className="bg-sky-950/10 border border-sky-900/10 rounded-xl p-4 text-slate-200 font-sans text-xs whitespace-pre-line max-h-[350px] overflow-y-auto leading-relaxed">
                      {viewingAiInst.aiNotificationMessage || "Carregando aviso..."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 mt-6">
                <button onClick={() => handleCopyAlert(viewingAiInst.aiNotificationMessage || "", viewingAiInst.id)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white transition cursor-pointer shadow-lg shadow-sky-950/35"
                >
                  {copiedId === viewingAiInst.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copiado Exitosamente!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Alerta de WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      

      <ConfirmModal
        isOpen={!!instToDelete}
        title="Excluir Instalação"
        message="Tem certeza que deseja excluir permanentemente esta reserva de instalação do calendário?"
        confirmText="Excluir"
        onConfirm={confirmDeleteInstallation}
        onCancel={() => setInstToDelete(null)} />
    </div>
  );

  // Embedded cell renderer within grid column
  function renderSlotCell(dateStr: string, slotIdx: number, inst?: Installation) {
    if (inst) {
      return (
        <div key={slotIdx}
          draggable
          onDragStart={(e) => handleDragStart(e, inst)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, dateStr, slotIdx, inst)} className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition relative group min-h-[95px] overflow-hidden cursor-grab active:cursor-grabbing ${getStatusColor(inst.status)}`}>
          {/* Header row inside slot */}
          <div className="flex items-start justify-between gap-1">
            <span className="font-bold text-[11px] truncate leading-tight flex-1 text-slate-200 block max-w-[85%] font-sans">
              {inst.nomeCliente}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
              <button onClick={() => handleSlotClick(dateStr, slotIdx, inst)} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white transition cursor-pointer"
                title="Editar Agendamento"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sub detail */}
          <div className="space-y-1 text-[9px] mt-2">
            <div className="text-slate-450 truncate font-mono">
              {inst.observacao || "Prot. s/ Nº"}
            </div>
            
            <div className="flex items-center gap-1 text-slate-400 truncate text-[10px]">
              <User className="w-2.5 h-2.5 shrink-0 text-sky-400" />
              <span className="truncate">{inst.vendedorResponsavel || "S/ Vendedor"}</span>
            </div>
          </div>

          {/* Bottom Alert / Badge Action Actionable Row */}
          <div className="flex items-center justify-between gap-1 border-t border-slate-500/10 pt-1.5 mt-2">
            <span className="text-[8px] font-extrabold uppercase tracking-wide px-1 rounded-sm bg-slate-900/60 text-slate-300">
              {inst.status}
            </span>

            <button onClick={() => setViewingAiInst(inst)} className="flex items-center gap-0.5 text-[8.5px] font-bold text-sky-300 hover:text-white border border-sky-400/20 hover:border-sky-400 px-1 py-0.5 rounded cursor-pointer transition bg-sky-950/20 shadow-sm"
              title="Ver Aviso IA"
            >
              <Sparkles className="w-2.5 h-2.5 shrink-0 animate-pulse text-sky-400" />
              <span>Aviso IA</span>
            </button>
          </div>
        </div>
      );
    }

    // Default empty slot
    return (
      <button key={slotIdx} onClick={() => handleSlotClick(dateStr, slotIdx)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, dateStr, slotIdx)} className="w-full p-3 rounded-lg border border-dashed border-slate-800 hover:border-sky-600/40 text-left flex flex-col items-center justify-center min-h-[95px] text-slate-600 hover:text-slate-300 hover:bg-sky-950/5 transition cursor-pointer"
      >
        <Plus className="w-4 h-4 mb-1 text-slate-600 group-hover:text-sky-400" />
        <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-slate-550">Disponível</span>
        <span className="text-[8px] font-mono text-slate-600 mt-1">Horário: {getSlotTimeLabel(slotIdx).split(" às ")[0]}</span>
      </button>
    );
  }
}
