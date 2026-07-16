const fs = require('fs');
let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

const buttonRegex = /<button[\s\S]*?onClick=\{\(\) => setActiveTab\("n8n"\)\}[\s\S]*?Automações N8N[\s\S]*?<\/button>/;
code = code.replace(buttonRegex, '');

const contentRegex = /\{activeTab === "n8n" && \([\s\S]*?\}\)[\s\S]*?\}\)[\s\S]*?<\/div>\s*\)\s*\}\s*<\/div>\s*\);\s*\}/;
// let's do a more precise replacement for the tab content:
const n8nTab = `
      {activeTab === "n8n" && (
        <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 md:p-10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full"></div>
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
              <RefreshCw className="w-6 h-6 text-sky-400" /> Fluxos N8N
            </h2>
            <p className="mb-8">Automações sugeridas para reduzir o churn usando N8N e Evolution API (WhatsApp).</p>

            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
                <h3 className="font-bold text-sky-300 text-lg mb-2">1. Gatilho Google Sheets (Criação de Card)</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  <strong>Trigger:</strong> Novo cliente na aba "Fechamento [Mês]".<br/>
                  <strong>Ação:</strong> O N8N captura a linha e notifica o gestor via Telegram/WhatsApp, informando que há novos pós-vendas pendentes no aplicativo.
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
                <h3 className="font-bold text-sky-300 text-lg mb-2">2. Lembrete Diário (Vendedoras)</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  <strong>Trigger:</strong> Cronograma diário (08:00h).<br/>
                  <strong>Ação:</strong> O N8N lê a planilha e filtra quem não tem "PÓS VENDA = OK". Envia uma mensagem no WhatsApp da vendedora responsável: <em>"Bom dia! Você tem X clientes pendentes de pós-venda..."</em>
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
                <h3 className="font-bold text-sky-300 text-lg mb-2">3. Alerta de Atraso (+5 dias)</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  <strong>Trigger:</strong> Cronograma diário.<br/>
                  <strong>Condição:</strong> Data Atual - Data de Instalação &gt; 5 dias.<br/>
                  <strong>Ação:</strong> Dispara WhatsApp para o Gestor e Vendedora com alerta de atraso crítico no contato.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
`;
code = code.replace(n8nTab, '');

// Also remove from type definition
code = code.replace(
  'useState<"pendentes" | "base_ativa" | "financeiro" | "n8n">',
  'useState<"pendentes" | "base_ativa" | "financeiro">'
);

fs.writeFileSync('src/components/PosVendaPage.tsx', code, 'utf8');
