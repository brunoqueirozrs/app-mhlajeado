const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(
  '                      ) : vendorDisc ? (',
  '                      ) : vendorDisc ? (<>'
);

code = code.replace(
  '                        <div className="p-12 flex flex-col items-center justify-center text-center">',
  '                      </>) : (\n                        <div className="p-12 flex flex-col items-center justify-center text-center">'
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Fixed JSX syntax error");
