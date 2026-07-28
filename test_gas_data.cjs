const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPayload(body) {
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEgU9ywRcJgG0yKJTFViVTDKX9ITN_YSUBGMqHins7LJWqbmkvw-MhIThNUWvKt9Vg/exec";
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    console.log(`Payload [${JSON.stringify(body).substring(0, 60)}...]:`, text);
  } catch(e) {
    console.error(`Error:`, e.message);
  }
}

async function run() {
  await testPayload({ data: { route: "saveLead", sheetName: "Protocolos Internos" } });
  await testPayload({ route: "saveLead", data: { sheetName: "Protocolos Internos" } });
  await testPayload({ data: "hello" });
  await testPayload({ action: "saveLead", data: { sheetName: "Protocolos Internos" } });
  await testPayload({ route: "appendRow", data: { sheetName: "Protocolos Internos", item: { Protocolo: "PRT-100" } } });
}

run();
