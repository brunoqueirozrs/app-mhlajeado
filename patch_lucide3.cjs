const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import { Terminal,", "import { Terminal, Database, CheckCircle,");

fs.writeFileSync('src/App.tsx', code);
