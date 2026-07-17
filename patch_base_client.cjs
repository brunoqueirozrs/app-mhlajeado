const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

const newFunction = `async function writeBaseClientToGoogleSheet(client: any) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const mappedItem = {
      "Consultor": client.consultorOrigem || "",
      "Cliente": client.nome || "",
      "Telefone": client.telefoneExterno || "",
      "ID Contrato / Código": client.idContrato || "",
      "Cidade": client.cidade || "",
      "Plano Atual": client.plano || "",
      "Valor": client.valor || "",
      "Situação Atual": client.status || "",
      "Data Ativação": client.dataAtivacao || ""
    };

    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        route: "appendRow",
        payload: {
          sheetName: "Base052026",
          item: mappedItem
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (e) {
    console.warn("Could not save to Base052026 GAS:", e);
  }
}
`;

// Insert the new function before syncInternalProtocolsFromGoogleSheet for example
const insertIdx = content.indexOf('async function syncInternalProtocolsFromGoogleSheet');
if (insertIdx !== -1) {
    content = content.slice(0, insertIdx) + newFunction + '\n' + content.slice(insertIdx);
}

// And call it inside app.put("/api/pos-vendas/:id")
//     writeJSONDb("baseClients.json", baseClients);
//    }
//  }

const targetStr = `      writeJSONDb("baseClients.json", baseClients);
    }`;

const replacementStr = `      writeJSONDb("baseClients.json", baseClients);
      // We push the last element
      const appendedClient = baseClients[baseClients.length - 1];
      writeBaseClientToGoogleSheet(appendedClient).catch(e => console.error(e));
    }`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('server.ts', content);
console.log('Patched');
