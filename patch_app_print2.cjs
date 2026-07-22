const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix root div
code = code.replace(/<div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">/, '<div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans print:h-auto print:block print:overflow-visible">');

// Fix main area div
code = code.replace(/<div className="flex-1 flex flex-col min-w-0 overflow-hidden">/, '<div className="flex-1 flex flex-col min-w-0 overflow-hidden print:h-auto print:block print:overflow-visible">');

// Fix main tag
code = code.replace(/<main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 h-\[calc\(100vh-80px\)\] lg:h-\[calc\(100vh-36px\)\] bg-slate-200\/40 shadow-\[inset_0_4px_10px_rgba\(0,0,0,0\.02\)\]">/, '<main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 h-[calc(100vh-80px)] lg:h-[calc(100vh-36px)] bg-slate-200/40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] print:h-auto print:block print:overflow-visible">');

fs.writeFileSync('src/App.tsx', code);
