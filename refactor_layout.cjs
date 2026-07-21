const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// Replace the main grid definition
code = code.replace(
  '<div className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-4" : ""} gap-6`}>',
  '<div className="space-y-6">'
);

// Replace the side list with a top dropdown block
const sideListRegex = /\{\/\* Lista de Colaboradores \*\/\}[\s\S]*?\{\/\* Dashboard do Colaborador Selecionado \*\/\}/;
const topDropdown = `
        {/* Seletor de Colaboradores */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-800">Selecione o Colaborador</h3>
                <p className="text-xs text-slate-500">Escolha um consultor para visualizar seu Gêmeo Digital</p>
              </div>
            </div>
            <select
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium"
              value={selectedVendorId || ""}
              onChange={(e) => {
                setSelectedVendorId(e.target.value);
                setVendorTab("modulos");
              }}
            >
              <option value="" disabled>Selecione um vendedor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          </div>
        )}

        {/* Dashboard do Colaborador Selecionado */}`;
code = code.replace(sideListRegex, topDropdown);

// Replace the lg:col-span-3 classes since we are full width now
code = code.replace(
  'className={`${isAdmin ? "lg:col-span-3" : ""} flex flex-col h-[calc(100vh-200px)] print:h-auto print:block`}',
  'className="flex flex-col h-[calc(100vh-200px)] print:h-auto print:block"'
);
code = code.replace(
  'className={`${isAdmin ? "lg:col-span-3" : ""} bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] print:h-auto`}',
  'className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] print:h-auto"'
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Updated layout");
