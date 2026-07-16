const fs = require('fs');
let file = 'src/components/InstallationsQueuePage.tsx';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900\/50 backdrop-blur-sm">\s*<div className="fixed inset-0 z-50 flex items-center justify-center p-4">/g, '<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">\n            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">');
fs.writeFileSync(file, text);
