const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Hide aside on print
code = code.replace(/<aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0/g, '<aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 print:hidden');
// Hide nav for mobile on print
code = code.replace(/<nav className="flex items-center justify-around w-full bg-slate-900\/95 backdrop-blur-md border-t border-slate-800 p-2 pb-safe">/g, '<nav className="flex items-center justify-around w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 pb-safe print:hidden">');
// Also the container around nav
code = code.replace(/<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">/g, '<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 print:hidden">');
// Header that shows total values, maybe we want to hide header too?
// There's a header in main tag: `<header className="bg-white border-b border-slate-200 sticky top-0 z-40">`
code = code.replace(/<header className="bg-white border-b border-slate-200 sticky top-0 z-40/g, '<header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden');
// Float bubbles
code = code.replace(/id="floating-ai-agent-trigger-badge"[\s\S]*?className={`fixed bottom-16/g, (m) => m.replace('className={`fixed', 'className={`print:hidden fixed'));

fs.writeFileSync('src/App.tsx', code);
