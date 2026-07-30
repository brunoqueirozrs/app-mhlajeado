import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Camera,
  User,
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Send,
  FileText,
  Check,
  X,
  ChevronRight,
  Image as ImageIcon,
  Building,
  Briefcase,
  ShieldCheck,
  BarChart2,
  RefreshCw,
  Sparkles,
  Phone,
  ArrowRight,
  UploadCloud,
  CheckSquare,
  AlertTriangle,
  Info
} from "lucide-react";

import { RotinaModelo, RotinaExecucao, ColaboradorRotina, MarcoMensal } from "../types";

interface RotinasPageProps {
  loggedUser: string;
  userRole: "vendedor" | "admin" | "";
}

export default function RotinasPage({ loggedUser, userRole }: RotinasPageProps) {
  // Main view tabs
  const [subTab, setSubTab] = useState<"minhas" | "gestor" | "cronograma" | "config">("minhas");

  // State
  const [modelos, setModelos] = useState<RotinaModelo[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorRotina[]>([]);
  const [execucoes, setExecucoes] = useState<RotinaExecucao[]>([]);
  const [marcos, setMarcos] = useState<MarcoMensal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Selected collaborator for "Minhas Rotinas"
  const [selectedColab, setSelectedColab] = useState<string>("");

  // Modal State for Completing Task
  const [completingTask, setCompletingTask] = useState<{
    modelo: RotinaModelo;
    execucao?: RotinaExecucao;
  } | null>(null);
  const [completionPhoto, setCompletionPhoto] = useState<string>("");
  const [completionObs, setCompletionObs] = useState<string>("");
  const [isSubmittingTask, setIsSubmittingTask] = useState<boolean>(false);

  // Modal State for Photo Viewer
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string; colab: string; hora?: string } | null>(null);

  // Modal State for Editing / Adding Modelo
  const [editingModelo, setEditingModelo] = useState<Partial<RotinaModelo> | null>(null);

  // Modal State for Editing / Adding Colaborador
  const [editingColab, setEditingColab] = useState<Partial<ColaboradorRotina> | null>(null);

  // Modal State for Editing / Adding Marco Mensal
  const [editingMarco, setEditingMarco] = useState<Partial<MarcoMensal> | null>(null);

  // Notification Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all routine data
  const fetchRotinasData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rotinas");
      if (res.ok) {
        const data = await res.json();
        setModelos(data.modelos || []);
        setColaboradores(data.colaboradores || []);
        setExecucoes(data.execucoes || []);
        setMarcos(data.marcos || []);
      }
    } catch (e) {
      console.error("Erro ao carregar rotinas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRotinasData();
  }, []);

  // Auto-detect logged user in colaboradores
  useEffect(() => {
    if (colaboradores.length > 0 && !selectedColab) {
      const found = colaboradores.find(c => 
        c.nome.toLowerCase().includes(loggedUser.toLowerCase()) || 
        loggedUser.toLowerCase().includes(c.nome.toLowerCase().split(" ")[0])
      );
      if (found) {
        setSelectedColab(found.nome);
      } else {
        setSelectedColab(colaboradores[0]?.nome || loggedUser);
      }
    }
  }, [colaboradores, loggedUser]);

  // Current selected collaborator object
  const currentColabObj = colaboradores.find(c => c.nome === selectedColab);

  // Get daily tasks for a collaborator
  const getTasksForColab = (colabName: string, dateStr: string) => {
    const colab = colaboradores.find(c => c.nome === colabName);
    if (!colab) return [];

    const dateObj = new Date(dateStr + "T00:00:00");
    const dayOfMonth = dateObj.getDate();
    const dayOfWeek = dateObj.getDay(); // 0 Sunday, 6 Saturday

    return modelos.filter(m => {
      if (!m.ativo) return false;

      // Group match
      const groupMatch = m.grupo === "Todos" || m.grupo === colab.grupo;
      if (!groupMatch) return false;

      // Recurrence check
      if (m.recorrencia === "Diária (Turno)") {
        if (m.diaSemana === "Segunda a Sexta" && (dayOfWeek === 0 || dayOfWeek === 6)) {
          return false;
        }
        return true;
      }

      if (m.recorrencia === "Mensal (Dia Fixo)") {
        const dayMatch = m.diaSemana?.toLowerCase().includes(`dia ${dayOfMonth}`) || 
                         m.diaSemana?.includes(String(dayOfMonth).padStart(2, "0"));
        return dayMatch;
      }

      if (m.recorrencia === "Ação Preventiva / Condicional") {
        return true;
      }

      return true;
    });
  };

  // Handle Mark / Complete Task
  const handleOpenCompleteModal = (modelo: RotinaModelo, exec?: RotinaExecucao) => {
    setCompletingTask({ modelo, execucao: exec });
    setCompletionPhoto(exec?.fotoUrl || "");
    setCompletionObs(exec?.observacao || "");
  };

  const handleSaveExecution = async () => {
    if (!completingTask) return;
    const { modelo, execucao } = completingTask;

    if (modelo.requerFoto && !completionPhoto.trim() && (!execucao || !execucao.fotoUrl)) {
      alert("Esta rotina exige o anexo de uma foto ou comprovante de evidência.");
      return;
    }

    setIsSubmittingTask(true);
    try {
      const payload: Partial<RotinaExecucao> = {
        id: execucao?.id,
        rotinaId: modelo.id,
        colaborador: selectedColab,
        grupo: currentColabObj?.grupo || modelo.grupo,
        data: selectedDate,
        status: "concluido",
        horaConclusao: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        observacao: completionObs,
        fotoUrl: completionPhoto
      };

      const res = await fetch("/api/rotinas/execucoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(`✅ Tarefa "${modelo.titulo}" concluída com sucesso!`);
        setCompletingTask(null);
        fetchRotinasData();
      } else {
        alert("Erro ao salvar execução da tarefa.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao enviar confirmação.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Handle Image Upload simulation/file conversion
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Foto muito grande. Escolha uma imagem de até 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger N8N Notification
  const handleSendN8nReminder = async (m: RotinaModelo) => {
    try {
      setSyncing(true);
      const res = await fetch("/api/rotinas/notify-n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rotina: m,
          colaborador: selectedColab,
          tipoAviso: "lembrete_tarefa"
        })
      });
      if (res.ok) {
        showToast(`🔔 Lembrete da tarefa "${m.titulo}" disparado para WhatsApp!`);
      }
    } catch (e) {
      alert("Falha ao comunicar com n8n.");
    } finally {
      setSyncing(false);
    }
  };

  // Save Modelo
  const handleSaveModelo = async () => {
    if (!editingModelo || !editingModelo.titulo) {
      alert("Preencha o título da rotina.");
      return;
    }
    try {
      const res = await fetch("/api/rotinas/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingModelo,
          ativo: editingModelo.ativo !== undefined ? editingModelo.ativo : true,
          requerFoto: !!editingModelo.requerFoto,
          obrigatoriedade: editingModelo.obrigatoriedade || "obrigatória",
          recorrencia: editingModelo.recorrencia || "Diária (Turno)",
          grupo: editingModelo.grupo || "Loja"
        })
      });
      if (res.ok) {
        showToast("Modelo de rotina salvo com sucesso!");
        setEditingModelo(null);
        fetchRotinasData();
      }
    } catch (e) {
      alert("Erro ao salvar modelo.");
    }
  };

  // Delete Modelo
  const handleDeleteModelo = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta rotina da matriz?")) return;
    try {
      const res = await fetch(`/api/rotinas/modelos/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Modelo removido com sucesso.");
        fetchRotinasData();
      }
    } catch (e) {
      alert("Erro ao remover modelo.");
    }
  };

  // Save Colaborador
  const handleSaveColaborador = async () => {
    if (!editingColab || !editingColab.nome) {
      alert("Preencha o nome do colaborador.");
      return;
    }
    try {
      const res = await fetch("/api/rotinas/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingColab,
          ativo: editingColab.ativo !== undefined ? editingColab.ativo : true,
          grupo: editingColab.grupo || "Loja",
          cargo: editingColab.cargo || "Vendedora Interna"
        })
      });
      if (res.ok) {
        showToast("Colaborador salvo com sucesso!");
        setEditingColab(null);
        fetchRotinasData();
      }
    } catch (e) {
      alert("Erro ao salvar colaborador.");
    }
  };

  // Delete Colaborador
  const handleDeleteColaborador = async (id: string) => {
    if (!confirm("Deseja remover este colaborador da lista de rotinas?")) return;
    try {
      const res = await fetch(`/api/rotinas/colaboradores/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Colaborador removido.");
        fetchRotinasData();
      }
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  // Save Marco Mensal / Situação
  const handleSaveMarco = async () => {
    if (!editingMarco || !editingMarco.titulo || !editingMarco.dia) {
      alert("Preencha ao menos o dia/frequência e o título do marco.");
      return;
    }
    try {
      const res = await fetch("/api/rotinas/marcos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMarco)
      });
      if (res.ok) {
        showToast("Marco mensal / situação salvo com sucesso!");
        setEditingMarco(null);
        fetchRotinasData();
      }
    } catch (e) {
      alert("Erro ao salvar marco mensal.");
    }
  };

  // Delete Marco Mensal / Situação
  const handleDeleteMarco = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta situação / marco mensal?")) return;
    try {
      const res = await fetch(`/api/rotinas/marcos/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Situação removida com sucesso.");
        fetchRotinasData();
      }
    } catch (e) {
      alert("Erro ao excluir marco.");
    }
  };

  const getCorBadgeClass = (cor?: string) => {
    switch (cor) {
      case "purple":
        return "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "amber":
        return "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "rose":
        return "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      case "emerald":
        return "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "indigo":
        return "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "teal":
        return "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "sky":
      default:
        return "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
    }
  };

  const renderMarcoIcon = (icone?: string, cor?: string) => {
    const colorClass = cor === "purple" ? "text-purple-500" :
      cor === "amber" ? "text-amber-500" :
      cor === "rose" ? "text-rose-500" :
      cor === "emerald" ? "text-emerald-500" :
      cor === "indigo" ? "text-indigo-500" :
      cor === "teal" ? "text-teal-500" : "text-sky-500";

    switch (icone) {
      case "camera":
        return <Camera className={`w-5 h-5 ${colorClass}`} />;
      case "file":
        return <FileText className={`w-5 h-5 ${colorClass}`} />;
      case "alert":
        return <AlertTriangle className={`w-5 h-5 ${colorClass}`} />;
      case "barchart":
        return <BarChart2 className={`w-5 h-5 ${colorClass}`} />;
      case "building":
        return <Building className={`w-5 h-5 ${colorClass}`} />;
      case "clock":
        return <Clock className={`w-5 h-5 ${colorClass}`} />;
      default:
        return <Calendar className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  // Calculations for Manager Dashboard
  const activeColabs = colaboradores.filter(c => c.ativo);
  const totalTasksTodayForTeam = activeColabs.reduce((acc, colab) => {
    return acc + getTasksForColab(colab.nome, selectedDate).length;
  }, 0);

  const totalCompletedTodayForTeam = execucoes.filter(
    e => e.data === selectedDate && e.status === "concluido"
  ).length;

  const totalPhotosUploadedToday = execucoes.filter(
    e => e.data === selectedDate && e.fotoUrl && e.fotoUrl.length > 0
  ).length;

  const overallTeamPercentage = totalTasksTodayForTeam > 0
    ? Math.round((totalCompletedTodayForTeam / totalTasksTodayForTeam) * 100)
    : 0;

  // Render Subtabs
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              Gestão de Rotinas e Cronograma Operacional
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Cronograma & Acompanhamento de Equipe
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitore e execute as rotinas diárias por turno, marcos mensais com envio de evidências e lembretes automatizados da loja MHNET.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRotinasData}
              disabled={syncing || loading}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading || syncing ? "animate-spin text-sky-400" : ""}`} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setSubTab("minhas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              subTab === "minhas"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Minhas Rotinas do Dia</span>
          </button>

          <button
            onClick={() => setSubTab("gestor")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              subTab === "gestor"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Painel do Gestor & Cumprimento</span>
          </button>

          <button
            onClick={() => setSubTab("cronograma")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
              subTab === "cronograma"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Marcos Mensais & Fotos Fixas</span>
          </button>

          {(userRole === "admin" || loggedUser.toLowerCase().includes("bruno")) && (
            <button
              onClick={() => setSubTab("config")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                subTab === "config"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Matriz de Modelos & Equipe</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: MINHAS ROTINAS DO DIA ================= */}
      {subTab === "minhas" && (
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            
            {/* Colaborador Switcher */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950/80 rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Colaborador Selecionado
                </label>
                <select
                  value={selectedColab}
                  onChange={(e) => setSelectedColab(e.target.value)}
                  className="bg-transparent font-bold text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.nome} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c.nome} ({c.grupo} - {c.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Data:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Progress Card */}
          {(() => {
            const todayTasks = getTasksForColab(selectedColab, selectedDate);
            const completedCount = todayTasks.filter((m) => {
              const exec = execucoes.find(
                (e) => e.rotinaId === m.id && e.colaborador === selectedColab && e.data === selectedDate
              );
              return exec && exec.status === "concluido";
            }).length;

            const percentage = todayTasks.length > 0 ? Math.round((completedCount / todayTasks.length) * 100) : 0;

            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Progresso de Cumprimento - {selectedDate.split("-").reverse().join("/")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {completedCount} de {todayTasks.length} tarefas da rotina marcadas como concluídas
                    </p>
                  </div>
                  <span className={`text-xl font-black px-3 py-1 rounded-2xl ${
                    percentage >= 80
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      : percentage >= 50
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                  }`}>
                    {percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Tasks List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Grade de Atividades do Turno
            </h3>

            {getTasksForColab(selectedColab, selectedDate).length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-semibold text-sm">Nenhuma rotina agendada para esta data nesta escala.</p>
              </div>
            ) : (
              getTasksForColab(selectedColab, selectedDate).map((m) => {
                const exec = execucoes.find(
                  (e) => e.rotinaId === m.id && e.colaborador === selectedColab && e.data === selectedDate
                );
                const isDone = exec && exec.status === "concluido";

                return (
                  <div
                    key={m.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                      isDone
                        ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isDone
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-sky-50 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md">
                            {m.horarioInicio || "08:00"} {m.horarioFim ? `- ${m.horarioFim}` : ""}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {m.recorrencia}
                          </span>
                          {m.requerFoto && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md">
                              <Camera className="w-3 h-3" />
                              Requer Foto
                            </span>
                          )}
                        </div>

                        <h4 className={`font-bold text-sm sm:text-base ${isDone ? "line-through text-slate-500" : "text-slate-900 dark:text-white"}`}>
                          {m.titulo}
                        </h4>

                        {m.descricao && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                            {m.descricao}
                          </p>
                        )}

                        {isDone && exec && (
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            <span>Concluída às {exec.horaConclusao}</span>
                            {exec.observacao && <span>• Obs: {exec.observacao}</span>}
                            {exec.fotoUrl && (
                              <button
                                onClick={() => setViewingPhoto({
                                  url: exec.fotoUrl!,
                                  title: m.titulo,
                                  colab: selectedColab,
                                  hora: exec.horaConclusao
                                })}
                                className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 underline font-bold cursor-pointer"
                              >
                                <ImageIcon className="w-3.5 h-3.5" /> Ver Evidência Anexada
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleSendN8nReminder(m)}
                        title="Enviar Lembrete para WhatsApp"
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-500" />
                        <span className="hidden sm:inline">Aviso</span>
                      </button>

                      <button
                        onClick={() => handleOpenCompleteModal(m, exec)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          isDone
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            : "bg-sky-600 hover:bg-sky-500 text-white"
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Concluir</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PAINEL DO GESTOR ================= */}
      {subTab === "gestor" && (
        <div className="space-y-6">
          {/* Top Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-sky-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Data do Acompanhamento:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Exibindo acompanhamento da equipe de Telecom em tempo real
            </div>
          </div>

          {/* High level KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Tarefas Escaladas
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {totalTasksTodayForTeam}
              </div>
              <p className="text-[11px] text-slate-500">Total somado da equipe no dia</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                % Cumprimento Geral
              </span>
              <div className={`text-2xl font-black ${
                overallTeamPercentage >= 80 ? "text-emerald-500" : overallTeamPercentage >= 50 ? "text-amber-500" : "text-rose-500"
              }`}>
                {overallTeamPercentage}%
              </div>
              <p className="text-[11px] text-slate-500">{totalCompletedTodayForTeam} concluídas</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Fotos/Evidências Anexadas
              </span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {totalPhotosUploadedToday}
              </div>
              <p className="text-[11px] text-slate-500">Comprovantes validados no dia</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                Pendências Restantes
              </span>
              <div className="text-2xl font-black text-rose-500">
                {totalTasksTodayForTeam - totalCompletedTodayForTeam}
              </div>
              <p className="text-[11px] text-slate-500">Tarefas aguardando conclusão</p>
            </div>
          </div>

          {/* Team Members Status Grid (Semáforo) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Semáforo de Cumprimento por Colaborador
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhe a taxa individual de execução das rotinas do dia
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> ≥ 80%</span>
                <span className="inline-flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"/> 50-79%</span>
                <span className="inline-flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"/> &lt; 50%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {activeColabs.map((colab) => {
                const tasks = getTasksForColab(colab.nome, selectedDate);
                const doneCount = tasks.filter((m) => {
                  const exec = execucoes.find(
                    (e) => e.rotinaId === m.id && e.colaborador === colab.nome && e.data === selectedDate
                  );
                  return exec && exec.status === "concluido";
                }).length;

                const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

                let colorBorder = "border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20";
                let colorBadge = "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
                if (pct >= 80) {
                  colorBorder = "border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20";
                  colorBadge = "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
                } else if (pct >= 50) {
                  colorBorder = "border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20";
                  colorBadge = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
                }

                return (
                  <div
                    key={colab.id}
                    className={`border rounded-2xl p-4 space-y-3 transition ${colorBorder}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {colab.nome}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                          {colab.cargo} ({colab.grupo})
                        </span>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${colorBadge}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                      <span>{doneCount} de {tasks.length} feitas</span>
                      <button
                        onClick={() => {
                          setSelectedColab(colab.nome);
                          setSubTab("minhas");
                        }}
                        className="text-sky-600 dark:text-sky-400 hover:underline font-bold"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executions Log Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Log de Evidências e Execução Detalhada ({selectedDate.split("-").reverse().join("/")})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Colaborador</th>
                    <th className="p-3">Grupo</th>
                    <th className="p-3">Rotina</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Hora Conclusão</th>
                    <th className="p-3 text-center">Evidência Foto</th>
                    <th className="p-3">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {activeColabs.flatMap((c) => {
                    const tasks = getTasksForColab(c.nome, selectedDate);
                    return tasks.map((m) => {
                      const exec = execucoes.find(
                        (e) => e.rotinaId === m.id && e.colaborador === c.nome && e.data === selectedDate
                      );
                      const isDone = exec && exec.status === "concluido";

                      return (
                        <tr key={`${c.id}-${m.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {c.nome}
                          </td>
                          <td className="p-3 text-slate-500 whitespace-nowrap">{c.grupo}</td>
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                            {m.titulo}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-md text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Concluído
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-1 rounded-md text-[11px] font-bold">
                                <AlertCircle className="w-3 h-3" /> Pendente
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap text-slate-500">
                            {exec?.horaConclusao || "-"}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {exec?.fotoUrl ? (
                              <button
                                onClick={() => setViewingPhoto({
                                  url: exec.fotoUrl!,
                                  title: m.titulo,
                                  colab: c.nome,
                                  hora: exec.horaConclusao
                                })}
                                className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 px-2.5 py-1 rounded-md text-[11px] font-bold hover:underline cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" /> Ver Foto
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                {m.requerFoto ? "Pendente" : "Sem Foto"}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 max-w-xs truncate">
                            {exec?.observacao || "-"}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MARCOS MENSAIS & FOTOS FIXAS ================= */}
      {subTab === "cronograma" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Calendário de Marcos Mensais Críticos & Fotos Fixas da Loja
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rotinas com data fixa do calendário corporativo: vencimentos de clientes, prévia de metas, envio de comissões/RH e foto mensal da vitrine.
              </p>
            </div>

            {(userRole === "admin" || loggedUser.toLowerCase().includes("bruno")) && (
              <button
                onClick={() => setEditingMarco({
                  dia: "Todo Dia 01 do Mês",
                  titulo: "",
                  descricao: "",
                  responsavel: "",
                  tagText: "",
                  cor: "sky",
                  icone: "calendar"
                })}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Situação / Marco</span>
              </button>
            )}
          </div>

          {/* Monthly Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marcos.map((m) => (
              <div key={m.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-black text-xs px-3 py-1 rounded-xl uppercase tracking-wider border ${getCorBadgeClass(m.cor)}`}>
                      {m.dia}
                    </span>
                    <div className="flex items-center gap-2">
                      {renderMarcoIcon(m.icone, m.cor)}
                      {(userRole === "admin" || loggedUser.toLowerCase().includes("bruno")) && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={() => setEditingMarco(m)}
                            title="Editar Marco / Situação"
                            className="p-1 text-slate-400 hover:text-sky-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMarco(m.id)}
                            title="Excluir Marco / Situação"
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {m.titulo}
                    </h4>
                    {m.descricao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {m.descricao}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 mt-2">
                  {m.responsavel && (
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Responsável: {m.responsavel}
                    </span>
                  )}
                  {m.tagText && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{m.tagText}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {marcos.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-400 text-xs">
                Nenhum marco mensal cadastrado. Clique em "Adicionar Situação / Marco" para criar o primeiro.
              </div>
            )}
          </div>
        </div>
      )}


      {/* ================= TAB 4: CONFIGURAÇÃO DE MODELOS E EQUIPE ================= */}
      {subTab === "config" && (
        <div className="space-y-8">
          
          {/* Section 1: Modelos de Rotina */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Matriz de Modelos de Rotinas Operacionais
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cadastre e edite as rotinas padronizadas atribuídas por grupo e cargo da loja
                </p>
              </div>

              <button
                onClick={() => setEditingModelo({
                  titulo: "",
                  grupo: "Loja",
                  cargo: "Vendedora Interna",
                  recorrencia: "Diária (Turno)",
                  diaSemana: "Segunda a Sexta",
                  horarioInicio: "08:00",
                  horarioFim: "08:30",
                  tipo: "organização",
                  obrigatoriedade: "obrigatória",
                  requerFoto: false,
                  ativo: true
                })}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Rotina</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">ID</th>
                    <th className="p-3">Título da Rotina</th>
                    <th className="p-3">Grupo / Cargo</th>
                    <th className="p-3">Recorrência / Horário</th>
                    <th className="p-3 text-center">Requer Foto</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {modelos.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-bold text-sky-600">{m.id}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{m.titulo}</td>
                      <td className="p-3 text-slate-500">
                        {m.grupo} ({m.cargo})
                      </td>
                      <td className="p-3 text-slate-500">
                        {m.recorrencia} ({m.horarioInicio || ""}-{m.horarioFim || ""})
                      </td>
                      <td className="p-3 text-center">
                        {m.requerFoto ? (
                          <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-[10px]">Sim</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Não</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.ativo ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {m.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingModelo(m)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModelo(m.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Cadastro da Equipe de Colaboradores */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Membros da Equipe & Atribuição de Grupos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerencie a lista de colaboradores (Atendimento, Comercial Externo, Adm/PCD, Jovem Aprendiz e Gestão)
                </p>
              </div>

              <button
                onClick={() => setEditingColab({
                  nome: "",
                  cargo: "Vendedora Interna / Atendimento",
                  grupo: "Loja",
                  ramal: "",
                  whatsapp: "",
                  ativo: true
                })}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Colaborador</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Nome do Colaborador</th>
                    <th className="p-3">Grupo</th>
                    <th className="p-3">Cargo / Função</th>
                    <th className="p-3">Contato</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {colaboradores.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{c.nome}</td>
                      <td className="p-3">
                        <span className="bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
                          {c.grupo}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{c.cargo}</td>
                      <td className="p-3 text-slate-500 font-medium">
                        {c.whatsapp ? (
                          <a
                            href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {c.whatsapp}
                          </a>
                        ) : c.ramal ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{c.ramal}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.ativo ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingColab(c)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteColaborador(c.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONCLUIR TAREFA / ANEXAR FOTO ================= */}
      {completingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                  Conclusão da Rotina
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {completingTask.modelo.titulo}
                </h3>
              </div>
              <button
                onClick={() => setCompletingTask(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {completingTask.modelo.descricao && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {completingTask.modelo.descricao}
                </p>
              )}

              {/* Photo Upload area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-purple-500" />
                  <span>
                    Evidência / Foto do Comprovante {completingTask.modelo.requerFoto ? "(Obrigatório)" : "(Opcional)"}
                  </span>
                </label>

                {completionPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 max-h-48 flex items-center justify-center bg-slate-950">
                    <img src={completionPhoto} alt="Evidência" className="max-h-48 object-contain" />
                    <button
                      onClick={() => setCompletionPhoto("")}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-500 cursor-pointer shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30">
                    <UploadCloud className="w-8 h-8 text-sky-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Clique para selecionar foto ou comprovante
                    </span>
                    <span className="text-[10px] text-slate-400">Suporta JPG, PNG e anexos até 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Observation Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Observações / Detalhes (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={completionObs}
                  onChange={(e) => setCompletionObs(e.target.value)}
                  placeholder="Ex: Tudo organizado, panfletos repostos na recepção..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCompletingTask(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveExecution}
                disabled={isSubmittingTask}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Conclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VER FOTO ================= */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Evidência Anexada - {viewingPhoto.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Enviado por {viewingPhoto.colab} {viewingPhoto.hora ? `às ${viewingPhoto.hora}` : ""}
                </p>
              </div>
              <button
                onClick={() => setViewingPhoto(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-[70vh] flex items-center justify-center">
              <img src={viewingPhoto.url} alt="Evidência" className="max-h-[70vh] object-contain" />
            </div>

            <div className="text-right">
              <button
                onClick={() => setViewingPhoto(null)}
                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR MODELO ================= */}
      {editingModelo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingModelo.id ? "Editar Modelo de Rotina" : "Novo Modelo de Rotina"}
              </h3>
              <button onClick={() => setEditingModelo(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Título da Rotina</label>
                <input
                  type="text"
                  value={editingModelo.titulo || ""}
                  onChange={(e) => setEditingModelo({ ...editingModelo, titulo: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Grupo Responsável</label>
                  <select
                    value={editingModelo.grupo || "Loja"}
                    onChange={(e) => setEditingModelo({ ...editingModelo, grupo: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Loja">Loja</option>
                    <option value="Externo">Externo</option>
                    <option value="Administrativo-PCD">Administrativo-PCD</option>
                    <option value="Jovem Aprendiz">Jovem Aprendiz</option>
                    <option value="Gestão">Gestão</option>
                    <option value="Todos">Todos os Grupos</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cargo</label>
                  <input
                    type="text"
                    value={editingModelo.cargo || ""}
                    onChange={(e) => setEditingModelo({ ...editingModelo, cargo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recorrência</label>
                  <select
                    value={editingModelo.recorrencia || "Diária (Turno)"}
                    onChange={(e) => setEditingModelo({ ...editingModelo, recorrencia: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Diária (Turno)">Diária (Turno)</option>
                    <option value="Mensal (Dia Fixo)">Mensal (Dia Fixo)</option>
                    <option value="Ação Preventiva / Condicional">Ação Preventiva</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dia / Frequência</label>
                  <input
                    type="text"
                    value={editingModelo.diaSemana || "Segunda a Sexta"}
                    onChange={(e) => setEditingModelo({ ...editingModelo, diaSemana: e.target.value })}
                    placeholder="Ex: Segunda a Sexta ou Dia 15"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Início</label>
                  <input
                    type="text"
                    value={editingModelo.horarioInicio || "08:00"}
                    onChange={(e) => setEditingModelo({ ...editingModelo, horarioInicio: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Fim</label>
                  <input
                    type="text"
                    value={editingModelo.horarioFim || "08:30"}
                    onChange={(e) => setEditingModelo({ ...editingModelo, horarioFim: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={editingModelo.descricao || ""}
                  onChange={(e) => setEditingModelo({ ...editingModelo, descricao: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!editingModelo.requerFoto}
                    onChange={(e) => setEditingModelo({ ...editingModelo, requerFoto: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Requer Foto Obrigatoriamente</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setEditingModelo(null)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSaveModelo} className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer">
                Salvar Modelo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR COLABORADOR ================= */}
      {editingColab && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingColab.id ? "Editar Colaborador" : "Novo Colaborador"}
              </h3>
              <button onClick={() => setEditingColab(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={editingColab.nome || ""}
                  onChange={(e) => setEditingColab({ ...editingColab, nome: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Grupo Pertencente</label>
                <select
                  value={editingColab.grupo || "Loja"}
                  onChange={(e) => setEditingColab({ ...editingColab, grupo: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                >
                  <option value="Loja">Loja (Vendedoras Internas / Atendimento)</option>
                  <option value="Externo">Externo (Comercial / PAP)</option>
                  <option value="Administrativo-PCD">Administrativo / PCD</option>
                  <option value="Jovem Aprendiz">Jovem Aprendiz</option>
                  <option value="Gestão">Gestão</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={editingColab.cargo || ""}
                  onChange={(e) => setEditingColab({ ...editingColab, cargo: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Telefone / Ramal</label>
                  <input
                    type="text"
                    value={editingColab.ramal || ""}
                    onChange={(e) => setEditingColab({ ...editingColab, ramal: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editingColab.whatsapp || ""}
                    onChange={(e) => setEditingColab({ ...editingColab, whatsapp: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setEditingColab(null)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSaveColaborador} className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer">
                Salvar Colaborador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR / CRIAR MARCO MENSAL ================= */}
      {editingMarco && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                <span>{editingMarco.id ? "Editar Marco / Situação" : "Nova Situação / Marco Mensal"}</span>
              </h3>
              <button onClick={() => setEditingMarco(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dia / Frequência</label>
                  <input
                    type="text"
                    value={editingMarco.dia || ""}
                    onChange={(e) => setEditingMarco({ ...editingMarco, dia: e.target.value })}
                    placeholder="Ex: Todo Dia 10 do Mês"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cor do Destaque</label>
                  <select
                    value={editingMarco.cor || "sky"}
                    onChange={(e) => setEditingMarco({ ...editingMarco, cor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="sky">Azul (Sky)</option>
                    <option value="purple">Roxo (Purple)</option>
                    <option value="amber">Amarelo/Laranja (Amber)</option>
                    <option value="rose">Rosa/Vermelho (Rose)</option>
                    <option value="emerald">Verde (Emerald)</option>
                    <option value="indigo">Índigo (Indigo)</option>
                    <option value="teal">Verde Água (Teal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Título da Situação / Marco</label>
                <input
                  type="text"
                  value={editingMarco.titulo || ""}
                  onChange={(e) => setEditingMarco({ ...editingMarco, titulo: e.target.value })}
                  placeholder="Ex: Envio do Relatório Mensal de Vendas"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  value={editingMarco.descricao || ""}
                  onChange={(e) => setEditingMarco({ ...editingMarco, descricao: e.target.value })}
                  placeholder="Instruções e detalhamento da tarefa ou marco corporativo..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Responsável(eis)</label>
                  <input
                    type="text"
                    value={editingMarco.responsavel || ""}
                    onChange={(e) => setEditingMarco({ ...editingMarco, responsavel: e.target.value })}
                    placeholder="Ex: Bruno Queiroz / Gerência"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ícone Visual</label>
                  <select
                    value={editingMarco.icone || "calendar"}
                    onChange={(e) => setEditingMarco({ ...editingMarco, icone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="calendar">Calendário 📅</option>
                    <option value="camera">Câmera / Foto 📷</option>
                    <option value="file">Documento / Relatório 📄</option>
                    <option value="alert">Alerta / Inadimplência ⚠️</option>
                    <option value="barchart">Gráfico / Metas 📊</option>
                    <option value="building">Prédio / RH 🏢</option>
                    <option value="clock">Relógio / Vencimento ⏰</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Etiqueta de Alerta / Requisito</label>
                <input
                  type="text"
                  value={editingMarco.tagText || ""}
                  onChange={(e) => setEditingMarco({ ...editingMarco, tagText: e.target.value })}
                  placeholder="Ex: Requer Comprovante / Disparo via WhatsApp"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setEditingMarco(null)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSaveMarco} className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer">
                Salvar Marco
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
