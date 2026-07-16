const fs = require('fs');
const file = 'src/components/InstallationsPage.tsx';
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/<div className="absolute inset-0 bg-slate-950\/70 backdrop-blur-sm" onClick=\{\(\) => setExtraSlotModal\(\{ isOpen: false, date: "", password: "", error: "" \}\)\} \/>\s*<div className="fixed inset-0 z-50 flex items-center justify-center p-4">/g, '<div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setExtraSlotModal({ isOpen: false, date: "", password: "", error: "" })} />\n          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10 w-full max-w-sm">');

fs.writeFileSync(file, text);
