const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const sIdx = content.indexOf('async function syncInternalProtocolsFromGoogleSheet() {');
const eIdx = content.indexOf('syncInternalProtocolsFromGoogleSheet();');

if (sIdx !== -1 && eIdx !== -1) {
  content = content.slice(0, sIdx) + `async function syncInternalProtocolsFromGoogleSheet() {
  if (Date.now() - lastInternalProtocolsSyncTime < 300000) return; // 5 mins cache
  
  try {
    const signal = AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined;
    const url = "https://docs.google.com/spreadsheets/d/19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w/gviz/tq?tqx=out:csv&headers=1&sheet=" + encodeURIComponent("Protocolos Internos");
    
    const res = await fetch(url, { signal });
    if (res.ok) {
      const csvText = await res.text();
      if (csvText.trim().toLowerCase().startsWith("<!doctype html>")) { throw new Error("Aba solicitada não existe ou não está pública"); }
      const rows = parseCSV(csvText);
      let queue: any[] = [];
      if (rows.length >= 2) {
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row[0] && !row[1] && !row[2]) continue;
          
          const id = row[4] || ('fallback-' + i + '-' + (row[0] || '').replace(/[^a-zA-Z0-9]/g, ''));
          const localItem = internalProtocols.find(p => p.id === id) || ({} as any);

          queue.push({
            protocolo: row[0] || localItem.protocolo || "-",
            dataAbertura: row[1] || localItem.dataAbertura || "",
            setor: row[2] || localItem.setor || "-",
            motivo: row[3] || localItem.motivo || "-",
            id: id,
            vendedor: row[5] || localItem.vendedor || "Não Informado",
            timestamp: row[6] || localItem.timestamp || "",
            observacoes: row[7] || localItem.observacoes || "",
            status: row[8] || localItem.status || "Pendentes"
          });
        }
      }
      
      const existingIds = new Set(queue.map((q: any) => q.id));
      const notInGas = internalProtocols.filter(q => !existingIds.has(q.id));
      
      internalProtocols = [...notInGas, ...queue.reverse()];
      
      // Deduplicate by ID
      const seen = new Set();
      internalProtocols = internalProtocols.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      writeJSONDb("internalProtocols.json", internalProtocols);
      
      lastInternalProtocolsSyncTime = Date.now();
      console.log("[SYNC] Protocolos Internos sincronizados. Itens:", internalProtocols.length);
    }
  } catch(e: any) {
    console.warn("Falha ao buscar Protocolos Internos:", e.message);
  }
}
` + content.slice(eIdx);
}


const wIdx = content.indexOf('async function writeInternalProtocolToGoogleSheet(item: any');
const nextIdx = content.indexOf('app.get("/api/sheets/internal-protocols"');

if (wIdx !== -1 && nextIdx !== -1) {
  content = content.slice(0, wIdx) + `async function writeInternalProtocolToGoogleSheet(item: any, action: "append" | "update" = "append") {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const mappedItem = {
      "Protocolo": item.protocolo || "-",
      "Data Abertura": item.dataAbertura || "-",
      "Setor": item.setor || "-",
      "Motivo": item.motivo || "-",
      "ID": item.id,
      "Vendedor": item.vendedor || "-",
      "Timestamp": item.timestamp || "-",
      "Observações": item.observacoes || "",
      "Status": item.status || "Pendentes"
    };

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        route: action === "update" ? "updateRow" : "appendRow",
        payload: {
          sheetName: "Protocolos Internos",
          item: mappedItem,
          id: item.id
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (e) {
    console.warn("Could not save to Protocolos Internos GAS:", e);
  }
}

` + content.slice(nextIdx);
}

fs.writeFileSync('server.ts', content);
console.log('Fixed');
