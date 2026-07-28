const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function parseCSV(text) {
  const lines = text.split('\n');
  return lines.map(line => {
    // Basic CSV parser for quoted strings
    const row = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        insideQuote = !insideQuote;
      } else if (c === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += c;
      }
    }
    row.push(entry.trim());
    return row;
  });
}

async function run() {
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";
  const sheetName = "Protocolos Internos";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(sheetName)}&_rnd=${Date.now()}`;
  
  const res = await fetch(url);
  const text = await res.text();
  const rows = parseCSV(text);
  console.log("Header row:", rows[0]);
  console.log("Total rows:", rows.length);
  if (rows.length > 1) {
    console.log("Last 5 rows:");
    rows.slice(-5).forEach(r => console.log(r.slice(0, 10)));
  }
}

run();
