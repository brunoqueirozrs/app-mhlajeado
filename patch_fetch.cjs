const fs = require('fs');

let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

code = code.replace(
  "fetch('/api/posvenda/save', {",
  "fetch('/api/pos-vendas/' + encodeURIComponent(c.id), {"
);
code = code.replace(
  "body: JSON.stringify({ sheetName: selectedMes, rowId: c.id, checklist: newCheck, isComplete: (c.status === 'Concluído' || c.status === 'Alerta') })",
  "body: JSON.stringify({ checklist: newCheck })"
);

fs.writeFileSync('src/components/PosVendaPage.tsx', code, 'utf8');
