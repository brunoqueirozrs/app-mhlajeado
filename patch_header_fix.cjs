const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regexNormalHeader = /\{\/\* Header do Colaborador \*\/\}\s*<div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:shadow-none print:border-slate-300 print:mb-4">/m;
const replaceNormalHeader = `{/* Cabecalho de Impressao Fixo */}
            <div className="hidden print:flex flex-col mb-8 border-b-2 border-slate-800 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900">Relatório de Gestão de Pessoas</h1>
                  <p className="text-slate-500 mt-1">Análise de Desempenho e Comportamento</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 font-medium">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="text-slate-600 font-medium text-sm">Gerado por: {loggedUser}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Colaborador: {selectedVendor.nome}</h2>
                  <p className="text-slate-600 mt-1">Cargo: Consultor Comercial (PAP) | Status: Ativo</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Header do Colaborador (Web) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">`;
code = code.replace(regexNormalHeader, replaceNormalHeader);

const regexOldPrintHeader = /<div className="hidden print:flex flex-col mb-8 border-b-2 border-slate-800 pb-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/m;
code = code.replace(regexOldPrintHeader, '');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
