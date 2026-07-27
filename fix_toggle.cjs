const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `  const strValue = value ? "true" : "false";`;
const replace1 = `  const strValue = (value === "true" || value === true) ? "true" : "false";`;

code = code.replace(target1, replace1);
fs.writeFileSync('server.ts', code);
