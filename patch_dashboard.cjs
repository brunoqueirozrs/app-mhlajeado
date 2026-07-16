const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');

code = code.replace(
  "const p = c.plano || 'Desconhecido';",
  `let p = c.plano || 'Desconhecido';
    const match = p.match(/(\\d+\\s*(?:Mbps|Gbps|Mb|Gb|Mega|Giga))/i);
    if (match) {
      p = match[1];
    }`
);

fs.writeFileSync('src/components/CobrancasDashboard.tsx', code, 'utf8');
