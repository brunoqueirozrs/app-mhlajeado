const fs = require('fs');

let file = 'src/components/ExternalStorePortal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The messed up part
content = content.replace(
  '<div className="fixed inset-0 z-50 flex items-center justify-center p-4"> setSelectedDayDetails(null)}\n            />\n            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">',
  '<div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedDayDetails(null)} />\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10">'
);

// Second messed up part
content = content.replace(
  '<div className="fixed inset-0 z-50 flex items-center justify-center p-4"> setIsModalOpen(false)}\n            />\n            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">',
  '<div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />\n            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10">'
);

fs.writeFileSync(file, content);
