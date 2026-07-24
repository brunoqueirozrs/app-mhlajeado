const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\/\/ Upload to Google Drive using the user's client-side OAuth token[\s\S]*?if \(driveLink\) \{\n        fileData = undefined; \n      \}\n    \}\n\n    const payload = \{/;

const newLogic = `// We bypass client-side Google Drive upload and let backend/N8N handle the file data directly
    const payload = {`;

code = code.replace(regex, newLogic);
fs.writeFileSync('src/App.tsx', code);
console.log("Reverted frontend OAuth pop-up.");
