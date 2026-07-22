const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add to the switch statement
const switchRegex = /case "admin_logs":\s*return <AdminLogsPage \/>;/;
code = code.replace(switchRegex, 'case "admin_logs":\n        return <AdminLogsPage />;\n      case "admin_tests":\n        return <AdminTestResultsPage />;');

// 2. Add to the sidebar
const sidebarRegex = /<button onClick=\{\(\) => setActiveTab\("admin_logs"\)\}/;
code = code.replace(sidebarRegex, `<button onClick={() => setActiveTab("admin_tests")}
                  className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition \${
                    activeTab === "admin_tests" 
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-md shadow-indigo-900/20" 
                      : "text-white hover:bg-slate-900"
                  }\`}>
                  <FileText className="w-4 h-4 shrink-0 text-white" />
                  <span>Testes & Avaliações</span>
                </button>
                <button onClick={() => setActiveTab("admin_logs")}`);

// 3. Add to the allowed tabs type
const tabsRegex = /"protocolos_internos" \| "admin_logs" \| "gestao_pessoas"/;
code = code.replace(tabsRegex, '"protocolos_internos" | "admin_logs" | "admin_tests" | "gestao_pessoas"');

fs.writeFileSync('src/App.tsx', code);
