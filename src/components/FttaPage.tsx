/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Building2, MapPin, User, Phone, CheckCircle, Navigation,
  RotateCw, Plus, Edit, PlusCircle, Trash, Star, Search, AlertCircle, Sparkles, ChevronDown, ChevronUp, Save
} from "lucide-react";
import { FttaItem, FttaProspeccao } from "../types";

interface FttaPageProps {
  sites: FttaItem[];
  prospecs: FttaProspeccao[];
  isAdmin: boolean;
  loggedUser: string;
  onRegisterFttaSite: (ftItem: Partial<FttaItem>) => Promise<void>;
  onRegisterFttaProsp: (prosp: Omit<FttaProspeccao, "_linha">) => Promise<void>;
  initialTab?: "lajeado" | "estrela" | "prospeccao";
  onSyncFtta?: () => Promise<void>;
}

import { FttaSiteCard } from "./FttaSiteCard";
import { BAIRROS_LAJEADO, BAIRROS_ESTRELA } from "../data";

export default function FttaPage({
  sites,
  prospecs,
  isAdmin,
  loggedUser,
  onRegisterFttaSite,
  onRegisterFttaProsp,
  initialTab,
  onSyncFtta
}: FttaPageProps) {
  const [activeTab, setActiveTab2] = useState<"lajeado" | "estrela" | "prospeccao">(initialTab || "lajeado");
  const [syncingLocal, setSyncingLocal] = useState(false);
  const [expandedSiteId, setExpandedSiteId] = useState<number | null>(null);

  // Filter keys
  const [searchTerm, setSearchTerm] = useState("");

  // Create modes
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [isAddingProspec, setIsAddingProspec] = useState(false);

  // Form states - site
  const [siteNome, setSiteNome] = useState("");
  const [siteSindico, setSiteSindico] = useState("");
  const [siteContato, setSiteContato] = useState("");
  const [siteEndereco, setSiteEndereco] = useState("");
  const [siteBairro, setSiteBairro] = useState("");
  const [siteCidade, setSiteCidade] = useState("Lajeado");
  const [siteVendedor, setSiteVendedor] = useState(loggedUser);

  // Form states - prospec
  const [prospNome, setProspNome] = useState("");
  const [prospBairro, setProspBairro] = useState("");
  const [prospTelefone, setProspTelefone] = useState("");
  const [prospObs, setProspObs] = useState("");

  const handleSyncFttaClick = async () => {
    if (!onSyncFtta) return;
    setSyncingLocal(true);
    try {
      await onSyncFtta();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingLocal(false);
    }
  };

  const handleSaveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteNome.trim() || !siteEndereco.trim()) {
      alert("⚠️ Preencha o nome do condomínio/bloco e endereço.");
      return;
    }
    const payload: Omit<FttaItem, "_linha"> = {
      nomeBloco: siteNome,
      sindico: siteSindico || undefined,
      contato: siteContato || undefined,
      endereco: siteEndereco || undefined,
      bairro: siteBairro || undefined,
      cidade: activeTab === "lajeado" ? "Lajeado" : "Estrela"
    };
    try {
      await onRegisterFttaSite(payload);
      setIsAddingSite(false);
      setSiteNome("");
      setSiteSindico("");
      setSiteContato("");
      setSiteEndereco("");
      setSiteBairro("");
      alert("✅ Edifício cadastrado com sucesso!");
    } catch (err) {}
  };

  const handleSaveProspec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospNome.trim()) {
      alert("⚠️ Preencha pelo menos o nome.");
      return;
    }
    const payload: Omit<FttaProspeccao, "_linha"> = {
      nome: prospNome,
      bairro: prospBairro || undefined,
      contato: prospTelefone || undefined,
      sindico: prospObs || undefined,
      consultor: loggedUser,
      cidade: "Lajeado",
      adquado: "Verificando"
    };
    try {
      await onRegisterFttaProsp(payload);
      setIsAddingProspec(false);
      setProspNome("");
      setProspBairro("");
      setProspTelefone("");
      setProspObs("");
      alert("✅ Prospecção predial registrada!");
    } catch (err) {}
  };

  // Filter items based on active city and search query
  const filteredSites = sites.filter(s => {
    const isCity = activeTab === "lajeado" ? s.cidade?.toLowerCase()?.includes("lajeado") : s.cidade?.toLowerCase()?.includes("estrela");
    if (!isCity) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        String(s.nomeBloco || "").toLowerCase().includes(q) ||
        String(s.bairro || "").toLowerCase().includes(q) ||
        String(s.endereco || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProspecs = prospecs.filter(p => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        String(p.nome || "").toLowerCase().includes(q) ||
        String(p.bairro || "").toLowerCase().includes(q) ||
        String(p.sindico || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="ftta-viewport" className="space-y-4">
      {/* Title Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-extrabold text-slate-805 tracking-tight flex items-center gap-1.5 leading-none">
            <Building2 className="w-5 h-5 text-sky-90" />
            Condomínios FTTA
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold pl-0.5">Mapeamento predial de Lajeado e Estrela</p>
        </div>
        {onSyncFtta && (
          <button
            onClick={handleSyncFttaClick}
            disabled={syncingLocal}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-900 border border-sky-950 text-white rounded-lg text-xs font-bold hover:bg-sky-800 hover:border-sky-900 transition shadow-sm cursor-pointer disabled:opacity-50 select-none"
            title="Importar e atualizar dados das abas de FTTA diretamente do Google Sheets"
          >
            <RotateCw className={`w-3.5 h-3.5 ${syncingLocal ? "animate-spin" : ""}`} />
            <span>{syncingLocal ? "Sincronizando..." : "Sincronizar Planilha"}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 card-modern border border-slate-100 rounded-xl p-1.5 shadow-sm font-sans select-none">
        <button
          onClick={() => { setActiveTab2("lajeado"); setSearchTerm(""); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition ${
            activeTab === "lajeado" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          🌳 Lajeado
        </button>
        <button
          onClick={() => { setActiveTab2("estrela"); setSearchTerm(""); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition ${
            activeTab === "estrela" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          ⭐ Estrela
        </button>
        <button
          onClick={() => { setActiveTab2("prospeccao"); setSearchTerm(""); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition ${
            activeTab === "prospeccao" ? "bg-sky-900 text-white" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          🔍 Prospecções
        </button>
      </div>

      {/* Searchbar */}
      <div className="relative select-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="ftta-search-box"
          type="text"
          className="w-full card-modern border border-slate-150 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400"
          placeholder={activeTab === "prospeccao" ? "Mapear por bairro, observação..." : "Filtrar por edifício, rua, bairro..."}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Adding buttons depending on tabs */}
      {activeTab !== "prospeccao" ? (
        !isAddingSite ? (
          <button
            onClick={() => setIsAddingSite(true)}
            className="w-full py-2 bg-sky-50 border border-sky-100 rounded-xl text-xs font-bold text-sky-850 cursor-pointer active:scale-98 transition flex items-center justify-center gap-1.5 shadow-sm select-none"
          >
            <PlusCircle className="w-4 h-4" /> Cadastrar Novo Edifício em {activeTab === "lajeado" ? "Lajeado" : "Estrela"}
          </button>
        ) : (
          <form onSubmit={handleSaveSite} className="card-modern border border-slate-100 rounded-2xl p-4 space-y-4 shadow-sm  font-sans">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase pl-0.5">Novo Condomínio</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Nome do Edifício / Bloco</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 font-semibold"
                  placeholder="Ex: Condomínio das Acácias"
                  value={siteNome}
                  onChange={e => setSiteNome(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Síndico Responsável</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3"
                    placeholder="Ex: Jorge Silva"
                    value={siteSindico}
                    onChange={e => setSiteSindico(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Contato Síndico (Celular)</label>
                  <input
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3"
                    placeholder="Ex: 51 98888-0001"
                    value={siteContato}
                    onChange={e => setSiteContato(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Endereço (Rua, n°)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3"
                    placeholder="Ex: Avenida Benjamin Constant, 1250"
                    value={siteEndereco}
                    onChange={e => setSiteEndereco(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Bairro</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3"
                    value={siteBairro}
                    onChange={e => setSiteBairro(e.target.value)}
                  >
                    <option value="">Selecione o Bairro</option>
                    {(activeTab === "lajeado" ? BAIRROS_LAJEADO : BAIRROS_ESTRELA).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAddingSite(false)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 font-extrabold rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-900 text-white hover:bg-sky-950 font-extrabold rounded-lg text-xs"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        )
      ) : (
        !isAddingProspec ? (
          <button
            onClick={() => setIsAddingProspec(true)}
            className="w-full py-2 bg-sky-50 border border-sky-100 rounded-xl text-xs font-bold text-sky-850 cursor-pointer active:scale-98 transition flex items-center justify-center gap-1.5 shadow-sm select-none"
          >
            <PlusCircle className="w-4 h-4" /> Solicitar Estudo de Viabilidade Predial
          </button>
        ) : (
          <form onSubmit={handleSaveProspec} className="card-modern border border-slate-100 rounded-2xl p-4 space-y-4 shadow-sm  font-sans">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase pl-0.5">Nova Prospecção do Field</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Edifício / Projeto Prospectado</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 font-semibold"
                  placeholder="Ex: Edifício São Cristóvão Residence"
                  value={prospNome}
                  onChange={e => setProspNome(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Bairro</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3"
                    value={prospBairro}
                    onChange={e => setProspBairro(e.target.value)}
                  >
                    <option value="">Selecione o Bairro</option>
                    {/* Combine Lajeado and Estrela for prospeccao since it spans both */}
                    {[...BAIRROS_LAJEADO, ...BAIRROS_ESTRELA].sort().map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Fone Síndico / Contato</label>
                  <input
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3"
                    placeholder="Ex: 51 99999-7750"
                    value={prospTelefone}
                    onChange={e => setProspTelefone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Observações de Viabilidade / Quantidade Apartamentos</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3"
                  rows={2}
                  placeholder="Ex: Prédio novo com 12 apartamentos, construtora entregando semana que vem..."
                  value={prospObs}
                  onChange={e => setProspObs(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAddingProspec(false)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 font-extrabold rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-900 text-white hover:bg-sky-950 font-extrabold rounded-lg text-xs"
              >
                Enviar Estudo
              </button>
            </div>
          </form>
        )
      )}

      {/* List panel */}
      <div id="ftta-list-container" className="space-y-2.5 pb-10">
        {activeTab !== "prospeccao" ? (
          filteredSites.length > 0 ? (
            filteredSites.map(s => (
              <FttaSiteCard
                key={s._linha}
                s={s}
                isExpanded={expandedSiteId === s._linha}
                onToggleExpand={() => setExpandedSiteId(expandedSiteId === s._linha ? null : s._linha)}
                onUpdate={onRegisterFttaSite}
              />
            ))
          ) : (
            <div className="text-center py-20 card-modern rounded-2xl border border-slate-50 shadow-sm text-slate-400 font-sans">
              <Building2 className="w-10 h-10 mx-auto opacity-20 text-slate-400 mb-1" />
              <p className="text-xs font-bold uppercase tracking-wider">Nenhum condomínio mapeado</p>
              <p className="text-[9px] text-slate-350">Cadastre um acima ou altere a busca.</p>
            </div>
          )
        ) : (
          filteredProspecs.length > 0 ? (
            filteredProspecs.map(p => {
              const prov = p.adquado || "Verificando";
              return (
                <div key={p._linha} className="card-modern border border-slate-300 rounded-2xl p-4 space-y-3 shadow-md select-none font-sans  -xl hover:border-slate-400 transition duration-200">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-xs. leading-tight">{p.nome}</h3>
                      <p className="text-[10px] text-slate-600 font-extrabold uppercase mt-1 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" /> Bairro: {p.bairro || "Centro"} · Lajeado
                      </p>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                      prov === "Aprovado" ? "bg-[#E6FAF1] text-emerald-800 border-emerald-300" : prov === "Inviável" ? "bg-rose-50 text-rose-800 border-rose-300" : "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                    }`}>
                      {prov}
                    </span>
                  </div>

                  {p.sindico && (
                    <p className="text-[11px] text-slate-700 italic bg-slate-50 p-2 rounded-lg leading-relaxed font-medium">
                      "{p.sindico}"
                    </p>
                  )}

                  <div className="text-[10px] text-slate-600 font-black uppercase flex justify-between">
                    <span>Mapeado por: {p.consultor || "Field Agent"}</span>
                    {p.contato && <span>📞 Fone: {p.contato}</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 card-modern rounded-2xl border border-slate-50 shadow-sm text-slate-400 font-sans">
              <Building2 className="w-10 h-10 mx-auto opacity-20 text-slate-400 mb-1" />
              <p className="text-xs font-bold uppercase tracking-wider">Nenhuma solicitação de viabilidade</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
