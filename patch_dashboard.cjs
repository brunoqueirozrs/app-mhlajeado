const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regexDashboard = /\{renderAval360\(\)\}\s*\{renderInteligenciaEmocional\(\)\}\s*\{renderTesteConhecimento\(\)\}\s*\{renderBigFive\(\)\}/;
const replaceDashboard = `{renderRaiox()}
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
                    {renderBigFive()}`;
code = code.replace(regexDashboard, replaceDashboard);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
