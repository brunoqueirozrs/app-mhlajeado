const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "case \"kaizen\":\n        return <KaizenPage loggedUser={loggedUser!} isAdmin={userRole === \"admin\"} onBackToDashboard={() => setActiveTab(\"dashboard\")} />;",
  "case \"kaizen\":\n        return <KaizenPage loggedUser={loggedUser!} onBackToDashboard={() => setActiveTab(\"dashboard\")} />;"
);

fs.writeFileSync('src/App.tsx', code);
