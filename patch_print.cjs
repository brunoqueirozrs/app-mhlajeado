const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regexPrint = /const handlePrintPdf = \(\) => \{[\s\S]*?\};\s*const renderRolePlay/m;
const replacePrint = `const handlePrintPdf = () => {
    window.print();
  };

  const renderRolePlay`;
code = code.replace(regexPrint, replacePrint);

const regexDashboard = /\{renderAval360\(\)\}/;
const replaceDashboard = `{renderAval360()}
                    {renderInteligenciaEmocional()}
                    {renderTesteConhecimento()}
                    {renderBigFive()}`;
code = code.replace(regexDashboard, replaceDashboard);

const regexName = /<h3 className="text-lg font-black text-slate-800 hidden print:block">\{selectedVendor\.nome\}<\/h3>/;
const replaceName = `<h3 className="text-lg font-black text-slate-800 hidden print:block">
                    {selectedVendor.nome} - Relatório Gerado em: {new Date().toLocaleDateString('pt-BR')}
                  </h3>`;
code = code.replace(regexName, replaceName);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
