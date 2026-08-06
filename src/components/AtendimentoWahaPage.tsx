import React, { useState } from "react";
import { AtendimentoSlaPage } from "./AtendimentoSlaPage";
import {
  BellRing,
  Settings,
  Sliders,
  Clock,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Database,
  ShieldAlert,
  Zap,
  Globe,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface AtendimentoWahaPageProps {
  loggedUser: string;
  userRole: "vendedor" | "admin" | "";
  theme?: "light" | "dark";
}

export function AtendimentoWahaPage({ loggedUser, userRole, theme = "dark" }: AtendimentoWahaPageProps) {
  const isLight = theme === "light";
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  // Modern Workflow for Evolution API + Firebase Firestore
  const n8nEvolutionSlaWorkflowJson = JSON.stringify(
    {
      name: "SLA Atendimento - Evolution API & Firebase",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "webhook-evolution-sla",
            options: {}
          },
          id: "node-webhook-sla",
          name: "Webhook SLA",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [100, 300]
        },
        {
          parameters: {
            conditions: {
              boolean: [
                {
                  value1: "={{ $json.body.data.key.fromMe }}",
                  value2: false
                }
              ],
              string: [
                {
                  value1: "={{ $json.body.data.key.remoteJid }}",
                  operation: "notContains",
                  value2: "@g.us"
                }
              ]
            }
          },
          id: "node-if-cliente",
          name: "É Mensagem de Cliente?",
          type: "n8n-nodes-base.if",
          typeVersion: 1,
          position: [340, 300]
        },
        {
          parameters: {
            operation: "upsert",
            collection: "atendimentos_sla",
            documentId: "={{ $json.body.data.key.remoteJid }}",
            columns: "id_atendimento,cliente_nome,cliente_telefone,atendente_nome,timestamp_ultima_mensagem_cliente,status_resposta,alarme_disparado",
            options: {}
          },
          id: "node-firestore-upsert-inicio",
          name: "Firestore: Registrar Atendimento SLA",
          type: "n8n-nodes-base.googleFirestore",
          typeVersion: 1,
          position: [580, 420]
        },
        {
          parameters: {
            amount: 30,
            unit: "minutes"
          },
          id: "node-timer-30min",
          name: "Timer 30 Minutos",
          type: "n8n-nodes-base.wait",
          typeVersion: 1,
          position: [580, 220]
        },
        {
          parameters: {
            method: "POST",
            url: "={{ $env.EVOLUTION_API_URL || 'https://api.seu-domain.com' }}/message/find/{{ $env.EVOLUTION_INSTANCE || 'minha-instancia' }}",
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "apikey",
                  value: "={{ $env.EVOLUTION_API_KEY }}"
                },
                {
                  name: "Content-Type",
                  value: "application/json"
                }
              ]
            },
            sendBody: true,
            specifyBody: "json",
            jsonBody: "={\n  \"where\": {\n    \"key\": {\n      \"remoteJid\": \"{{ $node['Webhook SLA'].json.body.data.key.remoteJid }}\"\n    }\n  },\n  \"limit\": 1\n}"
          },
          id: "node-consulta-evolution",
          name: "Consulta Última Msg Evolution API",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [820, 220]
        },
        {
          parameters: {
            conditions: {
              boolean: [
                {
                  value1: "={{ $json[0].key.fromMe }}",
                  value2: false
                }
              ]
            }
          },
          id: "node-if-unanswered",
          name: "Ainda sem resposta?",
          type: "n8n-nodes-base.if",
          typeVersion: 1,
          position: [1060, 220]
        },
        {
          parameters: {
            method: "POST",
            url: "={{ $env.EVOLUTION_API_URL || 'https://api.seu-domain.com' }}/message/sendText/{{ $env.EVOLUTION_INSTANCE || 'minha-instancia' }}",
            sendHeaders: true,
            headerParameters: {
              parameters: [
                {
                  name: "apikey",
                  value: "={{ $env.EVOLUTION_API_KEY }}"
                },
                {
                  name: "Content-Type",
                  value: "application/json"
                }
              ]
            },
            sendBody: true,
            specifyBody: "json",
            jsonBody: "={\n  \"number\": \"{{ $env.GESTOR_WHATSAPP || '5551999999999' }}\",\n  \"text\": \"🚨 *ALERTA DE SLA (30 Min)*\\n\\nO cliente *{{ $node['Webhook SLA'].json.body.data.pushName || $node['Webhook SLA'].json.body.data.key.remoteJid }}* está há mais de 30 minutos sem resposta no WhatsApp!\\n\\n📱 Número: {{ $node['Webhook SLA'].json.body.data.key.remoteJid }}\"\n}"
          },
          id: "node-alerta-gestor",
          name: "Alerta WhatsApp Gestor",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 3,
          position: [1300, 220]
        },
        {
          parameters: {
            operation: "update",
            collection: "atendimentos_sla",
            documentId: "={{ $node['Webhook SLA'].json.body.data.key.remoteJid }}",
            columns: "alarme_disparado,timestamp_alarme",
            options: {}
          },
          id: "node-firestore-update-alarme",
          name: "Firestore: Marcar Alarme Disparado",
          type: "n8n-nodes-base.googleFirestore",
          typeVersion: 1,
          position: [1540, 220]
        }
      ],
      connections: {
        "Webhook SLA": {
          main: [[{ node: "É Mensagem de Cliente?", type: "main", index: 0 }]]
        },
        "É Mensagem do Cliente?": {
          main: [
            [
              { node: "Firestore: Registrar Atendimento SLA", type: "main", index: 0 },
              { node: "Timer 30 Minutos", type: "main", index: 0 }
            ]
          ]
        },
        "Timer 30 Minutos": {
          main: [[{ node: "Consulta Última Msg Evolution API", type: "main", index: 0 }]]
        },
        "Consulta Última Msg Evolution API": {
          main: [[{ node: "Ainda sem resposta?", type: "main", index: 0 }]]
        },
        "Ainda sem resposta?": {
          main: [[{ node: "Alerta WhatsApp Gestor", type: "main", index: 0 }]]
        },
        "Alerta WhatsApp Gestor": {
          main: [[{ node: "Firestore: Marcar Alarme Disparado", type: "main", index: 0 }]]
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
      {/* Top Bar for SLA Module */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b shrink-0 transition ${
          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-tight">Central de Alarmes SLA (Evolution API)</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                Evolution API + Firestore Active
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Sincronização em tempo real de filas de SLA (15 e 30 min) via Firebase Firestore
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Ver Guia de Integração n8n, Evolution API & Firebase"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Guia n8n & Firebase</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 border rounded-xl transition cursor-pointer active:scale-95 ${
              isFullscreen
                ? "bg-amber-600 text-white border-amber-500"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
            title={isFullscreen ? "Sair da Tela Cheia" : "Modo Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Main SLA View Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
        <AtendimentoSlaPage theme={theme} />
      </div>

      {/* SLA n8n Integration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">Guia de Automação Evolution API & Firebase</h2>
                  <p className="text-[11px] text-slate-400">Estrutura e Nó do n8n para gravar alertas no Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {/* Copy Workflow JSON Banner */}
              <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> Fluxo n8n Completo (Evolution API + Firestore)
                  </h3>
                  <button
                    onClick={() => copyToClipboard(n8nEvolutionSlaWorkflowJson)}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-[11px] transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedJson ? "Copiado!" : "Copiar Fluxo n8n (JSON)"}
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Este fluxo recebe o webhook da <strong>Evolution API</strong>, salva automaticamente a conversa na coleção <code className="text-amber-400 font-mono">atendimentos_sla</code> do Firestore e, após 30 minutos sem resposta, envia o alerta ao gestor e atualiza a flag <code className="text-red-400 font-mono">alarme_disparado = true</code>.
                </p>
              </div>

              {/* Firestore Schema Reference */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> 🛠️ Estrutura de Campos no Firebase Firestore
                </h4>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-1.5 px-2">Campo</th>
                        <th className="py-1.5 px-2">Tipo</th>
                        <th className="py-1.5 px-2">Descrição / Exemplo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">id_atendimento</td>
                        <td className="py-1.5 px-2 text-sky-400">String</td>
                        <td className="py-1.5 px-2 text-slate-400">RemoteJid da Evolution (ex: 5551999999999@s.whatsapp.net)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">cliente_nome</td>
                        <td className="py-1.5 px-2 text-sky-400">String</td>
                        <td className="py-1.5 px-2 text-slate-400">PushName do cliente (ex: Carlos Silva)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">cliente_telefone</td>
                        <td className="py-1.5 px-2 text-sky-400">String</td>
                        <td className="py-1.5 px-2 text-slate-400">Telefone formatado (ex: (51) 99999-9999)</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">atendente_nome</td>
                        <td className="py-1.5 px-2 text-sky-400">String</td>
                        <td className="py-1.5 px-2 text-slate-400">Nome do operador/equipe responsável</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">timestamp_ultima_mensagem_cliente</td>
                        <td className="py-1.5 px-2 text-emerald-400">Timestamp</td>
                        <td className="py-1.5 px-2 text-slate-400">Horário que a mensagem do cliente chegou</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">status_resposta</td>
                        <td className="py-1.5 px-2 text-sky-400">String</td>
                        <td className="py-1.5 px-2 text-slate-400">"aguardando" ou "respondido"</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">alarme_disparado</td>
                        <td className="py-1.5 px-2 text-purple-400">Boolean</td>
                        <td className="py-1.5 px-2 text-slate-400">true quando estourar 30 min sem resposta</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 text-amber-400">timestamp_alarme</td>
                        <td className="py-1.5 px-2 text-emerald-400">Timestamp</td>
                        <td className="py-1.5 px-2 text-slate-400">Data/Hora em que o alarme foi enviado ao WhatsApp do gestor</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step by Step n8n setup */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Como Configurar o Nó do Firebase no n8n:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <li>No n8n, adicione o nó <strong>Google Firestore</strong>.</li>
                  <li>Em <strong>Credential</strong>, selecione <i>OAuth2 API</i> ou <i>Service Account</i> do GCP.</li>
                  <li>Configure o campo <strong>Collection</strong> como <code className="text-amber-400 font-mono">atendimentos_sla</code>.</li>
                  <li>Defina o <strong>Document ID</strong> como <code className="text-amber-400 font-mono">{"={{ $json.body.data.key.remoteJid }}"}</code>.</li>
                  <li>No modo <strong>Upsert</strong> ou <strong>Update</strong>, grave os campos mapeados acima.</li>
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AtendimentoWahaPage;
