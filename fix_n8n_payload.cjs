const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
    "body: JSON.stringify(abs)",
    "body: JSON.stringify({ ...abs, fileData: undefined })"
);

fs.writeFileSync('server.ts', code);
