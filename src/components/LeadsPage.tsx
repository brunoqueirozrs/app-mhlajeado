/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Wifi, Search, Plus, MapPin, Phone, MessageSquare, Edit3, Trash2, Calendar, 
  RotateCw, AlertTriangle, Sparkles, Filter, ChevronRight, UserCheck
, Info } from 'lucide-react';
import { Lead } from "../types";
import LeadForm from "./LeadForm";
import LeadModal from "./LeadModal";
import ConfirmModal from "./ConfirmModal";
import { db } from "../lib/db";
import { doc, setDoc } from "firebase/firestore";

// Helpers
export function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Venda Fechada":
      return "bg-[#E6FAF1] text-emerald-700 border border-emerald-250 font-black";
    case "Agendado":
      return "bg-amber-50 text-amber-700 border border-amber-250 font-bold";
    case "Negociação":
      return "bg-blue-50 text-blue-900 border border-blue-200 font-bold";
    case "Novo":
      return "bg-sky-50 text-sky-800 border border-sky-250 font-bold";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200";
  }
}

export function getDaysWithoutUpdate(lead: Lead): number | null {
  const statusPerda = ["Sem Interesse", "Sem interesse"];
  if (statusPerda.includes(lead.status)) return -1;
  const ref = lead.ultimaAtualizacao || lead.dataCadastro;
  if (!ref) return null;

  try {
    const parts = ref.split(" ")[0].split("/");
    if (parts.length !== 3) return null;
    const dt = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    if (isNaN(dt.getTime())) return null;

    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    dt.setHours(0,0,0,0);

    const diff = hoje.getTime() - dt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
}

interface LeadsPageProps {
  leads: Lead[];
  loggedUser: string;
  isAdmin: boolean;
  onSaveLead: (payload: any) => Promise<void>;
  onDeleteLead: (rowId: string) => Promise<void>;
  onGenerateAIObs: (nome: string, bairro: string, plano: string, valor: string, provedor: string) => Promise<string>;
  onCombatObjectionWithIA: (objection: string) => Promise<string>;
  onSyncLeads?: () => Promise<void>;
  onAddTask?: (desc: string, dataLimite: string, nomeLead: string) => Promise<void>;
  onNavigateToTasks?: () => void;
  defaultViewMode?: "list" | "form";
  initialSellerFilter?: string | null;
}

export default function LeadsPage({
  leads,
  loggedUser,
  isAdmin,
  onSaveLead,
  onDeleteLead,
  onGenerateAIObs,
  onCombatObjectionWithIA,
  onSyncLeads,
  onAddTask,
  onNavigateToTasks,
  defaultViewMode = "list",
  initialSellerFilter = null
}: LeadsPageProps) {
  // Navigation internal mode
  const [viewMode, setViewMode] = useState<"list" | "form">(defaultViewMode);
  
  // Selection structures
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmVendaOpen, setIsConfirmVendaOpen] = useState(false);
  const [isConfirmMoveOpen, setIsConfirmMoveOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isOnlyCritical, setIsOnlyCritical] = useState(false);
  const [selectedSellerFilter, setSelectedSellerFilter] = useState(initialSellerFilter || "Todos");

  useEffect(() => {
    if (initialSellerFilter) {
      setSelectedSellerFilter(initialSellerFilter);
    }
  }, [initialSellerFilter]);

  // Helper for case-and-accent-insensitive seller matchmaking
  const matchSeller = (leadSeller: string, user: string) => {
    if (!leadSeller || !user) return false;
    const s = leadSeller.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const u = user.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return s === u || s.includes(u) || u.includes(s);
  };

  // Extract unique sellers dynamically from the current list of leads
  const uniqueSellers = Array.from(
    new Set(leads.map(l => l.vendedor).filter(Boolean))
  ).sort();

  // Filter list of leads depending on user login and selected seller filter (for admins)
  const myLeads = isAdmin 
    ? (selectedSellerFilter === "Todos" 
        ? leads 
        : leads.filter(l => l.vendedor === selectedSellerFilter))
    : leads.filter(l => matchSeller(l.vendedor, loggedUser));

  const filteredList = myLeads.filter(lead => {
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = 
        String(lead.nomeLead || "").toLowerCase().includes(q) ||
        String(lead.telefone || "").toLowerCase().includes(q) ||
        String(lead.bairro || "").toLowerCase().includes(q) ||
        String(lead.cidade || "").toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== "Todos" && lead.status !== statusFilter) return false;
    if (statusFilter === "Todos" && lead.status === "Frio") return false;

    // Critical attention filter: more than 3 days without updates
    if (isOnlyCritical) {
      if (lead.status === "Venda Fechada" || lead.status === "Sem Interesse") return false;
      const days = getDaysWithoutUpdate(lead);
      if (days === null || days < 3) return false;
    }

    return true;
  });

  const handleOpenNew = () => {
    setEditingLead(null);
    setViewMode("form");
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setViewMode("form");
    setIsModalOpen(false);
  };

  const handleOpenDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleFormSave = async (payload: any) => {
    await onSaveLead(payload);
    setViewMode("list");
    setEditingLead(null);
  };

  const handleDelete = async () => {
    if (!selectedLead?._linha) return;
    setIsConfirmDeleteOpen(true);
  };

  const handleMoveToLeadsFrios = async () => {
    if (!selectedLead) return;
    setIsConfirmMoveOpen(true);
  };

  const confirmMoveAction = async () => {
    if (!selectedLead) return;
    setIsMoving(true);
    try {
      const dataTransferencia = new Date().toLocaleDateString("pt-BR");
      const updatedObservacao = `Movido para Leads frios por ${loggedUser} na data ${dataTransferencia}. ${selectedLead.observacao || ""}`.trim();
      const leadWithUpdatedLog = { ...selectedLead, observacao: updatedObservacao };

      const res = await fetch("/api/leads-frios/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: leadWithUpdatedLog, user: loggedUser })
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
           window.location.reload();
        }
      } else {
        const errorData = await res.json();
        alert("Erro ao mover lead para Leads Frios: " + (errorData.message || "Erro desconhecido"));
        setIsMoving(false);
        setIsConfirmMoveOpen(false);
      }
    } catch (error) {
      console.error("Erro ao mover para leads frios", error);
      alert("Erro ao mover lead para Leads Frios.");
      setIsMoving(false);
      setIsConfirmMoveOpen(false);
    }
  };

  const confirmDeleteAction = async () => {
    if (!selectedLead?._linha) return;
    await onDeleteLead(String(selectedLead._linha));
    setIsConfirmDeleteOpen(false);
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleVendaFechada = async () => {
    if (!selectedLead) return;
    setIsConfirmVendaOpen(true);
  };

  const confirmVendaAction = async () => {
    if (!selectedLead) return;
    const payload = {
      _linha: selectedLead._linha,
      status: "Venda Fechada"
    };
    await onSaveLead(payload);
    setIsConfirmVendaOpen(false);
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const handleModalSaveData = async (status: string, obs: string, date: string, time: string) => {
    if (!selectedLead) return;
    const scheStr = (date && time) ? `${date.split("-").reverse().join("/")} ${time}` : "";
    const payload = {
      _linha: selectedLead._linha,
      status,
      observacao: obs,
      agendamento: scheStr || undefined
    };
    await onSaveLead(payload);
    
    if (date && onAddTask) {
      const timeStr = time ? ` às ${time}` : "";
      await onAddTask(`Retorno agendado${timeStr}`, date, selectedLead.nomeLead);
    }
    
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  if (viewMode === "form") {
    return (
      <LeadForm
        editingLead={editingLead}
        onSaveLead={handleFormSave}
        onCancel={() => setViewMode("list")}
        onGenerateAIObs={onGenerateAIObs}
      />
    );
  }

  return (
    <div id="leads-viewport" className="space-y-4">
      
      {/* Header and Add button */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-extrabold text-slate-805 tracking-tight flex items-center gap-1.5 leading-none">
            <UserCheck className="w-5 h-5 text-sky-90" />
            Minha Carteira
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold pl-0.5">Gestão de contatos e propostas</p>
        </div>
        <button
          id="btn-new-lead"
          onClick={handleOpenNew}
          className="p-2.5 px-3.5 bg-sky-900 border border-sky-950 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer active:scale-95 shadow"
        >
          <Plus className="w-4 h-4 text-white" /> Novo Lead
        </button>
      </div>

      {/* Sheet Sync Row */}
      {onSyncLeads && (
        <div className="bg-gradient-to-r from-teal-900 via-sky-900 to-sky-950 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-sans select-none animate-fade-in">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-sky-200">Sincronização de Dados</div>
            <h4 className="text-sm font-black tracking-tight mt-0.5">Painel Geral de Prospecção (Acompanhamento de Lead | Abordagens)</h4>
            <p className="text-[10.5px] text-sky-100/80 leading-snug font-semibold mt-0.5">Consolide os contatos frios e quentes diretamente da planilha administrativa no Google Sheets.</p>
          </div>
          <button
            onClick={async () => {
              try {
                await onSyncLeads();
              } catch (e: any) {
                alert("Erro ao sincronizar base: " + e.message);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 card-modern hover:bg-sky-50 text-sky-950 text-xs font-black rounded-xl shadow cursor-pointer transition active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Sincronizar Planilha</span>
          </button>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="card-modern border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3 font-sans select-none">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="leads-search-input"
            type="text"
            className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-850 placeholder-slate-400 focus:bg-white"
            placeholder="Buscar por nome, bairro, telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Admin-only seller filter dropdown */}
        {isAdmin && (
          <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-sky-600" /> Vendedor Responsável (Filtro Gestão):
            </label>
            <select
              value={selectedSellerFilter}
              onChange={e => setSelectedSellerFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700"
            >
              <option value="Todos">Exibir Todos os Vendedores (Total de {leads.length} leads)</option>
              {uniqueSellers.map(seller => {
                const count = leads.filter(l => l.vendedor === seller).length;
                return (
                  <option key={seller} value={seller}>
                    {seller} ({count} {count === 1 ? 'contato' : 'contatos'})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
            <Filter className="w-3.5 h-3.5" /> Funil:
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-none flex-1 font-sans justify-end">
            {["Todos", "Novo", "Agendado", "Negociação"].map(f => (
              <button
                key={f}
                id={`btn-filter-${f.replace(" ", "-").toLowerCase()}`}
                onClick={() => setStatusFilter(f)}
                className={`px-2 py-1.2 rounded-lg text-[10px] font-extrabold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === f ? "bg-sky-900 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-t-slate-100 pt-2 text-[10.5px] uppercase font-bold text-slate-500 select-none">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              id="critical-leads-toggle"
              type="checkbox"
              checked={isOnlyCritical}
              onChange={e => setIsOnlyCritical(e.target.checked)}
              className="rounded text-sky-90 font-bold focus:ring-0"
            />
            ⚠️ Exibir apenas leads precisando de atenção
          </label>
        </div>
      </div>

      {/* Leads list counts */}
      <p className="text-[10px] text-slate-400 font-extrabold uppercase pl-0.5 select-none">
        Exibindo {filteredList.length} de {myLeads.length} leads
      </p>

                  {/* Leads Grid Cards (Unified for Desktop and Mobile) */}
      <div id="leads-list-container" className="flex flex-col space-y-3 pb-10 select-none">
        {filteredList.length > 0 ? (
          filteredList.map(lead => {
            const isLoss = lead.status === "Sem Interesse";
            const daysNoRep = getDaysWithoutUpdate(lead);
            const isCritical = daysNoRep !== null && daysNoRep >= 3 && lead.status !== "Venda Fechada" && !isLoss;
            return (
              <motion.div
                key={lead._linha}
                id={`lead-row-${lead._linha}`}
                onClick={() => handleOpenDetail(lead)}
                whileTap={{ scale: 0.98 }}
                className={`card-modern border rounded-2xl p-4 md:p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-sky-300 transition-colors duration-200 relative overflow-hidden flex flex-col gap-4 ${
                  isCritical ? "ring-2 ring-amber-200 border-amber-350 bg-amber-50/5" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 leading-tight truncate max-w-full">{lead.nomeLead}</h3>
                    <span className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">📞 {lead.telefone || "Não informado"}</span>
                  </div>
                  <p className="text-[10px] md:text-xs text-slate-500 font-extrabold uppercase flex items-center gap-1 truncate" title={lead.endereco ? `${lead.endereco}${lead.numero ? ', ' + lead.numero : ''} - ${lead.bairro}` : lead.bairro}>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {lead.endereco ? `${lead.endereco}${lead.numero ? ', ' + lead.numero : ''} - ` : ''}{lead.bairro || "—"} · {lead.cidade || "Lajeado"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                      {lead.ultimaAtualizacao || lead.dataCadastro ? `Contato: ${lead.ultimaAtualizacao || lead.dataCadastro}` : "Sem data"}
                    </span>
                    {lead.provedor && (
                      <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        <Wifi className="w-3 h-3 text-sky-500" /> {lead.provedor}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t border-slate-100 md:border-t-0 pt-3 md:pt-0">
                  <span className={`text-[10px] px-2.5 py-1 border rounded-lg font-bold uppercase tracking-wide ${getStatusBadgeClass(lead.status)}`}>
                    {lead.status}
                  </span>
                  {isCritical && (
                    <div className="bg-amber-50 text-amber-800 font-black text-[9px] uppercase px-2 py-1 rounded flex items-center gap-1 border border-amber-300  whitespace-nowrap">
                      <AlertTriangle className="w-3 h-3" /> {daysNoRep}d sem ação
                    </div>
                  )}
                </div>
              </div>
              
              {/* Extra row for observation and update date */}
                {(lead.observacao || lead.ultimaAtualizacao) && (
                  <div className="w-full mt-2 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {lead.observacao ? (
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 block">Última observação</span>
                        <p className="text-[11px] text-slate-600 italic font-medium line-clamp-2">
                          " {lead.observacao} "
                        </p>
                      </div>
                    ) : <div className="flex-1" />}
                    
                    {lead.ultimaAtualizacao && (
                      <div className="shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 block">Data de Atualização</span>
                        <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-400" />
                          {lead.ultimaAtualizacao}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20 text-slate-400 card-modern rounded-2xl border border-slate-50">
            <AlertTriangle className="w-10 h-10 mx-auto opacity-25 text-slate-400 mb-3" />
            <p className="text-sm font-semibold">Nenhum lead encontrado.</p>
          </div>
        )}
      </div>

      {/* Floating sliding drawer details popup */}
      <LeadModal
        isOpen={isModalOpen}
        lead={selectedLead}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSaveEditions={handleModalSaveData}
        onEditLeadClick={() => handleOpenEdit(selectedLead!)}
        onDeleteLead={handleDelete}
        onMoveToLeadsFrios={handleMoveToLeadsFrios}
        onMarkVendaFechada={handleVendaFechada}
        onCombatObjectionWithIA={onCombatObjectionWithIA}
        onNavigateToTasks={onNavigateToTasks}
        isAdmin={isAdmin}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Excluir Lead"
        message={`Você tem certeza que deseja excluir permanentemente o lead "${selectedLead?.nomeLead}"?`}
        confirmText="Excluir"
        onConfirm={confirmDeleteAction}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      <ConfirmModal
        isOpen={isConfirmVendaOpen}
        title="Marcar Venda Fechada"
        message={`Deseja confirmar a venda fechada para "${selectedLead?.nomeLead}"?`}
        confirmText="Confirmar"
        onConfirm={confirmVendaAction}
        onCancel={() => setIsConfirmVendaOpen(false)}
      />

      <ConfirmModal
        isOpen={isConfirmMoveOpen}
        title="Mover para Leads Frios"
        message={`Você tem certeza que deseja mover "${selectedLead?.nomeLead}" para a base de Leads Frios? Esta ação irá retirá-lo da sua lista de acompanhamento.`}
        confirmText="Mover para Frios"
        onConfirm={confirmMoveAction}
        onCancel={() => setIsConfirmMoveOpen(false)}
      />
      
      {isMoving && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-300">
          <div className="card-modern rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <h3 className="text-lg font-bold text-slate-800">Transferindo Lead...</h3>
            <p className="text-sm text-slate-500 text-center">
              Movendo para a base unificada de Leads Frios.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
