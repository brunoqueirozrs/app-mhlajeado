const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regexPrint = /const handlePrintReport = \(\) => \{\s*window\.print\(\);\s*\};/m;
const replacePrint = `const handlePrintReport = () => {
    if (window.self !== window.top) {
      alert("Para imprimir ou salvar em PDF, abra o sistema em uma nova guia clicando no ícone de 'Nova Guia' (canto superior direito do painel de preview).");
    } else {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };`;
code = code.replace(regexPrint, replacePrint);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
