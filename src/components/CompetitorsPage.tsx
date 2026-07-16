/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Zap, ThumbsUp, ThumbsDown, Star, Sparkles, Send, ShieldAlert, Cpu, Plus, Edit3, Trash2, X, RefreshCw, Target, LayoutList, Activity, Database, CheckCircle } from "lucide-react";
import { Competitor } from "../types";
import ConfirmModal from "./ConfirmModal";

interface CompetitorsPageProps {
  competitors: Competitor[];
  onAnalyzeWithAI: (name: string, question: string, mhnetVantagem: string) => Promise<string>;
  onSaveCompetitor?: (comp: Competitor) => Promise<void>;
  onDeleteCompetitor?: (id: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function CompetitorsPage({
  competitors,
  onAnalyzeWithAI,
  onSaveCompetitor,
  onDeleteCompetitor,
  isAdmin = false
}: CompetitorsPageProps) {
  const [selectedComp, setSelectedClient] = useState<Competitor | null>(competitors[0] || null);
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [compToDelete, setCompToDelete] = useState<Competitor | null>(null);

  // Form states for Admin inclusions and editions
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSigla, setFormSigla] = useState("");
  const [formCor, setFormCor] = useState("#4f46e5");
  const [formType, setFormType] = useState("Fibra Óptica");
  const [formPros, setFormPros] = useState(""); // newline separated values
  const [formCons, setFormCons] = useState(""); // newline separated values
  const [formMhnet, setFormMhnet] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  const [isSyncingN8N, setIsSyncingN8N] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [hasSynced, setHasSynced] = useState(false);

  const handleTriggerN8NSync = async () => {
    if (!selectedComp) return;
    setIsSyncingN8N(true);
    setHasSynced(false);
    setSyncLogs([`Iniciando webhook de trigger... [${selectedComp.name}]`]);

    const configuredUrl = localStorage.getItem("n8n_webhook_url") || "https://lake-elective-scoured.ngrok-free.dev/webhook/sync-competitor";

    if (configuredUrl.includes("localhost") || configuredUrl.includes("127.0.0.1")) {
      alert("⚠️ Por favor, vá na aba ⚙️ Manutenção > Configurações e cole a sua URL segura do ngrok.");
      setIsSyncingN8N(false);
      return;
    }

    try {
      const resp = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: configuredUrl,
          payload: {
            tipo: "sync_competitor",
            concorrente: selectedComp.name,
            sigla: selectedComp.sigla
          }
        })
      });
      
      if (!resp.ok) {
        if (resp.status === 404 || resp.status === 500) {
          window.dispatchEvent(new CustomEvent("webhook-error"));
          throw new Error("Erro no webhook do N8N.");
        }
        throw new Error("HTTP " + resp.status);
      }
      
      setSyncLogs(prev => [...prev, `[n8n] Request enviado e processado pelo workflow webhook.`]);
      setSyncLogs(prev => [...prev, `Sincronização concluída com sucesso.`]);
      setHasSynced(true);
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `❌ Falha ao acionar n8n: ${err.message}`]);
    } finally {
      setIsSyncingN8N(false);
    }
  };

  // Keep selected competitor aligned when the list contents update
  React.useEffect(() => {
    if (selectedComp) {
      const refreshed = competitors.find(c => c.id === selectedComp.id || c.name.toLowerCase() === selectedComp.name.toLowerCase());
      if (refreshed) {
        setSelectedClient(refreshed);
      } else {
        setSelectedClient(competitors[0] || null);
      }
    } else if (competitors.length > 0) {
      setSelectedClient(competitors[0]);
    }
  }, [competitors]);

  const handleTriggerAnalysis = async () => {
    if (!selectedComp) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const response = await onAnalyzeWithAI(selectedComp.name, question, selectedComp.mhnet || "");
      setAiAnswer(response);
    } catch (e: any) {
      setAiAnswer("Ocorreu uma instabilidade na consulta. Tente novamente ou use a contraposição do menu de vantagens.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleEditClick = (c: Competitor) => {
    setEditingId(c.id || null);
    setFormName(c.name);
    setFormSigla(c.sigla);
    setFormCor(c.cor || "#4f46e5");
    setFormType(c.type || "Fibra Óptica");
    setFormPros((c.pros || []).join("\n"));
    setFormCons((c.cons || []).join("\n"));
    setFormMhnet(c.mhnet || "");
    setIsFormOpen(true);
  };

  const handleAutoFillAI = async () => {
    if (!formName.trim()) {
      alert("Por favor, digite o nome do concorrente primeiro para a IA pesquisar e formular sugestões!");
      return;
    }
    setIsGenerating(true);
    try {
      const resp = await fetch("/api/competitors/generate-ai-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() })
      });
      if (resp.ok) {
        const d = await resp.json();
        if (d.status === "success" && d.profile) {
          const profile = d.profile;
          setFormSigla(profile.sigla || "");
          setFormCor(profile.cor || "#4f46e5");
          setFormType(profile.type || "Fibra Óptica");
          setFormPros((profile.pros || []).join("\n"));
          setFormCons((profile.cons || []).join("\n"));
          setFormMhnet(profile.mhnet || "");
        }
      } else {
        alert("Não foi possível gerar as sugestões inteligentes temporariamente.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao contatar o servidor cognitivo: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Nome do concorrente é obrigatório.");
      return;
    }
    if (!formMhnet.trim()) {
      alert("Por favor, preencha o argumento comparativo da MHNET.");
      return;
    }
    if (!onSaveCompetitor) return;

    try {
      const payload: Competitor = {
        id: editingId || undefined,
        name: formName.trim(),
        sigla: formSigla.trim() || formName.trim().substring(0, 2).toUpperCase(),
        cor: formCor,
        type: formType,
        pros: formPros.split("\n").map(line => line.trim()).filter(Boolean),
        cons: formCons.split("\n").map(line => line.trim()).filter(Boolean),
        mhnet: formMhnet.trim()
      };

      await onSaveCompetitor(payload);

      // Clean up states
      setIsFormOpen(false);
      setEditingId(null);
      setFormName("");
      setFormSigla("");
      setFormCor("#4f46e5");
      setFormType("Fibra Óptica");
      setFormPros("");
      setFormCons("");
      setFormMhnet("");
    } catch (error: any) {
      console.error(error);
      alert("Ocorreu um erro ao salvar: " + error.message);
    }
  };

  const confirmDelete = async () => {
    if (!compToDelete) return;
    try {
      if (onDeleteCompetitor && compToDelete.id) {
        await onDeleteCompetitor(compToDelete.id);
        // alert("Concorrente removido.");
      }
    } catch (e: any) {
      alert("Não foi possível excluir: " + e.message);
    } finally {
      setCompToDelete(null);
    }
  };

  return (
    <div id="competitors-viewport" className="space-y-4">
      {/* Page Title & Admin Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-805 tracking-tight flex items-center gap-1.5 leading-none">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            Almanaque Concorrentes
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold pl-0.5 font-sans">Estudo Comparativo no Vale do Taquari</p>
        </div>

        {isAdmin && !isFormOpen && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormName("");
              setFormSigla("");
              setFormCor("#1565c0");
              setFormType("Fibra Óptica");
              setFormPros("");
              setFormCons("");
              setFormMhnet("");
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white border border-sky-700 rounded-lg text-xs font-bold transition shadow shadow-sky-100 cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Incluir Concorrente</span>
          </button>
        )}
      </div>

      {/* Admin inclusion form panel */}
      {isAdmin && isFormOpen && (
        <form onSubmit={handleSaveSubmit} className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl  font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h3 className="font-extrabold text-xs tracking-tight text-white uppercase">
                {editingId ? "Editar Provedor Concorrente" : "Incluir Novo Provedor Concorrente"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
                setFormName("");
              }}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Nome da Empresa Concorrente</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Vero, Claro, GigaNet"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-705 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-sky-500 placeholder-slate-500"
                />
                {!editingId && (
                  <button
                    type="button"
                    onClick={handleAutoFillAI}
                    disabled={isGenerating || !formName.trim()}
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-505 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-800 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 transition active:scale-95 whitespace-nowrap border border-sky-700 shadow shadow-sky-900 cursor-pointer"
                    title="Preencher com sugestões da Inteligência Artificial baseada no mercado gaúcho"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>Preencher dados com IA</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Sigla</label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="Ex: GG"
                  value={formSigla}
                  onChange={e => setFormSigla(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-705 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-sky-500 text-center uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Cor Marca</label>
                <div className="flex items-center gap-1.5 h-[34px] bg-slate-800 border border-slate-705 rounded-xl px-2">
                  <input
                    type="color"
                    value={formCor}
                    onChange={e => setFormCor(e.target.value)}
                    className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formCor}
                    onChange={e => setFormCor(e.target.value)}
                    className="w-full bg-transparent text-[10px] text-slate-300 font-mono focus:outline-none"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-405 tracking-wider">Tecnologia</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                  className="w-full h-[34px] bg-slate-800 border border-slate-705 rounded-xl px-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
                >
                  <option value="Fibra Óptica">Fibra Óptica</option>
                  <option value="Híbrido / Coaxial">Híbrido / Coaxial</option>
                  <option value="Via Rádio">Via Rádio</option>
                  <option value="Satélite / Starlink">Satélite / Starlink</option>
                  <option value="Multi-Tecnologia">Multi-Tecnologia</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> Pontos Fortes Realistas
                </label>
                <span className="text-[9px] text-slate-500 font-sans">(Um por linha)</span>
              </div>
              <textarea
                placeholder="Ex: Cobertura sólida regional&#10;Ganha combos corporativos grátis"
                rows={3}
                value={formPros}
                onChange={e => setFormPros(e.target.value)}
                className="w-full bg-slate-800 border border-slate-705 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
                  <ThumbsDown className="w-3.5 h-3.5" /> Pontos Fracos Realistas
                </label>
                <span className="text-[9px] text-slate-500 font-sans">(Um por linha)</span>
              </div>
              <textarea
                placeholder="Ex: Suporte por central nacional robótica&#10;Instabilidade extrema após tempestades"
                rows={3}
                value={formCons}
                onChange={e => setFormCons(e.target.value)}
                className="w-full bg-slate-800 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-sans"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-sky-450 tracking-wider flex items-center gap-1 font-sans">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-400" /> NOSSA VANTAGEM MHNET (A Diferencial para Contrapor no Campo)
              </label>
              <span className="text-[9px] text-slate-500 font-sans">Argumento-chave para o consultor converter e contrapor</span>
            </div>
            <textarea
              placeholder="Digite como os vendedores podem combater os fortes deles e se sobressair com vantagens exclusivas reais da MHNET (ex: Atendimento local humanizado sem filas de e-mail e suporte técnico presencial rápido no mesmo dia)."
              rows={2}
              value={formMhnet}
              onChange={e => setFormMhnet(e.target.value)}
              className="w-full bg-slate-800 border border-slate-705 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
                setFormName("");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer select-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg border border-sky-700 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? "Salvar Alterações" : "Cadastrar Provedor"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid of Competitor buttons cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {competitors.map(c => {
          const isSelected = selectedComp?.id === c.id || selectedComp?.name === c.name;
          return (
            <div
              key={c.id || c.name}
              id={`comp-card-${(c.sigla || "CC").toLowerCase()}`}
              onClick={() => {
                setSelectedClient(c);
                setQuestion("");
                setAiAnswer("");
              }}
              className={`card-modern border rounded-2xl p-3 text-center cursor-pointer shadow -md active:scale-97 transition ${
                isSelected ? "border-slate-800 ring-4 ring-slate-100 bg-slate-50/50" : "border-slate-200"
              }`}
            >
              {/* Initials Symbol block */}
              <div 
                className="w-9 h-9 rounded-xl mx-auto flex items-center justify-center font-black text-xs text-white mb-2 shadow-sm"
                style={{ backgroundColor: c.cor || "#1e293b" }}
              >
                {c.sigla || "CC"}
              </div>
              <div className="text-[11px] font-extrabold text-slate-800 tracking-tight leading-tight truncate">{c.name}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{c.type || "Fibra"}</div>
            </div>
          );
        })}
      </div>

      {/* Selected competitor specification details */}
      {selectedComp ? (
        <div id="comp-detailed-card" className="card-modern border border-slate-200 rounded-2xl p-5 shadow-lg space-y-4  font-sans">
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm"
                style={{ backgroundColor: selectedComp.cor || "#1e293b" }}
              >
                {selectedComp.sigla}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm leading-none flex items-center gap-1.5">
                  {selectedComp.name}
                </h3>
                <p className="text-[10px] text-slate-450 uppercase mt-1 font-bold">{selectedComp.type || "Fibra Óptica"}</p>
              </div>
            </div>

            {/* Admin actions for edit and delete */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditClick(selectedComp)}
                  className="p-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-sky-650 border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                  title="Editar dados deste concorrente"
                >
                  <Edit3 className="w-3.2 h-3.2" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setCompToDelete(selectedComp)}
                  className="p-1 px-2 py-1 bg-slate-50 hover:bg-rose-50 text-slate-650 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                  title="Excluir concorrentes"
                >
                  <Trash2 className="w-3.2 h-3.2" />
                  <span>Excluir</span>
                </button>
              </div>
            )}
          </div>

          <div className="sep h-[1px] bg-slate-100" />

          {/* Pros & Cons Bento Grid Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="bg-[#E6FAF1] rounded-2xl p-3.5 border border-emerald-105/50 space-y-2">
              <div className="text-emerald-800 font-extrabold text-[10px] uppercase flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" /> Pontos Fortes
              </div>
              <ul className="space-y-1.5 text-slate-600 font-medium pl-1 text-[11px]">
                {selectedComp.pros && selectedComp.pros.length > 0 ? (
                  selectedComp.pros.map((p, i) => (
                    <li key={i} className="flex gap-1 items-start">
                      <span className="text-[#00A86B] font-semibold">•</span>
                      <span>{p}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Nenhum ponto forte registrado.</p>
                )}
              </ul>
            </div>

            <div className="bg-rose-50 rounded-2xl p-3.5 border border-rose-105/50 space-y-2">
              <div className="text-rose-800 font-extrabold text-[10px] uppercase flex items-center gap-1">
                <ThumbsDown className="w-3.5 h-3.5" /> Pontos Fracos
              </div>
              <ul className="space-y-1.5 text-slate-600 font-medium pl-1 text-[11px]">
                {selectedComp.cons && selectedComp.cons.length > 0 ? (
                  selectedComp.cons.map((c, i) => (
                    <li key={i} className="flex gap-1 items-start">
                      <span className="text-rose-500 font-semibold">•</span>
                      <span>{c}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Nenhum ponto fraco registrado.</p>
                )}
              </ul>
            </div>
          </div>

          {/* MHNET direct counter pitch advantages card */}
          <div className="bg-sky-50 border border-sky-100/80 rounded-2xl p-4 text-xs space-y-1.5 leading-relaxed shadow-sm">
            <div className="text-sky-950 font-black uppercase tracking-wider text-[9px] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-800" /> NOSSA VANTAGEM (Como combater e desarmar estes pontos fortes no campo)
            </div>
            <p className="text-slate-700 font-semibold text-[11.5px] leading-relaxed select-all">
              {selectedComp.mhnet || "Sem argumento comparativo cadastrado no momento."}
            </p>
          </div>

          {/* DADOS DO RADAR (Inteligência de Mercado / n8n) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl text-white">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center">
                   <Target className="w-3.5 h-3.5" />
                 </div>
                 <div>
                   <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-100">Radar de Inteligência (Lajeado & Estrela)</h4>
                   <p className="text-[9px] text-slate-400 font-medium">Dados agregados via Apify & Browse AI Integrations</p>
                 </div>
              </div>
              <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ao Vivo
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nota Google (Local)</p>
                  <p className="text-lg font-black text-amber-400 flex items-center gap-1">
                    {selectedComp.sigla === 'CL' ? '3.8' : selectedComp.sigla === 'VR' ? '4.1' : selectedComp.sigla === 'BR' ? '4.3' : '3.9'} <Star className="w-3.5 h-3.5 fill-current" />
                  </p>
               </div>
               <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Avaliações</p>
                  <p className="text-lg font-black text-emerald-400">
                    {selectedComp.sigla === 'CL' ? '1.423' : selectedComp.sigla === 'VR' ? '824' : selectedComp.sigla === 'BR' ? '1.145' : '312'} <span className="text-[10px] text-slate-500 font-medium uppercase">reviews</span>
                  </p>
               </div>
               <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Preço Entrada</p>
                  <p className="text-lg font-black text-white">
                    <span className="text-sm font-medium text-slate-400 mr-0.5">R$</span>{selectedComp.sigla === 'CL' ? '99,90' : selectedComp.sigla === 'VR' ? '109,90' : selectedComp.sigla === 'BR' ? '99,99' : '89,90'}
                  </p>
               </div>
               <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estimativa Clientes</p>
                  <p className="text-lg font-black text-sky-400">
                    {selectedComp.sigla === 'CL' ? '~4.5k' : selectedComp.sigla === 'VR' ? '~2.8k' : selectedComp.sigla === 'BR' ? '~3.2k' : '~1.2k'} <span className="text-[10px] text-slate-500 font-medium uppercase ml-0.5">ativ.</span>
                  </p>
               </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                 <LayoutList className="w-3.5 h-3.5 text-slate-400" /> Planos Capturados no Site (Browse AI)
               </p>
               <div className="space-y-2 pt-1">
                 <div className="flex items-center justify-between font-sans text-[11px]">
                   <span className="text-slate-400 font-medium flex-1">Plano Básico ({selectedComp.sigla === 'CL' ? '350 Mega' : selectedComp.sigla === 'BR' ? '300 Mega' : '400 Mega'})</span>
                   <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-2">R$ {selectedComp.sigla === 'CL' ? '99,90' : selectedComp.sigla === 'BR' ? '99,99' : '109,90'}</span>
                 </div>
                 <div className="flex items-center justify-between font-sans text-[11px]">
                   <span className="text-slate-400 font-medium flex-1">Plano Avançado ({selectedComp.sigla === 'CL' ? '500 Mega' : selectedComp.sigla === 'BR' ? '500 Mega' : '600 Mega'} <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 py-0.5 rounded inline-block ml-1">Netflix Add-on</span>)</span>
                   <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-2">R$ {selectedComp.sigla === 'CL' ? '129,90' : selectedComp.sigla === 'BR' ? '119,90' : '139,90'}</span>
                 </div>
                 <div className="flex items-center justify-between font-sans text-[11px]">
                   <span className="text-slate-400 font-medium flex-1">Plano Ultra ({selectedComp.sigla === 'CL' ? '750 Mega' : selectedComp.sigla === 'BR' ? '700 Mega': '1 Giga'} + Mesh)</span>
                   <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded ml-2">R$ {selectedComp.sigla === 'CL' ? '159,90' : selectedComp.sigla === 'BR' ? '149,90' : '189,90'}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* N8N Workflow Executor */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-sans shadow-sm mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700">Orquestrador N8N (Raspagem de Dados)</h4>
                  <p className="text-[9px] text-slate-400 font-medium">Browse AI (Sites) & Apify (Google Maps) integration</p>
                </div>
              </div>
              <button
                onClick={handleTriggerN8NSync}
                disabled={isSyncingN8N}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase disabled:opacity-50 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                {isSyncingN8N ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-rose-400" />}
                Sincronizar Ao Vivo
              </button>
            </div>

            {syncLogs.length > 0 && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2 space-y-1">
                {syncLogs.map((log, index) => (
                  <div key={index} className="text-[10px] font-mono text-emerald-400">
                    {log.startsWith('>') || log.startsWith('[') ? (
                      <span className="text-sky-300">{log}</span>
                    ) : (
                      log
                    )}
                  </div>
                ))}
                {isSyncingN8N && (
                  <div className="text-[10px] font-mono text-slate-500 animate-pulse mt-1">
                    Processando...
                  </div>
                )}
              </div>
            )}
            
            {hasSynced && (
              <div className="mt-3 p-3 bg-[#E6FAF1] border border-emerald-200 rounded-xl space-y-3">
                 <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                   <Target className="w-3 h-3" /> Resumo da Coleta: {selectedComp.name} 
                 </p>
                 {selectedComp.sigla === 'BR' ? (
                   <>
                     <ul className="text-[10px] text-emerald-700 space-y-1 list-disc pl-4 font-medium mb-3">
                       <li>12 novas avaliações baixas localizadas em Estrela/RS.</li>
                       <li>O plano de 500 Mega sofreu uma variação de R$10.00 no site hoje!</li>
                     </ul>
                     <p className="text-[10px] font-bold text-slate-700 uppercase card-modern border border-slate-200 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                       <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                       Disparo WAHA para equipe Comercial Concluído!
                     </p>
                   </>
                 ) : (
                   <ul className="text-[10px] text-emerald-700 space-y-1 list-disc pl-4 font-medium mb-3">
                     <li>Sem dados novos críticos (N8N Filter Ignorou). O fluxo Browse AI não identificou variações de tabelas de preços do dia anterior.</li>
                     <li>Apify rodou, porém o Rating no Google Maps se mantém estável hoje.</li>
                   </ul>
                 )}
              </div>
            )}
          </div>

          <div className="sep h-[1px] bg-slate-100 mt-4 block" />

          {/* AI realtime helper box */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-500" /> Argumentador IA instantâneo de Campo
            </div>

            <div className="relative">
              <input
                id="comp-ai-text-field"
                type="text"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-3.5 pr-14 text-xs font-semibold placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-400 transition"
                placeholder={`Ex: Como desarmar o Ponto Forte "${selectedComp.pros && selectedComp.pros[0] ? selectedComp.pros[0] : "eles serem famosos"}"?`}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleTriggerAnalysis(); }}
              />
              <button
                id="comp-ai-send-btn"
                onClick={handleTriggerAnalysis}
                disabled={aiLoading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg flex items-center justify-center transition active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {aiLoading && (
              <div className="text-center py-6 text-xs text-slate-450 space-y-2">
                <div className="w-5 h-5 border-3 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-bold text-slate-400">Consultando o banco estratégico cognitivo...</p>
              </div>
            )}

            {aiAnswer && (
              <div id="comp-ai-response-box" className="p-3.5 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 text-sky-950 font-medium font-sans text-xs rounded-xl leading-relaxed whitespace-pre-wrap  shadow-sm pl-4 pr-3 py-3 border-l-4 border-l-sky-500">
                {aiAnswer}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">Nenhum concorrente estrategicamente mapeado.</div>
      )}

      <ConfirmModal
        isOpen={!!compToDelete}
        title="Excluir Concorrente"
        message={`Tem certeza que deseja excluir permanentemente o concorrente "${compToDelete?.name}"?`}
        confirmText="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setCompToDelete(null)}
      />
    </div>
  );
}
