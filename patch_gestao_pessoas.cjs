const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const targetStr = `  const loggedVendor = vendors.find(v => v.nome === loggedUser);
  const effectiveVendorId = isAdmin ? selectedVendorId : loggedVendor?.id;
  const selectedVendor = isAdmin ? (vendors.find(v => v.id === selectedVendorId) || vendors[0]) : loggedVendor;`;

const replacement = `  let loggedVendor = vendors.find(v => v.nome === loggedUser);
  if (!isAdmin && !loggedVendor) {
    loggedVendor = {
      id: "usr_" + loggedUser.replace(/\\s+/g, '_').toLowerCase(),
      nome: loggedUser,
      meta: 0
    };
  }
  const effectiveVendorId = isAdmin ? selectedVendorId : loggedVendor?.id;
  const selectedVendor = isAdmin ? (vendors.find(v => v.id === selectedVendorId) || vendors[0]) : loggedVendor;`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
