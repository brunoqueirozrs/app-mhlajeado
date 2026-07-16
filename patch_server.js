const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/console\.log\(\`\[n8n\] Lead Inativo detectado: \$\{lead\.nomeLead\} \(\$\{avisoToTrigger\}\)\. Enviando webhook\.\.\.\`\);/, `console.log(\`[n8n] Lead Inativo detectado: \${lead.nomeLead} (\${avisoToTrigger}). Enviando webhook...\`);
        if (!payload.vendedor_telefone) {
          console.warn(\`[n8n WARNING] O vendedor "\${payload.vendedor}" não possui telefone configurado na aba "Vendedores". O n8n (WAHA) pode falhar com erro 500 ao tentar enviar mensagem para "@c.us".\`);
        }`);

fs.writeFileSync('server.ts', code);
