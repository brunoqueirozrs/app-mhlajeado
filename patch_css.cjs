const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const regexPrint = /@media print \{[\s\S]*?\.print\\:hidden \{/m;
const replacePrint = `@media print {
  body {
    background: white;
  }
  
  /* Esconde por padrão no print, a menos que especificado */
  .print-only {
    display: block !important;
  }
  
  .print\\:hidden {`;
code = code.replace(regexPrint, replacePrint);

fs.writeFileSync('src/index.css', code);
