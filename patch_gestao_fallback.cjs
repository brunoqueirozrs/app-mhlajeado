const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(
  'id: `vendor_temp_${Date.now()}`,',
  'id: `vendor_temp_${loggedUser.replace(/\\s+/g, "_")}`, // Consistently hash instead of Date.now() to prevent data loss on re-render'
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Patched vendor fallback");
