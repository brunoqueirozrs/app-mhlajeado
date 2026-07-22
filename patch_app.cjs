const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importRegex = /import AdminLogsPage from "\.\/components\/AdminLogsPage";/;
code = code.replace(importRegex, "import AdminLogsPage from \"./components/AdminLogsPage\";\nimport AdminTestResultsPage from \"./components/AdminTestResultsPage\";");

const tabRegex = /\{ id: "admin-logs", label: "Logs & Sistema", icon: Terminal \},/;
code = code.replace(tabRegex, "{ id: \"admin-logs\", label: \"Logs & Sistema\", icon: Terminal },\n      { id: \"admin-tests\", label: \"Histórico de Testes\", icon: FileText },");

const renderRegex = /if \(activeTab === "admin-logs"\) \{\n\s*return <AdminLogsPage \/>;\n\s*\}/;
code = code.replace(renderRegex, "if (activeTab === \"admin-logs\") {\n        return <AdminLogsPage />;\n      }\n      if (activeTab === \"admin-tests\") {\n        return <AdminTestResultsPage />;\n      }");

fs.writeFileSync('src/App.tsx', code);
