const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRoute(route, payload) {
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEgU9ywRcJgG0yKJTFViVTDKX9ITN_YSUBGMqHins7LJWqbmkvw-MhIThNUWvKt9Vg/exec";
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ route, payload })
    });
    const text = await res.text();
    console.log(`Route [${route}]:`, text);
  } catch(e) {
    console.error(`Route [${route}] error:`, e.message);
  }
}

async function run() {
  const routes = [
    "saveProtocol",
    "saveProtocolo",
    "saveProtocoloInterno",
    "saveInstallation",
    "saveLead",
    "appendRow",
    "updateRow",
    "saveItem"
  ];
  
  for (const r of routes) {
    await testRoute(r, {
      sheetName: "Protocolos Internos",
      item: {
        "Protocolo": "PRT-9999",
        "Data Abertura": "2026-07-28",
        "Setor": "MARKTING",
        "Motivo": "Teste",
        "Vendedor": "Bruno",
        "Status": "Pendente"
      },
      id: "PRT-9999"
    });
  }
}

run();
