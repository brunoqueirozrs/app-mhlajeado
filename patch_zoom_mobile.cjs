const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasPage.tsx', 'utf8');

code = code.replace(
  '<div className="font-extrabold text-slate-800 leading-tight text-sm">{item.nomeCliente}</div>',
  '<div className="font-extrabold text-slate-800 leading-tight text-sm transform hover:scale-105 hover:text-sky-600 transition-all origin-left cursor-pointer">{item.nomeCliente}</div>'
);

fs.writeFileSync('src/components/CobrancasPage.tsx', code, 'utf8');
