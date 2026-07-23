const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!code.includes("import DatabaseCentralPage")) {
  code = code.replace(
    "import GestaoPessoasPage from \"./components/GestaoPessoasPage\";",
    "import GestaoPessoasPage from \"./components/GestaoPessoasPage\";\nimport DatabaseCentralPage from \"./components/DatabaseCentralPage\";"
  );
}

// 2. Add to activeTab types
code = code.replace(
  /"dashboard" \| "leads" \| "cadastroLead" \| "ftta" \| "tasks" \| "indicators" \| "base" \| "competitors" \| "objections" \| "absences" \| "materials" \| "cobrancas" \| "vendedores" \| "installations" \| "installations_queue" \| "admin_n8n" \| "calculo_multa" \| "planos" \| "rotas" \| "estrategia" \| "kaizen" \| "pos_venda" \| "matriz_objecoes" \| "trade" \| "leads_frios" \| "protocolos_internos" \| "admin_logs" \| "admin_tests" \| "gestao_pessoas"/g,
  "\"dashboard\" | \"leads\" | \"cadastroLead\" | \"ftta\" | \"tasks\" | \"indicators\" | \"base\" | \"competitors\" | \"objections\" | \"absences\" | \"materials\" | \"cobrancas\" | \"vendedores\" | \"installations\" | \"installations_queue\" | \"admin_n8n\" | \"calculo_multa\" | \"planos\" | \"rotas\" | \"estrategia\" | \"kaizen\" | \"pos_venda\" | \"matriz_objecoes\" | \"trade\" | \"leads_frios\" | \"protocolos_internos\" | \"admin_logs\" | \"admin_tests\" | \"gestao_pessoas\" | \"database_central\""
);

// 3. Add to switch statement
code = code.replace(
  "case \"gestao_pessoas\":",
  "case \"database_central\":\n        return <DatabaseCentralPage />;\n      case \"gestao_pessoas\":"
);

// 4. Add to sidebar
const sidebarLink = `
              <button onClick={() => setActiveTab("admin_tests")}
                className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition \${
                  activeTab === "admin_tests" 
                    ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950" 
                    : "text-white hover:bg-slate-900"
                }\`}>
                <CheckCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Logs de Testes (Webhook)</span>
              </button>

              <button onClick={() => setActiveTab("database_central")}
                className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition \${
                  activeTab === "database_central" 
                    ? "bg-rose-600 text-white font-bold shadow-md shadow-rose-950" 
                    : "text-white hover:bg-slate-900"
                }\`}>
                <Database className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="text-amber-100">Central de Base de Dados</span>
              </button>
`;

code = code.replace(
  /<button onClick=\{\(\) => setActiveTab\("admin_tests"\)\}[\s\S]*?<\/button>/,
  sidebarLink
);

fs.writeFileSync('src/App.tsx', code);
