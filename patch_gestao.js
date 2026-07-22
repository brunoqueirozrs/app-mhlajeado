const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regex = /const handlePrintPdf = async \(\) => \{[\s\S]*?\}\s*?\};\s*const renderRolePlay/m;
const replacement = `const handlePrintPdf = () => {
    window.print();
  };

  const renderRolePlay`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
