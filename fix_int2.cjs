const fs = require('fs');
let file = 'src/components/InternalProtocolsPage.tsx';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/<form\s+initial=\{[^}]+\}\s+animate=\{[^}]+\}/g, '<form');
fs.writeFileSync(file, text);
