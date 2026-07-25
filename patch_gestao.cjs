const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// Add deleteDoc import
code = code.replace(
  "import { collection, onSnapshot, doc, setDoc, addDoc } from 'firebase/firestore';",
  "import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';"
);

// Add handleDeleteTest function
const deleteFunc = `
  const handleDeleteTest = async (collectionName: string, id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este teste?")) return;
    setIsSavingSync(true);
    try {
      await deleteDoc(doc(db, collectionName, id));
      showSyncSuccess('Teste excluído com sucesso!');
    } catch(e) {
      console.error(e);
      alert("Erro ao excluir o teste.");
    } finally {
      setIsSavingSync(false);
    }
  };
`;

code = code.replace(
  "const handlePerfilComercialComplete = async",
  deleteFunc + "\n  const handlePerfilComercialComplete = async"
);

// Update selectors to get the most recent test
code = code.replace(
  "const vendorDisc = selectedVendor ? discResults.find(d => d.vendorId === selectedVendor.id) : null;",
  "const vendorDisc = selectedVendor ? [...discResults].sort((a,b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()).find(d => d.vendorId === selectedVendor.id) : null;"
);
code = code.replace(
  "const vendorPdis = selectedVendor ? pdis.filter(p => p.vendorId === selectedVendor.id) : [];",
  "const vendorPdis = selectedVendor ? [...pdis].filter(p => p.vendorId === selectedVendor.id).sort((a,b) => new Date(b.dataCriacao || 0).getTime() - new Date(a.dataCriacao || 0).getTime()) : [];"
);
code = code.replace(
  "const vendorRaiox = selectedVendor ? raioxes.filter(r => r.vendorId === selectedVendor.id) : [];",
  "const vendorRaiox = selectedVendor ? [...raioxes].filter(r => r.vendorId === selectedVendor.id).sort((a,b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()) : [];"
);
code = code.replace(
  "const vendorCompetencias = selectedVendor ? competencias.find(c => c.vendorId === selectedVendor.id) : null;",
  "const vendorCompetencias = selectedVendor ? [...competencias].sort((a,b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()).find(c => c.vendorId === selectedVendor.id) : null;"
);
code = code.replace(
  "const vendorPerfilComercial = selectedVendor ? perfilComerciais.find(pc => pc.vendorId === selectedVendor.id) : null;",
  "const vendorPerfilComercial = selectedVendor ? [...perfilComerciais].sort((a,b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()).find(pc => pc.vendorId === selectedVendor.id) : null;"
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Patched GestaoPessoasPage.tsx with basic functions");
