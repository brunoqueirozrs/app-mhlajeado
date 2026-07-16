const fs = require('fs');

function fixFile(file) {
  if(!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  
  // Empty state div
  text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4">\s*(?=<div className="w-20 h-20 bg-slate-50)/, '<div className="flex flex-col items-center justify-center col-span-full py-16 text-center space-y-4">');
  
  // Item card div
  text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4">\s*(?=<div>\s*<div className="flex justify-between items-start mb-4">)/, '<div key={item.id} className="card-modern rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden bg-white">');
  
  // Closing div for item card was probably `</motion.div>` replaced to `</div>`.
  fs.writeFileSync(file, text);
}

fixFile('src/components/InstallationsQueuePage.tsx');
