const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetSectionStart = `async function syncInternalProtocolsFromGoogleSheet() {`;
const targetSectionEnd = `let localInstallationQueue: any[] = readJSONDb("installationsQueue.json", []);`;

const startIndex = code.indexOf(targetSectionStart);
const endIndex = code.indexOf(targetSectionEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find targets in server.ts!");
  process.exit(1);
}

const replacementCode = `
function getGoogleSheetsClient() {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
    const { google } = require("googleapis");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return google.sheets({ version: "v4", auth: oauth2Client });
  }
  return null;
}

async function writeInternalProtocolToGoogleSheet(item: any, action: "append" | "update" | "delete" = "append") {
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";
  const sheetName = "Protocolos Internos";
  
  try {
    const sheets = getGoogleSheetsClient();
    if (!sheets) {
      console.warn("[SYNC] Direct Google Sheets credentials not available.");
      return;
    }

    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Protocolos Internos'!A:I",
    });
    const rows = getRes.data.values || [];

    if (rows.length === 0 || !rows[0] || rows[0].length < 5) {
      const header = ['Protocolo', 'Data de Abertura', 'Setor', 'Motivo', 'ID', 'Vendedor', 'Timestamp', 'Observações', 'Status'];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "'Protocolos Internos'!A1:I1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [header] }
      });
    }

    const formattedRow = [
      item.protocolo || "-",
      item.dataAbertura || "-",
      item.setor || "-",
      item.motivo || "-",
      item.id || "",
      item.vendedor || "-",
      item.timestamp || "-",
      item.observacoes || "",
      item.status || "Pendente"
    ];

    if (action === "append") {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "'Protocolos Internos'!A:I",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [formattedRow] }
      });
      console.log(\`[SYNC] Protocolo \${item.protocolo} adicionado na planilha Google!\`);
    } else if (action === "update") {
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && (row[4] === item.id || (item.protocolo && row[0] === item.protocolo))) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: \`'Protocolos Internos'!A\${rowIndex}:I\${rowIndex}\`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [formattedRow] }
        });
        console.log(\`[SYNC] Protocolo \${item.protocolo} (Linha \${rowIndex}) atualizado na planilha Google!\`);
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "'Protocolos Internos'!A:I",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [formattedRow] }
        });
        console.log(\`[SYNC] Protocolo \${item.protocolo} não encontrado; adicionado na planilha Google!\`);
      }
    } else if (action === "delete") {
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && (row[4] === item.id || (item.protocolo && row[0] === item.protocolo))) {
          rowIndex = i + 1;
          break;
        }
      }
      if (rowIndex > 0) {
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: \`'Protocolos Internos'!A\${rowIndex}:I\${rowIndex}\`,
        });
        console.log(\`[SYNC] Protocolo \${item.id} (Linha \${rowIndex}) removido da planilha Google!\`);
      }
    }
  } catch (e) {
    console.error("[SYNC] Erro ao gravar Protocolo Interno na Planilha Google:", e.message);
  }
}

async function syncInternalProtocolsFromGoogleSheet() {
  if (Date.now() - lastInternalProtocolsSyncTime < 15000) return; // 15s cache

  try {
    const sheets = getGoogleSheetsClient();
    let rows = [];

    if (sheets) {
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId: "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w",
        range: "'Protocolos Internos'!A:I",
      });
      rows = getRes.data.values || [];
    } else {
      const signal = AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined;
      const url = await getExportUrl("19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w", "Protocolos Internos");
      const res = await fetch(url, { signal });
      if (res.ok) {
        const csvText = await res.text();
        if (!csvText.trim().toLowerCase().startsWith("<!doctype html>")) {
          rows = parseCSV(csvText);
        }
      }
    }

    if (rows.length >= 2) {
      let queue = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || (!row[0] && !row[1] && !row[2])) continue;

        const id = row[4] || ('fallback-' + (row[0] || '').replace(/[^a-zA-Z0-9]/g, '') + '-' + (row[2] || '').replace(/[^a-zA-Z0-9]/g, ''));
        const localItem = internalProtocols.find(p => p.id === id || p.protocolo === row[0]) || {};

        queue.push({
          id: id,
          protocolo: row[0] || localItem.protocolo || "-",
          dataAbertura: row[1] || localItem.dataAbertura || "",
          setor: row[2] || localItem.setor || "-",
          motivo: row[3] || localItem.motivo || "-",
          vendedor: row[5] || localItem.vendedor || "Não Informado",
          timestamp: row[6] || localItem.timestamp || "",
          observacoes: row[7] || localItem.observacoes || "",
          status: row[8] || localItem.status || "Pendente"
        });
      }

      const existingIds = new Set(queue.map(q => q.id));
      const notInGas = internalProtocols.filter(q => !existingIds.has(q.id));

      internalProtocols = [...queue.reverse(), ...notInGas];

      const seen = new Set();
      internalProtocols = internalProtocols.filter(p => {
        if (!p.id || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      writeJSONDb("internalProtocols.json", internalProtocols);
      lastInternalProtocolsSyncTime = Date.now();
      console.log("[SYNC] Protocolos Internos sincronizados. Total:", internalProtocols.length);
    }
  } catch(e) {
    console.warn("Falha ao buscar Protocolos Internos:", e.message);
  }
}

syncInternalProtocolsFromGoogleSheet();

app.get("/api/sheets/internal-protocols", async (req, res) => {
  try {
    await syncInternalProtocolsFromGoogleSheet();
    res.json(internalProtocols);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch internal protocols" });
  }
});

app.post("/api/sheets/internal-protocols", async (req, res) => {
  try {
    const timestampDDMMYYYY = req.body.timestamp || new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const vendedor = req.body.vendedor || "Não Informado";

    const newItem = {
      ...req.body,
      timestamp: timestampDDMMYYYY,
      vendedor: vendedor,
      status: req.body.status || 'Pendente',
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    };

    internalProtocols.unshift(newItem);
    writeJSONDb("internalProtocols.json", internalProtocols);
    lastInternalProtocolsSyncTime = 0;

    writeInternalProtocolToGoogleSheet(newItem, "append").catch(e => console.error(e));

    // Disparar Webhook para o n8n
    let webhookUrl = process.env.N8N_WEBHOOK_URL || "https://sua-url-ngrok.ngrok-free.dev/webhook-test/protocolo-interno";
    if (webhookUrl && !webhookUrl.includes("localhost:5678")) {
      webhookUrl = webhookUrl.replace(/\\/$/, "") + (webhookUrl.includes("webhook-test") ? "" : "/webhook/protocolo-interno");
      if (!webhookUrl.includes("protocolo-interno")) {
        webhookUrl += webhookUrl.includes("webhook/") || webhookUrl.includes("webhook-test/") ? "protocolo-interno" : "/webhook/protocolo-interno";
      }

      try {
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({
            event: "novo_protocolo_interno",
            ...newItem
          })
        }).catch(err => console.warn("[n8n Webhook] Falha ao disparar protocolo interno:", err.message));
      } catch (e) {
        console.warn("[n8n Webhook] Erro:", e);
      }
    }

    res.json({ success: true, item: newItem });
  } catch (e) {
    res.status(500).json({ error: "Failed to save internal protocol" });
  }
});

app.put("/api/sheets/internal-protocols/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const index = internalProtocols.findIndex(p => p.id === id);
    if (index !== -1) {
      internalProtocols[index] = { ...internalProtocols[index], ...req.body };
      writeJSONDb("internalProtocols.json", internalProtocols);
      lastInternalProtocolsSyncTime = 0;

      writeInternalProtocolToGoogleSheet(internalProtocols[index], "update").catch(e => console.error(e));
      res.json({ success: true, item: internalProtocols[index] });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to update internal protocol" });
  }
});

app.delete("/api/sheets/internal-protocols/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const index = internalProtocols.findIndex(p => p.id === id);
    if (index !== -1) {
      const itemToDel = internalProtocols[index];
      internalProtocols.splice(index, 1);
      writeJSONDb("internalProtocols.json", internalProtocols);
      lastInternalProtocolsSyncTime = 0;

      writeInternalProtocolToGoogleSheet(itemToDel, "delete").catch(e => console.error(e));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (e) {
    res.status(500).json({ error: "Failed to delete internal protocol" });
  }
});

`;

const newCode = code.substring(0, startIndex) + replacementCode + code.substring(endIndex);
fs.writeFileSync('server.ts', newCode);
console.log("Patched server.ts successfully!");
