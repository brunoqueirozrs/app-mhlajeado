const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');

const regexPrint = /const exportToPDF = \(\) => \{[\s\S]*?\};\s*const generateDiagnostic/m;
const replacePrint = `const exportToPDF = () => {
    window.print();
  };

  const generateDiagnostic`;
code = code.replace(regexPrint, replacePrint);

fs.writeFileSync('src/components/CobrancasDashboard.tsx', code);
