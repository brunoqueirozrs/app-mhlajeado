const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace(/\}\n\s*\}\n\s*\}\n\s*\}/g, '}\n');
text = text.replace(/\}\n\s*\}\n\s*\}\n/g, '}\n');
fs.writeFileSync('src/App.tsx', text);
