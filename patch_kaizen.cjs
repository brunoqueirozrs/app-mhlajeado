const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import KaizenPage")) {
  code = code.replace(
    "import PosVendaPage",
    "import KaizenPage from \"./components/KaizenPage\";\nimport PosVendaPage"
  );
}

if (!code.includes("case \"kaizen\":")) {
  code = code.replace(
    "case \"estrategia\":",
    "case \"kaizen\":\n        return <KaizenPage loggedUser={loggedUser!} isAdmin={userRole === \"admin\"} onBackToDashboard={() => setActiveTab(\"dashboard\")} />;\n      case \"estrategia\":"
  );
}

fs.writeFileSync('src/App.tsx', code);
