const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const regex = /<div id="pdf-dashboard-content" className="space-y-6 print:space-y-4">/;
const replacement = `<div id="pdf-dashboard-content" className="space-y-6 print:space-y-4">
                    {/* Tabela de Resumo de Indicadores (Apenas Impressão) */}
                    <div className="hidden print:block mb-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Quadro Resumo de Indicadores</h3>
                      <table className="w-full border-collapse border border-slate-200 text-sm text-left">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="border border-slate-200 p-2 font-bold text-slate-800 uppercase text-xs tracking-wider">Módulo / Avaliação</th>
                            <th className="border border-slate-200 p-2 font-bold text-slate-800 uppercase text-xs tracking-wider text-center">Score / Resultado</th>
                            <th className="border border-slate-200 p-2 font-bold text-slate-800 uppercase text-xs tracking-wider">Status / Nível</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Fit de Cargo</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">75%</td>
                            <td className="border border-slate-200 p-2 text-emerald-600 font-bold">Adequado</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Competências</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">80%</td>
                            <td className="border border-slate-200 p-2 text-emerald-600 font-bold">Desenvolvido</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Perfil Comercial (Tx. Conversão)</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">82%</td>
                            <td className="border border-slate-200 p-2 text-blue-600 font-bold">Alta Performance</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Avaliação 360°</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">85%</td>
                            <td className="border border-slate-200 p-2 text-blue-600 font-bold">Destaque</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium">Teste de Conhecimento</td>
                            <td className="border border-slate-200 p-2 text-slate-800 font-bold text-center">78%</td>
                            <td className="border border-slate-200 p-2 text-emerald-600 font-bold">Aprovado</td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td className="border border-slate-200 p-2 text-slate-700 font-medium border-t-2 border-t-slate-400">Raio-X (IA) Score Final</td>
                            <td className="border border-slate-200 p-2 text-slate-900 font-black text-center border-t-2 border-t-slate-400">80%</td>
                            <td className="border border-slate-200 p-2 text-slate-900 font-black border-t-2 border-t-slate-400">Excelente Perfil</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
