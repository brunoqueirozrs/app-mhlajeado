const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');
code = code.replace("image:        { type: 'jpeg', quality: 0.98 },", "image:        { type: 'jpeg' as const, quality: 0.98 },");
fs.writeFileSync('src/components/CobrancasDashboard.tsx', code, 'utf8');
