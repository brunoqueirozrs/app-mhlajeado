import React, { useState, useEffect } from 'react';
import { Link, CheckCircle, Search, Settings, Webhook, Zap, RefreshCw, History, Cpu, Activity, Database, Cable, Star, Server, Copy, Check, AlertTriangle } from 'lucide-react';

export const AdminN8NPage = () => {
  const [template1, setTemplate1] = useState(() => localStorage.getItem('n8n_template1') || "Olá, *{{ $json.body.nomeCliente }}*! Tudo bem? Aqui é da MHNET Lajeado/Estrela. 🚀\n\nPassando para confirmar que o agendamento da sua instalação está marcadíssimo! \n\n📅 *Data:* {{ $json.body.dataAgendamento }}\n⏰ *Horário:* {{ $json.body.horario }}\n📌 *Endereço:* {{ $json.body.endereco }}\n\nInstruções importantes:\n- Tenha alguém maior de 18 anos no local.\n- Deixe o local da instalação desobstruído.\n- Fique atento ao telefone, nosso técnico ligará avisando quando estiver a caminho.\n\nQualquer dúvida, estamos à disposição!");
  const [template2, setTemplate2] = useState(() => localStorage.getItem('n8n_template2') || "✅ *Novo Agendamento de Instalação Realizado!*\n\n📌 *Protocolo MHNET*\n{{ $json.body.protocolRaw ? $json.body.protocolRaw.trim() : 'Protocolo - O&M - Ativação FTTH / O&M - Ativação/Instalação de Cliente - ' + $json.body.nomeCliente.toUpperCase() + '\n\nCPF:\nEndereço: ' + $json.body.endereco + '\nBairro:\nCidade: ' + $json.body.cidade + '\n\nVendedor / Consultor: ' + $json.body.vendedorResponsavel + '\n\nTelefone do Cliente * ' + $json.body.telefone + '\n\nTurno: ' + $json.body.dataAgendamento }}\n\nFique de olho no acompanhamento pós-venda!");
  const [template3, setTemplate3] = useState(() => localStorage.getItem('n8n_template3') || "📋 *Nova Tarefa Atribuída!*\n\nLead: {{ $json.body.nomeLead }}\nTarefa: {{ $json.body.descricao }}\nPrazo: {{ $json.body.dataLimite }}\n\nNão esqueça de atualizar o status no sistema após concluir!");
  const [template4, setTemplate4] = useState(() => localStorage.getItem('n8n_template4') || "⚠️ *Atenção! Tarefa Atrasada*\n\nLead: {{ $json.body.nomeLead }}\nTarefa: {{ $json.body.descricao }}\nPrazo Original: {{ $json.body.dataLimite }}\n\nPor favor, dê prioridade a esta pendência!");

  useEffect(() => { localStorage.setItem('n8n_template1', template1); }, [template1]);
  useEffect(() => { localStorage.setItem('n8n_template2', template2); }, [template2]);
  useEffect(() => { localStorage.setItem('n8n_template3', template3); }, [template3]);
  useEffect(() => { localStorage.setItem('n8n_template4', template4); }, [template4]);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyTemplate = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [envConfig, setEnvConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnvConfig = () => {
    setLoading(true);
    fetch("/api/env/n8n")
      .then(r => r.json())
      .then(data => {
        setEnvConfig(data);
        setLoading(false);
      })
      .catch(e => {
        console.error("Erro ao carregar variaveis", e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEnvConfig();
  }, []);

  const toggleEnvVar = async (key: string, currentValue: string) => {
    try {
      const newValue = currentValue === "true" ? false : true;
      const res = await fetch("/api/env/n8n/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ key, value: newValue })
      });
      if (res.ok) {
        // Recarrega as configurações para garantir que tudo (incluindo dependências) esteja sincronizado
        fetchEnvConfig();
      } else {
        alert("Erro ao alternar modo.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação ao alternar modo.");
    }
  };

  
  const setAllTestMode = async (isTest: boolean) => {
    try {
      const res = await fetch("/api/env/n8n/toggle-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isTest })
      });
      if (res.ok) {
        await fetchEnvConfig();
        alert(`Todos os módulos alterados para modo ${isTest ? 'TESTE' : 'PRODUÇÃO'} com sucesso!`);
      } else {
        alert("Erro ao alternar todos os modos.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação ao alternar modos.");
    }
  };

  const testWebhook = async (webhookUrl: string, eventName: string) => {
    try {
      let payload: any = {
        event: eventName,
        test: true,
        timestamp: new Date().toISOString(),
        message: "Payload de teste enviado pelo Painel Admin"
      };

      if (eventName === 'novo_agendamento') {
         payload = {
            ...payload,
            nomeCliente: "BRUNO CLINTE",
            telefone: "555184487818",
            cpf: "123.456.789-10",
            endereco: "Av. Alberto Pasqualine 624",
            bairro: "Americameno",
            cidade: "Lajeado",
            planoEscolhido: "Fibra 500Mbps",
            dataAgendamento: "05/07/2026 Manhã",
            vendedorResponsavel: "Bruno Vendedor",
            vendedor_telefone: "555180987818",
            gerente: "Gerente Teste",
            protocolRaw: `Protocolo - O&M - Ativação FTTH / O&M - Ativação/Instalação de Cliente - BRUNO GARCIA QUEIROZ TESTE N8N AGENDAMENTO\n\nNOME DO CLIENTE BRUNO CLINTE\nCPF: 123.456.789-10\nBairro: Americameno\nCidade: Lajeado\nEndereço:Av. Alberto Pasqualine 624\nTelefone Clinete: 51 984487818\n\nTelefone Vendedor: 51 980987818\nVendedor: Bruno Vendedor`,
            mensagem_cliente: "Olá, BRUNO CLINTE! Aqui é da MHNET Lajeado/Estrela. O seu agendamento de instalação da fibra óptica está confirmado para o dia 05/07/2026 Manhã.\n\nInstruções:\n- Tenha alguém maior de 18 anos no local.\n- Deixe o local da instalação desobstruído.\n- Fique atento ao telefone, nosso técnico ligará avisando quando estiver a caminho.\n\nQualquer dúvida, estamos à disposição!",
            mensagem_vendedor: `✅ Novo Agendamento de Instalação Realizado!\n\n📌 *Protocolo MHNET*\nProtocolo - O&M - Ativação FTTH / O&M - Ativação/Instalação de Cliente - BRUNO GARCIA QUEIROZ TESTE N8N AGENDAMENTO\n\nNOME DO CLIENTE BRUNO CLINTE\nCPF: 123.456.789-10\nBairro: Americameno\nCidade: Lajeado\nEndereço:Av. Alberto Pasqualine 624\nTelefone Clinete: 51 984487818\n\nTelefone Vendedor: 51 980987818\nVendedor: Bruno Vendedor\n\nFique de olho no acompanhamento pós-venda!`
         };
      } else if (eventName === 'nova_tarefa') {
         payload = {
            ...payload,
            task_id: "tarefa-teste-123",
            vendedor: "Vendedor Teste",
            vendedor_telefone: "555199999999",
            descricao: "Ligar para o lead João para oferecer plano de 1Gbps.",
            nomeLead: "João da Silva Teste",
            dataLimite: "05/07/2026 14:00",
            status: "Pendente",
            mensagem_vendedor: "📋 *Nova Tarefa Atribuída!*\nLead: João da Silva Teste\nTarefa: Ligar para o lead João para oferecer plano de 1Gbps.\nPrazo: 05/07/2026 14:00\n\nNão esqueça de atualizar o status no sistema após concluir!"
         }
      } else if (eventName === 'tarefa_atrasada') {
         payload = {
            ...payload,
            task_id: "tarefa-teste-456",
            vendedor: "Vendedor Teste",
            vendedor_telefone: "555199999999",
            descricao: "Enviar contrato para Maria assinar.",
            nomeLead: "Maria Teste",
            dataLimite: "03/07/2026 09:00",
            status: "Atrasada",
            mensagem_vendedor: "⚠️ *Atenção! Tarefa Atrasada*\nLead: Maria Teste\nTarefa: Enviar contrato para Maria assinar.\nPrazo Original: 03/07/2026 09:00\n\nPor favor, dê prioridade a esta pendência!"
         }
      } else if (eventName === 'lead_inativo') {
         payload = {
            ...payload,
            lead: {
              nomeLead: "Maria Teste",
              telefone: "555188888888",
              vendedor: "Vendedor Teste"
            },
            aviso: "02",
            tempoInativo: "48 horas",
            acao: "Acompanhamento",
            vendedor_telefone: "555199999999",
            mensagem_vendedor: "🚨 Lead Inativo Detectado!\nO lead Maria Teste (555188888888) está inativo há 48 horas.\nVendedor: Vendedor Teste.\n\nDica da IA: Ofereça um desconto especial para fechar hoje!",
            ia_suggestion: "Ofereça um desconto especial para fechar hoje!"
         }
      }

      
      
      else if (eventName === 'upgrade_base') {
         payload = {
            ...payload,
            nome_cliente: "Bruno Cliente Teste",
            telefone: "555188888888",
            plano_atual: "MHNET Fibra 400Mbps",
            valor_atual: 99.90,
            meses_base: 14,
            cidade: "Lajeado",
            bairro: "Centro",
            velocidade_atual: 400
         }
      }
      else if (eventName === 'cobrancas') {
         payload = {
            clientes: [
              {
                codigo_cliente: "cob_test_123",
                nome: "Bruno Cliente Inadimplente Teste",
                telefone: "555188888888",
                data_instalacao: "2022-01-10",
                total_faturas_vencidas: 2,
                baixou_app: "Não",
                descricao_produto: "MHNET Fibra 400Mbps"
              }
            ]
         }
      }
      console.log(`[AdminN8NPage] Enviando payload de teste para ${webhookUrl}:`, payload);

      const res = await fetch("/api/n8n-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, payload })
      });
      
      const data = await res.json();
      console.log(`[AdminN8NPage] Resposta do proxy:`, data);
      
      if (res.ok) {
        alert("Teste enviado com sucesso! Verifique a execução no n8n.\n" + JSON.stringify(data.original || {}));
      } else {
        alert("Falha ao enviar teste: " + (data.error || res.statusText));
      }
    } catch (e) {
      console.error("[AdminN8NPage] Erro ao testar webhook", e);
      alert("Erro ao testar webhook. Verifique o console.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full animate-fade-in pb-32 lg:pb-8">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
         
         <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] uppercase font-black tracking-widest rounded-full mb-3 border border-blue-400/20">
                   <Link className="w-3 h-3" />
                   Painel de Integração
                </div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3">
                  Links, Instruções e Integrações N8N
                </h1>
                <p className="text-xs lg:text-sm text-sky-200 mt-2 font-medium max-w-2xl">
                  Gerencie centralizadamente os nós, gatilhos (webhooks) e fluxos corporativos automatizados rodando no n8n para otimizar os processos de Vendas e Retenção.
                </p>
              </div>
            </div>
         </div>
      </div>

      {/* DASHBOARD GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1 */}
        <div className="card-modern rounded-2xl shadow-sm border border-slate-100 p-6">
           <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 border border-orange-100">
             <Webhook className="w-5 h-5" />
           </div>
           <h3 className="text-slate-800 font-bold text-sm mb-1">Webhook de Upgrade</h3>
           <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
             URL usada pela base de clientes para gerar mensagens IA e disparar promoções na fila do N8N ativo.
           </p>
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative group">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Endpoint Local / Ngrok</div>
              <code className="text-xs text-sky-700 font-mono break-all font-semibold block pr-8">
                 http://localhost:5678/webhook/upgrade-cliente
              </code>
           </div>
           <div className="mt-3 text-[10px] font-bold text-slate-400">
             👉 Configure seu túnel acessando ⚙️ Manutenção Geral.
           </div>
        </div>

        {/* CARD 2 */}
        <div className="card-modern rounded-2xl shadow-sm border border-slate-100 p-6">
           <div className="w-10 h-10 rounded-xl bg-[#E6FAF1] text-[#00A86B] flex items-center justify-center mb-4 border border-[#00A86B]/20">
             <Zap className="w-5 h-5" />
           </div>
           <h3 className="text-slate-800 font-bold text-sm mb-1">Novo Agendamento</h3>
           <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
             Disparo automático quando uma nova instalação (Agendamento) é concluída para sincronismo ERP.
           </p>
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative group">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Endpoint de Notificação</div>
              <code className="text-xs text-sky-700 font-mono break-all font-semibold block pr-8">
                 http://localhost:5678/webhook/novo-agendamento
              </code>
           </div>
        </div>

        {/* CARD 3 */}
        <div className="card-modern rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1 md:col-span-2">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
               <Cable className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-slate-800 font-bold text-sm">Status do Serviço</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Integração Local</p>
             </div>
           </div>
           
           <div className="space-y-4">
             <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
               <span className="text-xs font-bold text-slate-600 flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-slate-400" /> Ngrok Tunnel</span>
               <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Ativo</span>
             </div>
             <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
               <span className="text-xs font-bold text-slate-600 flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-slate-400" /> N8N Local Service</span>
               <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded">Aguardando Log</span>
             </div>
           </div>
        </div>
      </div>

      {/* CARD: GOOGLE REVIEWS - CONCORRENTES */}
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
         <div className="flex items-center gap-3 mb-6 relative z-10">
           <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
             <Database className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-white font-bold text-sm">Monitoramento de Concorrentes: Google Maps</h3>
             <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Arquitetura de Dados (Apify + n8n + GSheets)</p>
           </div>
         </div>
         
         <div className="space-y-6 relative z-10">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Desenho de automação utilizando o <strong>Apify (Google Maps Scraper)</strong> para monitorar avaliações públicas do Google Maps de provedores concorrentes em Lajeado e Estrela, visando geração de leads reais para a equipe MHNET.
            </p>
            
            <div className="space-y-3">
               
               {/* Passo 1 */}
               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">1</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Gatilho (Schedule Trigger)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium ml-7">
                    Configurado para rodar a cada <strong>2 dias</strong> (ou 48 horas). Isso garante economia no consumo.
                  </p>
               </div>

               {/* Passo 2 */}
               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">2</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Extração (Nó Apify / HTTP Request)</h4>
                  </div>
                  <div className="ml-7 space-y-2">
                     <p className="text-[11px] text-slate-400 font-medium">
                       Executar o Actor <strong>Google Maps Reviews Scraper</strong> pela API do Apify (aproveitando os $5/mês gratuitos).
                     </p>
                     <p className="text-[11px] text-slate-400 font-medium">
                       <strong>Actor ID:</strong> <code className="text-emerald-400 font-mono text-[10px] bg-slate-900 px-1 py-0.5 rounded">Qd7QMPzI85U2ViSFQ</code><br/>
                       <strong>Credencial API (Token):</strong><br/>
                       <code className="text-amber-300 font-mono text-[9px] bg-slate-900 px-2 py-1 rounded block mt-1">apify_api_hWfRMPxd9FI05ogXYm8yNVvXf8xnKT2hhfuI</code>
                     </p>
                     <p className="text-[11px] text-slate-400 font-medium mt-2">
                       <strong>Parâmetros de Custo Rigorosos (JSON):</strong> Defina <code>maxReviews: 5</code> e ordenação <code>sort: "newest"</code> além das URLs dos concorrentes mapeados. Limitar as avaliações blinda o seu consumo de crédito computacional.
                     </p>
                  </div>
               </div>

               {/* Passo 3 */}
               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">3</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Processamento e Filtro (Item Lists & If/Switch)</h4>
                  </div>
                  <div className="ml-7 space-y-2">
                     <p className="text-[11px] text-slate-400 font-medium">
                       O retorno da chamada via Dataset chega como um array de 'items'.
                     </p>
                     <ul className="text-[11px] text-slate-400 font-medium space-y-1 list-disc pl-3 mt-1">
                        <li>Caso o n8n não fragmente os objetos automaticamente na origem do Apify, utilize o nó <strong>Item Lists</strong> (Split Out Items) no campo <code className="text-amber-400">items</code>.</li>
                        <li>Na sequência, adicione um nó <strong>If / Filter</strong> configurando duas regras de descarte (AND / OR falses):<br/>
                        1. Ignorar se o comentário (<code className="text-amber-400">text</code>) estiver vazio.<br/>
                        2. Ignorar se a data da avaliação for anterior a <strong>7 dias</strong> (usando expressão no n8n calculando <code className="text-slate-300">$now.minus(7, 'days')</code>).
                        </li>
                     </ul>
                  </div>
               </div>

               {/* Passo 4 */}
               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">4</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Banco de Dados (Google Sheets)</h4>
                  </div>
                  <div className="ml-7 space-y-2">
                     <p className="text-[11px] text-slate-400 font-medium">
                       Nó do Google Sheets configurado com a operação <strong>Append Row</strong>.
                     </p>
                     <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-mono text-slate-300 mt-2 overflow-x-auto">
                        <strong className="text-slate-500 mb-1 block">Expressões N8N de Mapeamento (Mapping):</strong>
                        Data da Avaliação: <span className="text-sky-300">{`{{$json.publishedAtDate}}`}</span><br/>
                        Provedor: <span className="text-sky-300">{`{{$json.title}}`}</span> (Info do Apify)<br/>
                        Nome do Cliente: <span className="text-sky-300">{`{{$json.name}}`}</span><br/>
                        Nota (Estrelas): <span className="text-sky-300">{`{{$json.stars}}`}</span><br/>
                        Comentário: <span className="text-sky-300">{`{{$json.text}}`}</span><br/>
                        ID da Avaliação: <span className="text-sky-300">{`{{$json.reviewId}}`}</span>
                     </div>
                     <p className="text-[11px] text-emerald-400 font-bold mt-2">
                       💡 Dica Anti-Duplicidade: O ideal é rodar primeiro um nó do Google Sheets (Lookup / Get Many) buscando pelo <code className="text-white">reviewId</code> para verificar se já existe na planilha antes de fazer o Append.
                     </p>
                  </div>
               </div>

               {/* Passo 5 */}
               <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-rose-900/50 text-rose-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">5</span>
                     <h4 className="text-[11px] font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
                       Alerta Comercial de Recuperação (WAHA API) <Zap className="w-3 h-3 fill-rose-500" />
                     </h4>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium ml-7 leading-relaxed">
                     Se a nota filtrada for de <strong>1 ou 2 estrelas</strong> de um concorrente, adicionar um <strong>HTTP Request (POST)</strong> para a API local WAHA enviando alerta para a Liderança Comercial:
                  </p>
                  <div className="bg-slate-950 border border-black rounded-lg p-3 text-[10px] font-mono text-rose-200 mt-2 ml-7">
{`"🚨 *PROSPECÇÃO QUENTE - LEAD INSATISFEITO NA CONCORRÊNCIA* 🚨\n\n` + 
`*Concorrente:* "{{$json.title}}"\n` + 
`*Cliente:* {{$json.name}}\n` + 
`*Avaliação:* {{$json.stars}} Estrelas 🔴\n\n` + 
`*Reclamação (Raio-X do Problema):*\n` + 
`"{{$json.text}}"\n\n` + 
`Liderança Comercial (Ana Paula, Karolina, João Vithor e Ederson). Acionem imediatamente o time de prospecção PAP para bater lá o mais rápido possível e efetuar a migração para a MHNET!"`}
                  </div>
               </div>

            </div>
         </div>
      </div>

      {/* CARD: PREÇOS E OFERTAS - CONCORRENTES */}
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 rounded-full blur-3xl opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
         <div className="flex items-center gap-3 mb-6 relative z-10">
           <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
             <Search className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-white font-bold text-sm">Inteligência de Mercado: Monitoramento de Preços</h3>
             <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Arquitetura Zero Cost (Browse AI + n8n + GSheets)</p>
           </div>
         </div>
         
         <div className="space-y-6 relative z-10">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Design técnico para varredura em sites de concorrentes na região de Lajeado e Estrela. Foco em capturar automaticamente atualizações de planos de fibra óptica, preços e ações promocionais, criando uma base histórica para armamento da equipe de vendas.
            </p>
            
            <div className="space-y-3">
               
               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">1</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Gatilho (Browse AI Webhook)</h4>
                  </div>
                  <div className="ml-7 space-y-2 text-[11px] text-slate-400 font-medium">
                     <p>
                       Configurar os robôs do <strong>Browse AI</strong> para rodarem monitoramentos semanais nas URLs-alvo de vendas dos concorrentes. Com isso, os ~12 a 15 créditos semanais cabem folgados no plano vitalício gratuito de 50 créditos/mês.
                     </p>
                     <p>
                       O Browse AI emitirá um sinal via <strong>Webhook</strong> para o n8n assim que identificar atualizações no layout ou nos dados chave dos planos (ex: nova div de preço, banner promocional). O Payload recebido possuirá os objetos <code className="text-emerald-400">capturedLists</code> e <code className="text-amber-400">changesCaptured</code>.
                     </p>
                  </div>
               </div>

               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">2</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Processamento e Filtro no n8n</h4>
                  </div>
                  <div className="ml-7 space-y-2 text-[11px] text-slate-400 font-medium">
                     <p>
                       O fluxo do n8n se inicia com um nó <strong>Webhook (POST)</strong> recebendo o JSON do Browse AI.
                     </p>
                     <ul className="list-disc pl-3 mt-1 space-y-1">
                        <li>Utilize um nó <strong>If</strong> para confirmar que a propriedade <code className="text-sky-300">{`{{$json.body.robotId}}`}</code> não é vazia.</li>
                        <li>Utilize um nó <strong>Set</strong> para anexar o nome do concorrente baseado na URL de origem ou no ID do robô.</li>
                        <li>Utilize um nó <strong>Item Lists</strong> para iterar os dados novos capturados na chave <code className="text-emerald-400">{`capturedLists`}</code>.</li>
                     </ul>
                  </div>
               </div>

               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">3</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Entrega 1 - Banco de Dados (Google Sheets)</h4>
                  </div>
                  <div className="ml-7 space-y-2 text-[11px] text-slate-400 font-medium">
                     <p>
                       Operação <strong>Append Row</strong> na planilha de Inteligência de Mercado (<code className="text-white">DB_Precos_Concorrentes</code>).
                     </p>
                     <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] font-mono text-slate-300 mt-2 overflow-x-auto">
                        <strong className="text-slate-500 mb-1 block">Expressões N8N de Mapeamento:</strong>
                        Data: <span className="text-sky-300">{`{{$now}}`}</span><br/>
                        Concorrente: <span className="text-sky-300">{`{{$('Identifica Concorrente').item.json.nome_empresa}}`}</span><br/>
                        Plano: <span className="text-sky-300">{`{{$json.Name}}`}</span><br/>
                        Velocidade: <span className="text-sky-300">{`{{$json.Speed}}`}</span><br/>
                        Preço Atual: <span className="text-sky-300">{`{{$json.Price}}`}</span><br/>
                        Promo Ativa: <span className="text-sky-300">{`{{$json.Promo_Banner || 'Nenhuma'}}`}</span><br/>
                        Preço Antigo: <span className="text-sky-300">{`{{ $('Webhook').item.json.body.changesCaptured?.previousPrice || 'Indisponível' }}`}</span>
                     </div>
                  </div>
               </div>

               <div className="bg-sky-950/30 border border-sky-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-sky-900/50 text-sky-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">4</span>
                     <h4 className="text-[11px] font-black text-sky-300 uppercase tracking-wider flex items-center gap-2">
                       Alerta de Reação Imediata (WAHA API) <Zap className="w-3 h-3 fill-sky-500" />
                     </h4>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium ml-7 leading-relaxed">
                     Se o nó <strong>If</strong> detetar uma alteração negativa nos preços (concorrente baixou valor) ou se o plano for listado como "Novo", roteia para o WhatsApp da liderança comercial para ajuste de script de venda.
                  </p>
                  <div className="bg-slate-950 border border-black rounded-lg p-3 text-[10px] font-mono text-sky-200 mt-2 ml-7">
{`"🚨 *ALERTA DE INTELIGÊNCIA: OFERTA NOVA NA CONCORRÊNCIA!* 🚨\n\n` + 
`*Concorrente:* {{$json.concorrente}}\n` + 
`*Plano:* {{$json.plano}} - {{$json.velocidade}}\n` + 
`*Novo Valor:* R$ {{$json.preco_atual}}\n` + 
`*Promoção Ativa:* {{$json.promo}}\n\n` + 
`Atenção Ana Paula, Karolina, João Vithor e Ederson: Favor repassar ao PAP e Consultores. Se o cliente comparar, já tenham na ponta da língua o argumento de qualidade MHNET!"`}
                  </div>
               </div>

            </div>
         </div>
      </div>

      {/* ARQUITETURA DE UPGRADE DE CLIENTES */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden mt-6">
         <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-3xl opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
         
         <div className="relative z-10 mb-6 border-b border-white/10 pb-4">
           <div className="flex flex-col gap-1">
             <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 bg-white/10 text-white text-[9px] uppercase font-black tracking-widest rounded-lg mb-2">
               <Cpu className="w-3 h-3 text-rose-400" />
               Novo Fluxo IA
             </div>
             <h3 className="text-white font-bold text-sm">Automação de Upgrade: Acolhimento e Ofertas (IA)</h3>
             <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Arquitetura Integrada (Painel + N8N + LLM Agent)</p>
           </div>
         </div>
         
         <div className="space-y-6 relative z-10">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Design técnico sugerido para o fluxo de <strong>Upgrade de Clientes</strong> da Base, disparado diretamente da aba de Gestão de Base do Painel MHNET. Ele combina um nó de Webhook, IA no N8N (ou requisições HTTP para a API do modelo de IA), e blocos de processamento.
            </p>
            
            <div className="space-y-3">
               
               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">1</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Gatilho (Webhook Receptor)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium ml-7">
                    O consultor insere o telefone e valida o plano/valor. Ao clicar no botão "Disparo Automático (n8n)", o painel emite um POST contendo <code className="text-emerald-400">nome_cliente</code>, <code className="text-emerald-400">telefone</code>, <code className="text-emerald-400">plano_atual</code>, <code className="text-emerald-400">valor_atual</code> e <code className="text-emerald-400">meses_base</code>.
                  </p>
               </div>

               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">2</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">HTTP Request: Consulta à Planilha de Planos</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium ml-7">
                    Adicione um nó de Google Sheets ou HTTP para buscar as métricas de oferta e planos elegíveis diretamente da aba "Planos" na planilha de ID: <code className="text-blue-300">19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w</code>.
                  </p>
               </div>

               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">3</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Agente IA: Geração de Pitch (3 Blocos)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium ml-7">
                    Configure um Nó de Inteligência Artificial (OpenAI ou Gemini via HTTP) com o seguinte Prompt de Sistema (System Prompt) para processar os blocos:
                  </p>
                  <div className="bg-slate-950 border border-black rounded-lg p-3 text-[10px] font-mono text-sky-200 mt-2 ml-7 whitespace-pre-wrap">{`"Você é um especialista em retenção. Crie um texto contagiante e acolhedor em 3 blocos:
1) Acolhimento: Chame o cliente pelo nome, valorize o tempo de casa.
2) Persuasão: Mencione que pelo tempo de casa, temos planos exclusivos para o {plano_atual}.
3) Ofertas:
   - Oferta 1: Combo (Internet+Móvel) mantendo preço atual (R$ {valor_atual}). Ex: Internet Fibra 1 GB (1000mb) + WIFI Total +2 R$ 179,90.
   - Oferta 2: Upgrade com acréscimo de R$15 a R$20 (apenas Fibra, com Wifi Total).
   - Oferta 3: Upgrade com acréscimo mínimo (R$1 a R$5)." `}
                  </div>
               </div>

               <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="bg-slate-700 text-slate-300 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black">4</span>
                     <h4 className="text-[11px] font-black text-slate-100 uppercase tracking-wider">Nó de Disparo de Mensagem (WhatsApp)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium ml-7">
                    O n8n captura o texto final gerado pelo Agente IA e envia no número fornecido no Webhook (<code className="text-amber-400">telefone</code>) usando a Evolution API/WAHA.
                  </p>
               </div>

            </div>
         </div>
      </div>

      {/* INSTRUCTIONS LIST */}
      <div className="card-modern rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            Guias de Atualização & Setup N8N
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shrink-0">1</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Baixando e Iniciando o N8N Local</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Para o sistema poder conversar diretamente com seus automações corporativas no computador: instale o Node.js v18+.
                  Depois, rode o comando <code className="bg-slate-100 text-rose-500 px-1 py-0.5 rounded font-mono break-all text-[11px]">npx n8n</code> no prompt/terminal.
                  O console imprimirá URL onde os módulos estão executando: tipicamente `http://localhost:5678`.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shrink-0">2</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Subindo a URL com NGROK</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  A nossa Plataforma e Google Sheets estão hospedados online. Por este motivo, para dispararem gatilhos na sua máquina, eles requerem um túnel seguro (HTTPS).
                  <br/> Instale o ngrok, autentique a conta e execute: 
                  <code className="bg-slate-100 text-rose-500 px-1 py-0.5 rounded mx-1 font-mono break-all text-[11px]">ngrok http 5678</code>
                </p>
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-3 inline-block">
                  <p className="text-[11px] font-bold text-blue-800">
                    Ao obter seu domínio (ex: <span className="font-mono text-sky-600 bg-white px-1 py-0.5 rounded">https://xyz.ngrok.dev</span>), acesse os módulos de vendas ou base e grave a URL nas Configurações Manuais.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shrink-0">3</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Parâmetros das Cargas (Payload)</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2">
                  As integrações atuais geram payloads no padrão JSON. O N8N deve iniciar obrigatoriamente com o nó (Webhook) configurado para aceitar <strong>POST</strong> e responder <strong>imediatamente</strong>.
                </p>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-950 text-slate-300 font-mono text-[10px] overflow-x-auto">
{`// Payload de Exemplo (Webhook: upgrade-cliente)
{
  "tipo": "upsell_oferta",
  "cliente": "João da Silva",
  "telefone": "5511999999999",
  "tempo": "2 anos e 3 meses",
  "velocidadeAtual": 300,
  "contrato": "99827",
  "consultor": "Maria Clara",
  "mensagem": "Olá João, tudo bem?..."
}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      
      {/* CARD: TEMPLATES MENSAGENS N8N */}
      <div className="card-modern rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-slate-400" />
            Templates de Mensagens para N8N (Editar e Copiar)
          </h3>
        </div>
        <div className="p-6">
          <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
            Utilize as variáveis do N8N abaixo para configurar os nós de WhatsApp (Evolution API / WAHA). O sistema envia estes dados via JSON no webhook. Você pode editar os textos abaixo para ajustá-los (suas edições ficam salvas no seu navegador), e depois copiá-los para o n8n.
          </p>
          
          <div className="space-y-6">
            
            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">1. Mensagem para o Cliente (Agendamento Confirmado)</span>
                <button 
                  onClick={() => handleCopyTemplate(template1, 1)} 
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors ${copiedId === 1 ? 'bg-[#E6FAF1] text-[#00A86B]' : 'text-sky-600 hover:text-sky-700 bg-sky-50'}`}
                >
                  {copiedId === 1 ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <textarea 
                value={template1}
                onChange={e => setTemplate1(e.target.value)}
                className="w-full p-4 bg-slate-900 text-slate-300 font-mono text-[11px] resize-y min-h-[220px] focus:outline-none"
                spellCheck={false}
              />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">2. Mensagem para o Vendedor (Novo Agendamento Realizado)</span>
                <button 
                  onClick={() => handleCopyTemplate(template2, 2)} 
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors ${copiedId === 2 ? 'bg-[#E6FAF1] text-[#00A86B]' : 'text-sky-600 hover:text-sky-700 bg-sky-50'}`}
                >
                  {copiedId === 2 ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <textarea 
                value={template2}
                onChange={e => setTemplate2(e.target.value)}
                className="w-full p-4 bg-slate-900 text-slate-300 font-mono text-[11px] resize-y min-h-[220px] focus:outline-none"
                spellCheck={false}
              />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">3. Mensagem para o Vendedor (Nova Tarefa)</span>
                <button 
                  onClick={() => handleCopyTemplate(template3, 3)} 
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors ${copiedId === 3 ? 'bg-[#E6FAF1] text-[#00A86B]' : 'text-sky-600 hover:text-sky-700 bg-sky-50'}`}
                >
                  {copiedId === 3 ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <textarea 
                value={template3}
                onChange={e => setTemplate3(e.target.value)}
                className="w-full p-4 bg-slate-900 text-slate-300 font-mono text-[11px] resize-y min-h-[140px] focus:outline-none"
                spellCheck={false}
              />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">4. Mensagem para o Vendedor (Tarefa Atrasada)</span>
                <button 
                  onClick={() => handleCopyTemplate(template4, 4)} 
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 transition-colors ${copiedId === 4 ? 'bg-[#E6FAF1] text-[#00A86B]' : 'text-sky-600 hover:text-sky-700 bg-sky-50'}`}
                >
                  {copiedId === 4 ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <textarea 
                value={template4}
                onChange={e => setTemplate4(e.target.value)}
                className="w-full p-4 bg-slate-900 text-slate-300 font-mono text-[11px] resize-y min-h-[140px] focus:outline-none"
                spellCheck={false}
              />
            </div>

          </div>
        </div>
      </div>
      
{/* CARD: VARIÁVEIS DE AMBIENTE DO N8N */}
      <div className="card-modern rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" />
            Configurações de Ambiente N8N Atuais (Status do Servidor)
          </h3>
        </div>
        <div className="p-6">
          <p className="text-xs text-slate-500 font-medium mb-6">
            Estas variáveis estão configuradas no servidor (<code className="text-sky-600 bg-slate-100 px-1 py-0.5 rounded">.env</code>). Para os fluxos definidos como modo de Teste ("true"), o sistema enviará as requisições para a URL de Teste automaticamente.
          </p>
          
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button 
              onClick={() => setAllTestMode(false)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded hover:bg-emerald-700 shadow flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              ATIVAR MODO PRODUÇÃO EM TUDO
            </button>
            <button 
              onClick={() => setAllTestMode(true)}
              className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded hover:bg-amber-600 shadow flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              ATIVAR MODO TESTE EM TUDO
            </button>
            {envConfig && (
              <button 
                onClick={() => toggleEnvVar('PAUSE_ALL_N8N_WEBHOOKS', envConfig.PAUSE_ALL_N8N_WEBHOOKS)}
                className={`px-4 py-2 font-bold text-xs rounded shadow flex items-center gap-2 transition-colors ${envConfig.PAUSE_ALL_N8N_WEBHOOKS === 'true' ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                {envConfig.PAUSE_ALL_N8N_WEBHOOKS === 'true' ? 'RETOMAR TODAS AS OPERAÇÕES N8N' : 'PAUSAR TODAS AS OPERAÇÕES N8N'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center text-slate-400 text-xs py-4">Carregando variáveis...</div>
          ) : envConfig ? (
            <div className="space-y-6">
              
              {/* 1. Agendamento */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">1. Novo Agendamento</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => testWebhook(envConfig.USE_N8N_TEST_AGENDAMENTO === "true" ? envConfig.N8N_TEST_WEBHOOK_URL : envConfig.N8N_WEBHOOK_URL, 'novo_agendamento')} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Testar</button>
                    <button 
                      onClick={() => toggleEnvVar('PAUSE_AGENDAMENTO_JOB', envConfig.PAUSE_AGENDAMENTO_JOB)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.PAUSE_AGENDAMENTO_JOB === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      {envConfig.PAUSE_AGENDAMENTO_JOB === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                    </button>
                    <button 
                      onClick={() => toggleEnvVar('USE_N8N_TEST_AGENDAMENTO', envConfig.USE_N8N_TEST_AGENDAMENTO)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.USE_N8N_TEST_AGENDAMENTO === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      Modo {envConfig.USE_N8N_TEST_AGENDAMENTO === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_TEST_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_TEST_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                </div>
              </div>

              {/* 2. Tarefas Criadas */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">2. Tarefa Criada</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => testWebhook(envConfig.USE_N8N_TEST_NEW_TASK === "true" ? envConfig.N8N_TEST_NEW_TASK_WEBHOOK_URL : envConfig.N8N_NEW_TASK_WEBHOOK_URL, 'nova_tarefa')} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Testar</button>
                    <button 
                      onClick={() => toggleEnvVar('PAUSE_NEW_TASK_JOB', envConfig.PAUSE_NEW_TASK_JOB)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.PAUSE_NEW_TASK_JOB === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      {envConfig.PAUSE_NEW_TASK_JOB === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                    </button>
                    <button 
                      onClick={() => toggleEnvVar('USE_N8N_TEST_NEW_TASK', envConfig.USE_N8N_TEST_NEW_TASK)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.USE_N8N_TEST_NEW_TASK === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      Modo {envConfig.USE_N8N_TEST_NEW_TASK === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_NEW_TASK_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_NEW_TASK_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_TEST_NEW_TASK_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_TEST_NEW_TASK_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                </div>
              </div>

              {/* 3. Tarefas Atrasadas */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">3. Tarefas Atrasadas</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => testWebhook(envConfig.USE_N8N_TEST_OVERDUE_TASKS === "true" ? envConfig.N8N_TEST_OVERDUE_TASKS_WEBHOOK_URL : envConfig.N8N_OVERDUE_TASKS_WEBHOOK_URL, 'tarefa_atrasada')} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Testar</button>
                    <button 
                      onClick={() => toggleEnvVar('PAUSE_OVERDUE_TASKS_JOB', envConfig.PAUSE_OVERDUE_TASKS_JOB)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.PAUSE_OVERDUE_TASKS_JOB === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      {envConfig.PAUSE_OVERDUE_TASKS_JOB === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                    </button>
                    <button 
                      onClick={() => toggleEnvVar('USE_N8N_TEST_OVERDUE_TASKS', envConfig.USE_N8N_TEST_OVERDUE_TASKS)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.USE_N8N_TEST_OVERDUE_TASKS === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      Modo {envConfig.USE_N8N_TEST_OVERDUE_TASKS === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_OVERDUE_TASKS_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_OVERDUE_TASKS_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_TEST_OVERDUE_TASKS_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_TEST_OVERDUE_TASKS_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                </div>
              </div>

              {/* 4. Lead Inativo */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">4. Lead Inativo</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => testWebhook(envConfig.USE_N8N_TEST_LEAD_INACTIVITY === "true" ? envConfig.N8N_TEST_LEAD_INACTIVITY_WEBHOOK_URL : envConfig.N8N_LEAD_INACTIVITY_WEBHOOK_URL, 'lead_inativo')} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Testar</button>
                    <button 
                      onClick={() => toggleEnvVar('PAUSE_LEAD_INACTIVITY_JOB', envConfig.PAUSE_LEAD_INACTIVITY_JOB)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.PAUSE_LEAD_INACTIVITY_JOB === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      {envConfig.PAUSE_LEAD_INACTIVITY_JOB === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                    </button>
                    <button 
                      onClick={() => toggleEnvVar('USE_N8N_TEST_LEAD_INACTIVITY', envConfig.USE_N8N_TEST_LEAD_INACTIVITY)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.USE_N8N_TEST_LEAD_INACTIVITY === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      Modo {envConfig.USE_N8N_TEST_LEAD_INACTIVITY === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_LEAD_INACTIVITY_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_LEAD_INACTIVITY_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_TEST_LEAD_INACTIVITY_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_TEST_LEAD_INACTIVITY_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                </div>
              </div>

              {/* 5. Upgrade Clientes */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">5. Upgrade Clientes</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => testWebhook(envConfig.USE_N8N_TEST_UPGRADE_BASE === "true" ? envConfig.N8N_TEST_UPGRADE_BASE_WEBHOOK_URL : envConfig.N8N_UPGRADE_BASE_WEBHOOK_URL, 'upgrade_base')} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Testar</button>
                    <button 
                      onClick={() => toggleEnvVar('PAUSE_UPGRADE_BASE_JOB', envConfig.PAUSE_UPGRADE_BASE_JOB)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.PAUSE_UPGRADE_BASE_JOB === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      {envConfig.PAUSE_UPGRADE_BASE_JOB === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                    </button>
                    <button 
                      onClick={() => toggleEnvVar('USE_N8N_TEST_UPGRADE_BASE', envConfig.USE_N8N_TEST_UPGRADE_BASE)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.USE_N8N_TEST_UPGRADE_BASE === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      Modo {envConfig.USE_N8N_TEST_UPGRADE_BASE === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_UPGRADE_BASE_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_UPGRADE_BASE_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_TEST_UPGRADE_BASE_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_TEST_UPGRADE_BASE_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                </div>
              </div>

              {/* 6. Pós-Venda */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">6. Pós-Venda</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => testWebhook(envConfig.USE_N8N_TEST_POS_VENDA === "true" ? envConfig.N8N_TEST_POS_VENDA_WEBHOOK_URL : envConfig.N8N_POS_VENDA_WEBHOOK_URL, 'pos_venda')} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Testar</button>
                    <button 
                      onClick={() => toggleEnvVar('PAUSE_POS_VENDA_JOB', envConfig.PAUSE_POS_VENDA_JOB)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.PAUSE_POS_VENDA_JOB === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      {envConfig.PAUSE_POS_VENDA_JOB === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                    </button>
                    <button 
                      onClick={() => toggleEnvVar('USE_N8N_TEST_POS_VENDA', envConfig.USE_N8N_TEST_POS_VENDA)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.USE_N8N_TEST_POS_VENDA === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      Modo {envConfig.USE_N8N_TEST_POS_VENDA === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_POS_VENDA_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_POS_VENDA_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_TEST_POS_VENDA_WEBHOOK_URL:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_TEST_POS_VENDA_WEBHOOK_URL || "(vazio)"}</span>
                  </div>
                </div>
              </div>

              {/* 7. Cobranças */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">7. Cobranças PAP</h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => testWebhook(envConfig.USE_N8N_TEST_COBRANCAS === "true" ? envConfig.N8N_TEST_WEBHOOK_URL_COBRANCAS : envConfig.N8N_WEBHOOK_URL_COBRANCAS, 'cobrancas')} className="px-2 py-1 bg-white border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-100 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> Testar</button>
                    <button 
                      onClick={() => toggleEnvVar('PAUSE_COBRANCAS_JOB', envConfig.PAUSE_COBRANCAS_JOB)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.PAUSE_COBRANCAS_JOB === "true" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      {envConfig.PAUSE_COBRANCAS_JOB === "true" ? "TRABALHO PAUSADO" : "TRABALHO ATIVO"}
                    </button>
                    <button 
                      onClick={() => toggleEnvVar('USE_N8N_TEST_COBRANCAS', envConfig.USE_N8N_TEST_COBRANCAS)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded cursor-pointer transition-colors ${envConfig.USE_N8N_TEST_COBRANCAS === "true" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                    >
                      Modo {envConfig.USE_N8N_TEST_COBRANCAS === "true" ? "TESTE" : "PRODUÇÃO"} Ativo
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_WEBHOOK_URL_COBRANCAS:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_WEBHOOK_URL_COBRANCAS || "(vazio)"}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <span className="text-slate-500">N8N_TEST_WEBHOOK_URL_COBRANCAS:</span>
                    <span className="text-slate-800 break-all">{envConfig.N8N_TEST_WEBHOOK_URL_COBRANCAS || "(vazio)"}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-rose-500 text-xs py-4">Erro ao carregar configurações.</div>
          )}
        </div>
      </div>

    </div>
  );
};
