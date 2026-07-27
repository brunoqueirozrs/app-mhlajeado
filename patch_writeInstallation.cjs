const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({
        route: action === "save" ? "saveInstallation" : "deleteInstallation",
        payload: {
          sheetName: "Agenda Instalação",
          item: inst
        }
      }),
      signal: controller.signal
    });`;
const replace = `    let route = action === "save" ? "saveInstallation" : "deleteInstallation";
    let payload = {
      sheetName: "Agenda Instalação",
      item: inst
    };

    if (action === "delete") {
      let linhaToDelete = inst._linha;
      if (!linhaToDelete) {
        try {
          const exportUrl = await getExportUrl("19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w", "Agenda Instalação");
          const res = await fetch(exportUrl);
          if (res.ok) {
            const csvText = await res.text();
            const rows = parseCSV(csvText);
            const parsedList = parseInstallationRows(rows);
            const found = parsedList.find(i => i.id === inst.id);
            if (found && found._linha) {
              linhaToDelete = found._linha;
            }
          }
        } catch (err) {
          console.error("Error finding row number for deletion in Agenda Instalação:", err);
        }
      }
      if (!linhaToDelete) {
         clearTimeout(timeoutId);
         console.warn("[SYNC] Could not find row number in Google Sheets to delete installation:", inst.id);
         return;
      }
      payload.item = { _linha: linhaToDelete };
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({
        route,
        payload
      }),
      signal: controller.signal
    });`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
console.log("Patched writeInstallationToGoogleSheet dynamic deletion");
