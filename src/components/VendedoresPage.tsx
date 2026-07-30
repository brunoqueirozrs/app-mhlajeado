/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sliders, UserPlus, Trash2, Edit3, Target, Search, Users, AlertTriangle, Check, X, RefreshCw, Cake, Phone, Bot, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";
import { Vendor } from "../types";
import ConfirmModal from "./ConfirmModal";

interface VendedoresPageProps {
  vendors: Vendor[];
  onAddVendor: (nome: string, meta: number, telefone?: string, status?: string, kayCallmebot?: string, dataNascimento?: string) => Promise<void>;
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
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [syncingSheet, setSyncingSheet] = useState(false);

  // New Vendor Form States
  const [newNome, setNewNome] = useState("");
  const [newMeta, setNewMeta] = useState(30);
  const [newTelefone, setNewTelefone] = useState("");
  const [newStatus, setNewStatus] = useState("Ativo");
  const [newKayCallmebot, setNewKayCallmebot] = useState("");
  const [newDataNascimento, setNewDataNascimento] = useState("");
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
  const [editingStatus, setEditingStatus] = useState<string>("Ativo");
  const [editingKayCallmebot, setEditingKayCallmebot] = useState<string>("");
  const [editingDataNascimento, setEditingDataNascimento] = useState<string>("");
  
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const handleSyncFromSheet = async () => {
    setSyncingSheet(true);
    try {
      const resp = await fetch("/api/vendors/sync", { method: "POST" });
      const data = await resp.json();
      if (resp.ok) {
        alert(`✅ Sincronização concluída com sucesso!\nForam atualizados ${data.count || 0} cadastros da aba 'vendedores'.`);
        window.location.reload();
      } else {
        throw new Error(data.message || "Erro ao conectar com Google Sheets");
      }
    } catch (err: any) {
      alert(`⚠️ Erro na sincronização: ${err.message || err}`);
    } finally {
      setSyncingSheet(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim()) {
      alert("⚠️ Preencha o nome do colaborador!");
      return;
    }
    setSubmitting(true);
    try {
      await onAddVendor(newNome, newMeta, newTelefone, newStatus, newKayCallmebot, newDataNascimento);
      setNewNome("");
      setNewMeta(30);
      setNewTelefone("");
      setNewStatus("Ativo");
      setNewKayCallmebot("");
      setNewDataNascimento("");
      alert("✅ Vendedor cadastrado com sucesso na Central!");
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
        id: vendor.id || vendor.nome,
        nome: editingNome.trim() || vendor.nome,
        meta: editingMeta,
        telefone: editingTelefone.trim() || vendor.telefone,
        status: editingStatus,
        kayCallmebot: editingKayCallmebot.trim(),
        dataNascimento: editingDataNascimento.trim()
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
    } catch (err: any) {
      alert(`⚠️ Erro ao excluir vendedor: ${err.message || err}`);
    } finally {
      setVendorToDelete(null);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const isAtivo = (v.status || "Ativo").toLowerCase() === "ativo";
    
    if (statusFilter === "ativo") return matchesSearch && isAtivo;
    if (statusFilter === "inativo") return matchesSearch && !isAtivo;
    return matchesSearch;
  });

  return (
    <div id="vendedores-viewport" className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 leading-none">
            <Sliders className="w-5 h-5 text-sky-600" />
            Central de Cadastros dos Vendedores & Metas
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Base central de colaboradores integrada diretamente com a planilha Google Sheets (<strong className="text-slate-700">aba: vendedores</strong>)
          </p>
        </div>

        <button
          onClick={handleSyncFromSheet}
          disabled={syncingSheet}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-emerald-900/20 active:scale-98 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <FileSpreadsheet className={`w-4 h-4 ${syncingSheet ? "animate-spin" : ""}`} />
          {syncingSheet ? "Sincronizando Planilha..." : "Sincronizar da Planilha"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Register Form */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleCreate} className="card-modern border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 font-sans leading-relaxed bg-white">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-sky-600" />
              Cadastrar Novo Colaborador / Vendedor
            </h3>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: ANA PAULA RODRIGUES"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                value={newNome}
                onChange={e => setNewNome(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Status</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Nascimento (DD/MM/AAAA)</label>
                <input
                  type="text"
                  placeholder="29/11/1988"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  value={newDataNascimento}
                  onChange={e => setNewDataNascimento(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">WhatsApp (Ex: 5551998475596)</label>
              <input
                type="text"
                placeholder="DDD + Número sem formatação"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                value={newTelefone}
                onChange={e => setNewTelefone(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Kay Callmebot</label>
                <input
                  type="text"
                  placeholder="ID / Chave Bot"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  value={newKayCallmebot}
                  onChange={e => setNewKayCallmebot(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5 flex justify-between">
                  <span>Meta de Vendas</span>
                  <span className="text-sky-600 font-bold">{newMeta}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  value={newMeta}
                  onChange={e => setNewMeta(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-97 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? "Cadastrando..." : "Salvar Vendedor"}
            </button>
          </form>

          {/* Card: Bulk Transfer */}
          <form onSubmit={handleTransfer} className="card-modern border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 font-sans leading-relaxed bg-white">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <RefreshCw className={`w-4 h-4 text-sky-600 ${transferring ? "animate-spin" : ""}`} />
              Transferência de Carteira (Em Massa)
            </h3>

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Transfira todos os leads e tarefas de um vendedor em caso de remanejamento ou desligamento.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Origem (Saindo)</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                value={fromSeller}
                onChange={e => setFromSeller(e.target.value)}
              >
                <option value="">Selecione o vendedor de origem...</option>
                {[...vendors].sort((a,b) => a.nome.localeCompare(b.nome)).map(v => (
                  <option key={`from_${v.id || v.nome}`} value={v.nome}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-0.5">Destino (Recebendo)</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                value={toSeller}
                onChange={e => setToSeller(e.target.value)}
              >
                <option value="">Selecione o vendedor de destino...</option>
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
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md active:scale-97 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${transferring ? "animate-spin" : ""}`} />
              {transferring ? "Transferindo..." : "Transferir Carteira"}
            </button>
          </form>

          {/* Sheet Details Box */}
          <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-xs text-sky-950 space-y-2 leading-relaxed">
            <h4 className="font-bold uppercase text-[10px] text-sky-800 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" /> Planilha de Origem
            </h4>
            <p className="text-[11px] text-sky-900">
              A base sincroniza com a planilha ID: <strong className="font-mono text-[10px]">19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w</strong> na aba <strong className="underline">vendedores</strong>.
            </p>
            <p className="text-[10.5px] text-sky-700">
              Campos lidos: <strong>Vendedor</strong>, <strong>Status</strong>, <strong>WhatsApp</strong>, <strong>KAY CALLMEBOT</strong>, <strong>Data de Nascimento</strong>.
            </p>
          </div>
        </div>

        {/* Right Side: Salespeople List Table */}
        <div className="lg:col-span-2 card-modern border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                Vendedores na Central ({filteredVendors.length})
              </h3>

              {/* Status Tabs Filter */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => setStatusFilter("todos")}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${statusFilter === "todos" ? "bg-white text-slate-900 shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter("ativo")}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${statusFilter === "ativo" ? "bg-emerald-500 text-white shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Ativos
                </button>
                <button
                  onClick={() => setStatusFilter("inativo")}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${statusFilter === "inativo" ? "bg-slate-400 text-white shadow-sm font-extrabold" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Inativos
                </button>
              </div>
            </div>

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
                  <th className="pb-3 pl-2">Status</th>
                  <th className="pb-3">Vendedor</th>
                  <th className="pb-3">WhatsApp</th>
                  <th className="pb-3">Data Nascimento</th>
                  <th className="pb-3 text-center">Meta do Mês</th>
                  <th className="pb-3 text-right pr-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold uppercase">
                      Nenhum colaborador encontrado nesta filtragem.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map(v => {
                    const isEditing = editingId === (v.id || v.nome);
                    const isAtivo = (v.status || "Ativo").toLowerCase() === "ativo";

                    return (
                      <tr key={v.id || v.nome} className="hover:bg-slate-50/70 transition">
                        {/* Status */}
                        <td className="py-3.5 pl-2">
                          {isEditing ? (
                            <select
                              value={editingStatus}
                              onChange={e => setEditingStatus(e.target.value)}
                              className="bg-slate-100 border border-slate-300 rounded-lg py-1 px-1.5 text-xs font-bold text-slate-800"
                            >
                              <option value="Ativo">Ativo</option>
                              <option value="Inativo">Inativo</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isAtivo ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                              {isAtivo ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                              {v.status || "Ativo"}
                            </span>
                          )}
                        </td>

                        {/* Nome */}
                        <td className="py-3.5 font-extrabold text-slate-800">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingNome}
                              onChange={e => setEditingNome(e.target.value)}
                              className="w-full bg-slate-100 border border-slate-300 rounded-lg py-1 px-2 text-xs font-bold text-slate-800"
                            />
                          ) : (
                            <div>
                              <span>{v.nome}</span>
                              {v.kayCallmebot && (
                                <span className="block text-[9.5px] font-mono text-slate-400 font-normal">
                                  Bot: {v.kayCallmebot}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        {/* WhatsApp */}
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
                              <a
                                href={`https://wa.me/${v.telefone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                              >
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                {v.telefone}
                              </a>
                            ) : <span className="text-slate-300 text-[10px]">-</span>
                          )}
                        </td>

                        {/* Data de Nascimento */}
                        <td className="py-3.5 text-slate-600 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingDataNascimento}
                              onChange={e => setEditingDataNascimento(e.target.value)}
                              placeholder="29/11/1988"
                              className="w-28 bg-slate-100 border border-slate-300 rounded-lg py-1 px-2 text-xs font-bold text-slate-800"
                            />
                          ) : (
                            v.dataNascimento ? (
                              <span className="inline-flex items-center gap-1.5 text-slate-700 font-bold bg-amber-50/60 border border-amber-200/60 px-2 py-0.5 rounded-lg text-[11px]">
                                <Cake className="w-3.5 h-3.5 text-amber-500" />
                                {v.dataNascimento}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[10px]">-</span>
                            )
                          )}
                        </td>
                        
                        {/* Meta */}
                        <td className="py-3.5 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editingMeta}
                              onChange={e => setEditingMeta(Number(e.target.value) || 0)}
                              className="w-16 bg-slate-100 border border-slate-300 rounded-lg py-1 px-1.5 text-xs font-bold text-center text-slate-800"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1 font-black text-xs text-sky-800 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl">
                              <Target className="w-3.5 h-3.5 text-sky-500" />
                              {v.meta} vendas
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 text-right pr-2">
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
                                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-black cursor-pointer transition"
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
                                  setEditingStatus(v.status || "Ativo");
                                  setEditingKayCallmebot(v.kayCallmebot || "");
                                  setEditingDataNascimento(v.dataNascimento || "");
                                }}
                                title="Editar"
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
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
        title="Excluir Vendedor da Central"
        message={`Deseja realmente remover "${vendorToDelete?.nome}" da central de colaboradores?`}
        confirmText="Excluir"
        onConfirm={confirmDelete}
        onCancel={() => setVendorToDelete(null)}
      />
    </div>
  );
}
