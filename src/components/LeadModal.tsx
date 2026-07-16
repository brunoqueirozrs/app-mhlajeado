/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  X, Phone, MessageCircle, MapPin, Edit3, Trash2, Calendar, ClipboardCheck,
  Cpu, Users, ShieldAlert, Sparkles, FolderSync, Clock, Heart, Award, Send,
  Search, Zap, Crosshair, BrainCircuit, Lightbulb
} from "lucide-react";
import { Lead } from "../types";
import { getStatusBadgeClass } from "./LeadsPage";

interface LeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSaveEditions: (s: string, o: string, d: string, h: string) => Promise<void>;
  onEditLeadClick: () => void;
  onDeleteLead: () => Promise<void>;
  onMoveToLeadsFrios: () => Promise<void>;
  onMarkVendaFechada: () => Promise<void>;
  onCombatObjectionWithIA: (objection: string) => Promise<string>;
  onNavigateToTasks?: () => void;
  isAdmin: boolean;
}

export default function LeadModal({
  isOpen,
  lead,
  onClose,
  onSaveEditions,
  onEditLeadClick,
  onDeleteLead,
  onMoveToLeadsFrios,
  onMarkVendaFechada,
  onCombatObjectionWithIA,
  onNavigateToTasks,
  isAdmin
}: LeadModalProps) {
  const [status, setStatus] = useState("Novo");
  const [obs, setObs] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  // Objection inside drawer
  const [objection, setObjection] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Approach / Resumer states
  const [approachText, setApproachText] = useState("");
  const [approachLoading, setApproachLoading] = useState(false);

  // New AI States
  const [aiTab, setAiTab] = useState<"summary" | "approach" | "objection">("summary");
  const [leadSummary, setLeadSummary] = useState("");
  const [leadSummaryLoading, setLeadSummaryLoading] = useState(false);
  const [sentiment, setSentiment] = useState("");
  const [sentimentLoading, setSentimentLoading] = useState(false);
  
  const [combatObjectionText, setCombatObjectionText] = useState("");
  const [combatLoading, setCombatLoading] = useState(false);
  const [combatResponses, setCombatResponses] = useState<any[]>([]);

  const handleGenerateSummary = async () => {
    if (!lead) return;
    setLeadSummaryLoading(true);
    try {
      const resp = await fetch("/api/gemini/leadSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: { ...lead, observacao: obs, status: status } })
      });
      const data = await resp.json();
      if (data.status === "success") setLeadSummary(data.text);
    } finally {
      setLeadSummaryLoading(false);
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!obs) return;
    setSentimentLoading(true);
    try {
      const resp = await fetch("/api/gemini/analyzeSentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: obs })
      });
      const data = await resp.json();
      if (data.status === "success") setSentiment(data.text);
    } finally {
      setSentimentLoading(false);
    }
  };

  const handleCombatTrio = async () => {
    if (!combatObjectionText) return;
    setCombatLoading(true);
    try {
      const resp = await fetch("/api/gemini/combatObjectionTrio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          objection: combatObjectionText,
          provedor: lead?.provedor,
          planoAtual: lead?.planoAtual,
          valorPlano: lead?.valorPlano
        })
      });
      const data = await resp.json();
      if (data.status === "success" && Array.isArray(data.responses)) {
        setCombatResponses(data.responses);
      }
    } finally {
      setCombatLoading(false);
    }
  };

  useEffect(() => {
    if (lead) {
      setStatus(lead.status || "Novo");
      setObs(lead.observacao || "");
      setObjection(lead.objecao || "");
      setAiResponse(lead.respostaObjecao || "");
      setApproachText("");
      setApproachLoading(false);

      if (lead.agendamento) {
        const parts = String(lead.agendamento).split(" ");
        if (parts[0]) {
          const dateParts = parts[0].split("/");
          if (dateParts.length === 3) {
            setDate(`${dateParts[2]}-${dateParts[1].padStart(2, "0")}-${dateParts[0].padStart(2, "0")}`);
          } else {
            setDate("");
          }
        } else {
          setDate("");
        }
        setTime(parts[1] || "");
      } else {
        setDate("");
        setTime("");
      }
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const fone = String(lead.telefone || "").replace(/\D/g, "");
  const queryMaps = encodeURIComponent([lead.endereco, lead.numero, lead.bairro, lead.cidade].filter(Boolean).join(", "));

  const handleLigar = () => {
    window.location.href = `tel:+55${fone}`;
  };

  const handleWhats = () => {
    window.open(`https://wa.me/55${fone}`, "_blank");
  };

  const handleMaps = () => {
    window.open(`https://maps.google.com/?q=${queryMaps}`, "_blank");
  };

  const handleCombatObjec = async () => {
    if (!objection.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const resp = await onCombatObjectionWithIA(objection);
      setAiResponse(resp);
    } catch (e: any) {
      setAiResponse("Atendimento local, suporte no mesmo dia e técnicos de Lajeado e Estrela próprios, sem pegadinhas de reajustes escondidos!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateApproach = async () => {
    if (!lead) return;
    setApproachLoading(true);
    setApproachText("");
    try {
      const resp = await fetch("/api/gemini/generateApproach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeLead: lead.nomeLead,
          provedor: lead.provedor,
          planoAtual: lead.planoAtual,
          valorPlano: lead.valorPlano,
          observacao: obs,
          cidade: lead.cidade,
          bairro: lead.bairro,
          status: status,
          objecao: objection
        })
      });
      if (resp.ok) {
        const d = await resp.json();
        setApproachText(d.text);
      } else {
        setApproachText("Não foi possível gerar sugestões de roteiro de abordagem no momento.");
      }
    } catch (err: any) {
      setApproachText("Erro de rede / latência. Tente gerar novamente.");
    } finally {
      setApproachLoading(false);
    }
  };

  const handleSaveModal = async () => {
    await onSaveEditions(status, obs, date, time);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[950] flex items-center justify-center font-sans tracking-tight" onClick={onClose}>
      <div className="card-modern w-full h-full md:w-[98vw] md:max-w-7xl md:h-[98vh] md:rounded-3xl p-4 md:p-8 space-y-6 overflow-y-auto  select-none shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {/* Header toolbar */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 leading-tight pr-4">{lead.nomeLead}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1 flex items-center gap-1.5 leading-none">
              <MapPin className="w-3.5 h-3.5 text-slate-350" /> {lead.bairro || "—"} · {lead.cidade}
            </p>
          </div>
          <button 
            id="modal-detail-close-btn"
            onClick={onClose}
            className="p-1 px-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 bg-slate-50 border rounded-lg transition active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Detailed KPI Tiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 leading-none block mb-1">Telefone / Whats</span>
            <div className="font-extrabold text-slate-800 text-sm leading-tight">{lead.telefone || "—"}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 leading-none block mb-1">Provedor Atual</span>
            <div className="font-extrabold text-sky-950 text-sm leading-tight truncate">{lead.provedor || "Nenhum"}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 leading-none block mb-1">Plano Atual</span>
            <div className="font-extrabold text-slate-700 text-sm leading-tight">{lead.planoAtual || "Não informado"}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 leading-none block mb-1">Valor Plano</span>
            <div className="font-extrabold text-sky-850 text-sm leading-tight">{lead.valorPlano ? `R$ ${lead.valorPlano}` : "Não informado"}</div>
          </div>
        </div>

        {/* Audit dates rows */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider leading-none">
          <div>
            <span>Data de Cadastro</span>
            <div className="text-[11px] text-slate-700 font-extrabold mt-1 font-mono tracking-tight lowercase">{lead.dataCadastro || "—"}</div>
          </div>
          <div>
            <span>Última Interação</span>
            <div className="text-[11px] text-slate-700 font-extrabold mt-1 font-mono tracking-tight lowercase">{lead.ultimaAtualizacao || "—"}</div>
          </div>
          {lead.vendedor && (
            <div className="col-span-2 pt-2 border-t border-t-slate-200/50">
              <span className="normal-case">Vendedor Responsável:</span>
              <strong className="text-sky-950 font-black ml-1.5">{lead.vendedor}</strong>
            </div>
          )}
        </div>

        {/* Action pills buttons row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <button 
            id="drawer-actions-call"
            onClick={handleLigar}
            className="md:col-span-1 py-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-sky-100 active:scale-95 transition"
          >
            <Phone className="w-4 h-4 text-sky-600" />
          </button>
          <button 
            id="drawer-actions-whats"
            onClick={handleWhats}
            className="md:col-span-1 py-2.5 rounded-xl bg-[#E6FAF1] border border-[#00A86B]/20 text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4 text-[#00A86B] focus:fill-emerald-50" />
          </button>
          <button 
            id="drawer-actions-map"
            onClick={handleMaps}
            className="md:col-span-1 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-100 active:scale-95 transition"
          >
            <MapPin className="w-4 h-4 text-rose-500" />
          </button>

          <button 
            id="drawer-actions-close"
            onClick={onMarkVendaFechada}
            className="col-span-2 md:col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold leading-none cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 transition shadow"
          >
            <Award className="w-4 h-4" /> Registrar Venda 🎉
          </button>
          
          <button 
            id="drawer-actions-edit"
            onClick={onEditLeadClick}
            className="md:col-span-1 py-2.5 bg-slate-100 border border-slate-205 text-slate-705 text-xs font-black rounded-xl cursor-pointer hover:bg-slate-200 flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="sep h-[1px] bg-slate-200" />

        {/* Change fields layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
          
          <div className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-[11px] font-extrabold uppercase text-slate-500">Situação no Funil / Status</label>
               <select
                 id="drawer-status-select"
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none transition"
                 value={status}
                 onChange={e => setStatus(e.target.value)}
               >
                 <option value="Novo">Novo Lead</option>
                 <option value="Agendado">Visita Agendada</option>
                 <option value="Negociação">Em Negociação</option>
                 <option value="Venda Fechada">Venda Fechada</option>
                 <option value="Sem Interesse">Sem Interesse Temporário</option>
               </select>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1.5">
                 <label className="text-[11px] font-extrabold uppercase text-slate-500">Data de Retorno</label>
                 <input
                   id="drawer-sched-date"
                   type="date"
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 transition"
                   value={date}
                   onChange={e => setDate(e.target.value)}
                 />
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[11px] font-extrabold uppercase text-slate-500">Hora</label>
                 <input
                   id="drawer-sched-time"
                   type="time"
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 transition"
                   value={time}
                   onChange={e => setTime(e.target.value)}
                 />
               </div>
             </div>

            <div className="space-y-1.5 bg-sky-50/50 p-4 rounded-xl border border-sky-100/60">
               <label className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-600">
                 <span>Última Atualização / Observação</span>
                 <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">Manual</span>
               </label>
               <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                 Use este espaço para anotar a última atualização ou histórico da conversa com o cliente. <strong className="text-sky-700">Sincroniza automaticamente com a planilha.</strong>
               </p>
               <textarea
                 id="drawer-obs-field"
                 className="w-full card-modern border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 rounded-xl py-3 px-3.5 text-xs text-slate-700 min-h-[100px] outline-none transition resize-none shadow-sm"
                 placeholder="Descreva aqui o que foi conversado ou o que o cliente relatou..."
                 value={obs}
                 onChange={e => setObs(e.target.value)}
               />
               <div className="flex justify-between items-start mt-2 gap-2">
                 <button onClick={handleAnalyzeSentiment} disabled={sentimentLoading || !obs} className="text-[10px] card-modern border border-sky-200 text-sky-700 px-2 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-sky-50 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm">
                    <Lightbulb className="w-3 h-3" />
                    {sentimentLoading ? "Analisando..." : "Analisar Sentimento"}
                 </button>
                 {sentiment && (
                   <div className="flex-1 bg-sky-100/50 p-2 rounded-lg border border-sky-200/50 text-[10px] text-sky-900 leading-tight whitespace-pre-wrap font-medium">
                     {sentiment}
                   </div>
                 )}
               </div>
             </div>
          </div>

          <div className="space-y-4 flex-1 flex flex-col h-full min-h-[350px]">
            {/* AI Assistant Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0 shadow-inner">
               <button 
                 onClick={() => setAiTab("summary")}
                 className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition cursor-pointer ${aiTab === "summary" ? "bg-white shadow-sm text-sky-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
               >
                 Resumo
               </button>
               <button 
                 onClick={() => setAiTab("approach")}
                 className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition cursor-pointer ${aiTab === "approach" ? "bg-white shadow-sm text-sky-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
               >
                 Abordar
               </button>
               <button 
                 onClick={() => setAiTab("objection")}
                 className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition cursor-pointer ${aiTab === "objection" ? "bg-white shadow-sm text-sky-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
               >
                 Objeções
               </button>
            </div>

            {aiTab === "summary" && (
               <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 font-sans text-xs flex-1 h-full flex flex-col relative overflow-hidden shadow-sm">
                 <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                   <BrainCircuit className="w-24 h-24 text-sky-600" />
                 </div>
                 <div className="relative z-10 flex flex-col h-full">
                   <div className="text-[12px] font-black uppercase text-sky-900 flex items-center gap-1.5 mb-2">
                     <Search className="w-4 h-4 text-sky-600" />
                     Raio-X do Lead
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium mb-4">A IA cruza o histórico e a situação atual para sugerir os próximos passos.</p>
                   
                   {!leadSummary ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 mt-4">
                        <button onClick={handleGenerateSummary} disabled={leadSummaryLoading} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 transition text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50">
                           <Sparkles className="w-4 h-4 text-amber-300" /> 
                           {leadSummaryLoading ? "Analisando..." : "Gerar Resumo Inteligente"}
                        </button>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col space-y-4 pr-1 mt-2">
                       <div className="p-4 card-modern rounded-xl border border-sky-100 shadow-sm leading-relaxed whitespace-pre-wrap text-slate-700 font-medium text-[11px] flex-1">
                         {leadSummary}
                       </div>
                       <button onClick={handleGenerateSummary} className="text-[9px] font-bold text-sky-500 hover:text-sky-700 uppercase flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 py-2 border border-sky-100 rounded-xl bg-white hover:bg-sky-50">
                         <FolderSync className="w-3 h-3" /> Atualizar Resumo
                       </button>
                     </div>
                   )}
                 </div>
               </div>
            )}

            {aiTab === "objection" && (
               <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 font-sans text-xs flex-1 h-full flex flex-col relative overflow-hidden shadow-sm">
                 <div className="relative z-10 flex flex-col h-full">
                   <div className="text-[12px] font-black uppercase text-rose-900 flex items-center gap-1.5 mb-2">
                     <Crosshair className="w-4 h-4 text-rose-600" />
                     Quebrar Objeções
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium mb-3">O cliente disse "NÃO"? Escolha a objeção, e a IA gera 3 respostas táticas.</p>
                   
                   <div className="flex gap-2 mb-4 shrink-0">
                     <input
                       type="text"
                       list="objection-list"
                       placeholder="Selecione ou digite a objeção..."
                       className="flex-1 card-modern border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-rose-400 text-[11px] font-bold text-slate-700 shadow-sm placeholder:text-slate-400"
                       value={combatObjectionText}
                       onChange={(e) => setCombatObjectionText(e.target.value)}
                     />
                     <datalist id="objection-list">
                        <option value="Estou feliz com a minha operadora atual" />
                        <option value="Achei caro, não tenho como pagar mais" />
                        <option value="Tenho fidelidade e multa com a atual" />
                        <option value="Vou pensar e te aviso depois" />
                        <option value="Só quero se tiver desconto" />
                     </datalist>
                     <button onClick={handleCombatTrio} disabled={combatLoading || !combatObjectionText} className="bg-rose-600 hover:bg-rose-700 text-white p-2 px-3 rounded-xl transition active:scale-95 disabled:opacity-50 cursor-pointer shadow flex items-center justify-center">
                       <Zap className="w-4 h-4" />
                     </button>
                   </div>

                   <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-2">
                     {combatLoading && <div className="text-center py-4 font-bold text-rose-600 animate-pulse text-[10px]">Formulando respostas táticas...</div>}
                     
                     {!combatLoading && combatResponses.map((resp, i) => (
                       <div key={i} className="p-3 pt-4 card-modern rounded-xl border border-rose-100 shadow-sm relative group mt-3">
                          <span className="absolute -top-2.5 left-3 bg-rose-100 text-rose-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-200">
                            {resp.type}
                          </span>
                          <p className="text-[11px] text-slate-700 leading-relaxed mt-1">{resp.text}</p>
                          <button onClick={() => {
                             navigator.clipboard.writeText(resp.text);
                             alert("Resposta copiada!");
                          }} className="mt-2 text-[9px] font-bold text-slate-400 hover:text-rose-600 uppercase flex items-center gap-1 transition opacity-0 group-hover:opacity-100 cursor-pointer">
                            <ClipboardCheck className="w-3 h-3" /> Copiar
                          </button>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            )}

            {aiTab === "approach" && (
             <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 space-y-4 font-sans text-xs flex-1 h-full flex flex-col shadow-sm">
               <div className="text-[12px] font-black uppercase text-sky-900 flex items-center gap-1.5">
                 <Sparkles className="w-5 h-5 text-sky-600" />
                 Sugestão de Abordagem (IA)
               </div>

               <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                 A IA da MHNET irá ler todos os dados deste card (Provedor, Plano, Histórico, Status e Endereço) para formular uma sugestão de abordagem matadora para o WhatsApp.
               </p>

               <button
                 onClick={handleGenerateApproach}
                 disabled={approachLoading}
                 className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-xl text-xs transition disabled:opacity-40 select-none cursor-pointer shadow-sky-100 shadow flex items-center justify-center gap-2 mt-2"
               >
                 <Cpu className="w-4 h-4 text-amber-300" />
                 {approachLoading ? "Analisando Cenário Geral..." : "Gerar Abordagem com IA"}
               </button>

               {approachLoading && (
                 <div className="text-center py-6 text-[11px] text-slate-500 space-y-2 flex-col flex items-center flex-1 justify-center">
                   <div className="w-5 h-5 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
                   <p className="font-bold text-sky-800">Lendo histórico e compondo roteiro...</p>
                 </div>
               )}

               {approachText && (
                 <div className="mt-4 p-4 card-modern border border-sky-150 rounded-xl whitespace-pre-wrap text-[12px] text-slate-800 shadow-sm leading-relaxed border-l-4 border-l-sky-600  space-y-3 flex-1 overflow-y-auto">
                   <div className="font-sans leading-relaxed text-[11.5px] select-all">{approachText}</div>
                   <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                     <button
                       type="button"
                       onClick={() => {
                         navigator.clipboard.writeText(approachText);
                         alert("Copiado para a área de transferência! 👍");
                       }}
                       className="text-[11px] font-extrabold bg-sky-50 hover:bg-sky-100 text-sky-700 px-4 py-2 rounded-lg border border-sky-200 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                     >
                       <ClipboardCheck className="w-3.5 h-3.5" /> Copiar para o Whats
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         if (lead?.telefone) {
                            const cleanPhone = lead.telefone.replace(/\D/g, "");
                            const encodedMessage = encodeURIComponent(approachText);
                            window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, "_blank");
                         } else {
                            alert("Lead não possui telefone cadastrado.");
                         }
                       }}
                       className="text-[11px] font-extrabold bg-[#E6FAF1] hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                     >
                       <Send className="w-3.5 h-3.5" /> Enviar Direto
                     </button>
                   </div>
                 </div>
               )}
             </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100 mt-6">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              id="drawer-del-btn"
              onClick={onDeleteLead}
              className="flex-1 sm:flex-none p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-100/50 transition active:scale-95 flex items-center justify-center gap-1.5 text-[11px] font-bold"
            >
              <Trash2 className="w-4 h-4" /> Excluir Lead
            </button>
            <button 
              onClick={onMoveToLeadsFrios}
              className="flex-1 sm:flex-none p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl hover:bg-blue-100/50 transition active:scale-95 flex items-center justify-center gap-1.5 text-[11px] font-bold"
            >
              Mover p/ Leads Frios
            </button>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full sm:w-auto">
             <button 
               onClick={onClose}
               className="w-full sm:w-auto px-6 py-3 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-[11px] font-extrabold rounded-xl active:scale-95 transition"
             >
               Cancelar
             </button>
             {date && (
               <button 
                 onClick={async () => {
                   await handleSaveModal();
                   if (onNavigateToTasks) onNavigateToTasks();
                 }}
                 className="w-full sm:w-auto px-6 py-3 bg-emerald-600 border border-emerald-700 text-white rounded-xl text-[11px] font-extrabold text-center justify-center hover:bg-emerald-700 cursor-pointer shadow active:scale-95 transition flex items-center gap-1.5"
               >
                 <FolderSync className="w-4 h-4" /> Agendar & Ver Tarefas
               </button>
             )}
             <button 
               onClick={handleSaveModal}
               className="w-full sm:w-auto px-6 py-3 bg-sky-900 border border-sky-950 text-white rounded-xl text-[11px] font-extrabold text-center justify-center hover:bg-sky-950 cursor-pointer shadow active:scale-95 transition flex items-center gap-1.5"
             >
               <FolderSync className="w-4 h-4" /> Salvar Alterações
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
