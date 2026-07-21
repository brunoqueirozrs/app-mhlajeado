const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const oldHeaderRegex = /\{\/\* Header do Colaborador \*\/\}[\s\S]*?<div className="flex-1 overflow-y-auto/;

const newHeader = `{/* Header do Colaborador */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:shadow-none print:border-slate-300 print:mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex flex-col">
                  {isAdmin ? (
                    <div className="relative inline-flex items-center print:hidden">
                      <select
                        className="appearance-none bg-transparent font-black text-lg text-slate-800 pr-8 py-0 focus:outline-none cursor-pointer border-none p-0 hover:text-indigo-600 transition-colors"
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
                      <svg className="w-4 h-4 text-slate-400 absolute right-1 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  ) : (
                    <h3 className="text-lg font-black text-slate-800">{selectedVendor.nome}</h3>
                  )}
                  <h3 className="text-lg font-black text-slate-800 hidden print:block">{selectedVendor.nome}</h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      <User className="w-3 h-3" /> PAP
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Shield className="w-3 h-3" /> Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo da Aba */}
            <div className="flex-1 overflow-y-auto`;

code = code.replace(oldHeaderRegex, newHeader);
fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Fixed collaborator header");
