const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\/\/ Upload to Google Drive if file is present[\s\S]*?const payload = \{/;

code = code.replace(regex, `// We bypass client-side Google Drive upload and let backend/N8N handle the file data directly
    const payload = {`);

fs.writeFileSync('src/App.tsx', code);
