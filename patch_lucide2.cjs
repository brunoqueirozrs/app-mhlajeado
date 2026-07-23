const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if(!code.includes("CheckCircle,")){
  code = code.replace("LayoutGrid, Database,", "LayoutGrid, Database, CheckCircle,");
}

fs.writeFileSync('src/App.tsx', code);
