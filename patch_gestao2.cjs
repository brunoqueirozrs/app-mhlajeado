const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace("import AIParecerBlock from './AIParecerBlock';", "import { AIParecerBlock } from './AIParecerBlock';");

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
