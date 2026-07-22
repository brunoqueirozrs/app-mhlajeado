const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasDashboard.tsx', 'utf8');

const regex = /const exportToPDF = \(\) => \{[\s\S]*?\}\);\s*?\};\s*const generateDiagnostic/m;
const replacement = `const exportToPDF = () => {
    window.print();
  };

  const generateDiagnostic`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/CobrancasDashboard.tsx', code);
