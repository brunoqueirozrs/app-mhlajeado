/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lightbulb, Plus, Trash2, CheckCircle2, Circle, ArrowUpRight, CheckSquare, Target, Zap } from "lucide-react";

interface KaizenItem {
  id: string;
  title: string;
  description: string;
  status: "pendente" | "em_andamento" | "concluido";
  impact: "baixo" | "medio" | "alto";
  author: string;
  date: string;
}

interface Props {
  loggedUser: string;
}

export default function KaizenPage({ loggedUser }: Props) {
  const [items, setItems] = useState<KaizenItem[]>(() => {
    try {
      const saved = localStorage.getItem("mhnet_kaizen_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImpact, setNewImpact] = useState<"baixo" | "medio" | "alto">("medio");

  useEffect(() => {
    localStorage.setItem("mhnet_kaizen_items", JSON.stringify(items));
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: KaizenItem = {
      id: String(Date.now()),
      title: newTitle.trim(),
      description: newDesc.trim(),
      status: "pendente",
      impact: newImpact,
      author: loggedUser,
      date: new Date().toISOString().split("T")[0],
    };

    setItems([newItem, ...items]);
    setNewTitle("");
    setNewDesc("");
    setNewImpact("medio");
    setIsAdding(false);
  };

  const handleToggleStatus = (id: string, currentStatus: "pendente" | "em_andamento" | "concluido") => {
    setItems(items.map(item => {
      if (item.id === id) {
        let nextStatus: "pendente" | "em_andamento" | "concluido" = "pendente";
        if (currentStatus === "pendente") nextStatus = "em_andamento";
        if (currentStatus === "em_andamento") nextStatus = "concluido";
        if (currentStatus === "concluido") nextStatus = "pendente";
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "alto": return "bg-rose-100 text-rose-800 border-rose-200";
      case "medio": return "bg-amber-100 text-amber-800 border-amber-200";
      case "baixo": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "text-[#00A86B] bg-[#E6FAF1] border-emerald-200";
      case "em_andamento": return "text-amber-500 bg-amber-50 border-amber-200";
      case "pendente": return "text-slate-400 bg-slate-50 border-slate-200";
      default: return "text-slate-400 bg-slate-50 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido": return <CheckCircle2 className="w-5 h-5 text-[#00A86B]" />;
      case "em_andamento": return <ArrowUpRight className="w-5 h-5 text-amber-500" />;
      case "pendente": return <Circle className="w-5 h-5 text-slate-400" />;
      default: return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8 ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-[24px] p-6 shadow-xl relative overflow-hidden">
        {/* Abstract background decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-900/50">
            <Zap className="w-7 h-7 text-white fill-white/20" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Kaizen / Kaikaku
            </h1>
            <p className="text-sm font-bold text-sky-200 tracking-wide mt-1 max-w-md leading-snug">
              Melhoria contínua e inovação radical. Sugira ideias, aponte problemas operacionais e acompanhe as soluções.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="relative z-10 self-start md:self-center shrink-0 flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-4 py-3 font-bold text-sm transition shadow-lg shadow-sky-500/20 active:scale-95"
        >
          {isAdding ? "Cancelar" : <><Plus className="w-5 h-5" /> Nova Ideia</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddItem} className="card-modern border border-slate-200 rounded-2xl p-6 shadow-sm ">
          <h2 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Sugerir Melhoria (Kaizen)
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Título / Problema</label>
              <input
                type="text"
                
                placeholder="Ex: Novo roteiro de abordagem"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Descrição / Solução Proposta</label>
              <textarea
                
                placeholder="Detalhes de como implementar e por que isso ajuda..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 outline-none transition min-h-[100px] resize-y"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Impacto Estimado</label>
              <div className="flex flex-wrap gap-3">
                {(["baixo", "medio", "alto"] as const).map((imp) => (
                  <label key={imp} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 cursor-pointer transition ${newImpact === imp ? 'border-sky-500 bg-sky-50 text-sky-800 font-bold' : 'border-slate-200 bg-white text-slate-500 font-semibold hover:border-sky-200 hover:bg-sky-50/50'}`}>
                    <input
                      type="radio"
                      name="impact"
                      className="hidden"
                      checked={newImpact === imp}
                      onChange={() => setNewImpact(imp)}
                    />
                    <Target className={`w-4 h-4 ${newImpact === imp ? 'text-sky-500' : 'text-slate-400'}`} />
                    <span className="capitalize">{imp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition active:scale-95"
              >
                Salvar Sugestão
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card-modern border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">Nenhuma sugestão ainda</h3>
            <p className="text-sm font-medium text-slate-400">Ajude a melhorar nossos processos. Sugira a primeira ideia!</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="card-modern border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center shadow-sm -md transition group">
              <button 
                onClick={() => handleToggleStatus(item.id, item.status)}
                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition ${getStatusColor(item.status)}`}
                title="Alterar Status"
              >
                {getStatusIcon(item.status)}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className={`font-bold text-base truncate ${item.status === "concluido" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {item.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getImpactColor(item.impact)}`}>
                    Impacto {item.impact}
                  </span>
                </div>
                <p className={`text-sm line-clamp-2 leading-relaxed ${item.status === "concluido" ? "text-slate-400" : "text-slate-600"}`}>
                  {item.description}
                </p>
                <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">👤</span>
                    {item.author}
                  </span>
                  <span>•</span>
                  <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>
                  <span>•</span>
                  <span className={`capitalize ${
                    item.status === "concluido" ? "text-[#00A86B]" : 
                    item.status === "em_andamento" ? "text-amber-500" : "text-slate-400"
                  }`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="shrink-0 self-end md:self-center p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition md:opacity-0 md:group-hover:opacity-100"
                title="Excluir"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
