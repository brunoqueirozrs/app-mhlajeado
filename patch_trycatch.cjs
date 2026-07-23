const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// handleTestSubmit
code = code.replace(
  /setIsSavingSync\(true\);\s*await setDoc\(doc\(db, 'disc_results', newRes\.id\), newRes\);\s*await addDoc\(collection\(db, 'test_results'\), \{[^\}]+\}\);\s*setIsSavingSync\(false\);\s*showSyncSuccess\('Teste DISC salvo com sucesso!'\);\s*setIsTakingTest\(false\);/,
  `setIsSavingSync(true);\n    try {\n      await setDoc(doc(db, 'disc_results', newRes.id), newRes);\n      await addDoc(collection(db, 'test_results'), {\n        vendorId: selectedVendor.id,\n        vendorName: selectedVendor.nome,\n        type: 'disc',\n        date: new Date().toISOString(),\n        summary: \`Perfil: \${newRes.perfilAnimal}\`,\n        details: newRes\n      });\n      showSyncSuccess('Teste DISC salvo com sucesso!');\n      setIsTakingTest(false);\n    } catch (error) {\n      console.error(error);\n      alert("Erro ao salvar o teste no Firebase.");\n    } finally {\n      setIsSavingSync(false);\n    }`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
