const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// Add loading state
code = code.replace(
  /const \[isSavingSync, setIsSavingSync\] = useState\(false\);/,
  `const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSavingSync, setIsSavingSync] = useState(false);`
);

// Update useEffect to handle loading and console.log
code = code.replace(
  /const unsubPerfil = onSnapshot\(collection\(db, 'perfil_comerciais'\), \(snapshot\) => \{\s*setPerfilComerciais\(snapshot\.docs\.map\(doc => doc\.data\(\) as PerfilComercial\)\);\s*\}\);/,
  `const unsubPerfil = onSnapshot(collection(db, 'perfil_comerciais'), (snapshot) => {
      setPerfilComerciais(snapshot.docs.map(doc => doc.data() as PerfilComercial));
    });

    // Simulando um tempo de carregamento para garantir que os dados do Firebase chegaram
    // Na prática, onSnapshot dispara imediatamente com o cache ou os dados da rede
    setTimeout(() => {
      console.log("=== DEBUG RH ===");
      console.log("Vendedores carregados da API:", vendors);
      console.log("Usuário logado:", loggedUser);
      console.log("É Admin?", isAdmin);
      setIsLoadingData(false);
    }, 1500);`
);

// Update render to show loading
code = code.replace(
  /return \(\s*<div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 print:p-0 print:m-0 print:max-w-none">/,
  `return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 print:p-0 print:m-0 print:max-w-none">
      {isLoadingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold text-slate-800">Carregando dados do RH...</h3>
            <p className="text-sm text-slate-500">Sincronizando com Firebase</p>
          </div>
        </div>
      )}`
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
