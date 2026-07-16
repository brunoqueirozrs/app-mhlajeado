import React, { useState, useEffect } from "react";
import { Plus, BarChart3, Clock, MapPin, Store, User, Users, Star, StarHalf, Play, Calendar, ExternalLink, RefreshCw, X, Save, TrendingUp, Tent, Ticket, HeartHandshake, UserPlus, FileText } from "lucide-react";
import { TradeAction } from "../types";

interface TradePageProps {
  loggedUser: string;
  isAdmin: boolean;
}

const ACTION_TYPES = [
  "Animação (personagens, mascotes)",
  "Perna de pau",
  "Pipoqueiro",
  "Distribuição de brindes",
  "Stand/Barraca",
  "Outro"
];

const CITIES = ["Lajeado", "Estrela"];

export default function TradePage({ loggedUser, isAdmin }: TradePageProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "nova_acao" | "historico">("dashboard");
  const [actions, setActions] = useState<TradeAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMes, setSelectedMes] = useState("");
  const [months, setMonths] = useState<{ value: string, label: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<TradeAction>>({
    tipo: ACTION_TYPES[0],
    cidade: CITIES[0],
    dataAcao: new Date().toISOString().split("T")[0],
    horaAcao: "08:00",
    leadsCaptados: 0,
    nota: 10,
    parceiroFixo: false,
    vendedora: isAdmin ? "" : loggedUser
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [vendedoras, setVendedoras] = useState<string[]>([]);

  useEffect(() => {
    // Generate last 6 months options
    const opts = [];
    const currentDate = new Date();
    const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const mNameShort = monthNames[d.getMonth()];
      const year = d.getFullYear();
      opts.push({ value: `Trade ${mNameShort}${year}`, label: `${mNameShort} ${year}` });
    }
    setMonths(opts);
    setSelectedMes(opts[0].value);
    
    fetchVendedoras();
  }, []);

  useEffect(() => {
    if (selectedMes) {
      fetchActions();
    }
  }, [selectedMes]);

  const fetchVendedoras = async () => {
    try {
      const res = await fetch("/api/vendors");
      if (res.ok) {
        const data = await res.json();
        if (data && data.vendors) {
          setVendedoras(data.vendors.map((v: any) => v.nome));
        }
      }
    } catch (e) {}
  };

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/trade/${encodeURIComponent(selectedMes)}`);
      if (res.ok) {
        const data = await res.json();
        setActions(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      ...formData,
      registradoPor: loggedUser,
      dataRegistro: new Date().toISOString()
    };

    try {
      // Determine which sheet to save to based on dataAcao
      const actionDate = new Date(formData.dataAcao || new Date());
      const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      const sheetName = `Trade ${monthNames[actionDate.getMonth()]}${actionDate.getFullYear()}`;

      const res = await fetch(`/api/trade/${encodeURIComponent(sheetName)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        // Reset form
        setFormData({
          tipo: ACTION_TYPES[0],
          cidade: CITIES[0],
          dataAcao: new Date().toISOString().split("T")[0],
          horaAcao: "08:00",
          leadsCaptados: 0,
          nota: 10,
          parceiroFixo: false,
          vendedora: isAdmin ? "" : loggedUser
        });
        setActiveTab("dashboard");
        if (sheetName === selectedMes) {
          fetchActions();
        } else {
          setSelectedMes(sheetName);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const totalLeads = actions.reduce((acc, curr) => acc + (Number(curr.leadsCaptados) || 0), 0);
  const totalAcoes = actions.length;
  const avgLeads = totalAcoes > 0 ? (totalLeads / totalAcoes).toFixed(1) : "0";
  const avgNota = totalAcoes > 0 ? (actions.reduce((acc, curr) => acc + (Number(curr.nota) || 0), 0) / totalAcoes).toFixed(1) : "0";

  const getTipoIcon = (tipo: string) => {
    if (tipo.includes("Animação") || tipo.includes("Perna")) return <UserPlus className="w-5 h-5 text-sky-500" />;
    if (tipo.includes("Pipoqueiro")) return <Tent className="w-5 h-5 text-amber-500" />;
    if (tipo.includes("brindes")) return <Ticket className="w-5 h-5 text-[#00A86B]" />;
    if (tipo.includes("Stand")) return <Store className="w-5 h-5 text-sky-500" />;
    return <Star className="w-5 h-5 text-sky-500" />;
  };

  const getTipoColor = (tipo: string) => {
    if (tipo.includes("Animação") || tipo.includes("Perna")) return "bg-sky-100 text-sky-700 border-sky-200";
    if (tipo.includes("Pipoqueiro")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (tipo.includes("brindes")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (tipo.includes("Stand")) return "bg-sky-100 text-sky-700 border-sky-200";
    return "bg-sky-100 text-sky-700 border-sky-200";
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center card-modern p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-sky-600" />
            Visão Geral - {months.find(m => m.value === selectedMes)?.label}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Métricas de ações de Trade e captação de leads</p>
        </div>
        <select 
          value={selectedMes} 
          onChange={e => setSelectedMes(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-modern border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Play className="w-4 h-4 text-sky-500" /> Ações Realizadas
          </div>
          <div className="text-3xl font-black text-slate-800">{totalAcoes}</div>
        </div>
        <div className="card-modern border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00A86B]" /> Leads Captados
          </div>
          <div className="text-3xl font-black text-[#00A86B]">{totalLeads}</div>
        </div>
        <div className="card-modern border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" /> Média por Ação
          </div>
          <div className="text-3xl font-black text-sky-600">{avgLeads}</div>
        </div>
        <div className="card-modern border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <StarHalf className="w-4 h-4 text-amber-500" /> Nota Média
          </div>
          <div className="text-3xl font-black text-amber-600">{avgNota}</div>
        </div>
      </div>

      <div className="card-modern border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Ações Recentes
        </h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-6 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Carregando...
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              Nenhuma ação registrada para este mês.
            </div>
          ) : (
            actions.slice().reverse().slice(0, 5).map(action => (
              <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${getTipoColor(action.tipo)}`}>
                    {getTipoIcon(action.tipo)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{action.localNome}</h4>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {action.cidade}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {action.dataAcao} às {action.horaAcao}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:text-right">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Leads</div>
                    <div className="font-black text-[#00A86B]">{action.leadsCaptados}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Nota</div>
                    <div className="font-black text-amber-500">{action.nota}/10</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {actions.length > 5 && (
          <button 
            onClick={() => setActiveTab("historico")}
            className="w-full mt-4 py-3 text-sm font-bold text-sky-600 hover:bg-sky-50 rounded-xl transition"
          >
            Ver Histórico Completo
          </button>
        )}
      </div>
    </div>
  );

  const renderNovaAcao = () => (
    <div className="max-w-3xl mx-auto card-modern border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm animate-fade-in">
      <div className="mb-6 pb-6 border-b border-slate-100">
        <h2 className="text-xl font-black text-slate-800">Registrar Nova Ação de Trade</h2>
        <p className="text-sm text-slate-500 mt-1">Preencha os dados da ativação externa para registrar a captação de leads.</p>
      </div>

      <form onSubmit={handleSaveAction} className="space-y-6">
        
        {/* Tipo e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Tipo de Ação</label>
            <select 
              
              value={formData.tipo}
              onChange={e => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 bg-slate-50"
            >
              {ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Data</label>
              <input 
                type="date"
                
                value={formData.dataAcao}
                onChange={e => setFormData({ ...formData, dataAcao: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Horário</label>
              <input 
                type="time"
                
                value={formData.horaAcao}
                onChange={e => setFormData({ ...formData, horaAcao: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-500" /> Dados do Local
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input 
                type="text"
                placeholder="Nome do local (Ex: Supermercado STR, Praça Matriz)"
                
                value={formData.localNome || ""}
                onChange={e => setFormData({ ...formData, localNome: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="md:col-span-2">
              <input 
                type="text"
                placeholder="Endereço (Rua e número)"
                
                value={formData.endereco || ""}
                onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <select 
                
                value={formData.cidade}
                onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 bg-slate-50"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <input 
                type="text"
                placeholder="Bairro"
                value={formData.bairro || ""}
                onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00A86B]" /> Resultados da Ação
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Leads Captados</label>
              <input 
                type="number"
                min="0"
                
                value={formData.leadsCaptados || 0}
                onChange={e => setFormData({ ...formData, leadsCaptados: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-[#00A86B] focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Nota Interna (0-10)</label>
              <input 
                type="number"
                min="0"
                max="10"
                
                value={formData.nota || 0}
                onChange={e => setFormData({ ...formData, nota: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-amber-600 focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Vendedora (Líder)</label>
              <select
                
                value={formData.vendedora || ""}
                onChange={e => setFormData({ ...formData, vendedora: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 bg-slate-50"
                disabled={!isAdmin && vendedoras.includes(loggedUser)}
              >
                <option value="">Selecione...</option>
                {isAdmin ? (
                  vendedoras.map(v => <option key={v} value={v}>{v}</option>)
                ) : (
                  <option value={loggedUser}>{loggedUser}</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Parceiros e Fornecedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
          
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-sky-500" /> Contato do Local / Parceiro
            </h3>
            <input 
              type="text"
              placeholder="Nome do dono ou gerente"
              value={formData.parceiroNome || ""}
              onChange={e => setFormData({ ...formData, parceiroNome: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
            />
            <input 
              type="text"
              placeholder="Telefone (WhatsApp)"
              value={formData.parceiroContato || ""}
              onChange={e => setFormData({ ...formData, parceiroContato: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
            />
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-sky-300 transition">
              <input 
                type="checkbox"
                checked={formData.parceiroFixo || false}
                onChange={e => setFormData({ ...formData, parceiroFixo: e.target.checked })}
                className="w-5 h-5 accent-sky-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700">Parceiro Fixo (Gerar recorrência)</span>
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-sky-500" /> Fornecedor Contratado
            </h3>
            <input 
              type="text"
              placeholder="Nome da atração/empresa"
              value={formData.fornecedorNome || ""}
              onChange={e => setFormData({ ...formData, fornecedorNome: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
            />
            <input 
              type="text"
              placeholder="Telefone do fornecedor"
              value={formData.fornecedorContato || ""}
              onChange={e => setFormData({ ...formData, fornecedorContato: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

        </div>

        {/* Observações */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Observações da Ação</label>
          <textarea 
            placeholder="Como foi o movimento? O que faltou? Destaques importantes... (Ex: retornar na próxima semana, colocar observação 'retornar' cria alerta)."
            value={formData.observacoes || ""}
            onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 h-24 resize-none bg-slate-50"
          />
        </div>

        <div className="flex justify-end pt-6">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? "Salvando..." : "Salvar Ação"}
          </button>
        </div>

      </form>
    </div>
  );

  const renderHistorico = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center card-modern p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-sky-600" />
            Histórico de Ações
          </h2>
          <p className="text-xs text-slate-500 mt-1">Lista completa por competência</p>
        </div>
        <select 
          value={selectedMes} 
          onChange={e => setSelectedMes(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
        >
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="card-modern rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-400" />
            Carregando ações...
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Nenhuma ação encontrada para este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 whitespace-nowrap">Data / Local</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Vendedora</th>
                  <th className="p-4 text-center">Leads</th>
                  <th className="p-4 text-center">Nota</th>
                  <th className="p-4 text-center">Parceiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {actions.slice().reverse().map(action => (
                  <tr key={action.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{action.localNome}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {action.dataAcao} {action.horaAcao} • {action.cidade}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getTipoColor(action.tipo)} whitespace-nowrap`}>
                        {action.tipo}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {action.vendedora}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-black text-[#00A86B]">{action.leadsCaptados}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-black text-amber-500">{action.nota}/10</span>
                    </td>
                    <td className="p-4 text-center">
                      {action.parceiroFixo ? (
                        <span className="bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Fixo
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="text-sky-600" />
            Trade Marketing (Ações Externas)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gestão de ativações de marca em Lajeado e Estrela</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Resumo
          </button>
          <button 
            onClick={() => setActiveTab("nova_acao")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'nova_acao' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Nova Ação
          </button>
          <button 
            onClick={() => setActiveTab("historico")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historico' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Histórico
          </button>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "nova_acao" && renderNovaAcao()}
        {activeTab === "historico" && renderHistorico()}
      </div>
    </div>
  );
}
