import React, { useState } from "react";
import { FttaItem } from "../types";
import { Building2, MapPin, Phone, Navigation, ChevronDown, ChevronUp, Save } from "lucide-react";

interface Props {
  s: FttaItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (data: Partial<FttaItem>) => Promise<void>;
}

export function FttaSiteCard({ s, isExpanded, onToggleExpand, onUpdate }: Props) {
  const foneClean = String(s.contato || "").replace(/\D/g, "");
  const mapsQuery = encodeURIComponent(`${s.endereco}, ${s.bairro}, ${s.cidade}`);
  
  const [administradora, setAdministradora] = useState(s.administradora || "");
  const [fotoFachada, setFotoFachada] = useState(s.fotoFachada || "");
  const [ultimaVisita, setUltimaVisita] = useState(s.ultimaVisita || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    await onUpdate({
      _linha: s._linha,
      administradora,
      fotoFachada,
      ultimaVisita
    });
    setIsSaving(false);
  };

  return (
    <div className="card-modern border border-slate-300 rounded-2xl p-4 space-y-3 shadow-md select-none font-sans -xl hover:border-slate-400 transition duration-200">
      <div 
        className="flex justify-between items-start gap-3 cursor-pointer" 
        onClick={onToggleExpand}
      >
        <div className="flex-1">
          <h3 className="font-extrabold text-slate-900 text-xs leading-tight">{s.nomeBloco}</h3>
          <p className="text-[10px] text-slate-600 font-extrabold uppercase mt-1 flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-slate-500" /> {s.endereco} · {s.bairro || "Florestal"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase text-slate-700 bg-slate-50 border px-1.5 py-0.5 rounded-lg border-slate-300">
            🏢 FTTA ATIVO
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10.5px] font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
        <div>👤 Síndico: <strong className="text-slate-800 font-extrabold">{s.sindico || "Não informado"}</strong></div>
        <div>📞 Fone: <strong className="text-slate-800 font-extrabold">{s.contato || "Não informado"}</strong></div>
        {s.administradora && <div className="col-span-2">🏢 Admin: <strong className="text-slate-800 font-extrabold">{s.administradora}</strong></div>}
        {s.ultimaVisita && <div className="col-span-2">📅 Últ. Visita: <strong className="text-slate-800 font-extrabold">{s.ultimaVisita.split("-").reverse().join("-")}</strong></div>}
      </div>

      <div className="flex gap-2 pt-0.5">
        {foneClean && (
          <button
            onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${foneClean}`, "_blank"); }}
            className="flex-1 py-1 px-2.5 bg-[#E6FAF1] text-emerald-700 border border-[#00A86B]/20 hover:bg-emerald-100 font-bold text-[10px] rounded-lg active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer select-none"
          >
            <Phone className="w-3.5 h-3.5 text-[#00A86B]" /> WhatsApp Síndico
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); window.open(`https://maps.google.com/?q=${mapsQuery}`, "_blank"); }}
          className="flex-1 py-1 px-2.5 bg-sky-50 text-sky-850 border border-sky-100 hover:bg-sky-100 font-bold text-[10px] rounded-lg active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer select-none"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-700" /> Direções
        </button>
      </div>

      {isExpanded && (
        <div className="pt-3 border-t border-slate-200 mt-2 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Administradora</label>
            <input 
              type="text" 
              className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50"
              placeholder="Nome da administradora..."
              value={administradora}
              onChange={e => setAdministradora(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Foto da Fachada (Link do Drive ou URL)</label>
            <input 
              type="text" 
              className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50"
              placeholder="Cole aqui o link da imagem..."
              value={fotoFachada}
              onChange={e => setFotoFachada(e.target.value)}
            />
            {fotoFachada && (
              <a href={fotoFachada} target="_blank" rel="noreferrer" className="text-[10px] text-sky-600 underline mt-1 inline-block">
                Visualizar Foto
              </a>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Última Visita</label>
            <input 
              type="date" 
              className="w-full text-xs p-1.5 border border-slate-200 rounded-md bg-slate-50"
              value={ultimaVisita}
              onChange={e => setUltimaVisita(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-1">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-sky-700 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> {isSaving ? "Salvando..." : "Salvar Detalhes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
