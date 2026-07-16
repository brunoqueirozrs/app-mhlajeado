/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldAlert, Cpu, Sparkles, UserX, Lightbulb, UserCheck } from "lucide-react";

interface ObjectionsPageProps {
  onCombatObjection: (objection: string) => Promise<string>;
}

export default function ObjectionsPage({
  onCombatObjection
}: ObjectionsPageProps) {
  const [objection, setObjection] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Common quick objection pills
  const SUGGESTED_OBJECTIONS = [
    "Já tenho internet de outra marca e estou satisfeito.",
    "Achei o valor da MHNET muito caro comparando com a Vero.",
    "Não quero fidelidade de 12 meses de jeito nenhum.",
    "Vocês demoram pra mandar técnico quando cai a conexão."
  ];

  const handleCombat = async (text: string) => {
    if (!text.trim()) return;
    setObjection(text);
    setAiLoading(true);
    setAiAnswer("");
    try {
      const resp = await onCombatObjection(text);
      setAiAnswer(resp);
    } catch (e: any) {
      setAiAnswer("Não conseguimos consultar a inteligência artificial de vendas. Na MHNET, o atendimento é local de verdade! Respondemos presencialmente no mesmo dia, sem esperar em linhas telefônicas longas!");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div id="objections-viewport" className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-805 tracking-tight flex items-center gap-1.5 leading-none">
          <ShieldAlert className="w-5 h-5 text-sky-950" />
          IA Anti-Objeção Geral
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase font-bold pl-0.5">Derrube argumentos de clientes em segundos</p>
      </div>

      <div className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 font-sans leading-relaxed">
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-slate-400">O que o cliente disse para recusar?</label>
          <textarea
            id="obj-text-textarea"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-3 text-xs font-semibold focus:bg-white"
            rows={3}
            placeholder="Ex: 'Vou falar com o meu marido antes de fechar...' ou 'Já uso Claro e estou feliz'..."
            value={objection}
            onChange={e => setObjection(e.target.value)}
          />
        </div>

        <button
          id="btn-trigger-combat"
          onClick={() => handleCombat(objection)}
          disabled={aiLoading || !objection.trim()}
          className="w-full py-3 bg-sky-900 override-bg-sky-900 hover:bg-sky-950 text-white rounded-xl text-xs font-bold leading-none disabled:opacity-40 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          Combater com Inteligência Artificial
        </button>

        {aiLoading && (
          <div className="text-center py-6 text-xs text-slate-450 space-y-2">
            <div className="w-6 h-6 border-4 border-slate-150 border-t-sky-850 rounded-full animate-spin mx-auto" />
            <p>Redigindo contramedida persuasiva...</p>
          </div>
        )}

        {aiAnswer && (
          <div id="obj-ai-response" className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 text-sky-950 font-medium font-sans text-xs rounded-xl leading-relaxed whitespace-pre-wrap animate-fade-in border-l-4 border-l-sky-500 shadow-sm">
            <div className="text-[9px] font-black uppercase text-sky-600 mb-1 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Argumento Recomendado:</div>
            {aiAnswer}
          </div>
        )}
      </div>

      {/* Suggested objection pills */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase text-slate-450 pl-0.5">Objeções de campo mais comuns:</h3>
        <div className="flex flex-col gap-2">
          {SUGGESTED_OBJECTIONS.map((pill, idx) => (
            <button
              id={`obj-pill-${idx}`}
              key={idx}
              onClick={() => handleCombat(pill)}
              className="w-full text-left card-modern border border-slate-100 hover:bg-slate-50 rounded-xl p-3 text-[11px] font-bold text-slate-700 leading-snug cursor-pointer transition flex items-center justify-between"
            >
              <span>"{pill}"</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-350 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ArrowUpRightProps {
  className?: string;
}
function ArrowUpRight({ className }: ArrowUpRightProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}
