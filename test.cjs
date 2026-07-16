const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');
code = code.replace('import "jspdf-autotable"; // Note: might need to install jspdf-autotable', 'import autoTable from "jspdf-autotable";');
code = code.replace('(doc as any).autoTable({', 'autoTable(doc, {');
fs.writeFileSync('src/components/CobrancasDashboard.tsx', code, 'utf8');
