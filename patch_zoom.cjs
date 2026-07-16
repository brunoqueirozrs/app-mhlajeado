const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasPage.tsx', 'utf8');

code = code.replace(
  '<div className="font-extrabold text-slate-800 leading-tight block truncate whitespace-normal max-w-[200px]" title={item.nomeCliente}>',
  '<div className="font-extrabold text-slate-800 leading-tight block truncate whitespace-normal max-w-[200px] transform hover:scale-105 hover:text-sky-600 transition-all origin-left cursor-pointer" title={item.nomeCliente}>'
);

fs.writeFileSync('src/components/CobrancasPage.tsx', code, 'utf8');
