const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace(/\)\n\s*\.catch/g, '}\n      })\n      .catch');
fs.writeFileSync('src/App.tsx', text);
