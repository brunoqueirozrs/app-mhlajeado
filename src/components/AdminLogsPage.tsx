import React, { useState, useEffect, useRef } from "react";
import { Terminal, RefreshCw, Server, Activity, AlertTriangle } from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, envRes] = await Promise.all([
        fetch("/api/admin/logs"),
        fetch("/api/admin/env")
      ]);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
      if (envRes.ok) {
        const envData = await envRes.json();
        setEnvVars(envData.env || {});
      }
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/20 rounded-xl">
            <Terminal className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Depuração & Logs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitoramento em tempo real do servidor</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Logs Panel */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 p-4 border-b border-slate-800 bg-slate-950/50">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Terminal do Servidor (IAs)</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center mt-10">Nenhum log registrado ainda.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-slate-500 shrink-0 select-none">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`font-semibold shrink-0 ${
                    log.level === 'error' ? 'text-rose-500' :
                    log.level === 'warn' ? 'text-amber-500' : 'text-sky-400'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className={`break-all ${
                    log.level === 'error' ? 'text-rose-300' :
                    log.level === 'warn' ? 'text-amber-300' : 'text-slate-300'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Env Vars Panel */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <Server className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Variáveis de Ambiente</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {Object.keys(envVars).length === 0 ? (
              <div className="text-sm text-slate-500 text-center">Carregando...</div>
            ) : (
              Object.entries(envVars)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, val]) => (
                <div key={key} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{key}</div>
                  <div className="font-mono text-xs text-slate-800 dark:text-sky-300 break-all">
                    {val || <span className="text-slate-500 italic">Vazio</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
