const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const effectCode = `  useEffect(() => {
    if (!isAdmin && !selectedVendorId && vendors.length > 0) {
      const myVendor = vendors.find(v => v.nome === loggedUser);
      if (myVendor) {
        setSelectedVendorId(myVendor.id);
      } else {
        setSelectedVendorId(vendors[0].id); // fallback
      }
    }
  }, [isAdmin, vendors, loggedUser, selectedVendorId]);

  useEffect(() => {`;

code = code.replace('useEffect(() => {', effectCode);
fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Fixed init");
