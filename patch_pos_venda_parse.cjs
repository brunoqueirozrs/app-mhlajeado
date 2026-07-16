const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = 'const cidadeIdx = headers.findIndex((h: string) => h.includes("cidade") || h.includes("municipio"));';
const addition1 = `
    const cobranca1Idx = headers.findIndex((h: string) => h.includes("cobrança 1") || h.includes("cobranca 1"));
    const cobranca2Idx = headers.findIndex((h: string) => h.includes("cobrança 2") || h.includes("cobranca 2"));
    const cobranca3Idx = headers.findIndex((h: string) => h.includes("cobrança 3") || h.includes("cobranca 3"));
`;
code = code.replace(target1, target1 + addition1);

const target2 = 'status: "Pendente",';
const addition2 = `
        cobrancaMes1: cobranca1Idx >= 0 ? row[cobranca1Idx] : null,
        cobrancaMes2: cobranca2Idx >= 0 ? row[cobranca2Idx] : null,
        cobrancaMes3: cobranca3Idx >= 0 ? row[cobranca3Idx] : null,
`;
code = code.replace(target2, addition2 + '\n        ' + target2);

// Merge with local state
const target3 = 'Object.assign(clientObj, posVendasData[id]);';
const addition3 = `
      // Merge initial sheet data for these fields if not present in local state
      if (!clientObj.checklist) clientObj.checklist = {};
      if (!clientObj.checklist.cobrancaMes1 && clientObj.cobrancaMes1) clientObj.checklist.cobrancaMes1 = clientObj.cobrancaMes1;
      if (!clientObj.checklist.cobrancaMes2 && clientObj.cobrancaMes2) clientObj.checklist.cobrancaMes2 = clientObj.cobrancaMes2;
      if (!clientObj.checklist.cobrancaMes3 && clientObj.cobrancaMes3) clientObj.checklist.cobrancaMes3 = clientObj.cobrancaMes3;
`;
code = code.replace(target3, target3 + addition3);

// Update api/pos-vendas/:id to call webhook and Apps Script
const target4 = 'writeJSONDb("posVendas.json", posVendasData);';
const addition4 = `
  writeJSONDb("posVendas.json", posVendasData);
  
  // Enviar para webhook e Apps Script para manter sincronizado o espelho do Fechamento
  try {
    const sheetName = id.split("-").slice(0, -1).join("-");
    const rowIndex = id.split("-").pop();
    
    // Tentativa 1: Webhook N8N para atualizar a planilha se existir
    const isTest = process.env.USE_N8N_TEST_POS_VENDA === "true";
    let webhookUrl = isTest 
      ? (process.env.N8N_TEST_POS_VENDA_WEBHOOK_URL || "http://localhost:5678/webhook-test/pos-venda") 
      : (process.env.N8N_POS_VENDA_WEBHOOK_URL || "http://localhost:5678/webhook/pos-venda");
      
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_financeiro",
          sheetName,
          rowIndex,
          nome: posVendasData[id].nome,
          updates: updates.checklist
        })
      }).catch(e => console.error("Falha webhook posvenda sync:", e.message));
    }

    // Tentativa 2: Apps Script direto
    if (process.env.APPS_SCRIPT_URL) {
      fetch(process.env.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          route: "updateFechamentoRow",
          payload: {
            sheetName,
            rowIndex,
            nome: posVendasData[id].nome,
            updates: updates.checklist
          }
        })
      }).catch(e => console.error("Falha APPS_SCRIPT_URL posvenda sync:", e.message));
    }
  } catch (e) {
    console.error("Erro ao sincronizar fechamento:", e);
  }
`;
code = code.replace(target4, addition4);

fs.writeFileSync('server.ts', code, 'utf8');
