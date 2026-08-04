import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Settings,
  ShieldCheck,
  Clock,
  Bot,
  Zap,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Sliders,
  ChevronRight,
  Info,
  Sparkles,
  User,
  Lock,
  Volume2,
  ShieldAlert,
  Cpu,
  ArrowUpRight,
  Server,
  Code
} from "lucide-react";

interface AtendimentoWahaPageProps {
  loggedUser: string;
  userRole: "vendedor" | "admin" | "";
  theme?: "light" | "dark";
}

const DEFAULT_CHATWOOT_URL = "http://localhost:3000";

export function AtendimentoWahaPage({ loggedUser, userRole, theme = "dark" }: AtendimentoWahaPageProps) {
  const isLight = theme === "light";

  // State for Chatwoot URL
  const [chatwootUrl, setChatwootUrl] = useState<string>(() => {
    return localStorage.getItem("chatwoot_url") || DEFAULT_CHATWOOT_URL;
  });

  const [inputUrl, setInputUrl] = useState<string>(chatwootUrl);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"chatwoot" | "sla_n8n" | "docker">("chatwoot");

  // Save Chatwoot URL
  const handleSaveUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let formatted = inputUrl.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      formatted = "http://" + formatted;
    }
    // Remove trailing slash if present
    formatted = formatted.replace(/\/+$/, "");
    setChatwootUrl(formatted);
    setInputUrl(formatted);
    localStorage.setItem("chatwoot_url", formatted);
    setIframeKey((prev) => prev + 1);
    setShowConfigModal(false);
  };

  const handleRefreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(chatwootUrl, "_blank", "noopener,noreferrer");
  };

  const copyToClipboard = (text: string, type: "json" | "url") => {
    navigator.clipboard.writeText(text);
    if (type === "json") {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const n8nSlaWorkflowJson = JSON.stringify(
    {
      name: "SLA Watchdog - Alerta 30 Minutos WAHA",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "waha-webhook",
            options: {}
          },
          id: "node-waha-trigger",
          name: "WAHA Trigger (Webhook)",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [100, 300]
        },
        {
          parameters: {
            conditions: {
              boolean: [
                {
                  value1: "={{ $json.body.payload.fromMe }}",
                  value2: false
                }
              ],
              string: [
                {
                  value1: "={{ $json.body.payload.from }}",
                  operation: "notContains",
                  value2: "@g.us"
                }
              ]
            }
          },
          id: "node-if-cliente",
          name: "É Mensagem do Cliente?",
          type: "n8n-nodes-base.if",
          typeVersion: 1,
          position: [320, 300]
        },
        {
          parameters: {
            amount: 30,
            unit: "minutes"
          },
          id: "node-wait-30min",
          name: "Aguardar 30 Minutos (SLA)",
          type: "n8n-nodes-base.wait",
          typeVersion: 1,
          position: [540, 200]
        },
        {
          parameters: {
            url: "={{ $env.WAHA_API_URL || 'http://waha:3000' }}/api/messages?chatId={{ $json.body.payload.chatId || $json.body.payload.from }}&limit=1",
            options: {}
          },
          id: "node-check-waha",
          name: "Consultar Última Msg no WAHA",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [760, 200]
        },
        {
          parameters: {
            conditions: {
              boolean: [
                {
                  value1: "={{ $json[0].fromMe }}",
                  value2: false
                }
              ]
            }
          },
          id: "node-if-unanswered",
          name: "Ainda Sem Resposta?",
          type: "n8n-nodes-base.if",
          typeVersion: 1,
          position: [980, 200]
        },
        {
          parameters: {
            method: "POST",
            url: "={{ $env.WAHA_API_URL || 'http://waha:3000' }}/api/sendText",
            sendBody: true,
            specifyBody: "json",
            jsonBody: "={\n  \"session\": \"default\",\n  \"chatId\": \"{{ $env.GESTOR_WHATSAPP || '5551999999999@c.us' }}\",\n  \"text\": \"🚨 *ALERTA SLA (30 Min)*\\n\\nO cliente *{{ $node['WAHA Trigger (Webhook)'].json.body.payload.pushName || $node['WAHA Trigger (Webhook)'].json.body.payload.from }}* está há mais de 30 minutos aguardando resposta no Chatwoot!\\n\\n📱 Número: {{ $node['WAHA Trigger (Webhook)'].json.body.payload.from }}\"\n}"
          },
          id: "node-send-alert",
          name: "Disparar Alerta ao Gestor",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [1200, 200]
        }
      ],
      connections: {
        "WAHA Trigger (Webhook)": {
          main: [[{ node: "É Mensagem do Cliente?", type: "main", index: 0 }]]
        },
        "É Mensagem do Cliente?": {
          main: [[{ node: "Aguardar 30 Minutos (SLA)", type: "main", index: 0 }]]
        },
        "Aguardar 30 Minutos (SLA)": {
          main: [[{ node: "Consultar Última Msg no WAHA", type: "main", index: 0 }]]
        },
        "Consultar Última Msg no WAHA": {
          main: [[{ node: "Ainda Sem Resposta?", type: "main", index: 0 }]]
        },
        "Ainda Sem Resposta?": {
          main: [[{ node: "Disparar Alerta ao Gestor", type: "main", index: 0 }]]
        }
      }
    },
    null,
    2
  );

  return (
    <div
      className={`flex flex-col w-full h-[calc(100vh-100px)] lg:h-[calc(100vh-48px)] transition-all ${
        isFullscreen ? "fixed inset-0 z-[9999] bg-slate-950 p-0 h-screen w-screen" : "relative"
      }`}
    >
      {/* Top Navigation & Status Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b shrink-0 transition ${
          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight">Portal de Atendimento Chatwoot</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Operacional
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Operador conectado: <strong className="text-sky-400">{loggedUser || "Ana Paula / Consultor"}</strong> · Áudios, mídias e conversas integrados
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-300 font-mono text-[11px] truncate max-w-[180px] sm:max-w-[260px]">
              {chatwootUrl}
            </span>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Alterar URL do Chatwoot e Ver Guia SLA"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span>Configurar</span>
          </button>

          <button
            onClick={handleRefreshIframe}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer active:scale-95"
            title="Recarregar Chatwoot"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={handleOpenExternal}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer active:scale-95"
            title="Abrir Chatwoot em nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 border rounded-xl transition cursor-pointer active:scale-95 ${
              isFullscreen
                ? "bg-sky-600 text-white border-sky-500"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
            title={isFullscreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-sky-400" />}
          </button>
        </div>
      </div>

      {/* Main View Area: Chatwoot Iframe */}
      <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
        <iframe
          key={iframeKey}
          src={chatwootUrl}
          title="Chatwoot Atendimento"
          className="w-full h-full border-none shadow-inner"
          allow="camera; microphone; autoplay; clipboard-write; encrypted-media; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads"
        />

        {/* Fallback Notice Overlay (only shows if user clicks on URL issue or needs help) */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-4 text-xs z-10 pointer-events-auto max-w-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 text-[11px]">
              Tendo problemas de acesso ao Chatwoot no iframe?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenExternal}
              className="text-sky-400 hover:text-sky-300 font-bold underline text-[11px] cursor-pointer"
            >
              Abrir em Nova Aba
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-2.5 py-1 bg-sky-600/20 text-sky-300 border border-sky-500/30 rounded-lg font-bold text-[10px] hover:bg-sky-600/30 transition cursor-pointer"
            >
              Ajustar URL
            </button>
          </div>
        </div>
      </div>

      {/* Configuration & SLA Watchdog Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">Configurações & SLA Watchdog</h2>
                  <p className="text-[11px] text-slate-400">Ajuste o portal Chatwoot e configure o monitoramento de SLA</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveSubTab("chatwoot")}
                className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
                  activeSubTab === "chatwoot"
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                1. URL do Chatwoot
              </button>
              <button
                onClick={() => setActiveSubTab("sla_n8n")}
                className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
                  activeSubTab === "sla_n8n"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                2. Fluxo SLA (30 Min) - n8n
              </button>
              <button
                onClick={() => setActiveSubTab("docker")}
                className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
                  activeSubTab === "docker"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                3. Docker Compose Chatwoot
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {activeSubTab === "chatwoot" && (
                <div className="space-y-5">
                  <form onSubmit={handleSaveUrl} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1.5">
                        URL de Acesso ao Chatwoot Container
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="http://localhost:3000 ou https://seu-chatwoot.com"
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-sky-600/20"
                        >
                          Salvar URL
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Exemplo local: <code className="text-sky-400">http://localhost:3000</code> ou IP da VPS <code className="text-sky-400">http://192.168.1.100:3000</code>
                      </p>
                    </div>
                  </form>

                  <div className="p-4 bg-sky-950/30 border border-sky-800/40 rounded-2xl space-y-2">
                    <h3 className="font-bold text-sky-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" /> Permissões do Iframe Ativadas
                    </h3>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      O iframe do sistema está pré-configurado com suporte completo para <strong>áudios do WhatsApp</strong>, gravação de microfone, envio de documentos e mídias do Chatwoot sem travamentos.
                    </p>
                  </div>
                </div>
              )}

              {activeSubTab === "sla_n8n" && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400" /> Fluxo Cão de Guarda de SLA (30 Minutos)
                      </h3>
                      <button
                        onClick={() => copyToClipboard(n8nSlaWorkflowJson, "json")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedJson ? "Copiado!" : "Copiar JSON para n8n"}
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Este fluxo monitora cada mensagem recebida do cliente no WAHA, aguarda 30 minutos sem usar banco de dados e checa se o cliente continua sem resposta. Caso não tenha sido atendido, ele notifica o gestor via WhatsApp!
                    </p>
                  </div>

                  {/* Step by step guide */}
                  <div className="space-y-2 text-slate-300">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                      Passo a Passo de Configuração no n8n:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                      <li>No n8n, clique em <strong>New Workflow</strong> &gt; menu de 3 pontos &gt; <strong>Import from JSON</strong>.</li>
                      <li>Cole o JSON copiado acima.</li>
                      <li>No nó <strong>WAHA Trigger</strong>, copie a URL do Webhook gerada e cole nas configurações de Webhook do seu container WAHA (evento <code className="text-emerald-400">message.any</code>).</li>
                      <li>No nó <strong>Disparar Alerta ao Gestor</strong>, informe o número de WhatsApp do Gestor (ex: <code className="text-emerald-400">5551999999999@c.us</code>).</li>
                      <li>Ative o workflow no botão <strong>Active</strong>.</li>
                    </ol>
                  </div>
                </div>
              )}

              {activeSubTab === "docker" && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-2xl space-y-2">
                    <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-amber-400" /> Docker Compose do Chatwoot (Custo Zero)
                    </h3>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Arquivo enxuto para rodar o Chatwoot Open Source na mesma máquina VPS / servidor onde rodam seu WAHA e n8n.
                    </p>
                  </div>

                  <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-60">
                    <pre>{`version: '3.8'

services:
  chatwoot:
    image: chatwoot/chatwoot:latest
    container_name: chatwoot
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
      - SECRET_KEY_BASE=sua_chave_secreta_aqui_gerada_aleatoriamente
      - FRONTEND_URL=http://localhost:3000
      - POSTGRES_HOST=postgres
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=chatwoot_pass
      - POSTGRES_DATABASE=chatwoot_production
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    entrypoint: docker/entrypoints/rails.sh
    command: bundle exec rails s -p 3000 -b 0.0.0.0

  postgres:
    image: postgres:12-alpine
    container_name: chatwoot_db
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=chatwoot_pass
      - POSTGRES_DB=chatwoot_production
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    container_name: chatwoot_redis
    restart: always
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:`}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AtendimentoWahaPage;
