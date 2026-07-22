const fs = require('fs');
let code = fs.readFileSync('src/components/EstrategiaPage.tsx', 'utf8');

const regexPrint = /onClick=\{\(\) => \{\s*if \(window\.self !== window\.top\) \{\s*alert\([\s\S]*?\}\s*\}\}/g;
const replacePrint = `onClick={() => window.print()}`;
code = code.replace(regexPrint, replacePrint);

fs.writeFileSync('src/components/EstrategiaPage.tsx', code);
