const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');
code = code.replace("jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }", "jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }");
fs.writeFileSync('src/components/CobrancasDashboard.tsx', code, 'utf8');
