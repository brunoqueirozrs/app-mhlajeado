/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CheckSquare, Trash2, Calendar, LayoutGrid, List, Smile, GripVertical, Plus, X } from "lucide-react";
import { Task } from "../types";
import ConfirmModal from "./ConfirmModal";

interface TasksPageProps {
  tasks: Task[];
  onAddTask: (desc: string, dataLimite: string, nomeLead: string, vendedor?: string) => Promise<void>;
  vendorsList?: string[];
  isAdmin?: boolean;
  loggedUser?: string;
  onToggleTask: (id: string, currentStatus: "PENDENTE" | "CONCLUIDA") => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onClearCompletedTasks: () => Promise<void>;
  leadsList: string[];
  onNavigateToLeadDetail: (nomeLead: string) => void;
}

type Quadrant = "Q1" | "Q2" | "Q3" | "Q4" | null;

export default function TasksPage({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompletedTasks,
  leadsList,
  onNavigateToLeadDetail,
  vendorsList = [],
  isAdmin = true,
  loggedUser = ""
}: TasksPageProps) {
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskLead, setTaskLead] = useState("");
  const [taskVendedor, setTaskVendedor] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<"lista" | "matriz">("matriz");
  const [isClient, setIsClient] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [quadrants, setQuadrants] = useState<Record<string, "Q1" | "Q2" | "Q3" | "Q4">>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem("eisenhower_quadrants");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;
    await onAddTask(taskDesc, taskDate, taskLead, taskVendedor);
    setTaskDesc("");
    setTaskDate("");
    setTaskLead("");
    setTaskVendedor("");
    setIsAdding(false);
  };

  const handleOpenCalendar = () => {
    window.open("https://calendar.google.com/calendar/", "_blank");
  };

  const handleSetQuadrant = (taskId: string, quad: Quadrant) => {
    const newQ = { ...quadrants };
    if (quad) {
      newQ[taskId] = quad;
    } else {
      delete newQ[taskId];
    }
    setQuadrants(newQ);
    localStorage.setItem("eisenhower_quadrants", JSON.stringify(newQ));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, quad: Quadrant) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      handleSetQuadrant(taskId, quad);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const filteredTasks = isAdmin ? tasks : tasks.filter(t => t.vendedor === loggedUser);
  const activeTasks = filteredTasks.filter(t => t.status === "PENDENTE");
  const completedTasks = filteredTasks.filter(t => t.status === "CONCLUIDA");

  const getTasksForQuadrant = (quad: Quadrant) => {
    if (!quad) {
      return activeTasks.filter(t => !quadrants[t.id]);
    }
    return activeTasks.filter(t => quadrants[t.id] === quad);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    let datePart = dateStr;
    let timePart = "";
    if (dateStr.includes("T")) {
      const [d, t] = dateStr.split("T");
      datePart = d;
      timePart = ` às ${t}`;
    }
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}${timePart}`;
    }
    return dateStr;
  };

  const renderTaskCard = (task: Task, isMatrix: boolean) => {
    const done = task.status === "CONCLUIDA";
    return (
      <div 
        key={task.id}
        draggable={!done && isMatrix}
        onDragStart={(e) => handleDragStart(e, task.id)}
        className={`card-modern border rounded-xl p-3 flex items-start gap-3 transition shadow-sm ${
          done ? "opacity-50 border-slate-100 bg-slate-50/50" : "border-slate-200"
        } ${(!done && isMatrix) ? "cursor-grab active:cursor-grabbing hover:border-sky-300 -md" : ""}`}
      >
        <div className="flex flex-col items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onToggleTask(task.id, task.status)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition select-none ${
              done 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "border-slate-300 hover:border-sky-850"
            }`}
          >
            {done && <span className="text-[10px] font-black">✓</span>}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug break-words ${done ? "line-through text-slate-400" : "text-sky-950"}`}>
            {task.descricao}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.dataLimite && (
              <span className="bg-rose-50 text-rose-700 border border-rose-100 font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                ⏰ {formatDate(task.dataLimite)}
              </span>
            )}
            
            {task.nomeLead && (
              <button
                onClick={() => onNavigateToLeadDetail(task.nomeLead!)}
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-100 font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer leading-none text-left decoration-transparent"
              >
                👤 {task.nomeLead}
              </button>
            )}
            {isAdmin && task.vendedor && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                💼 {task.vendedor}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setTaskToDelete(task.id)}
            className="p-1.5 text-slate-300 hover:text-rose-600 transition flex-shrink-0 bg-slate-50 hover:bg-rose-50 rounded-lg"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {!done && isMatrix && (
            <GripVertical className="w-4 h-4 text-slate-300 mt-auto cursor-grab active:cursor-grabbing opacity-50" />
          )}
        </div>
      </div>
    );
  };

  const renderQuadrant = (id: "Q1"|"Q2"|"Q3"|"Q4", title: string, subtitle: string, colors: string) => {
    const qTasks = getTasksForQuadrant(id);
    return (
      <div 
        className={`rounded-2xl border-2 ${colors} p-4 flex flex-col h-full min-h-[200px] transition-colors`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, id)}
      >
        <div className="mb-3">
          <h3 className="font-extrabold text-sm">{title}</h3>
          <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">{subtitle}</p>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto pr-1 pb-1">
          {qTasks.length === 0 ? (
            <div className="h-full min-h-[100px] border-2 border-dashed border-current opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest">Solte aqui</span>
            </div>
          ) : (
            qTasks.map(t => renderTaskCard(t, true))
          )}
        </div>
      </div>
    );
  };

  if (!isClient) return null;

  return (
    <div id="tasks-viewport" className="space-y-4 pb-12 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-slate-805 tracking-tight flex items-center gap-1.5">
          <CheckSquare className="w-5 h-5 text-sky-950" />
          Tarefas Pendentes
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode("lista")} 
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold transition ${viewMode === "lista" ? "bg-white shadow-sm text-sky-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
            <button 
              onClick={() => setViewMode("matriz")} 
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold transition ${viewMode === "matriz" ? "bg-white shadow-sm text-sky-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Matriz Eisenhower
            </button>
          </div>
          <button 
            onClick={onClearCompletedTasks}
            className="p-1 px-3 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-bold transition"
            title="Arquivar Concluídas"
          >
            🧹 Limpar
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`px-4 py-1.5 rounded-lg flex items-center justify-center font-extrabold text-[11px] uppercase tracking-wider transition-all shadow-md active:scale-95 ${
              isAdding 
                ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                : "bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-500 hover:to-sky-400 shadow-sky-900/30 ring-1 ring-sky-400/50"
            }`}
          >
            {isAdding ? (
              <><X className="w-3.5 h-3.5 mr-1" /> Cancelar</>
            ) : (
              <><Plus className="w-3.5 h-3.5 mr-1" /> Nova Tarefa</>
            )}
          </button>
        </div>
      </div>

      

      {isAdding && (
        <form onSubmit={handleSubmit} className="card-modern border border-[#616b78] rounded-2xl p-4 space-y-3 shadow-md ">
          <div className="text-xs font-black uppercase text-sky-950 mb-2">Adicionar Tarefa</div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-1">O que precisa ser feito?</label>
            <input
              type="text"
              
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium focus:ring-2 focus:ring-sky-500/50 outline-none"
              placeholder="Ex: Entrar em contato com o síndico..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-1">Data e Hora de Prazo</label>
              <input
                type="datetime-local"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500/50"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />
            </div>
            
            {isAdmin && (
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-1">Atribuir a (Vendedor)</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500/50"
                value={taskVendedor}
                onChange={(e) => setTaskVendedor(e.target.value)}
              >
                <option value="">(Para Mim Mesmo - {loggedUser})</option>
                {vendorsList.map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
            </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 pl-1">Vincular Lead</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500/50"
                value={taskLead}
                onChange={(e) => setTaskLead(e.target.value)}
              >
                <option value="">Nenhum lead</option>
                {leadsList.map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-extrabold rounded-lg transition active:scale-95"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-sky-900 text-white hover:bg-sky-950 text-xs font-extrabold rounded-lg active:scale-95 shadow-sm transition"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      )}

      {viewMode === "lista" ? (
        <div className="space-y-2">
          {filteredTasks.length > 0 ? (
            [...filteredTasks]
              .sort((a, b) => (a.status === "PENDENTE" ? -1 : 1))
              .map(t => renderTaskCard(t, false))
          ) : (
            <div className="text-center py-20 text-slate-400 space-y-2 card-modern rounded-2xl border border-slate-50">
              <Smile className="w-10 h-10 mx-auto text-slate-200" />
              <p className="text-sm font-bold">Nenhuma tarefa para fazer!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 ">
          <div className="bg-slate-800 text-white p-4 rounded-2xl mb-4 shadow-lg">
            <h3 className="font-black text-lg">Matriz de Eisenhower</h3>
            <p className="text-slate-300 text-xs font-medium mt-1">
              Arraste as tarefas pendentes para os quadrantes para priorizar o que realmente importa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderQuadrant("Q1", "Fazer Agora", "Importante & Urgente", "border-rose-300 bg-rose-50 text-rose-950")}
            {renderQuadrant("Q2", "Agendar", "Importante & Não Urgente", "border-blue-300 bg-blue-50 text-blue-950")}
            {renderQuadrant("Q3", "Delegar", "Não Importante & Urgente", "border-amber-300 bg-amber-50 text-amber-950")}
            {renderQuadrant("Q4", "Eliminar", "Não Importante & Não Urgente", "border-slate-300 bg-slate-100 text-slate-900")}
          </div>

          {/* Uncategorized & Completed Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div 
              className="card-modern border border-slate-200 rounded-2xl p-4 shadow-sm transition-colors hover:border-slate-300"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, null)}
            >
              <h3 className="font-extrabold text-sm text-slate-800 mb-1">Tarefas Não Classificadas</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4">Arraste para remover da matriz</p>
              <div className="space-y-2">
                {getTasksForQuadrant(null).length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">Todas as tarefas ativas estão classificadas.</p>
                ) : (
                  getTasksForQuadrant(null).map(t => renderTaskCard(t, true))
                )}
              </div>
            </div>

            <div className="card-modern border border-slate-200 rounded-2xl p-4 shadow-sm opacity-70 hover:opacity-100 transition">
              <h3 className="font-extrabold text-sm text-slate-800 mb-1">Tarefas Concluídas</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4">Histórico</p>
              <div className="space-y-2">
                {completedTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">Nenhuma tarefa concluída ainda.</p>
                ) : (
                  completedTasks.map(t => renderTaskCard(t, false))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      
      {isAdmin && (
        <div className="mt-8 pt-6 border-t border-slate-200 ">
          <h3 className="font-extrabold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            Agenda de Compromissos do Dia
          </h3>
          <button 
            onClick={handleOpenCalendar}
            className="w-full card-modern bg-white border border-sky-200 p-4 rounded-xl text-sm font-extrabold text-sky-900 flex flex-col items-center justify-center gap-2 hover:bg-sky-50 transition active:scale-95 shadow-sm"
          >
            <Calendar className="w-8 h-8 text-sky-500 mb-1" />
            <span>Abrir Agenda Compartilhada do Google</span>
            <span className="text-xs font-medium text-slate-500 normal-case">Visualize os compromissos de todos os vendedores</span>
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir permanentemente esta tarefa?"
        confirmText="Excluir"
        onConfirm={async () => {
          if (taskToDelete) {
            await onDeleteTask(taskToDelete);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
