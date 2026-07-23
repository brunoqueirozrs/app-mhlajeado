const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

if (!code.includes("import AIParecerBlock from './AIParecerBlock';")) {
  code = code.replace("import RolePlayIA from './RolePlayIA';", "import RolePlayIA from './RolePlayIA';\nimport AIParecerBlock from './AIParecerBlock';");
}

code = code.replace(/\{extendedVendors\.map/g, '{vendors.map');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
