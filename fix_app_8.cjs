const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace(/window\.removeEventListener\("webhook-error", handler\);\n\s*\}\}\n\s*\}\n\s*\}, \[\]\);/, 'window.removeEventListener("webhook-error", handler);\n  }, []);');
fs.writeFileSync('src/App.tsx', text);
