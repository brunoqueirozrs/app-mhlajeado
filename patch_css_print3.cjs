const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const regexPrint = /body, html, #root, main, \.overflow-y-auto, \.overflow-x-auto, \.overflow-hidden, \.flex-1 \{[\s\S]*?\}/m;
const replacePrint = `body, html, #root {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    display: block !important;
  }
  
  main, .overflow-y-auto, .overflow-x-auto, .overflow-hidden, .flex-1, .h-screen {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }`;

code = code.replace(regexPrint, replacePrint);

fs.writeFileSync('src/index.css', code);
