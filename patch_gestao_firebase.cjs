const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// Add Firebase imports
code = code.replace(
  /import { Vendor, DiscResult/, 
  `import { db } from '../lib/firebase';\nimport { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';\nimport { Vendor, DiscResult`
);

// Replace state initializations
const regexStates = /const \[discResults.*?\] = useState<DiscResult\[\]>\(.*?\);.*?useEffect\(\(\) => \{\s*localStorage\.setItem\('gestao_perfilComerciais', JSON\.stringify\(perfilComerciais\)\);\s*\}, \[perfilComerciais\]\);/ms;

const replacementStates = `const [discResults, setDiscResults] = useState<DiscResult[]>([]);
  const [pdis, setPdis] = useState<PDI[]>([]);
  const [raioxes, setRaioxes] = useState<RaioX[]>([]);
  const [competencias, setCompetencias] = useState<CompetenciaAvaliacao[]>([]);
  const [perfilComerciais, setPerfilComerciais] = useState<PerfilComercial[]>([]);

  useEffect(() => {
    const unsubDisc = onSnapshot(collection(db, 'disc_results'), (snapshot) => {
      setDiscResults(snapshot.docs.map(doc => doc.data() as DiscResult));
    });
    const unsubPdi = onSnapshot(collection(db, 'pdis'), (snapshot) => {
      setPdis(snapshot.docs.map(doc => doc.data() as PDI));
    });
    const unsubRaiox = onSnapshot(collection(db, 'raioxes'), (snapshot) => {
      setRaioxes(snapshot.docs.map(doc => doc.data() as RaioX));
    });
    const unsubComp = onSnapshot(collection(db, 'competencias'), (snapshot) => {
      setCompetencias(snapshot.docs.map(doc => doc.data() as CompetenciaAvaliacao));
    });
    const unsubPerfil = onSnapshot(collection(db, 'perfil_comerciais'), (snapshot) => {
      setPerfilComerciais(snapshot.docs.map(doc => doc.data() as PerfilComercial));
    });

    return () => {
      unsubDisc();
      unsubPdi();
      unsubRaiox();
      unsubComp();
      unsubPerfil();
    };
  }, []);`;

code = code.replace(regexStates, replacementStates);

// Now patch the submit functions to write to Firestore instead of just setState
// 1. handleTestSubmit (DISC)
code = code.replace(
  /setDiscResults\(\[\.\.\.discResults\.filter\(d => d\.vendorId !== selectedVendor\.id\), newRes\]\);/g,
  `setDoc(doc(db, 'disc_results', newRes.id), newRes);`
);

// 2. handleSavePdi
code = code.replace(
  /setPdis\(\[pdiToSave, \.\.\.pdis\]\);/g,
  `setDoc(doc(db, 'pdis', pdiToSave.id), pdiToSave);`
);

// 3. handleUpdatePdiStatus
code = code.replace(
  /setPdis\(pdis\.map\(p => p\.id === id \? \{ \.\.\.p, status, dataAtualizacao: new Date\(\)\.toISOString\(\) \} : p\)\);/g,
  `
    const pdiToUpdate = pdis.find(p => p.id === id);
    if (pdiToUpdate) {
      setDoc(doc(db, 'pdis', pdiToUpdate.id), { ...pdiToUpdate, status, dataAtualizacao: new Date().toISOString() }, { merge: true });
    }
  `
);

// 4. Competencias submit
code = code.replace(
  /setCompetencias\(updated\);/g,
  `updated.forEach(c => setDoc(doc(db, 'competencias', c.id), c));`
);
code = code.replace(
  /setCompetencias\(\[\.\.\.competencias, \{/g,
  `
    const newComp: CompetenciaAvaliacao = {
  `
);
code = code.replace(
  /\}\]\);/g,
  `};
    setDoc(doc(db, 'competencias', newComp.id), newComp);`
);

// 5. PerfilComercial submit
code = code.replace(
  /setPerfilComerciais\(updated\);/g,
  `updated.forEach(pc => setDoc(doc(db, 'perfil_comerciais', pc.id), pc));`
);
code = code.replace(
  /setPerfilComerciais\(\[\.\.\.perfilComerciais, newRecord\]\);/g,
  `setDoc(doc(db, 'perfil_comerciais', newRecord.id), newRecord);`
);

// 6. Raiox submit
code = code.replace(
  /setRaioxes\(\[newRx, \.\.\.raioxes\]\);/g,
  `setDoc(doc(db, 'raioxes', newRx.id), newRx);`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
