const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const targetStr = `  const loggedVendor = vendors.find(v => v.nome === loggedUser);
  if (!isAdmin && !loggedVendor) {
    loggedVendor = {
      id: "usr_" + loggedUser.replace(/\\s+/g, '_').toLowerCase(),
      nome: loggedUser,
      meta: 0
    };
  }
  const effectiveVendorId = isAdmin ? selectedVendorId : loggedVendor?.id;
  const selectedVendor = isAdmin ? (vendors.find(v => v.id === selectedVendorId) || vendors[0]) : loggedVendor;`;

const replacement = `  // Criar uma lista estendida de vendedores para o admin ver todos que já fizeram teste
  const extendedVendors = [...vendors];
  
  // Adiciona vendedores que estão nos resultados de testes mas não na planilha
  discResults.forEach(d => {
    if (!extendedVendors.find(v => v.id === d.vendorId)) {
      extendedVendors.push({
        id: d.vendorId,
        nome: d.vendorName || d.vendorId,
        meta: 0
      });
    }
  });

  let loggedVendor = extendedVendors.find(v => v.nome.trim().toLowerCase() === loggedUser.trim().toLowerCase());
  
  if (!isAdmin && !loggedVendor) {
    loggedVendor = {
      id: "usr_" + loggedUser.replace(/\\s+/g, '_').toLowerCase(),
      nome: loggedUser,
      meta: 0
    };
    extendedVendors.push(loggedVendor);
  }

  const effectiveVendorId = isAdmin ? selectedVendorId : loggedVendor?.id;
  const selectedVendor = isAdmin ? (extendedVendors.find(v => v.id === selectedVendorId) || extendedVendors[0]) : loggedVendor;
`;

code = code.replace(targetStr, replacement);

// Fix the select dropdown to use extendedVendors
const dropdownTarget = `{vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.nome}</option>
                        ))}`;
const dropdownReplacement = `{extendedVendors.map(v => (
                          <option key={v.id} value={v.id}>{v.nome}</option>
                        ))}`;

code = code.replace(dropdownTarget, dropdownReplacement);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
