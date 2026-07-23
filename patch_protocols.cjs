const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// internalProtocols
code = code.replace(
  "const id = row[4] || ('fallback-' + i + '-' + (row[0] || '').replace(/[^a-zA-Z0-9]/g, ''));",
  "const id = row[4] || ('fallback-' + (row[0] || '').replace(/[^a-zA-Z0-9]/g, '') + '-' + (row[2] || '').replace(/[^a-zA-Z0-9]/g, ''));"
);

// installationsQueue
code = code.replace(
  "const id = row[6] || ('fallback-' + i + '-' + (row[3] || '').replace(/[^a-zA-Z0-9]/g, ''));",
  "const id = row[6] || ('fallback-' + (row[3] || '').replace(/[^a-zA-Z0-9]/g, '') + '-' + (row[2] || '').replace(/[^a-zA-Z0-9]/g, ''));"
);

fs.writeFileSync('server.ts', code);
