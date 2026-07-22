const fs = require('fs');
let code = fs.readFileSync('src/components/RolePlayIA.tsx', 'utf8');

const importRegex = /import \{ collection, onSnapshot, doc, setDoc, query, where, orderBy \} from 'firebase\/firestore';/;
code = code.replace(importRegex, "import { collection, onSnapshot, doc, setDoc, query, where, orderBy, addDoc } from 'firebase/firestore';");

const isSavingRegex = /const \[evaluation, setEvaluation\] = useState<any>\(null\);/;
code = code.replace(isSavingRegex, "const [evaluation, setEvaluation] = useState<any>(null);\n  const [isSavingSync, setIsSavingSync] = useState(false);\n  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);\n\n  const showSyncSuccess = (msg: string) => {\n    setSyncSuccessMsg(msg);\n    setTimeout(() => setSyncSuccessMsg(null), 3000);\n  };\n");

const renderSyncMsgRegex = /<div className="flex flex-col h-\[calc\(100vh-200px\)\] border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">/;
code = code.replace(renderSyncMsgRegex, `<div className="flex flex-col h-[calc(100vh-200px)] border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">\n      {/* Sync feedback */}\n      {isSavingSync && (\n        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">\n          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>\n          <span className="text-sm font-bold">Salvando avaliação...</span>\n        </div>\n      )}\n      {syncSuccessMsg && (\n        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">\n          <CheckCircle2 className="w-5 h-5" />\n          <span className="text-sm font-bold">{syncSuccessMsg}</span>\n        </div>\n      )}`);

// Evaluate save
code = code.replace(
  /setDoc\(doc\(db, 'roleplay_evaluations', vendorId\), \{ evaluation: parsed \}\);/,
  `setIsSavingSync(true);
      await setDoc(doc(db, 'roleplay_evaluations', vendorId), { evaluation: parsed });
      await addDoc(collection(db, 'test_results'), {
        vendorId,
        vendorName,
        type: 'roleplay',
        date: new Date().toISOString(),
        summary: \`Roleplay Concluído (Nota: \${parsed.pontuacaoGeral || 'N/A'})\`,
        details: parsed
      });
      setIsSavingSync(false);
      showSyncSuccess('Avaliação do Roleplay salva com sucesso!');`
);

fs.writeFileSync('src/components/RolePlayIA.tsx', code);
