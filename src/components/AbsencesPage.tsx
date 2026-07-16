/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CalendarDays, CalendarCheck, Paperclip, Send, Clock, History, CloudLightning } from "lucide-react";
import { Absence } from "../types";

interface AbsencesPageProps {
  absences: Absence[];
  onRegisterAbsence: (date: string, motivo: string, obs: string, fileData?: string, fileName?: string, mimeType?: string) => Promise<string>;
  onUpdateAbsence?: (id: string, status: string) => Promise<void>;
  isAdmin: boolean;
}

export default function AbsencesPage({
  absences,
  onRegisterAbsence,
  onUpdateAbsence,
  isAdmin
}: AbsencesPageProps) {
  const [absenceDate, setAbsenceDate] = useState("");
  const [absenceMotivo, setAbsenceMotivo] = useState("");
  const [absenceObs, setAbsenceObs] = useState("");
  const [fileDetails, setFileDetails] = useState<{ name: string; data: string; type: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileDetails({
          name: file.name,
          data: event.target.result as string,
          type: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceDate || !absenceMotivo) {
      alert("⚠️ Preencha a data e o tipo de solicitação!");
      return;
    }
    setSubmitting(true);
    try {
      const msg = await onRegisterAbsence(
        absenceDate, 
        absenceMotivo, 
        absenceObs, 
        fileDetails?.data, 
        fileDetails?.name, 
        fileDetails?.type
      );
      setAbsenceDate("");
      setAbsenceMotivo("");
      setAbsenceObs("");
      setFileDetails(null);
      alert(msg);
    } catch (e: any) {
      alert(`⚠️ Ops, ocorreu uma instabilidade ao enviar: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (String(status).toUpperCase()) {
      case "APROVADO":
        return "bg-[#E6FAF1] text-emerald-700 border-emerald-250";
      case "REJEITADO":
        return "bg-rose-50 text-rose-700 border-rose-250";
      default:
        return "bg-amber-50 text-amber-700 border-amber-250";
    }
  };

  return (
    <div id="absences-viewport" className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-805 tracking-tight flex items-center gap-1.5 leading-none">
          <CalendarDays className="w-5 h-5 text-sky-95" />
          Justificativa de Faltas
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase font-bold pl-0.5">Envio de Atestados e Justificativas de Ponto</p>
      </div>

      <form onSubmit={handleSubmit} className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 font-sans leading-relaxed">
        <h3 className="text-xs font-black uppercase text-sky-950 flex items-center gap-1">
          <CalendarCheck className="w-4 h-4 text-sky-90" />
          Nova Justificativa / Solicitação
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-0.5">Data da Ocorrência</label>
            <input
              id="absence-date-input"
              type="date"
              
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800"
              value={absenceDate}
              onChange={e => setAbsenceDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-0.5">Tipo de Justificativa</label>
            <select
              id="absence-motivo"
              
              className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-1 text-[11px] font-semibold text-slate-700"
              value={absenceMotivo}
              onChange={e => setAbsenceMotivo(e.target.value)}
            >
              <option value="">Selecione...</option>
              <option>FOLGA PROGRAMADA (BANCO DE HORAS)</option>
              <option>CONSULTA MÉDICA</option>
              <option>SOLICITAÇÃO DE SAIDA EMERGENCIA</option>
              <option>ENCAMINHAMENTO DE ATESTADO</option>
              <option>ENCAMINHAMENTO DE COMPARECIMENTO</option>
              <option>FALTA SEM JUSTIFICATIVA</option>
              <option>AJUSTE DE PONTO</option>
              <option>BENEFÍCIO - DAY OFF</option>
              <option>PROBLEMAS NO APLICATIVO</option>
              <option>OUTROS</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-0.5">Observação / Explicação adicional</label>
          <textarea
            id="absence-obs"
            className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs"
            rows={2}
            placeholder="Descreva detalhes adicionais importantes para a equipe de Recursos Humanos..."
            value={absenceObs}
            onChange={e => setAbsenceObs(e.target.value)}
          />
        </div>

        {/* Attachment box */}
        <div className="space-y-1 bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-700">
          <label className="text-[10px] font-extrabold uppercase text-slate-400">Anexar Cópia / Comprovante (Opcional)</label>
          <div className="flex items-center gap-2">
            <label className="p-2 px-3 card-modern border border-slate-200 text-[10px] font-extrabold rounded-lg flex items-center gap-1 text-slate-650 cursor-pointer transition hover:bg-slate-50 relative select-none">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" /> Selecionar Arquivo
              <input
                id="absence-file-picker"
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
            </label>
            {fileDetails && (
              <span className="text-[10px] text-slate-500 truncate font-mono max-w-[150px]">
                {fileDetails.name}
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-400 leading-none">Imagens (PNG, JPG) ou arquivos PDF de comprovantes.</span>
        </div>

        <button
          id="absence-submit-btn"
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-sky-900 override-bg-sky-900 hover:bg-sky-950 text-white rounded-xl text-xs font-bold leading-none disabled:opacity-40 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow"
        >
          <Send className="w-3.5 h-3.5" />
          {submitting ? "Transmitindo Justificativa..." : "ENVIAR SOLICITAÇÃO AO RH"}
        </button>
        <p className="text-[9px] text-slate-400 text-center uppercase tracking-wide leading-none mt-1">Um e-mail é disparado ao gestor de forma automatizada.</p>
      </form>

      {/* History panel list */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-455 pl-0.5 flex items-center gap-1">
          <History className="w-4 h-4 text-slate-500" />
          Histórico e Status de Justificativas
        </h3>

        <div className="space-y-2 pb-10">
          {absences.length > 0 ? (
            absences.map((abs, idx) => (
              <div key={idx} className="card-modern border border-slate-100 rounded-xl p-3.5 space-y-1.5 shadow-sm">
                <div className="flex justify-between items-start gap-4">
                  <div className="font-extrabold text-xs text-slate-800">{abs.motivo}</div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded-md ${
                    getStatusColorClass(abs.status || "ENVIADO")
                  }`}>
                    {abs.status || "ENVIADO"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 font-bold uppercase">
                  <span>📅 Ocorrência: {abs.dataFalta?.split("-").length === 3 && abs.dataFalta.split("-")[0].length === 4 ? `${abs.dataFalta.split("-")[2]}-${abs.dataFalta.split("-")[1]}-${abs.dataFalta.split("-")[0]}` : abs.dataFalta}</span>
                  {abs.vendedor && (
                    <span className="text-sky-900 font-extrabold bg-sky-50 px-1 rounded-sm">👤 {abs.vendedor}</span>
                  )}
                </div>

                {abs.observacao && (
                  <p className="text-[11px] text-slate-400 leading-snug">"{abs.observacao}"</p>
                )}

                {abs.link && (
                  <div className="pt-1.5">
                    <a 
                      href={abs.link} 
                      target="_blank" 
                      rel="referrer" 
                      className="text-[10px] font-black text-sky-850 hover:underline flex items-center gap-0.5"
                    >
                      📎 Ver anexo comprovante
                    </a>
                  </div>
                )}

                {isAdmin && abs.status === "Aguardando" && onUpdateAbsence && abs.id && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => onUpdateAbsence(abs.id!, "Aprovado")}
                      className="flex-1 text-[10px] font-bold bg-green-50 text-green-700 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition"
                    >
                      ✓ Aprovar
                    </button>
                    <button
                      onClick={() => onUpdateAbsence(abs.id!, "Rejeitado")}
                      className="flex-1 text-[10px] font-bold bg-red-50 text-red-700 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition"
                    >
                      ✗ Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 card-modern rounded-2xl border border-slate-50 shadow-sm leading-tight leading-none">
              <CalendarDays className="w-10 h-10 mx-auto opacity-20" />
              <p className="text-sm font-semibold">Nenhuma ocorrência ou falta relatada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
