const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(/data={vendorCompetencias\.competencias}/g, 'data={vendorCompetencias?.competencias || []}');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
