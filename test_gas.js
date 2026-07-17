const fetch = require('node-fetch');
async function test() {
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZ83Wc4jBqK69dD3n57yW7B-tCqD-W7ZgHj5v8_2k/exec"; // wait, what is the url? I can find it in server.ts
  const fs = require('fs');
  const server = fs.readFileSync('server.ts', 'utf-8');
  const urlMatch = server.match(/APPS_SCRIPT_URL\s*=\s*"(.*?)"/);
  if(urlMatch) {
    const url = urlMatch[1];
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        route: "saveInstallation",
        payload: {
          sheetName: "Agenda Instalação",
          item: { id: "test", nomeCliente: "Test" }
        }
      })
    });
    console.log(res.status);
    console.log(await res.text());
  }
}
test();
