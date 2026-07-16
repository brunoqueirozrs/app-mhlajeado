const fs = require('fs');
const file = 'src/components/InstallationsPage.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4"> setSelectedDayDetails\(null\)}\s*\/>\s*<div className="fixed inset-0 z-50 flex items-center justify-center p-4">/g, '<div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedDayDetails(null)} />\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10">');

text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4"> setViewingAiInst\(null\)}\s*\/>\s*<div className="fixed inset-0 z-50 flex items-center justify-center p-4">/g, '<div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setViewingAiInst(null)} />\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10">');

fs.writeFileSync(file, text);
