import React, { useState } from 'react';
import { PerfilComercial } from '../types';

interface Props {
  vendorId: string;
  vendorName: string;
  existingData?: PerfilComercial;
  onComplete: (data: Omit<PerfilComercial, 'id' | 'vendorId' | 'data'>) => void;
  onCancel: () => void;
}

export default function PerfilComercialForm({ vendorName, existingData, onComplete, onCancel }: Props) {
  const [gargalo, setGargalo] = useState(existingData?.gargaloPrincipal || "");
  const [conversao, setConversao] = useState(existingData?.taxaConversaoMedia?.toString() || "");
  const [ticket, setTicket] = useState(existingData?.ticketMedio?.toString() || "");
  
  const [pontoForteInput, setPontoForteInput] = useState("");
  const [pontosFortes, setPontosFortes] = useState<string[]>(existingData?.pontosFortesCampo || []);
  
  const [areaMelhoriaInput, setAreaMelhoriaInput] = useState("");
  const [areasMelhoria, setAreasMelhoria] = useState<string[]>(existingData?.areasMelhoriaCampo || []);

  const handleAddForte = () => {
    if (pontoForteInput.trim()) {
      setPontosFortes([...pontosFortes, pontoForteInput.trim()]);
      setPontoForteInput("");
    }
  };

  const handleAddMelhoria = () => {
    if (areaMelhoriaInput.trim()) {
      setAreasMelhoria([...areasMelhoria, areaMelhoriaInput.trim()]);
      setAreaMelhoriaInput("");
    }
  };

  const handleSave = () => {
    if (!gargalo) {
        alert("Preencha o gargalo principal.");
        return;
    }
    onComplete({
      gargaloPrincipal: gargalo,
      taxaConversaoMedia: Number(conversao) || 0,
      ticketMedio: Number(ticket) || 0,
      pontosFortesCampo: pontosFortes,
      areasMelhoriaCampo: areasMelhoria
    });
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-2xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">Avaliação do Perfil Comercial</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Colaborador: {vendorName}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Gargalo Principal na Jornada (Ex: Prospecção, Fechamento)</label>
          <input 
            type="text" 
            value={gargalo}
            onChange={e => setGargalo(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Onde o colaborador mais perde vendas?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Taxa de Conversão Média (%)</label>
            <input 
              type="number" 
              value={conversao}
              onChange={e => setConversao(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: 15"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ticket Médio (R$)</label>
            <input 
              type="number" 
              value={ticket}
              onChange={e => setTicket(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Ex: 120"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <label className="block text-sm font-bold text-emerald-800 mb-2">Pontos Fortes Observados</label>
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text" 
                        value={pontoForteInput}
                        onChange={e => setPontoForteInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddForte()}
                        className="flex-1 border border-emerald-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ex: Boa argumentação..."
                    />
                    <button onClick={handleAddForte} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold">+</button>
                </div>
                <ul className="space-y-2">
                    {pontosFortes.map((p, i) => (
                        <li key={i} className="text-xs bg-white p-2 rounded-md border border-emerald-100 flex justify-between items-center text-emerald-800">
                            {p}
                            <button onClick={() => setPontosFortes(pontosFortes.filter((_, idx) => idx !== i))} className="text-emerald-400 hover:text-rose-500">×</button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <label className="block text-sm font-bold text-rose-800 mb-2">Áreas de Melhoria (Gaps)</label>
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text" 
                        value={areaMelhoriaInput}
                        onChange={e => setAreaMelhoriaInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddMelhoria()}
                        className="flex-1 border border-rose-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        placeholder="Ex: Ansiedade no fechamento..."
                    />
                    <button onClick={handleAddMelhoria} className="bg-rose-600 text-white px-3 py-2 rounded-lg text-sm font-bold">+</button>
                </div>
                <ul className="space-y-2">
                    {areasMelhoria.map((p, i) => (
                        <li key={i} className="text-xs bg-white p-2 rounded-md border border-rose-100 flex justify-between items-center text-rose-800">
                            {p}
                            <button onClick={() => setAreasMelhoria(areasMelhoria.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-500">×</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
        >
          Salvar Avaliação
        </button>
      </div>
    </div>
  );
}
