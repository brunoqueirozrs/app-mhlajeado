const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const importRegex = /import \{ collection, onSnapshot, doc, setDoc \} from 'firebase\/firestore';/;
code = code.replace(importRegex, "import { collection, onSnapshot, doc, setDoc, addDoc } from 'firebase/firestore';");

const isSavingRegex = /const \[isGeneratingRaiox, setIsGeneratingRaiox\] = useState\(false\);/;
code = code.replace(isSavingRegex, "const [isGeneratingRaiox, setIsGeneratingRaiox] = useState(false);\n  const [isSavingSync, setIsSavingSync] = useState(false);\n  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);\n\n  const showSyncSuccess = (msg: string) => {\n    setSyncSuccessMsg(msg);\n    setTimeout(() => setSyncSuccessMsg(null), 3000);\n  };\n");

const renderSyncMsgRegex = /\{vendorTab === "modulos" && \(/;
code = code.replace(renderSyncMsgRegex, `{/* Sync feedback */}\n              {isSavingSync && (\n                <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">\n                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>\n                  <span className="text-sm font-bold">Sincronizando com Firestore...</span>\n                </div>\n              )}\n              {syncSuccessMsg && (\n                <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">\n                  <CheckCircle className="w-5 h-5" />\n                  <span className="text-sm font-bold">{syncSuccessMsg}</span>\n                </div>\n              )}\n\n              {vendorTab === "modulos" && (`);

// DISC save
code = code.replace(
  /setDoc\(doc\(db, 'disc_results', newRes\.id\), newRes\);/,
  `setIsSavingSync(true);
    await setDoc(doc(db, 'disc_results', newRes.id), newRes);
    await addDoc(collection(db, 'test_results'), {
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.nome,
      type: 'disc',
      date: new Date().toISOString(),
      summary: \`Perfil: \${newRes.perfilAnimal}\`,
      details: newRes
    });
    setIsSavingSync(false);
    showSyncSuccess('Teste DISC salvo com sucesso!');`
);

// PDI save (is not a test exactly, but we can log it)
code = code.replace(
  /setDoc\(doc\(db, 'pdis', pdiToSave\.id\), pdiToSave\);/,
  `setIsSavingSync(true);
    await setDoc(doc(db, 'pdis', pdiToSave.id), pdiToSave);
    setIsSavingSync(false);
    showSyncSuccess('PDI salvo com sucesso!');`
);

// Competencias save
code = code.replace(
  /updated\.forEach\(c => setDoc\(doc\(db, 'competencias', c\.id\), c\)\);/g,
  `setIsSavingSync(true);
      await Promise.all(updated.map(c => setDoc(doc(db, 'competencias', c.id), c)));
      await addDoc(collection(db, 'test_results'), {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.nome,
        type: 'competencias',
        date: new Date().toISOString(),
        summary: 'Avaliação de Competências atualizada',
        details: updated
      });
      setIsSavingSync(false);
      showSyncSuccess('Competências salvas com sucesso!');`
);

code = code.replace(
  /setDoc\(doc\(db, 'competencias', newComp\.id\), newComp\);/,
  `setIsSavingSync(true);
    await setDoc(doc(db, 'competencias', newComp.id), newComp);
    await addDoc(collection(db, 'test_results'), {
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.nome,
      type: 'competencias',
      date: new Date().toISOString(),
      summary: 'Nova Avaliação de Competências',
      details: newComp
    });
    setIsSavingSync(false);
    showSyncSuccess('Competências salvas com sucesso!');`
);

// Perfil Comercial save
code = code.replace(
  /updated\.forEach\(pc => setDoc\(doc\(db, 'perfil_comerciais', pc\.id\), pc\)\);/,
  `setIsSavingSync(true);
      await Promise.all(updated.map(pc => setDoc(doc(db, 'perfil_comerciais', pc.id), pc)));
      await addDoc(collection(db, 'test_results'), {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.nome,
        type: 'perfil_comercial',
        date: new Date().toISOString(),
        summary: 'Perfil Comercial atualizado',
        details: updated
      });
      setIsSavingSync(false);
      showSyncSuccess('Perfil Comercial salvo com sucesso!');`
);

code = code.replace(
  /setDoc\(doc\(db, 'perfil_comerciais', newRecord\.id\), newRecord\);/,
  `setIsSavingSync(true);
      await setDoc(doc(db, 'perfil_comerciais', newRecord.id), newRecord);
      await addDoc(collection(db, 'test_results'), {
        vendorId: selectedVendor.id,
        vendorName: selectedVendor.nome,
        type: 'perfil_comercial',
        date: new Date().toISOString(),
        summary: 'Novo Perfil Comercial',
        details: newRecord
      });
      setIsSavingSync(false);
      showSyncSuccess('Perfil Comercial salvo com sucesso!');`
);

// Raiox save
code = code.replace(
  /setDoc\(doc\(db, 'raioxes', newRx\.id\), newRx\);/,
  `setIsSavingSync(true);
        await setDoc(doc(db, 'raioxes', newRx.id), newRx);
        await addDoc(collection(db, 'test_results'), {
          vendorId: selectedVendor.id,
          vendorName: selectedVendor.nome,
          type: 'raiox',
          date: new Date().toISOString(),
          summary: 'Análise de Raio-X com IA concluída',
          details: newRx
        });
        setIsSavingSync(false);
        showSyncSuccess('Raio-X salvo com sucesso!');`
);

// Fix async on handles
code = code.replace(/const handleTestSubmit = \(\) => \{/, "const handleTestSubmit = async () => {");
code = code.replace(/const handleSavePdi = \(\) => \{/, "const handleSavePdi = async () => {");
code = code.replace(/const handleCompetenciasComplete = \(resultados: Record<string, number>\) => \{/, "const handleCompetenciasComplete = async (resultados: Record<string, number>) => {");
code = code.replace(/const handlePerfilComercialComplete = \(data: Omit<PerfilComercial, 'id' \| 'vendorId' \| 'data'>\) => \{/, "const handlePerfilComercialComplete = async (data: Omit<PerfilComercial, 'id' | 'vendorId' | 'data'>) => {");

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
