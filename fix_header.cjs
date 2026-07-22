const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// The file currently has:
// {selectedVendor ? (
//  <div className="flex flex-col h-[calc(100vh-200px)] print:h-auto print:block">
//    {/* Cabecalho de Impressao Fixo */}                        {/* Header do Colaborador (Web) */}
//    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">

// and later has <div className="hidden print:flex flex-col mb-8 border-b-2 border-slate-800 pb-4">...

// Let's replace the whole block from `{/* Cabecalho de Impressao Fixo */}` up to `</select>` and beyond, actually I will just use regex to replace everything between `{selectedVendor ? (` and `<div className="flex items-center gap-2 print:hidden">`

const regex = /\{selectedVendor \? \([\s\S]*?<div className="flex items-center gap-2 print:hidden">/;

const replacement = `{selectedVendor ? (
          <div className="flex flex-col h-[calc(100vh-200px)] print:h-auto print:block">
            {/* Cabecalho de Impressao Fixo */}
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
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Header do Colaborador (Web) */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-xl">
                  {selectedVendor.nome.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="flex flex-col">
                  {isAdmin ? (
                    <div className="relative inline-flex items-center">
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

              <div className="flex items-center gap-2 print:hidden">`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
