const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(/handlePrintPdf/g, 'handlePrintReport');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
