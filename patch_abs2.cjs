const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "body: JSON.stringify(newAbsence)",
  "body: JSON.stringify(abs)"
);

fs.writeFileSync('server.ts', code);
