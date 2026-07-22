const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regexHeader = /<h3 className="text-lg font-black text-slate-800 hidden print:block">\s*\{selectedVendor\.nome\} - Relatório Gerado em: \{new Date\(\)\.toLocaleDateString\('pt-BR'\)\}\s*<\/h3>/m;
const replaceHeader = `<div className="hidden print:flex flex-col mb-8 border-b-2 border-slate-800 pb-4">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Relatório de Desempenho e Perfil</h1>
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">Colaborador: {selectedVendor.nome}</h2>
                        <p className="text-slate-600 mt-1">Cargo: Consultor Comercial (PAP) | Status: Ativo</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-600 font-medium">Data da impressão: {new Date().toLocaleDateString('pt-BR')}</p>
                        <p className="text-slate-600 font-medium">Gerado por: {loggedUser.nome}</p>
                      </div>
                    </div>
                  </div>`;
code = code.replace(regexHeader, replaceHeader);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
