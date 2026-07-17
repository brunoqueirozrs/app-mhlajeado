const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const sIdx = content.indexOf('{/* 3.5 QUICK ADD PROTOCOL (CHAMADOS MANUTENCAO) */}');
const eIdx = content.indexOf('{/* 4. WORK MODULE PORTALS GRID */}');

if (sIdx !== -1 && eIdx !== -1) {
  content = content.slice(0, sIdx) + content.slice(eIdx);
  fs.writeFileSync('src/components/Dashboard.tsx', content);
  console.log('Removed successfully.');
} else {
  console.error('Could not find start or end index.');
}
