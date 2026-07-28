const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyYIgJvqqrqB5E-lhDdhPh5-zad0oD1m2gInnlpVnDVVaIWBRzzRrnb0S7UrHdSUUoN/exec";
  console.log("URL:", APPS_SCRIPT_URL);
  
  const payload = {
    route: "appendRow",
    payload: {
      sheetName: "Protocolos Internos",
      item: {
        "Protocolo": "TEST-1234",
        "Data Abertura": "2026-07-28",
        "Setor": "TESTE",
        "Motivo": "Teste de inclusão",
        "ID": "test-id-123",
        "Vendedor": "Bruno Queiroz",
        "Timestamp": "28/07/2026",
        "Observações": "Observação teste",
        "Status": "Pendente"
      },
      id: "test-id-123"
    }
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch(e) {
    console.error("Error:", e);
  }
}

run();
