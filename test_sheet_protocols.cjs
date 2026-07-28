const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";
  const sheetName = "Protocolos Internos";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(sheetName)}&_rnd=${Date.now()}`;
  
  const res = await fetch(url);
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("CSV Preview (first 1000 chars):");
  console.log(text.substring(0, 1000));
}

run();
