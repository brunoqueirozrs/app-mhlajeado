import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneCall,
  Building,
  Building2,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  MapPin,
  Mail,
  User,
  MessageSquare,
  Globe,
  X,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { RamalItem, ContatoLojaItem } from "../types";

interface RamaisContatosPageProps {
  loggedUser: string;
  userRole: string;
}

export function RamaisContatosPage({ loggedUser, userRole }: RamaisContatosPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ramais" | "lojas">("ramais");
  const [ramais, setRamais] = useState<RamalItem[]>([]);
  const [lojas, setLojas] = useState<ContatoLojaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [copiedRamal, setCopiedRamal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [editingRamal, setEditingRamal] = useState<Partial<RamalItem> | null>(null);
  const [editingLoja, setEditingLoja] = useState<Partial<ContatoLojaItem> | null>(null);

  const isAdminOrManager = userRole === "admin" || loggedUser.toLowerCase().includes("bruno") || userRole === "gestor";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ramais-contatos");
      if (res.ok) {
        const data = await res.json();
        setRamais(data.ramais || []);
        setLojas(data.lojas || []);
      }
    } catch (e) {
      console.error("Erro ao carregar ramais e contatos:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/ramais-contatos/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRamais(data.ramais || []);
        setLojas(data.lojas || []);
        showToast("Dados sincronizados com o Google Sheets!");
      } else {
        alert("Falha ao sincronizar com o Google Sheets.");
      }
    } catch (e) {
      console.error("Erro no sync:", e);
      alert("Erro ao conectar ao servidor para sincronização.");
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRamal(text);
    showToast(`Ramal ${text} copiado para a área de transferência!`);
    setTimeout(() => setCopiedRamal(null), 2000);
  };

  // Ramal Save & Delete
  const handleSaveRamal = async () => {
    if (!editingRamal || !editingRamal.nome || !editingRamal.ramal) {
      alert("Preencha ao menos o Nome e o Ramal.");
      return;
    }
    try {
      const res = await fetch("/api/ramais-contatos/ramais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRamal)
      });
      if (res.ok) {
        showToast("Ramal salvo com sucesso!");
        setEditingRamal(null);
        fetchData();
      }
    } catch (e) {
      alert("Erro ao salvar ramal.");
    }
  };

  const handleDeleteRamal = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ramal?")) return;
    try {
      const res = await fetch(`/api/ramais-contatos/ramais/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Ramal excluído com sucesso!");
        fetchData();
      }
    } catch (e) {
      alert("Erro ao excluir ramal.");
    }
  };

  // Loja Save & Delete
  const handleSaveLoja = async () => {
    if (!editingLoja || !editingLoja.loja) {
      alert("Preencha ao menos o Nome da Loja.");
      return;
    }
    try {
      const res = await fetch("/api/ramais-contatos/lojas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLoja)
      });
      if (res.ok) {
        showToast("Contato da loja salvo com sucesso!");
        setEditingLoja(null);
        fetchData();
      }
    } catch (e) {
      alert("Erro ao salvar contato da loja.");
    }
  };

  const handleDeleteLoja = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) return;
    try {
      const res = await fetch(`/api/ramais-contatos/lojas/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Loja excluída com sucesso!");
        fetchData();
      }
    } catch (e) {
      alert("Erro ao excluir loja.");
    }
  };

  const formatWhatsAppUrl = (phone?: string) => {
    if (!phone) return null;
    const cleanNum = phone.replace(/\D/g, "");
    if (!cleanNum) return null;
    const fullNum = cleanNum.startsWith("55") ? cleanNum : `55${cleanNum}`;
    return `https://wa.me/${fullNum}`;
  };

  // Filtering
  const filteredRamais = ramais.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.nome && r.nome.toLowerCase().includes(term)) ||
      (r.ramal && r.ramal.toLowerCase().includes(term)) ||
      (r.cidade && r.cidade.toLowerCase().includes(term)) ||
      (r.setor && r.setor.toLowerCase().includes(term))
    );
  });

  const filteredLojas = lojas.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      (l.loja && l.loja.toLowerCase().includes(term)) ||
      (l.sigla && l.sigla.toLowerCase().includes(term)) ||
      (l.gestor && l.gestor.toLowerCase().includes(term)) ||
      (l.emailGestor && l.emailGestor.toLowerCase().includes(term)) ||
      (l.whatsappLoja && l.whatsappLoja.toLowerCase().includes(term)) ||
      (l.telefoneFixo && l.telefoneFixo.toLowerCase().includes(term)) ||
      (l.ramais && l.ramais.toLowerCase().includes(term)) ||
      (l.endereco && l.endereco.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Module Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-sky-500/30">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Base Oficial MHNET</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Ramais & Contatos das Lojas MHNET
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Central única de consulta e gestão de ramais internos corporativos, setores, gestores e dados das lojas regionais.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700/80 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Sincronizando..." : "Sincronizar Google Sheets"}</span>
            </button>

            {isAdminOrManager && (
              <button
                onClick={() => {
                  if (activeSubTab === "ramais") {
                    setEditingRamal({ nome: "", ramal: "", cidade: "", setor: "" });
                  } else {
                    setEditingLoja({ sigla: "", loja: "", gestor: "", telefoneGestor: "", emailGestor: "", whatsappLoja: "", telefoneFixo: "", ramais: "", endereco: "" });
                  }
                }}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{activeSubTab === "ramais" ? "Novo Ramal" : "Nova Loja"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs Switcher & Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Sub-Tabs Navigation */}
          <div className="flex items-center bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60 shrink-0">
            <button
              onClick={() => setActiveSubTab("ramais")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeSubTab === "ramais"
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Ramais ({ramais.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("lojas")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                activeSubTab === "lojas"
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Contato Lojas ({lojas.length})</span>
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeSubTab === "ramais"
                  ? "Buscar por nome, ramal, cidade ou setor..."
                  : "Buscar por loja, sigla, gestor, whatsapp, endereço..."
              }
              className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs rounded-2xl pl-10 pr-9 py-2.5 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-sky-500" />
          <p className="text-xs font-bold uppercase tracking-wider">Carregando dados dos ramais e lojas...</p>
        </div>
      ) : (
        <>
          {/* ================= ABA 1: RAMAIS ================= */}
          {activeSubTab === "ramais" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <PhoneCall className="w-4 h-4 text-sky-500" />
                    <span>Lista de Ramais Internos ({filteredRamais.length})</span>
                  </div>
                  {searchTerm && (
                    <span className="text-xs text-slate-400">
                      Filtrado de {ramais.length} ramais cadastrados
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                        <th className="pb-3 px-3">Nome / Identificação</th>
                        <th className="pb-3 px-3">Ramal</th>
                        <th className="pb-3 px-3">Cidade / Unidade</th>
                        <th className="pb-3 px-3">Setor</th>
                        <th className="pb-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
                      {filteredRamais.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {r.nome || "Não informado"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => copyToClipboard(r.ramal)}
                              title="Clique para copiar o ramal"
                              className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/80 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-3 py-1 rounded-xl font-mono font-black text-xs transition cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5 text-sky-500" />
                              <span>{r.ramal}</span>
                              {copiedRamal === r.ramal ? (
                                <Check className="w-3 h-3 text-emerald-500 ml-1" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400 opacity-60 ml-1" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                            {r.cidade ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {r.cidade}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {r.setor ? (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                                {r.setor}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isAdminOrManager && (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => setEditingRamal(r)}
                                  className="p-1.5 text-slate-400 hover:text-sky-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title="Editar Ramal"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRamal(r.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title="Excluir Ramal"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}

                      {filteredRamais.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                            Nenhum ramal encontrado para o termo "{searchTerm}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= ABA 2: CONTATO LOJAS ================= */}
          {activeSubTab === "lojas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLojas.map((loja) => {
                const waUrl = formatWhatsAppUrl(loja.whatsappLoja);

                return (
                  <div
                    key={loja.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Store Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-800 text-sky-600 dark:text-sky-300 font-black text-xs flex items-center justify-center shrink-0">
                            {loja.sigla || "MH"}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                              {loja.loja}
                            </h3>
                            {loja.sigla && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                Sigla: {loja.sigla}
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdminOrManager && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingLoja(loja)}
                              className="p-1.5 text-slate-400 hover:text-sky-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Editar Loja"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLoja(loja.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Excluir Loja"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Store Details Grid */}
                      <div className="space-y-2.5 text-xs">
                        {/* Gestor */}
                        {loja.gestor && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <span className="font-bold">Gestor:</span> {loja.gestor}
                              {loja.telefoneGestor && (
                                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                                  Tel: {loja.telefoneGestor}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Email Gestor */}
                        {loja.emailGestor && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${loja.emailGestor}`}
                              className="text-sky-600 dark:text-sky-400 hover:underline truncate"
                            >
                              {loja.emailGestor}
                            </a>
                          </div>
                        )}

                        {/* WhatsApp Loja */}
                        {loja.whatsappLoja && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                              <span className="font-bold">Celular / WhatsApp:</span>{" "}
                              {waUrl ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  {loja.whatsappLoja}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span>{loja.whatsappLoja}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Telefone Fixo */}
                        {loja.telefoneFixo && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                            <div>
                              <span className="font-bold">Fixo:</span> {loja.telefoneFixo}
                            </div>
                          </div>
                        )}

                        {/* Ramais da Loja */}
                        {loja.ramais && (
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <PhoneCall className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                              <span className="font-bold">Ramal(is) da Loja:</span>{" "}
                              <span className="font-mono bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-bold">
                                {loja.ramais}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Endereço */}
                        {loja.endereco && (
                          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{loja.endereco}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredLojas.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                  Nenhuma loja encontrada para o termo "{searchTerm}".
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ================= MODAL: EDITAR / NOVO RAMAL ================= */}
      {editingRamal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-sky-500" />
                <span>{editingRamal.id ? "Editar Ramal" : "Novo Ramal Interno"}</span>
              </h3>
              <button
                onClick={() => setEditingRamal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome / Identificação *
                </label>
                <input
                  type="text"
                  value={editingRamal.nome || ""}
                  onChange={(e) => setEditingRamal({ ...editingRamal, nome: e.target.value })}
                  placeholder="Ex: Ana Maria / Suporte Técnico"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Número do Ramal *
                </label>
                <input
                  type="text"
                  value={editingRamal.ramal || ""}
                  onChange={(e) => setEditingRamal({ ...editingRamal, ramal: e.target.value })}
                  placeholder="Ex: 2271"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Cidade / Unidade
                </label>
                <input
                  type="text"
                  value={editingRamal.cidade || ""}
                  onChange={(e) => setEditingRamal({ ...editingRamal, cidade: e.target.value })}
                  placeholder="Ex: Lajeado/RS"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Setor</label>
                <input
                  type="text"
                  value={editingRamal.setor || ""}
                  onChange={(e) => setEditingRamal({ ...editingRamal, setor: e.target.value })}
                  placeholder="Ex: Comercial LJO, Financeiro, NOC"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingRamal(null)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRamal}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Salvar Ramal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR / NOVA LOJA ================= */}
      {editingLoja && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-500" />
                <span>{editingLoja.id ? "Editar Contato da Loja" : "Nova Loja / Unidade"}</span>
              </h3>
              <button
                onClick={() => setEditingLoja(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sigla *
                  </label>
                  <input
                    type="text"
                    value={editingLoja.sigla || ""}
                    onChange={(e) => setEditingLoja({ ...editingLoja, sigla: e.target.value })}
                    placeholder="Ex: LJO"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white uppercase font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome da Loja *
                  </label>
                  <input
                    type="text"
                    value={editingLoja.loja || ""}
                    onChange={(e) => setEditingLoja({ ...editingLoja, loja: e.target.value })}
                    placeholder="Ex: Lajeado"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gestor</label>
                  <input
                    type="text"
                    value={editingLoja.gestor || ""}
                    onChange={(e) => setEditingLoja({ ...editingLoja, gestor: e.target.value })}
                    placeholder="Ex: Bruno Queiroz"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Telefone do Gestor
                  </label>
                  <input
                    type="text"
                    value={editingLoja.telefoneGestor || ""}
                    onChange={(e) => setEditingLoja({ ...editingLoja, telefoneGestor: e.target.value })}
                    placeholder="Ex: 51 98448-7818"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  E-mail do Gestor
                </label>
                <input
                  type="email"
                  value={editingLoja.emailGestor || ""}
                  onChange={(e) => setEditingLoja({ ...editingLoja, emailGestor: e.target.value })}
                  placeholder="Ex: bruno.queiroz@mhnet.com.br"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    WhatsApp Loja
                  </label>
                  <input
                    type="text"
                    value={editingLoja.whatsappLoja || ""}
                    onChange={(e) => setEditingLoja({ ...editingLoja, whatsappLoja: e.target.value })}
                    placeholder="Ex: 51 920040379"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Telefone Fixo
                  </label>
                  <input
                    type="text"
                    value={editingLoja.telefoneFixo || ""}
                    onChange={(e) => setEditingLoja({ ...editingLoja, telefoneFixo: e.target.value })}
                    placeholder="Ex: 51 3840-0000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ramais da Loja
                </label>
                <input
                  type="text"
                  value={editingLoja.ramais || ""}
                  onChange={(e) => setEditingLoja({ ...editingLoja, ramais: e.target.value })}
                  placeholder="Ex: 2271 | 2510 | 2814"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={editingLoja.endereco || ""}
                  onChange={(e) => setEditingLoja({ ...editingLoja, endereco: e.target.value })}
                  placeholder="Ex: Av. Senador Alberto Pasqualini, 624 - Lajeado - RS"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingLoja(null)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLoja}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Salvar Loja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
