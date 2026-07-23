const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

code = code.replace(
  /console\.log\("É Admin\?", isAdmin\);/,
  `console.log("É Admin?", isAdmin);
      console.log("selectedVendor final:", selectedVendor);
      console.log("loggedVendor:", loggedVendor);`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
