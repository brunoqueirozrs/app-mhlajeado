const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regex = /<div id="pdf-dashboard-content" className="space-y-6 print:space-y-4">[\s\S]*?(?=<\/div>)/;
const replacement = `<div id="pdf-dashboard-content" className="space-y-6 print:space-y-4">
                    {renderRaiox()}
                    {renderDisc()}
                    {renderPdi()}
                    {renderCompetencias()}
                    {renderPerfilComercial()}
                    {renderFitCargo()}
                    {renderIndices()}
                    {renderClima()}
                    {renderPulse()}
                    {renderAval360()}
                    {renderInteligenciaEmocional()}
                    {renderTesteConhecimento()}
                    {renderBigFive()}
                  `;
code = code.replace(regex, replacement);
fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
