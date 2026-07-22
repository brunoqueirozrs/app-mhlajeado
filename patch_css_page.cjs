const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const regexPrint = /@page \{\s*margin: 1\.5cm;\s*\}/m;
const replacePrint = `@page {
    margin: 1.5cm;
    @bottom-right {
      content: "Página " counter(page) " de " counter(pages);
      font-size: 10px;
      color: #64748b;
    }
  }`;
code = code.replace(regexPrint, replacePrint);

fs.writeFileSync('src/index.css', code);
