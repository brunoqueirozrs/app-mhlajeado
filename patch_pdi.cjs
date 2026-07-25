const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const oldPdi = `                                <span className={\`px-2 py-1 text-[10px] font-black uppercase rounded-md \${
                                  pdi.status === 'em_andamento' ? 'bg-amber-100 text-amber-700' :
                                  pdi.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }\`}>
                                  {pdi.status.replace('_', ' ')}
                                </span>`;

const newPdi = `                                <div className="flex items-center gap-2">
                                  <span className={\`px-2 py-1 text-[10px] font-black uppercase rounded-md \${
                                    pdi.status === 'em_andamento' ? 'bg-amber-100 text-amber-700' :
                                    pdi.status === 'concluido' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                  }\`}>
                                    {pdi.status.replace('_', ' ')}
                                  </span>
                                  {isAdmin && (
                                    <button onClick={() => handleDeleteTest('pdis', pdi.id)} className="text-[10px] font-bold text-red-500 hover:bg-red-50 p-1 rounded-md border border-red-200 transition">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>`;

code = code.replace(oldPdi, newPdi);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Patched PDI");
