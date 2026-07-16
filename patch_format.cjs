const fs = require('fs');

let pageCode = fs.readFileSync('src/components/CobrancasPage.tsx', 'utf8');
pageCode = pageCode.replace(
  /const formatPlano = \(plano\?: string\) => \{[\s\S]*?\};\n/,
  `const formatPlano = (plano?: string) => {
  if (!plano) return "Sem Plano";
  let result = plano;
  const match = plano.match(/(\\d+\\s*(?:Mbps|Gbps|Mb|Gb|Mega|Giga))/i);
  if (match) {
    result = match[1];
    if (/wifitotal/i.test(plano)) {
      result += " + WIFITotal";
    }
  }
  return result;
};\n`
);
fs.writeFileSync('src/components/CobrancasPage.tsx', pageCode, 'utf8');

let dashCode = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');
dashCode = dashCode.replace(
  /let p = c\.plano \|\| 'Desconhecido';\n\s*const match = p\.match\(\/\(\\d\+\\s\*\(\?:Mbps\|Gbps\|Mb\|Gb\|Mega\|Giga\)\)\/i\);\n\s*if \(match\) \{\n\s*p = match\[1\];\n\s*\}/,
  `let p = c.plano || 'Desconhecido';
    const match = p.match(/(\\d+\\s*(?:Mbps|Gbps|Mb|Gb|Mega|Giga))/i);
    if (match) {
      p = match[1];
      if (/wifitotal/i.test(c.plano || '')) {
        p += " + WIFITotal";
      }
    }`
);
fs.writeFileSync('src/components/CobrancasDashboard.tsx', dashCode, 'utf8');
