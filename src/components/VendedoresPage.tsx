/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sliders, UserPlus, Trash2, Edit3, Target, Search, Users, AlertTriangle, Check, X, RefreshCw } from "lucide-react";
import { Vendor } from "../types";
import ConfirmModal from "./ConfirmModal";

interface VendedoresPageProps {
  vendors: Vendor[];
  onAddVendor: (nome: string, meta: number, telefone?: string) => Promise<void>;
  onUpdateVendor: (vendor: Vendor) => Promise<void>;
  onDeleteVendor: (id: string) => Promise<void>;
  onBulkTransfer?: (fromSeller: string, toSeller: string) => Promise<{ leadsTransferred: number; tasksTransferred: number; message: string }>;
}

export default function VendedoresPage({
  vendors,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
  onBulkTransfer
}: VendedoresPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newNome, setNewNome] = useState("");
  const [newMeta, setNewMeta] = useState(30);
  const [newTelefone, setNewTelefone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Bulk transfer states
  const [fromSeller, setFromSeller] = useState("");
  const [toSeller, setToSeller] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Inline editing target states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState<number>(0);
  const [editingNome, setEditingNome] = useState<string>("");
  const [editingTelefone, setEditingTelefone] = useState<string>("");
  
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim()) {
      alert("⚠️ Preencha o nome do vendedor!");
      return;
    }
    setSubmitting(true);
    try {
      await onAddVendor(newNome, newMeta, newTelefone);
      setNewNome("");
      setNewMeta(30);
      setNewTelefone("");
      alert("✅ Vendedor cadastrado com sucesso!");
    } catch (err: any) {
      alert(`⚠️ Erro ao cadastrar vendedor: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromSeller || !toSeller) {
      alert("⚠️ Por favor, selecione ambos os vendedores (origem e destino)!");
      return;
    }
    if (fromSeller === toSeller) {
      alert("⚠️ O vendedor de origem não pode ser igual ao de destino!");
      return;
    }

    const confirmTransfer = window.confirm(
      `⚠️ ATENÇÃO: Deseja realmente transferir todos os leads de "${fromSeller}" para "${toSeller}"?\n\nEsta operação é definitiva e altera o responsável de todos os registros e tarefas correspondentes!`
    );
    if (!confirmTransfer) return;

    setTransferring(true);
    try {
      if (onBulkTransfer) {
        const res = await onBulkTransfer(fromSeller, toSeller);
        alert(
          `✅ Sucesso!\n\n• Leads transferidos: ${res.leadsTransferred}\n• Tarefas transferidas: ${res.tasksTransferred}\n\nA carteira comercial foi transferida!`
        );
        setFromSeller("");
        setToSeller("");
      } else {
        const resp = await fetch("/api/leads/bulk-transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fromSeller, toSeller })
        });
        if (!resp.ok) throw new Error("Erro na solicitação de transferência.");
        const data = await resp.json();
        const details = data.details || {};
        alert(
          `✅ Sucesso!\n\n• Leads transferidos: ${details.leadsTransferred || 0}\n• Tarefas transferidas: ${details.tasksTransferred || 0}\n\nA carteira comercial foi transferida!`
        );
        setFromSeller("");
        setToSeller("");
      }
    } catch (err: any) {
      alert(`⚠️ Erro ao realizar transferência: ${err.message || err}`);
    } finally {
      setTransferring(false);
    }
  };

  const handleSaveUpdate = async (vendor: Vendor) => {
    try {
      await onUpdateVendor({
        ...vendor,
        id: vendor.id || vendor.nome, // fallback to nome if id missing
        nome: editingNome.trim() || vendor.nome,
        meta: editingMeta,
        telefone: editingTelefone.trim() || vendor.telefone
      });
      setEditingId(null);
    } catch (err: any) {
      alert(`⚠️ Erro ao salvar alteração: ${err.message || err}`);
    }
  };

  const handleDelete = (v: Vendor) => {
    setVendorToDelete(v);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;
    const targetId = vendorToDelete.id || vendorToDelete.nome;
    if (!targetId) return;

    try {
      await onDeleteVendor(targetId);
      // alert(`✅ Vendedor "${vendorToDelete.nome}" excluído.`);
    } catch (err: any) {
      alert(`⚠️ Erro ao excluir vendedor: ${err.message || err}`);
    } finally {
      setVendorToDelete(null);
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  return (
    <div id="vendedores-viewport" className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 leading-none">
          <Sliders className="w-5 h-5 text-sky-600" />
          Metas e Vendedores
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase font-bold pl-0.5">Gerenciamento de Equipe PAP, Metas de Vendas do Mês e Acessos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Register form */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleCreate} className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 font-sans leading-relaxed">
            <h3 className="text-xs font-black uppercase text-sky-950 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
              <UserPlus className="w-4 h-4 text-sky-600" />
              Cadastrar Novo Vendedor
            </h3>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Nome Completo</label>
              <input
                type="text"
                
                placeholder="Ex: Diogo Fussieger"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                value={newNome}
                onChange={e => setNewNome(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">WhatsApp (Ex: 51999999999)</label>
              <input
                type="text"
                placeholder="Telefone com DDD"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                value={newTelefone}
                onChange={e => setNewTelefone(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5 flex justify-between">
                <span>Meta de Vendas Individual</span>
                <span className="text-sky-600 font-extrabold">{newMeta} Vendas</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                value={newMeta}
                onChange={e => setNewMeta(Number(e.target.value) || 0)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 shrink-0 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-97 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? "Cadastrando..." : "Cadastrar Vendedor"}
            </button>
          </form>

          {/* Card: Bulk Transfer */}
          <form onSubmit={handleTransfer} className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 font-sans leading-relaxed">
            <h3 className="text-xs font-black uppercase text-sky-950 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
              <RefreshCw className={`w-4 h-4 text-sky-600 ${transferring ? "animate-spin" : ""}`} />
              Transferência (Em Massa)
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold leading-normal">
              Transfira todos os leads e tarefas ativas de um vendedor para outro em uma única operação em bloco.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Vendedor de Origem (Saindo)</label>
              <select
                
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                value={fromSeller}
                onChange={e => setFromSeller(e.target.value)}
              >
                <option value="">Selecione o vendedor...</option>
                {[...vendors].sort((a,b) => a.nome.localeCompare(b.nome)).map(v => (
                  <option key={`from_${v.id || v.nome}`} value={v.nome}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Vendedor de Destino (Recebendo)</label>
              <select
                
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                value={toSeller}
                onChange={e => setToSeller(e.target.value)}
              >
                <option value="">Selecione o vendedor...</option>
                {[...vendors].sort((a,b) => a.nome.localeCompare(b.nome)).map(v => (
                  <option key={`to_${v.id || v.nome}`} value={v.nome}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={transferring}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-97 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${transferring ? "animate-spin" : ""}`} />
              {transferring ? "Transferindo..." : "Transferir Carteira"}
            </button>
          </form>

          {/* Guidebox Info */}
          <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-4 text-xs font-semibold text-slate-500 space-y-2.5 leading-relaxed">
            <h4 className="font-extrabold uppercase text-[10px] text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Regra do Escopo de Login
            </h4>
            <p>Os consultores cadastrados aqui serão exibidos no menu <strong>"Selecione seu nome"</strong> do login do sistema.</p>
            <p>Selecione um vendedor existente para modificar a sua meta individual. Essa meta é utilizada no Painel Principal e nos Indicadores de Desempenho para mostrar a barra de progressão do vendedor.</p>
          </div>
        </div>

        {/* Right Side: Salespeople List Table */}
        <div className="lg:col-span-2 card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-50 pb-3">
            <h3 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              Vendedores Cadastrados ({vendors.length})
            </h3>

            {/* Search filter */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                  <th className="pb-3 pl-2">Vendedor</th>
                  <th className="pb-3">WhatsApp</th>
                  <th className="pb-3 text-center">Meta do Mês</th>
                  <th className="pb-3 text-right pr-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-sans text-xs">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 font-extrabold uppercase">
                      Nenhum vendedor encontrado com o termo buscado.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(v => {
                    const isEditing = editingId === (v.id || v.nome);
                    return (
                      <tr key={v.id || v.nome} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 pl-2 font-black text-slate-705">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingNome}
                              onChange={e => setEditingNome(e.target.value)}
                              className="w-full bg-slate-100 border border-slate-300 rounded-lg py-1 px-2.5 text-xs font-bold text-slate-800"
                            />
                          ) : (
                            v.nome
                          )}
                        </td>
                        
                        <td className="py-3.5 font-medium text-slate-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTelefone}
                              onChange={e => setEditingTelefone(e.target.value.replace(/\D/g, ""))}
                              placeholder="Somente números"
                              className="w-28 bg-slate-100 border border-slate-300 rounded-lg py-1 px-2 text-xs font-bold text-slate-800"
                            />
                          ) : (
                            v.telefone ? (
                              <a href={`https://wa.me/${v.telefone}`} target="_blank" rel="noreferrer" className="text-[#00A86B] hover:underline">
                                {v.telefone}
                              </a>
                            ) : <span className="opacity-50 text-[10px]">-</span>
                          )}
                        </td>
                        
                        <td className="py-3.5 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5 max-w-[120px] mx-auto">
                              <input
                                type="number"
                                min="0"
                                value={editingMeta}
                                onChange={e => setEditingMeta(Number(e.target.value) || 0)}
                                className="w-16 bg-slate-150 border border-slate-300 rounded-lg py-1 px-2 text-xs font-bold text-center text-slate-800"
                              />
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-extrabold text-xs text-sky-700 bg-sky-50/80 border border-sky-100 px-3 py-1 rounded-xl">
                              <Target className="w-3.5 h-3.5 text-sky-500" />
                              {v.meta} vendas
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-right pr-5">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveUpdate(v)}
                                title="Salvar alteração"
                                className="p-1 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-extrabold cursor-pointer transition flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                title="Cancelar"
                                className="p-1.5 bg-slate-350 hover:bg-slate-400 text-slate-700 rounded-lg text-xs font-black cursor-pointer transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(v.id || v.nome);
                                  setEditingMeta(v.meta);
                                  setEditingNome(v.nome);
                                  setEditingTelefone(v.telefone || "");
                                }}
                                title="Editar"
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
                              {/* Keep administrative protection - do not let them delete the main coordinator Bruno by accident */}
                              {v.nome !== "Bruno Garcia Queiroz" && v.nome !== "Bruno Queiroz" && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(v)}
                                  title="Excluir"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      <ConfirmModal
        isOpen={!!vendorToDelete}
        title="Excluir Vendedor"
        message={`Deseja realmente excluir o vendedor "${vendorToDelete?.nome}"? Esta ação mudará a lista de login, mas não excluirá os leads já atribuídos.`}
        confirmText="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setVendorToDelete(null)}
      />
    </div>
  );
}
