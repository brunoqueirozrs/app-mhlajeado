const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// handlePerfilComercialComplete 1
code = code.replace(
  /setIsSavingSync\(true\);\s*await Promise\.all\(updated\.map\(pc => setDoc\(doc\(db, 'perfil_comerciais', pc\.id\), pc\)\)\);\s*await addDoc\(collection\(db, 'test_results'\), \{[^}]+\}\);\s*setIsSavingSync\(false\);\s*showSyncSuccess\('Perfil Comercial salvo com sucesso!'\);/g,
  `setIsSavingSync(true);
      try {
        await Promise.all(updated.map(pc => setDoc(doc(db, 'perfil_comerciais', pc.id), pc)));
        await addDoc(collection(db, 'test_results'), {
          vendorId: selectedVendor.id,
          vendorName: selectedVendor.nome,
          type: 'perfil_comercial',
          date: new Date().toISOString(),
          summary: 'Perfil Comercial Atualizado',
          details: updated
        });
        showSyncSuccess('Perfil Comercial salvo com sucesso!');
      } catch(e) {
        console.error(e);
        alert("Erro ao salvar Perfil Comercial");
      } finally {
        setIsSavingSync(false);
      }`
);

// handlePerfilComercialComplete 2
code = code.replace(
  /setIsSavingSync\(true\);\s*await setDoc\(doc\(db, 'perfil_comerciais', newRecord\.id\), newRecord\);\s*await addDoc\(collection\(db, 'test_results'\), \{[^}]+\}\);\s*setIsSavingSync\(false\);\s*showSyncSuccess\('Perfil Comercial salvo com sucesso!'\);/g,
  `setIsSavingSync(true);
      try {
        await setDoc(doc(db, 'perfil_comerciais', newRecord.id), newRecord);
        await addDoc(collection(db, 'test_results'), {
          vendorId: selectedVendor.id,
          vendorName: selectedVendor.nome,
          type: 'perfil_comercial',
          date: new Date().toISOString(),
          summary: 'Novo Perfil Comercial',
          details: newRecord
        });
        showSyncSuccess('Perfil Comercial salvo com sucesso!');
      } catch(e) {
        console.error(e);
        alert("Erro ao salvar Perfil Comercial");
      } finally {
        setIsSavingSync(false);
      }`
);

// handleCompetenciasComplete 1
code = code.replace(
  /setIsSavingSync\(true\);\s*await Promise\.all\(updated\.map\(c => setDoc\(doc\(db, 'competencias', c\.id\), c\)\)\);\s*await addDoc\(collection\(db, 'test_results'\), \{[^}]+\}\);\s*setIsSavingSync\(false\);\s*showSyncSuccess\('Competências salvas com sucesso!'\);/g,
  `setIsSavingSync(true);
      try {
        await Promise.all(updated.map(c => setDoc(doc(db, 'competencias', c.id), c)));
        await addDoc(collection(db, 'test_results'), {
          vendorId: selectedVendor.id,
          vendorName: selectedVendor.nome,
          type: 'competencias',
          date: new Date().toISOString(),
          summary: 'Competências Atualizadas',
          details: updated
        });
        showSyncSuccess('Competências salvas com sucesso!');
      } catch(e) {
        console.error(e);
        alert("Erro ao salvar Competências");
      } finally {
        setIsSavingSync(false);
      }`
);

// handleCompetenciasComplete 2
code = code.replace(
  /setIsSavingSync\(true\);\s*await setDoc\(doc\(db, 'competencias', newComp\.id\), newComp\);\s*await addDoc\(collection\(db, 'test_results'\), \{[^}]+\}\);\s*setIsSavingSync\(false\);\s*showSyncSuccess\('Competências salvas com sucesso!'\);/g,
  `setIsSavingSync(true);
    try {
      await setDoc(doc(db, 'competencias', newComp.id), newComp);
      await addDoc(collection(db, 'test_results'), {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.nome,
        type: 'competencias',
        date: new Date().toISOString(),
        summary: 'Novas Competências',
        details: newComp
      });
      showSyncSuccess('Competências salvas com sucesso!');
    } catch(e) {
      console.error(e);
      alert("Erro ao salvar Competências");
    } finally {
      setIsSavingSync(false);
    }`
);

// generateRaiox
code = code.replace(
  /setIsSavingSync\(true\);\s*await setDoc\(doc\(db, 'raioxes', newRx\.id\), newRx\);\s*await addDoc\(collection\(db, 'test_results'\), \{[^}]+\}\);\s*setIsSavingSync\(false\);\s*showSyncSuccess\('Raio-X salvo com sucesso!'\);/g,
  `setIsSavingSync(true);
        try {
          await setDoc(doc(db, 'raioxes', newRx.id), newRx);
          await addDoc(collection(db, 'test_results'), {
            vendorId: selectedVendor.id,
            vendorName: selectedVendor.nome,
            type: 'raiox',
            date: new Date().toISOString(),
            summary: 'Novo Raio-X Gerado',
            details: newRx
          });
          showSyncSuccess('Raio-X salvo com sucesso!');
        } catch(e) {
          console.error(e);
          alert("Erro ao salvar Raio-X");
        } finally {
          setIsSavingSync(false);
        }`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
