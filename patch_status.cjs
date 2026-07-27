const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      // Merge initial sheet data for these fields if not present in local state`;
const replacementStr = `      // A planilha é a fonte da verdade para o status de envio. Se tiver algo na planilha, usamos.
      if (statusIndicacaoEnvioIdx >= 0 && row[statusIndicacaoEnvioIdx]) {
        clientObj.statusIndicacaoEnvio = row[statusIndicacaoEnvioIdx];
      }
      if (statusSvaIdx >= 0 && row[statusSvaIdx]) {
        clientObj.statusSva = row[statusSvaIdx];
      }
      
      // Merge initial sheet data for these fields if not present in local state`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
console.log("Patched server.ts successfully");
