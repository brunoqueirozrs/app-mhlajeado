const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasPage.tsx', 'utf8');

const helper = `
const formatPlano = (plano?: string) => {
  if (!plano) return "Sem Plano";
  const match = plano.match(/(\\d+\\s*(?:Mbps|Gbps|Mb|Gb|Mega|Giga))/i);
  if (match) return match[1];
  return plano;
};
`;

code = code.replace(
  "export default function CobrancasPage({",
  helper + "\nexport default function CobrancasPage({"
);

// Replace {item.plano || "Sem Plano"} with {formatPlano(item.plano)}
code = code.replace(
  /\{item\.plano \|\| "Sem Plano"\}/g,
  "{formatPlano(item.plano)}"
);

// Replace {selectedItem.plano} with {formatPlano(selectedItem.plano)}
code = code.replace(
  /\{selectedItem\.plano\}/g,
  "{formatPlano(selectedItem.plano)}"
);

// In the metrics block (line 854ish)
code = code.replace(
  'const p = curr.plano || "Outros";',
  'const p = formatPlano(curr.plano) || "Outros";'
);

fs.writeFileSync('src/components/CobrancasPage.tsx', code, 'utf8');
