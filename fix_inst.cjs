const fs = require('fs');

function fixFile(file) {
  if(!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  
  // The first error:
  text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4"> setDayDetailsModal\(null\)}\s*\/>\s*<div className="fixed inset-0 z-50 flex items-center justify-center p-4">/g, '<div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setDayDetailsModal(null)} />\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10">');
  
  // The second error:
  text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4"> setIsModalOpen\(false\)}\s*\/>\s*<div className="fixed inset-0 z-50 flex items-center justify-center p-4">/g, '<div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10">');

  fs.writeFileSync(file, text);
}

fixFile('src/components/InstallationsPage.tsx');
