const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `const statusIndicacaoEnvioIdx = headers.findIndex((h: string) => h === "indicação" || h === "indicacao" || h.includes("indicação") || h.includes("indicacao"));`;
const replace1 = `const statusIndicacaoEnvioIdx = 18; // Coluna S`;

if (code.includes(target1)) {
  code = code.replace(target1, replace1);
  fs.writeFileSync('server.ts', code);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find target string.");
}
