const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const syncFunction = `
let lastAbsencesSyncTime = 0;
let isSyncingAbsences = false;

async function syncAbsencesFromGoogleSheet() {
  const now = Date.now();
  if (now - lastAbsencesSyncTime < ONE_MINUTE && absences.length > INITIAL_ABSENCES.length) {
    return;
  }
  if (isSyncingAbsences) return;

  isSyncingAbsences = true;
  try {
    const url = await getExportUrl("19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w", "Acompanhamento de Faltas");
    const signal = AbortSignal.timeout ? AbortSignal.timeout(120000) : undefined;
    const sheetsResponse = await fetch(url, { signal });
    if (!sheetsResponse.ok) throw new Error("HTTP error " + sheetsResponse.status);
    
    const csvText = await sheetsResponse.text();
    const rows = parseCSV(csvText);
    
    if (rows.length > 1) {
      const headers = rows[0].map((h) => h.trim().toLowerCase());
      const dateIdx = headers.findIndex(h => h.includes("data"));
      const vendorIdx = headers.findIndex(h => h.includes("vendedor") || h.includes("nome"));
      const motivoIdx = headers.findIndex(h => h.includes("motivo"));
      const statusIdx = headers.findIndex(h => h.includes("status"));
      const obsIdx = headers.findIndex(h => h.includes("obs"));
      const linkIdx = headers.findIndex(h => h.includes("link") || h.includes("anexo"));
      const idIdx = headers.findIndex(h => h.includes("id"));
      
      const newAbsences = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0 || !row.join("").trim()) continue;
        newAbsences.push({
          id: (idIdx !== -1 && row[idIdx]) ? row[idIdx] : String(i),
          vendedor: (vendorIdx !== -1 && row[vendorIdx]) ? row[vendorIdx] : "Consultor",
          dataFalta: (dateIdx !== -1 && row[dateIdx]) ? row[dateIdx] : "",
          motivo: (motivoIdx !== -1 && row[motivoIdx]) ? row[motivoIdx] : "",
          status: (statusIdx !== -1 && row[statusIdx]) ? row[statusIdx] : "Aguardando",
          observacao: (obsIdx !== -1 && row[obsIdx]) ? row[obsIdx] : "",
          link: (linkIdx !== -1 && row[linkIdx]) ? row[linkIdx] : ""
        });
      }
      absences = newAbsences;
      writeJSONDb("absences.json", absences);
      lastAbsencesSyncTime = Date.now();
    }
  } catch (err) {
    console.error("[SYNC] Erro ao sincronizar Faltas do Google Sheets:", err);
  } finally {
    isSyncingAbsences = false;
  }
}
`;

code = code.replace("app.get(\"/api/absences\", (req, res) => {", syncFunction + "\napp.get(\"/api/absences\", async (req, res) => {\n  await syncAbsencesFromGoogleSheet();\n");
fs.writeFileSync('server.ts', code);
