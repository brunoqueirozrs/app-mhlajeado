const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(
  /let loggedVendor = extendedVendors\.find\(v => v\.nome\.trim\(\)\.toLowerCase\(\) === loggedUser\.trim\(\)\.toLowerCase\(\)\);/,
  `let loggedVendor = extendedVendors.find(v => (v.nome || "").trim().toLowerCase() === (loggedUser || "").trim().toLowerCase());`
);

code = code.replace(
  /id: "usr_" \+ loggedUser\.replace\(\/\\\\s\+\/g, '_'\)\.toLowerCase\(\),/,
  `id: "usr_" + (loggedUser || "").replace(/\\s+/g, '_').toLowerCase(),`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
