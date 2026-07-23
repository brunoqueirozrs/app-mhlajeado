const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/gemini-3\.6-flash/g, 'gemini-2.0-flash');
fs.writeFileSync('server.ts', code);
