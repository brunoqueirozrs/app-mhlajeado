/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Crosshair, MapPin, Sparkles, User, Smartphone, Tag, FileText, Save, X, Lightbulb
} from "lucide-react";
import { Lead } from "../types";

interface LeadFormProps {
  editingLead: Lead | null;
  onSaveLead: (payload: any) => Promise<void>;
  onCancel: () => void;
  onGenerateAIObs: (nome: string, bairro: string, plano: string, valor: string, provedor: string) => Promise<string>;
}

import { BAIRROS_LAJEADO, BAIRROS_ESTRELA } from "../data";

export default function LeadForm({
  editingLead,
  onSaveLead,
  onCancel,
  onGenerateAIObs
}: LeadFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setPhone] = useState("");
  
  // Location
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("Lajeado");
  const [gpsLoading, setGpsLoading] = useState(false);

  // Marketing
  const [provedor, setProvedor] = useState("");
  const [valorPlano, setValorPlano] = useState("");
  const [planoAtual, setPlanoAtual] = useState("");
  const [fidelidade, setFidelidade] = useState("");
  const [interesse, setInteresse] = useState<"Alto" | "Médio" | "Baixo">("Médio");
  const [status, setStatus] = useState<any>("Novo");
  const [obs, setObs] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (editingLead) {
      setNome(editingLead.nomeLead || "");
      setPhone(editingLead.telefone || "");
      setEndereco(editingLead.endereco || "");
      setNumero(editingLead.numero || "");
      setComplemento(editingLead.complemento || "");
      setBairro(editingLead.bairro || "");
      setCidade(editingLead.cidade || "Lajeado");
      setProvedor(editingLead.provedor || "");
      setValorPlano(editingLead.valorPlano ? String(editingLead.valorPlano) : "");
      setPlanoAtual(editingLead.planoAtual || "");
      setFidelidade(editingLead.fidelidade || "");
      setInteresse(editingLead.interesse || "Médio");
      setStatus(editingLead.status || "Novo");
      setObs(editingLead.observacao || "");
    } else {
      setNome("");
      setPhone("");
      setEndereco("");
      setNumero("");
      setComplemento("");
      setBairro("");
      setCidade("Lajeado");
      setProvedor("");
      setValorPlano("");
      setPlanoAtual("");
      setFidelidade("");
      setInteresse("Médio");
      setStatus("Novo");
      setObs("");
    }
  }, [editingLead]);

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("⚠️ GPS indisponível no navegador.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error("Reverse geocode failed");
          const data = await res.json();
          
          if (data && data.address) {
            const add = data.address;
            setEndereco(add.road || add.pedestrian || add.suburb || "");
            setBairro(add.suburb || add.neighbourhood || add.quarter || "");
            setCidade(add.city || add.town || add.village || "Lajeado");
            alert("✅ Endereço preenchido com base na sua localização atual!");
          }
        } catch (e) {
          alert("⚠️ Ops, erro ao converter coordenadas de GPS em endereço.");
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        alert("⚠️ Permissão de localização GPS recusada ou sem sinal.");
      },
      { timeout: 7000 }
    );
  };

  const handleAIGenerate = async () => {
    if (!nome.trim()) {
      alert("⚠️ Digite pelo menos o nome do cliente antes de gerar o argumento!");
      return;
    }
    setAiLoading(true);
    try {
      const resp = await onGenerateAIObs(nome, bairro, planoAtual, valorPlano, provedor);
      setObs(resp);
    } catch (e: any) {
      alert("Falha ao se comunicar com a IA. Digite manualmente.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Coloque o nome do cliente!");
      return;
    }

    const payload = {
      _linha: editingLead?._linha,
      nomeLead: nome,
      telefone,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      provedor,
      valorPlano,
      planoAtual,
      fidelidade,
      interesse,
      status,
      observacao: obs
    };

    onSaveLead(payload);
  };

  return (
    <div id="leadform-viewport" className="space-y-4">
      {/* Page Title */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="p-1 px-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 card-modern border border-slate-100 rounded-lg flex items-center gap-1 active:scale-95 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <h2 className="text-sm font-black uppercase text-slate-805 tracking-tight pl-1">
          {editingLead ? `Editar: ${editingLead.nomeLead}` : "Novo Lead de Venda"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Core name data box */}
        <div className="card-modern border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-sm font-sans">
          <div className="text-[10px] font-black uppercase tracking-wider text-sky-950 flex items-center gap-1">
            <User className="w-4 h-4 text-sky-90" /> Dados Básicos do Cidadão
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-0.5">Nome Completo</label>
            <input
              id="form-nome"
              type="text"
              
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
              placeholder="Ex: Pedro de Souza"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-0.5">WhatsApp / Celular com DDD</label>
            <input
              id="form-whats"
              type="tel"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
              placeholder="Ex: 51 98888-7777"
              value={telefone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Location box */}
        <div className="card-modern border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-sm font-sans">
          <div className="text-[10px] font-black uppercase tracking-wider text-sky-950 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-sky-90" /> Dados de Localização e Endereço
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-0.5">Endereço (Rua)</label>
            <input
              id="form-street"
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
              placeholder="Nome da rua de campo..."
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Número</label>
              <input
                id="form-num"
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
                placeholder="Ex: 275"
                value={numero}
                onChange={e => setNumero(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Complemento</label>
              <input
                id="form-compl"
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
                placeholder="Ex: Ap 302"
                value={complemento}
                onChange={e => setComplemento(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs ">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Cidade</label>
              <select
                id="form-city"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold text-sky-950 cursor-pointer"
                value={cidade}
                onChange={e => {
                  setCidade(e.target.value);
                  setBairro(""); // reset bairro when city changes
                }}
              >
                <option value="Lajeado">Lajeado</option>
                <option value="Estrela">Estrela</option>
                
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Bairro</label>
              {cidade === "Lajeado" || cidade === "Estrela" ? (
                <select
                  id="form-bairro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
                  value={bairro}
                  onChange={e => setBairro(e.target.value)}
                >
                  <option value="">Selecione o Bairro</option>
                  {(cidade === "Lajeado" ? BAIRROS_LAJEADO : BAIRROS_ESTRELA).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="form-bairro"
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
                  placeholder="Ex: Universitário"
                  value={bairro}
                  onChange={e => setBairro(e.target.value)}
                />
              )}
            </div>
          </div>

          <button
            id="form-gps-btn"
            type="button"
            disabled={gpsLoading}
            onClick={handleGPSLocation}
            className="w-full h-10 border border-dashed border-slate-250 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-505 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition"
          >
            <Crosshair className={`w-4 h-4 text-sky-900 ${gpsLoading ? "animate-spin" : ""}`} />
            {gpsLoading ? "Lendo coordenadas satélite..." : "Preencher atual com GPS portador"}
          </button>
        </div>

        {/* qualification box */}
        <div className="card-modern border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-sm font-sans">
          <div className="text-[10px] font-black uppercase tracking-wider text-sky-950 flex items-center gap-1">
            <Tag className="w-4 h-4 text-sky-90" /> Qualificação & Auditoria
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-[10px] font-extrabold uppercase text-slate-400">Provedor que utiliza na casa atualmente</label>
            <input
              id="form-provider"
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
              placeholder="Ex: Vero, Claro, Oi, Net..."
              value={provedor}
              onChange={e => setProvedor(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Plano Contratado</label>
              <input
                id="form-prev-plano"
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
                placeholder="Ex: 300Mb"
                value={planoAtual}
                onChange={e => setPlanoAtual(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Valor Pago (R$)</label>
              <input
                id="form-prev-val"
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
                placeholder="Ex: 99.90"
                value={valorPlano}
                onChange={e => setValorPlano(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-400">Término de Fidelidade oposta</label>
            <input
              id="form-prev-fidel"
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700"
              value={fidelidade}
              onChange={e => setFidelidade(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Termômetro Interesse</label>
              <select
                id="form-interesse"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs font-extrabold"
                value={interesse}
                onChange={e => setInteresse(e.target.value as any)}
              >
                <option value="Alto">🔥 Alto</option>
                <option value="Médio">😐 Médio</option>
                <option value="Baixo">❄️ Baixo</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Status Funil inicial</label>
              <select
                id="form-status"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs font-extrabold"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
              >
                <option value="Novo">Novo</option>
                <option value="Agendado">Agendado</option>
                <option value="Negociação">Negociação</option>
                <option value="Venda Fechada">Venda Fechada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes with AI button */}
        <div className="card-modern border border-slate-100 rounded-2xl p-4 space-y-3.5 shadow-sm font-sans text-xs leading-relaxed">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-sky-950">
            <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-sky-90" /> Observações e Abordagem</span>
            <button
              id="form-generate-obs-ai"
              type="button"
              disabled={aiLoading}
              onClick={handleAIGenerate}
              className="text-[9px] font-black uppercase tracking-wide text-sky-700 bg-sky-50 border border-sky-150 px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition disabled:opacity-40 animate-pulse-light select-none"
            >
              <Sparkles className="w-3 h-3 text-sky-500" /> Redigir c/ IA
            </button>
          </div>

          {aiLoading && (
            <div className="text-center py-4 text-[10px] text-slate-400 space-y-1">
              <div className="w-4 h-4 border-2 border-slate-150 border-t-sky-500 rounded-full animate-spin mx-auto" />
              <p>Formatando pitch persuasivo...</p>
            </div>
          )}

          <div className="space-y-1">
            <textarea
              id="form-obs-textarea"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white"
              rows={3}
              placeholder="Digite observações adicionais sobre o renegociado cliente..."
              value={obs}
              onChange={e => setObs(e.target.value)}
            />
          </div>
        </div>

        {/* Buttons submission toolbar */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            id="form-cancel-btn"
            type="button"
            onClick={onCancel}
            className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-650 font-extrabold text-xs rounded-xl active:scale-97 select-none cursor-pointer transition"
          >
            Cancelar
          </button>
          <button
            id="form-submit-btn"
            type="submit"
            className="w-full py-3 bg-sky-900 hover:bg-sky-950 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-97 transition shadow cursor-pointer"
          >
            <Save className="w-4 h-4 text-white" />
            Salvar Lead
          </button>
        </div>
      </form>
    </div>
  );
}
