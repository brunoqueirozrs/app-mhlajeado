const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const statusIndicacaoEnvioIdx = headers.findIndex((h: string) => h.includes("status do envio de indicação") || h.includes("envio indicacao") || h.includes("envio indicação"));`;
const newStr = `const statusIndicacaoEnvioIdx = headers.findIndex((h: string) => h === "indicação" || h === "indicacao" || h.includes("indicação") || h.includes("indicacao"));`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('server.ts', code);
