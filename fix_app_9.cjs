const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace(/return \(\) => window\.removeEventListener\("webhook-error", handler\);\n\s*\}\}\n\s*\}\n\s*\}, \[\]\);/g, 'return () => window.removeEventListener("webhook-error", handler);\n  }, []);');
fs.writeFileSync('src/App.tsx', text);
