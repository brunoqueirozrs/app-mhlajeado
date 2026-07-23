import React, { useState, useEffect } from 'react';
import { Link, Edit2, Save, X, CheckCircle, Search, Settings, Webhook, Zap, RefreshCw, History, Cpu, Activity, Database, Cable, Star, Server, Copy, Check, AlertTriangle } from 'lucide-react';

const EditableEnvUrl = ({ envKey, initialValue, onSave }: { envKey: string, initialValue: string, onSave: (key: string, url: string) => Promise<void> }) => {
  const [val, setVal] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { setVal(initialValue || ""); }, [initialValue]);

  const handleSave = async () => {
    setLoading(true);
    await onSave(envKey, val);
    setLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <input 
        type="text" 
        value={val} 
        onChange={e => setVal(e.target.value)}
        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
        placeholder="https://..."
      />
      <button 
        onClick={handleSave} 
        disabled={loading || val === (initialValue || "")} 
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
          isSaved ? "bg-emerald-500 text-white" :
          val !== (initialValue || "") ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
        {isSaved ? "Salvo" : "Salvar"}
      </button>
    </div>
  );
};

export function AdminN8NPage() {

  const [envConfig, setEnvConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnvConfig();
  }, []);

  const fetchEnvConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/env/n8n');
      if (res.ok) {
        const data = await res.json();
        setEnvConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };


  const toggleAllEnvVars = async (isTest: boolean) => {
    createBackup();
    if (!confirm(`Tem certeza que deseja ativar o modo ${isTest ? 'TESTE' : 'PRODUÇÃO'} em todas as integrações?`)) return;
    try {
      setLoading(true);
      const res = await fetch('/api/env/n8n/toggle-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTest })
      });
      if (res.ok) {
        await fetchEnvConfig();
        alert(`Modo ${isTest ? 'TESTE' : 'PRODUÇÃO'} ativado em todas as integrações!`);
      } else {
        alert("Erro ao alterar as variáveis globalmente.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao alterar as variáveis.");
    } finally {
      setLoading(false);
    }
  };

  const createBackup = () => {
    if (envConfig) {
      localStorage.setItem('n8n_env_backup', JSON.stringify(envConfig));
    }
  };

  const restoreBackup = async () => {
    const backupStr = localStorage.getItem('n8n_env_backup');
    if (!backupStr) {
      alert("Nenhum backup encontrado.");
      return;
    }
    if (!confirm("Tem certeza que deseja restaurar o estado anterior das variáveis?")) return;
    
    try {
      setLoading(true);
      const backup = JSON.parse(backupStr);
      const res = await fetch('/api/env/n8n/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: backup })
      });
      if (res.ok) {
        setEnvConfig(backup);
        alert("Configurações restauradas com sucesso!");
      } else {
        alert("Erro ao restaurar.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao restaurar backup.");
    } finally {
      setLoading(false);
    }
  };

  const updateEnvUrl = async (key: string, url: string) => {
    createBackup();
    try {
      const res = await fetch('/api/env/n8n/update-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, url })
      });
      if (res.ok) {
        setEnvConfig({ ...envConfig, [key]: url });
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar URL");
    }
  };

  const toggleEnvVar = async (key: string, currentValue: string) => {
    createBackup();
    const newValue = currentValue === "true" ? "false" : "true";
    try {
      const res = await fetch('/api/env/n8n/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: newValue })
      });
      if (res.ok) {
        setEnvConfig({ ...envConfig, [key]: newValue });
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao alterar variável");
    }
  };

  const testWebhook = async (url: string, type: string) => {
    if (!url) {
      alert("URL do webhook não configurada.");
      return;
    }
    try {
      const res = await fetch('/api/n8n/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type })
      });
      if (res.ok) {
        alert("Teste enviado com sucesso!");
      } else {
        alert("Erro no teste.");
      }
    } catch (e) {
      alert("Erro de conexão ao testar.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Webhook className="w-8 h-8 text-sky-600" />
            Integrações N8N
          </h1>
          <p className="text-slate-500 mt-2">Gerencie as URLs de webhook e as rotinas automatizadas.</p>
        </div>
        <button 
          onClick={restoreBackup}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm"
        >
          <History className="w-4 h-4" />
          Restaurar Backup
        </button>
      </div>

            

      <div className="card-modern rounded-3xl p-6 bg-white border border-slate-200">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          Configurações de Webhooks
        </h3>

        {loading ? (
          <div className="text-center text-slate-500 text-sm py-8">Carregando configurações...</div>
        ) : envConfig ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={() => toggleAllEnvVars(false)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                <CheckCircle className="w-4 h-4" /> ATIVAR MODO PRODUÇÃO EM TUDO
              </button>
              <button onClick={() => toggleAllEnvVars(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Zap className="w-4 h-4" /> ATIVAR MODO TESTE EM TUDO
              </button>
              {envConfig.PAUSE_ALL_N8N_WEBHOOKS !== undefined && (
                <button onClick={() => toggleEnvVar('PAUSE_ALL_N8N_WEBHOOKS', envConfig.PAUSE_ALL_N8N_WEBHOOKS)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors ml-auto">
                  <AlertTriangle className="w-4 h-4" /> {envConfig.PAUSE_ALL_N8N_WEBHOOKS === 'true' ? "RETOMAR TODAS AS OPERAÇÕES N8N" : "PAUSAR TODAS AS OPERAÇÕES N8N"}
                </button>
              )}
            </div>
            <div className="grid gap-6">
              {[
                {
                  id: "1", title: "1. Resumo de Vendas",
                  url: "N8N_WEBHOOK_URL", testUrl: "N8N_TEST_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_AGENDAMENTO", pause: "PAUSE_AGENDAMENTO_JOB", type: "agendamento"
                },
                {
                  id: "2", title: "2. Nova Tarefa",
                  url: "N8N_NEW_TASK_WEBHOOK_URL", testUrl: "N8N_TEST_NEW_TASK_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_NEW_TASK", pause: "PAUSE_NEW_TASK_JOB", type: "new_task"
                },
                {
                  id: "3", title: "3. Tarefas Atrasadas",
                  url: "N8N_OVERDUE_TASKS_WEBHOOK_URL", testUrl: "N8N_TEST_OVERDUE_TASKS_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_OVERDUE_TASKS", pause: "PAUSE_OVERDUE_TASKS_JOB", type: "overdue"
                },
                {
                  id: "4", title: "4. Inatividade de Lead",
                  url: "N8N_LEAD_INACTIVITY_WEBHOOK_URL", testUrl: "N8N_TEST_LEAD_INACTIVITY_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_LEAD_INACTIVITY", pause: "PAUSE_LEAD_INACTIVITY_JOB", type: "inactivity"
                },
                {
                  id: "5", title: "5. Upgrade de Base",
                  url: "N8N_UPGRADE_BASE_WEBHOOK_URL", testUrl: "N8N_TEST_UPGRADE_BASE_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_UPGRADE_BASE", pause: "PAUSE_UPGRADE_BASE_JOB", type: "upgrade"
                },
                {
                  id: "6", title: "6. Pós-Venda",
                  url: "N8N_POS_VENDA_WEBHOOK_URL", testUrl: "N8N_TEST_POS_VENDA_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_POS_VENDA", pause: "PAUSE_POS_VENDA_JOB", type: "pos_venda"
                },
                {
                  id: "7", title: "7. Cobranças PAP",
                  url: "N8N_WEBHOOK_URL_COBRANCAS", testUrl: "N8N_TEST_WEBHOOK_URL_COBRANCAS",
                  useTest: "USE_N8N_TEST_COBRANCAS", pause: "PAUSE_COBRANCAS_JOB", type: "cobrancas"
                },
                {
                  id: "8", title: "8. Vendas SVA",
                  url: "N8N_WEBHOOK_URL_VENDAS_SVA", testUrl: "N8N_TEST_WEBHOOK_URL_VENDAS_SVA",
                  useTest: "USE_N8N_TEST_VENDAS_SVA", pause: "PAUSE_VENDAS_SVA_JOB", type: "vendas_sva"
                },
                {
                  id: "9", title: "9. Indicações",
                  url: "N8N_WEBHOOK_URL_INDICACOES", testUrl: "N8N_TEST_WEBHOOK_URL_INDICACOES",
                  useTest: "USE_N8N_TEST_INDICACOES", pause: "PAUSE_INDICACOES_JOB", type: "indicacoes"
                },
                {
                  id: "10", title: "10. Concorrentes",
                  url: "N8N_COMPETITORS_WEBHOOK_URL", testUrl: "N8N_TEST_COMPETITORS_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_COMPETITORS", pause: "PAUSE_COMPETITORS_JOB", type: "concorrentes"
                },
                {
                  id: "11", title: "11. Faltas (Envio)",
                  url: "N8N_ABSENCES_WEBHOOK_URL", testUrl: "N8N_TEST_ABSENCES_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_ABSENCES", pause: "PAUSE_ABSENCES_JOB", type: "absences"
                },
                {
                  id: "12", title: "12. Faltas (Aprovação WhatsApp)",
                  url: "N8N_ABSENCE_APPROVAL_WEBHOOK_URL", testUrl: "N8N_TEST_ABSENCE_APPROVAL_WEBHOOK_URL",
                  useTest: "USE_N8N_TEST_ABSENCE_APPROVAL", pause: "PAUSE_ABSENCE_APPROVAL_JOB", type: "absence_approval"
                }
              ].map(block => (
                <div key={block.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-700">{block.title}</h4>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => testWebhook(envConfig[block.useTest] === "true" ? envConfig[block.testUrl] : envConfig[block.url], block.type)} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium">
                        <Zap className="w-3 h-3" /> Testar
                      </button>
                      <button 
                        onClick={() => toggleEnvVar(block.pause, envConfig[block.pause])}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig[block.pause] === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                      >
                        {envConfig[block.pause] === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                      </button>
                      <button 
                        onClick={() => toggleEnvVar(block.useTest, envConfig[block.useTest])}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig[block.useTest] === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                      >
                        Modo {envConfig[block.useTest] === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-[11px] font-mono">
                    <div className="grid grid-cols-[1fr_2fr] gap-2">
                      <span className="text-slate-500">{block.url}:</span>
                      <EditableEnvUrl envKey={block.url} initialValue={envConfig[block.url]} onSave={updateEnvUrl} />
                    </div>
                    <div className="grid grid-cols-[1fr_2fr] gap-2">
                      <span className="text-slate-500">{block.testUrl}:</span>
                      <EditableEnvUrl envKey={block.testUrl} initialValue={envConfig[block.testUrl]} onSave={updateEnvUrl} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="text-center text-rose-500 text-xs py-4">Erro ao carregar configurações.</div>
        )}
      </div>
    </div>
  );
}
