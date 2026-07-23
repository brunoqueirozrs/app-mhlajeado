const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// 1. Add infoMsg state
code = code.replace(
  "const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);",
  "const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);\n  const [infoMsg, setInfoMsg] = useState<string | null>(null);\n\n  const showInfoMsg = (msg: string) => {\n    setInfoMsg(msg);\n    setTimeout(() => setInfoMsg(null), 5000);\n  };"
);

// 2. Replace alert with showInfoMsg
code = code.replace(
  "alert(\"Para imprimir ou salvar em PDF, abra o sistema em uma nova guia clicando no ícone de 'Nova Guia' (canto superior direito do painel de preview).\");",
  "showInfoMsg(\"⚠️ Para imprimir em PDF, abra o sistema em uma nova guia clicando no ícone no canto superior direito do preview.\");"
);

// 3. Add UI for infoMsg
code = code.replace(
  "{syncSuccessMsg && (",
  "{infoMsg && (\n                <div className=\"fixed bottom-4 right-4 bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in max-w-sm\">\n                  <AlertCircle className=\"w-6 h-6 shrink-0\" />\n                  <span className=\"text-sm font-bold\">{infoMsg}</span>\n                </div>\n              )}\n              {syncSuccessMsg && ("
);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
