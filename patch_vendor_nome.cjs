const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(/{selectedVendor\.nome\.substring\(0, 2\)\.toUpperCase\(\)}/g, '{(selectedVendor?.nome || "US").substring(0, 2).toUpperCase()}');

code = code.replace(/<h2 className="text-xl font-bold text-slate-800">Colaborador: {selectedVendor\.nome}<\/h2>/g, '<h2 className="text-xl font-bold text-slate-800">Colaborador: {selectedVendor?.nome || "Sem Nome"}</h2>');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
