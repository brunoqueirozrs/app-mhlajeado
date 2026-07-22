const fs = require('fs');

function fixPrint(file) {
  let code = fs.readFileSync(file, 'utf8');
  // For CobrancasDashboard.tsx
  if (file.includes('CobrancasDashboard.tsx')) {
    const regexPrint = /const exportToPDF = \(\) => \{\s*window\.print\(\);\s*\};/m;
    const replacePrint = `const exportToPDF = () => {
    if (window.self !== window.top) {
      alert("Para imprimir ou salvar em PDF, abra o sistema em uma nova guia clicando no ícone de 'Nova Guia' (canto superior direito do painel de preview).");
    } else {
      setTimeout(() => { window.print(); }, 500);
    }
  };`;
    code = code.replace(regexPrint, replacePrint);
  }

  // For EstrategiaPage.tsx
  if (file.includes('EstrategiaPage.tsx')) {
    const regexPrint = /onClick=\{\(\) => window\.print\(\)\}/g;
    const replacePrint = `onClick={() => {
                if (window.self !== window.top) {
                  alert("Para imprimir ou salvar em PDF, abra o sistema em uma nova guia clicando no ícone de 'Nova Guia'.");
                } else {
                  setTimeout(() => { window.print(); }, 500);
                }
              }}`;
    code = code.replace(regexPrint, replacePrint);
  }
  
  fs.writeFileSync(file, code);
}

fixPrint('src/components/CobrancasDashboard.tsx');
fixPrint('src/components/EstrategiaPage.tsx');
