const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// 1. Remove the standalone "Seletor de Colaboradores"
const seletorRegex = /\{\/\* Seletor de Colaboradores \*\/\}[\s\S]*?\{\/\* Dashboard do Colaborador Selecionado \*\/\}/;
code = code.replace(seletorRegex, '{/* Dashboard do Colaborador Selecionado */}');

// 2. Replace the static h3 in the header with the inline select
const h3Regex = /<h3 className="text-xl font-black text-slate-800">\{selectedVendor\.nome\}<\/h3>/;
const inlineSelect = `{isAdmin ? (
                    <>
                      <div className="relative inline-block print:hidden">
                        <select
                          className="text-xl font-black text-slate-800 bg-transparent border-0 border-b-2 border-slate-200 focus:ring-0 focus:border-indigo-600 cursor-pointer pb-1 pr-8 pl-0 appearance-none hover:border-indigo-400 transition-colors focus:outline-none"
                          value={selectedVendorId || ""}
                          onChange={(e) => {
                            setSelectedVendorId(e.target.value);
                            setVendorTab("modulos");
                          }}
                        >
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.nome}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 hidden print:block">{selectedVendor.nome}</h3>
                    </>
                  ) : (
                    <h3 className="text-xl font-black text-slate-800">{selectedVendor.nome}</h3>
                  )}`;

code = code.replace(h3Regex, inlineSelect);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Fixed selector");
