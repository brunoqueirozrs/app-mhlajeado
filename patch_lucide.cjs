const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "LayoutGrid,",
  "LayoutGrid, Database,"
);

fs.writeFileSync('src/App.tsx', code);
