const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routes = [
  { url: "/api/n8n/webhook-competitors", name: "Competitors Webhook" },
  { url: "/api/n8n/webhook-upgrade", name: "Upgrade Webhook" },
  { url: "/api/n8n/webhook-vendas-sva", name: "Vendas SVA Webhook" },
  { url: "/api/n8n/webhook-indicacoes", name: "Indicações Webhook" },
  { url: "/api/n8n/webhook-pos-venda", name: "Pós Venda Webhook" }
];

for (const r of routes) {
  const search = 'app.post("' + r.url + '", async (req, res) => {';
  const replace = search + '\n  console.log("[DEBUG N8N] 🔴 RECEBIDO REQUISIÇÃO EM ' + r.url + '");\n  console.log("[DEBUG N8N] Payload:", JSON.stringify(req.body, null, 2));';
  code = code.replace(search, replace);
}

const cobSearch = 'app.post("/api/cobrancas/disparar-n8n", async (req, res) => {';
const cobReplace = cobSearch + '\n  console.log("[DEBUG N8N] 🔴 RECEBIDO REQUISIÇÃO EM /api/cobrancas/disparar-n8n");\n  console.log("[DEBUG N8N] Payload:", JSON.stringify(req.body, null, 2));';
code = code.replace(cobSearch, cobReplace);

fs.writeFileSync('server.ts', code);
