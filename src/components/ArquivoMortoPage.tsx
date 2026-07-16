import React, { useState, useEffect } from "react";
import { Archive, Search, Filter, Calendar } from "lucide-react";
import { Lead } from "../types";

export default function ArquivoMortoPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/arquivo-morto");
      if (resp.ok) {
        const data = await resp.json();
        setLeads(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.nomeLead.toLowerCase().includes(search.toLowerCase()) || 
    (l.vendedor && l.vendedor.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Archive className="text-slate-600" />
            Arquivo Morto
          </h1>
          <p className="text-sm text-slate-500 mt-1">Leads com venda fechada arquivados automaticamente</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente ou vendedor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 card-modern border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="card-modern border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex-1">
        {isLoading ? (
          <div className="p-10 text-center text-slate-400 font-medium">Carregando arquivo morto...</div>
        ) : filteredLeads.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="py-4 px-4">Cliente</th>
                    <th className="py-4 px-4">Contato</th>
                    <th className="py-4 px-4">Plano Vendido</th>
                    <th className="py-4 px-4">Vendedor</th>
                    <th className="py-4 px-4">Data Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{lead.nomeLead}</td>
                      <td className="py-3 px-4 text-slate-600">{lead.telefone}</td>
                      <td className="py-3 px-4 text-[#00A86B] font-bold">{lead.valorPlano || "N/A"}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{lead.vendedor || "—"}</td>
                      <td className="py-3 px-4 text-slate-500">{lead.ultimaAtualizacao || lead.dataCadastro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredLeads.map((lead, idx) => (
                <div key={idx} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-slate-800">{lead.nomeLead}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold">
                      {lead.ultimaAtualizacao || lead.dataCadastro}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {lead.vendedor || "—"}</span>
                    <span className="text-[#00A86B] font-bold">{lead.valorPlano || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-10 text-center text-slate-500 font-medium">Nenhum registro encontrado no arquivo morto.</div>
        )}
      </div>
    </div>
  );
}
